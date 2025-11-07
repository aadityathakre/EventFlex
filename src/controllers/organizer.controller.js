import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Organizer from "../models/User.model.js";
import Pool from "../models/Pool.model.js";
import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import EventAttendance from "../models/EventAttendance.model.js";
import UserWallet from "../models/UserWallet.model.js";
import Escrow from "../models/EscrowContract.model.js";
import Rating from "../models/RatingReview.model.js";
import Notification from "../models/Notification.model.js";
import Dispute from "../models/Dispute.model.js";
import { createNotification } from "../services/notification.service.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import UserDocument from "../models/UserDocument.model.js";
import mongoose from "mongoose";
import { emitPoolEvent } from "../services/socket.service.js";

// 1. Upload Organizer Documents
export const uploadOrganizerDocs = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;
  const userId = req.user._id;

  if (!type || !localFilePath) {
    throw new ApiError(400, "Document type and file is required");
  }


  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const doc = await UserDocument.create({
    user: userId,
    type:type,
    fileUrl: cloudinaryRes.url,
  });

  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

// 2. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { type } = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;

  if (!localFilePath) throw new ApiError(400, "No signature uploaded");


  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

const existing = await UserDocument.findOne({ user: organizerId, type: "signature" });

  let signatureDoc;

  if (existing) {
    existing.fileUrl = cloudinaryRes.url;
    existing.status = "pending";
    existing.uploadedAt = new Date();
    signatureDoc = await existing.save();
  } else {
    signatureDoc = await UserDocument.create({
      user: organizerId,
      type: "signature",
      fileUrl:cloudinaryRes.url
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, signatureDoc, "E-signature submitted"));
});

// 3. Aadhaar Verification (Sandbox)  (this feature will come soon)
export const verifyAadhaar = asyncHandler(async (req, res) => {
  const { aadhaarNumber, otp } = req.body;
  const organizerId = req.user._id;

  if (!aadhaarNumber || !otp) {
    throw new ApiError(400, "Aadhaar number and OTP required");
  }
        // Simulated sandbox response
  const verified = true;
  if (!verified) throw new ApiError(403, "Aadhaar verification failed");

  const organizer = await Organizer.findByIdAndUpdate(
    organizerId,
    { aadhaarVerified: true },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Aadhaar verified"));
});

// 4. Create Pool
export const createPool = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const {
    name,
    description,
    requirements,
    skillsRequired,
    date,
    venue,
    roles,
    applicationDeadline
    ,
    city
  } = req.body;

  // roles expected as array of { title, requiredCount }
  let parsedRoles = [];
  if (roles) {
    if (typeof roles === 'string') {
      try {
        parsedRoles = JSON.parse(roles);
      } catch (err) {
        // if not JSON, ignore and proceed
        parsedRoles = [];
      }
    } else if (Array.isArray(roles)) {
      parsedRoles = roles;
    }
  }

  // Parse and validate skills, including roles as skills
  let parsedSkills = [];

  // First, add any explicitly provided skills
  if (skillsRequired) {
    if (typeof skillsRequired === 'string') {
      try {
        parsedSkills = JSON.parse(skillsRequired);
      } catch (err) {
        throw new ApiError(400, "Invalid skills format");
      }
    } else if (Array.isArray(skillsRequired)) {
      parsedSkills = skillsRequired;
    }
  }

  // Then, convert roles to skills format and add them
  if (parsedRoles && parsedRoles.length > 0) {
    const skillsFromRoles = parsedRoles.map(role => ({
      skill: role.title,
      requiredCount: Number(role.requiredCount) || 1,
      filledCount: 0
    }));
    parsedSkills = [...parsedSkills, ...skillsFromRoles];
  }

  // Ensure each skill has the required structure
  parsedSkills = parsedSkills.map(skill => {
    // If skill is just a string, convert it to proper structure
    if (typeof skill === 'string') {
      return {
        skill: skill,
        requiredCount: 1,
        filledCount: 0
      };
    }
    // If skill is already an object, ensure it has all required fields
    return {
      skill: skill.skill || skill.title || skill.name, // accept common variations
      requiredCount: Number(skill.requiredCount || skill.count || 1),
      filledCount: Number(skill.filledCount || 0)
    };
  });

  // Remove any duplicates (in case a role matches an explicit skill)
  parsedSkills = parsedSkills.reduce((acc, current) => {
    const duplicate = acc.find(item => item.skill.toLowerCase() === current.skill.toLowerCase());
    if (!duplicate) {
      acc.push(current);
    } else {
      // If duplicate found, take the higher requiredCount
      duplicate.requiredCount = Math.max(duplicate.requiredCount, current.requiredCount);
    }
    return acc;
  }, []);

  // Validate that each skill has required fields
  parsedSkills.forEach(skill => {
    if (!skill.skill || typeof skill.skill !== 'string') {
      throw new ApiError(400, "Each skill must have a valid name");
    }
    if (typeof skill.requiredCount !== 'number' || skill.requiredCount < 1) {
      throw new ApiError(400, "Each skill must have a valid required count");
    }
  });

  // compute maxPositions from both roles and skills if provided
  let totalPositions = 0;
  if (parsedRoles.length > 0) {
    totalPositions += parsedRoles.reduce((acc, r) => acc + (Number(r.requiredCount) || 0), 0);
  }
  if (parsedSkills.length > 0) {
    totalPositions += parsedSkills.reduce((acc, s) => acc + (Number(s.requiredCount) || 0), 0);
  }
  const maxPositions = totalPositions > 0 ? totalPositions : undefined;

  const pool = await Pool.create({
    organizer: organizerId,
    name,
    description,
    requirements,
    skillsRequired: parsedSkills,
    date: date ? new Date(date) : undefined,
    venue: venue || undefined,
    city: city || (venue?.address ? String(venue.address).split(',').pop().trim() : undefined),
    roles: parsedRoles,
    maxPositions: maxPositions,
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined
  });

  // populate organizer info for real-time emission
  const populated = await Pool.findById(pool._id).populate('organizer', 'name email');
  try {
    emitPoolEvent('pool_created', populated);
  } catch (err) {
    console.warn('Failed to emit pool_created', err.message);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, pool, "Pool created successfully !"));
});

