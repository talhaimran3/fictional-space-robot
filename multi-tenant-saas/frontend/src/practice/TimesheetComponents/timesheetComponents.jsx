import {
  Clock3,
  CalendarDays,
  Check,
  Flag,
  MoreHorizontal,
} from "lucide-react";

export function formatDate(value) {
  if (!value) return { date: "—", day: "—" };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: "—", day: "—" };
  return {
    date: parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
    day: parsed.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

export function formatTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatHours(value) {
  const numeric = Number(value);
  return value !== null && value !== undefined && Number.isFinite(numeric)
    ? `${numeric.toFixed(1)}h`
    : "—";
}

export function buildTimecardRows(shifts) {
  return shifts.map((shift) => {
    const attendance = shift.attendance || null;
    const start = shift.start_time ? new Date(shift.start_time) : null;
    const end = shift.end_time ? new Date(shift.end_time) : null;
    const duration =
      start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
        ? Math.max(0, (end - start) / 3600000)
        : null;
    const workedHours = attendance?.worked_hours;
    const { date, day } = formatDate(shift.start_time);
    const name = shift.employee_name || "Unassigned shift";
    const shiftStatus = String(shift.status || "scheduled").toLowerCase();
    const attendanceStatus = String(attendance?.status || "").toLowerCase();
    const status =
      ["cancelled", "no_show", "no-show"].includes(shiftStatus) ||
      ["rejected", "absent"].includes(attendanceStatus)
        ? "Flagged"
        : attendanceStatus === "approved"
          ? "Approved"
          : "Pending";
    const statusTone = status === "Flagged" ? "flagged" : status === "Approved" ? "approved" : "pending";
    const initials =
      name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "—";
    const worked = workedHours === null || workedHours === undefined ? "—" : formatHours(workedHours);
    const varianceHours =
      workedHours !== null && workedHours !== undefined && duration !== null
        ? Number(workedHours) - duration
        : null;

    return {
      id: shift.id,
      shiftId: shift.id,
      attendanceId: attendance?.id || null,
      attendance,
      initials,
      avatar: "blue",
      name,
      team: shift.project_name || shift.name || shift.project || "Operations",
      date,
      day,
      scheduled: formatHours(duration),
      inTime: formatTime(attendance?.clock_in_at),
      inState: attendance?.clock_in_at ? "Clocked in" : "No clock-in recorded",
      outTime: formatTime(attendance?.clock_out_at),
      outState: attendance?.clock_out_at ? "Clocked out" : "No clock-out recorded",
      worked,
      variance: varianceHours === null ? "—" : `${varianceHours > 0 ? "+" : ""}${varianceHours.toFixed(1)}h`,
      varianceTone: varianceHours === null ? "neutral" : varianceHours > 0.05 ? "peach" : varianceHours < -0.05 ? "rose" : "neutral",
      status,
      statusTone,
      shiftStatus,
      startTime: formatTime(shift.start_time),
      endTime: formatTime(shift.end_time),
    };
  });
}

export function AuditBar({ onApproveAll, pendingCount }) {
  return (
    <section className="pt-audit-bar">
      <div className="pt-period-pill">
        <CalendarDays size={16} />
        <span>Pay Period: Current schedule</span>
      </div>
      <div className="pt-audit-divider" />
      <div className="pt-audit-progress">
        <div className="pt-audit-progress-head">
          <span>Pending timecards</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="pt-progress-track"><span /></div>
      </div>
      <button className="pt-primary-btn" onClick={onApproveAll}>
        <Check size={17} /> Approve All ({pendingCount})
      </button>
    </section>
  );
}

export function StatusPill({ tone, children }) {
  return (
    <span className={`pt-status ${tone}`}>
      {tone === "approved" && <Check size={13} />}
      {tone === "flagged" && <Flag size={13} />}
      {tone === "pending" && <Clock3 size={13} />}
      {children}
    </span>
  );
}

export function TimeState({ children, tone }) {
  return <span className={`pt-time-state ${tone || "ontime"}`}>• {children}</span>;
}

export function TimecardRow({ row, onInspect }) {
  return (
    <div className="pt-table-row" onClick={() => onInspect(row)}>
      <div className="pt-employee">
        <div className={`pt-avatar ${row.avatar}`}>{row.initials}</div>
        <div><strong>{row.name}</strong><span>{row.team}</span></div>
      </div>
      <div className="pt-date"><strong>{row.date}</strong><span>{row.day}</span></div>
      <div className="pt-hours">{row.scheduled}</div>
      <div className="pt-recorded">
        <div><strong>{row.inTime}</strong><TimeState>{row.inState}</TimeState></div>
        <span className="pt-time-line" />
        <div><strong>{row.outTime}</strong><TimeState>{row.outState}</TimeState></div>
      </div>
      <div className="pt-hours pt-worked">{row.worked}</div>
      <div><span className={`pt-variance ${row.varianceTone}`}>{row.variance}</span></div>
      <div><StatusPill tone={row.statusTone}>{row.status}</StatusPill></div>
      <button className="pt-more" onClick={(event) => { event.stopPropagation(); onInspect(row); }}>
        <MoreHorizontal size={18} />
      </button>
    </div>
  );
}
