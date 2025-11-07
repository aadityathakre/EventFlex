import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UserDocument from "../models/UserDocument.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import { createNotification } from "../services/notification.service.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import EscrowContract from "../models/EscrowContract.model.js";
import Payment from "../models/Payment.model.js";
import UserWallet from "../models/UserWallet.model.js";
import RatingReview from "../models/RatingReview.model.js";
import Feedback from "../models/Feedback.model.js";
import UserBadge from "../models/UserBadge.model.js";
import Badge from "../models/Badge.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";
import mongoose from "mongoose";

// 1. Upload KYC Documents
export const uploadHostDocs = asyncHandler(async (req, res) => {
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
    type,
    fileUrl: cloudinaryRes.url,
  });

  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

// 2. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type } = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Signature file is required");
  }

  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const existing = await UserDocument.findOne({
    user: userId,
    type: "signature",
  });

  let signatureDoc;

  if (existing) {
    existing.fileUrl = cloudinaryRes.url;
    existing.status = "pending";
    existing.uploadedAt = new Date();
    signatureDoc = await existing.save();
  } else {
    signatureDoc = await UserDocument.create({
      user: userId,
      type: "signature",
      fileUrl: cloudinaryRes.url,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, signatureDoc, "E-signature submitted"));
});

// 3. Aadhaar Sandbox Verification   (this feature will come soon)
export const verifyAadhaarSandbox = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { aadhaar_number } = req.body;

  if (!aadhaar_number || aadhaar_number.length !== 12) {
    throw new ApiError(400, "Invalid Aadhaar number");
  }

  const existing = await KYCVerification.findOne({ user: userId });

  let verification;

  if (existing) {
    existing.aadhaar_number = aadhaar_number;
    existing.aadhaar_verified = true;
    existing.status = "approved";
    existing.verified_at = new Date();
    verification = await existing.save();
  } else {
    verification = await KYCVerification.create({
      user: userId,
      aadhaar_number,
      aadhaar_verified: true,
      status: "approved",
      verified_at: new Date(),
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, verification, "Aadhaar verified (sandbox)"));
});

// 4. Create Event
export const createEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const {
    title,
    description,
    event_type,
    start_date,
    end_date,
    location,
    budget,
  } = req.body;

  if (
    !title ||
    !event_type ||
    !start_date ||
    !end_date ||
    !location?.coordinates ||
    !budget
  ) {
    throw new ApiError(400, "Missing required event fields");
  }

  // Validate dates
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const now = new Date();

  if (startDate <= now) {
    throw new ApiError(400, "Event start date must be in the future");
  }

  if (endDate <= startDate) {
    throw new ApiError(400, "Event end date must be after start date");
  }

  // Validate budget
  const budgetAmount = parseFloat(budget);
  if (isNaN(budgetAmount) || budgetAmount <= 0) {
    throw new ApiError(400, "Budget must be a positive number");
  }

  // Validate coordinates
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    throw new ApiError(400, "Location coordinates must be [longitude, latitude]");
  }
  
  const [longitude, latitude] = location.coordinates;
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    throw new ApiError(400, "Coordinates must be numbers");
  }
  
  if (longitude < -180 || longitude > 180) {
    throw new ApiError(400, "Longitude must be between -180 and 180");
  }
  
  if (latitude < -90 || latitude > 90) {
    throw new ApiError(400, "Latitude must be between -90 and 90");
  }

  const event = await Event.create({
    host: hostId,
    title,
    description,
    event_type,
    start_date: startDate,
    end_date: endDate,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    budget: mongoose.Types.Decimal128.fromString(budgetAmount.toString()),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

// 5. Edit Event
export const editEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const eventId = req.params.id;

  const event = await Event.findOne({ _id: eventId, host: hostId });
  if (!event) throw new ApiError(404, "Event not found or unauthorized");

  Object.assign(event, req.body);
  await event.save();

  return res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

// 6. View Event Details
export const getEventDetails = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findById(eventId).populate("host organizer gigs");

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched"));
});

// 7. View All Host Events
export const getHostEvents = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const events = await Event.find({ host: hostId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Host events fetched"));
});

// 8. Mark Event as Completed
export const completeEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const eventId = req.params.id;

  const event = await Event.findOne({ _id: eventId, host: hostId });
  if (!event) throw new ApiError(404, "Event not found or unauthorized");

  event.status = "completed";
  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event marked as completed"));
});

