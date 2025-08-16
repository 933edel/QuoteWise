import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must not exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // 🛡️ Prevents password from being fetched
    },
    verified: {
      type: Boolean,
      default: false,
    },
    // CHANGED: Add OTP token and expiration for email verification
    otpToken: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // 🛡️ Prevents modification after creation
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
