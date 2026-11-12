import React, { useCallback, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar/index.jsx";
import Topbar from "./TopBar/index.jsx";
import { useAuth } from "../context/authContext";
import "./AdminLayout.css";

const STAFF_PATHS = ["/admin2", "/admin2/timesheets", "/admin2/profile"];

function getSearchPlaceholder(pathname, isStaff) {
  if (isStaff) return "Search your shifts and timesheets...";
  if (pathname === "/admin2/organizations") return "Search organizations, slugs...";
  if (pathname === "/admin2/people") return "Search staff, roles...";
  if (pathname === "/admin2/timesheets") return "Search people, logs...";
  return "Search shifts, staff, organizations...";
}

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const openMobileMenu = useCallback(() => setIsMobileMenuOpen(true), []);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const isStaff = user?.role === "staff";
  if (isStaff && !STAFF_PATHS.includes(location.pathname)) {
    return <Navigate to="/admin2" replace />;
  }

  return (
    <div className="pln-layout">
      <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
      <main className="pln-layout-main">
        <Topbar
          onOpenMobileMenu={openMobileMenu}
          searchPlaceholder={getSearchPlaceholder(location.pathname, isStaff)}
        />
        <div className="pln-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
