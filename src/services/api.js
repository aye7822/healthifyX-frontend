// client/src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://healthifyx-backend.onrender.com",
});

export default API;
