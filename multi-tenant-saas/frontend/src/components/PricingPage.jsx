import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import "./PricingPage.css";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    detail: "For small teams trying ShiftPulse",
    features: ["1 location", "Up to 10 staff", "Basic scheduling", "Email support"],
    cta: "Start free",
    to: "/register",
    featured: false,
  },
  {
    name: "Growth",
    price: "$29",
    detail: "Per location / month",
    features: ["Unlimited staff", "Conflict-aware rotas", "Timesheets & approvals", "Priority support"],
    cta: "Start trial",
    to: "/register",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "Multi-brand / multi-region",
    features: ["SSO & advanced roles", "Dedicated success", "Custom exports", "SLA support"],
    cta: "Contact sales",
    to: "/register",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <main className="sp-pricing">
      <header className="sp-pricing-hero" aria-labelledby="sp-pricing-title">
        <span className="sp-pricing-pill">
          <span className="sp-pricing-pill-dot" aria-hidden="true" />
          Pricing
        </span>
        <h1 id="sp-pricing-title">Simple plans that scale with your locations</h1>
        <p>Start free. Upgrade when you need multi-location controls.</p>
      </header>

      <section className="sp-pricing-grid" aria-label="Available plans">
        {PLANS.map((plan, index) => (
          <article
            key={plan.name}
            className={"sp-pricing-card" + (plan.featured ? " is-featured" : "")}
            style={{ "--sp-pricing-card-index": index }}
          >
            {plan.featured && (
              <span className="sp-pricing-featured-label">Featured plan</span>
            )}
            <h2>{plan.name}</h2>
            <div className="sp-pricing-price">{plan.price}</div>
            <p className="sp-pricing-detail">{plan.detail}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <span className="sp-pricing-check">
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to={plan.to}
              className={"sp-pricing-btn" + (plan.featured ? " primary" : "")}
            >
              {plan.cta}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
