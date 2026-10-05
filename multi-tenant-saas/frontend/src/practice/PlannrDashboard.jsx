import React, { useState } from "react";
import {
  Clock3,
  TrendingUp,
  DollarSign,
  TriangleAlert,
  Activity,
  Check,
  CheckCircle2,
  X,
} from "lucide-react";
import "./PlannrDashboard.css";

const INITIAL_APPROVALS = [
  { id: 1, initials: "SL", name: "Steven Lane", request: "Sick Leave Request", tag: "Sick Leave", tone: "peach" },
  { id: 2, initials: "RE", name: "Ralph Edwards", request: "Timesheet Variance +2.0h OT", tag: "Overtime", tone: "rose" },
  { id: 3, initials: "JH", name: "Jerry Helfer", request: "Casual Leave Request", tag: "Casual Leave", tone: "cyan" },
];

function SubTabs({ activeSubTab, setActiveSubTab }) {
  return (
    <div className="pd-subtabs">
      <button
        className={activeSubTab === "Overview" ? "active" : ""}
        onClick={() => setActiveSubTab("Overview")}
      >
        Overview
      </button>
      <button
        className={activeSubTab === "Analytics" ? "active" : ""}
        onClick={() => setActiveSubTab("Analytics")}
      >
        <Activity size={13} /> Real-Time Analytics
      </button>
      <button
        className={activeSubTab === "Budget" ? "active" : ""}
        onClick={() => setActiveSubTab("Budget")}
      >
        <TrendingUp size={13} /> Budget Tracking
      </button>
      <button
        className={activeSubTab === "Alerts" ? "active" : ""}
        onClick={() => setActiveSubTab("Alerts")}
      >
        Alerts (2)
      </button>
    </div>
  );
}

function KpiCard({ icon: Icon, title, value, suffix, note, tone, children }) {
  return (
    <article className={`pd-kpi ${tone || ""}`}>
      <div className="pd-kpi-title">
        <span className="pd-kpi-icon"><Icon size={14} /></span>
        <span>{title}</span>
      </div>
      <div className="pd-kpi-value">
        {value}
        {suffix && <em>{suffix}</em>}
      </div>
      {note && <div className="pd-kpi-note">{note}</div>}
      {children}
    </article>
  );
}

function LaborChart() {
  const planned = [142, 105, 88, 169, 116, 154, 101];
  const actual = [98, 112, 94, 151, 109, 143, 76];
  const labels = ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17", "Sun 18"];

  const points = (data) => data.map((v, i) => `${45 + i * 50},${160 - v * 0.65}`).join(" ");
  const area = (data) => `45,160 ${points(data)} 345,160`;

  return (
    <section className="pd-card pd-chart-card">
      <div className="pd-card-heading">
        <div>
          <h2>Scheduled vs. Actual Labor Hours</h2>
          <p>Aug 12 - Aug 18, 2024</p>
        </div>
        <div className="pd-legend">
          <span><i className="planned" /> Planned hours</span>
          <span><i className="actual" /> Actual hours</span>
        </div>
      </div>

      <div className="pd-chart-wrap">
        <div className="pd-chart-y">
          <span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
        </div>
        <svg className="pd-chart" viewBox="0 0 370 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="plannedFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#74b3e9" stopOpacity=".28" />
              <stop offset="1" stopColor="#74b3e9" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="actualFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8d79ce" stopOpacity=".24" />
              <stop offset="1" stopColor="#8d79ce" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 55, 90, 125, 160].map((y) => (
            <line key={y} x1="42" y1={y} x2="350" y2={y} className="pd-grid-line" />
          ))}
          <polygon points={area(planned)} fill="url(#plannedFill)" />
          <polygon points={area(actual)} fill="url(#actualFill)" />
          <polyline points={points(planned)} className="pd-line planned-line" />
          <polyline points={points(actual)} className="pd-line actual-line" />
          {planned.map((v, i) => (
            <circle key={`p${i}`} cx={45 + i * 50} cy={160 - v * .65} r="3" className="pd-point planned-point" />
          ))}
          {actual.map((v, i) => (
            <circle key={`a${i}`} cx={45 + i * 50} cy={160 - v * .65} r="3" className="pd-point actual-point" />
          ))}
          {labels.map((label, i) => (
            <text key={label} x={45 + i * 50} y="176" textAnchor="middle" className="pd-x-label">{label}</text>
          ))}
        </svg>
      </div>
    </section>
  );
}

