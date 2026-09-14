// src/admin/components/SystemHealthPanel.jsx

import { CheckCircle2 } from "lucide-react";
import HealthItem from "./HealthItem";

export default function SystemHealthPanel() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>System Health</h2>
          <p>Current platform infrastructure status.</p>
        </div>
        <CheckCircle2 size={20} className="health-icon" />
      </div>

      <div className="health-list">
        <HealthItem label="API" status="Operational" />
        <HealthItem label="PostgreSQL" status="Operational" />
        <HealthItem label="Redis" status="Operational" />
        <HealthItem label="Background Jobs" status="Operational" />
      </div>
    </section>
  );
}