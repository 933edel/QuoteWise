import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import TagInput from "../../components/Input/TagInput ";
import axios from "axios";
import { toast } from "react-toastify";
import { FaWandSparkles } from "react-icons/fa6";

const AddEditQuote = ({ onClose, quoteListData, type, getAllQuoteLists }) => {
  const [title, setTitle] = useState("");
  const [quotes, setQuotes] = useState([{ quote: "", origin: "" }]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (quoteListData) {
      setTitle(quoteListData.title || "");
      setQuotes(quoteListData.quotes || [{ quote: "", origin: "" }]);
      setTags(quoteListData.tags || []);
    }
  }, [quoteListData]);

  const handleChange = (index, field, value) => {
    setQuotes((prevQuotes) =>
      prevQuotes.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const addQuoteField = () => {
    setQuotes([...quotes, { quote: "", origin: "" }]);
  };

  const removeQuoteField = (index) => {
    setQuotes((prevQuotes) => prevQuotes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (quotes.some((q) => !q.quote.trim() || !q.origin.trim())) {
      setError("Each quote must have both a quote and an origin.");
      return;
    }

    const payload = { title, quotes, tags };

    try {
      let res;

      if (type === "edit") {
        if (!quoteListData || !quoteListData._id) {
          setError("Quote list data is missing.");
          return;
        }

        res = await axios.put(
          `http://localhost:3000/api/quotes/edit/${quoteListData._id}`,
          payload,
          { withCredentials: true }
        );
      } else {
        res = await axios.post(
          "http://localhost:3000/api/quotes/add",
          payload,
          { withCredentials: true }
        );
      }

      if (!res.data?.success) {
        throw new Error(res.data.message);
      }

      toast.success(res.data.message);
      onClose();
    } catch (error) {
      if (axios.isCancel(error)) return;

      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const addAIQuotes = async () => {
    if (tags.length === 0) {
      setError("Please add at least one tag to get AI-generated quotes.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/quotes/generate",
        { tags },
        { withCredentials: true }
      );

      if (!res.data?.success) {
        throw new Error(res.data.message);
      }

      setQuotes((prevQuotes) => [
        ...prevQuotes,
        ...res.data.quotes.map((q) => ({ quote: q.quote, origin: q.origin })),
      ]);

      toast.success("AI-generated quotes added successfully!");
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch AI quotes.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="relative p-6 bg-white shadow-md rounded-lg w-[700px]">
      <button
        className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full icon-btn"
        onClick={onClose}
      >
        <MdClose />
      </button>

      <div>
        <label className="input-label text-xs">Title</label>
        <input
          type="text"
          className="input-box bg-transparent "
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="input-label text-xs">Quotes</label>
        <div className="space-y-3 max-h-[220px] overflow-y-auto">
          {quotes.map((q, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <input
                type="text"
                placeholder="Quote"
                className="input-box w-full"
                value={q.quote}
                onChange={(e) => handleChange(index, "quote", e.target.value)}
              />
              <div className="flex justify-end items-center gap-2">
                <input
                  type="text"
                  placeholder="Origin"
                  className="input-box w-1/3"
                  value={q.origin}
                  onChange={(e) =>
                    handleChange(index, "origin", e.target.value)
                  }
                />
                {quotes.length > 1 && (
                  <button
                    className="p-2 bg-red-600 text-white rounded hover:bg-red-400"
                    onClick={() => removeQuoteField(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            className="mt-2 p-2 border rounded-md border-blue-700 hover:bg-purple-700 hover:text-white flex items-center gap-2"
            onClick={addQuoteField}
          >
            + Add Quote
          </button>
          <button
            className="mt-2 p-2 border rounded-md border-zinc-700 hover:bg-gray-800 hover:text-white flex items-center gap-2"
            onClick={addAIQuotes}
          >
            <FaWandSparkles />
            AI Suggest
          </button>
        </div>
      </div>

      <div>
        <label className="input-label text-xs">Tags</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      <button className="btn-primary" onClick={handleSave}>
        {type === "edit" ? "Update" : "Add"} Quote List
      </button>
    </div>
  );
};

export default AddEditQuote;
