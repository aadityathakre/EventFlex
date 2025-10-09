import { mongoose, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index:true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index:true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 8,
      maxLength: 18,
    },

    role: {
      type: String,
      enum: ["gig", "organizer", "host"],
      required: true,
      trim: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    wallet_address: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },

    universal_gig_id: {
      type: String,
      required: [true, "GIG ID is required"],
      minLength: 8,
      maxLength: 18,
    },

    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