// List pools for the current organizer
export const getMyPools = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const pools = await Pool.find({ organizer: organizerId }).sort({ createdAt: -1 }).select('-__v');
  return res.status(200).json(new ApiResponse(200, { pools }, 'Organizer pools fetched'));
});

// 5. Manage Pool (Add/Remove Gigs)
export const managePool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  // If roles are provided, ensure they're parsed
  if (updates.roles) {
    let parsedRoles = updates.roles;
    if (typeof updates.roles === 'string') {
      try {
        parsedRoles = JSON.parse(updates.roles);
      } catch (err) {
        parsedRoles = updates.roles;
      }
    }
    updates.roles = parsedRoles;
  }

  // Parse and validate skills, including roles as skills
  let parsedSkills = [];

  // First, handle explicitly provided skills
  if (updates.skillsRequired) {
    if (typeof updates.skillsRequired === 'string') {
      try {
        parsedSkills = JSON.parse(updates.skillsRequired);
      } catch (err) {
        throw new ApiError(400, "Invalid skills format");
      }
    } else if (Array.isArray(updates.skillsRequired)) {
      parsedSkills = updates.skillsRequired;
    }
  }

  // Then, convert roles to skills format and add them
  if (updates.roles && Array.isArray(updates.roles)) {
    const skillsFromRoles = updates.roles.map(role => ({
      skill: role.title,
      requiredCount: Number(role.requiredCount) || 1,
      filledCount: role.filledCount || 0
    }));
    parsedSkills = [...parsedSkills, ...skillsFromRoles];
  }

  // Process all skills to ensure proper structure
  if (parsedSkills.length > 0) {
    parsedSkills = parsedSkills.map(skill => {
      if (typeof skill === 'string') {
        return {
          skill: skill,
          requiredCount: 1,
          filledCount: 0
        };
      }
      return {
        skill: skill.skill || skill.title || skill.name,
        requiredCount: Number(skill.requiredCount || skill.count || 1),
        filledCount: Number(skill.filledCount || 0)
      };
    });

    // Remove duplicates, keeping higher requiredCount
    parsedSkills = parsedSkills.reduce((acc, current) => {
      const duplicate = acc.find(item => item.skill.toLowerCase() === current.skill.toLowerCase());
      if (!duplicate) {
        acc.push(current);
      } else {
        duplicate.requiredCount = Math.max(duplicate.requiredCount, current.requiredCount);
      }
      return acc;
    }, []);

    // Validate all skills
    parsedSkills.forEach(skill => {
      if (!skill.skill || typeof skill.skill !== 'string') {
        throw new ApiError(400, "Each skill must have a valid name");
      }
      if (typeof skill.requiredCount !== 'number' || skill.requiredCount < 1) {
        throw new ApiError(400, "Each skill must have a valid required count");
      }
    });

    updates.skillsRequired = parsedSkills;
  }

  // Compute maxPositions from both roles and skills if either is provided
  if (updates.roles || updates.skillsRequired) {
    let totalPositions = 0;
    
    // Add positions from roles if present
    const roles = updates.roles || (await Pool.findById(id)).roles || [];
    if (Array.isArray(roles) && roles.length > 0) {
      totalPositions += roles.reduce((acc, r) => acc + (Number(r.requiredCount) || 0), 0);
    }

    // Add positions from skills if present
    const skills = updates.skillsRequired || (await Pool.findById(id)).skillsRequired || [];
    if (Array.isArray(skills) && skills.length > 0) {
      totalPositions += skills.reduce((acc, s) => acc + (Number(s.requiredCount) || 0), 0);
    }

    if (totalPositions > 0) {
      updates.maxPositions = totalPositions;
    }
  }

  // Allow updating city as well
  if (typeof updates.city !== 'undefined') {
    updates.city = updates.city || (updates.venue?.address ? String(updates.venue.address).split(',').pop().trim() : undefined);
  }

  const pool = await Pool.findOneAndUpdate(
    { _id: id, organizer: req.user._id },
    updates,
    { new: true }
  );

  if (!pool) throw new ApiError(404, "Pool not found");

  // Emit update to watchers
  try {
    const populated = await Pool.findById(pool._id).populate('organizer', 'name email');
    emitPoolEvent('pool_updated', populated);
  } catch (err) {
    console.warn('Failed to emit pool_updated', err.message);
  }

  return res.status(200).json(new ApiResponse(200, pool, "Pool updated"));
});

