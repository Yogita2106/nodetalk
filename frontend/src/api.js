import axios from "axios";

// src/api.js
const API = axios.create({ 
  baseURL: "https://chatapp-2csn.onrender.com/api/auth" 
});

// OTP related calls
export const sendOTP = (email) => API.post("/send-otp", { email });
export const resendOTP = (email) => API.post("/resend-otp", { email });
export const verifyOTP = (email, otp) => API.post("/verify-otp", { email, otp });

// Auth calls
export const register = (userData) => API.post("/register", userData);
export const login = (userData) => API.post("/login", userData);

export default API;









