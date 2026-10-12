export function KpiCard({ icon: Icon, title, value, suffix, note, tone, children }) {
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
