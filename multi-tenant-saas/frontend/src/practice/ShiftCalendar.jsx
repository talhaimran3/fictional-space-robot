import React from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfWeek = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
};

const dayKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTime = (value) =>
  new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

const formatDay = (date) =>
  new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric" }).format(date);

const statusClass = (status = "scheduled") =>
  String(status).toLowerCase().replace(/[^a-z0-9-]/g, "-");

function ShiftEvent({ shift, canManage, onSelectShift, compact = false }) {
  const label = `${formatTime(shift.start_time)}–${formatTime(shift.end_time)} ${shift.name || "Scheduled Shift"}`;
  const employee = shift.employee_name || "Unassigned";
  return (
    <button
      type="button"
      className={`pln-shifts__event ${compact ? "pln-shifts__event--compact" : ""} pln-shifts__event--${statusClass(shift.status)}`}
      title={`${employee} · ${label} · ${shift.status}`}
      disabled={!canManage}
      onClick={() => onSelectShift?.(shift)}
    >
      <strong>{formatTime(shift.start_time)}–{formatTime(shift.end_time)}</strong>
      <span>{shift.name || "Scheduled Shift"}</span>
      {!compact && <small>{employee}</small>}
    </button>
  );
}

export default function ShiftCalendar({
  view,
  currentDate,
  shifts = [],
  employees = [],
  canManage = false,
  loading = false,
  onSelectShift,
  onAddShift,
}) {
  const visibleShifts = [...shifts].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  );

  if (loading) {
    return <div className="pln-shifts__message">Loading this organization’s shifts…</div>;
  }

  if (view === "month") {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const gridStart = startOfWeek(monthStart);
    const dates = Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });

    return (
      <div className="pln-shifts__month" aria-label="Monthly shift calendar">
        <div className="pln-shifts__month-weekdays">
          {WEEKDAYS.map((weekday) => <div key={weekday}>{weekday}</div>)}
        </div>
        <div className="pln-shifts__month-grid">
          {dates.map((date) => {
            const dayShifts = visibleShifts.filter((shift) => dayKey(shift.start_time) === dayKey(date));
            const outsideMonth = date.getMonth() !== currentDate.getMonth();
            return (
              <div className={`pln-shifts__month-day ${outsideMonth ? "is-outside-month" : ""}`} key={dayKey(date)}>
                <span className="pln-shifts__month-day-number">{date.getDate()}</span>
                <div className="pln-shifts__month-events">
                  {dayShifts.slice(0, 3).map((shift) => (
                    <ShiftEvent
                      key={shift.id}
                      shift={shift}
                      canManage={canManage}
                      onSelectShift={onSelectShift}
                      compact
                    />
                  ))}
                  {dayShifts.length > 3 && (
                    <span className="pln-shifts__more-events">+{dayShifts.length - 3} more</span>
                  )}
                  {dayShifts.length === 0 && canManage && (
                    <button
                      type="button"
                      className="pln-shifts__month-add"
                      onClick={() => onAddShift?.({ date, employeeId: "" })}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const firstDay = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(firstDay);
    date.setDate(firstDay.getDate() + index);
    return date;
  });
  const rows = [...employees];
  const knownIds = new Set(rows.map((employee) => employee.id));
  visibleShifts.forEach((shift) => {
    if (shift.employee_id && !knownIds.has(shift.employee_id)) {
      rows.push({
        id: shift.employee_id,
        full_name: shift.employee_name || "Staff member",
        role: shift.employee_role || "",
      });
      knownIds.add(shift.employee_id);
    }
  });
  if (visibleShifts.some((shift) => !shift.employee_id)) {
    rows.push({ id: "__unassigned__", full_name: "Unassigned shifts", role: "" });
  }

  const weekStart = dayKey(days[0]);
  const weekEndDate = new Date(days[6]);
  weekEndDate.setDate(weekEndDate.getDate() + 1);
  const weekEnd = dayKey(weekEndDate);
  const weekShifts = visibleShifts.filter((shift) => {
    const key = dayKey(shift.start_time);
    return key >= weekStart && key < weekEnd;
  });

  return (
    <div className="pln-shifts__week-wrap">
      {weekShifts.length === 0 && rows.length === 0 ? (
        <div className="pln-shifts__message">
          No staff or shifts are available for this organization yet.
        </div>
      ) : (
        <div className="pln-shifts__week-grid">
          <div className="pln-shifts__week-staff-head">Staff member</div>
          {days.map((day) => (
            <div className="pln-shifts__week-day-head" key={dayKey(day)}>
              <span>{WEEKDAYS[(day.getDay() + 6) % 7]}</span>
              <strong>{day.getDate()}</strong>
            </div>
          ))}
          {rows.map((employee) => (
            <React.Fragment key={employee.id}>
              <div className="pln-shifts__week-employee">
                <strong>{employee.id === "__unassigned__" ? "Unassigned" : employee.full_name || employee.name || employee.email}</strong>
                <span>{employee.role || (employee.id === "__unassigned__" ? "Needs an assignee" : "Team member")}</span>
              </div>
              {days.map((day) => {
                const dateKey = dayKey(day);
                const cellShifts = weekShifts.filter((shift) =>
                  dayKey(shift.start_time) === dateKey &&
                  (employee.id === "__unassigned__" ? !shift.employee_id : shift.employee_id === employee.id)
                );
                return (
                  <div className="pln-shifts__week-cell" key={`${employee.id}-${dateKey}`}>
                    {cellShifts.map((shift) => (
                      <ShiftEvent
                        key={shift.id}
                        shift={shift}
                        canManage={canManage}
                        onSelectShift={onSelectShift}
                      />
                    ))}
                    {cellShifts.length === 0 && canManage && (
                      <button
                        type="button"
                        className="pln-shifts__add-slot"
                        onClick={() => onAddShift?.({ date: day, employeeId: employee.id === "__unassigned__" ? "" : employee.id })}
                      >
                        <span>+</span> Add shift
                      </button>
                    )}
                    {cellShifts.length === 0 && !canManage && (
                      <span className="pln-shifts__empty-slot">—</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
