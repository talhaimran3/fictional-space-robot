import React from "react";
import { Search, Plus, Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../context/authContext";
import "./TopBar.css";

function Avatar({ initials, tone = "green", size = "small" }) {
  return <div className={`pl-avatar pl-avatar--${tone} pl-avatar--${size}`}>{initials}</div>;
}

const roleLabel = (role) => ({
  developer: "Developer",
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
}[role] || "Account");

export default function Topbar({
  onOpenMobileMenu,
  onPrimaryAction,
  primaryActionLabel = "Add Member",
  searchPlaceholder = "Search anything...",
}) {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.name || user?.email || "Account";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";

  return (
    <header className="pl-topbar">
      <button className="pl-mobile-hamburger" type="button" onClick={onOpenMobileMenu} aria-label="Open navigation">
        <Menu size={22} />
      </button>

      <div className="pl-global-search">
        <Search size={18} />
        <input aria-label="Search" placeholder={searchPlaceholder} />
        <span className="pl-shortcut">Ctrl K</span>
      </div>

      <div className="pl-header-actions">
        {onPrimaryAction && (
          <button className="pl-primary-button" type="button" onClick={onPrimaryAction}>
            <Plus size={18} />
            <span>{primaryActionLabel}</span>
          </button>
        )}

        <button className="pl-notification-button" type="button" aria-label="Notifications" onClick={() => alert("Notifications are not configured yet.")}>
          <Bell size={20} />
        </button>

        <div className="pl-topbar-divider" />

        <button className="pl-profile" type="button" onClick={() => alert("Profile settings are not configured yet.")}>
          <Avatar initials={initials} />
          <div className="pl-profile-info">
            <strong>{displayName}</strong>
            <span>{roleLabel(user?.role)}</span>
          </div>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
