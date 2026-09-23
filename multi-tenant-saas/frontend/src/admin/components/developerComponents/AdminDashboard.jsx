// src/pages/admin/AdminDashboard.jsx

import { Link } from "react-router-dom";
import {
    Building2,
    Users,
    Clock3,
    CalendarDays,
    TrendingUp,
    Activity,
    ArrowRight,IdCardLanyard,
    Plus,
} from "lucide-react";
import "./AdminDashboard.css";
import { useOrganizations } from "../../../hooks/useOrganizations";

export default function AdminDashboard() {
    const { organizations, loading } = useOrganizations();
    const stats = {
        organizations: organizations.length,
        employees: organizations.reduce(
            (sum, org) => sum + (org.members || org.employees || 0),
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
            <div className="dashboard">
                <div className="dashboard-loading">
                    <div className="spinner" />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Header */}
                                <h1>Admin Dashboard</h1>
                    <p>Overview of your multi-tenant platform</p>

            <header className="dashboard-header">
             
                <Link to="/admin/org/all" className="dashboard-btn primary">
                    <Plus size={18} />
                    Manage Organizations
                </Link>
            </header>

            {/* Stats cards */}
            <div className="stats-grid">
                <StatCard
                    icon={Building2}
                    label="Organizations"
                    value={stats.organizations}
                    color="blue"
                />
                <StatCard
                    icon={Users}
                    label="Employees"
                    value={stats.employees.length}
                    color="green"
                />
                <StatCard
                    icon={CalendarDays}
                    label="Total Shifts"
                    value={stats.shifts}
                    color="purple"
                />
                <StatCard
                    icon={Clock3}
                    label="Active Today"
                    value={stats.activeShifts}
                    color="orange"
                />
            </div>

            {/* Content grid */}
            <div className="dashboard-grid">
                {/* Recent organizations */}
                <section className="dashboard-card">
                    <div className="card-header">
                        <h2>Recent Organizations</h2>
                        <Link to="/admin/org/all" className="view-all">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>

                    {recentOrgs.length === 0 ? (
                        <div className="empty-state">
                            <Building2 size={28} />
                            <p>No organizations yet</p>
                            <Link to="/admin/org/all" className="dashboard-btn primary">
                                Add first organization
                            </Link>
                        </div>
                    ) : (
                        <ul className="org-list">
                            {recentOrgs.map((org) => (
                                <li key={org.id}>
                                    <Link to={`/org/all/${org.id}`} className="org-item">
                                        <div className="org-item-icon">
                                            <Building2 size={18} />
                                        </div>
                                        <div className="org-item-info">
                                            <strong>{org.name}</strong>
                                            <span>{org.slug}</span>
                                        </div>
                                        <ArrowRight size={16} className="org-item-arrow" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Quick actions */}
                <section className="dashboard-card">
                    <div className="card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="quick-actions">
                        <Link to="/admin/org/all" className="action-btn">
                            <Building2 size={20} />
                            <span>All Organizations</span>
                        </Link>
                         <Link to="/admin/employees" className="action-btn">
                            <IdCardLanyard size={20} />
                            <span>All Employees</span>
                        </Link>
                        <Link to="/admin/admin" className="action-btn">
                            <Activity size={20} />
                            <span>All Shifts</span>
                        </Link>
                        <Link to="/admin/developer" className="action-btn">
                            <TrendingUp size={20} />
                            <span>Developer Portal</span>
                        </Link>
                        <Link to="/admin/apihealth" className="action-btn">
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
        <div className={`stat-card stat-card--${color}`}>
            <div className="stat-card-icon">
                <Icon size={22} />
            </div>
            <div className="stat-card-content">
                <span className="stat-label">{label}</span>
                <strong className="stat-value">{value}</strong>
            </div>
        </div>
    );
}