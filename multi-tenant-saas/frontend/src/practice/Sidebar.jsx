import React from "react";
import { LayoutDashboard, CalendarDays, Users, Building2, Settings, Sparkles, ArrowUpRight, X, Clock3, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./Sidebar.css";

const MANAGEMENT_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin2" },
  { label: "Shifts", icon: CalendarDays, path: "/admin2/shifts" },
  { label: "Timesheets", icon: Clock3, path: "/admin2/timesheets" },
  { label: "People", icon: Users, path: "/admin2/people" },
  { label: "Organizations", icon: Building2, path: "/admin2/organizations" },
  { label: "My Profile", icon: UserRound, path: "/admin2/profile" },
];
const STAFF_ITEMS = [
  { label: "My Schedule", icon: CalendarDays, path: "/admin2" },
  { label: "My Timesheets", icon: Clock3, path: "/admin2/timesheets" },
  { label: "My Profile", icon: UserRound, path: "/admin2/profile" },
];

export default function Sidebar({ isOpen, onClose, activeNav = "Dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const items = user?.role === "staff" ? STAFF_ITEMS : MANAGEMENT_ITEMS;

  return (
    <>
      {isOpen && <div className="pl-mobile-backdrop" onClick={onClose}/>}
      <aside className={`pl-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="pl-brand-row"><div className="pl-brand"><div className="pl-brand-mark">p<span/></div><strong>plannr</strong></div><button className="pl-mobile-close" type="button" onClick={onClose} aria-label="Close navigation"><X size={20}/></button></div>
        <nav className="pl-main-nav"><div className="pl-nav-label">WORKSPACE</div><div className="pl-nav-menu">
          {items.map(({ label, icon: Icon, path }) => {
            const active = path === "/admin2" ? location.pathname === "/admin2" : activeNav === label || (label === "My Timesheets" && location.pathname === "/admin2/timesheets");
            return <button key={label} className={`pl-nav-item ${active ? "is-active" : ""}`} type="button" onClick={() => { navigate(path); onClose?.(); }}>
              <Icon size={19} strokeWidth={1.8}/><span>{label}</span>{active && <span className="pl-active-dot"/>}
            </button>;
          })}
        </div></nav>
        <div className="pl-sidebar-spacer"/>
        {user?.role !== "staff" && <div className="pl-support-card"><div className="pl-support-title"><Sparkles size={16}/><strong>A little help?</strong></div><p>Your team, running smoothly. We’re here if you need us.</p><button type="button" className="pl-help-link" onClick={() => alert("Help Center")}>Visit help center <ArrowUpRight size={14}/></button></div>}
        <button className="pl-settings-link" type="button" onClick={() => navigate("/admin2/profile")}><Settings size={19}/><span>Profile settings</span></button>
        <div className="pl-copyright">© 2026 Plannr</div>
      </aside>
    </>
  );
}
