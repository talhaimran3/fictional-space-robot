import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import apiClient from "../../api/client.js";
import ModalShell from "../../admin/shared/ModalShell";
import "../../admin/shared/admin-ui.css";

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
  organization = null,
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

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={Building2}
      title={isEdit ? "Edit Organization" : "Add New Organization"}
      description={
        isEdit
          ? "Update the organization details below."
          : "Fill in the details to add a new tenant."
      }
    >
      {error && <div className="sa-alert">{error}</div>}
      <form onSubmit={handleSubmit} className="sa-form">
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
        <div className="sa-form-actions">
          <button
            type="button"
            className="sa-btn sa-btn--ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="sa-btn sa-btn--primary" disabled={loading}>
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
    </ModalShell>
  );
};
