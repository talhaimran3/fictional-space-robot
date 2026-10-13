import React, { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const emptyForm = (initial = {}) => ({
  name: initial.name || "Scheduled Shift",
  employee_id: initial.employee_id || "",
  start_time: toDateTimeLocal(initial.start_time),
  end_time: toDateTimeLocal(initial.end_time),
  status: initial.status || "scheduled",
  notes: initial.notes || "",
});

export default function ShiftModal({
  organizationName,
  employees = [],
  shift = null,
  initialValues = {},
  saving = false,
  onClose,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState(() => emptyForm(shift || initialValues));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(emptyForm(shift || initialValues));
    setError("");
  }, [shift, initialValues]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.start_time || !form.end_time) {
      setError("Choose both a start and end time.");
      return;
    }
    if (new Date(form.start_time) >= new Date(form.end_time)) {
      setError("The end time must be later than the start time.");
      return;
    }

    try {
      await onSave({
        name: form.name.trim() || "Scheduled Shift",
        employee_id: form.employee_id || null,
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        status: form.status,
        notes: form.notes.trim() || null,
      });
    } catch (saveError) {
      setError(saveError?.message || "Could not save this shift.");
    }
  };

  const deleteShift = async () => {
    setError("");
    try {
      await onDelete?.();
    } catch (deleteError) {
      setError(deleteError?.message || "Could not delete this shift.");
    }
  };

  return (
    <div className="pln-shifts__modal-backdrop" onMouseDown={onClose}>
      <section
        className="pln-shifts__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pln-shift-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="pln-shifts__modal-header">
          <div>
            <span>{organizationName || "Organization"}</span>
            <h2 id="pln-shift-modal-title">{shift ? "Edit shift" : "Create shift"}</h2>
          </div>
          <button type="button" className="pln-shifts__icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>

        <form className="pln-shifts__modal-form" onSubmit={submit}>
          <label>
            Shift name
            <input name="name" value={form.name} onChange={update} maxLength={255} required disabled={saving} />
          </label>

          <label>
            Staff member
            <select name="employee_id" value={form.employee_id} onChange={update} disabled={saving}>
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name || employee.name || employee.email}
                </option>
              ))}
            </select>
          </label>

          <div className="pln-shifts__form-row">
            <label>
              Starts
              <input type="datetime-local" name="start_time" value={form.start_time} onChange={update} required disabled={saving} />
            </label>
            <label>
              Ends
              <input type="datetime-local" name="end_time" value={form.end_time} onChange={update} required disabled={saving} />
            </label>
          </div>

          <label>
            Status
            <select name="status" value={form.status} onChange={update} disabled={saving}>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-show</option>
            </select>
          </label>

          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={update} rows={3} maxLength={5000} disabled={saving} />
          </label>

          {error && <p className="pln-shifts__form-error" role="alert">{error}</p>}

          <footer className="pln-shifts__modal-actions">
            {shift && (
              <button
                type="button"
                className="pln-shifts__button pln-shifts__button--danger"
                disabled={saving}
                onClick={deleteShift}
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <span className="pln-shifts__actions-spacer" />
            <button type="button" className="pln-shifts__button pln-shifts__button--quiet" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="pln-shifts__button pln-shifts__button--primary" disabled={saving}>
              {saving ? "Saving…" : shift ? "Save changes" : "Create shift"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
