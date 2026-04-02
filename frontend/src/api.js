import axios from "axios";

const API = axios.create({
  baseURL: "https://chatapp-2csn.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Standard Bearer format taaki middleware crash na ho
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;