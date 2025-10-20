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
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      unique: true,
      required: [true, "Password is required"],
      minLength: 4,
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
    wallet: {
      address: { type: String },
      privateKey: { type: String, select: false },
      createdAt: { type: Date },
    },

    avatar: {
      type: String,
      required: true,
    },

    universal_role_id: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 18,
    },

    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },

    kycVideo: {
      url: { type: String },
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },

      wellnessScore: { type: Number, default: 100 },

      noShowRisk: { type: Number, default: 0 },

      uploadedAt: { type: Date },
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
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

UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const User = mongoose.model("User", UserSchema);
export default User;
