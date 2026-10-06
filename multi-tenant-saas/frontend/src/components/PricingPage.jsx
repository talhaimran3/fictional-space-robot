import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
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
    features: [
      "Unlimited staff",
      "Conflict-aware rotas",
      "Timesheets & approvals",
      "Priority support",
    ],
    cta: "Start trial",
    to: "/register",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "Multi-brand / multi-region",
    features: [
      "SSO & advanced roles",
      "Dedicated success",
      "Custom exports",
      "SLA support",
    ],
    cta: "Contact sales",
    to: "/register",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="sp-pricing">
      <header className="sp-pricing-hero">
        <span className="sp-pricing-pill">Pricing</span>
        <h1>Simple plans that scale with your locations</h1>
        <p>Start free. Upgrade when you need multi-location controls.</p>
      </header>

      <div className="sp-pricing-grid">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={`sp-pricing-card ${plan.featured ? "is-featured" : ""}`}
          >
            <h2>{plan.name}</h2>
            <div className="sp-pricing-price">{plan.price}</div>
            <p className="sp-pricing-detail">{plan.detail}</p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>
                  <Check size={15} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to={plan.to}
              className={`sp-pricing-btn ${plan.featured ? "primary" : ""}`}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