// 9. Invite Organizer to Event
export const inviteOrganizer = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const {
    organizerId,
    eventId,
    pool_name,
  location_address,
    max_capacity,
    required_skills,
    pay_range,
  } = req.body;

  if (!organizerId || !eventId || !pool_name || !max_capacity) {
    throw new ApiError(400, "Missing required fields");
  }

  const poolPayload = {
    organizer: organizerId,
    event: eventId,
    pool_name,
    max_capacity,
    required_skills,
    pay_range,
    status: "open",
  };

  // include location only if provided
  if (location?.coordinates) {
    poolPayload.location = {
      type: "Point",
      coordinates: location.coordinates,
    };
  }

  const pool = await OrganizerPool.create(poolPayload);

  try {
    // Fetch event title for a nicer notification message (best-effort)
    const event = await Event.findById(eventId).select('title');

    await createNotification({
      recipient: organizerId,
      type: 'organizer_invitation',
      message: `You have been invited to organize: ${event?.title || pool_name}`,
      reference: pool._id,
    });
  } catch (err) {
    // Don't block the primary response on notification errors - just log
    console.error('Failed to create organizer invite notification', err);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, pool, "Organizer invited to event"));
});

// Organizer applies to an open pool (organizer role)
export const applyToPool = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const poolId = req.params.id;

  const pool = await OrganizerPool.findById(poolId).populate('event');
  if (!pool) throw new ApiError(404, 'Organizer pool not found');
  if (pool.status !== 'open') throw new ApiError(400, 'Pool not open for applications');
  if (pool.organizer) throw new ApiError(400, 'Pool already has an organizer');

  pool.organizer = organizerId;
  pool.status = 'pending'; // pending host approval
  await pool.save();

  // notify host about applicant
  const event = pool.event;
  const hostId = event?.host;
  if (hostId) {
    await Notification.create({
      user: hostId,
      type: 'event',
      message: `Organizer applied to pool ${pool.pool_name} for event ${event?.title || pool.event}`,
    });
  }

  // persist application as a message in the conversation
  try {
    const organizerUser = await User.findById(organizerId).select('first_name last_name name');
    const organizerDisplay = organizerUser?.name || `${organizerUser?.first_name || ''} ${organizerUser?.last_name || ''}`.trim() || 'Organizer';
    const hostUser = await User.findById(hostId).select('first_name last_name name');
    const hostDisplay = hostUser?.name || `${hostUser?.first_name || ''} ${hostUser?.last_name || ''}`.trim() || 'Host';

    let conversation = await Conversation.findOne({ participants: { $all: [hostId, organizerId] }, event: event._id, pool: pool._id });
    if (!conversation) {
      conversation = await Conversation.create({ participants: [hostId, organizerId], event: event._id, pool: pool._id });
    }

    await Message.create({
      conversation: conversation._id,
      sender: organizerId,
      sender_name: organizerDisplay,
      receiver_name: hostDisplay,
      message_text: `Organizer ${organizerDisplay} has applied to manage pool ${pool.pool_name}`,
    });
  } catch (e) {
    // log but don't block
    // eslint-disable-next-line no-console
    console.error('Failed to persist application message', e);
  }

  return res.status(200).json(new ApiResponse(200, pool, 'Applied to pool; awaiting host approval'));
});

// 10. Approve Organizer for Event
export const approveOrganizer = asyncHandler(async (req, res) => {
  const orgPoolId = req.params.id;

  const pool = await OrganizerPool.findById(orgPoolId);
  if (!pool) throw new ApiError(404, "Organizer pool not found");

  pool.status = "active";
  await pool.save();

  // notify organizer they were approved
  if (pool.organizer) {
    await Notification.create({
      user: pool.organizer,
      type: 'event',
      message: `You have been approved to manage pool ${pool.pool_name}`,
    });
  }

  // assign approved organizer as the event's organizer (manager)
  try {
    if (pool.event && pool.organizer) {
      await Event.findByIdAndUpdate(pool.event, { organizer: pool.organizer });
    }
  } catch (e) {
    // log and continue
    // eslint-disable-next-line no-console
    console.error('Failed to assign event organizer after approval', e);
  }

  // fetch updated pool and event for response
  const updatedPool = await OrganizerPool.findById(orgPoolId).populate('organizer event');

  // persist approval as a message
  try {
    const hostUser = await User.findById(req.user._id).select('first_name last_name name');
    const hostDisplay = hostUser?.name || `${hostUser?.first_name || ''} ${hostUser?.last_name || ''}`.trim() || 'Host';
    const orgUser = await User.findById(pool.organizer).select('first_name last_name name');
    const orgDisplay = orgUser?.name || `${orgUser?.first_name || ''} ${orgUser?.last_name || ''}`.trim() || 'Organizer';

    let conversation = await Conversation.findOne({ participants: { $all: [req.user._id, pool.organizer] }, event: updatedPool.event._id, pool: updatedPool._id });
    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, pool.organizer], event: updatedPool.event._id, pool: updatedPool._id });
    }

    await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      sender_name: hostDisplay,
      receiver_name: orgDisplay,
      message_text: `Host ${hostDisplay} approved you to manage pool ${updatedPool.pool_name}`,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to persist approval message', e);
  }
  return res.status(200).json(new ApiResponse(200, { pool: updatedPool }, "Organizer approved and assigned"));
});

