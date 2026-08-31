// fictional-space-robot/multi-tenant-saas/frontend/src/admin/DeveloperPortal.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Server,
  Menu,
  X,
  Users,
  CalendarDays,
  Activity,
  Database,
  Layers,
  BriefcaseBusiness,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import "./DeveloperPortal.css";

import { useCompanies } from "../../hooks/useCompanies";
import { useUsers } from "../../hooks/useUsers";
import { useShifts } from "../../hooks/useShifts";
import AllOrganizationsPage from "../components/organizations/AllOrganizationsPage";
import { HealthDashboard } from "../../api/HealthDashboard";

// Adjust this import path to wherever your component actually lives.

const NAVIGATION = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: Building2,
  },
  {
    id: "system",
    label: "System",
    icon: Server,
  },
];

const SYSTEM_ITEMS = [
  {
    id: "apiHealth",
    label: "API Health",
    icon: Activity,
  },
  {
    id: "database",
    label: "Database",
    icon: Database,
  },
  {
    id: "redis",
    label: "Redis",
    icon: Layers,
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: BriefcaseBusiness,
  },
  {
    id: "errors",
    label: "Errors",
    icon: AlertTriangle,
  },
];

const DeveloperPortal = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedSystemItem, setSelectedSystemItem] = useState("apiHealth");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { companies = [] } = useCompanies();
  const { users = [] } = useUsers();
  const { shifts = [] } = useShifts();

  /* =========================
     MAIN NAVIGATION
  ========================= */

  const handleNavigation = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);

    if (page === "system") {
      setSelectedSystemItem("apiHealth");
    }
  };

  const handleSystemNavigation = (itemId) => {
    setSelectedSystemItem(itemId);
    setActivePage("system");
    setMobileMenuOpen(false);
  };

  /* =========================
     DASHBOARD DATA
  ========================= */

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const todaysShifts = shifts.filter((shift) =>
    shift.start_time?.startsWith(today),
  );

  /* =========================
     DASHBOARD
  ========================= */

  const renderDashboard = () => (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">
            PLATFORM
          </span>

          <h1>Developer Dashboard</h1>

          <p>
            Overview of your multi-tenant shift
            management platform.
          </p>
        </div>

        <div className="system-indicator">
          <span className="status-dot"></span>

          All systems operational
        </div>
      </div>

      {/* =========================
          PLATFORM STATISTICS
      ========================= */}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Building2 size={19} />
            </div>

            <span className="stat-label">
              Organizations
            </span>
          </div>

          <strong className="stat-value">
            {companies.length}
          </strong>

          <span className="stat-description">
            Total registered tenants
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Users size={19} />
            </div>

            <span className="stat-label">
              Employees
            </span>
          </div>

          <strong className="stat-value">
            {users.length}
          </strong>

          <span className="stat-description">
            Across all organizations
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <CalendarDays size={19} />
            </div>

            <span className="stat-label">
              Active Shifts
            </span>
          </div>

          <strong className="stat-value">
            {shifts.length}
          </strong>

          <span className="stat-description">
            Currently configured
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Activity size={19} />
            </div>

            <span className="stat-label">
              Today's Shifts
            </span>
          </div>

          <strong className="stat-value">
            {todaysShifts.length}
          </strong>

          <span className="stat-description">
            {todaysShifts.length > 0
              ? "Scheduled today"
              : "There are no shifts today"}
          </span>
        </div>
      </section>

      {/* =========================
          DASHBOARD CONTENT
      ========================= */}

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>System Health</h2>

              <p>
                Current platform infrastructure
                status.
              </p>
            </div>

            <CheckCircle2
              size={20}
              className="health-icon"
            />
          </div>

          <div className="health-list">
            <HealthItem
              label="API"
              status="Operational"
            />

            <HealthItem
              label="PostgreSQL"
              status="Operational"
            />

            <HealthItem
              label="Redis"
              status="Operational"
            />

            <HealthItem
              label="Background Jobs"
              status="Operational"
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Platform Activity</h2>

              <p>
                Recent platform activity.
              </p>
            </div>
          </div>

          <div className="activity-list">
            <ActivityItem
              title="Organization created"
              description="ABC School was registered"
              time="12 minutes ago"
            />

            <ActivityItem
              title="Employee added"
              description="XYZ School added a new employee"
              time="34 minutes ago"
            />

            <ActivityItem
              title="Shift updated"
              description="Morning Shift was modified"
              time="1 hour ago"
            />

            <ActivityItem
              title="Admin login"
              description="Organization administrator logged in"
              time="2 hours ago"
            />
          </div>
        </section>
      </div>
    </>
  );

  /* =========================
     SYSTEM
  ========================= */

 const renderSystem = () => {
  switch (selectedSystemItem) {
    case "apiHealth":
      return (
        <>
          <div className="page-heading">
            <div>
              <span className="page-eyebrow">
                INFRASTRUCTURE
              </span>

              <h1>API Health</h1>

              <p>
                Monitor the health and availability
                of the application API.
              </p>
            </div>
          </div>

          <HealthDashboard />
        </>
      );

    case "database":
      return (
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">
              INFRASTRUCTURE
            </span>

            <h1>Database</h1>

            <p>
              Monitor PostgreSQL database status.
            </p>
          </div>
        </div>
      );

    case "redis":
      return (
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">
              INFRASTRUCTURE
            </span>

            <h1>Redis</h1>

            <p>
              Monitor Redis connection and cache
              performance.
            </p>
          </div>
        </div>
      );

    case "jobs":
      return (
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">
              INFRASTRUCTURE
            </span>

            <h1>Background Jobs</h1>

            <p>
              Monitor queues and background jobs.
            </p>
          </div>
        </div>
      );

    case "errors":
      return (
        <div className="page-heading">
          <div>
            <span className="page-eyebrow">
              INFRASTRUCTURE
            </span>

            <h1>Errors</h1>

            <p>
              Monitor application errors and
              failures.
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
};
  /* =========================
     CONTENT
  ========================= */

  const renderContent = () => {
    switch (activePage) {
      case "organizations":
        return <AllOrganizationsPage />;

      case "system":
        return renderSystem();

      case "dashboard":
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="developer-portal">
      {/* MOBILE OVERLAY */}

      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`developer-sidebar ${mobileMenuOpen
            ? "mobile-open"
            : ""
          }`}
      >
        <div className="sidebar-brand">
          <div className="brand-logo">
            ⚡
          </div>

          <div>
            <strong>
              Developer Console
            </strong>

            <span>
              Platform Admin
            </span>
          </div>

          <button
            className="mobile-close-button"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <span className="navigation-label">
            MAIN
          </span>

          {NAVIGATION.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`navigation-button ${activePage === item.id
                    ? "active"
                    : ""
                  }`}
                onClick={() =>
                  handleNavigation(item.id)
                }
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* SYSTEM SUB MENU */}

          {activePage === "system" && (
            <div className="system-navigation">
              <span className="navigation-label">
                SYSTEM
              </span>

           {SYSTEM_ITEMS.map((item) => {
  const Icon = item.icon;

  return (
    <button
      key={item.id}
      className={`navigation-button secondary ${
        selectedSystemItem === item.id ? "active" : ""
      }`}
      onClick={() =>
        handleSystemNavigation(item.id)
      }
    >
      <Icon size={16} />

      <span>
        {item.label}
      </span>
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
              <strong>
                Platform Online
              </strong>

              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}

      <div className="developer-main">
        <header className="mobile-header">
          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <strong>
            Developer Console
          </strong>
        </header>

        <main className="developer-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

/* =========================
   HEALTH ITEM
========================= */

const HealthItem = ({
  label,
  status,
}) => (
  <div className="health-item">
    <div className="health-name">
      <span className="health-dot"></span>

      <span>{label}</span>
    </div>

    <span className="health-status">
      {status}
    </span>
  </div>
);

/* =========================
   ACTIVITY ITEM
========================= */

const ActivityItem = ({
  title,
  description,
  time,
}) => (
  <div className="activity-item">
    <div className="activity-marker"></div>

    <div className="activity-content">
      <strong>{title}</strong>

      <span>{description}</span>

      <small>{time}</small>
    </div>
  </div>
);

export default DeveloperPortal;