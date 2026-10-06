export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="sa-empty sa-card">
      {Icon && (
        <div className="sa-empty__icon">
          <Icon size={26} />
        </div>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
