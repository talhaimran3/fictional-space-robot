import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Code2,
  Activity,
  Home,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", end: true, icon: LayoutDashboard },
  { label: "Organizations", path: "/admin/organizations", icon: Building2 },
  { label: "Employees", path: "/admin/employees", icon: Users },
  { label: "Shifts", path: "/admin/shifts", icon: CalendarDays },
  { label: "Developer", path: "/admin/developer", icon: Code2 },
  { label: "API Health", path: "/admin/apihealth", icon: Activity },
];

export default function Navigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeSidebar = () => setIsSidebarOpen(false);

  const isActive = (path, end) => {
    if (end) return location.pathname === path || location.pathname === "/admin/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="nav-layout">
      <header className={`top-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <button
            className="menu-toggle-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <nav className="desktop-links">
            <Link to="/admin">Admin</Link>
            <Link to="/">Site</Link>
          </nav>
        </div>
      </header>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar-drawer ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">ShiftPulse Admin</div>
          <button
            className="close-toggle-btn"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-links">
          {NAV_ITEMS.map(({ label, path, end, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={closeSidebar}
              className={isActive(path, end) ? "active" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <div className="sidebar-divider" />

          <Link to="/" onClick={closeSidebar}>
            <Home size={18} />
            Back to site
          </Link>
        </nav>
      </aside>

      <main className="main-content" />
    </div>
  );
}
