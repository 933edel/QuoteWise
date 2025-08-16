import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import validator from "validator";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -------------------- SIGNUP --------------------
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return next(errorHandler(400, "All fields are required"));
    }

    if (!validator.isEmail(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    if (password.length < 6) {
      return next(errorHandler(400, "Password must be at least 6 characters"));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "User with this email already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpToken = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`,
    });

    const newUser = new User({
      username: validator.escape(username.trim()),
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({
      success: true,
      message: "OTP sent to email. Verify your account.",
      otpToken,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------- VERIFY OTP --------------------
export const verifyOtp = async (req, res, next) => {
  const { email, otp, otpToken } = req.body;

  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

    if (!decoded || decoded.email !== email || decoded.otp !== Number(otp)) {
      return next(errorHandler(400, "Invalid or expired OTP"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    user.verified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        errorHandler(400, "OTP has expired. Please request a new one.")
      );
    }
    next(errorHandler(400, "OTP verification failed"));
  }
};

// -------------------- RESEND OTP --------------------
export const resendOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!validator.isEmail(email)) {
    return next(errorHandler(400, "Invalid email format"));
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpToken = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend OTP - Email Verification",
      text: `Your new OTP code is: ${otp}. It is valid for 5 minutes.`,
    });

    res
      .status(200)
      .json({ success: true, message: "New OTP sent to email", otpToken });
  } catch (error) {
    next(errorHandler(500, "Error resending OTP"));
  }
};

// -------------------- SIGNIN --------------------
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "All fields are required"));
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (!user.verified) {
      return next(errorHandler(401, "Please verify your email address."));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(errorHandler(401, "Wrong credentials"));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      })
      .status(200)
      .json({
        success: true,
        message: "Login Successful!",
        user: userWithoutPassword,
      });
  } catch (error) {
    next(error);
  }
};

// -------------------- SIGNOUT --------------------
export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    res.status(200).json({ success: true, message: "Log out successful" });
  } catch (error) {
    next(error);
  }
};
