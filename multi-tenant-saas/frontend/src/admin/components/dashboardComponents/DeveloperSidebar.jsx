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
    <aside className={`sa-dev-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
      <div className="sa-dev-brand">
        <div className="sa-dev-logo">S</div>
        <div>
          <strong>Developer Console</strong>
          <span>Platform Admin</span>
        </div>
        <button
          type="button"
          className="sa-dev-close"
          onClick={onCloseMobile}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sa-dev-nav">
        <span className="sa-dev-label">MAIN</span>
        {NAVIGATION.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`sa-dev-btn ${activePage === item.id ? "is-active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {activePage === "system" && (
          <div className="sa-dev-system">
            <span className="sa-dev-label">SYSTEM</span>
            {SYSTEM_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sa-dev-btn is-secondary ${
                    selectedSystemItem === item.id ? "is-active" : ""
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

      <div className="sa-dev-footer">
        <span className="sa-status-dot" />
        <div>
          <strong>Platform Online</strong>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
