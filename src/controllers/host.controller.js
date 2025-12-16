import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UserDocument from "../models/UserDocument.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import EscrowContract from "../models/EscrowContract.model.js";
import Payment from "../models/Payment.model.js";
import UserWallet from "../models/UserWallet.model.js";
import RatingReview from "../models/RatingReview.model.js";
import Feedback from "../models/Feedback.model.js";
import UserBadge from "../models/UserBadge.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/User.model.js";
import EventApplication from "../models/EventApplications.js";
import mongoose from "mongoose";
import UserProfile from "../models/UserProfile.model.js";
import Notification from "../models/Notification.model.js";

// 1. Host Profile
export const getHostProfile = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const user = await User.findById(hostId).select("-password");
  const documents = await UserDocument.find({ user: hostId });
  const kyc = await KYCVerification.findOne({ user: hostId });
  
  if (!user) throw new ApiError(404, "User not found");

   // Try to fetch profile
  let profile = await UserProfile.findOne({ user: hostId });
  if (!profile) {
      profile = await UserProfile.create({
      user: hostId,
      profile_image_url: user.avatar,
      bank_details: user.wallet
    });
  }

  // Merge and return
  const mergedProfile = {
    user: hostId,
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


  return res
    .status(200)
    .json(
      new ApiResponse(200, { mergedProfile, documents, kyc }, "Host profile fetched")
    );
});

// 2. Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const updates = req.body;

  // Separate updates for User vs UserProfile
  const userUpdates = {};
  const profileUpdates = {};

  if (updates.first_name) {
    if(updates.first_name.length > 2 && updates.first_name.length < 30){
    userUpdates.first_name = updates.first_name;
    }
  }

  if (updates.last_name) {
    if(updates.last_name.length > 2 && updates.last_name.length < 30){
    userUpdates.last_name = updates.last_name;
    }
  }

  if (updates.email){ 
    if(/\S+@\S+\.\S+/.test(updates.email)){  
    userUpdates.email = updates.email;}
  }

  if (updates.phone) {
    if(/^[6-9]\d{9}$/.test(updates.phone)){
    userUpdates.phone = updates.phone;
    }
  }

  if (updates.bio) profileUpdates.bio = updates.bio;
  if (updates.location) profileUpdates.location = updates.location;
  if (updates.availability) profileUpdates.availability = updates.availability;
  if (updates.bank_details) profileUpdates.bank_details = updates.bank_details;

  // Update User schema fields
  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(hostId, { $set: userUpdates }, { new: true, runValidators: true });
  }
  
  // Update UserProfile schema fields
  let profile = await UserProfile.findOneAndUpdate(
    { user: hostId },
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
  const hostId = req.user._id;
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // or req.file.path if using single upload

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // Update both User and UserProfile for consistency
  await User.findByIdAndUpdate(hostId, { avatar: avatarUpload.url });

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: hostId },
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
  const hostId = req.user._id;

  // Reset avatar in User model
  await User.findByIdAndUpdate(
    hostId,
    { avatar: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" },
    { new: true }
  );

  // Reset profile_image_url in UserProfile model
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: hostId },
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

// 5. Upload KYC Documents
export const uploadHostDocs = asyncHandler(async (req, res) => {
  const  {type}  = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;
  const userId = req.user._id;

  console.log("📥 uploadHostDocs - Received request");
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  console.log("Type from body:", type);
  console.log("LocalFilePath:", localFilePath);

  if (!type || !localFilePath) {
    throw new ApiError(400, "Document type and file is required");
  }

  // Check if user already has a document with this type
  const existingDoc = await UserDocument.findOne({ user: userId, type });
  
  if (existingDoc) {
    throw new ApiError(400, "You already have a document of this type. Please use the update endpoint to modify it.");
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

  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded successfully"));
});

// 5.1 Update KYC Document (Edit existing document)
export const updateHostDocs = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;
  const userId = req.user._id;

  console.log("📥 updateHostDocs - Received request");
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  console.log("Type from body:", type);
  console.log("LocalFilePath:", localFilePath);

  if (!type || !localFilePath) {
    throw new ApiError(400, "Document type and file is required");
  }

  // Find the user's existing document (they only have one)
  const existingDoc = await UserDocument.findOne({ user: userId });

  if (!existingDoc) {
    throw new ApiError(404, "No document found. Please upload a document first.");
  }

  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  // Update the document with new type and file
  existingDoc.type = type;
  existingDoc.fileUrl = cloudinaryRes.url;
  existingDoc.status = "pending"; // Reset status to pending after re-upload
  existingDoc.uploadedAt = new Date();
  const updatedDoc = await existingDoc.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedDoc, "Document updated successfully"));
});

