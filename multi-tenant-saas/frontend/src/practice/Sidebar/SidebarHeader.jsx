import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function SidebarHeader({ onClose }) {
  return (
    <div className="pl-brand-row">
      <Link className="pl-brand" to="/admin2" onClick={onClose}>
        <span className="pl-brand-mark" aria-hidden="true">p<span /></span>
        <strong>plannr</strong>
      </Link>

      <button
        className="pl-mobile-close"
        type="button"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <X size={20} />
      </button>
    </div>
  );
}
