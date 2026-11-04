import React, { useEffect, useMemo, useState } from "react";
import { Clock3, CalendarDays, CheckCircle2, Timer } from "lucide-react";
import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import "./StaffWorkspace.css";

const hours = (value) => Number(value || 0);
const format = (value) => value == null ? "—" : `${hours(value).toFixed(2)} h`;

export default function MyTimesheets() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiClient.get("/attendance/all", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => { if (active) setRecords(response.data?.records || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.error || "Unable to load your timesheet."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const totals = useMemo(() => records.reduce((result, shift) => {
    const allocated = shift.attendance?.allocated_hours ?? Math.max(0, (new Date(shift.end_time) - new Date(shift.start_time)) / 3600000);
    const worked = shift.attendance?.worked_hours;
    result.allocated += hours(allocated);
    result.worked += hours(worked);
    result.pending += worked == null ? hours(allocated) : Math.max(0, hours(allocated) - hours(worked));
    return result;
  }, { allocated: 0, worked: 0, pending: 0 }), [records]);

  return (
    <section className="sw-page">
      <header className="sw-heading"><div><p className="sw-eyebrow">Your attendance</p><h1>My timesheets</h1><p>Compare scheduled hours with recorded working time for each shift.</p></div></header>
      <div className="sw-metrics">
        <article><CalendarDays/><span>Allocated hours</span><strong>{format(totals.allocated)}</strong></article>
        <article><Clock3/><span>Worked hours</span><strong>{format(totals.worked)}</strong></article>
        <article><Timer/><span>Remaining / unworked</span><strong>{format(totals.pending)}</strong></article>
      </div>
      {error && <div className="sw-error">{error}</div>}
      {loading ? <div className="sw-empty">Loading your timesheets…</div> : (
        <div className="sw-table-wrap">
          <table className="sw-table">
            <thead><tr><th>Shift</th><th>Date</th><th>Allocated</th><th>Clock in</th><th>Clock out</th><th>Worked</th><th>Status</th></tr></thead>
            <tbody>
              {records.map((shift) => {
                const attendance = shift.attendance || {};
                const allocated = attendance.allocated_hours ?? Math.max(0, (new Date(shift.end_time) - new Date(shift.start_time)) / 3600000);
                const status = attendance.status === "approved" ? "Approved" : attendance.clock_in_at && !attendance.clock_out_at ? "In progress" : attendance.clock_out_at ? "Pending approval" : "Awaiting clock-in";
                return <tr key={shift.id}>
                  <td><strong>{shift.name || "Scheduled shift"}</strong></td>
                  <td>{new Date(shift.start_time).toLocaleDateString()}</td>
                  <td>{format(allocated)}</td>
                  <td>{attendance.clock_in_at ? new Date(attendance.clock_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td>{attendance.clock_out_at ? new Date(attendance.clock_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td>{format(attendance.worked_hours)}</td>
                  <td><span className={status === "Approved" ? "sw-status sw-status--approved" : "sw-status"}>{status === "Approved" && <CheckCircle2 size={13}/>} {status}</span></td>
                </tr>;
              })}
            </tbody>
          </table>
          {!records.length && <div className="sw-empty">No timecards yet. Your shifts will appear here.</div>}
        </div>
      )}
    </section>
  );
}
