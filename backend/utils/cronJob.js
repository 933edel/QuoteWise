import cron from "node-cron";
import sendEmail from "./sendEmails.js";
import QuoteList from "../models/quoteList.model.js";
import User from "../models/user.model.js";

const getRandomPinnedQuotes = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      console.log(`Checking user: ${user.email}`);

      const pinnedLists = await QuoteList.find({
        userId: user._id,
        isPinned: true,
      });

      console.log(`User ${user.email} has ${pinnedLists.length} pinned lists`);

      if (pinnedLists.length === 0) continue; // if no lists are pinned, skip

      let selectedQuotes = pinnedLists.map((list) => {
        const randomIndex = Math.floor(Math.random() * list.quotes.length);
        return list.quotes[randomIndex];
      });

      const emailContent = selectedQuotes
        .map(
          (item, index) =>
            `${index + 1}. "${item.quote}"\n   - ${item.origin || "Unknown"}`
        )
        .join("\n\n");

      await sendEmail(
        user.email,
        "Your Daily Quotes",
        `Here are your quotes for today:\n\n${emailContent}`
      );
    }

    console.log("Emails sent successfully.");
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
};

// Schedule the job to run at 10 AM every day
cron.schedule(
  "0 10 * * *",
  async () => {
    await getRandomPinnedQuotes();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

export { getRandomPinnedQuotes };
