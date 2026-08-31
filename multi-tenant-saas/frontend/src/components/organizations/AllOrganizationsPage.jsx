// multi-tenant-saas/frontend/src/pages/Admin/AllOrganizationsPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  Users,
  UserCheck,
  CalendarDays,
  Clock3,
  ArrowRight,
} from "lucide-react";

import apiClient from "../../../api/client.js";
import "./AllOrganizationsPage.css";
import { useCompanies } from "../../../hooks/useCompanies.js";

const AllOrganizationsPage = () => {
  const [search, setSearch] = useState("");
  const { companies, loading, error } = useCompanies();


  const filteredOrganizations = companies.filter((organization) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      organization.name?.toLowerCase().includes(query) ||
      organization.slug?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="organizations-page">
        <div className="page-status">
          Loading companies...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="organizations-page">
        <div className="page-status error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="organizations-page">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">
        <div>
          <span className="page-eyebrow">
            TENANTS
          </span>

          <h1>Organizations</h1>

          <p>
            Manage and monitor all organizations
            on your platform.
          </p>
        </div>

        <div className="organization-total">
          <strong>{companies.length}</strong>

          <span>
            {companies.length === 1
              ? "Company"
              : "Companies"}
          </span>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="organization-toolbar">
        <div className="search-wrapper">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <span className="search-count">
              {filteredOrganizations.length}
            </span>
          )}
        </div>
      </div>

      {/* =========================
          ORGANIZATION LIST
      ========================= */}

      {filteredOrganizations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Building2 size={22} />
          </div>

          <h3>No organizations found</h3>

          <p>
            {search
              ? "Try a different search term."
              : "There are currently no organizations."}
          </p>
        </div>
      ) : (
        <div className="organizations-list">
          {companies.map(
            (organization) => (
              <article
                key={organization.id}
                className="organization-card"
              >
                {/* Organization */}

                <div className="organization-main">
                  <div className="organization-icon">
                    <Building2 size={20} />
                  </div>

                  <div className="organization-details">
                    <h2>{organization.name}</h2>

                    <span>
                      {organization.slug}
                    </span>
                  </div>
                </div>

                {/* Statistics */}

                <div className="organization-stats">
                  <OrganizationStat
                    icon={Users}
                    label="Employees"
                    value={
                      organization.organization_members ?? 0
                    }
                  />

                  <OrganizationStat
                    icon={UserCheck}
                    label="Active Employees"
                    value={
                      organization.activeEmployees ?? 0
                    }
                  />

                  <OrganizationStat
                    icon={CalendarDays}
                    label="Shifts"
                    value={
                      organization.shifts.length ?? 0
                    }
                  />

                  <OrganizationStat
                    icon={Clock3}
                    label="Today"
                    value={
                      organization.todayShiftCount ?? 0
                    }
                  />
                </div>

                {/* Action */}

                <div className="organization-action">
                  <Link
                    to={`/org/all/${organization.id}`}
                    className="view-button"
                  >
                    <span>View</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </div>
  );
};

const OrganizationStat = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="organization-stat">
      <div className="organization-stat-icon">
        <Icon size={15} />
      </div>

      <div className="organization-stat-content">
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
};

export default AllOrganizationsPage;