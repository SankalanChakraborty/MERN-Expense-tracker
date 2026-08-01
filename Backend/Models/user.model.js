import mongoose from "mongoose";
import { SUPPORTED_CURRENCIES } from "../enum.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      enum: SUPPORTED_CURRENCIES,
      default: "INR",
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
