 
// multi-tenant-saas/frontend/src/pages/Admin/AllOrganizationsPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/client.js";
import "./AllOrganizationsPage.css";

const AllOrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.get("/companies/all");

        setOrganizations(res.data.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load organizations",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const filteredOrganizations = organizations.filter((organization) =>
    organization.name
      ?.toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="organizations-page">
        <div className="page-status">
          Loading organizations...
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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Organizations</h1>

          <p>
            Manage and monitor all organizations.
          </p>
        </div>

        <div className="organization-total">
          {organizations.length} Organizations
        </div>
      </div>

      {/* Search */}
      <div className="organization-toolbar">
        <input
          type="text"
          placeholder="Search organizations..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {/* Organizations */}
      {filteredOrganizations.length === 0 ? (
        <div className="empty-state">
          <h3>No organizations found</h3>

          <p>
            {search
              ? "Try a different search term."
              : "There are currently no organizations."}
          </p>
        </div>
      ) : (
        <div className="organizations-list">
          {filteredOrganizations.map((organization) => (
            <div
              key={organization.id}
              className="organization-card"
            >
              {/* Organization Information */}
              <div className="organization-main">
                <div className="organization-icon">
                  🏢
                </div>

                <div className="organization-details">
                  <h2>{organization.name}</h2>

                  <span>
                    {organization.slug}
                  </span>
                </div>
              </div>

              {/* Organization Statistics */}
              <div className="organization-stats">
                <div className="stat">
                  <span>Employees</span>

                  <strong>
                    {organization.employeeCount ?? 0}
                  </strong>
                </div>

                <div className="stat">
                  <span>Active Employees</span>

                  <strong>
                    {organization.activeEmployees ?? 0}
                  </strong>
                </div>

                <div className="stat">
                  <span>Shifts</span>

                  <strong>
                    {organization.shiftCount ?? 0}
                  </strong>
                </div>

                <div className="stat">
                  <span>Today</span>

                  <strong>
                    {organization.todayShiftCount ?? 0}
                  </strong>
                </div>
              </div>

              {/* View Organization */}
              <div className="organization-action">
                <Link
                
                  to={`/org/all/${organization.id}`}
                  className="view-button"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrganizationsPage;
