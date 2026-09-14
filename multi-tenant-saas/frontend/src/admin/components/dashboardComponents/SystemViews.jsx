// src/admin/components/SystemViews.jsx

import { HealthDashboard } from "../../../../api/HealthDashboard";
import DataTable from "../../DataTable";

export function ApiHealthView() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">INFRASTRUCTURE</span>
          <h1>API Health</h1>
          <p>Monitor the health and availability of the application API.</p>
        </div>
      </div>
      <HealthDashboard />
    </>
  );
}

export function DatabaseView() {
  return <DataTable />;
}

export function RedisView() {
  return (
    <div className="page-heading">
      <div>
        <span className="page-eyebrow">INFRASTRUCTURE</span>
        <h1>Redis</h1>
        <p>Monitor Redis connection and cache performance.</p>
      </div>
    </div>
  );
}

export function JobsView() {
  return (
    <div className="page-heading">
      <div>
        <span className="page-eyebrow">INFRASTRUCTURE</span>
        <h1>Background Jobs</h1>
        <p>Monitor queues and background jobs.</p>
      </div>
    </div>
  );
}

export function ErrorsView() {
  return (
    <div className="page-heading">
      <div>
        <span className="page-eyebrow">INFRASTRUCTURE</span>
        <h1>Errors</h1>
        <p>Monitor application errors and failures.</p>
      </div>
    </div>
  );
}