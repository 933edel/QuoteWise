import express from "express";
import {
  signin,
  signout,
  signup,
  verifyOtp,
  resendOtp,
} from "../controller/auth.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { loginLimiter, signupLimiter } from "../utils/rateLimiter.js"; // Import rate limiters

const router = express.Router();

//signup route
router.post("/signup", signupLimiter, signup);

//otp routes
router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendOtp);

//signin route
router.post("/signin", loginLimiter, signin);

//signout route
router.get("/signout", verifyToken, signout);

export default router;