// 6. Submit E-Signature
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

  const existing = await User.findOne({
    user: userId,
  });

  if(!existing){
    throw new ApiError(404, "User not found");
  }

  existing.digital_signature = cloudinaryRes.url;
  const signatureDoc = await existing.save();

  return res
    .status(201)
    .json(new ApiResponse(201, signatureDoc, "E-signature submitted"));
});

// 7. Aadhaar Sandbox Verification   (this feature will come soon)
export const verifyAadhaarSandbox = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { aadhaar_number , otp} = req.body;

  if (!aadhaar_number || aadhaar_number.length !== 12 || !otp) {
    throw new ApiError(400, "Invalid Aadhaar number or not found");
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

  // Also update User model to reflect KYC approval
  await User.findByIdAndUpdate(
    userId,
    { isVerified: true }, // or add a dedicated field like kycStatus if you prefer
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, verification, "Aadhaar verified (sandbox)"));
});

// 8. Wallet Balance
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

// 8.1 Withdraw funds (test mode) - supports UPI or Bank
export const withdrawFunds = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { amount, mode, upi_id, beneficiary_name, account_number, ifsc } = req.body;

  // Validate amount
  const requestedAmount = parseFloat(amount);
  if (isNaN(requestedAmount) || requestedAmount <= 0) {
    throw new ApiError(400, "Invalid withdrawal amount");
  }

  // Validate destination
  if (mode === "upi") {
    if (!upi_id || typeof upi_id !== "string" || upi_id.length < 6) {
      throw new ApiError(400, "Valid UPI ID is required for UPI withdrawals");
    }
  } else if (mode === "bank") {
    if (!account_number || !ifsc) {
      throw new ApiError(400, "Bank account number and IFSC are required for bank withdrawals");
    }
  } else {
    throw new ApiError(400, "Invalid withdrawal mode. Use 'upi' or 'bank'");
  }

  // Fetch wallet
  const wallet = await UserWallet.findOne({ user: hostId });
  if (!wallet || !wallet.balance_inr) {
    throw new ApiError(404, "Wallet not found or balance missing");
  }

  // Convert Decimal128 to float safely
  const balanceRaw = wallet.balance_inr.toString?.() || "0.00";
  const currentBalance = parseFloat(balanceRaw);
  if (isNaN(currentBalance)) {
    throw new ApiError(500, "Corrupted wallet balance");
  }

  if (requestedAmount > currentBalance) {
    throw new ApiError(400, "Insufficient balance");
  }

  // Deduct and persist
  const newBalance = (currentBalance - requestedAmount).toFixed(2);
  wallet.balance_inr = mongoose.Types.Decimal128.fromString(newBalance);
  await wallet.save();

  // Simulate payout in test mode (mock UTR/refs)
  const utr = Math.floor(100000000000 + Math.random() * 900000000000).toString();
  const payout = {
    mode,
    amount: requestedAmount,
    status: "SUCCESS",
    utr,
    beneficiary: {
      name: beneficiary_name || "Beneficiary",
      ...(mode === "upi" ? { upi_id } : { account_number, ifsc }),
    },
    timestamp: new Date(),
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        new_balance: parseFloat(wallet.balance_inr.toString()),
        payout,
      },
      "Withdrawal processed (test mode)"
    )
  );
});

