import React from "react";
import { MdCreate, MdDelete, MdOutlinePushPin } from "react-icons/md";

const QuoteListCard = ({
  title,
  date,
  quotes,
  tags,
  isPinned,
  onPinList,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="border p-4 rounded-lg shadow-md bg-white relative hover:shadow-lg hover:border-violet-800 flex flex-col justify-between h-full"
      style={{ backgroundColor: "var(--secondary-bg-color)" }}
    >
      <MdOutlinePushPin
        className={`absolute top-2 right-2 cursor-pointer text-2xl transition-colors duration-200 icon-btn ${
          isPinned ? "text-[#2B85FF]" : "text-slate-300 hover:text-gray-500"
        }`}
        onClick={() => onPinList(!isPinned)}
      />

      <div>
        <h2 className="text-xl font-bold text-[var(--text-color)]">{title}</h2>
        <p className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString()}
        </p>

        <div className="mt-2">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tags</p>
          )}
        </div>

        <div className="mt-2 max-h-[80px] overflow-y-hidden">
          {quotes.length > 0 ? (
            <ul className="list-disc list-inside text-[var(--text-color)]">
              {quotes.map((item, index) => (
                <li key={index}>
                  "{item.quote}" -{" "}
                  <span className="font-medium">{item.origin}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No quotes available</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-3 justify-between">
        <button
          onClick={onEdit}
          className="btn-primary w-auto text-sm flex items-center gap-2 px-4 py-2"
        >
          <MdCreate className="icon-btn" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="btn-secondary w-auto text-sm flex items-center gap-2 px-4 py-2"
        >
          <MdDelete className="icon-btn" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default QuoteListCard;
