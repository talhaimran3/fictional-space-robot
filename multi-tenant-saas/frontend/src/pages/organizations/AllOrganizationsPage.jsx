import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  Users,
  UserCheck,
  CalendarDays,
  Clock3,
  ArrowRight,
  LayoutGrid,
  List,
  Plus,
  Pencil,
} from "lucide-react";
import { useOrganizations } from "../../hooks/useOrganizations.js";
import { AddEditFormModal } from "./AddEditFormModal.jsx";
import PageHeader from "../../admin/shared/PageHeader";
import EmptyState from "../../admin/shared/EmptyState";
import LoadingState from "../../admin/shared/LoadingState";
import "../../admin/shared/admin-ui.css";
import "./AllOrganizationsPage.css";

const AllOrganizationsPage = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const { organizations, loading, error, refetch } = useOrganizations();

  const openCreate = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };
  const openEdit = (org) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };
  const handleSuccess = () => {
    if (refetch) refetch();
  };

  const filteredOrganizations = organizations.filter((organization) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      organization.name?.toLowerCase().includes(query) ||
      organization.slug?.toLowerCase().includes(query)
    );
  });

  const getEmployeeCount = (org) => {
    if (Array.isArray(org.employees)) return org.employees.length;
    return org.organization_members ?? org.employeeCount ?? 0;
  };

  const getActiveEmployeeCount = (org) => {
    if (Array.isArray(org.employees)) {
      return org.employees.filter((emp) => emp.status === "active").length;
    }
    return org.activeEmployees ?? 0;
  };

  if (loading) {
    return (
      <div className="sa-page orgs-page">
        <LoadingState message="Loading organizations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="sa-page orgs-page">
        <div className="sa-error sa-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-page orgs-page">
      <PageHeader
        eyebrow="Tenants"
        title="Organizations"
        description="Manage and monitor all organizations on your platform."
        actions={
          <>
            <div className="sa-pill">
              <strong>{organizations.length}</strong>
              <span>
                {organizations.length === 1 ? "organization" : "organizations"}
              </span>
            </div>
            <button type="button" className="sa-btn sa-btn--primary" onClick={openCreate}>
              <Plus size={18} />
              Add Organization
            </button>
          </>
        }
      />

      <div className="sa-toolbar">
        <div className="sa-search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <span className="sa-search__count">{filteredOrganizations.length}</span>}
        </div>
        <div className="sa-view-toggle">
          <button
            type="button"
            className={`sa-view-btn ${viewMode === "grid" ? "is-active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            className={`sa-view-btn ${viewMode === "list" ? "is-active" : ""}`}
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {filteredOrganizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations found"
          description={
            search ? "Try a different search term." : "There are currently no organizations."
          }
          action={
            !search ? (
              <button type="button" className="sa-btn sa-btn--primary" onClick={openCreate}>
                <Plus size={16} />
                Add first organization
              </button>
            ) : null
          }
        />
      ) : viewMode === "grid" ? (
        <div className="orgs-grid">
          {filteredOrganizations.map((org) => (
            <article key={org.id} className="org-card sa-card">
              <div className="org-card__top">
                <div className="org-card__icon">
                  <Building2 size={22} />
                </div>
                <div className="org-card__meta">
                  <h2>{org.name}</h2>
                  <span className="org-card__slug">{org.slug}</span>
                </div>
                <button
                  type="button"
                  className="org-card__edit"
                  onClick={() => openEdit(org)}
                  title="Edit organization"
                >
                  <Pencil size={15} />
                </button>
              </div>
              <div className="org-card__stats">
                <OrgStat icon={Users} label="Employees" value={getEmployeeCount(org)} />
                <OrgStat icon={UserCheck} label="Active" value={getActiveEmployeeCount(org)} />
                <OrgStat
                  icon={CalendarDays}
                  label="Shifts"
                  value={org.shifts?.length ?? org.shiftCount ?? 0}
                />
                <OrgStat icon={Clock3} label="Today" value={org.todayShiftCount ?? 0} />
              </div>
              <Link to={`/admin/organizations/${org.id}`} className="org-card__action">
                View details
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="orgs-list">
          {filteredOrganizations.map((org) => (
            <article key={org.id} className="org-row sa-card">
              <div className="org-row__main">
                <div className="org-row__icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2>{org.name}</h2>
                  <span>{org.slug}</span>
                </div>
              </div>
              <div className="org-row__stats">
                <span>
                  <Users size={14} /> {getEmployeeCount(org)} employees
                </span>
                <span>
                  <CalendarDays size={14} /> {org.shifts?.length ?? org.shiftCount ?? 0} shifts
                </span>
                <span>
                  <Clock3 size={14} /> {org.todayShiftCount ?? 0} today
                </span>
              </div>
              <div className="org-row__actions">
                <button type="button" className="sa-btn sa-btn--ghost" onClick={() => openEdit(org)}>
                  <Pencil size={14} />
                  Edit
                </button>
                <Link to={`/admin/organizations/${org.id}`} className="sa-btn sa-btn--ghost">
                  View
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <AddEditFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organization={editingOrg}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

const OrgStat = ({ icon: Icon, label, value }) => (
  <div className="org-stat">
    <div className="org-stat__icon">
      <Icon size={14} />
    </div>
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

export default AllOrganizationsPage;
