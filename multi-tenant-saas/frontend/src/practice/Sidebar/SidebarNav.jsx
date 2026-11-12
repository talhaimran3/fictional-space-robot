import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarNav({ items, activePath, onNavigate }) {
  return (
    <nav className="pl-main-nav" aria-label="Workspace">
      <p className="pl-nav-label">WORKSPACE</p>

      <div className="pl-nav-menu">
        {items.map(({ label, icon: Icon, path }) => {
          const isCurrent = activePath === path;

          return (
            <NavLink
              key={path}
              to={path}
              end
              title={label}
              onClick={onNavigate}
              className={"pl-nav-item" + (isCurrent ? " is-active" : "")}
            >
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {isCurrent && <span className="pl-active-dot" aria-hidden="true" />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
