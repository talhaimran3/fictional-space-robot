import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/client.js";
import "./EditShiftForm.css";

export const EditShiftForm = () => {
  const { id, shiftId } = useParams(); // Extracts organization ID and shift ID from URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 1. Fetch current shift data to prepopulate the form
  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        setLoading(true);
        // Assuming your backend route handles individual shift lookups
        const response = await apiClient.get(`/companies/${id}/all-shifts/${shiftId}`);
        
        if (response.data && response.data.data) {
          const shift = response.data.data;
          
          // Formats full timestamps into 'YYYY-MM-DDTHH:MM' required by datetime-local inputs
          const formatDateTime = (isoString) => {
            if (!isoString) return "";
            const date = new Date(isoString);
            const pad = (num) => String(num).padStart(2, "0");
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
          };

          setFormData({
            name: shift.name || "",
            start_time: formatDateTime(shift.start_time),
            end_time: formatDateTime(shift.end_time),
          });
        }
      } catch (err) {
        setError(err?.response?.data?.error || err.message || "Failed to load shift details.");
      } finally {
        setLoading(false);
      }
    };

    if (id && shiftId) {
      fetchShiftDetails();
    }
  }, [id, shiftId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    // Timeline Validation Check
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      setError("End time must be after the start time.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiClient.put(`/companies/${id}/edit-shift/${shiftId}`, formData);
      
      if (response.status === 200 || response.data?.status === "success") {
        setSuccess(true);
        // Redirect back to single organization view after 1.5 seconds
        setTimeout(() => {
          navigate(`/singletenant/${id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to update the shift.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="form-status-wrapper">Loading shift timeline details...</div>;
  }

  return (
    <div className="edit-form-container">
      <div className="edit-form-card">
        <h2 className="edit-form-title">Modify Scheduled Shift</h2>
        <p className="edit-form-description">Update the structural title or timeframe rules for this rota window.</p>

        {error && (
          <div className="edit-status-message error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="edit-form-group">
            <label htmlFor="name">Shift Name / Role</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., Night Shift Guard"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="edit-form-group">
            <label htmlFor="start_time">Updated Start Date & Time</label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              required
              value={formData.start_time}
              onChange={handleChange}
            />
          </div>

          <div className="edit-form-group">
            <label htmlFor="end_time">Updated End Date & Time</label>
            <input
              type="datetime-local"
              id="end_time"
              name="end_time"
              required
              value={formData.end_time}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="edit-submit-button" disabled={submitting}>
            {submitting ? "Saving Changes..." : "Apply Route Update"}
          </button>
        </form>

        {success && (
          <div className="edit-status-message success">
            Shift updated smoothly! Redirecting back...
          </div>
        )}
        
        <button className="edit-back-button" onClick={() => navigate(`/singletenant/${id}`)}>
          Discard Changes
        </button>
      </div>
    </div>
  );
};
