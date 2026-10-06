import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Wallet } from "lucide-react";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="sp-landing">
      <section className="sp-landing-hero">
        <span className="sp-landing-pill">Next-gen workforce management</span>
        <h1>
          Automated rota scheduling
          <br />
          built for multi-branch teams
        </h1>
        <p>
          Eliminate shift overlaps, manage labor budgets in real time, and let
          staff swap schedules without the spreadsheet chaos.
        </p>
        <div className="sp-landing-ctas">
          <Link to="/register" className="sp-landing-btn sp-landing-btn--primary">
            Get started free
            <ArrowRight size={16} />
          </Link>
          <Link to="/pricing" className="sp-landing-btn sp-landing-btn--outline">
            View plans &amp; pricing
          </Link>
        </div>
      </section>

      <section className="sp-landing-features">
        <div className="sp-landing-section-head">
          <h2>Everything you need to run your locations</h2>
          <p>Designed for shift managers and store leads.</p>
        </div>
        <div className="sp-landing-grid">
          <article className="sp-landing-card">
            <div className="sp-landing-icon">
              <CalendarDays size={20} />
            </div>
            <h3>Smart rota builder</h3>
            <p>
              Drag and drop weekly shifts with automated conflict and overtime
              detection.
            </p>
          </article>
          <article className="sp-landing-card">
            <div className="sp-landing-icon">
              <MapPin size={20} />
            </div>
            <h3>Geofenced clock-ins</h3>
            <p>
              Ensure employees clock in from their assigned location for cleaner
              attendance.
            </p>
          </article>
          <article className="sp-landing-card">
            <div className="sp-landing-icon">
              <Wallet size={20} />
            </div>
            <h3>Live labor budgeting</h3>
            <p>
              Track wages against budget caps before you publish the week&apos;s
              rota.
            </p>
          </article>
        </div>
        <div className="sp-landing-cta-band">
          <h2>See all product features</h2>
          <Link to="/features" className="sp-landing-btn sp-landing-btn--primary">
            Explore features
          </Link>
        </div>
      </section>
    </div>
  );
}
