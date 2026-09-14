// src/admin/components/PlatformActivityPanel.jsx

import ActivityItem from "./ActivityItem";

export default function PlatformActivityPanel() {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Platform Activity</h2>
          <p>Recent platform activity.</p>
        </div>
      </div>

      <div className="activity-list">
        <ActivityItem
          title="Organization created"
          description="ABC School was registered"
          time="12 minutes ago"
        />
        <ActivityItem
          title="Employee added"
          description="XYZ School added a new employee"
          time="34 minutes ago"
        />
        <ActivityItem
          title="Shift updated"
          description="Morning Shift was modified"
          time="1 hour ago"
        />
        <ActivityItem
          title="Admin login"
          description="Organization administrator logged in"
          time="2 hours ago"
        />
      </div>
    </section>
  );
}