// 6. View Pool Details
export const getPoolDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pool = await Pool.findById(id)
    .populate('gigs.gig', 'name avatar badges')
    .populate('organizer', 'name email')
    .select('-__v');

  if (!pool) throw new ApiError(404, 'Pool not found');

  return res.status(200).json(new ApiResponse(200, pool, 'Pool details fetched'));
});

// Get only applicants (pending) for a pool with populated gig profiles
export const getPoolApplicants = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pool = await Pool.findById(id)
    .populate('gigs.gig', 'name avatar badges bio phone email')
    .populate('organizer', 'name email')
    .select('-__v');

  if (!pool) throw new ApiError(404, 'Pool not found');

  const applicants = (pool.gigs || []).filter(g => g.status === 'pending');

  return res.status(200).json(new ApiResponse(200, { applicants }, 'Pool applicants fetched'));
});

// Accept (select) a gig application for a pool
export const acceptApplication = asyncHandler(async (req, res) => {
  const { poolId, gigId } = req.params;

  const pool = await Pool.findOne({ _id: poolId, organizer: req.user._id });
  if (!pool) throw new ApiError(404, 'Pool not found');

  const entry = pool.gigs.find(item => String(item.gig) === String(gigId));
  if (!entry) throw new ApiError(404, 'Application not found');
  if (entry.status !== 'pending') throw new ApiError(400, 'Application already processed');

  // Mark selected
  entry.status = 'selected';
  pool.filledPositions = (pool.filledPositions || 0) + 1;

  // Persist
  await pool.save();

  // Emit update for watchers
  try {
    const populated = await Pool.findById(pool._id).populate('organizer', 'name email').populate('gigs.gig', 'name avatar badges');
    emitPoolEvent('pool_updated', populated);
  } catch (err) {
    console.warn('Failed to emit pool_updated', err.message);
  }

  return res.status(200).json(new ApiResponse(200, pool, 'Application accepted'));
});

