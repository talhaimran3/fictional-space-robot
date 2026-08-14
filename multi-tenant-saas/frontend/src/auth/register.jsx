import { useState } from "react";
import "./AuthStyles.css";
import apiClient from "../../api/client.js";
export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const formData = { email, password, name }; // You can add a name field or any other required fields here
    console.log("Registering with:", formData);

    try {
      // Send registration data to your backend API
      const response = await apiClient.post("/auth/register", formData);
      console.log("Registration response:", response);
      // Grab the token from the response (adjust based on your API structure)
      const { token } = response.data;

      if (token) {
        // Save the token to local storage so the user stays logged in
        localStorage.setItem("token", token);
        setSuccess(true);
      }
    } catch (err) {
      // Show error message from backend or a fallback message
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>

        <div className="redirect-container">
          <span>Already have an account? </span>
          <a href="/login" className="redirect-link">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}
