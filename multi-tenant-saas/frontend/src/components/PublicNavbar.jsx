import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/authContext";
import "./PublicNavbar.css";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Features", path: "/features" },
  { label: "Pricing", path: "/pricing" },
];

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`sp-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="sp-nav-inner">
          <Link to="/" className="sp-brand">
            <span className="sp-brand-mark">S</span>
            <span className="sp-brand-text">ShiftPulse</span>
          </Link>

          <nav className="sp-nav-links" aria-label="Primary">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`sp-nav-link ${isActive(path) ? "is-active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="sp-nav-actions">
            {token ? (
              <>
                <Link to="/dashboard" className="sp-btn sp-btn--ghost">
                  <LayoutDashboard size={16} strokeWidth={1.8} />
                  Dashboard
                </Link>
                <button type="button" className="sp-btn sp-btn--outline" onClick={handleLogout}>
                  <LogOut size={16} strokeWidth={1.8} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="sp-btn sp-btn--ghost">
                  Log in
                </Link>
                <Link to="/register" className="sp-btn sp-btn--primary">
                  Start free trial
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="sp-nav-burger"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div className={`sp-mobile ${mobileOpen ? "is-open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="sp-mobile-panel">
          <nav className="sp-mobile-nav">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`sp-mobile-link ${isActive(path) ? "is-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="sp-mobile-actions">
            {token ? (
              <>
                <Link to="/dashboard" className="sp-btn sp-btn--primary sp-btn--block" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <button type="button" className="sp-btn sp-btn--outline sp-btn--block" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="sp-btn sp-btn--outline sp-btn--block" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link to="/register" className="sp-btn sp-btn--primary sp-btn--block" onClick={() => setMobileOpen(false)}>
                  Start free trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && <div className="sp-mobile-backdrop" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
