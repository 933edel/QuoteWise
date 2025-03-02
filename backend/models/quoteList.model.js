import mongoose from "mongoose";

const QuoteSchema = new mongoose.Schema({
  quote: { type: String, required: true },
  origin: { type: String, required: true },
});

const QuoteListSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tags: { type: [String], default: [] },
    quotes: { type: [QuoteSchema], default: [] },
    isPinned: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

export default mongoose.model("QuoteList", QuoteListSchema);
