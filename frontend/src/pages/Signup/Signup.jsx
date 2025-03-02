import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  signUpStart,
  signUpSuccess,
  signUpFailure,
} from "../../redux/user/userSlice";
import PasswordInput from "../../components/Input/PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axios from "axios";
import { toast } from "react-toastify";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return toast.error("All fields are required");
    }

    dispatch(signUpStart());

    try {
      const res = await axios.post("http://localhost:3000/api/auth/signup", {
        username: name,
        email,
        password, // Password sent, but will NOT be stored in client state
      });

      if (res.data.success) {
        dispatch(
          signUpSuccess({
            otpToken: res.data.otpToken,
            email,
            username: name,
          })
        );

        toast.success("OTP sent! Verify your email.");
        navigate("/verify-otp");
      } else {
        dispatch(signUpFailure(res.data.message));
        toast.error(res.data.message);
      }
    } catch (error) {
      dispatch(
        signUpFailure(error.response?.data?.message || "Signup failed.")
      );
      toast.error(error.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <form onSubmit={handleSignUp}>
          <h4 className="text-2xl mb-7">Sign Up</h4>

          <input
            type="text"
            placeholder="Name"
            className="input-box"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm pb-1">{error}</p>}

          <button type="submit" className="btn-primary">
            SIGN UP
          </button>

          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link
              to={"/login"}
              className="font-medium text-[#2B85FF] underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
