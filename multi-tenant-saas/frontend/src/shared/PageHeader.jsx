export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}) {
  return (
    <header className="sa-page-header">
      <div>
        {eyebrow && <span className="sa-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="sa-header-actions">{actions}</div>}
    </header>
  );
}
