import React, { useState } from "react";
import {
  Clock3,
  TrendingUp,
  DollarSign,
  TriangleAlert,
  CheckCircle2,
  X,
} from "lucide-react";
import "./PlannrDashboard.css";
import { SubTabs } from "./DashboardComponents/SubTabs";
import { KpiCard } from "./DashboardComponents/KpiCard";
import { LaborChart } from "./DashboardComponents/LaborChart";
import { PendingApprovals } from "./DashboardComponents/PendingApprovals";
import { Punctuality } from "./DashboardComponents/Punctuality";
import { useShifts } from "../hooks/useShifts";

const INITIAL_APPROVALS = [
  {
    id: 1,
    initials: "SL",
    name: "Steven Lane",
    request: "Sick Leave Request",
    tag: "Sick Leave",
    tone: "peach",
  },
  {
    id: 2,
    initials: "RE",
    name: "Ralph Edwards",
    request: "Timesheet Variance +2.0h OT",
    tag: "Overtime",
    tone: "rose",
  },
  {
    id: 3,
    initials: "JH",
    name: "Jerry Helfer",
    request: "Casual Leave Request",
    tag: "Casual Leave",
    tone: "cyan",
  },
];

export default function PlannrDashboard() {
  const [activeSubTab, setActiveSubTab] = useState("Overview");
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [isQuickShiftOpen, setIsQuickShiftOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const { shifts } = useShifts();
  const handleConfirmApproveAll = () => {
    setApprovals([]);
    setIsApproveModalOpen(false);
  };
const today = new Date();

const activeToday = shifts.filter((shift) => {
  const start = new Date(shift.start_time);
  const end = new Date(shift.end_time);

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const overlapsToday =
    start < startOfTomorrow && end > startOfToday;

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
      <SubTabs activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />

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
            value="$12,450"
            suffix="/ $15,000"
            note="83% budget utilized"
          >
            <div className="pd-cost-bar">
              <span />
            </div>
          </KpiCard>
          <KpiCard
            icon={TriangleAlert}
            title="Open Shifts"
            value="Not available"
            note="Open-shift count is not returned by the current shifts hook"
            tone="alert"
          />
        </div>

        <div className="pd-dashboard-grid">
          <LaborChart />
          <Punctuality />
          <PendingApprovals
            approvals={approvals}
            onApproveAll={() => setIsApproveModalOpen(true)}
          />
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

      {/* Approve All Modal */}
      {isApproveModalOpen && (
        <div
          className="pd-modal-backdrop"
          onClick={() => setIsApproveModalOpen(false)}
        >
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h2>Approve Pending Requests</h2>
              <button
                className="pd-close-btn"
                onClick={() => setIsApproveModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="pd-modal-body">
              <p style={{ margin: 0, color: "#6e7380", fontSize: "13px" }}>
                Are you sure you want to approve all{" "}
                <strong>{approvals.length} pending request(s)</strong> for
                Dublin Office?
              </p>
              <div className="pd-modal-actions">
                <button
                  type="button"
                  className="pd-secondary-btn"
                  onClick={() => setIsApproveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pd-primary-btn"
                  onClick={handleConfirmApproveAll}
                >
                  <CheckCircle2 size={16} /> Confirm Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
