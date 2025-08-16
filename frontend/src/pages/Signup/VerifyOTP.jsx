import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFailure,
  resendOtpStart,
  resendOtpSuccess,
  resendOtpFailure,
} from "../../redux/user/userSlice";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser, otpVerified, otpToken, loading, errorDispatch } =
    useSelector((state) => state.user);

  // Redirect users if verification data is missing
  useEffect(() => {
    if (!otpVerified && (!currentUser?.email || !otpToken)) {
      toast.error("Invalid access. Please sign up again.");
      navigate("/signup");
    }
  }, [currentUser, otpToken, otpVerified, navigate]);

  // Handle countdown for resend OTP button
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(
        () => setResendTimer((prev) => prev - 1),
        1000
      );
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Show error message if OTP verification fails
  useEffect(() => {
    if (errorDispatch && !otpVerified) {
      toast.error(errorDispatch);
    }
  }, [errorDispatch, otpVerified]);

  // Handle OTP submission
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp.trim()) return toast.error("Please enter OTP.");
    if (!currentUser?.email || !otpToken)
      return toast.error("Missing verification data.");

    dispatch(verifyOtpStart());

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          email: currentUser.email,
          otp,
          otpToken,
        }
      );

      if (res.data.success) {
        dispatch(verifyOtpSuccess(res.data));
        toast.success("Account verified successfully! Redirecting...");
        navigate("/login");
        return;
      }

      throw new Error(res.data.message || "Unexpected error");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "OTP verification failed (no response).";

      dispatch(verifyOtpFailure(message));
      toast.error(message);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0) return;

    dispatch(resendOtpStart());

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
        {
          email: currentUser.email,
        }
      );

      if (res.data.success) {
        dispatch(resendOtpSuccess(res.data.otpToken));
        toast.success("New OTP sent to your email.");
        setResendTimer(30);
      } else {
        throw new Error(res.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP.";
      dispatch(resendOtpFailure(message));
      toast.error(message);
    }
  }, [currentUser?.email, resendTimer, dispatch]);

  return (
    <div className="flex items-center justify-center mt-28">
      <div className="w-96 border rounded bg-white px-7 py-10">
        <h4 className="text-2xl mb-4">Verify OTP</h4>
        <p className="text-gray-600 text-sm mb-4">
          Enter the OTP sent to <b>{currentUser?.email}</b>.
        </p>

        <form onSubmit={handleVerifyOTP}>
          <input
            type="text"
            placeholder="Enter OTP"
            className="input-box"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          onClick={handleResendOTP}
          className="btn-secondary mt-3"
          disabled={resendTimer > 0}
        >
          {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
