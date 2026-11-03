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
    date: parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    }),
    day: parsed.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

export function formatTime(value) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatHours(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}h` : "—";
}

export function buildTimecardRows(shifts) {
  return shifts.map((shift) => {
    const start = shift.start_time ? new Date(shift.start_time) : null;
    const end = shift.end_time ? new Date(shift.end_time) : null;
    const duration =
      start &&
      end &&
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime())
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
    const initials =
      name
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

export function AuditBar({ onApproveAll, pendingCount }) {
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
  return (
    <span className={`pt-time-state ${tone || "ontime"}`}>• {children}</span>
  );
}

export function TimecardRow({ row, onInspect }) {
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
        <span className={`pt-variance ${row.varianceTone}`}>
          {row.variance}
        </span>
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
