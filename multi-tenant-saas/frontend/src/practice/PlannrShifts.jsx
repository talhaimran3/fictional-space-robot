import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import { useOrganizations } from "../hooks/useOrganizations";
import { useShifts } from "../hooks/useShifts";
import ShiftCalendar from "./ShiftCalendar";
import ShiftModal from "./ShiftModal";
import "./PlannrShifts.css";

const startOfWeek = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalInputValue = (date) => {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
};

const rangeLabel = (view, date) => {
  if (view === "month") {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
  }
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${new Intl.DateTimeFormat(undefined, { month: "short" }).format(start)} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(start)} – ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(end)}`;
};

export default function PlannrShifts() {
  const { user } = useAuth();
  const { organizations, loading: organizationsLoading, error: organizationsError } = useOrganizations();
  const [searchParams, setSearchParams] = useSearchParams();
  const organizationId = searchParams.get("organizationId") || "";
  const selectedOrganization = organizations.find((organization) => organization.id === organizationId);
  const { shifts, loading: shiftsLoading, error: shiftsError, refetch } = useShifts(organizationId);
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const isDeveloper = user?.role === "developer";

  useEffect(() => {
    if (organizationsLoading || organizations.length === 0) return;
    if (organizations.some((organization) => organization.id === organizationId)) return;

    const userOrganizationId = user?.organization_id || user?.organizationId;
    const fallback = organizations.find((organization) => organization.id === userOrganizationId) || organizations[0];
    if (!fallback) return;

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("organizationId", fallback.id);
      return next;
    }, { replace: true });
  }, [organizations, organizationsLoading, organizationId, setSearchParams, user]);

  const employees = useMemo(
    () => selectedOrganization?.members || [],
    [selectedOrganization]
  );

  const navigateDate = (direction) => {
    setCurrentDate((current) => {
      const next = new Date(current);
      if (view === "month") next.setMonth(next.getMonth() + direction);
      else next.setDate(next.getDate() + direction * 7);
      return next;
    });
  };

  const openNewShift = ({ date = currentDate, employeeId = "" } = {}) => {
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    const end = new Date(date);
    end.setHours(17, 0, 0, 0);
    setActionError("");
    setModal({
      shift: null,
      initialValues: {
        employee_id: employeeId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        name: "Scheduled Shift",
        status: "scheduled",
      },
    });
  };

  const openEditShift = (shift) => {
    if (!isDeveloper) return;
    setActionError("");
    setModal({ shift, initialValues: {} });
  };

  const saveShift = async (payload) => {
    if (!isDeveloper) throw new Error("Only developers can manage shifts.");
    if (!organizationId) throw new Error("Select an organization first.");

    setSaving(true);
    setActionError("");
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };
      if (modal.shift) {
        await apiClient.put(
          `/organizations/${encodeURIComponent(organizationId)}/edit-shift/${encodeURIComponent(modal.shift.id)}`,
          payload,
          { headers }
        );
      } else {
        await apiClient.post(
          `/organizations/${encodeURIComponent(organizationId)}/add-shift`,
          payload,
          { headers }
        );
      }
      setModal(null);
      refetch();
    } catch (error) {
      const message = error?.response?.data?.error || error?.response?.data?.message || error.message || "Unable to save shift.";
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async () => {
    if (!isDeveloper || !modal?.shift || !organizationId) return;
    if (!window.confirm("Delete this shift permanently?")) return;

    setSaving(true);
    setActionError("");
    try {
      await apiClient.delete(
        `/organizations/${encodeURIComponent(organizationId)}/delete-shift/${encodeURIComponent(modal.shift.id)}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } }
      );
      setModal(null);
      refetch();
    } catch (error) {
      setActionError(error?.response?.data?.error || error?.response?.data?.message || error.message || "Unable to delete shift.");
    } finally {
      setSaving(false);
    }
  };

  const shiftError = organizationsError || shiftsError || actionError;

  return (
    <section className="pln-shifts">
      <header className="pln-shifts__heading">
        <div>
          <p className="pln-shifts__eyebrow">Schedule management</p>
          <h1>Shifts</h1>
          <p className="pln-shifts__description">
            {selectedOrganization
              ? `Schedule for ${selectedOrganization.name}`
              : "Choose an organization to view its schedule."}
          </p>
        </div>
        <div className="pln-shifts__heading-meta">
          <span className={`pln-shifts__access ${isDeveloper ? "is-developer" : ""}`}>
            {isDeveloper ? "Developer access" : "Read-only"}
          </span>
          <span className="pln-shifts__count">{shifts.length} {shifts.length === 1 ? "shift" : "shifts"}</span>
        </div>
      </header>

      <div className="pln-shifts__toolbar">
        <label className="pln-shifts__organization-field">
          <span>Organization</span>
          <select
            value={organizationId}
            onChange={(event) => {
              const nextId = event.target.value;
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (nextId) next.set("organizationId", nextId);
                else next.delete("organizationId");
                return next;
              });
            }}
            disabled={organizationsLoading || organizations.length === 0}
            aria-label="Select organization"
          >
            {organizations.length === 0 && <option value="">No organizations available</option>}
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </select>
        </label>

        <div className="pln-shifts__date-controls">
          <button type="button" className="pln-shifts__icon-button" onClick={() => navigateDate(-1)} aria-label={view === "week" ? "Previous week" : "Previous month"}>
            <ChevronLeft size={18} />
          </button>
          <div className="pln-shifts__date-label">
            <CalendarDays size={17} />
            <strong>{rangeLabel(view, currentDate)}</strong>
          </div>
          <button type="button" className="pln-shifts__icon-button" onClick={() => navigateDate(1)} aria-label={view === "week" ? "Next week" : "Next month"}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="pln-shifts__toolbar-actions">
          <div className="pln-shifts__view-toggle" role="group" aria-label="Calendar view">
            <button type="button" className={view === "week" ? "is-active" : ""} aria-pressed={view === "week"} onClick={() => setView("week")}>Week</button>
            <button type="button" className={view === "month" ? "is-active" : ""} aria-pressed={view === "month"} onClick={() => setView("month")}>Month</button>
          </div>
          <button
            type="button"
            className="pln-shifts__icon-button pln-shifts__refresh"
            onClick={refetch}
            disabled={!organizationId || shiftsLoading}
            aria-label="Refresh shifts"
            title="Refresh shifts"
          >
            <RefreshCw size={17} />
          </button>
          {isDeveloper && (
            <button
              type="button"
              className="pln-shifts__button pln-shifts__button--primary"
              onClick={() => openNewShift()}
              disabled={!organizationId || organizationsLoading}
            >
              <Plus size={17} /> New shift
            </button>
          )}
        </div>
      </div>

      {shiftError && <div className="pln-shifts__error" role="alert">{shiftError}</div>}
      {!organizationsLoading && organizations.length === 0 && !organizationsError && (
        <div className="pln-shifts__message">No organizations are available for this account.</div>
      )}
      {selectedOrganization && (
        <ShiftCalendar
          view={view}
          currentDate={currentDate}
          shifts={shifts}
          employees={employees}
          loading={shiftsLoading}
          canManage={isDeveloper}
          onSelectShift={openEditShift}
          onAddShift={openNewShift}
        />
      )}
      {!organizationsLoading && organizations.length > 0 && !selectedOrganization && (
        <div className="pln-shifts__message">Select an organization to continue.</div>
      )}

      <footer className="pln-shifts__footer">
        <span>Schedules are loaded from the selected organization.</span>
        <span>Times are shown in your browser’s local time.</span>
      </footer>

      {modal && isDeveloper && (
        <ShiftModal
          organizationName={selectedOrganization?.name}
          employees={employees}
          shift={modal.shift}
          initialValues={modal.initialValues}
          saving={saving}
          onClose={() => !saving && setModal(null)}
          onSave={saveShift}
          onDelete={deleteShift}
        />
      )}
    </section>
  );
}
