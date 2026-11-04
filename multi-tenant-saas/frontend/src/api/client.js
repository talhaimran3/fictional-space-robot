import axios from "axios";

const getDefaultApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    const codespacesMatch = hostname.match(/^(.*)-5173(\.app\.github\.dev)$/i);
    if (codespacesMatch) {
      return `${protocol}//${codespacesMatch[1]}-5000${codespacesMatch[2]}/api`;
    }
  }
  return "http://localhost:5000/api";
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
