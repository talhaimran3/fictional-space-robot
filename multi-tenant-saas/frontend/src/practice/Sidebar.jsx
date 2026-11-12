import React, { useEffect } from "react";
import {
  Building2,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./Sidebar.css";

const MANAGEMENT_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin2" },
  { label: "Shifts", icon: CalendarDays, path: "/admin2/shifts" },
  { label: "Timesheets", icon: Clock3, path: "/admin2/timesheets" },
  { label: "People", icon: Users, path: "/admin2/people" },
  { label: "Organizations", icon: Building2, path: "/admin2/organizations" },
  { label: "My Profile", icon: UserRound, path: "/admin2/profile" },
];

const STAFF_ITEMS = [
  { label: "My Schedule", icon: CalendarDays, path: "/admin2" },
  { label: "My Timesheets", icon: Clock3, path: "/admin2/timesheets" },
  { label: "My Profile", icon: UserRound, path: "/admin2/profile" },
];

export default function Sidebar({ isOpen = false, onClose }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = user?.role === "staff" ? STAFF_ITEMS : MANAGEMENT_ITEMS;
  const activePath = pathname === "/admin2/dashboard" ? "/admin2" : pathname;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const closeMenu = () => onClose?.();

  return (
    <>
      {isOpen && (
        <button
          className="pl-mobile-backdrop"
          type="button"
          onClick={closeMenu}
          aria-label="Close navigation"
          tabIndex={-1}
        />
      )}

      <aside
        id="pl-sidebar"
        className={`pl-sidebar${isOpen ? " is-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="pl-brand-row">
          <Link className="pl-brand" to="/admin2" onClick={closeMenu}>
            <span className="pl-brand-mark" aria-hidden="true">p<span /></span>
            <strong>plannr</strong>
          </Link>

          <button
            className="pl-mobile-close"
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="pl-main-nav">
          <div className="pl-nav-label">WORKSPACE</div>
          <div className="pl-nav-menu">
            {items.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/admin2"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `pl-nav-item${(isActive || activePath === path) ? " is-active" : ""}`
                }
              >
                <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
                {activePath === path && <span className="pl-active-dot" />}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="pl-sidebar-spacer" />
        <div className="pl-copyright">© 2026 Plannr</div>
      </aside>
    </>
  );
}
