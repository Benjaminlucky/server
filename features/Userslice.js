import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fullName: "",
  authToken: localStorage.getItem("authToken") || null, // Load token from storage
  isVerified: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.fullName = action.payload.fullName;
      state.authToken = action.payload.authToken;
      state.isVerified = action.payload.isVerified;
      localStorage.setItem("authToken", action.payload.authToken); // Persist token
    },
    resetUser(state) {
      state.fullName = "";
      state.authToken = null;
      state.isVerified = false;
      localStorage.removeItem("authToken"); // Clear token
    },
    setVerified(state, action) {
      state.isVerified = action.payload; // Update verification status
    },
  },
});

export const { setUser, resetUser, setVerified } = userSlice.actions; // Ensure correct export
export default userSlice.reducer;
