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

const statusClass = (status = "scheduled") =>
  String(status).toLowerCase().replace(/[^a-z0-9-]/g, "-");

function ShiftEvent({ shift, canManage, onSelectShift }) {
  const label = `${formatTime(shift.start_time)}–${formatTime(shift.end_time)} ${shift.name || "Scheduled Shift"}`;
  const employee = shift.employee_name || "Unassigned";

  return (
    <button
      type="button"
      className={`pln-shifts__event pln-shifts__event--${statusClass(shift.status)}`}
      title={`${employee} · ${label} · ${shift.status}`}
      disabled={!canManage}
      onClick={() => onSelectShift?.(shift)}
    >
      <strong>{formatTime(shift.start_time)}–{formatTime(shift.end_time)}</strong>
      <span>{shift.name || "Scheduled Shift"}</span>
      <small>{employee}</small>
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

  // Week view shows seven dates; month view extends the same staff-by-date
  // rota across every date in the selected calendar month.
  let dates;
  if (view === "month") {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    dates = Array.from({ length: daysInMonth }, (_, index) =>
      new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1)
    );
  } else {
    const firstDay = startOfWeek(currentDate);
    dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      return date;
    });
  }

  const firstDateKey = dayKey(dates[0]);
  const lastDate = new Date(dates[dates.length - 1]);
  lastDate.setDate(lastDate.getDate() + 1);
  const endDateKey = dayKey(lastDate);
  const periodShifts = visibleShifts.filter((shift) => {
    const key = dayKey(shift.start_time);
    return key >= firstDateKey && key < endDateKey;
  });

  const rows = [...employees];
  const knownIds = new Set(rows.map((employee) => String(employee.id)));

  periodShifts.forEach((shift) => {
    if (shift.employee_id && !knownIds.has(String(shift.employee_id))) {
      rows.push({
        id: shift.employee_id,
        full_name: shift.employee_name || "Staff member",
        role: shift.employee_role || "",
      });
      knownIds.add(String(shift.employee_id));
    }
  });

  if (periodShifts.some((shift) => !shift.employee_id)) {
    rows.push({ id: "__unassigned__", full_name: "Unassigned shifts", role: "" });
  }

  const isMonth = view === "month";
  const columns = `minmax(190px, 225px) repeat(${dates.length}, minmax(${isMonth ? "112px" : "145px"}, 1fr))`;

  return (
    <div
      className={`pln-shifts__week-wrap ${isMonth ? "pln-shifts__week-wrap--month" : ""}`}
      aria-label={isMonth ? "Monthly staff rota" : "Weekly staff rota"}
    >
      {periodShifts.length === 0 && rows.length === 0 ? (
        <div className="pln-shifts__message">
          No staff or shifts are available for this organization yet.
        </div>
      ) : (
        <div
          className={`pln-shifts__week-grid ${isMonth ? "pln-shifts__week-grid--month" : ""}`}
          style={{ gridTemplateColumns: columns }}
        >
          <div className="pln-shifts__week-staff-head">Staff member</div>
          {dates.map((date) => (
            <div className="pln-shifts__week-day-head" key={dayKey(date)}>
              <span>{new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date)}</span>
              <strong>{date.getDate()}</strong>
            </div>
          ))}

          {rows.map((employee) => (
            <React.Fragment key={employee.id}>
              <div className="pln-shifts__week-employee">
                <strong>
                  {employee.id === "__unassigned__"
                    ? "Unassigned"
                    : employee.full_name || employee.name || employee.email}
                </strong>
                <span>
                  {employee.role ||
                    (employee.id === "__unassigned__" ? "Needs an assignee" : "Team member")}
                </span>
              </div>

              {dates.map((date) => {
                const dateKey = dayKey(date);
                const cellShifts = periodShifts.filter((shift) =>
                  dayKey(shift.start_time) === dateKey &&
                  (employee.id === "__unassigned__"
                    ? !shift.employee_id
                    : String(shift.employee_id) === String(employee.id))
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
                        onClick={() =>
                          onAddShift?.({
                            date,
                            employeeId: employee.id === "__unassigned__" ? "" : employee.id,
                          })
                        }
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
