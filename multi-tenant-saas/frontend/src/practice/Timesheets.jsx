import React, { useEffect, useState, useMemo } from "react";
import {
  Clock3,
  Search,
  Download,
  ChevronDown,
  CalendarDays,
  Check,
  Filter,
  Flag,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";
import "./Timesheets.css";

function formatDate(value) {
  if (!value) return { date: "—", day: "—" };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: "—", day: "—" };
  return {
    date: parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    day: parsed.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

function formatTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatHours(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}h` : "—";
}

function buildTimecardRows(shifts) {
  return shifts.map((shift) => {
    const start = shift.start_time ? new Date(shift.start_time) : null;
    const end = shift.end_time ? new Date(shift.end_time) : null;
    const duration =
      start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
        ? Math.max(0, (end - start) / 3600000)
        : null;
    const { date, day } = formatDate(shift.start_time);
    const name = shift.employee_name || "Unassigned shift";
    const statusValue = String(shift.status || "scheduled").toLowerCase();
    const status = ["cancelled", "no_show", "no-show"].includes(statusValue)
      ? "Flagged"
      : statusValue === "completed"
        ? "Pending"
        : "Pending";
    const statusTone = status === "Flagged" ? "flagged" : "pending";
    const initials = name
      .split(/\\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "—";

    return {
      id: shift.id,
      initials,
      avatar: "blue",
      name,
      team: shift.project_name || shift.project || "Operations",
      date,
      day,
      scheduled: formatHours(duration),
      inTime: "—",
      inState: "No clock-in data",
      outTime: "—",
      outState: "No clock-out data",
      worked: "—",
      variance: "—",
      varianceTone: "neutral",
      status,
      statusTone,
      shiftStatus: statusValue,
      startTime: formatTime(shift.start_time),
      endTime: formatTime(shift.end_time),
    };
  });
}

function AuditBar({ onApproveAll, pendingCount }) {
  return (
    <section className="pt-audit-bar">
      <div className="pt-period-pill">
        <CalendarDays size={16} />
        <span>Pay Period: Aug 01 - Aug 15, 2024</span>
      </div>

      <div className="pt-audit-divider" />

      <div className="pt-audit-progress">
        <div className="pt-audit-progress-head">
          <span>Audit completion</span>
          <strong>82%</strong>
        </div>
        <div className="pt-progress-track">
          <span />
        </div>
      </div>

      <button className="pt-primary-btn" onClick={onApproveAll}>
        <Check size={17} /> Approve All ({pendingCount})
      </button>
    </section>
  );
}

function StatusPill({ tone, children }) {
  return (
    <span className={`pt-status ${tone}`}>
      {tone === "approved" && <Check size={13} />}
      {tone === "flagged" && <Flag size={13} />}
      {tone === "pending" && <Clock3 size={13} />}
      {children}
    </span>
  );
}

function TimeState({ children, tone }) {
  return (
    <span className={`pt-time-state ${tone || "ontime"}`}>• {children}</span>
  );
}

function TimecardRow({ row, onInspect }) {
  return (
    <div className="pt-table-row" onClick={() => onInspect(row)}>
      <div className="pt-employee">
        <div className={`pt-avatar ${row.avatar}`}>{row.initials}</div>
        <div>
          <strong>{row.name}</strong>
          <span>{row.team}</span>
        </div>
      </div>

      <div className="pt-date">
        <strong>{row.date}</strong>
        <span>{row.day}</span>
      </div>

      <div className="pt-hours">{row.scheduled}</div>

      <div className="pt-recorded">
        <div>
          <strong>{row.inTime}</strong>
          <TimeState tone={row.inTone}>{row.inState}</TimeState>
        </div>
        <span className="pt-time-line" />
        <div>
          <strong>{row.outTime}</strong>
          <TimeState tone={row.outTone}>{row.outState}</TimeState>
        </div>
      </div>

      <div className="pt-hours pt-worked">{row.worked}</div>

      <div>
        <span className={`pt-variance ${row.varianceTone}`}>{row.variance}</span>
      </div>

      <div>
        <StatusPill tone={row.statusTone}>{row.status}</StatusPill>
      </div>

      <button
        className="pt-more"
        onClick={(e) => {
          e.stopPropagation();
          onInspect(row);
        }}
      >
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}

export default function PlannrTimesheets() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusOverrides, setStatusOverrides] = useState({});
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchShifts = async () => {
      if (!token) {
        setShifts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError("");
        const response = await apiClient.get("/admin/shifts/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setShifts(response.data?.data || []);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error?.response?.data?.error ||
              error?.response?.data?.message ||
              "Unable to load shifts. Please try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchShifts();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const rows = useMemo(
    () => buildTimecardRows(shifts).map((row) => {
      const override = statusOverrides[row.id];
      return override ? { ...row, status: override.status, statusTone: override.statusTone } : row;
    }),
    [shifts, statusOverrides]
  );
  const [activeTab, setActiveTab] = useState("Current Period");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyExceptions, setOnlyExceptions] = useState(false);

  // Modals state
  const [selectedTimecard, setSelectedTimecard] = useState(null);
  const [isApproveAllModalOpen, setIsApproveAllModalOpen] = useState(false);

  // Filter Logic
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesExceptions =
        !onlyExceptions || r.status === "Flagged" || r.status === "Pending";

      let matchesTab = true;
      if (activeTab.includes("Pending")) matchesTab = r.status === "Pending";
      else if (activeTab === "Approved Logs") matchesTab = r.status === "Approved";
      else if (activeTab.includes("Overtime"))
        matchesTab = r.status === "Flagged" || r.variance.includes("OT");

      return matchesSearch && matchesExceptions && matchesTab;
    });
  }, [rows, searchQuery, onlyExceptions, activeTab]);

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === "Pending").length,
    [rows]
  );

  const handleUpdateStatus = (id, newStatus, newTone) => {
    setStatusOverrides((prev) => ({
      ...prev,
      [id]: { status: newStatus, statusTone: newTone },
    }));
    setSelectedTimecard(null);
  };

  const handleApproveAllConfirm = () => {
    setStatusOverrides((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        if (row.status === "Pending") {
          next[row.id] = { status: "Approved", statusTone: "approved" };
        }
      });
      return next;
    });
    setIsApproveAllModalOpen(false);
  };

  return (
    <>
      {/* Content-only – no Sidebar / Header (provided by AdminLayout) */}

      {/* Local page tabs (under the shared TopBar) */}
      <div className="pt-tabs">
        {[
          "Current Period",
          "Pending Approval (6)",
          "Approved Logs",
          "Overtime & Discrepancies",
        ].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "is-active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pt-page">
        <AuditBar
          onApproveAll={() => setIsApproveAllModalOpen(true)}
          pendingCount={pendingCount}
        />

        <section className="pt-table-section">
          <div className="pt-table-heading">
            <div>
              <h2>Timecard audit</h2>
              <p>Validate scheduled and recorded hours before payroll closes.</p>
            </div>
            <div className="pt-table-tools">
              <button
                className={onlyExceptions ? "is-active" : ""}
                onClick={() => setOnlyExceptions(!onlyExceptions)}
              >
                <Filter size={15} /> Exceptions only
              </button>
              <button onClick={() => alert("Calendar Filter")}>
                <CalendarDays size={15} /> All dates <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="pt-table-card">
            <div className="pt-table-scroll-wrapper">
              <div className="pt-table-head">
                <span>EMPLOYEE</span>
                <span>DATE</span>
                <span>SCHEDULED</span>
                <span>RECORDED TIME</span>
                <span>WORKED</span>
                <span>VARIANCE</span>
                <span>STATUS</span>
                <span />
              </div>

              {loading && (
                <div className="pt-empty-state">
                  <Clock3 size={24} />
                  <strong>Loading timecards…</strong>
                </div>
              )}

              {!loading && loadError && (
                <div className="pt-empty-state">
                  <AlertTriangle size={24} />
                  <strong>Could not load timecards</strong>
                  <span>{loadError}</span>
                </div>
              )}

              {!loading && !loadError && filteredRows.map((row) => (
                <TimecardRow
                  key={row.id}
                  row={row}
                  onInspect={(r) => setSelectedTimecard(r)}
                />
              ))}

              {!loading && !loadError && !filteredRows.length && (
                <div className="pt-empty-state">
                  <Clock3 size={24} />
                  <strong>No timecards found</strong>
                  <span>Try resetting your search or exception filters.</span>
                </div>
              )}
            </div>

            <div className="pt-table-footer">
              <span>
                Showing {filteredRows.length} of {rows.length} timecards • Last
                synced 2 minutes ago
              </span>
              <div className="pt-pagination">
                <button>
                  <ChevronLeft size={14} />
                </button>
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <button>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- TIMECARD AUDIT MODAL --- */}
      {selectedTimecard && (
        <div
          className="pt-modal-backdrop"
          onClick={() => setSelectedTimecard(null)}
        >
          <div
            className="pt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-modal-header">
              <h2>Audit Timecard Log</h2>
              <button
                className="pt-close-btn"
                onClick={() => setSelectedTimecard(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="pt-modal-body">
              <div className="pt-modal-user-row">
                <div className={`pt-avatar ${selectedTimecard.avatar}`}>
                  {selectedTimecard.initials}
                </div>
                <div>
                  <strong>{selectedTimecard.name}</strong>
                  <span>
                    {selectedTimecard.team} • {selectedTimecard.date} (
                    {selectedTimecard.day})
                  </span>
                </div>
              </div>

              <div className="pt-modal-stats-grid">
                <div>
                  <span>Scheduled:</span>{" "}
                  <strong>{selectedTimecard.scheduled}</strong>
                </div>
                <div>
                  <span>Worked:</span>{" "}
                  <strong>{selectedTimecard.worked}</strong>
                </div>
                <div>
                  <span>In Time:</span>{" "}
                  <strong>{selectedTimecard.inTime}</strong>
                </div>
                <div>
                  <span>Out Time:</span>{" "}
                  <strong>{selectedTimecard.outTime}</strong>
                </div>
              </div>

              <div className="pt-modal-note">
                <AlertTriangle size={16} />
                <span>
                  Variance: <strong>{selectedTimecard.variance}</strong> (
                  {selectedTimecard.inState} / {selectedTimecard.outState})
                </span>
              </div>

              <div className="pt-modal-actions">
                <button
                  type="button"
                  className="pt-outline-btn flag"
                  onClick={() =>
                    handleUpdateStatus(
                      selectedTimecard.id,
                      "Flagged",
                      "flagged"
                    )
                  }
                >
                  <Flag size={15} /> Flag Issue
                </button>
                <button
                  type="button"
                  className="pt-primary-btn"
                  onClick={() =>
                    handleUpdateStatus(
                      selectedTimecard.id,
                      "Approved",
                      "approved"
                    )
                  }
                >
                  <CheckCircle2 size={15} /> Approve Timecard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BATCH APPROVE MODAL --- */}
      {isApproveAllModalOpen && (
        <div
          className="pt-modal-backdrop"
          onClick={() => setIsApproveAllModalOpen(false)}
        >
          <div
            className="pt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-modal-header">
              <h2>Batch Approve Timecards</h2>
              <button
                className="pt-close-btn"
                onClick={() => setIsApproveAllModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="pt-modal-body">
              <p style={{ margin: 0, color: "#536781", fontSize: "13px" }}>
                You are about to approve{" "}
                <strong>{pendingCount} pending timecard(s)</strong> for the
                current pay period. This will mark them as audit-ready for
                payroll processing.
              </p>
              <div className="pt-modal-actions">
                <button
                  type="button"
                  className="pt-outline-btn"
                  onClick={() => setIsApproveAllModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pt-primary-btn"
                  onClick={handleApproveAllConfirm}
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}