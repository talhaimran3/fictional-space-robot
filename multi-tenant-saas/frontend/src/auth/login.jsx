import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AuthStyles.css";
import { useAuth } from "../../context/authContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please log in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="redirect-container">
          <span>Don't have an account? </span>
          <a href="/register" className="redirect-link">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
}
