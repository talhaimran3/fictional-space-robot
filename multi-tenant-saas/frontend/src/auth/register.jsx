import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import apiClient from "../api/client.js";
import "./AuthStyles.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
        name,
      });

      const { token, user } = response.data || {};

      if (token) {
        localStorage.setItem("token", token);
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        setSuccess(true);
        // Brief success state, then go home
        setTimeout(() => navigate("/"), 600);
      } else {
        // Registration succeeded without token — still go home
        setSuccess(true);
        setTimeout(() => navigate("/"), 600);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-auth">
      <div className="sp-auth-shell">
        {/* Brand panel */}
        <aside className="sp-auth-brand">
          <Link to="/" className="sp-auth-logo">
            <span className="sp-auth-logo-mark">S</span>
            <span>ShiftPulse</span>
          </Link>
          <div className="sp-auth-brand-copy">
            <h1>Create your workspace</h1>
            <p>
              Set up ShiftPulse in minutes and start publishing cleaner schedules
              across every branch.
            </p>
          </div>
          <ul className="sp-auth-points">
            <li>Free to start — no card required</li>
            <li>Built for multi-location teams</li>
            <li>Timesheets &amp; approvals included</li>
          </ul>
        </aside>

        {/* Form panel */}
        <main className="sp-auth-main">
          <div className="sp-auth-card">
            <div className="sp-auth-card-head">
              <h2>Sign up</h2>
              <p>Create your account to get started</p>
            </div>

            {error && (
              <div className="sp-auth-alert" role="alert">
                <AlertCircle size={16} strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="sp-auth-alert sp-auth-alert--success" role="status">
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>Account created — redirecting…</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="sp-auth-form" noValidate>
              <div className="sp-field">
                <label htmlFor="reg-name">Full name</label>
                <div className="sp-input-wrap">
                  <User size={16} className="sp-input-icon" aria-hidden />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sp-field">
                <label htmlFor="reg-email">Email address</label>
                <div className="sp-input-wrap">
                  <Mail size={16} className="sp-input-icon" aria-hidden />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="sp-field">
                <label htmlFor="reg-password">Password</label>
                <div className="sp-input-wrap">
                  <Lock size={16} className="sp-input-icon" aria-hidden />
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="sp-input-action"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="sp-field">
                <label htmlFor="reg-confirm">Confirm password</label>
                <div className="sp-input-wrap">
                  <Lock size={16} className="sp-input-icon" aria-hidden />
                  <input
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="sp-input-action"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="sp-auth-submit"
                disabled={loading || success}
              >
                {loading ? "Creating account…" : success ? "Success" : "Create account"}
                {!loading && !success && <ArrowRight size={16} />}
              </button>
            </form>

            <p className="sp-auth-footer">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
