import React, { useEffect, useState } from "react";
import QuoteListCard from "../../components/Cards/QuoteListCard";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import AddEditQuote from "./AddEditQuote";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";

Modal.setAppElement("#root");

const Home = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState(null);
  const [allQuotes, setAllQuotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUserInfo(currentUser.user);
      getAllQuotes(currentPage);
    }
  }, [currentUser, currentPage]); // ✅ Re-fetch when page changes

  const getAllQuotes = async (page) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/quotes/all?page=${page}`,
        { withCredentials: true }
      );

      if (!res.data.success) {
        toast.error("Failed to fetch quotes.");
        return;
      }

      setAllQuotes(res.data.lists);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch quotes.");
      console.error(error);
    }
  };

  const handleEdit = (quoteList) => {
    setOpenAddEditModal({
      isShown: true,
      data: quoteList,
      type: "edit",
    });
  };

  const deleteQuote = async (quoteId) => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/quotes/delete/${quoteId}`,
        { withCredentials: true }
      );

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      getAllQuotes(currentPage); // ✅ Fetch only current page
    } catch (error) {
      toast.error("Failed to delete quote list");
      console.error(error);
    }
  };

  const onSearchQuote = async (query) => {
    try {
      const res = await axios.get("http://localhost:3000/api/quotes/search", {
        params: { query },
        withCredentials: true,
      });

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      setIsSearch(true);
      setAllQuotes(res.data.lists);
      setTotalPages(1);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllQuotes(1);
  };

  const closeModal = () => {
    setOpenAddEditModal({ isShown: false, type: "add", data: null });
    getAllQuotes(currentPage);
  };

  const updateIsPinned = async (quoteList) => {
    const listId = quoteList._id;

    try {
      const res = await axios.put(
        `http://localhost:3000/api/quotes/update-quote-pinned/${listId}`,
        { isPinned: !quoteList.isPinned },
        { withCredentials: true }
      );

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      getAllQuotes(currentPage);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchQuote={onSearchQuote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto mt-8 px-4 flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1">
          {allQuotes && allQuotes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8 max-md:m-5">
              {allQuotes.map((quote) => (
                <QuoteListCard
                  key={quote._id}
                  title={quote.title}
                  date={quote.createdAt}
                  tags={quote.tags}
                  isPinned={quote.isPinned}
                  onPinList={() => updateIsPinned(quote)}
                  quotes={quote.quotes}
                  onEdit={() => handleEdit(quote)}
                  onDelete={() => deleteQuote(quote._id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-16">
              <img
                src={isSearch ? "/images/9264822.jpg" : "/images/9264828.jpg"}
                alt="No Quotes"
                className="w-80 h-auto"
              />
              <p className="text-md font-medium text-gray-500 mt-4">
                {isSearch
                  ? "Oops! No Quotes found matching your search"
                  : "Build your own epic quote lists! Pin your favorites, and we'll surprise you with a daily dose of inspiration—delivered straight to your inbox!"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-3">
            <button
              className="btn-primary w-20 px-1 py-2 text-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="btn-primary w-20 px-1 py-2 text-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        className="btn-primary w-16 h-16 flex items-center justify-center rounded-2xl fixed right-10 bottom-10"
        onClick={() =>
          setOpenAddEditModal({ isShown: true, type: "add", data: null })
        }
      >
        <MdAdd className="text-3xl" />
      </button>

      {/* Modal */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={closeModal}
        style={{ overlay: { backgroundColor: "rgba(0,0,0,0.2)" } }}
        className="w-[50%] max-md:w-[70%] max-sm:w-[70%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditQuote
          onClose={closeModal}
          quoteListData={openAddEditModal.data}
          type={openAddEditModal.type}
          getAllQuotes={() => getAllQuotes(currentPage)}
        />
      </Modal>
    </>
  );
};

export default Home;
