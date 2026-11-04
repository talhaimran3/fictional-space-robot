import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import { useAuth } from "../context/authContext";
import "./AdminLayout.css";

const PATH_TO_NAV = {
  "/admin2": "Dashboard",
  "/admin2/shifts": "Shifts",
  "/admin2/timesheets": "Timesheets",
  "/admin2/people": "People",
  "/admin2/organizations": "Organizations",
};

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const activeNav = PATH_TO_NAV[location.pathname] || "Dashboard";
  // Shift creation has a real page-local handler, so don't render a fake topbar action here.

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
          searchPlaceholder={
            location.pathname === "/admin2/organizations"
              ? "Search organizations, slugs..."
              : location.pathname === "/admin2/people"
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
