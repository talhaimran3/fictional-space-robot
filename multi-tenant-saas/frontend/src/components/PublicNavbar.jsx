import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./PublicNavbar.css";
import { useAuth } from "../../context/authContext";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { token ,logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  }
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="public-nav-header">
        <div className="public-nav-container">
          <Link to="/" className="public-brand">
            <div className="public-brand-icon">⚡</div>
            <span>ShiftPulse</span>
          </Link>

          {/* Desktop Links */}
          <nav className="desktop-nav-links">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
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
            {/* when logged in show logout and viceversa */}
            {token ? (
              <>
               <button className="btn-secondary">
                  <Link to="/admin" className="btn-secondary">
                  Admin Portal
                </Link> {""}
                  <Link to="/developer" className="btn-secondary">
                  Developer Portal
                </Link>
              </button>
                  <button className="btn-secondary">
                  <Link to="/org/all" className="btn-secondary">
                  Organization List
                </Link>
              </button>
                <button onClick={handleLogout} className="btn-secondary">
                
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

          {/* Mobile Hamburger Toggle */}
          <button
            className="hamburger-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Fullscreen Smooth Mobile Overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`}>
        <button
          className="mobile-overlay-close"
          onClick={() => setMobileMenuOpen(false)}
        >
          ✕
        </button>

        <Link
          to="/"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          to="/features"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Features
        </Link>
        <Link
          to="/pricing"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Pricing
        </Link>
        <Link
          to="/login"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          Log In
        </Link>
        <Link
          to="/register"
          className="btn-primary"
          onClick={() => setMobileMenuOpen(false)}
        >
          Start Free Trial
        </Link>
      </div>
    </>
  );
}
