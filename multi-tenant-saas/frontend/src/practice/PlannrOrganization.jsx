import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
  Pencil,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import { useOrganizations } from "../hooks/useOrganizations";
import "./PlannrOrganization.css";

const getMembers = (organization) =>
  Array.isArray(organization?.members) ? organization.members : [];

const getShifts = (organization) =>
  Array.isArray(organization?.shifts) ? organization.shifts : [];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

function MetricCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="pln-orgs__metric">
      <div className={`pln-orgs__metric-icon pln-orgs__metric-icon--${tone}`}>
        <Icon size={19} strokeWidth={1.9} />
      </div>
      <div className="pln-orgs__metric-copy">
        <span>{label}</span>
        <strong>{value.toLocaleString()}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function OrganizationRow({ organization, onEdit, canEdit }) {
  const memberTotal = getMembers(organization).length;
  const shiftTotal = getShifts(organization).length;
  const initials = (organization.name || "O")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="pln-orgs__table-row">
      <div className="pln-orgs__organization-cell">
        <div className="pln-orgs__organization-mark">{initials || "O"}</div>
        <div className="pln-orgs__organization-copy">
          <strong>{organization.name}</strong>
          <span>{organization.slug ? `/${organization.slug}` : "No slug"}</span>
        </div>
      </div>
      <div className="pln-orgs__data-cell">
        <span className="pln-orgs__count">
          <Users size={14} />
          {memberTotal}
        </span>
        <small>{memberTotal === 1 ? "member" : "members"}</small>
      </div>
      <div className="pln-orgs__data-cell">
        <span className="pln-orgs__count">
          <Clock3 size={14} />
          {shiftTotal}
        </span>
        <small>{shiftTotal === 1 ? "shift" : "shifts"}</small>
      </div>
      <div className="pln-orgs__date-cell">
        {formatDate(organization.created_at)}
      </div>
      <div className="pln-orgs__actions-cell">
        {canEdit ? (
          <button
            type="button"
            className="pln-orgs__edit-button"
            onClick={() => onEdit(organization)}
            aria-label={`Edit ${organization.name}`}
          >
            <Pencil size={14} />
            Edit
          </button>
        ) : (
          <span className="pln-orgs__read-only">Read only</span>
        )}
      </div>
    </div>
  );
}

