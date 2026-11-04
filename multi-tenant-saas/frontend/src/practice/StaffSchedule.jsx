import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, RefreshCw } from "lucide-react";
import { useAuth } from "../context/authContext";
import apiClient from "../api/client";
import "./StaffWorkspace.css";

const startOfWeek = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
};
const formatTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
const durationHours = (start, end) => Math.max(0, (new Date(end) - new Date(start)) / 3600000);

export default function StaffSchedule() {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyShift, setBusyShift] = useState("");
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(() => new Date());

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/attendance/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(response.data?.records || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to load your schedule.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const period = useMemo(() => {
    const start = view === "week" ? startOfWeek(anchor) : new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = view === "week" ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7) : new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
    return { start, end };
  }, [anchor, view]);

  const visible = useMemo(() => records.filter((record) => {
    const start = new Date(record.start_time);
    return start >= period.start && start < period.end;
  }), [records, period]);

  const navigate = (direction) => setAnchor((current) => {
    const next = new Date(current);
    if (view === "week") next.setDate(next.getDate() + direction * 7);
    else next.setMonth(next.getMonth() + direction);
    return next;
  });

  const clock = async (record, action) => {
    setBusyShift(record.id);
    setError("");
    try {
      await apiClient.post(`/attendance/shift/${encodeURIComponent(record.id)}/clock-${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.error || `Unable to clock ${action.replace("-", " ")}.`);
    } finally {
      setBusyShift("");
    }
  };

  const label = view === "week"
    ? `${period.start.toLocaleDateString([], { month: "short", day: "numeric" })} – ${new Date(period.end.getTime() - 86400000).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`
    : anchor.toLocaleDateString([], { month: "long", year: "numeric" });

  return (
    <section className="sw-page">
      <header className="sw-heading">
        <div><p className="sw-eyebrow">Your workspace</p><h1>My schedule</h1><p>Review upcoming shifts and record your actual start and finish times.</p></div>
        <button className="sw-button sw-button--light" onClick={load} disabled={loading}><RefreshCw size={16}/> Refresh</button>
      </header>
      <div className="sw-toolbar">
        <div className="sw-toggle">
          <button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Week</button>
          <button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Month</button>
        </div>
        <div className="sw-period"><button onClick={() => navigate(-1)} aria-label="Previous period"><ChevronLeft size={18}/></button><strong><CalendarDays size={17}/> {label}</strong><button onClick={() => navigate(1)} aria-label="Next period"><ChevronRight size={18}/></button></div>
        <button className="sw-button sw-button--light" onClick={() => setAnchor(new Date())}>Today</button>
      </div>
      {error && <div className="sw-error" role="alert">{error}</div>}
      {loading ? <div className="sw-empty">Loading your shifts…</div> : visible.length === 0 ? <div className="sw-empty">No shifts are scheduled in this period.</div> : (
        <div className="sw-shift-list">
          {visible.map((record) => {
            const attendance = record.attendance || {};
            const inProgress = Boolean(attendance.clock_in_at && !attendance.clock_out_at);
            const complete = Boolean(attendance.clock_in_at && attendance.clock_out_at);
            const isBusy = busyShift === record.id;
            return (
              <article className="sw-shift-card" key={record.id}>
                <div className="sw-date-block"><strong>{new Date(record.start_time).toLocaleDateString([], { day: "2-digit" })}</strong><span>{new Date(record.start_time).toLocaleDateString([], { weekday: "short", month: "short" })}</span></div>
                <div className="sw-shift-main">
                  <strong>{record.name || "Scheduled shift"}</strong>
                  <span><Clock3 size={14}/> {formatTime(record.start_time)} – {formatTime(record.end_time)} · {durationHours(record.start_time, record.end_time).toFixed(1)} allocated hours</span>
                  {record.notes && <small>{record.notes}</small>}
                </div>
                <div className="sw-shift-status">{complete ? "Clocked out" : inProgress ? "Currently working" : "Not started"}</div>
                <div className="sw-shift-action">
                  {!attendance.clock_in_at ? (
                    <button className="sw-button" disabled={isBusy || record.status === "cancelled"} onClick={() => clock(record, "in")}>{isBusy ? "Saving…" : "Clock in"}</button>
                  ) : !attendance.clock_out_at ? (
                    <button className="sw-button sw-button--finish" disabled={isBusy} onClick={() => clock(record, "out")}>{isBusy ? "Saving…" : "Clock out"}</button>
                  ) : <span className="sw-complete">Recorded</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