// 11. View Assigned Organizers
export const getAssignedOrganizers = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const pools = await OrganizerPool.find()
    .populate("organizer event")
    .sort({ createdAt: -1 });

  const filtered = pools.filter(
    (pool) => pool.event?.host?.toString() === hostId.toString()
  );

  return res
    .status(200)
    .json(new ApiResponse(200, filtered, "Assigned organizers fetched"));
});

// Fetch all organizers (users with role 'organizer') - available to authenticated hosts
export const getAllOrganizers = asyncHandler(async (req, res) => {
  const organizers = await User.find({ role: 'organizer' }).select('-password -refreshToken');
  return res.status(200).json(new ApiResponse(200, organizers, 'Organizers list fetched'));
});

// Fetch all organizer pools (visible to hosts)
export const getAllPools = asyncHandler(async (req, res) => {
  // If requester is an organizer, only show open pools available to apply
  const role = req.user?.role;
  const query = {};
  if (role === 'organizer') query.status = 'open';

  const pools = await OrganizerPool.find(query).populate('organizer event').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, pools, 'Organizer pools fetched'));
});

// 12. Start In-App Chat with Organizer
export const startChatWithOrganizer = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { organizerId, eventId, poolId } = req.body;

  if (!organizerId || !eventId || !poolId) {
    throw new ApiError(400, "Missing required fields: organizerId, eventId, poolId");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [hostId, organizerId] },
    event: eventId,
    pool: poolId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [hostId, organizerId],
      event: eventId,
      pool: poolId,
    });
  }

  const welcome = await Message.create({
    conversation: conversation._id,
    sender: hostId,
    message_text: "Welcome to the event coordination chat!",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { conversation, welcome }, "Chat started"));
});

// List conversations for a host
export const getConversations = asyncHandler(async (req, res) => {
  const hostId = req.user._1d || req.user._id;

  const conversations = await Conversation.find({ participants: hostId })
    .populate("event", "name date location")
    .populate("pool", "name")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, conversations, "Conversations fetched"));
});

// Get a single conversation and its messages (host)
export const getConversationById = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId).populate(
    "event pool"
  );

  if (!conversation || !conversation.participants.some((p) => p.toString() === hostId.toString())) {
    throw new ApiError(403, "Access denied to this conversation");
  }

  const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });

  return res.status(200).json(new ApiResponse(200, { conversation, messages }, "Conversation fetched"));
});

// Send message as host within a conversation
export const sendMessage = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { conversationId } = req.params;
  const { message_text } = req.body;

  if (!message_text || message_text.trim() === "") {
    throw new ApiError(400, "Message text is required");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation || !conversation.participants.some((p) => p.toString() === hostId.toString())) {
    throw new ApiError(403, "Access denied to this conversation");
  }

  const message = await Message.create({ conversation: conversationId, sender: hostId, message_text });

  return res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

// 🔹 13. Deposit to Escrow
export const depositToEscrow = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const {
    eventId,
    organizerId,
    total_amount,
    organizer_percentage,
    gigs_percentage,
    payment_method,
    upi_transaction_id,
  } = req.body;

  if (
    !eventId ||
    !organizerId ||
    !total_amount ||
    !organizer_percentage ||
    !gigs_percentage ||
    !payment_method
  ) {
    throw new ApiError(400, "Missing required deposit fields");
  }

  const escrow = await EscrowContract.create({
    event: eventId,
    host: hostId,
    organizer: organizerId,
    total_amount,
    organizer_percentage,
    gigs_percentage,
  status: "funded",
  });

  const payment = await Payment.create({
    escrow: escrow._id,
    payer: hostId,
    payee: organizerId,
    amount: total_amount,
    payment_method,
    upi_transaction_id,
  // mark the incoming deposit as 'held' until release
  status: "held",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { escrow, payment },
        "Escrow funded and payment logged"
      )
    );
});

// 🔹 14. View Escrow Status
export const getEscrowStatus = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId } = req.params;

  const escrow = await EscrowContract.findOne({
    event: eventId,
    host: hostId,
  }).populate("organizer");

  if (!escrow)
    throw new ApiError(404, "No escrow contract found for this event");

  // fetch payment history related to this escrow
  const payments = await Payment.find({ escrow: escrow._id }).populate('payee payer');

  return res
    .status(200)
    .json(new ApiResponse(200, { escrow, payments }, "Escrow status fetched"));
});

