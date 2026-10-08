import React, { useState } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";
import { OrganizationProvider, useOrganization } from "../context/organizationContext";
import { useAuth } from "../context/authContext";
import "./AdminLayout.css";

const PATH_TO_NAV = {
  dashboard: "Dashboard",
  shifts: "Shifts",
  timesheets: "Timesheets",
  people: "People",
};

const PRIMARY_ACTIONS = {
  dashboard: { label: "Quick Shift", action: () => alert("Quick Shift") },
  shifts: { label: "Quick Shift", action: () => alert("Quick Shift") },
  people: { label: "Add Member", action: () => alert("Add Member") },
  timesheets: { label: "Approve All", action: () => alert("Approve All") },
};

function OrganizationShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const organization = useOrganization();

  if (!organization?.id) {
    return <Navigate to="/" replace />;
  }

  if (user?.organization_id && user.organization_id !== organization.id) {
    return <Navigate to={`/org/${user.organization_id}/dashboard`} replace />;
  }

  const section = location.pathname.split("/").filter(Boolean).pop() || "dashboard";
  const activeNav = PATH_TO_NAV[section] || "Dashboard";
  const primary = PRIMARY_ACTIONS[section] || PRIMARY_ACTIONS.dashboard;

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
          onPrimaryAction={primary.action}
          primaryActionLabel={primary.label}
          searchPlaceholder={
            section === "people"
              ? "Search staff, roles, departments..."
              : section === "timesheets"
                ? "Search people, logs..."
                : "Search shifts, staff, locations..."
          }
        />

        <div className="pln-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function OrganizationLayout() {
  return (
    <OrganizationProvider>
      <OrganizationShell />
    </OrganizationProvider>
  );
}
