// multi-tenant-saas/frontend/src/components/shifts/AddEditShiftFormModal.jsx

import { useState, useEffect } from "react";
import { Clock3, X } from "lucide-react";
import apiClient from "../../../api/client.js";
import "./AddEditShiftFormModal.css";

export const AddEditShiftFormModal = ({
  isOpen,
  onClose,
  organizationId,
  shift = null, // null = create, object = edit
  onSuccess,
}) => {
  const isEdit = Boolean(shift?.id);

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert ISO → datetime-local value
  const toLocalInput = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (shift) {
        setTitle(shift.title || shift.name || "");
        setStartTime(toLocalInput(shift.start_time));
        setEndTime(toLocalInput(shift.end_time));
        setStatus(shift.status || "scheduled");
        setNotes(shift.notes || "");
      } else {
        setTitle("");
        setStartTime("");
        setEndTime("");
        setStatus("scheduled");
        setNotes("");
      }
      setError("");
    }
  }, [isOpen, shift]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !startTime || !endTime) {
      setError("Title, start time and end time are required.");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status,
        notes: notes.trim() || null,
      };

      let response;
      if (isEdit) {
        response = await apiClient.put(
          `/organizations/${organizationId}/edit-shift/${shift.id}`,
          payload
        );
      } else {
        response = await apiClient.post(
          `/organizations/${organizationId}/add-shift`,
          payload
        );
      }

      onSuccess?.(response.data?.data || response.data);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          `Unable to ${isEdit ? "update" : "create"} shift.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="add-edit-shift-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="shift-modal-icon">
          <Clock3 size={26} />
        </div>

        <h2 className="shift-modal-title">
          {isEdit ? "Edit Shift" : "Schedule New Shift"}
        </h2>
        <p className="shift-modal-desc">
          {isEdit
            ? "Update the shift details below."
            : "Fill in the details to schedule a new shift."}
        </p>

        <form onSubmit={handleSubmit} className="shift-modal-form">
          <label htmlFor="shift-title">
            Shift title <span className="required">*</span>
            <input
              id="shift-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Morning Shift / Night Shift"
              autoFocus
              required
            />
          </label>

          <label htmlFor="shift-start">
            Start time <span className="required">*</span>
            <input
              id="shift-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </label>

          <label htmlFor="shift-end">
            End time <span className="required">*</span>
            <input
              id="shift-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </label>

          <label htmlFor="shift-status">
            Status
            <select
              id="shift-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </label>

          <label htmlFor="shift-notes">
            Notes (optional)
            <textarea
              id="shift-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="shift-btn secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="shift-btn" disabled={loading}>
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update Shift"
                : "Create Shift"}
            </button>
          </div>
        </form>

        {error && <div className="shift-modal-error">{error}</div>}
      </div>
    </div>
  );
};