// 9. Create Event
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

  await Notification.create({
    user: hostId,
    type: "event",
    message: `Event ${title} created`,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

// 10. Edit Event
export const editEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const eventId = req.params.id;

  const event = await Event.findOne({ _id: eventId, host: hostId });
  if (!event) throw new ApiError(404, "Event not found or unauthorized");

  // Disallow edits on completed events per business rule
  if (event.status === "completed") {
    throw new ApiError(400, "Completed events cannot be edited");
  }

  const update = { ...req.body };

  // Ensure GeoJSON structure remains valid when updating location
  if (update.location?.coordinates) {
    update.location = {
      type: "Point",
      coordinates: update.location.coordinates,
    };
  }

  // Optional: normalize budget to Decimal128 like createEvent
  if (update.budget !== undefined) {
    const budgetAmount = parseFloat(update.budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      throw new ApiError(400, "Budget must be a positive number");
    }
    update.budget = mongoose.Types.Decimal128.fromString(budgetAmount.toString());
  }

  Object.assign(event, update);
  await event.save();

  return res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

//11. View Event Details
export const getEventDetails = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findById(eventId).populate("host organizer");

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched"));
});

// 12. View All Host Events
export const getHostEvents = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const events = await Event.find({ host: hostId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Host events fetched"));
});

// 13. Mark Event as Completed
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

// 13.1 Delete Event (soft delete)
export const deleteEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const eventId = req.params.id;

  const event = await Event.findOne({ _id: eventId, host: hostId });
  if (!event) throw new ApiError(404, "Event not found or unauthorized");

  // Only allow deleting completed events per business rule
  if (event.status !== "completed") {
    throw new ApiError(400, "Only completed events can be deleted");
  }

  await event.softDelete();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Event deleted successfully"));
});

// 14 Get all organizers
export const getAllOrganizers = asyncHandler(async (req, res) => {
  const organizers = await User.find({ role: "organizer" }).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizers, "Organizers fetched"));
});

// 15. invite organizer to event
export const inviteOrganizer = asyncHandler(async (req, res) => {
  const orgId = req.params.id;
  const hostId = req.user._id;
  const {eventId, cover_letter, proposed_rate} = req.body;

  const eventDoc = await Event.findOne({ _id: eventId, host: hostId }).select("title host organizer");
  if (!eventDoc) {
    throw new ApiError(404, "Event not found or unauthorized");
  }

  const existing = await EventApplication.findOne({
    event: eventId,
    organizer: orgId,
    application_status: { $in: ["pending", "accepted"] }
  });
  if (existing) {
    return res.status(200).json(new ApiResponse(200, existing, "Application already exists"));
  }

  let eventApplication = await EventApplication.create({
    event: eventId ,
    applicant: orgId,
    organizer: orgId,
    host: hostId,
    sender: hostId,
    receiver: orgId,
    application_status: "pending",
    cover_letter,
    proposed_rate: proposed_rate
      ? mongoose.Types.Decimal128.fromString(proposed_rate.toString())
      : undefined,
  });
  eventApplication.save();

  const hostUser = await User.findById(hostId).select("first_name last_name");
  await Notification.create({
    user: orgId,
    type: "event",
    message: `Host ${hostUser?.fullName || hostUser?.first_name} invited you for ${eventDoc.title}`,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, eventApplication, "Organizer invited to event"));
});
  
// 16. Approve organizer for event by organizer application
export const approveOrganizer = asyncHandler(async (req, res) => {
  const orgAppId = req.params.id;
  const eventApplication = await EventApplication.findById(orgAppId);
  if (!eventApplication) {
    throw new ApiError(404, "Event application not found");
  }
  if (eventApplication.application_status !== "pending") {
    throw new ApiError(400, "Event application is not pending");
  }
  eventApplication.application_status = "accepted";
  await eventApplication.save();

  // Update the Event's organizer field to the accepted applicant
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

  const orgPoolExists = await OrganizerPool.findOne({ organizer: organizerId, event: eventId });
  const organizerUser = await User.findById(organizerId).select("first_name last_name");
  await Notification.create({
    user: organizerId,
    type: "event",
    message: `Your application for ${updatedEvent.title} has been accepted`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { application: eventApplication, organizer_pool_exists: !!orgPoolExists }, "Organizer approved for event"));
});

