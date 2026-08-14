// multi-tenant-saas/frontend/context/authContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import apiClient from "../api/client.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // Initialize authentication
  // -----------------------------------------
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(storedToken);

      // Token expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
        return;
      }

      // Restore authentication
      setToken(storedToken);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      // Tell Axios to send token with requests
      apiClient.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
    } catch (error) {
      console.error("Invalid authentication data:", error);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // -----------------------------------------
  // Login
  // -----------------------------------------
  const login = async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      console.log("Login response:", response.data);
      const { token: newToken, user: userData } = response.data;

      // Save authentication data
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update Axios
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      // Update React state
      setToken(newToken);
      setUser(userData);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password",
      };
    }
  };

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete apiClient.defaults.headers.common.Authorization;

    setToken(null);
    setUser(null);
  };

  // -----------------------------------------
  // Update user
  // -----------------------------------------
  const updateUser = (updatedUser) => {
    setUser(updatedUser);

    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // -----------------------------------------
  // Context value
  // -----------------------------------------
  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    updateUser,
  };

  // Don't render application until auth is checked
  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// -----------------------------------------
// Custom hook
// -----------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
