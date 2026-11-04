import React, { useState } from "react";
import { Clock3, TrendingUp, DollarSign, TriangleAlert, X } from "lucide-react";
import "./PlannrDashboard.css";
import { KpiCard } from "./DashboardComponents/KpiCard";
import { Attendance } from "./DashboardComponents/Attendance";
import { useShifts } from "../hooks/useShifts";
import { useAttendance } from "../hooks/useAttendance";

export default function PlannrDashboard() {
  const [isQuickShiftOpen, setIsQuickShiftOpen] = useState(false);
  const { shifts, shiftsCounts } = useShifts();
  const { summary } = useAttendance();

  const today = new Date();

  const activeToday = shifts.filter((shift) => {
    const start = new Date(shift.start_time);
    const end = new Date(shift.end_time);

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const overlapsToday = start < startOfTomorrow && end > startOfToday;

    return overlapsToday && shift.status === "scheduled";
  }).length;
  const weeklyHours = shifts.reduce((total, shift) => {
    const start = new Date(shift.start_time);
    const end = new Date(shift.end_time);

    const hours = (end - start) / (1000 * 60 * 60);

    return total + hours;
  }, 0);

  return (
    <>
      {/* <SubTabs activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} /> */}

      <div className="pd-content">
        <div className="pd-kpis">
          <KpiCard
            icon={Clock3}
            title="Active Today"
            value={activeToday.toString() + `/${shifts.length} shifts`}
            note="Scheduled shifts overlapping today"
            tone="blue"
          />
          <KpiCard
            icon={TrendingUp}
            title="Weekly Hours"
            value={weeklyHours.toFixed(1) + " hrs"}
            // note="+8% vs last week"
          >
            <div className="pd-mini-trend">
              <svg viewBox="0 0 80 28" preserveAspectRatio="none">
                <polyline points="2,23 16,18 28,20 40,12 54,17 67,8 78,4" />
              </svg>
            </div>
          </KpiCard>
          <KpiCard
            icon={DollarSign}
            title="Labor Cost"
            value={summary.total_labor_cost}
            suffix={`/${summary.scheduled_labor_cost}`}
            note={`${Math.round((summary.total_labor_cost / summary.scheduled_labor_cost) * 100)}% budget utilized`}
          >
            <div className="pd-cost-bar">
              <span />
            </div>
          </KpiCard>

          <KpiCard
            icon={TriangleAlert}
            title="Open Shifts"
            value={shiftsCounts.unassigned_shifts || 0}
            note={`${shiftsCounts.assigned_shifts || 0} assigned shifts`}
            tone="alert"
          />
        </div>

        <div className="pd-dashboard-grid">
          <Attendance />
        </div>
      </div>

      {/* Quick Shift Modal */}
      {isQuickShiftOpen && (
        <div
          className="pd-modal-backdrop"
          onClick={() => setIsQuickShiftOpen(false)}
        >
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h2>Quick Assign Shift</h2>
              <button
                className="pd-close-btn"
                onClick={() => setIsQuickShiftOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsQuickShiftOpen(false);
                alert("Quick Shift created successfully!");
              }}
              className="pd-modal-body"
            >
              <label>
                <span>Staff Member</span>
                <select required>
                  <option>Jerry Helfer (Office Manager)</option>
                  <option>Bessie Cooper (Customer Support)</option>
                  <option>Ralph Edwards (Operations)</option>
                </select>
              </label>
              <label>
                <span>Timing</span>
                <input
                  type="text"
                  defaultValue="09:00 AM - 05:00 PM"
                  required
                />
              </label>
              <div className="pd-modal-actions">
                <button
                  type="button"
                  className="pd-secondary-btn"
                  onClick={() => setIsQuickShiftOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="pd-primary-btn">
                  Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