// 16.1 Reject organizer application
export const rejectOrganizer = asyncHandler(async (req, res) => {
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
  await Notification.create({
    user: eventApplication.applicant,
    type: "event",
    message: `Your application for ${updatedEvent?.title} has been rejected`,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, eventApplication, "Organizer application rejected"));
});

// 17. create organizer pool for event
export const createOrganizerPoolForEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const {
    organizerId,
    eventId,
    pool_name,
    location,
    max_capacity,
    required_skills,
    pay_range,
  } = req.body;

  if (
    !organizerId ||
    !eventId ||
    !pool_name ||
    !location?.coordinates ||
    !max_capacity
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const eventDoc = await Event.findOne({ _id: eventId, host: hostId }).select("organizer title");
  if (!eventDoc) {
    throw new ApiError(404, "Event not found or unauthorized");
  }
  if (eventDoc.organizer?.toString() !== organizerId.toString()) {
    throw new ApiError(400, "Organizer not yet accepted for this event");
  }

  const existingPool = await OrganizerPool.findOne({ organizer: organizerId, event: eventId });
  if (existingPool) {
    return res.status(200).json(new ApiResponse(200, existingPool, "Organizer pool already exists"));
  }

  const pool = await OrganizerPool.create({
    organizer: organizerId,
    event: eventId,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    pool_name,
    max_capacity,
    required_skills,
    pay_range,
    status: "open",
  });

  await Notification.create({
    user: organizerId,
    type: "event",
    message: `Organizer pool created for ${eventDoc.title}`,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, pool, "Organizer invited to event"));
});

// 18. View Assigned Organizers
export const getAssignedOrganizer = asyncHandler(async (req, res) => {
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

// 19. Start In-App Chat with Organizer
export const startChatWithOrganizer = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { organizerId, eventId, poolId} = req.body;

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

  return res
    .status(201)
    .json(new ApiResponse(201, { conversation }, "Chat ready"));
});

// 19.1 List Host Conversations
export const getHostConversations = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const conversations = await Conversation.find({
    participants: hostId,
  })
    .populate("event", "title start_date end_date location")
    .populate("pool", "pool_name status")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, conversations, "Conversations fetched"));
});

// 19.2 Get messages in a conversation
export const getConversationMessages = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.some((p) => p.toString() === hostId.toString())) {
    throw new ApiError(403, "Access denied to this conversation");
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "email role")
    .sort({ createdAt: 1 });

  return res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

// 19.3 Send message in a conversation (Host)
export const sendHostMessage = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { conversationId } = req.params;
  const { message_text } = req.body;

  if (!message_text || !message_text.trim()) {
    throw new ApiError(400, "message_text is required");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.some((p) => p.toString() === hostId.toString())) {
    throw new ApiError(403, "Access denied to this conversation");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: hostId,
    message_text,
  });

  return res.status(201).json(new ApiResponse(201, message, "Message sent"));
});

// 20.  Host Dashboard
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

