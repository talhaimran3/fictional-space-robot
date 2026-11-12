import React from "react";
import { Home, Menu, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./TopBar.css";

const ROLE_LABELS = {
  developer: "Developer",
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
};

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";
}

function Avatar({ name, imageUrl }) {
  return (
    <span className="pl-avatar pl-avatar--green pl-avatar--small" aria-hidden="true">
      {imageUrl ? <img src={imageUrl} alt="" /> : getInitials(name)}
    </span>
  );
}

export default function Topbar({
  onOpenMobileMenu,
  searchPlaceholder = "Search...",
}) {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.name || user?.email || "Account";
  const role = ROLE_LABELS[user?.role] || "Account";

  return (
    <header className="pl-topbar">
      <button
        className="pl-mobile-hamburger"
        type="button"
        onClick={onOpenMobileMenu}
        aria-label="Open navigation"
        aria-controls="pl-sidebar"
      >
        <Menu size={21} />
      </button>

      <label className="pl-global-search">
        <Search size={18} aria-hidden="true" />
        <input aria-label="Search" placeholder={searchPlaceholder} />
      </label>

      <div className="pl-header-actions">
        <Link
          className="pl-notification-button"
          to="/admin2"
          aria-label="Go to dashboard"
          title="Dashboard"
        >
          <Home size={19} />
        </Link>

        <Link
          className="pl-profile"
          to="/admin2/profile"
          aria-label={`Open profile for ${displayName}`}
        >
          <Avatar name={displayName} imageUrl={user?.profile_image_url} />
          <span className="pl-profile-info">
            <strong>{displayName}</strong>
            <span>{role}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
