import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
// import mongoSanitize from "express-mongo-sanitize";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to mongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(helmet()); //secure HTTP headers
// app.use(mongoSanitize()); // Prevents NoSQL injection

// to make input as json
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

//cron job
import "./utils/cronJob.js";

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// import routes
import authRouter from "./routes/auth.route.js";
import quoteRouter from "./routes/quote.route.js";

app.use("/api/auth", authRouter);
app.use("/api/quotes", quoteRouter);

// error handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Serer Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
