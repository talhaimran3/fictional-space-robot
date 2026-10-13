import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import { useAuth } from "../context/authContext";
import "./AdminLayout.css";

const PATH_TO_NAV = {
  "/admin2": "Dashboard",
  "/admin2/shifts": "Shifts",
  "/admin2/timesheets": "Timesheets",
  "/admin2/people": "People",
};

const PRIMARY_ACTIONS = {
  "/admin2": { label: "Quick Shift", action: () => alert("Quick Shift is not connected yet.") },
  "/admin2/people": { label: "Add Member", action: () => alert("Member management is not connected yet.") },
  "/admin2/timesheets": { label: "Approve All", action: () => alert("Timesheet approvals are not connected yet.") },
};

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const activeNav = PATH_TO_NAV[location.pathname] || "Dashboard";
  const isDeveloper = user?.role === "developer";
  // Shift creation has a real page-local handler, so don't render a fake topbar action here.
  const primary = isDeveloper ? PRIMARY_ACTIONS[location.pathname] : null;

  return (
    <div className="pln-layout">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeNav={activeNav}
      />

      <main className="pln-layout-main">
        <Topbar
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onPrimaryAction={primary?.action}
          primaryActionLabel={primary?.label}
          searchPlaceholder={
            location.pathname === "/admin2/people"
              ? "Search staff, roles, departments..."
              : location.pathname === "/admin2/timesheets"
                ? "Search people, logs..."
                : "Search shifts, staff, organizations..."
          }
        />
        <div className="pln-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
