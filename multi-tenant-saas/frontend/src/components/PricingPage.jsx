import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import "./PricingPage.css";

const PLANS = [
  {
    name: "Starter",
    price: "—",
    blurb: "For a single location getting started.",
    features: ["1 location", "Core scheduling", "Basic timesheets", "Email support"],
    cta: "Choose Starter",
    featured: false,
  },
  {
    name: "Pro",
    price: "—",
    blurb: "For growing multi-branch teams.",
    features: ["Multiple locations", "Conflict checks", "Exports", "Priority support"],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "—",
    blurb: "For larger orgs with custom needs.",
    features: ["Unlimited locations", "Custom roles", "API access", "Dedicated support"],
    cta: "Contact sales",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="sp-pricing">
      <section className="sp-pricing-hero">
        <h1>Simple, transparent pricing</h1>
        <p>Plans will be finalized soon — structure is ready for your numbers.</p>
      </section>

      <section className="sp-pricing-grid-wrap">
        <div className="sp-pricing-grid">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`sp-pricing-card ${plan.featured ? "is-featured" : ""}`}
            >
              {plan.featured && <span className="sp-pricing-badge">Most popular</span>}
              <h3>{plan.name}</h3>
              <p className="sp-pricing-blurb">{plan.blurb}</p>
              <div className="sp-pricing-amount">
                <span>{plan.price}</span>
                <small>/ mo</small>
              </div>
              <ul className="sp-pricing-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={15} strokeWidth={2.2} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`sp-btn ${plan.featured ? "sp-btn--primary" : "sp-btn--outline"}`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
