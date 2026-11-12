import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import { MANAGEMENT_ITEMS, STAFF_ITEMS } from "./navigation";
import "./Sidebar.css";

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

  return (
    <>
      {isOpen && (
        <button
          className="pl-mobile-backdrop"
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        id="pl-sidebar"
        className={"pl-sidebar" + (isOpen ? " is-open" : "")}
        aria-label="Main navigation"
      >
        <SidebarHeader onClose={onClose} />
        <SidebarNav
          items={items}
          activePath={activePath}
          onNavigate={onClose}
        />
        <div className="pl-sidebar-spacer" />
        <p className="pl-copyright">© 2026 Plannr</p>
      </aside>
    </>
  );
}
