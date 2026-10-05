import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import "./AdminLayout.css";

// Map URL path → sidebar label (must match NAV_ITEMS labels in Sidebar.jsx)
const PATH_TO_NAV = {
  "/dashboard": "Dashboard",
  "/shifts": "Shifts",
  "/timesheets": "Timesheets",
  "/people": "People",
};

// Primary action config per route
const PRIMARY_ACTIONS = {
  "/dashboard": { label: "Quick Shift", action: () => alert("Quick Shift from Dashboard") },
  "/shifts": { label: "Quick Shift", action: () => alert("Quick Shift from Shifts") },
  "/people": { label: "Add Member", action: () => alert("Add Member from People") },
  "/timesheets": { label: "Approve All", action: () => alert("Approve All from Timesheets") },
};

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Derive active nav purely from the current URL (recommended)
  const activeNav = PATH_TO_NAV[location.pathname] || "Dashboard";

  // Dynamic primary button based on current route
  const primary = PRIMARY_ACTIONS[location.pathname] || PRIMARY_ACTIONS["/dashboard"];

  return (
    <div className="pln-layout">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeNav={activeNav}
        // onNavClick is optional now – URL is the source of truth
        onNavClick={() => {}}
      />

      <main className="pln-layout-main">
        <Topbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onPrimaryAction={primary.action}
          primaryActionLabel={primary.label}
          searchPlaceholder={
            location.pathname === "/people"
              ? "Search staff, roles, departments..."
              : location.pathname === "/timesheets"
                ? "Search people, logs..."
                : "Search shifts, staff, locations..."
          }
        />

        {/* Page content is injected here by React Router */}
        <div className="pln-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}