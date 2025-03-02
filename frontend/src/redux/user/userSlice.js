import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  errorDispatch: null,
  loading: false,
  otpToken: null,
  otpSent: false,
  otpVerified: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signUpStart: (state) => {
      state.loading = true;
    },

    signUpSuccess: (state, action) => {
      state.loading = false;
      state.otpSent = true;
      state.otpToken = action.payload.otpToken;
      state.currentUser = {
        email: action.payload.email,
        username: action.payload.username,
      };
      state.errorDispatch = null;
    },

    signUpFailure: (state, action) => {
      state.loading = false;
      state.errorDispatch = action.payload;
    },

    verifyOtpStart: (state) => {
      state.loading = true;
      state.errorDispatch = null;
    },

    verifyOtpSuccess: (state, action) => {
      state.loading = false;
      state.otpVerified = true;
      state.currentUser = action.payload.user;
      state.otpToken = null;
      state.errorDispatch = null;
    },

    verifyOtpFailure: (state, action) => {
      state.loading = false;
      state.otpVerified = false;
      state.errorDispatch = action.payload;
    },

    resendOtpStart: (state) => {
      state.loading = true;
    },

    resendOtpSuccess: (state, action) => {
      state.loading = false;
      state.otpToken = action.payload;
      state.otpSent = true;
      state.errorDispatch = null;
    },

    resendOtpFailure: (state, action) => {
      state.loading = false;
      state.errorDispatch = action.payload;
    },

    signInStart: (state) => {
      state.loading = true;
    },

    signInSuccess: (state, action) => {
      state.currentUser = {
        _id: action.payload.user._id, // Access user object
        username: action.payload.user.username,
        email: action.payload.user.email,
      };
      state.loading = false;
      state.errorDispatch = null;
    },

    signInFailure: (state, action) => {
      state.errorDispatch = action.payload;
      state.loading = false;
    },

    signoutStart: (state) => {
      state.loading = true;
    },

    signoutSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.otpToken = null;
      state.otpVerified = false;
      state.errorDispatch = null;
    },

    signoutFailure: (state, action) => {
      state.errorDispatch = action.payload;
      state.loading = false;
    },
  },
});

export const {
  signUpStart,
  signUpSuccess,
  signUpFailure,
  verifyOtpStart,
  verifyOtpSuccess,
  verifyOtpFailure,
  resendOtpStart,
  resendOtpSuccess,
  resendOtpFailure,
  signInStart,
  signInSuccess,
  signInFailure,
  signoutStart,
  signoutSuccess,
  signoutFailure,
} = userSlice.actions;

export default userSlice.reducer;
