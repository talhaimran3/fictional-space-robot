import React, { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import { useAuth } from "../context/authContext";
import "./AdminLayout.css";

const PATH_TO_NAV = {
  "/admin2": "Dashboard",
  "/admin2/dashboard": "Dashboard",
  "/admin2/shifts": "Shifts",
  "/admin2/timesheets": "Timesheets",
  "/admin2/people": "People",
  "/admin2/organizations": "Organizations",
  "/admin2/profile": "My Profile",
};
const STAFF_PATHS = ["/admin2", "/admin2/timesheets", "/admin2/profile"];

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isStaff = user?.role === "staff";
  if (isStaff && !STAFF_PATHS.includes(location.pathname)) return <Navigate to="/admin2" replace />;

  return (
    <div className="pln-layout">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} activeNav={PATH_TO_NAV[location.pathname] || "Dashboard"}/>
      <main className="pln-layout-main">
        <Topbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} searchPlaceholder={isStaff ? "Search your shifts and timesheets..." : location.pathname === "/admin2/organizations" ? "Search organizations, slugs..." : location.pathname === "/admin2/people" ? "Search staff, roles..." : location.pathname === "/admin2/timesheets" ? "Search people, logs..." : "Search shifts, staff, organizations..."}/>
        <div className="pln-layout-content"><Outlet/></div>
      </main>
    </div>
  );
}
