import { mongoose, Schema } from "mongoose";
import OrganizerPool from "./OrganizerPool.model.js";
import Event from "./Event.model.js";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    pool: {
      type: Schema.Types.ObjectId,
      ref: "OrganizerPool",
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;