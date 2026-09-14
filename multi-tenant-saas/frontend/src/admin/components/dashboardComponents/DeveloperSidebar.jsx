// src/admin/components/DeveloperSidebar.jsx

import {
  LayoutDashboard,
  Building2,
  Server,
  X,
  Activity,
  Database,
  Layers,
  BriefcaseBusiness,
  AlertTriangle,
} from "lucide-react";

const NAVIGATION = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "system", label: "System", icon: Server },
];

const SYSTEM_ITEMS = [
  { id: "apiHealth", label: "API Health", icon: Activity },
  { id: "database", label: "Database", icon: Database },
  { id: "redis", label: "Redis", icon: Layers },
  { id: "jobs", label: "Jobs", icon: BriefcaseBusiness },
  { id: "errors", label: "Errors", icon: AlertTriangle },
];

export default function DeveloperSidebar({
  activePage,
  selectedSystemItem,
  mobileMenuOpen,
  onNavigate,
  onSystemNavigate,
  onCloseMobile,
}) {
  return (
    <aside
      className={`developer-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
    >
      <div className="sidebar-brand">
        <div className="brand-logo">⚡</div>
        <div>
          <strong>Developer Console</strong>
          <span>Platform Admin</span>
        </div>
        <button
          className="mobile-close-button"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-navigation">
        <span className="navigation-label">MAIN</span>

        {NAVIGATION.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`navigation-button ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {activePage === "system" && (
          <div className="system-navigation">
            <span className="navigation-label">SYSTEM</span>
            {SYSTEM_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`navigation-button secondary ${
                    selectedSystemItem === item.id ? "active" : ""
                  }`}
                  onClick={() => onSystemNavigate(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="developer-status">
          <span className="status-dot"></span>
          <div>
            <strong>Platform Online</strong>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}