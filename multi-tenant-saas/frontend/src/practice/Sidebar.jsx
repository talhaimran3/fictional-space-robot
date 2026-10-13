import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  Settings,
  Sparkles,
  ArrowUpRight,
  ChevronsUpDown,
  X,
  Clock3,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOrganizations } from "../hooks/useOrganizations";
import { useAuth } from "../context/authContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin2" },
  { label: "Shifts", icon: CalendarDays, path: "/admin2/shifts" },
  { label: "Timesheets", icon: Clock3, path: "/admin2/timesheets" },
  { label: "People", icon: Users, path: "/admin2/people" },
  { label: "Organizations", icon: Building2, path: "/admin/organizations" },
];

export default function Sidebar({ isOpen, onClose, activeNav = "Shifts" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { organizations, loading: organizationsLoading } = useOrganizations();
  const [isOrgMenuOpen, setIsOrgMenuOpen] = useState(false);
  const selectedOrganizationId = searchParams.get("organizationId") || "";
  const selectedOrganization = organizations.find(
    (organization) => organization.id === selectedOrganizationId
  );

  useEffect(() => {
    if (organizationsLoading || organizations.length === 0) return;
    if (organizations.some((organization) => organization.id === selectedOrganizationId)) return;

    const userOrganizationId = user?.organization_id || user?.organizationId;
    const defaultOrganization =
      organizations.find((organization) => organization.id === userOrganizationId) ||
      organizations[0];

    if (defaultOrganization) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("organizationId", defaultOrganization.id);
        return next;
      }, { replace: true });
    }
  }, [organizations, organizationsLoading, selectedOrganizationId, setSearchParams, user]);

  const selectOrganization = (organizationId) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("organizationId", organizationId);
      return next;
    });
    setIsOrgMenuOpen(false);
    onClose?.();
  };

  return (
    <>
      {isOpen && <div className="pl-mobile-backdrop" onClick={onClose} />}
      <aside className={`pl-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="pl-brand-row">
          <div className="pl-brand">
            <div className="pl-brand-mark">p<span /></div>
            <strong>plannr</strong>
          </div>
          <button className="pl-mobile-close" type="button" onClick={onClose} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <div className="pl-org-switcher-wrap">
          <button
            className="pl-org-switcher"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isOrgMenuOpen}
            onClick={() => setIsOrgMenuOpen((open) => !open)}
          >
            <div className="pl-org-monogram"><Building2 size={16} /></div>
            <div className="pl-org-copy">
              <strong>{selectedOrganization?.name || (organizationsLoading ? "Loading…" : "Select organization")}</strong>
              <span>{selectedOrganization ? "Team workspace" : "No organization selected"}</span>
            </div>
            <ChevronsUpDown size={14} />
          </button>

          {isOrgMenuOpen && (
            <div className="pl-org-menu" role="listbox" aria-label="Organizations">
              {organizations.map((organization) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={organization.id === selectedOrganizationId}
                  className={organization.id === selectedOrganizationId ? "is-selected" : ""}
                  key={organization.id}
                  onClick={() => selectOrganization(organization.id)}
                >
                  <strong>{organization.name}</strong>
                  <span>{organization.slug}</span>
                </button>
              ))}
              {!organizationsLoading && organizations.length === 0 && (
                <p>No organizations available.</p>
              )}
            </div>
          )}
        </div>

        <nav className="pl-main-nav">
          <div className="pl-nav-label">WORKSPACE</div>
          <div className="pl-nav-menu">
            {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
              const active = activeNav === label;
              return (
                <button
                  key={label}
                  className={`pl-nav-item ${active ? "is-active" : ""}`}
                  type="button"
                  onClick={() => {
                    navigate(path);
                    onClose?.();
                  }}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span>{label}</span>
                  {active && <span className="pl-active-dot" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="pl-sidebar-spacer" />

        <div className="pl-support-card">
          <div className="pl-support-title">
            <Sparkles size={16} />
            <strong>A little help?</strong>
          </div>
          <p>Your team, running smoothly. We’re here if you need us.</p>
          <button type="button" className="pl-help-link" onClick={() => alert("Help Center")}>
            Visit help center <ArrowUpRight size={14} />
          </button>
        </div>

        <button className="pl-settings-link" type="button" onClick={() => alert("Settings")}>
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="pl-copyright">© 2026 Plannr</div>
      </aside>
    </>
  );
}