// Add a gig directly to the organizer's team for a pool (select applicant)
export const addToTeam = asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const { gigId, agreed_rate } = req.body;

  if (!gigId) throw new ApiError(400, 'gigId is required');

  const pool = await Pool.findOne({ _id: poolId, organizer: req.user._id });
  if (!pool) throw new ApiError(404, 'Pool not found');

  // Find existing entry in pool.gigs
  let entry = pool.gigs.find(item => String(item.gig) === String(gigId));

  // If not applied yet, add as selected
  if (!entry) {
    entry = { gig: gigId, status: 'selected', appliedAt: new Date() };
    pool.gigs.push(entry);
    pool.filledPositions = (pool.filledPositions || 0) + 1;
  } else {
    if (entry.status === 'selected') {
      return res.status(200).json(new ApiResponse(200, pool, 'Gig already in team'));
    }
    // mark selected and update counts
    entry.status = 'selected';
    pool.filledPositions = (pool.filledPositions || 0) + 1;
  }

  // Try to increment a role/skill filledCount where possible (simple heuristic)
  try {
    // Try roles first
    if (Array.isArray(pool.roles) && pool.roles.length > 0) {
      const role = pool.roles.find(r => (r.filledCount || 0) < (r.requiredCount || 0));
      if (role) {
        role.filledCount = (role.filledCount || 0) + 1;
      }
    }
    // If no role was incremented, try skillsRequired
    if ((!pool.roles || pool.roles.length === 0) || !pool.roles.some(r => (r.filledCount || 0) > 0)) {
      if (Array.isArray(pool.skillsRequired) && pool.skillsRequired.length > 0) {
        const skill = pool.skillsRequired.find(s => (s.filledCount || 0) < (s.requiredCount || 0));
        if (skill) skill.filledCount = (skill.filledCount || 0) + 1;
      }
    }
  } catch (err) {
    // non-fatal
    console.warn('Failed to bump role/skill counts', err.message);
  }

  await pool.save();

  // Notify the selected gig (if possible)
  try {
    await createNotification({
      recipient: gigId,
      type: 'ADDED_TO_TEAM',
      message: `You have been added to pool ${pool.name}`,
      reference: { type: 'pool', id: pool._id }
    });
  } catch (err) {
    console.warn('Failed to notify gig about team addition', err.message);
  }

  // Emit updates for watchers
  try {
    const populated = await Pool.findById(pool._id).populate('organizer', 'name email').populate('gigs.gig', 'name avatar badges');
    emitPoolEvent('pool_updated', populated);
    emitPoolEvent('team_member_added', { poolId: pool._id, gigId });
  } catch (err) {
    console.warn('Failed to emit events for team addition', err.message);
  }

  return res.status(200).json(new ApiResponse(200, pool, 'Gig added to team'));
});

// Reject a gig application for a pool (mark rejected)
export const rejectApplication = asyncHandler(async (req, res) => {
  const { poolId, gigId } = req.params;

  const pool = await Pool.findOne({ _id: poolId, organizer: req.user._id });
  if (!pool) throw new ApiError(404, 'Pool not found');

  const entry = pool.gigs.find(item => String(item.gig) === String(gigId));
  if (!entry) throw new ApiError(404, 'Application not found');
  if (entry.status !== 'pending') throw new ApiError(400, 'Application already processed');

  // Mark rejected (front-end will hide pending list)
  entry.status = 'rejected';

  await pool.save();

  try {
    const populated = await Pool.findById(pool._id).populate('organizer', 'name email').populate('gigs.gig', 'name avatar badges');
    emitPoolEvent('pool_updated', populated);
  } catch (err) {
    console.warn('Failed to emit pool_updated', err.message);
  }

  return res.status(200).json(new ApiResponse(200, pool, 'Application rejected'));
});

