import { Check } from "lucide-react";

export function PendingApprovals({ approvals, onApproveAll }) {
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