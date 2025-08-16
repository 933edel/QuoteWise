import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import {
  signoutSuccess,
  signoutFailure,
  signoutStart,
} from "../redux/user/userSlice";
import SearchBar from "./SearchBar/SearchBar";
import ProfileInfo from "./Cards/ProfileInfo";
import ThemeSwitcher from "./ThemeSwitcher";

const Navbar = ({ userInfo, onSearchQuote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSearch = () => {
    if (searchQuery) onSearchQuote(searchQuery);
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  const onLogout = async () => {
    try {
      dispatch(signoutStart());

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/signout`,
        {
          withCredentials: true,
        }
      );

      if (!res.data.success) {
        dispatch(signoutFailure(res.data.message));
        toast.error(res.data.message);
        return;
      }

      toast.success(res.data.message);
      dispatch(signoutSuccess());
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
      dispatch(signoutFailure(error.message));
    }
  };

  return (
    <nav className="bg-slate-200 shadow-md px-4 py-3 flex items-center justify-between flex-wrap">
      <Link to={"/"} className="text-2xl font-semibold text-gray-900">
        <span className="text-slate-500">Quote</span>
        <span className="text-slate-900">Wise</span>
      </Link>

      <div className="flex-1 mx-4">
        <SearchBar
          value={searchQuery}
          onChange={({ target }) => setSearchQuery(target.value)}
          handleSearch={handleSearch}
          onClearSearch={onClearSearch}
        />
      </div>

      <div className="flex items-center gap-4 p-2 rounded-md">
        <ThemeSwitcher />
        <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
      </div>
    </nav>
  );
};

export default Navbar;