// 7. Chat with Gig (Stub)
export const chatWithGig = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { gigId } = req.params;
  const { eventId, poolId, message_text } = req.body;

  if (!eventId || !poolId || !message_text) {
    throw new ApiError(400, "Missing required chat fields");
  }

  let conversation = await Conversation.findOne({
    event: eventId,
    pool: poolId,
    participants: { $all: [organizerId, gigId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [organizerId, gigId],
      event: eventId,
      pool: poolId,
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: organizerId,
    message_text,
  });

  return res.status(201).json(
    new ApiResponse(201, { conversation, message }, "Message sent to gig")
  );
});

// 8. Create Event
export const createEvent = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const {
    title,
    description,
    event_type,
    start_date,
    end_date,
    location,
    budget
  } = req.body;

  const event = await Event.create({
    title,
    description,
    event_type,
    start_date: new Date(start_date),
    end_date: new Date(end_date),
    location,
    budget: mongoose.Types.Decimal128.fromString(budget.toString()),
    organizer: organizerId
  });

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

// 9. Edit Event
export const editEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const event = await Event.findByIdAndUpdate(id, updates, { new: true });
  if (!event) throw new ApiError(404, "Event not found");

  return res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

// 10. View Event Details
export const getEventDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("organizer", "name email")
    .populate("gigs", "name avatar")
    .select("-__v");

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched"));
});

// 11. Live Event Tracking
export const getLiveEventTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await EventAttendance.find({ event: id })
    .populate("gig", "name avatar")
    .select("-__v");

  if (!attendance || attendance.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No attendance records found for this event")
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, attendance, "Live attendance data"));
});

// 12. Mark Event Complete
export const markEventComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByIdAndUpdate(
    id,
    { status: "completed" },
    { new: true }
  );

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event marked as complete"));
});


// 13. View Wallet
export const getWallet = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  let wallet = await UserWallet.findOne({ user: organizerId });

  // 🔧 Auto-create wallet if not found
  if (!wallet) {
    wallet = await UserWallet.create({
      user: organizerId,
      upi_id: "aditya233", // or generate dynamically
      balance_inr: mongoose.Types.Decimal128.fromString("25000.00"),
    });
  }
  

  return res.status(200).json(
    new ApiResponse(200, {
      balance: wallet.balance_inr.toString(),
      upi_id: wallet.upi_id,
    }, "Wallet fetched")
  );
});

// 14. Withdraw Funds
export const withdrawFunds = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { amount, upi_id } = req.body;

  const wallet = await UserWallet.findOne({ user: organizerId });
  if (!wallet || parseFloat(wallet.balance_inr.toString()) < amount) {
    throw new ApiError(400, "Insufficient balance");
  }

  wallet.balance_inr = parseFloat(wallet.balance_inr.toString()) - amount;
  wallet.upi_id = upi_id || wallet.upi_id;
  await wallet.save();

  return res.status(200).json(new ApiResponse(200, wallet, "Withdrawal successful"));
});


// 15. Payment History
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const payments = await Escrow.find({ organizer: organizerId }).select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payment history fetched"));
});

// 16. Simulate Payout
export const simulatePayout = asyncHandler(async (req, res) => {
  const { escrowId } = req.params;
  const escrow = await Escrow.findById(escrowId);

  if (!escrow || escrow.status !== "in_progress") {
    throw new ApiError(400, "Escrow not ready for payout");
  }

  escrow.status = "released";
  await escrow.save();

  return res.status(200).json(new ApiResponse(200, escrow, "Payout simulated"));
});

// 17. Leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const topOrganizers = await Rating.aggregate([
    { $match: { review_type: "host_to_organizer" } },
    { $group: { _id: req.user._id, avgRating: { $avg: "$rating" } } },
    { $sort: { avgRating: -1 } },
    { $limit: 10 },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, topOrganizers, "Leaderboard fetched"));
});

// 18. Badges
export const getBadges = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const eventsCount = await Event.countDocuments({ organizer: organizerId });

  let badge = "None";
  if (eventsCount >= 50) badge = "Elite";
  else if (eventsCount >= 20) badge = "Pro";
  else if (eventsCount >= 5) badge = "Rising Star";
  else badge = "Beginner";

  return res
    .status(200)
    .json(new ApiResponse(200, { badge }, "Badge status fetched"));
});

