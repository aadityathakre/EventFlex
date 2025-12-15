import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Pool from "../models/Pool.model.js";
import Event from "../models/Event.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import EventAttendance from "../models/EventAttendance.model.js";
import UserWallet from "../models/UserWallet.model.js";
import Escrow from "../models/EscrowContract.model.js";
import Rating from "../models/RatingReview.model.js";
import Notification from "../models/Notification.model.js";
import Dispute from "../models/Dispute.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import UserDocument from "../models/UserDocument.model.js";
import mongoose from "mongoose";
import UserProfile from "../models/UserProfile.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import PoolApplication from "../models/PoolApplication.model.js"
import Badge from "../models/Badge.model.js";
import UserBadge from "../models/UserBadge.model.js";
import EventApplication from "../models/EventApplications.js";

// 1 Organizer Profile
export const getOrganizerProfile = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  // Fetch user core data
  const user = await User.findById(organizerId).lean();
  if (!user) throw new ApiError(404, "Organizer not found");

  // Try to fetch profile
  let profile = await UserProfile.findOne({ user: organizerId });

  // Auto-create blank profile if missing
  if (!profile) {
    profile = await UserProfile.create({
      user: organizerId,
      profile_image_url: user.avatar,
      bank_details: user.wallet
    });
  }

  // Merge
  const mergedProfile = {
    user: organizerId,
    name: user.fullName || `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone: user.phone,
    role: user.role,
    bio: profile.bio || "",
    location: profile.location || {},
    availability: profile.availability || {},
    bank_details: profile.bank_details || {},
    profile_image_url: profile.profile_image_url || user.avatar,
    createdAt: profile.createdAt || user.createdAt,
    updatedAt: profile.updatedAt || user.updatedAt,
  };

  // Also include documents and KYC summary for a complete profile view
  const documents = await UserDocument.find({ user: organizerId }).select("-__v").lean();
  const kyc = await KYCVerification.findOne({ user: organizerId }).select("-__v").lean();

  return res
    .status(200)
    .json(new ApiResponse(200, { mergedProfile, documents, kyc }, "Organizer profile fetched"));
});

// 2. Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const orgId = req.user._id;
  const updates = req.body;

  // Separate updates for User vs UserProfile
  const userUpdates = {};
  const profileUpdates = {};

  if (updates.first_name) userUpdates.first_name = updates.first_name;
  if (updates.last_name) userUpdates.last_name = updates.last_name;
  if (updates.email) userUpdates.email = updates.email;
  if (updates.phone) userUpdates.phone = updates.phone;

  if (updates.bio) profileUpdates.bio = updates.bio;
  if (updates.location) profileUpdates.location = updates.location;
  if (updates.availability) profileUpdates.availability = updates.availability;
  if (updates.bank_details) profileUpdates.bank_details = updates.bank_details;

  // Update User schema fields
  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(orgId, { $set: userUpdates }, { new: true, runValidators: true });
  }

  // Update UserProfile schema fields
  let profile = await UserProfile.findOneAndUpdate(
    { user: orgId },
    { $set: profileUpdates },
    { new: true, runValidators: true }
  );

  if(!profile){ 
    return res.status(404).json(new ApiResponse(404, null, "Profile not found"));
  }

  return res.status(200).json(new ApiResponse(200, { userUpdates, profile }, "Profile updated"));
});

// 3. Update profile image //
 export const updateProfileImage = asyncHandler(async (req, res) => {
  const orgId = req.user._id;
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // or req.file.path if using single upload

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // Update both User and UserProfile for consistency
  await User.findByIdAndUpdate(orgId, { avatar: avatarUpload.url });

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: orgId },
    { profile_image_url: avatarUpload.url },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile image updated"));
});

// 4. Delete profile image //
export const deleteProfileImage = asyncHandler(async (req, res) => {
  const orgId = req.user._id;

  // Reset avatar in User model
  await User.findByIdAndUpdate(
    orgId,
    { avatar: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" },
    { new: true }
  );

  // Reset profile_image_url in UserProfile model
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: orgId },
    { profile_image_url: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile image removed"));
});

// 5. Upload Organizer Documents
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

// Update Organizer Documents
export const updateOrganizerDocs = asyncHandler(async (req, res) => {
  const { type } = req.body; // optional: which doc type to update
  const localFilePath = req.files?.fileUrl?.[0]?.path;
  const userId = req.user._id;

  if (!localFilePath) {
    throw new ApiError(400, "Document file is required for update");
  }

  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  // Find the most recent doc or by provided type
  let doc;
  if (type) {
    doc = await UserDocument.findOne({ user: userId, type });
  } else {
    doc = await UserDocument.findOne({ user: userId }).sort({ uploadedAt: -1 });
  }

  if (!doc) {
    // If no doc exists, create one instead of failing
    doc = await UserDocument.create({ user: userId, type: type || "generic", fileUrl: cloudinaryRes.url });
  } else {
    doc.fileUrl = cloudinaryRes.url;
    doc.status = "pending"; // reset for re-verification
    doc.uploadedAt = new Date();
    await doc.save();
  }

  return res.status(200).json(new ApiResponse(200, doc, "Document updated"));
});

// 6. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
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

// 7. Aadhaar Verification 
export const verifyAadhaarOrganizer = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { aadhaar_number, otp } = req.body;

  if (!aadhaar_number || aadhaar_number.length !== 12 || !otp) {
    throw new ApiError(400, "Invalid Aadhaar number or OTP required");
  }

  // Update or create KYCVerification record
  let verification = await KYCVerification.findOne({ user: organizerId });

  if (verification) {
    verification.aadhaar_number = aadhaar_number;
    verification.aadhaar_verified = true;
    verification.status = "approved";
    verification.verified_at = new Date();
    await verification.save();
  } else {
    verification = await KYCVerification.create({
      user: organizerId,
      aadhaar_number,
      aadhaar_verified: true,
      status: "approved",
      verified_at: new Date(),
    });
  }

  // Also update User model to reflect KYC approval
  await User.findByIdAndUpdate(
    organizerId,
    { isVerified: true }, // or add a dedicated field like kycStatus if you prefer
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, verification, "Organizer Aadhaar verified and user status updated"));
});

// 8. View Wallet
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
  

  const balanceNum = parseFloat(wallet.balance_inr?.toString?.() || "0");
  return res.status(200).json(
    new ApiResponse(200, {
      balance: balanceNum,
      upi_id: wallet.upi_id || "",
    }, "Wallet fetched")
  );
});

// 9. Withdraw Funds
export const withdrawFunds = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { amount, upi_id } = req.body;

  const requestedAmount = parseFloat(amount);
  if (isNaN(requestedAmount) || requestedAmount <= 0) {
    throw new ApiError(400, "Invalid withdrawal amount");
  }

  const wallet = await UserWallet.findOne({ user: organizerId });
  if (!wallet || !wallet.balance_inr) {
    throw new ApiError(404, "Wallet not found or balance missing");
  }

  const balanceRaw = wallet.balance_inr.toString?.() || "0.00";
  const currentBalance = parseFloat(balanceRaw);
  if (isNaN(currentBalance)) {
    throw new ApiError(500, "Corrupted wallet balance");
  }

  if (requestedAmount > currentBalance) {
    throw new ApiError(400, "Insufficient balance");
  }

  const newBalance = (currentBalance - requestedAmount).toFixed(2);
  wallet.balance_inr = mongoose.Types.Decimal128.fromString(newBalance);
  wallet.upi_id = upi_id || wallet.upi_id;
  await wallet.save();

  return res.status(200).json(
    new ApiResponse(200, { new_balance: parseFloat(wallet.balance_inr.toString()) }, "Withdrawal successful")
  );
});

// 10. get all active events by host
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().select("-__v");
  const activeEvents = events.filter(event => event.status !== "completed");
  return res.status(200).json(new ApiResponse(200, activeEvents, "Active events fetched"));
});

// 11. get event organizising order
export const reqHostForEvent = asyncHandler(async (req, res) => {
  // Organizer requests to manage a host's event
  const organizerId = req.user._id;
  // Accept both body and URL param for eventId for robustness
  const { eventId: eventIdBody, cover_letter, proposed_rate } = req.body;
  const eventId = eventIdBody || req.params.id;

  if (!eventId) {
    throw new ApiError(400, "Missing required field: eventId");
  }

  const eventDoc = await Event.findById(eventId).select("host organizer title");
  if (!eventDoc) {
    throw new ApiError(404, "Event not found");
  }

  const existing = await EventApplication.findOne({
    event: eventId,
    organizer: organizerId,
    application_status: { $in: ["pending", "accepted"] },
  });
  if (existing) {
    return res
      .status(200)
      .json(new ApiResponse(200, existing, "Application already exists"));
  }

  const eventApplication = await EventApplication.create({
    event: eventId,
    applicant: organizerId,
    organizer: organizerId,
    host: eventDoc.host,
    sender: organizerId,
    receiver: eventDoc.host,
    application_status: "pending",
    cover_letter,
    proposed_rate: proposed_rate
      ? mongoose.Types.Decimal128.fromString(proposed_rate.toString())
      : undefined,
  });

  if (eventDoc.host) {
    const organizer = await User.findById(organizerId).select("first_name last_name");
    await Notification.create({
      user: eventDoc.host,
      type: "event",
      message: `Organizer ${organizer?.fullName || organizer?.first_name} requested to manage ${eventDoc.title}`,
    });
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        eventApplication,
        "Organizer requested to host event"
      )
    );
});

// 12. accept invitaion for event management
export const acceptInvitationFromHost = asyncHandler(async (req, res) => {
  const orgAppId = req.params.id;
  const eventApplication = await EventApplication.findById(orgAppId);
  if (!eventApplication) {
    throw new ApiError(404, "Event application not found");
  }
  if (eventApplication.application_status !== "pending") {
    throw new ApiError(400, "Event application is not pending");
  }

  // Mark accepted
  eventApplication.application_status = "accepted";
  await eventApplication.save();

  // Assign organizer to event
  const eventId = eventApplication.event;
  const organizerId = eventApplication.applicant;
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $set: { organizer: organizerId } },
    { new: true }
  );
  if (!updatedEvent) {
    throw new ApiError(404, "Event not found to assign organizer");
  }

  const poolExists = await Pool.findOne({ organizer: organizerId, event: eventId });
  const orgUser = await User.findById(organizerId).select("first_name last_name");
  await Notification.create({
    user: eventApplication.host,
    type: "event",
    message: `Organizer ${orgUser?.fullName || orgUser?.first_name} accepted invitation for ${updatedEvent.title}`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { application: eventApplication, pool_exists: !!poolExists }, "Organizer accepted for event"));
});

// 12.1 Reject invitation from host
export const rejectInvitationFromHost = asyncHandler(async (req, res) => {
  const orgAppId = req.params.id;
  const eventApplication = await EventApplication.findById(orgAppId);
  if (!eventApplication) {
    throw new ApiError(404, "Event application not found");
  }
  if (eventApplication.application_status !== "pending") {
    throw new ApiError(400, "Event application is not pending");
  }

  eventApplication.application_status = "rejected";
  await eventApplication.save();

  const updatedEvent = await Event.findById(eventApplication.event).select("title");
  const orgUser = await User.findById(eventApplication.applicant).select("first_name last_name");
  await Notification.create({
    user: eventApplication.host,
    type: "event",
    message: `Organizer ${orgUser?.fullName || orgUser?.first_name} rejected invitation for ${updatedEvent?.title}`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, eventApplication, "Invitation rejected"));
});

// 13. Create Pool
export const createPool = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { name,eventId, description } = req.body;

  const eventDoc = await Event.findById(eventId).select("organizer title host");
  if (!eventDoc) throw new ApiError(404, "Event not found");
  if (eventDoc.organizer?.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Not authorized to create pool for this event");
  }

  const existingPool = await Pool.findOne({ organizer: organizerId, event: eventId });
  if (existingPool) {
    return res
      .status(200)
      .json(new ApiResponse(200, existingPool, "Pool already exists"));
  }

  const pool = await Pool.create({
    organizer: organizerId,
    event:eventId,
    name,
    description,
    status :"active"
  });

  await Notification.create({
    user: eventDoc.host,
    type: "event",
    message: `Organizer created a gig pool for ${eventDoc.title}`,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, pool, "Pool created successfully !"));
});

// 13.1 List My Pools
export const getMyPools = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const pools = await Pool.find({ organizer: organizerId })
    .populate("event", "title start_date end_date location")
    .populate("gigs", "first_name last_name avatar fullName")
    .select("-__v");
  return res.status(200).json(new ApiResponse(200, pools, "Organizer pools fetched"));
});

// 13.2 Update Pool details
export const updatePoolDetails = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { id } = req.params;
  const { name, description, status } = req.body;

  const pool = await Pool.findById(id);
  if (!pool) throw new ApiError(404, "Pool not found");
  if (pool.organizer.toString() !== organizerId.toString()) {
    throw new ApiError(403, "Not authorized to update this pool");
  }

  if (name !== undefined) pool.name = name;
  if (description !== undefined) pool.description = description;
  if (status !== undefined) pool.status = status;
  await pool.save();

  const populated = await Pool.findById(id)
    .populate("event", "title start_date end_date location")
    .populate("gigs", "first_name last_name avatar fullName")
    .select("-__v");

  return res.status(200).json(new ApiResponse(200, populated, "Pool updated"));
});

// 14. check pool applications
export const getPoolApplications = asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const applications = await PoolApplication.find({ pool: poolId, application_status: "pending" })
    .populate("gig", "first_name last_name avatar fullName")
    .select("-__v");
  return res.status(200).json(new ApiResponse(200, applications, "Pending applications fetched"));
});

// 15. review and approve gigs
export const reviewApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { action, orgPoolId } = req.body; // "approve" or "reject"

  const application = await PoolApplication.findById(applicationId);
  if (!application) throw new ApiError(404, "Application not found");

  const pool = await Pool.findById(application.pool);
  // If orgPoolId is not provided, infer it using organizer + event
  let orgPool = null;
  if (orgPoolId) {
    orgPool = await OrganizerPool.findById(orgPoolId);
  } else if (pool) {
    orgPool = await OrganizerPool.findOne({ organizer: pool.organizer, event: pool.event });
  }

  if (action === "approve") {
    // Check capacity
    if (!orgPool) {
      throw new ApiError(400, "Organizer pool not found for capacity check");
    }
    if (pool.gigs.length >= orgPool.max_capacity) {
      pool.status = "archived";
      await pool.save();
      throw new ApiError(400, "Pool capacity reached, cannot add more gigs");
    }

    application.application_status = "accepted";
    await application.save();

    // Add gig to pool
    pool.gigs.push(application.gig);
    await pool.save();

    return res.status(200).json(new ApiResponse(200, application, "Gig approved and added to pool"));
  }

  if (action === "reject") {
    application.application_status = "rejected";
    await application.save();
    return res.status(200).json(new ApiResponse(200, application, "Gig application rejected"));
  }

  throw new ApiError(400, "Invalid action");
});

// 16. View Pool Details
export const getPoolDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pool = await Pool.findById(id)
  .populate("gigs", "first_name last_name avatar badges")
  .select("-__v");

  if (!pool) throw new ApiError(404, "Pool not found");

  return res
    .status(200)
    .json(new ApiResponse(200, pool, "Pool details fetched"));
});

// 16.1 Get OrganizerPool for an Event (for capacity checks)
export const getOrganizerPoolByEvent = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { eventId } = req.params;

  const orgPool = await OrganizerPool.findOne({ organizer: organizerId, event: eventId })
    .select("-__v");

  if (!orgPool) {
    return res.status(404).json(new ApiResponse(404, null, "Organizer pool not found for event"));
  }

  return res.status(200).json(new ApiResponse(200, orgPool, "Organizer pool fetched"));
});

// 17. Chat with Gig (Stub)
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

// 18. View Event Details
export const getEventDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("organizer", "name email")
    .select("-__v");

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched"));
});

// 18.1 List my event applications
export const getOrganizerApplications = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const apps = await EventApplication.find({ organizer: organizerId })
    .populate("event", "title start_date end_date location host organizer status")
    .select("-__v")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, apps, "Organizer applications fetched"));
});

export const getOrganizerApplicationSummary = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const apps = await EventApplication.find({ organizer: organizerId })
    .populate("event", "title host organizer status")
    .populate("host", "first_name last_name")
    .populate("organizer", "first_name last_name")
    .sort({ createdAt: -1 });

  const requested = apps.filter(a => a.application_status === "pending" && a.sender?.toString() === organizerId.toString());
  const invited = apps.filter(a => a.application_status === "pending" && a.sender?.toString() !== organizerId.toString());
  const accepted = apps.filter(a => a.application_status === "accepted");
  const rejected = apps.filter(a => a.application_status === "rejected");

  const acceptedWithFlags = await Promise.all(accepted.map(async (a) => {
    const exists = await Pool.findOne({ organizer: organizerId, event: a.event._id });
    return { ...a.toObject(), pool_exists: !!exists };
  }));

  return res.status(200).json(
    new ApiResponse(200, { requested, invited, accepted: acceptedWithFlags, rejected }, "Applications summary fetched")
  );
});

export const deleteOrganizerApplication = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { id } = req.params;
  const app = await EventApplication.findById(id);
  if (!app) throw new ApiError(404, "Application not found");
  if (
    app.organizer?.toString() !== organizerId.toString() &&
    app.receiver?.toString() !== organizerId.toString() &&
    app.sender?.toString() !== organizerId.toString()
  ) {
    throw new ApiError(403, "Not authorized to delete this application");
  }
  if (!["accepted", "rejected"].includes(app.application_status)) {
    throw new ApiError(400, "Only accepted or rejected applications can be deleted");
  }
  await EventApplication.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, null, "Application deleted"));
});

// 19. Payment History
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const escrows = await Escrow
    .find({ organizer: organizerId })
    .populate("event", "title")
    .select("-__v");

  const normalized = escrows.map((e) => {
    const obj = e.toObject();
    const toNum = (val) => {
      try {
        if (val === null || val === undefined) return null;
        if (typeof val === "number") return val;
        if (typeof val === "string") return parseFloat(val);
        // Decimal128
        if (typeof val === "object" && typeof val.toString === "function") {
          return parseFloat(val.toString());
        }
        return null;
      } catch {
        return null;
      }
    };
    return {
      ...obj,
      total_amount: toNum(obj.total_amount),
      organizer_percentage: toNum(obj.organizer_percentage),
      gigs_percentage: toNum(obj.gigs_percentage),
    };
  });

  return res.status(200).json(new ApiResponse(200, normalized, "Payment history fetched"));
});

// 20. Simulate Payout
export const simulatePayout = asyncHandler(async (req, res) => {
  const { escrowId } = req.params;
  const escrow = await Escrow.findById(escrowId);

  if (!escrow || escrow.status !== "released") {
    throw new ApiError(400, "Escrow not ready for payout");
  }

  return res.status(200).json(new ApiResponse(200, escrow, "Payout simulated"));
});

// 21. Predict No-show Risk for Gig
export const getNoShowRisk = asyncHandler(async (req, res) => {
  const { gigId } = req.params;
  const gig = await User.findById(gigId);

  if (!gig) throw new ApiError(404, "Gig user not found");

  return res.status(200).json(new ApiResponse(200, {
    gigId,
    noShowRisk: gig.noShowRisk || 0,
  }, "No-show risk fetched"));
});


// 22. Get Organizer Wellness Score
export const getWellnessScore = asyncHandler(async (req, res) => {
  const organizer = await User.findById(req.user._id);

  return res.status(200).json(new ApiResponse(200, {
    wellnessScore: organizer.wellnessScore || 100,
  }, "Wellness score fetched"));
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


// 25. Live Event Tracking
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

// 26. Badges
export const getOrganizerBadges = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  // 1) Count how many events this organizer has completed
  const completedEventsCount = await Event.countDocuments({
    organizer: organizerId,
    status: "completed",
  });

  // 2) Find all eligible badges (threshold <= completed events)
  const eligibleBadges = await Badge.find({
    min_events: { $lte: completedEventsCount },
  });

  // 3) Award badges if not already owned
  for (const badge of eligibleBadges) {
    const alreadyHasBadge = await UserBadge.findOne({
      user: organizerId,
      badge: badge._id,
    });
    if (!alreadyHasBadge) {
      await UserBadge.create({
        user: organizerId,
        badge: badge._id,
      });
    }
  }

  // 4) Fetch all badges the organizer currently has
  const badges = await UserBadge.find({ user: organizerId })
    .populate("badge", "badge_name min_events")
    .select("createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      { badges, completedEventsCount },
      "Organizer badges fetched successfully"
    )
  );
});

// 27. Leaderboard
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



//  Get Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const notifications = await Notification.find({ user: organizerId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

//  Mark Notification as Read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

  if(!updated) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
  }
  return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});


// 28. Organizer: List Conversations
export const getOrganizerConversations = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const conversations = await Conversation.find({
    participants: organizerId,
  })
    .populate("event", "title start_date end_date location")
    .populate("pool", "pool_name status")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, conversations, "Conversations fetched"));
});

// 29. Organizer: Get messages in a conversation
export const getOrganizerConversationMessages = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.some((p) => p.toString() === organizerId.toString())) {
    throw new ApiError(403, "Access denied to this conversation");
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "email role")
    .sort({ createdAt: 1 });

  return res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

// 30. Organizer: Send message in a conversation
export const sendOrganizerMessage = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { conversationId } = req.params;
  const { message_text } = req.body;

  if (!message_text || !message_text.trim()) {
    throw new ApiError(400, "message_text is required");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.some((p) => p.toString() === organizerId.toString())) {
    throw new ApiError(403, "Access denied to this conversation");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: organizerId,
    message_text,
  });

  return res.status(201).json(new ApiResponse(201, message, "Message sent"));
});



