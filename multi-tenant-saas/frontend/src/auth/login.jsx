import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/authContext";
import "./AuthStyles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError(result.message || "Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="sp-auth">
      <div className="sp-auth-shell">
        {/* Brand panel */}
        <aside className="sp-auth-brand" aria-hidden="false">
          <Link to="/" className="sp-auth-logo">
            <span className="sp-auth-logo-mark">S</span>
            <span>ShiftPulse</span>
          </Link>
          <div className="sp-auth-brand-copy">
            <h1>Welcome back</h1>
            <p>
              Sign in to manage rotas, people, and timesheets across every
              location — without the spreadsheet noise.
            </p>
          </div>
          <ul className="sp-auth-points">
            <li>Smart conflict-aware scheduling</li>
            <li>Live labor visibility</li>
            <li>Clean approvals workflow</li>
          </ul>
        </aside>

        {/* Form panel */}
        <main className="sp-auth-main">
          <div className="sp-auth-card">
            <div className="sp-auth-card-head">
              <h2>Log in</h2>
              <p>Enter your credentials to continue</p>
            </div>

            {error && (
              <div className="sp-auth-alert" role="alert">
                <AlertCircle size={16} strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="sp-auth-form" noValidate>
              <div className="sp-field">
                <label htmlFor="login-email">Email address</label>
                <div className="sp-input-wrap">
                  <Mail size={16} className="sp-input-icon" aria-hidden />
                  <input
                    id="login-email"
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
                <div className="sp-field-row">
                  <label htmlFor="login-password">Password</label>
                  <Link to="/forgot-password" className="sp-field-link">
                    Forgot password?
                  </Link>
                </div>
                <div className="sp-input-wrap">
                  <Lock size={16} className="sp-input-icon" aria-hidden />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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

              <button type="submit" className="sp-auth-submit" disabled={loading}>
                {loading ? "Logging in…" : "Log in"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <p className="sp-auth-footer">
              Don&apos;t have an account?{" "}
              <Link to="/register">Create one</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
