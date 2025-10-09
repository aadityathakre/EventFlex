import { mongoose, Schema } from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    skill_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["hospitality", "security", "creative"],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Skill = mongoose.model("Skill", SkillSchema);
export default Skill;