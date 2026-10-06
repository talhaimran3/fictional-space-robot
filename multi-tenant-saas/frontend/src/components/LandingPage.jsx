import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Users,
  Clock3,
} from "lucide-react";
import "./LandingPage.css";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Smart rota builder",
    body: "Drag-and-drop weekly shifts with overlap and overtime checks before you publish.",
  },
  {
    icon: MapPin,
    title: "Geofenced clock-ins",
    body: "Staff clock in from the right location so attendance stays accurate and fair.",
  },
  {
    icon: Wallet,
    title: "Live labor budgeting",
    body: "See planned cost against budget caps in real time before the week goes live.",
  },
  {
    icon: Users,
    title: "Multi-branch teams",
    body: "One workspace for every location — people, shifts, and timesheets in sync.",
  },
  {
    icon: Clock3,
    title: "Timesheets that stick",
    body: "Approve, flag, and export hours without chasing spreadsheets every Friday.",
  },
  {
    icon: CheckCircle2,
    title: "Conflict-aware scheduling",
    body: "Catch double-bookings and availability clashes before they hit the floor.",
  },
];

export default function LandingPage() {
  return (
    <div className="sp-landing">
      {/* Hero */}
      <section className="sp-hero">
        <div className="sp-hero-inner">
          <span className="sp-pill">Workforce scheduling, simplified</span>
          <h1>
            Run every shift with
            <span className="sp-hero-accent"> calm control</span>
          </h1>
          <p className="sp-hero-sub">
            ShiftPulse helps multi-branch teams plan rotas, track hours, and stay
            on budget — without the spreadsheet chaos.
          </p>
          <div className="sp-hero-ctas">
            <Link to="/register" className="sp-btn sp-btn--primary sp-btn--lg">
              Get started free
              <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" className="sp-btn sp-btn--outline sp-btn--lg">
              View pricing
            </Link>
          </div>
          <div className="sp-hero-meta">
            <span>No credit card required</span>
            <span className="sp-dot" />
            <span>Setup in minutes</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sp-section" id="features">
        <div className="sp-section-inner">
          <div className="sp-section-head">
            <h2>Everything you need to run locations</h2>
            <p>Built for shift managers and store leads who need clarity, not clutter.</p>
          </div>
          <div className="sp-features-grid">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="sp-feature-card">
                <div className="sp-feature-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="sp-section sp-section--muted">
        <div className="sp-section-inner sp-teaser">
          <div className="sp-teaser-copy">
            <h2>Simple plans that scale with you</h2>
            <p>
              Start free, then grow into multi-location and enterprise options when
              you are ready. Full details live on the pricing page.
            </p>
          </div>
          <Link to="/pricing" className="sp-btn sp-btn--primary">
            See plans
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="sp-section">
        <div className="sp-section-inner">
          <div className="sp-cta-card">
            <h2>Ready to steady your schedule?</h2>
            <p>Join teams using ShiftPulse to publish cleaner rotas and fewer last-minute surprises.</p>
            <div className="sp-hero-ctas">
              <Link to="/register" className="sp-btn sp-btn--primary sp-btn--lg">
                Start free trial
              </Link>
              <Link to="/login" className="sp-btn sp-btn--ghost sp-btn--lg">
                I already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
