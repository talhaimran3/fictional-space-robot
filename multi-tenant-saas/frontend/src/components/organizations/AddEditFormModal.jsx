// multi-tenant-saas/frontend/src/components/organizations/AddEditFormModal.jsx

import { useState, useEffect } from "react";
import { Building2, X } from "lucide-react";
import apiClient from "../../../api/client.js";
import "./AddEditFormModal.css";

// Common IANA timezones (you can expand this list later)
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

export const AddEditFormModal = ({
  isOpen,
  onClose,
  organization = null, // null = create, object = edit
  onSuccess,
}) => {
  const isEdit = Boolean(organization?.id);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (organization) {
        setName(organization.name || "");
        setSlug(organization.slug || "");
        setTimezone(organization.timezone || "UTC");
        setStatus(organization.status || "active");
      } else {
        setName("");
        setSlug("");
        setTimezone("UTC");
        setStatus("active");
      }
      setError("");
    }
  }, [isOpen, organization]);

  const slugify = (text) =>
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (event) => {
    const value = event.target.value;
    setName(value);

    // Auto-suggest slug only on create
    if (!isEdit && (!slug || slug === slugify(name))) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !slug.trim()) {
      setError("Organization name and slug are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        timezone: timezone || "UTC",
        status: status || "active",
      };

      let response;
      if (isEdit) {
        response = await apiClient.put(
          `/admin/update-tenant/${organization.id}`,
          payload
        );
      } else {
        response = await apiClient.post("/admin/create-tenant", payload);
      }

      onSuccess?.(response.data.data);
      onClose();
    //   refresh the page
        window.location.reload();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          `Unable to ${isEdit ? "update" : "create"} organization.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="add-edit-org-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="add-org-icon">
          <Building2 size={26} />
        </div>

        <h2 className="add-org-title">
          {isEdit ? "Edit Organization" : "Add New Organization"}
        </h2>
        <p className="add-org-desc">
          {isEdit
            ? "Update the organization details below."
            : "Fill in the details to add a new tenant."}
        </p>

        <form onSubmit={handleSubmit} className="add-org-form">
          <label htmlFor="organization-name">
            Organization name <span className="required">*</span>
            <input
              id="organization-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Example Organization"
              autoFocus
              required
            />
          </label>

          <label htmlFor="organization-slug">
            Organization slug <span className="required">*</span>
            <input
              id="organization-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="example-organization"
              required
            />
          </label>

          <label htmlFor="organization-timezone">
            Timezone
            <select
              id="organization-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="organization-status">
            Status
            <select
              id="organization-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="add-org-btn secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="add-org-btn" disabled={loading}>
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update Organization"
                : "Create Organization"}
            </button>
          </div>
        </form>

        {error && <div className="add-org-error">{error}</div>}
      </div>
    </div>
  );
};