import rateLimit from "express-rate-limit";

// Login rate limiter
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Signup rate limiter
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signups
  message: "Too many signup attempts. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiter )
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 requests
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
