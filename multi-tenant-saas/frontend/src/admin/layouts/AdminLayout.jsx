import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "../components/Navigation/Navigation";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="sa-layout">
      <Navigation
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={location.pathname}
      />

      <div className="sa-layout-main">
        <header className="sa-topbar">
          <button
            type="button"
            className="sa-topbar-menu"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="sa-topbar-title">
            <strong>ShiftPulse Admin</strong>
            <span>Platform console</span>
          </div>
        </header>

        <main className="sa-layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
