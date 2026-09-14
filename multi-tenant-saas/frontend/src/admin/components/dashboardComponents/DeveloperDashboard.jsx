// src/admin/components/DeveloperDashboard.jsx

import { Building2, Users, CalendarDays, Activity } from "lucide-react";
import SystemHealthPanel from "./SystemHealthPanel";
import PlatformActivityPanel from "./PlatformActivityPanel";

export default function DeveloperDashboard({
  organizations = [],
  users = [],
  shifts = [],
}) {
  const today = new Date().toISOString().split("T")[0];
  const todaysShifts = shifts.filter((shift) =>
    shift.start_time?.startsWith(today)
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">PLATFORM</span>
          <h1>Developer Dashboard</h1>
          <p>Overview of your multi-tenant shift management platform.</p>
        </div>

        <div className="system-indicator">
          <span className="status-dot"></span>
          All systems operational
        </div>
      </div>

      {/* Stats */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Building2 size={19} />
            </div>
            <span className="stat-label">Organizations</span>
          </div>
          <strong className="stat-value">{organizations.length}</strong>
          <span className="stat-description">Total registered tenants</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Users size={19} />
            </div>
            <span className="stat-label">Employees</span>
          </div>
          <strong className="stat-value">{users.length}</strong>
          <span className="stat-description">Across all organizations</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <CalendarDays size={19} />
            </div>
            <span className="stat-label">Active Shifts</span>
          </div>
          <strong className="stat-value">{shifts.length}</strong>
          <span className="stat-description">Currently configured</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Activity size={19} />
            </div>
            <span className="stat-label">Today's Shifts</span>
          </div>
          <strong className="stat-value">{todaysShifts.length}</strong>
          <span className="stat-description">
            {todaysShifts.length > 0
              ? "Scheduled today"
              : "There are no shifts today"}
          </span>
        </div>
      </section>

      {/* Panels */}
      <div className="dashboard-grid">
        <SystemHealthPanel />
        <PlatformActivityPanel />
      </div>
    </>
  );
}