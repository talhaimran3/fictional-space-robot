import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Activity,
  Code2,
  Settings,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Navigation.css";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
  { label: "Organizations", path: "/admin/organizations", icon: Building2 },
  { label: "Employees", path: "/admin/employees", icon: Users },
  { label: "Shifts", path: "/admin/shifts", icon: CalendarDays },
  { label: "Developer", path: "/admin/developer", icon: Code2 },
  { label: "API Health", path: "/admin/apihealth", icon: Activity },
];

export default function Navigation({ isOpen = false, onClose = () => {}, pathname = "" }) {
  const isActive = (path, end) => {
    if (end) return pathname === path || pathname === "/admin/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <>
      {isOpen && <div className="sa-nav-backdrop" onClick={onClose} />}

      <aside className={`sa-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sa-sidebar-brand">
          <Link to="/admin" className="sa-brand" onClick={onClose}>
            <span className="sa-brand-mark">S</span>
            <div>
              <strong>ShiftPulse</strong>
              <span>Admin</span>
            </div>
          </Link>
          <button type="button" className="sa-sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sa-sidebar-nav" aria-label="Admin">
          <span className="sa-nav-label">MAIN</span>
          {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
            <Link
              key={path}
              to={path}
              className={`sa-nav-item ${isActive(path, end) ? "is-active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}

          <span className="sa-nav-label">ACCOUNT</span>
          <Link to="/" className="sa-nav-item" onClick={onClose}>
            <Settings size={18} strokeWidth={1.8} />
            <span>Back to site</span>
          </Link>
        </nav>

        <div className="sa-sidebar-footer">
          <span className="sa-status-dot" />
          <div>
            <strong>Platform online</strong>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
