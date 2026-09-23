// multi-tenant-saas/frontend/src/components/AllOrganizationsShifts.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ExternalLink,
  Clock3,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";

import apiClient from "../../api/client.js";
import "./AllOrganizationsShifts.css";

export const AllOrganizationsShifts = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list groups by org; grid is flatter

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get("/shifts/all");
        setOrganizations(res.data.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to fetch organizations"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  const filtered = organizations.filter((org) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      org.name?.toLowerCase().includes(q) ||
      String(org.id).includes(q)
    );
  });

  if (loading) {
    return (
      <div className="aos-page">
        <div className="aos-status">
          <div className="aos-spinner" />
          <p>Loading organizations & schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aos-page">
        <div className="aos-status aos-status--error">
          <h3>Unable to load organizations</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aos-page">
      {/* Header */}
      <header className="aos-header">
        <div>
          <p className="aos-eyebrow">Admin overview</p>
          <h1>Organizations & Shifts</h1>
          <p className="aos-desc">
            View all tenants and their scheduled shifts in one place.
          </p>
        </div>

        <div className="aos-summary">
          <Building2 size={20} />
          <div>
            <strong>{organizations.length}</strong>
            <span>Organizations</span>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="aos-toolbar">
        <div className="aos-search">
          <Search size={17} className="aos-search__icon" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="aos-view-toggle">
          <button
            type="button"
            className={`aos-view-btn ${viewMode === "list" ? "is-active" : ""}`}
            onClick={() => setViewMode("list")}
            title="Grouped list"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            className={`aos-view-btn ${viewMode === "grid" ? "is-active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Compact grid"
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="aos-empty">
          <Building2 size={36} />
          <h3>No organizations found</h3>
          <p>
            {search
              ? "Try a different search term."
              : "There are currently no organizations available."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="aos-list">
          {filtered.map((org) => (
            <section key={org.id} className="aos-org-card">
              <div className="aos-org-header">
                <div className="aos-org-info">
                  <div className="aos-org-icon">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h2>{org.name}</h2>
                    <p>
                      Tenant ID: <span>{org.id}</span>
                    </p>
                  </div>
                </div>

                <div className="aos-org-actions">
                  <div className="aos-shift-count">
                    <Clock3 size={15} />
                    <span>
                      {org.shifts?.length ?? 0}{" "}
                      {(org.shifts?.length ?? 0) === 1 ? "Shift" : "Shifts"}
                    </span>
                  </div>
                  <Link
                    to={`/singletenant/${org.id}`}
                    className="aos-view-btn-link"
                  >
                    View tenant
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>

              <div className="aos-org-body">
                {!org.shifts || org.shifts.length === 0 ? (
                  <div className="aos-no-shifts">
                    <Clock3 size={18} />
                    <div>
                      <strong>No shifts scheduled</strong>
                      <p>This organization currently has no assigned shifts.</p>
                    </div>
                  </div>
                ) : (
                  <div className="aos-shift-grid">
                    {org.shifts.map((shift) => (
                      <article key={shift.id} className="aos-shift-card">
                        <div className="aos-shift-card__head">
                          <div>
                            <span className="aos-label">Shift</span>
                            <h3>{shift.name || "Scheduled Shift"}</h3>
                          </div>
                          <span className="aos-status-pill">Scheduled</span>
                        </div>
                        <div className="aos-shift-times">
                          <div>
                            <span>Start</span>
                            <strong>
                              {new Date(shift.start_time).toLocaleString()}
                            </strong>
                          </div>
                          <div>
                            <span>End</span>
                            <strong>
                              {new Date(shift.end_time).toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Compact grid: one card per org with shift count */
        <div className="aos-compact-grid">
          {filtered.map((org) => (
            <article key={org.id} className="aos-compact-card">
              <div className="aos-compact-card__icon">
                <Building2 size={22} />
              </div>
              <h2>{org.name}</h2>
              <p className="aos-compact-card__id">ID: {org.id}</p>
              <div className="aos-compact-card__meta">
                <Clock3 size={14} />
                <span>
                  {org.shifts?.length ?? 0}{" "}
                  {(org.shifts?.length ?? 0) === 1 ? "shift" : "shifts"}
                </span>
              </div>
              <Link
                to={`/singletenant/${org.id}`}
                className="aos-compact-card__link"
              >
                View tenant
                <ExternalLink size={13} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
