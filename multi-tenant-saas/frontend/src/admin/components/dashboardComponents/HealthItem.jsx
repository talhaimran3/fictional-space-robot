export default function HealthItem({ label, status }) {
  return (
    <div className="health-item">
      <div className="health-name">
        <span className="health-dot" />
        <span>{label}</span>
      </div>
      <span className="health-status">{status}</span>
    </div>
  );
}
