import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Compass,
  Settings,
  User,
  Bell,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Navigation.css";

export default function Navigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="nav-layout">

      {/* TOP NAVBAR */}
      <header
        className={`top-navbar ${
          isScrolled ? "scrolled" : ""
        }`}
      >
        <div className="nav-container">

          <button
            className="menu-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="nav-logo">
            ModernUI
          </Link>

          <nav className="desktop-links">
            <Link to="/">Home</Link>
            <Link to="/explore">Explore</Link>
            <Link to="/notifications">
              Notifications
            </Link>
            <Link to="/profile">Profile</Link>
          </nav>

          <button
            className="icon-btn-desktop"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

        </div>
      </header>


      {/* OVERLAY */}
      <div
        className={`sidebar-overlay ${
          isSidebarOpen ? "active" : ""
        }`}
        onClick={closeSidebar}
      />


      {/* SIDEBAR */}
      <aside
        className={`sidebar-drawer ${
          isSidebarOpen ? "open" : ""
        }`}
      >

        <div className="sidebar-header">

          <div className="sidebar-logo">
            Menu
          </div>

          <button
            className="close-toggle-btn"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

        </div>


        <nav className="sidebar-links">

          <Link to="/" onClick={closeSidebar}>
            <Home size={18} />
            Home
          </Link>

          <Link
            to="/explore"
            onClick={closeSidebar}
          >
            <Compass size={18} />
            Explore
          </Link>

          <Link
            to="/notifications"
            onClick={closeSidebar}
          >
            <Bell size={18} />
            Notifications
          </Link>

          <Link
            to="/profile"
            onClick={closeSidebar}
          >
            <User size={18} />
            Profile
          </Link>

          <div className="sidebar-divider" />

          <Link
            to="/settings"
            onClick={closeSidebar}
          >
            <Settings size={18} />
            Settings
          </Link>

        </nav>

      </aside>

      <main className="main-content" />

    </div>
  );
}