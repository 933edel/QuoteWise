import QuoteList from "../models/quoteList.model.js";
import { errorHandler } from "../utils/error.js";
import dotenv from "dotenv";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "",
});

const generationConfig = {
  temperature: 0.3,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

//limits
const MAX_QUOTELISTS = 100;
const MAX_QUOTES = 100;
const MAX_TAGS = 10;

//add list
export const addQuoteList = async (req, res, next) => {
  const { title, tags, quotes } = req.body;
  const userId = req.user.id;

  if (!title) {
    return next(errorHandler(400, "Title is required"));
  }

  if (tags && tags.length > MAX_TAGS) {
    return next(
      errorHandler(400, `A quote list can have a maximum of ${MAX_TAGS} tags.`)
    );
  }

  if (quotes && quotes.length > MAX_QUOTES) {
    return next(
      errorHandler(
        400,
        `A quote list can have a maximum of ${MAX_QUOTES} quotes.`
      )
    );
  }

  try {
    const userQuoteListsCount = await QuoteList.countDocuments({ userId });

    if (userQuoteListsCount >= MAX_QUOTELISTS) {
      return next(
        errorHandler(
          400,
          `You can only create up to ${MAX_QUOTELISTS} quote lists.`
        )
      );
    }

    const newList = new QuoteList({
      title,
      tags: tags || [],
      quotes: quotes || [],
      userId,
    });

    await newList.save();

    res.status(201).json({
      success: true,
      message: "Quote list created successfully",
      list: newList,
    });
  } catch (error) {
    next(error);
  }
};

//generate quotes
export const generateQuotesFromTags = async (req, res, next) => {
  const { tags } = req.body;

  if (!tags || tags.length === 0) {
    return next(errorHandler(400, "Tags are required to generate quotes"));
  }

  try {
    const prompt = `Generate 3 inspirational, motivational quotes based on the following themes: ${tags.join(
      ", "
    )}. Format the output as an array of objects with 'quote' and 'origin' fields.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const responseText = result.response.text();
    const parsedQuotes = JSON.parse(responseText);

    if (!Array.isArray(parsedQuotes)) {
      return next(errorHandler(500, "Unexpected response format from AI"));
    }

    res.status(200).json({
      success: true,
      quotes: parsedQuotes,
    });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "Error generating quotes"));
  }
};

//edit
export const editQuoteList = async (req, res, next) => {
  const { listId } = req.params;
  const { title, tags, quotes } = req.body;

  try {
    const quoteList = await QuoteList.findById(listId);

    if (!quoteList) {
      return next(errorHandler(404, "Quote list not found"));
    }

    if (req.user.id !== quoteList.userId.toString()) {
      return next(errorHandler(401, "You can only modify your own lists"));
    }

    if (tags && tags.length > MAX_TAGS) {
      return next(
        errorHandler(
          400,
          `A quote list can have a maximum of ${MAX_TAGS} tags.`
        )
      );
    }

    if (quotes && quotes.length > MAX_QUOTES) {
      return next(
        errorHandler(
          400,
          `A quote list can have a maximum of ${MAX_QUOTES} quotes.`
        )
      );
    }

    if (title) quoteList.title = title;
    if (tags) quoteList.tags = tags;
    if (quotes) quoteList.quotes = quotes;

    await quoteList.save();

    res.status(200).json({
      success: true,
      message: "Quote list updated successfully",
      list: quoteList,
    });
  } catch (error) {
    next(error);
  }
};

//update list pin status
export const updateQuoteListPinned = async (req, res, next) => {
  try {
    const { listId } = req.params;

    const quoteList = await QuoteList.findById(listId);

    if (!quoteList) {
      return next(errorHandler(404, "Quote list not found!"));
    }

    if (req.user.id !== quoteList.userId.toString()) {
      return next(errorHandler(401, "You can only update your own list!"));
    }

    const { isPinned } = req.body;

    quoteList.isPinned = isPinned;

    await quoteList.save();

    res.status(200).json({
      success: true,
      message: "Quote list updated successfully",
      quoteList,
    });
  } catch (error) {
    next(error);
  }
};

//retrieve all lists
export const getAllQuoteLists = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; //
    const skip = (page - 1) * limit;

    const total = await QuoteList.countDocuments({ userId: req.user.id });

    // Fetch paginated quoteLists
    const quoteLists = await QuoteList.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Paginated quote lists retrieved successfully",
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalLists: total,
      lists: quoteLists,
    });
  } catch (error) {
    next(error);
  }
};

//delete quote list
export const deleteQuoteList = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedQuoteList = await QuoteList.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deletedQuoteList) {
      return res.status(404).json({
        success: false,
        message: "Quote list not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quote list deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

//add quote to list
export const addQuoteToList = async (req, res, next) => {
  const { listId } = req.params;
  const { quote, origin } = req.body;

  if (!quote || !origin) {
    return next(errorHandler(400, "Both quote and origin are required"));
  }

  try {
    const quoteList = await QuoteList.findById(listId);

    if (!quoteList) {
      return next(errorHandler(404, "Quote list not found"));
    }

    if (req.user.id !== quoteList.userId) {
      return next(errorHandler(401, "You can only modify your own lists"));
    }

    quoteList.quotes.push({ quote, origin });
    await quoteList.save();

    res.status(200).json({
      success: true,
      message: "Quote added successfully",
      list: quoteList,
    });
  } catch (error) {
    next(error);
  }
};

//delete quote from list
export const deleteQuoteFromList = async (req, res, next) => {
  const { listId, quoteId } = req.params;

  try {
    const quoteList = await QuoteList.findById(listId);

    if (!quoteList) {
      return next(errorHandler(404, "Quote list not found"));
    }

    if (req.user.id !== quoteList.userId) {
      return next(errorHandler(401, "You can only modify your own lists"));
    }

    quoteList.quotes = quoteList.quotes.filter(
      (quote) => quote._id.toString() !== quoteId
    );
    await quoteList.save();

    res.status(200).json({
      success: true,
      message: "Quote deleted successfully",
      list: quoteList,
    });
  } catch (error) {
    next(error);
  }
};

//search in quote lists
export const searchLists = async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(errorHandler(400, "Search query is required"));
  }

  try {
    // Find quote lists where the quotes array contains quotes or origins matching the search query
    const matchingLists = await QuoteList.find({
      userId: req.user.id,
      quotes: {
        $elemMatch: {
          $or: [
            { quote: { $regex: new RegExp(query, "i") } }, // Case-insensitive search in quote text
            { origin: { $regex: new RegExp(query, "i") } }, // Case-insensitive search in origin
          ],
        },
      },
    }).select("title createdAt userId tags quotes");

    if (matchingLists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No quote lists found matching the search query",
      });
    }

    res.status(200).json({
      success: true,
      message: "Quote lists matching the search query retrieved successfully",
      lists: matchingLists,
    });
  } catch (error) {
    next(error);
  }
};