// 🔹 15. Verify Attendance
export const verifyAttendance = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId } = req.params;

  const escrow = await EscrowContract.findOne({ event: eventId, host: hostId });

  if (!escrow) throw new ApiError(404, "Escrow contract not found");
  if (escrow.status === "released")
    throw new ApiError(400, "Escrow already released");

  // compute amounts (Decimal128 stored as strings)
  const total = Number(escrow.total_amount?.toString?.() || escrow.total_amount || 0);
  const orgPerc = Number(escrow.organizer_percentage?.toString?.() || escrow.organizer_percentage || 0);
  const gigsPerc = Number(escrow.gigs_percentage?.toString?.() || escrow.gigs_percentage || 0);

  const organizerAmount = Math.round((total * orgPerc) / 100);
  const gigsAmount = Math.round((total * gigsPerc) / 100);

  // mark any held payments for this escrow as 'released'
  await Payment.updateMany({ escrow: escrow._id, status: 'held' }, { $set: { status: 'released' } });

  // create payout payment to organizer
  const organizerPayout = await Payment.create({
    escrow: escrow._id,
    payer: hostId,
    payee: escrow.organizer,
    amount: organizerAmount,
    payment_method: 'upi',
    status: 'completed',
  });

  // if event has gigs, split gigsAmount among gigs; otherwise record a single platform/gigs payment
  const event = await Event.findById(eventId).select('gigs');
  if (event && Array.isArray(event.gigs) && event.gigs.length > 0) {
    const perGig = Math.floor(gigsAmount / event.gigs.length);
    for (const gigId of event.gigs) {
      // create completed payment for each gig
      // eslint-disable-next-line no-await-in-loop
      await Payment.create({
        escrow: escrow._id,
        payer: hostId,
        payee: gigId,
        amount: perGig,
        payment_method: 'upi',
        status: 'completed',
      });
    }
  } else if (gigsAmount > 0) {
    // no gigs assigned: create a single payment record for gigs portion (held for platform or later allocation)
    await Payment.create({
      escrow: escrow._id,
      payer: hostId,
      payee: escrow.host, // keep host as temporary payee for record; platform handling can be added later
      amount: gigsAmount,
      payment_method: 'upi',
      status: 'completed',
    });
  }

  escrow.status = "released";
  await escrow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { escrow, organizerPayout }, "Attendance verified, escrow released and payouts created"));
});

// 🔹 16. Wallet Balance
export const getWalletBalance = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  let wallet = await UserWallet.findOne({ user: hostId });

  if (!wallet) {
    wallet = await UserWallet.create({
      user: hostId,
      balance_inr: mongoose.Types.Decimal128.fromString("200000.00"),
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wallet, "Wallet balance fetched"));
});

// 🔹 17. Host Dashboard
export const getHostDashboard = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const events = await Event.find({ host: hostId }).sort({ createdAt: -1 });
  const escrows = await EscrowContract.find({ host: hostId }).populate(
    "event organizer"
  );
  const payments = await Payment.find({ payer: hostId }).populate(
    "escrow payee"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { events, escrows, payments },
        "Host dashboard data fetched"
      )
    );
});

// 🔹 18. Leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const topBadges = await UserBadge.find()
    .populate("user badge")
    .sort({ createdAt: -1 });

  const leaderboard = topBadges
    .filter((entry) => ["organizer", "gig"].includes(entry.user.role))
    .map((entry) => ({
      userId: entry.user._id,
      name: entry.user.name,
      role: entry.user.role,
      badge: entry.badge.badge_name,
      min_events: entry.badge.min_events,
      kyc_required: entry.badge.kyc_required,
    }));

  return res
    .status(200)
    .json(new ApiResponse(200, leaderboard, "Leaderboard fetched"));
});

// 🔹 19. Event Reviews
export const createRatingReview = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId, organizerId, rating, review_text } = req.body;

  if (!eventId || !organizerId || !rating) {
    throw new ApiError(400, "Missing required rating fields");
  }

  const review = await RatingReview.create({
    event: eventId,
    reviewer: hostId,
    reviewee: organizerId,
    rating,
    review_text,
    review_type: "host_to_organizer",
  });

  return res.status(201).json(new ApiResponse(201, review, "Rating review submitted"));
});


// 🔹20.  Create Feedback
export const createFeedback = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { eventId, feedback_text, rating } = req.body;

  if (!eventId || !feedback_text) {
    throw new ApiError(400, "Missing required feedback fields");
  }

  const feedback = await Feedback.create({
    event: eventId,
    gig: gigId,
    comment: feedback_text,
    rating:rating,
  });

  return res.status(201).json(new ApiResponse(201, feedback, "Feedback submitted"));
});


// 🔹21. Host Profile
export const getHostProfile = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const user = await User.findById(hostId).select("-password");
  const documents = await UserDocument.find({ user: hostId });
  const kyc = await KYCVerification.findOne({ user: hostId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { user, documents, kyc }, "Host profile fetched")
    );
});
