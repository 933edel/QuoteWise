import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.log(err));

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- MIDDLEWARE --------------------
app.use(helmet()); // Secure HTTP headers
// app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies

// CORS configuration for Vercel frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // allow only your frontend
    credentials: true, // allow cookies
  })
);

// -------------------- ROUTES --------------------
import authRouter from "./routes/auth.route.js";
import quoteRouter from "./routes/quote.route.js";

app.use("/api/auth", authRouter);
app.use("/api/quotes", quoteRouter);

// -------------------- CRON JOB --------------------
import "./utils/cronJob.js";

// -------------------- ERROR HANDLING --------------------
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
