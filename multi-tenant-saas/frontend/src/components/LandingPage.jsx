import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin, Wallet } from "lucide-react";
import "./LandingPage.css";

const features = [
  {
    icon: CalendarDays,
    title: "Smart rota builder",
    description:
      "Plan weekly shifts with a clearer view of coverage, conflicts, and overtime.",
  },
  {
    icon: MapPin,
    title: "Location-based attendance",
    description:
      "Keep attendance connected to assigned locations for more reliable records.",
  },
  {
    icon: Wallet,
    title: "Live labor budgeting",
    description:
      "Keep an eye on labor costs before you publish the week's rota.",
  },
];

export default function LandingPage() {
  return (
    <main className="sp-landing">
      <section className="sp-landing-hero" aria-labelledby="sp-landing-title">
        <div className="sp-landing-hero-content">
          <span className="sp-landing-eyebrow">
            Workforce management, made clearer
          </span>

          <h1 id="sp-landing-title">
            Smarter scheduling
            <br />
            for <span className="sp-landing-heading-accent">every location.</span>
          </h1>

          <p className="sp-landing-intro">
            Bring shifts, attendance, and labor costs together. Give managers a
            clearer way to plan and give teams a schedule they can rely on.
          </p>

          <div className="sp-landing-ctas">
            <Link
              to="/register"
              className="sp-landing-btn sp-landing-btn--primary"
            >
              Get started free
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              to="/pricing"
              className="sp-landing-btn sp-landing-btn--secondary"
            >
              View plans &amp; pricing
            </Link>
          </div>

          <p className="sp-landing-note">
            Scheduling and workforce operations in one place.
          </p>
        </div>
      </section>

      <section
        className="sp-landing-features"
        aria-labelledby="sp-landing-features-title"
      >
        <div className="sp-landing-section-head">
          <span className="sp-landing-kicker">CORE CAPABILITIES</span>
          <h2 id="sp-landing-features-title">
            Everything you need to run your locations
          </h2>
          <p>
            Less time coordinating schedules. More time keeping work moving.
          </p>
        </div>

        <div className="sp-landing-grid">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article
              className="sp-landing-card"
              key={title}
              style={{ "--sp-landing-card-index": index }}
            >
              <div className="sp-landing-icon">
                <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <span className="sp-landing-card-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>

        <div className="sp-landing-cta-band">
          <div className="sp-landing-cta-copy">
            <span className="sp-landing-kicker">GET STARTED</span>
            <h2>Make your next schedule a simpler one.</h2>
          </div>
          <Link
            to="/features"
            className="sp-landing-btn sp-landing-btn--primary"
          >
            Explore features
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
