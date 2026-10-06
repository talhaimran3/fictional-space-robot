import { X } from "lucide-react";

export default function ModalShell({
  isOpen,
  onClose,
  icon: Icon,
  title,
  description,
  children,
  size = "default",
}) {
  if (!isOpen) return null;

  return (
    <div className="sa-modal-overlay" onClick={onClose}>
      <div
        className={`sa-modal ${size === "sm" ? "sa-modal--sm" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="sa-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {Icon && (
          <div className="sa-modal__icon">
            <Icon size={24} />
          </div>
        )}
        {title && <h2>{title}</h2>}
        {description && <p className="sa-modal__desc">{description}</p>}
        {children}
      </div>
    </div>
  );
}
