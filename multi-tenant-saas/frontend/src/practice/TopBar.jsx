import React from "react";
import { Search, Plus, Bell, ChevronDown, Menu } from "lucide-react";
import "./TopBar.css";

function Avatar({ initials, tone = "blue", size = "small" }) {
  return (
    <div className={`pl-avatar pl-avatar--${tone} pl-avatar--${size}`}>
      {initials}
    </div>
  );
}

export default function Topbar({ 
  onOpenMobileMenu, 
  onPrimaryAction, 
  primaryActionLabel = "Add Member", 
  searchPlaceholder = "Search anything..." 
}) {
  return (
    <header className="pl-topbar">
      <button className="pl-mobile-hamburger" type="button" onClick={onOpenMobileMenu}>
        <Menu size={22} />
      </button>

      <div className="pl-global-search">
        <Search size={18} />
        <input aria-label="Search" placeholder={searchPlaceholder} />
        <span className="pl-shortcut">⌘ K</span>
      </div>

      <div className="pl-header-actions">
        {onPrimaryAction && (
          <button className="pl-primary-button" type="button" onClick={onPrimaryAction}>
            <Plus size={18} />
            <span>{primaryActionLabel}</span>
          </button>
        )}

        <button className="pl-notification-button" type="button" aria-label="Notifications" onClick={() => alert("Notifications")}>
          <Bell size={20} />
          <span>3</span>
        </button>

        <div className="pl-topbar-divider" />

        <button className="pl-profile" type="button" onClick={() => alert("Profile Options")}>
          <Avatar initials="RS" tone="green" size="small" />
          <div className="pl-profile-info">
            <strong>Rodger Struck</strong>
            <span>Administrator</span>
          </div>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}