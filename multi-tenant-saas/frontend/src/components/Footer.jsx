import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="sp-footer">
      <div className="sp-footer-inner">
        <div className="sp-footer-brand">
          <strong>ShiftPulse</strong>
          <p>Scheduling and timesheets for multi-location teams.</p>
        </div>

        <div className="sp-footer-cols">
          <div>
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/">Home</Link>
            <Link to="/login">Log in</Link>
          </div>
          <div>
            <h4>Links</h4>
            <Link to="/register">Start free</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
      </div>
      <div className="sp-footer-bottom">
        <span>© {new Date().getFullYear()} ShiftPulse</span>
      </div>
    </footer>
  );
}
