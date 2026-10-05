import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  Users,
  Building2,
  Settings,
  Sparkles,
  ArrowUpRight,
  ChevronsUpDown,
  X,
  FileText,
  Clock3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Shifts", icon: CalendarDays, path: "/shifts" },
  { label: "Timesheets", icon: Clock3, path: "/timesheets" },
  { label: "Payroll", icon: Wallet },
  { label: "Expense Reports", icon: FileText },
  { label: "People", icon: Users, path: "/people" },
  { label: "Invoices", icon: FileText },
  { label: "Organizations", icon: Building2 },
];

export default function Sidebar({
  isOpen,
  onClose,
  activeNav = "Shifts",
  onNavClick,
}) {
  const navigate = useNavigate();

  return (
    <>
      {isOpen && <div className="pl-mobile-backdrop" onClick={onClose} />}
      <aside className={`pl-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="pl-brand-row">
          <div className="pl-brand">
            <div className="pl-brand-mark">
              p<span />
            </div>
            <strong>plannr</strong>
          </div>
          <button className="pl-mobile-close" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <button
          className="pl-org-switcher"
          type="button"
          onClick={() => alert("Switch Organization")}
        >
          <div className="pl-org-monogram">
            <Building2 size={16} />
          </div>
          <div className="pl-org-copy">
            <strong>Acme Company</strong>
            <span>Team workspace</span>
          </div>
          <ChevronsUpDown size={14} />
        </button>

        <nav className="pl-main-nav">
          <div className="pl-nav-label">WORKSPACE</div>
          <div className="pl-nav-menu">
            {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
              const active = activeNav === label;
              return (
                <button
                  key={label}
                  className={`pl-nav-item ${active ? "is-active" : ""}`}
                  type="button"
                  onClick={() => {
                    if (path) navigate(path);
                    if (onNavClick) onNavClick(label);
                    onClose();
                  }}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{label}</span>
                  {active && <span className="pl-active-dot" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="pl-sidebar-spacer" />

        <div className="pl-support-card">
          <div className="pl-support-title">
            <Sparkles size={16} />
            <strong>A little help?</strong>
          </div>
          <p>Your team, running smoothly. We’re here if you need us.</p>
          <button
            type="button"
            className="pl-help-link"
            onClick={() => alert("Help Center")}
          >
            Visit help center
            <ArrowUpRight size={14} />
          </button>
        </div>

        <button
          className="pl-settings-link"
          type="button"
          onClick={() => alert("Settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="pl-copyright">© 2026 Plannr</div>
      </aside>
    </>
  );
}
