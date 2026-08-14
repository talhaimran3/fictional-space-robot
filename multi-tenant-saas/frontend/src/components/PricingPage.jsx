import React from "react";
import { Link } from "react-router-dom";
import "./PricingPage.css";

export default function PricingPage() {
  return (
    <div>
      <section className="pricing-hero">
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ color: "#64748b" }}>
          Choose the tier that matches your company scale.
        </p>
      </section>

      <div className="pricing-grid">
        {/* Starter Plan */}
        <div className="pricing-card">
          <h3>Starter</h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            For single store locations
          </p>
          <div className="pricing-amount">
            $29 <span style={{ fontSize: "1rem", color: "#64748b" }}>/ mo</span>
          </div>
          <ul className="pricing-features">
            <li>✓ 1 Physical Location</li>
            <li>✓ Up to 15 Employees</li>
            <li>✓ Weekly Rota Builder</li>
            <li>✓ Mobile Employee App</li>
          </ul>
          <Link
            to="/register"
            className="btn-secondary"
            style={{ textAlign: "center" }}
          >
            Choose Starter
          </Link>
        </div>

        {/* Pro Plan (Featured) */}
        <div className="pricing-card featured">
          <span className="pricing-badge">Most Popular</span>
          <h3>Pro Tier</h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            For growing multi-branch chains
          </p>
          <div className="pricing-amount">
            $79 <span style={{ fontSize: "1rem", color: "#64748b" }}>/ mo</span>
          </div>
          <ul className="pricing-features">
            <li>✓ Up to 5 Locations</li>
            <li>✓ Unlimited Staff Members</li>
            <li>✓ Auto-Shift Overlap Detection</li>
            <li>✓ CSV/PDF Timesheet Export</li>
          </ul>
          <Link
            to="/register"
            className="btn-primary"
            style={{ textAlign: "center" }}
          >
            Start 14-Day Free Trial
          </Link>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card">
          <h3>Enterprise</h3>
          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            For large scale franchises
          </p>
          <div className="pricing-amount">
            $199{" "}
            <span style={{ fontSize: "1rem", color: "#64748b" }}>/ mo</span>
          </div>
          <ul className="pricing-features">
            <li>✓ Unlimited Locations</li>
            <li>✓ Custom Manager Permissions</li>
            <li>✓ Dedicated API & System Audit Logs</li>
            <li>✓ Priority Support</li>
          </ul>
          <Link
            to="/register"
            className="btn-secondary"
            style={{ textAlign: "center" }}
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
}
