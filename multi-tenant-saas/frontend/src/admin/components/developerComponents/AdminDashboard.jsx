import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  Clock3,
  CalendarDays,
  TrendingUp,
  Activity,
  ArrowRight,
  IdCardLanyard,
  Plus,
} from "lucide-react";
import "./AdminDashboard.css";
import { useOrganizations } from "../../../hooks/useOrganizations";

export default function AdminDashboard() {
  const { organizations, loading } = useOrganizations();
  const stats = {
    organizations: organizations.length,
    employees: organizations.reduce(
      (sum, org) => sum + (org.members.length || org.employees || 0),
      0
    ),
    shifts: organizations.reduce(
      (sum, org) => sum + (org.shifts?.length || org.shiftCount || 0),
      0
    ),
    activeShifts: organizations.reduce(
      (sum, org) => sum + (org.todayShiftCount || 0),
      0
    ),
  };
  const recentOrgs = organizations.slice(0, 5);

  if (loading) {
    return (
      <div className="sa-dash">
        <div className="sa-dash-loading">
          <div className="sa-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-dash">
      <header className="sa-dash-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of your multi-tenant platform</p>
        </div>
        <Link to="/admin/organizations" className="sa-dash-btn sa-dash-btn--primary">
          <Plus size={18} />
          Manage Organizations
        </Link>
      </header>

      <div className="sa-stats-grid">
        <StatCard icon={Building2} label="Organizations" value={stats.organizations} color="blue" />
        <StatCard icon={Users} label="Employees" value={stats.employees} color="green" />
        <StatCard icon={CalendarDays} label="Total Shifts" value={stats.shifts} color="purple" />
        <StatCard icon={Clock3} label="Active Today" value={stats.activeShifts} color="orange" />
      </div>

      <div className="sa-dash-grid">
        <section className="sa-card">
          <div className="sa-card-header">
            <h2>Recent Organizations</h2>
            <Link to="/admin/organizations" className="sa-view-all">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrgs.length === 0 ? (
            <div className="sa-empty">
              <Building2 size={28} />
              <p>No organizations yet</p>
              <Link to="/admin/organizations" className="sa-dash-btn sa-dash-btn--primary">
                Add first organization
              </Link>
            </div>
          ) : (
            <ul className="sa-org-list">
              {recentOrgs.map((org) => (
                <li key={org.id}>
                  <Link to={`/admin/organizations/${org.id}`} className="sa-org-item">
                    <div className="sa-org-icon">
                      <Building2 size={18} />
                    </div>
                    <div className="sa-org-info">
                      <strong>{org.name}</strong>
                      <span>{org.slug}</span>
                    </div>
                    <ArrowRight size={16} className="sa-org-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="sa-card">
          <div className="sa-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="sa-actions">
            <Link to="/admin/organizations" className="sa-action">
              <Building2 size={20} />
              <span>All Organizations</span>
            </Link>
            <Link to="/admin/employees" className="sa-action">
              <IdCardLanyard size={20} />
              <span>All Employees</span>
            </Link>
            <Link to="/admin/shifts" className="sa-action">
              <Activity size={20} />
              <span>All Shifts</span>
            </Link>
            <Link to="/admin/developer" className="sa-action">
              <TrendingUp size={20} />
              <span>Developer Portal</span>
            </Link>
            <Link to="/admin/apihealth" className="sa-action">
              <Activity size={20} />
              <span>API Health</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`sa-stat sa-stat--${color}`}>
      <div className="sa-stat-icon">
        <Icon size={22} />
      </div>
      <div className="sa-stat-body">
        <span className="sa-stat-label">{label}</span>
        <strong className="sa-stat-value">{value}</strong>
      </div>
    </div>
  );
}
