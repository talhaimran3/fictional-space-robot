import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import { useAuth } from "../../context/authContext";

export default function ProfileLink({ user, name, role }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="pl-profile-menu">
      <Link
        className="pl-profile"
        to="/admin2/profile"
        aria-label={"Open profile for " + name}
        aria-haspopup="true"
      >
        <Avatar name={name} imageUrl={user?.profile_image_url} />
        <span className="pl-profile-info">
          <strong>{name}</strong>
          <span>{role}</span>
        </span>
        <svg
          className="pl-profile-chevron"
          viewBox="0 0 20 20"
          width="15"
          height="15"
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="pl-profile-dropdown">
        <Link className="pl-profile-dropdown-item" to="/admin2/profile">
          <span aria-hidden="true">👤</span>
          Profile
        </Link>
        <button
          className="pl-profile-dropdown-item pl-profile-logout"
          type="button"
          onClick={handleLogout}
        >
          <span aria-hidden="true">↪</span>
          Logout
        </button>
      </div>
    </div>
  );
}