// 19. Organizer Profile
export const getOrganizerProfile = asyncHandler(async (req, res) => {
  const organizer = await Organizer.findById(req.user._id).select(
    "-password -__v"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Profile fetched"));
});

// Get host invitations (OrganizerPool) sent to this organizer
export const getInvitations = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const invitations = await OrganizerPool.find({ organizer: organizerId })
    .populate('event')
    .populate('organizer')
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, { invitations }, 'Invitations fetched'));
});

// Organizer accepts an invitation (becomes organizer of the event)
export const acceptInvitation = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { id } = req.params; // organizerPool id

  const invite = await OrganizerPool.findOne({ _id: id, organizer: organizerId });
  if (!invite) throw new ApiError(404, 'Invitation not found');
  if (invite.status === 'active') throw new ApiError(400, 'Invitation already accepted');
  if (invite.status === 'rejected') throw new ApiError(400, 'Invitation already rejected');

  invite.status = 'active';
  await invite.save();

  // Assign organizer to the event
  const event = await Event.findById(invite.event);
  if (event) {
    event.organizer = organizerId;
    await event.save();
  }

  // Notify the host
  try {
    await createNotification({
      recipient: event.host,
      type: 'ORGANIZER_ACCEPTED',
      message: `Organizer ${req.user.name || 'organizer'} accepted invite for event ${event?.title || ''}`,
      reference: { type: 'organizer_pool', id: invite._id }
    });
  } catch (err) {
    console.warn('Failed to create notification for host:', err.message);
  }

  return res.status(200).json(new ApiResponse(200, invite, 'Invitation accepted'));
});

// Organizer rejects an invitation
export const rejectInvitation = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { id } = req.params;

  const invite = await OrganizerPool.findOne({ _id: id, organizer: organizerId });
  if (!invite) throw new ApiError(404, 'Invitation not found');
  if (invite.status === 'active') throw new ApiError(400, 'Invitation already accepted');
  if (invite.status === 'rejected') throw new ApiError(400, 'Invitation already rejected');

  invite.status = 'rejected';
  await invite.save();

  // Notify the host
  try {
    const event = await Event.findById(invite.event);
    await createNotification({
      recipient: event.host,
      type: 'ORGANIZER_REJECTED',
      message: `Organizer ${req.user.name || 'organizer'} rejected invite for event ${event?.title || ''}`,
      reference: { type: 'organizer_pool', id: invite._id }
    });
  } catch (err) {
    console.warn('Failed to create rejection notification for host:', err.message);
  }

  return res.status(200).json(new ApiResponse(200, invite, 'Invitation rejected'));
});

// 20. Certificates (this feature will come soon)
export const getCertificates = asyncHandler(async (req, res) => {
  // Placeholder for blockchain certificate logic
  return res.status(200).json(new ApiResponse(200, [], "Certificates fetched"));
});

// 21. Get Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const notifications = await Notification.find({ user: organizerId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

// 22. Mark Notification as Read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

  if(!updated) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
  }
  return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});


// 23. Raise Dispute
export const raiseDispute = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { eventId } = req.params;
  const { gigId, reason } = req.body;

  const dispute = await Dispute.create({
    event: eventId,
    gig: gigId,
    reason,
  });

  return res.status(201).json(new ApiResponse(201, dispute, "Dispute raised"));
});

// 24. View Disputes
export const getDisputes = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const disputes = await Dispute.find({}).populate("event", "title date").populate("gig", "name");

  return res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched"));
});


// 25. Get Organizer Wellness Score
export const getWellnessScore = asyncHandler(async (req, res) => {
  const organizer = await User.findById(req.user._id);

  return res.status(200).json(new ApiResponse(200, {
    wellnessScore: organizer.wellnessScore || 100,
  }, "Wellness score fetched"));
});

// 26. Predict No-show Risk for Gig
export const getNoShowRisk = asyncHandler(async (req, res) => {
  const { gigId } = req.params;
  const gig = await User.findById(gigId);

  if (!gig) throw new ApiError(404, "Gig user not found");

  return res.status(200).json(new ApiResponse(200, {
    gigId,
    noShowRisk: gig.noShowRisk || 0,
  }, "No-show risk fetched"));
});