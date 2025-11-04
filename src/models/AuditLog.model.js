import { mongoose, Schema } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    target: {
      type: Schema.Types.ObjectId,
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;