import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  addQuoteList,
  editQuoteList,
  generateQuotesFromTags,
  getAllQuoteLists,
  deleteQuoteList,
  addQuoteToList,
  deleteQuoteFromList,
  updateQuoteListPinned,
  searchLists,
} from "../controller/quote.controller.js";
import { generalLimiter } from "../utils/rateLimiter.js";

const router = express.Router();

router.use(generalLimiter);

// Create a new quote list
router.post("/add", verifyToken, addQuoteList);

// Generate quotes from tags
router.post("/generate", verifyToken, generateQuotesFromTags);

// Edit an existing quote list
router.put("/edit/:listId", verifyToken, editQuoteList);

// Get all quote lists for the logged-in user
router.get("/all", verifyToken, getAllQuoteLists);

// Update a quote list's pinned status
router.put("/update-quote-pinned/:listId", verifyToken, updateQuoteListPinned);

// Delete a quote list
router.delete("/delete/:id", verifyToken, deleteQuoteList);

// Add a quote to a specific list
router.post("/:listId/add-quote", verifyToken, addQuoteToList);

// Delete an individual quote from a list
router.delete(
  "/:listId/delete-quote/:quoteId",
  verifyToken,
  deleteQuoteFromList
);

// Search quotes across lists
router.get("/search", verifyToken, searchLists);

export default router;
