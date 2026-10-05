import React, { useState, useMemo } from "react";
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
import "./Timesheets.css";

const INITIAL_ROWS = [
  {
    id: 1,
    initials: "JH",
    avatar: "blue",
    name: "Jerry Helfer",
    team: "Operations",
    date: "Aug 05",
    day: "Mon",
    scheduled: "8.0h",
    inTime: "8:58 AM",
    inState: "On Time",
    outTime: "5:04 PM",
    outState: "On Time",
    worked: "8.1h",
    variance: "+0.1h",
    varianceTone: "neutral",
    status: "Approved",
    statusTone: "approved",
  },
  {
    id: 2,
    initials: "BC",
    avatar: "peach",
    name: "Bessie C.",
    team: "Customer Care",
    date: "Aug 05",
    day: "Mon",
    scheduled: "8.0h",
    inTime: "9:15 AM",
    inState: "15m Late",
    inTone: "late",
    outTime: "5:00 PM",
    outState: "On Time",
    worked: "7.75h",
    variance: "-0.25h",
    varianceTone: "peach",
    status: "Flagged",
    statusTone: "flagged",
  },
  {
    id: 3,
    initials: "RE",
    avatar: "purple",
    name: "Ralph E.",
    team: "Field Services",
    date: "Aug 06",
    day: "Tue",
    scheduled: "8.0h",
    inTime: "8:59 AM",
    inState: "On Time",
    outTime: "7:01 PM",
    outState: "2h Overtime",
    outTone: "overtime",
    worked: "10.0h",
    variance: "+2.0h OT",
    varianceTone: "rose",
    status: "Pending",
    statusTone: "pending",
  },
  {
    id: 4,
    initials: "SM",
    avatar: "green",
    name: "Sophia M.",
    team: "Design",
    date: "Aug 06",
    day: "Tue",
    scheduled: "7.5h",
    inTime: "9:02 AM",
    inState: "On Time",
    outTime: "4:34 PM",
    outState: "On Time",
    worked: "7.5h",
    variance: "+0.0h",
    varianceTone: "neutral",
    status: "Approved",
    statusTone: "approved",
  },
];

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
  const [rows, setRows] = useState(INITIAL_ROWS);
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
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: newStatus, statusTone: newTone } : r
      )
    );
    setSelectedTimecard(null);
  };

  const handleApproveAllConfirm = () => {
    setRows((prev) =>
      prev.map((r) =>
        r.status === "Pending"
          ? { ...r, status: "Approved", statusTone: "approved" }
          : r
      )
    );
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

              {filteredRows.map((row) => (
                <TimecardRow
                  key={row.id}
                  row={row}
                  onInspect={(r) => setSelectedTimecard(r)}
                />
              ))}

              {!filteredRows.length && (
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