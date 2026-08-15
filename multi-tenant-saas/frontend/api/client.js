import axios from "axios";

// Update baseURL if your backend runs on a different port
 const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});



export default apiClient;
