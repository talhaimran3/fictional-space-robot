import { Activity, TrendingUp } from "lucide-react";

export function SubTabs({ activeSubTab, setActiveSubTab }) {
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
