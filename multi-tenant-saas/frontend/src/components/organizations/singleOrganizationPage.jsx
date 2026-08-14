
// multi-tenant-saas/frontend/src/pages/SingleOrganizationPage/SingleOrganizationPage.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../../api/client.js";
import "./singleOrganizationPage.css";

export const SingleOrganizationPage = () => {
  const { id } = useParams();

  const [company, setCompany] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchAllDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [companyRes, shiftsRes] = await Promise.all([
          apiClient.get(`/companies/${id}`),
          apiClient.get(`/companies/${id}/all-shifts`),
        ]);

        if (companyRes.data?.data) {
          setCompany(companyRes.data.data);
        } else {
          throw new Error("Unable to load organization details.");
        }

        setShifts(shiftsRes.data?.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.response?.data?.message ||
            err.message ||
            "Failed to fetch organization data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="single-org-page">
        <div className="status-wrapper">
          Loading organization details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="single-org-page">
        <div className="status-wrapper error">
          {error}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="single-org-page">
        <div className="status-wrapper">
          Organization not found.
        </div>
      </div>
    );
  }

  return (
    <div className="single-org-page">
      <div className="single-org-container">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="single-org-page-header">
          <div>
            <Link
              to="/org/all"
              className="back-link"
            >
              ← Organizations
            </Link>

            <div className="organization-heading">
              <div className="organization-icon">
                🏢
              </div>

              <div>
                <h1>{company.name}</h1>

                <p>
                  Organization management and shift schedule
                </p>
              </div>
            </div>
          </div>

          <Link
            to={`/singletenant/${id}/add-shift`}
            className="schedule-button"
          >
            + Schedule New Shift
          </Link>
        </div>

        {/* =========================
            ORGANIZATION INFORMATION
        ========================= */}

        <div className="organization-info-card">
          <div className="info-item">
            <span className="info-label">
              Organization
            </span>

            <strong>
              {company.name}
            </strong>
          </div>

          <div className="info-item">
            <span className="info-label">
              Slug Namespace
            </span>

            <strong className="slug-value">
              {company.slug}
            </strong>
          </div>

          <div className="info-item">
            <span className="info-label">
              Created On
            </span>

            <strong>
              {new Date(
                company.created_at,
              ).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </div>

          <div className="info-item">
            <span className="info-label">
              Total Shifts
            </span>

            <strong>
              {shifts.length}
            </strong>
          </div>
        </div>

        {/* =========================
            SHIFTS SECTION
        ========================= */}

        <section className="shifts-section">
          <div className="shifts-section-header">
            <div>
              <h2>
                Shifts
              </h2>

              <p>
                Manage scheduled shifts for this organization.
              </p>
            </div>

            <span className="shift-count-badge">
              {shifts.length}{" "}
              {shifts.length === 1
                ? "Shift"
                : "Shifts"}
            </span>
          </div>

          {/* Empty State */}

          {shifts.length === 0 ? (
            <div className="no-shifts">
              <div className="no-shifts-icon">
                🕐
              </div>

              <h3>
                No shifts scheduled
              </h3>

              <p>
                This organization currently has no
                operational shifts.
              </p>

              <Link
                to={`/singletenant/${id}/add-shift`}
                className="create-shift-link"
              >
                Create the first shift
              </Link>
            </div>
          ) : (
            <div className="shifts-display-grid">
              {shifts.map((shift) => (
                <article
                  key={shift.id}
                  className="shift-display-card"
                >
                  {/* Shift Actions */}

                  <div className="shift-actions">
                    <Link
                      to={`/singletenant/${id}/edit-shift/${shift.id}`}
                      className="shift-action edit"
                      title="Edit shift"
                    >
                      ✏️
                    </Link>

                    <Link
                      to={`/singletenant/${id}/delete-shift/${shift.id}`}
                      className="shift-action delete"
                      title="Delete shift"
                    >
                      🗑️
                    </Link>
                  </div>

                  {/* Accent */}

                  <div className="shift-card-accent"></div>

                  {/* Content */}

                  <div className="shift-card-content">
                    <span className="shift-label">
                      SHIFT
                    </span>

                    <h3>
                      {shift.name || "Scheduled Shift"}
                    </h3>

                    <div className="shift-time-meta">
                      <div className="shift-time-row">
                        <span>
                          START
                        </span>

                        <strong>
                          {new Date(
                            shift.start_time,
                          ).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </strong>
                      </div>

                      <div className="shift-time-row">
                        <span>
                          END
                        </span>

                        <strong>
                          {new Date(
                            shift.end_time,
                          ).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

