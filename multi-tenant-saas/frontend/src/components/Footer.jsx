// multi-tenant-saas/frontend/src/components/Footer.jsx
import { Link } from "react-router-dom";
import "./Footer.css";

const productLinks = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "Smart Rota Builder", to: "/features#smart-rota-builder" },
  { label: "Geofenced Clock-ins", to: "/features#geofenced-clock-ins" },
  { label: "Live Labor Budgeting", to: "/features#live-labor-budgeting" },
  { label: "Pricing", to: "/pricing" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">
            <span className="footer-brand-mark" aria-hidden="true">⚡</span>
            <span>ShiftPulse</span>
          </Link>
          <p className="footer-tagline">
            Automated Rota Scheduling built for Multi-Branch Teams
          </p>
          <p className="footer-copyright">
            © {new Date().getFullYear()} ShiftPulse. All rights reserved.
          </p>
        </div>

        <div className="footer-column">
          <h2>Product</h2>
          <nav aria-label="Product links">
            {productLinks.map((link) => (
              <Link key={link.label} to={link.to}>{link.label}</Link>
            ))}
          </nav>
        </div>

        <div className="footer-column">
          <h2>Portals</h2>
          <nav aria-label="Portal links">
            <Link to="/admin">Admin Portal</Link>
            <Link to="/admin/developer">Developer Portal</Link>
            <Link to="/admin/apihealth">API Health</Link>
          </nav>
        </div>

        <div className="footer-column">
          <h2>Legal &amp; Social</h2>
          <nav aria-label="Legal links">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
          </nav>
          <div className="footer-status" role="status">
            <span className="footer-status-dot" aria-hidden="true" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
