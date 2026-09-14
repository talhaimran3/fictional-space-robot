// multi-tenant-saas/frontend/src/pages/SingleOrganizationPage/SingleOrganizationPage.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  X,
  Clock3,
  CalendarDays,
} from "lucide-react";
import apiClient from "../../../api/client.js";
import { AddEditFormModal } from "../../components/organizations/AddEditFormModal.jsx";
import { AddEditShiftFormModal } from "../../components/shifts/AddEditShiftFormModal.jsx";
import "./singleOrganizationPage.css";

export const SingleOrganizationPage = () => {
  const { id } = useParams();

  const [organization, setOrganization] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [shiftFilter, setShiftFilter] = useState("all");

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredShifts = shifts.filter((shift) => {
    if (shiftFilter === "all") return true;

    const shiftDate = new Date(shift.start_time);
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    if (shiftFilter === "today") {
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      return shiftDate >= startOfToday && shiftDate < endOfToday;
    }

    if (shiftFilter === "week") {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return shiftDate >= startOfWeek && shiftDate < endOfWeek;
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return shiftDate >= startOfMonth && shiftDate < startOfNextMonth;
  });

  const fetchAllDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [organizationRes, shiftsRes] = await Promise.all([
        apiClient.get(`/organizations/${id}`),
        apiClient.get(`/organizations/${id}/all-shifts`),
      ]);

      if (organizationRes.data?.data) {
        setOrganization(organizationRes.data.data);
      } else {
        throw new Error("Unable to load organization details.");
      }

      setShifts(shiftsRes.data?.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Failed to fetch organization data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDetails();
  }, [id]);

  const openOrgEdit = () => setShowOrgModal(true);

  const openAddShift = () => {
    setEditingShift(null);
    setIsShiftModalOpen(true);
  };

  const openEditShift = (shift) => {
    setEditingShift(shift);
    setIsShiftModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === "shift") {
        await apiClient.delete(
          `/organizations/${id}/shifts/${deleteTarget.id}`
        );
      } else if (deleteTarget.type === "org") {
        await apiClient.delete(`/organizations/${id}`);
        window.location.href = "/admin/org/all";
        return;
      }
      setDeleteTarget(null);
      await fetchAllDetails();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Delete failed."
      );
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="sop-page">
        <div className="sop-loading">
          <div className="sop-spinner" />
          <p>Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error && !organization) {
    return (
      <div className="sop-page">
        <div className="sop-error">
          <p>{error}</p>
          <Link to="/admin/org/all" className="sop-btn sop-btn--ghost">
            ← Back to organizations
          </Link>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="sop-page">
        <div className="sop-error">
          <p>Organization not found.</p>
          <Link to="/admin/org/all" className="sop-btn sop-btn--ghost">
            ← Back to organizations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sop-page">
      {/* Header */}
      <header className="sop-header">
        <div className="sop-header__left">
          <Link to="/admin/org/all" className="sop-back">
            <ArrowLeft size={16} />
            Organizations
          </Link>

          <div className="sop-title-row">
            <div className="sop-title-icon">
              <Building2 size={22} />
            </div>
            <div>
              <h1>{organization.name}</h1>
              <p>Organization management and shift schedule</p>
            </div>
          </div>
        </div>

        <div className="sop-header__actions">
          <button
            type="button"
            className="sop-btn sop-btn--ghost"
            onClick={openOrgEdit}
          >
            <Pencil size={16} />
            Edit org
          </button>
          <button
            type="button"
            className="sop-btn sop-btn--primary"
            onClick={openAddShift}
          >
            <Plus size={16} />
            Schedule shift
          </button>
        </div>
      </header>

      {/* Info cards */}
      <div className="sop-info">
        <div className="sop-info__item">
          <span>Organization</span>
          <strong>{organization.name}</strong>
        </div>
        <div className="sop-info__item">
          <span>Slug</span>
          <strong className="sop-slug">{organization.slug}</strong>
        </div>
        <div className="sop-info__item">
          <span>Created</span>
          <strong>
            {new Date(organization.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </strong>
        </div>
        <div className="sop-info__item">
          <span>Total shifts</span>
          <strong>{shifts.length}</strong>
        </div>
      </div>

      {/* Shifts section */}
      <section className="sop-shifts">
        <div className="sop-shifts__header">
          <div>
            <h2>Shifts</h2>
            <p>Manage scheduled shifts for this organization.</p>
          </div>

          <div className="sop-shifts__tools">
            <label
              className="sop-badge"
              htmlFor="shift-filter"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span>Show</span>
              <select
                id="shift-filter"
                value={shiftFilter}
                onChange={(event) => setShiftFilter(event.target.value)}
                style={{ border: "0", background: "transparent", color: "inherit", fontWeight: 600, cursor: "pointer", outline: "none" }}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
              <span>
                ({filteredShifts.length})
              </span>
            </label>
            <div className="sop-view-toggle">
              <button
                type="button"
                className={`sop-view-btn ${viewMode === "grid" ? "is-active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <LayoutGrid size={17} />
              </button>
              <button
                type="button"
                className={`sop-view-btn ${viewMode === "list" ? "is-active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List size={17} />
              </button>
            </div>
          </div>
        </div>

        {filteredShifts.length === 0 ? (
          <div className="sop-empty">
            <div className="sop-empty__icon">
              <Clock3 size={28} />
            </div>
            <h3>
              {shifts.length === 0 ? "No shifts scheduled" : "No matching shifts"}
            </h3>
            <p>
              {shifts.length === 0
                ? "This organization currently has no operational shifts."
                : "Try another date range to see scheduled shifts."}
            </p>
            <button
              type="button"
              className="sop-btn sop-btn--primary"
              onClick={openAddShift}
            >
              <Plus size={16} />
              Create the first shift
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="sop-shift-grid">
            {filteredShifts.map((shift) => (
              <article key={shift.id} className="sop-shift-card">
                <div className="sop-shift-card__actions">
                  <button
                    type="button"
                    className="sop-icon-btn"
                    title="Edit"
                    onClick={() => openEditShift(shift)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="sop-icon-btn sop-icon-btn--danger"
                    title="Delete"
                    onClick={() =>
                      setDeleteTarget({
                        type: "shift",
                        id: shift.id,
                        name: shift.title || shift.name || "Scheduled Shift",
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="sop-shift-card__body">
                  <span className="sop-label">Shift</span>
                  <h3>{shift.title || shift.name || "Scheduled Shift"}</h3>

                  <div className="sop-time-meta">
                    <div>
                      <span>Start</span>
                      <strong>
                        {new Date(shift.start_time).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </strong>
                    </div>
                    <div>
                      <span>End</span>
                      <strong>
                        {new Date(shift.end_time).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </strong>
                    </div>
                    <div>
                      <span>Total hours</span>
                      <strong>{shift.total_hours ?? "—"}</strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sop-shift-list">
            {filteredShifts.map((shift) => (
              <article key={shift.id} className="sop-shift-row">
                <div className="sop-shift-row__main">
                  <div className="sop-shift-row__icon">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h3>{shift.title || shift.name || "Scheduled Shift"}</h3>
                    <p>
                      {new Date(shift.start_time).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      →{" "}
                      {new Date(shift.end_time).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {shift.total_hours != null && (
                        <> · {shift.total_hours} hrs</>
                      )}
                    </p>
                  </div>
                </div>

                <div className="sop-shift-row__actions">
                  <button
                    type="button"
                    className="sop-icon-btn"
                    title="Edit"
                    onClick={() => openEditShift(shift)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="sop-icon-btn sop-icon-btn--danger"
                    title="Delete"
                    onClick={() =>
                      setDeleteTarget({
                        type: "shift",
                        id: shift.id,
                        name: shift.title || shift.name || "Scheduled Shift",
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Edit Organization Modal */}
      <AddEditFormModal
        isOpen={showOrgModal}
        onClose={() => setShowOrgModal(false)}
        organization={organization}
        onSuccess={fetchAllDetails}
      />

      {/* Add / Edit Shift Modal */}
      <AddEditShiftFormModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        organizationId={id}
        shift={editingShift}
        onSuccess={fetchAllDetails}
      />

      {/* Delete confirm */}
      {deleteTarget && (
        <div
          className="sop-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="sop-modal sop-modal--sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="sop-modal__header">
              <h2>
                Delete{" "}
                {deleteTarget.type === "shift" ? "shift" : "organization"}?
              </h2>
              <button
                type="button"
                className="sop-modal__close"
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="sop-modal__body">
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.name}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="sop-modal__actions">
              <button
                type="button"
                className="sop-btn sop-btn--ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sop-btn sop-btn--danger"
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};