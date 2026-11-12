import React from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import MobileMenuButton from "./MobileMenuButton";
import ProfileLink from "./ProfileLink";
import TopBarSearch from "./TopBarSearch";
import "./TopBar.css";

const ROLE_LABELS = {
  developer: "Developer",
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
};

export default function TopBar({ onOpenMobileMenu, searchPlaceholder = "Search..." }) {
  const { user } = useAuth();
  const name = user?.full_name || user?.name || user?.email || "Account";
  const role = ROLE_LABELS[user?.role] || "Account";

  return (
    <header className="pl-topbar">
      <MobileMenuButton onClick={onOpenMobileMenu} />
      <TopBarSearch placeholder={searchPlaceholder} />

      <div className="pl-header-actions">
        <Link
          className="pl-dashboard-link"
          to="/admin2"
          aria-label="Go to dashboard"
          title="Dashboard"
        >
          <Home size={19} />
        </Link>
        <ProfileLink user={user} name={name} role={role} />
      </div>
    </header>
  );
}
