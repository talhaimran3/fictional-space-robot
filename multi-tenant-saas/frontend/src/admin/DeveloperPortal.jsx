import { useState } from "react";
import { Menu } from "lucide-react";
import DeveloperDashboard from "./components/dashboardComponents/DeveloperDashboard";
import DeveloperSidebar from "./components/dashboardComponents/DeveloperSidebar";
import {
  ApiHealthView,
  DatabaseView,
  RedisView,
  JobsView,
  ErrorsView,
} from "./components/dashboardComponents/SystemViews";
import AllOrganizationsPage from "../components/organizations/AllOrganizationsPage";
import { useOrganizations } from "../hooks/useOrganizations";
import { useUsers } from "../hooks/useUsers";
import { useShifts } from "../hooks/useShifts";
import "./DeveloperPortal.css";

export default function DeveloperPortal() {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedSystemItem, setSelectedSystemItem] = useState("apiHealth");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { organizations = [] } = useOrganizations();
  const { users = [] } = useUsers();
  const { shifts = [] } = useShifts();

  const handleNavigation = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    if (page === "system") setSelectedSystemItem("apiHealth");
  };

  const handleSystemNavigation = (itemId) => {
    setSelectedSystemItem(itemId);
    setActivePage("system");
    setMobileMenuOpen(false);
  };

  const renderSystem = () => {
    switch (selectedSystemItem) {
      case "apiHealth":
        return <ApiHealthView />;
      case "database":
        return <DatabaseView />;
      case "redis":
        return <RedisView />;
      case "jobs":
        return <JobsView />;
      case "errors":
        return <ErrorsView />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "organizations":
        return <AllOrganizationsPage />;
      case "system":
        return renderSystem();
      case "dashboard":
      default:
        return (
          <DeveloperDashboard
            organizations={organizations}
            users={users}
            shifts={shifts}
          />
        );
    }
  };

  return (
    <div className="sa-dev-portal">
      {mobileMenuOpen && (
        <div className="sa-dev-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      <DeveloperSidebar
        activePage={activePage}
        selectedSystemItem={selectedSystemItem}
        mobileMenuOpen={mobileMenuOpen}
        onNavigate={handleNavigation}
        onSystemNavigate={handleSystemNavigation}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="sa-dev-main">
        <header className="sa-dev-mobile-header">
          <button
            type="button"
            className="sa-dev-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <strong>Developer Console</strong>
        </header>

        <main className="sa-dev-content">{renderContent()}</main>
      </div>
    </div>
  );
}
