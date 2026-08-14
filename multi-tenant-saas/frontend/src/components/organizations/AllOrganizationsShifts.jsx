// multi-tenant-saas/frontend/src/components/AllOrganizationsShifts.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaRegBuilding ,FaExternalLinkAlt } from "react-icons/fa";
import { LuClock3 } from "react-icons/lu";


import apiClient from "../../../api/client.js";
import "./AllOrganizationsShifts.css";

export const AllOrganizationsShifts = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            "Failed to fetch organizations",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="organizations-page">
        <div className="status-card">
          <div className="loading-spinner"></div>
          <p>Loading organizations & schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="organizations-page">
        <div className="status-card error-card">
          <h3>Unable to load organizations</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="organizations-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">ADMIN OVERVIEW</p>

          <h1>Organizations</h1>

          <p className="page-description">
            View all tenants and their scheduled shifts.
          </p>
        </div>

        <div className="organization-summary">
          <FaRegBuilding size={20} />
          <div>
            <strong>{organizations.length}</strong>
            <span>Organizations</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {organizations.length === 0 ? (
        <div className="empty-state">
          <FaRegBuilding size={42} />

          <h3>No organizations found</h3>

          <p>
            There are currently no organizations available to display.
          </p>
        </div>
      ) : (
        <div className="organizations-list">
          {organizations.map((org) => (
            <section key={org.id} className="organization-card">
              {/* Organization Header */}
              <div className="organization-header">
                <div className="organization-info">
                  <div className="organization-icon">
                    <FaRegBuilding size={22} />
                  </div>

                  <div>
                    <h2>{org.name}</h2>

                    <p>
                      Tenant ID: <span>{org.id}</span>
                    </p>
                  </div>
                </div>

                <div className="organization-actions">
                  <div className="shift-count">
                    <LuClock3 size={16} />

                    <span>
                      {org.shifts.length}{" "}
                      {org.shifts.length === 1 ? "Shift" : "Shifts"}
                    </span>
                  </div>

                  <Link
                    to={`/singletenant/${org.id}`}
                    className="view-tenant-button"
                  >
                    View Tenant
                    <FaExternalLinkAlt size={15} />
                  </Link>
                </div>
              </div>

              {/* Organization Shifts */}
              <div className="organization-content">
                {org.shifts.length === 0 ? (
                  <div className="no-shifts">
                    <LuClock3 size={20} />

                    <div>
                      <strong>No shifts scheduled</strong>
                      <p>
                        This organization currently has no assigned shifts.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="shift-grid">
                    {org.shifts.map((shift) => (
                      <article key={shift.id} className="shift-card">
                        <div className="shift-card-header">
                          <div>
                            <span className="shift-label">SHIFT</span>

                            <h3>
                              {shift.name || "Scheduled Shift"}
                            </h3>
                          </div>

                          <span className="shift-status">Scheduled</span>
                        </div>

                        <div className="shift-times">
                          <div className="shift-time">
                            <span>START</span>

                            <strong>
                              {new Date(
                                shift.start_time,
                              ).toLocaleString()}
                            </strong>
                          </div>

                          <div className="shift-time">
                            <span>END</span>

                            <strong>
                              {new Date(
                                shift.end_time,
                              ).toLocaleString()}
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
      )}
    </div>
  );
};