function Punctuality() {
  return (
    <section className="pd-card pd-punctuality">
      <div className="pd-card-heading">
        <div>
          <h2>Staff Punctuality Overview</h2>
          <p>Today</p>
        </div>
      </div>

      <div className="pd-donut-area">
        <div className="pd-donut">
          <div className="pd-donut-hole" />
        </div>
        <div className="pd-donut-labels">
          <div><i className="blue" /><strong>90%</strong><span>Punctual</span></div>
          <div><i className="orange" /><strong>5%</strong><span>Late</span></div>
          <div><i className="orange2" /><strong>5%</strong><span>Absent</span></div>
        </div>
      </div>
    </section>
  );
}

function PendingApprovals({ approvals, onApproveAll }) {
  return (
    <section className="pd-card pd-approvals">
      <div className="pd-approvals-head">
        <div>
          <h2>Pending Approvals</h2>
          <p>Dublin Office</p>
        </div>
        <button className="pd-approve-all" onClick={onApproveAll}>
          Approve All ({approvals.length})
        </button>
      </div>

      <div className="pd-approval-list">
        {approvals.map((item) => (
          <div className="pd-approval" key={item.id}>
            <span className={`pd-approval-avatar ${item.tone}`}>{item.initials}</span>
            <div className="pd-approval-copy">
              <strong>{item.name}</strong>
              <span>{item.request}</span>
            </div>
            <span className={`pd-request-tag ${item.tone}`}>{item.tag}</span>
          </div>
        ))}
        {!approvals.length && (
          <div className="pd-empty-approvals">
            <Check size={18} />
            <span>All approvals completed!</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default function PlannrDashboard() {
  const [activeSubTab, setActiveSubTab] = useState("Overview");
  const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
  const [isQuickShiftOpen, setIsQuickShiftOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const handleConfirmApproveAll = () => {
    setApprovals([]);
    setIsApproveModalOpen(false);
  };

  return (
    <>
      <SubTabs activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />

      <div className="pd-content">
        <div className="pd-kpis">
          <KpiCard icon={Clock3} title="Active Today" value="38 / 42" note="On Shift • 2 late arrivals" tone="blue" />
          <KpiCard icon={TrendingUp} title="Weekly Hours" value="1,240 hrs" note="+8% vs last week">
            <div className="pd-mini-trend">
              <svg viewBox="0 0 80 28" preserveAspectRatio="none">
                <polyline points="2,23 16,18 28,20 40,12 54,17 67,8 78,4" />
              </svg>
            </div>
          </KpiCard>
          <KpiCard icon={DollarSign} title="Labor Cost" value="$12,450" suffix="/ $15,000" note="83% budget utilized">
            <div className="pd-cost-bar"><span /></div>
          </KpiCard>
          <KpiCard icon={TriangleAlert} title="Unassigned Shifts" value="3 Open Shifts" note="Urgent for tomorrow" tone="alert" />
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
        <div className="pd-modal-backdrop" onClick={() => setIsQuickShiftOpen(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h2>Quick Assign Shift</h2>
              <button className="pd-close-btn" onClick={() => setIsQuickShiftOpen(false)}>
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
                <input type="text" defaultValue="09:00 AM - 05:00 PM" required />
              </label>
              <div className="pd-modal-actions">
                <button type="button" className="pd-secondary-btn" onClick={() => setIsQuickShiftOpen(false)}>
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
        <div className="pd-modal-backdrop" onClick={() => setIsApproveModalOpen(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h2>Approve Pending Requests</h2>
              <button className="pd-close-btn" onClick={() => setIsApproveModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="pd-modal-body">
              <p style={{ margin: 0, color: "#6e7380", fontSize: "13px" }}>
                Are you sure you want to approve all <strong>{approvals.length} pending request(s)</strong> for Dublin Office?
              </p>
              <div className="pd-modal-actions">
                <button type="button" className="pd-secondary-btn" onClick={() => setIsApproveModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="pd-primary-btn" onClick={handleConfirmApproveAll}>
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