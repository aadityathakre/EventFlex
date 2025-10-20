import mongoose,  { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_action_type: {
      type: String,
      trim: true,
    },
    last_action_at: {
      type: Date,
    },
    admin_notes: {
      type: String,
      trim: true,
    },
    refreshToken:{
      type: String,
      default: null, 
      
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

AdminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


AdminSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id, email:this.email, password:this.password }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

AdminSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
