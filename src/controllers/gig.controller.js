import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import EventAttendance from "../models/EventAttendance.model.js";
import Event from "../models/Event.model.js";

// 1. View accepted events
const getMyEvents = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const events = await Event.find({ gigs: gigId }).select("-__v");
  if (!events || events.length === 0) {
    throw new ApiError(404, "No accepted events found");
  }

  return res.status(200).json(new ApiResponse(200, events, "Accepted events fetched"));
});

// 2. QR/GPS check-in
const checkIn = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const alreadyCheckedIn = await EventAttendance.findOne({ gig: gigId, event: eventId });
  if (alreadyCheckedIn) {
    throw new ApiError(409, "Already checked in");
  }

  const attendance = await EventAttendance.create({
    gig: gigId,
    event: eventId,
    check_in_time: new Date(),
    status: "checked_in",
  });

  return res.status(201).json(new ApiResponse(201, attendance, "Check-in successful"));
});

// 3. View attendance history
const getAttendanceHistory = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const history = await EventAttendance.find({ gig: gigId })
    .populate("event", "name date location")
    .select("-__v");

  if (!history || history.length === 0) {
    throw new ApiError(404, "No attendance history found");
  }

  return res.status(200).json(new ApiResponse(200, history, "Attendance history fetched"));
});

export { getMyEvents, checkIn, getAttendanceHistory };