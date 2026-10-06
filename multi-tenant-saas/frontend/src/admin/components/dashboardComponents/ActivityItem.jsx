export default function ActivityItem({ title, description, time }) {
  return (
    <div className="activity-item">
      <div className="activity-marker" />
      <div className="activity-content">
        <strong>{title}</strong>
        <span>{description}</span>
        <small>{time}</small>
      </div>
    </div>
  );
}