// 20.1 Get Invited/Requested Organizers status for host events
export const getInvitedOrganizerStatus = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const events = await Event.find({ host: hostId }).select("_id title organizer");
  const eventIds = events.map((e) => e._id);

  const applications = await EventApplication.find({ event: { $in: eventIds } })
    .populate("applicant", "email role first_name last_name avatar")
    .populate("event", "title organizer event_type")
    .sort({ createdAt: -1 });

  const requested = applications.filter(a => a.application_status === "pending" && a.sender?.toString() !== hostId.toString());
  const invited = applications.filter(a => a.application_status === "pending" && a.sender?.toString() === hostId.toString());
  const accepted = applications.filter(a => a.application_status === "accepted");
  const rejected = applications.filter(a => a.application_status === "rejected");

  const acceptedWithFlags = await Promise.all(accepted.map(async (a) => {
    const exists = await OrganizerPool.findOne({ organizer: a.organizer, event: a.event._id });
    return { ...a.toObject(), organizer_pool_exists: !!exists };
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { requested, invited, accepted: acceptedWithFlags, rejected }, "Invited organizers status fetched"));
});

export const deleteHostApplication = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { id } = req.params;
  const app = await EventApplication.findById(id);
  if (!app) throw new ApiError(404, "Application not found");
  const events = await Event.find({ host: hostId }).select("_id");
  const eventIds = events.map(e => e._id.toString());
  if (!eventIds.includes(app.event?.toString())) {
    throw new ApiError(403, "Not authorized to delete this application");
  }
  if (!["accepted", "rejected"].includes(app.application_status)) {
    throw new ApiError(400, "Only accepted or rejected applications can be deleted");
  }
  await EventApplication.findByIdAndDelete(id);
  return res.status(200).json(new ApiResponse(200, null, "Application deleted"));
});

export const getHostNotifications = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const notifications = await Notification.find({ user: hostId }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

export const markHostNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
  if (!updated) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
  }
  return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});

export const getOrganizerPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("first_name last_name email phone role avatar isVerified");
  if (!user || user.role !== "organizer") {
    throw new ApiError(404, "Organizer not found");
  }
  const kyc = await KYCVerification.findOne({ user: user._id }).select("aadhaar_verified aadhaar_number status verified_at");
  const aadhaar_last4 = kyc?.aadhaar_number ? kyc.aadhaar_number.slice(-4) : null;
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        kyc: {
          aadhaar_verified: !!kyc?.aadhaar_verified,
          aadhaar_last4,
          status: kyc?.status || "pending",
          verified_at: kyc?.verified_at || null,
        },
      },
      "Organizer profile"
    )
  );
});

// 21. Deposit to Escrow
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
    status: "completed",
  });

  const eventDoc = await Event.findById(eventId).select("title");
  await Notification.create({
    user: organizerId,
    type: "payment",
    message: `Escrow funded for ${eventDoc?.title || "event"}`,
  });
  await Notification.create({
    user: hostId,
    type: "payment",
    message: `Escrow funded for ${eventDoc?.title || "event"}`,
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

// 22.  View Escrow Status
export const getEscrowStatus = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId } = req.params;

  const escrow = await EscrowContract.findOne({
    event: eventId,
    host: hostId,
  }).populate("organizer");

  if (!escrow)
    throw new ApiError(404, "No escrow contract found for this event");

  return res
    .status(200)
    .json(new ApiResponse(200, escrow, "Escrow status fetched"));
});

// 23. Verify Attendance
export const verifyAttendance = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId } = req.params;

  const escrow = await EscrowContract.findOne({ event: eventId, host: hostId });

  if (!escrow) throw new ApiError(404, "Escrow contract not found");
  if (escrow.status === "released")
    throw new ApiError(400, "Escrow already released");

  escrow.status = "released";
  await escrow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, escrow, "Attendance verified, escrow released"));
});

// 24. Create Feedback
export const createFeedback = asyncHandler(async (req, res) => {
  const hostId = req.user._id; // logged-in host
  const { eventId, gigId, feedback_text, rating } = req.body;

  if (!eventId || !gigId || !feedback_text) {
    throw new ApiError(400, "Missing required feedback fields");
  }

  const feedback = await Feedback.create({
    event: eventId,
    gig: gigId,
    host: hostId,
    comment: feedback_text,
    rating,
  });

  return res.status(201).json(new ApiResponse(201, feedback, "Feedback submitted"));
});

// 25.  Event Reviews
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

//  26. Leaderboard
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