export default function PlannrOrganization() {
  const { user, token } = useAuth();
  const {
    organizations: fetchedOrganizations,
    loading,
    error: loadError,
  } = useOrganizations();
  const [organizations, setOrganizations] = useState([]);
  const [query, setQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [modalOrganization, setModalOrganization] = useState(undefined);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const isDeveloper = user?.role === "developer";

  useEffect(() => {
    const nextOrganizations = Array.isArray(fetchedOrganizations)
      ? fetchedOrganizations
      : [];
    setOrganizations((currentOrganizations) => {
      // The hook may provide a new array reference on every render. Avoid
      // scheduling another render unless the organization data actually changed.
      if (
        JSON.stringify(currentOrganizations) ===
        JSON.stringify(nextOrganizations)
      ) {
        return currentOrganizations;
      }
      return nextOrganizations;
    });
  }, [fetchedOrganizations]);

  const filteredOrganizations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return organizations
      .filter((organization) => {
        const matchesQuery =
          !normalizedQuery ||
          (organization.name || "").toLowerCase().includes(normalizedQuery) ||
          (organization.slug || "").toLowerCase().includes(normalizedQuery);

        const memberTotal = getMembers(organization).length;
        const matchesMembers =
          memberFilter === "all" ||
          (memberFilter === "with-members" && memberTotal > 0) ||
          (memberFilter === "without-members" && memberTotal === 0);

        return matchesQuery && matchesMembers;
      })
      .slice()
      .sort((a, b) => {
        if (sortBy === "name") {
          return (a.name || "").localeCompare(b.name || "");
        }
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return sortBy === "oldest" ? dateA - dateB : dateB - dateA;
      });
  }, [organizations, query, memberFilter, sortBy]);

  const totalMembers = organizations.reduce(
    (total, organization) => total + getMembers(organization).length,
    0,
  );
  const totalShifts = organizations.reduce(
    (total, organization) => total + getShifts(organization).length,
    0,
  );

  const openCreateModal = () => {
    setModalOrganization(null);
    setName("");
    setSlug("");
    setSlugEdited(false);
    setFormError("");
    setNotice("");
  };

  const openEditModal = (organization) => {
    setModalOrganization(organization);
    setName(organization.name || "");
    setSlug(organization.slug || "");
    // Keep an existing tenant slug stable when its display name is edited.
    setSlugEdited(true);
    setFormError("");
    setNotice("");
  };

  const closeModal = () => {
    if (saving) return;
    setModalOrganization(undefined);
    setFormError("");
  };

  const handleNameChange = (value) => {
    setName(value);
    if (!slugEdited && !modalOrganization) setSlug(slugify(value));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isDeveloper) {
      setFormError("Only developers can create or edit organizations.");
      return;
    }

    const cleanName = name.trim();
    const cleanSlug = slug.trim().toLowerCase();
    if (cleanName.length < 2 || !cleanSlug) {
      setFormError(
        "Organization name must be at least 2 characters and slug is required.",
      );
      return;
    }
    if (cleanSlug.length < 2 || !/^[a-z0-9-]+$/.test(cleanSlug)) {
      setFormError(
        "Use at least 2 lowercase letters, numbers, or hyphens in the slug.",
      );
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const headers = { Authorization: `Bearer ${token || ""}` };
      const payload = { name: cleanName, slug: cleanSlug };
      const response = modalOrganization
        ? await apiClient.put(
            `/admin/update-tenant/${encodeURIComponent(modalOrganization.id)}`,
            payload,
            { headers },
          )
        : await apiClient.post("/admin/create-tenant", payload, { headers });

      const savedOrganization = response.data?.data;
      if (!savedOrganization?.id) {
        throw new Error("The server did not return the saved organization.");
      }

      if (modalOrganization) {
        setOrganizations((current) =>
          current.map((organization) =>
            organization.id === savedOrganization.id
              ? { ...organization, ...savedOrganization }
              : organization,
          ),
        );
        setNotice(`${cleanName} was updated successfully.`);
      } else {
        setOrganizations((current) => [
          { ...savedOrganization, members: [], shifts: [] },
          ...current,
        ]);
        setNotice(`${cleanName} was created successfully.`);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("plannr:organizations-updated"));
      }
      setModalOrganization(undefined);
    } catch (error) {
      setFormError(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error.message ||
          "Unable to save this organization.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pln-orgs">
      <header className="pln-orgs__heading">
        <div>
          <p className="pln-orgs__eyebrow">Workspace administration</p>
          <h1>Organizations</h1>
          <p className="pln-orgs__description">
            {isDeveloper
              ? "Create and manage the organizations using your Plannr workspace."
              : "View the organization associated with your account."}
          </p>
        </div>
        <div className="pln-orgs__heading-meta">
          <span
            className={`pln-orgs__access ${isDeveloper ? "is-developer" : ""}`}
          >
            {isDeveloper ? "Developer access" : "Organization access"}
          </span>
          {isDeveloper && (
            <button
              type="button"
              className="pln-orgs__button pln-orgs__button--primary"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              New organization
            </button>
          )}
        </div>
      </header>

      <div className="pln-orgs__metrics">
        <MetricCard
          icon={Building2}
          label="Organizations"
          value={organizations.length}
          detail={
            isDeveloper ? "Across the workspace" : "Available to your account"
          }
          tone="blue"
        />
        <MetricCard
          icon={Users}
          label="Total members"
          value={totalMembers}
          detail="Across listed organizations"
          tone="green"
        />
        <MetricCard
          icon={Clock3}
          label="Total shifts"
          value={totalShifts}
          detail="Across listed organizations"
          tone="violet"
        />
      </div>

      <div className="pln-orgs__panel">
        <div className="pln-orgs__panel-heading">
          <div>
            <h2>
              {isDeveloper ? "Organization directory" : "Your organization"}
            </h2>
            <p>
              {isDeveloper
                ? "Search, filter, and update organization details."
                : "Organization details available to your account."}
            </p>
          </div>
          <span className="pln-orgs__result-count">
            {filteredOrganizations.length} of {organizations.length}
          </span>
        </div>

        <div className="pln-orgs__toolbar">
          <label className="pln-orgs__search">
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search organizations or slugs..."
              aria-label="Search organizations"
            />
          </label>

          {isDeveloper && (
            <>
              <label className="pln-orgs__select-wrap">
                <span>Members</span>
                <span className="pln-orgs__select-control">
                  <select
                    value={memberFilter}
                    onChange={(event) => setMemberFilter(event.target.value)}
                    aria-label="Filter organizations by member count"
                  >
                    <option value="all">All organizations</option>
                    <option value="with-members">With members</option>
                    <option value="without-members">No members</option>
                  </select>
                  <ChevronDown size={14} />
                </span>
              </label>
              <label className="pln-orgs__select-wrap pln-orgs__sort-wrap">
                <span>Sort by</span>
                <span className="pln-orgs__select-control">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Sort organizations"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A–Z</option>
                  </select>
                  <ChevronDown size={14} />
                </span>
              </label>
            </>
          )}
        </div>

        {loadError && (
          <div className="pln-orgs__error" role="alert">
            <AlertCircle size={16} />
            {loadError}
          </div>
        )}
        {notice && (
          <div className="pln-orgs__notice" role="status">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="pln-orgs__table-wrap">
          <div className="pln-orgs__table-head">
            <span>ORGANIZATION</span>
            <span>MEMBERS</span>
            <span>SHIFTS</span>
            <span>CREATED</span>
            <span>ACTIONS</span>
          </div>

          {loading ? (
            <div className="pln-orgs__empty">
              <span className="pln-orgs__loader" />
              <strong>Loading organizations</strong>
              <span>Fetching organization details...</span>
            </div>
          ) : filteredOrganizations.length ? (
            <div className="pln-orgs__table-body">
              {filteredOrganizations.map((organization) => (
                <OrganizationRow
                  key={organization.id}
                  organization={organization}
                  canEdit={isDeveloper}
                  onEdit={openEditModal}
                />
              ))}
            </div>
          ) : (
            <div className="pln-orgs__empty">
              <Building2 size={25} />
              <strong>
                {organizations.length
                  ? "No matching organizations"
                  : "No organizations yet"}
              </strong>
              <span>
                {organizations.length
                  ? "Try a different search term or member filter."
                  : isDeveloper
                    ? "Create an organization to get started."
                    : "No organization is currently associated with your account."}
              </span>
              {isDeveloper && organizations.length === 0 && (
                <button
                  type="button"
                  className="pln-orgs__button pln-orgs__button--primary"
                  onClick={openCreateModal}
                >
                  <Plus size={16} /> New organization
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="pln-orgs__panel-footer">
          <div>
            <ShieldCheck size={15} />
            <span>Organization access is controlled by your account role.</span>
          </div>
          <span>
            Showing {filteredOrganizations.length}{" "}
            {filteredOrganizations.length === 1
              ? "organization"
              : "organizations"}
          </span>
        </footer>
      </div>

      {modalOrganization !== undefined && (
        <div className="pln-orgs__modal-backdrop" onClick={closeModal}>
          <section
            className="pln-orgs__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pln-orgs-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="pln-orgs__modal-header">
              <div className="pln-orgs__modal-icon">
                <Building2 size={19} />
              </div>
              <div>
                <h2 id="pln-orgs-modal-title">
                  {modalOrganization
                    ? "Edit organization"
                    : "Create organization"}
                </h2>
                <p>
                  {modalOrganization
                    ? "Update the organization name or URL slug."
                    : "Add a new organization to your Plannr workspace."}
                </p>
              </div>
              <button
                type="button"
                className="pln-orgs__close-button"
                onClick={closeModal}
                aria-label="Close dialog"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </header>

            <form className="pln-orgs__modal-form" onSubmit={handleSave}>
              <label>
                <span>Organization name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="e.g. Northstar Logistics"
                  maxLength={120}
                  minLength={2}
                  autoFocus
                  required
                />
              </label>

              <label>
                <span>Organization slug</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(
                      event.target.value.toLowerCase().replace(/\s+/g, "-"),
                    );
                  }}
                  placeholder="e.g. northstar-logistics"
                  maxLength={80}
                  pattern="[a-z0-9-]{2,}"
                  title="Use lowercase letters, numbers, and hyphens."
                  required
                />
                <small>
                  Used as a unique identifier. Use lowercase letters, numbers,
                  and hyphens.
                </small>
              </label>

              {formError && (
                <div className="pln-orgs__form-error" role="alert">
                  <AlertCircle size={15} />
                  {formError}
                </div>
              )}

              <div className="pln-orgs__modal-actions">
                <button
                  type="button"
                  className="pln-orgs__button pln-orgs__button--quiet"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pln-orgs__button pln-orgs__button--primary"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {modalOrganization
                        ? "Save changes"
                        : "Create organization"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
