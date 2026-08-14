import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/client.js";
import "./AddShiftForm.css";

export const AddShiftForm = () => {
  const { id } = useParams(); // Extracts the organization ID directly from the URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Front-end validation: Ensure end time is after start time
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      setError("End time must be after the start time.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post(`/companies/${id}/add-shift`, formData);
      
      if (response.status === 201) {
        setSuccess(true);
        setFormData({ name: "", start_time: "", end_time: "" }); // Reset form
        
        // Redirect back to single organization view after 1.5 seconds
        setTimeout(() => {
          navigate(`/singletenant/${id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2 className="form-title">Schedule New Shift</h2>
        <p className="form-description">Create and assign a working shift rota for this organization.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Shift Name / Role</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., Morning Security Tier 1"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_time">Start Date & Time</label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              required
              value={formData.start_time}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time">End Date & Time</label>
            <input
              type="datetime-local"
              id="end_time"
              name="end_time"
              required
              value={formData.end_time}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Adding Shift..." : "Schedule Shift"}
          </button>
        </form>

        {success && (
          <div className="status-message success">
            Shift added successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="status-message error">
            {error}
          </div>
        )}
        
        <button className="back-button" onClick={() => navigate(`/singletenant/${id}`)}>
          Cancel and Go Back
        </button>
      </div>
    </div>
  );
};
