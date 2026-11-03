import React, { useEffect, useState, useMemo } from "react";
import {
  Clock3,
  ChevronDown,
  CalendarDays,
  Filter,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";
import "./Timesheets.css";
import {
  AuditBar,
  buildTimecardRows,
  TimecardRow,
} from "./TimesheetComponents/timesheetComponents";
import { useAttendance } from "../hooks/useAttendance";

export default function PlannrTimesheets() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [statusOverrides, setStatusOverrides] = useState({});
  const { token } = useAuth();
  const { summary } = useAttendance();
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
              "Unable to load shifts. Please try again.",
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
    () =>
      buildTimecardRows(shifts).map((row) => {
        const override = statusOverrides[row.id];
        return override
          ? { ...row, status: override.status, statusTone: override.statusTone }
          : row;
      }),
    [shifts, statusOverrides],
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
      else if (activeTab === "Approved Logs")
        matchesTab = r.status === "Approved";
      else if (activeTab.includes("Overtime"))
        matchesTab = r.status === "Flagged" || r.variance.includes("OT");

      return matchesSearch && matchesExceptions && matchesTab;
    });
  }, [rows, searchQuery, onlyExceptions, activeTab]);

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === "Pending").length,
    [rows],
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
              <p>
                Validate scheduled and recorded hours before payroll closes.
              </p>
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

              {!loading &&
                !loadError &&
                filteredRows.map((row) => (
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
          <div className="pt-modal-card" onClick={(e) => e.stopPropagation()}>
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
                      "flagged",
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
                      "approved",
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
          <div className="pt-modal-card" onClick={(e) => e.stopPropagation()}>
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
