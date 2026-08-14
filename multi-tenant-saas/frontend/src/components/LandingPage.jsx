import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="landing-hero">
        <span className="hero-pill">⚡ Next-Gen Workforce Management</span>
        <h1 className="hero-title">
          Automated Rota Scheduling <br /> built for Multi-Branch Teams
        </h1>
        <p className="hero-subtitle">
          Eliminate shift overlaps, manage labor budgets in real-time, and let
          staff swap schedules effortlessly.
        </p>
        <div className="hero-ctas">
          <Link
            to="/register"
            className="btn-primary"
            style={{ padding: "12px 28px", fontSize: "1rem" }}
          >
            Get Started Free
          </Link>
          <Link
            to="/pricing"
            className="btn-secondary"
            style={{ padding: "12px 24px", fontSize: "1rem" }}
          >
            View Plans & Pricing
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything you need to run your locations</h2>
          <p style={{ color: "#64748b" }}>
            Designed specifically for shift managers and store leads.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🗓️</div>
            <h3>Smart Rota Builder</h3>
            <p style={{ color: "#64748b" }}>
              Drag and drop weekly shifts with automated conflict and overtime
              detection.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Geofenced Clock-ins</h3>
            <p style={{ color: "#64748b" }}>
              Ensure employees clock in directly from their assigned location
              address.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💵</div>
            <h3>Live Labor Budgeting</h3>
            <p style={{ color: "#64748b" }}>
              Track real-time wages against target budget caps before publishing
              rotas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
