import { Link } from "react-router-dom";
import "./Footer.css";

const COLUMN_1 = [
  { label: "Link 1", to: "/" },
  { label: "Link 2", to: "/features" },
];

const COLUMN_2 = [
  { label: "Link 1", to: "/pricing" },
  { label: "Link 2", to: "/login" },
];

export default function Footer() {
  return (
    <footer className="sp-footer">
      <div className="sp-footer-inner">
        <div className="sp-footer-brand">
          <Link to="/" className="sp-footer-logo">
            <span className="sp-footer-mark">S</span>
            <span>ShiftPulse</span>
          </Link>
          <p>Workforce scheduling that stays clear under pressure.</p>
          <p className="sp-footer-copy">
            © {new Date().getFullYear()} ShiftPulse. All rights reserved.
          </p>
        </div>

        <div className="sp-footer-cols">
          <div className="sp-footer-col">
            <h3>Column 1</h3>
            <nav>
              {COLUMN_1.map((item) => (
                <Link key={item.label + item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="sp-footer-col">
            <h3>Column 2</h3>
            <nav>
              {COLUMN_2.map((item) => (
                <Link key={item.label + item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
