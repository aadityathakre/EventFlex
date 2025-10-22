import { mongoose, Schema } from "mongoose";
import Conversation from "./Conversation.model.js";
import User from "./User.model.js";

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message_text: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;