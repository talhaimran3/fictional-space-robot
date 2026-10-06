import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./PublicNavbar.css";
import { useAuth } from "../context/authContext";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;
  const close = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="public-nav-header">
        <div className="public-nav-container">
          <Link to="/" className="public-brand">
            <div className="public-brand-icon">S</div>
            <span>ShiftPulse</span>
          </Link>

          <nav className="desktop-nav-links">
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              Home
            </Link>
            <Link
              to="/features"
              className={`nav-link ${isActive("/features") ? "active" : ""}`}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className={`nav-link ${isActive("/pricing") ? "active" : ""}`}
            >
              Pricing
            </Link>
          </nav>

          <div className="nav-auth-btns">
            {token ? (
              <>
                <Link to="/admin" className="btn-secondary">
                  Admin Portal
                </Link>
                <button type="button" onClick={handleLogout} className="btn-secondary">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Log In
                </Link>
                <Link to="/register" className="btn-primary">
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="hamburger-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`}>
        <button
          type="button"
          className="mobile-overlay-close"
          onClick={close}
          aria-label="Close"
        >
          <X size={22} />
        </button>

        <Link to="/" className="mobile-nav-link" onClick={close}>
          Home
        </Link>
        <Link to="/features" className="mobile-nav-link" onClick={close}>
          Features
        </Link>
        <Link to="/pricing" className="mobile-nav-link" onClick={close}>
          Pricing
        </Link>
        {token ? (
          <>
            <Link to="/admin" className="mobile-nav-link" onClick={close}>
              Admin Portal
            </Link>
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-nav-link" onClick={close}>
              Log In
            </Link>
            <Link to="/register" className="btn-primary" onClick={close}>
              Start Free Trial
            </Link>
          </>
        )}
      </div>
    </>
  );
}
