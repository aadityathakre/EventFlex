import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";
import Skill from "./Skill.model.js";

const UserSkillSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
      index: true,
    },
    proficiency_level: {
      type: String,
      enum: ["beginner", "expert"],
      required: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const UserSkill = mongoose.model("UserSkill", UserSkillSchema);
export default UserSkill;