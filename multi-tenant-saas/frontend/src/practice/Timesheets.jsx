import React, { useEffect, useMemo, useState } from "react";
import {
  Clock3, ChevronDown, CalendarDays, Filter, Flag, ChevronLeft,
  ChevronRight, X, CheckCircle2, AlertTriangle, Save,
} from "lucide-react";
import apiClient from "../api/client";
import { useAuth } from "../context/authContext";
import "./Timesheets.css";
import { AuditBar, buildTimecardRows, TimecardRow } from "./TimesheetComponents/timesheetComponents";

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const calculateWorkedHours = (clockIn, clockOut, breakMinutes) => {
  if (!clockIn || !clockOut) return null;
  const elapsed = new Date(clockOut) - new Date(clockIn) - Number(breakMinutes || 0) * 60000;
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;
  return Math.max(0, Number((elapsed / 3600000).toFixed(2)));
};

export default function PlannrTimesheets() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [statusOverrides, setStatusOverrides] = useState({});
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("Current Period");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyExceptions, setOnlyExceptions] = useState(false);
  const [selectedTimecard, setSelectedTimecard] = useState(null);
  const [isApproveAllModalOpen, setIsApproveAllModalOpen] = useState(false);
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [breakMinutes, setBreakMinutes] = useState("0");
  const [laborCost, setLaborCost] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const fetchAttendance = async () => {
    if (!token) {
      setShifts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError("");
      const response = await apiClient.get("/attendance/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(response.data?.records || []);
    } catch (error) {
      setLoadError(
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Unable to load attendance records. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token]);

  const rows = useMemo(
    () => buildTimecardRows(shifts).map((row) => {
      const override = statusOverrides[row.id];
      return override ? { ...row, status: override.status, statusTone: override.statusTone } : row;
    }),
    [shifts, statusOverrides],
  );

  useEffect(() => {
    if (!selectedTimecard) return;
    const attendance = selectedTimecard.attendance;
    setClockIn(toDateTimeLocal(attendance?.clock_in_at));
    setClockOut(toDateTimeLocal(attendance?.clock_out_at));
    setBreakMinutes(String(attendance?.break_minutes ?? 0));
    setLaborCost(attendance?.labor_cost === null || attendance?.labor_cost === undefined ? "" : String(attendance.labor_cost));
    setAdditionalNotes(attendance?.additional_notes || "");
    setSaveError("");
  }, [selectedTimecard]);

  const previewWorkedHours = calculateWorkedHours(clockIn, clockOut, breakMinutes);
  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.team.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExceptions = !onlyExceptions || row.status === "Flagged" || row.status === "Pending";
    let matchesTab = true;
    if (activeTab.includes("Pending")) matchesTab = row.status === "Pending";
    else if (activeTab === "Approved Logs") matchesTab = row.status === "Approved";
    else if (activeTab.includes("Overtime")) matchesTab = row.status === "Flagged" || row.variance.includes("+");
    return matchesSearch && matchesExceptions && matchesTab;
  }), [rows, searchQuery, onlyExceptions, activeTab]);

  const pendingRows = rows.filter((row) => row.status === "Pending");
  const pendingCount = pendingRows.length;

  const saveAttendance = async (row, nextStatus = "pending") => {
    const payload = {
      clock_in_at: clockIn ? new Date(clockIn).toISOString() : null,
      clock_out_at: clockOut ? new Date(clockOut).toISOString() : null,
      break_minutes: Number(breakMinutes || 0),
      additional_notes: additionalNotes,
      status: nextStatus,
    };
    // An empty labor-cost field means "calculate if not already saved".
    // Existing saved costs are preserved by the API unless explicitly edited.
    if (laborCost.trim() !== "") payload.labor_cost = Number(laborCost);
    await apiClient.put(`/attendance/shift/${row.shiftId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchAttendance();
    setSelectedTimecard(null);
  };

  const handleSave = async () => {
    if (!selectedTimecard) return;
    try {
      setSaving(true);
      setSaveError("");
      await saveAttendance(selectedTimecard, selectedTimecard.attendance?.status || "pending");
    } catch (error) {
      setSaveError(error?.response?.data?.error || "Unable to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (nextStatus) => {
    if (!selectedTimecard) return;
    try {
      setSaving(true);
      setSaveError("");
      await saveAttendance(selectedTimecard, nextStatus);
    } catch (error) {
      setSaveError(error?.response?.data?.error || "Unable to update timecard status.");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveAllConfirm = async () => {
    try {
      setSaving(true);
      setSaveError("");
      const eligibleRows = pendingRows.filter((row) => row.employeeId || shifts.find((shift) => shift.id === row.shiftId)?.employee_id);
      for (const row of eligibleRows) {
        const attendance = row.attendance || {};
        await apiClient.put(`/attendance/shift/${row.shiftId}`, {
          clock_in_at: attendance.clock_in_at || null,
          clock_out_at: attendance.clock_out_at || null,
          break_minutes: attendance.break_minutes ?? 0,
          additional_notes: attendance.additional_notes || null,
          status: "approved",
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsApproveAllModalOpen(false);
      await fetchAttendance();
    } catch (error) {
      setLoadError(error?.response?.data?.error || "Unable to approve all timecards.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="pt-tabs">
        {["Current Period", "Pending Approval", "Approved Logs", "Overtime & Discrepancies"].map((tab) => (
          <button key={tab} className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>
            {tab}{tab === "Pending Approval" ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      <div className="pt-page">
        <AuditBar onApproveAll={() => setIsApproveAllModalOpen(true)} pendingCount={pendingCount} />
        <section className="pt-table-section">
          <div className="pt-table-heading">
            <div><h2>Timecard audit</h2><p>Validate scheduled and recorded hours before payroll closes.</p></div>
            <div className="pt-table-tools">
              <button className={onlyExceptions ? "is-active" : ""} onClick={() => setOnlyExceptions(!onlyExceptions)}>
                <Filter size={15} /> Exceptions only
              </button>
              <button onClick={() => fetchAttendance()}><CalendarDays size={15} /> Refresh <ChevronDown size={14} /></button>
            </div>
          </div>

          <div className="pt-table-card">
            <div className="pt-table-scroll-wrapper">
              <div className="pt-table-head">
                <span>EMPLOYEE</span><span>DATE</span><span>SCHEDULED</span><span>RECORDED TIME</span>
                <span>WORKED</span><span>VARIANCE</span><span>STATUS</span><span />
              </div>
              {loading && <div className="pt-empty-state"><Clock3 size={24} /><strong>Loading timecards…</strong></div>}
              {!loading && loadError && <div className="pt-empty-state"><AlertTriangle size={24} /><strong>Could not load timecards</strong><span>{loadError}</span></div>}
              {!loading && !loadError && filteredRows.map((row) => (
                <TimecardRow key={row.id} row={row} onInspect={setSelectedTimecard} />
              ))}
              {!loading && !loadError && !filteredRows.length && (
                <div className="pt-empty-state"><Clock3 size={24} /><strong>No timecards found</strong><span>Try resetting your search or exception filters.</span></div>
              )}
            </div>
            <div className="pt-table-footer">
              <span>Showing {filteredRows.length} of {rows.length} timecards</span>
              <div className="pt-pagination"><button><ChevronLeft size={14} /></button><button className="active">1</button><button><ChevronRight size={14} /></button></div>
            </div>
          </div>
        </section>
      </div>

      {selectedTimecard && (
        <div className="pt-modal-backdrop" onClick={() => !saving && setSelectedTimecard(null)}>
          <div className="pt-modal-card pt-editor-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pt-modal-header">
              <div><h2>Attendance details</h2><p className="pt-editor-subtitle">{selectedTimecard.name} · {selectedTimecard.date} ({selectedTimecard.day})</p></div>
              <button className="pt-close-btn" disabled={saving} onClick={() => setSelectedTimecard(null)}><X size={18} /></button>
            </div>

            {!selectedTimecard.attendance && <p className="pt-no-attendance">No attendance record exists for this shift yet. Saving will create one.</p>}

            <div className="pt-editor-grid">
              <label>Clock in<input type="datetime-local" value={clockIn} onChange={(event) => setClockIn(event.target.value)} /></label>
              <label>Clock out<input type="datetime-local" value={clockOut} onChange={(event) => setClockOut(event.target.value)} /></label>
              <label>Break (minutes)<input type="number" min="0" step="1" value={breakMinutes} onChange={(event) => setBreakMinutes(event.target.value)} /></label>
              <label>Worked hours <input value={previewWorkedHours === null ? "—" : `${previewWorkedHours.toFixed(2)} hours`} readOnly /></label>
              <label>Labor cost<input type="number" min="0" step="0.01" placeholder="Auto-calculate if blank" value={laborCost} onChange={(event) => setLaborCost(event.target.value)} /></label>
              <label className="pt-editor-wide">Additional notes<textarea rows="3" value={additionalNotes} onChange={(event) => setAdditionalNotes(event.target.value)} placeholder="Add payroll or attendance notes…" /></label>
            </div>

            <div className="pt-modal-note"><AlertTriangle size={16} /><span>Variance: <strong>{selectedTimecard.variance}</strong> · Scheduled: {selectedTimecard.scheduled}</span></div>
            {saveError && <p className="pt-save-error">{saveError}</p>}
            <div className="pt-modal-actions pt-editor-actions">
              <button type="button" className="pt-outline-btn flag" disabled={saving} onClick={() => handleStatus("rejected")}><Flag size={15} /> Flag Issue</button>
              <button type="button" className="pt-outline-btn" disabled={saving} onClick={handleSave}><Save size={15} /> Save changes</button>
              <button type="button" className="pt-primary-btn" disabled={saving} onClick={() => handleStatus("approved")}><CheckCircle2 size={15} /> {saving ? "Saving…" : "Approve"}</button>
            </div>
          </div>
        </div>
      )}

      {isApproveAllModalOpen && (
        <div className="pt-modal-backdrop" onClick={() => !saving && setIsApproveAllModalOpen(false)}>
          <div className="pt-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="pt-modal-header"><h2>Batch approve timecards</h2><button className="pt-close-btn" onClick={() => setIsApproveAllModalOpen(false)}><X size={18} /></button></div>
            <div className="pt-modal-body">
              <p style={{ margin: 0, color: "#536781", fontSize: "13px" }}>Approve {pendingCount} pending timecard(s) with an assigned employee. Rows without attendance will receive an attendance record when approved.</p>
              {loadError && <p className="pt-save-error">{loadError}</p>}
              <div className="pt-modal-actions">
                <button type="button" className="pt-outline-btn" disabled={saving} onClick={() => setIsApproveAllModalOpen(false)}>Cancel</button>
                <button type="button" className="pt-primary-btn" disabled={saving} onClick={handleApproveAllConfirm}>{saving ? "Approving…" : "Confirm approval"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
