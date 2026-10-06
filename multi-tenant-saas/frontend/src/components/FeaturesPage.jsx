import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Wallet,
  Users,
  Clock3,
  CheckCircle2,
  Shield,
  Bell,
  ArrowRight,
  Layers,
  FileSpreadsheet,
  Building2,
} from "lucide-react";
import "./FeaturesPage.css";

const FEATURES = [
  {
    id: "smart-rota",
    icon: CalendarDays,
    title: "Smart rota builder",
    body: "Build weekly schedules with drag-and-drop ease. Catch overlaps and overtime before you publish.",
  },
  {
    id: "geofenced",
    icon: MapPin,
    title: "Geofenced clock-ins",
    body: "Staff clock in from the right location so attendance stays accurate and disputes drop.",
  },
  {
    id: "labor-budget",
    icon: Wallet,
    title: "Live labor budgeting",
    body: "See planned cost against budget caps in real time before the week goes live.",
  },
  {
    id: "multi-branch",
    icon: Building2,
    title: "Multi-branch teams",
    body: "One workspace for every location — people, shifts, and timesheets stay in sync.",
  },
  {
    id: "timesheets",
    icon: Clock3,
    title: "Timesheets that stick",
    body: "Approve, flag, and export hours without chasing spreadsheets every Friday.",
  },
  {
    id: "conflicts",
    icon: CheckCircle2,
    title: "Conflict-aware scheduling",
    body: "Surface double-bookings and availability clashes before they hit the floor.",
  },
  {
    id: "roles",
    icon: Shield,
    title: "Roles & permissions",
    body: "Give managers the right access per location without exposing the whole org.",
  },
  {
    id: "alerts",
    icon: Bell,
    title: "Shift alerts",
    body: "Notify staff about new shifts, swaps, and approvals so nothing gets missed.",
  },
  {
    id: "exports",
    icon: FileSpreadsheet,
    title: "Clean exports",
    body: "Export timesheets and schedules in formats your payroll process already expects.",
  },
];

const PILLARS = [
  {
    icon: Layers,
    title: "Built for operators",
    body: "Designed around how shift managers actually work — fast edits, clear status, less noise.",
  },
  {
    icon: Users,
    title: "Team-friendly",
    body: "Staff see what they need: their shifts, hours, and requests — without admin clutter.",
  },
  {
    icon: Shield,
    title: "Multi-tenant ready",
    body: "Organizations and locations stay isolated so each brand runs its own workspace cleanly.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="sp-features-page">
      <section className="sp-fp-hero">
        <div className="sp-fp-hero-inner">
          <span className="sp-fp-pill">Product features</span>
          <h1>Everything you need to run shifts with clarity</h1>
          <p>
            ShiftPulse brings scheduling, attendance, and approvals into one calm
            workspace — built for multi-location teams.
          </p>
          <div className="sp-fp-hero-ctas">
            <Link to="/register" className="sp-fp-btn sp-fp-btn--primary">
              Start free trial
              <ArrowRight size={16} />
            </Link>
            <Link to="/pricing" className="sp-fp-btn sp-fp-btn--outline">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="sp-fp-section">
        <div className="sp-fp-inner">
          <div className="sp-fp-section-head">
            <h2>Core capabilities</h2>
            <p>From rota planning to payroll-ready exports — covered end to end.</p>
          </div>
          <div className="sp-fp-grid">
            {FEATURES.map(({ id, icon: Icon, title, body }) => (
              <article key={id} id={id} className="sp-fp-card">
                <div className="sp-fp-card-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-fp-section sp-fp-section--soft">
        <div className="sp-fp-inner">
          <div className="sp-fp-section-head">
            <h2>Why teams choose ShiftPulse</h2>
            <p>Practical tools for managers who need control without complexity.</p>
          </div>
          <div className="sp-fp-pillars">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="sp-fp-pillar">
                <div className="sp-fp-card-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-fp-section">
        <div className="sp-fp-inner">
          <div className="sp-fp-cta">
            <h2>Ready to try it on your next rota?</h2>
            <p>
              Create an account and explore scheduling, people, and timesheets in one
              place.
            </p>
            <div className="sp-fp-hero-ctas">
              <Link to="/register" className="sp-fp-btn sp-fp-btn--primary">
                Get started free
              </Link>
              <Link to="/login" className="sp-fp-btn sp-fp-btn--ghost">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
