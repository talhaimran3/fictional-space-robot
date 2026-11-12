import React from "react";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function ProfileLink({ user, name, role }) {
  return (
    <Link
      className="pl-profile"
      to="/admin2/profile"
      aria-label={"Open profile for " + name}
    >
      <Avatar name={name} imageUrl={user?.profile_image_url} />
      <span className="pl-profile-info">
        <strong>{name}</strong>
        <span>{role}</span>
      </span>
    </Link>
  );
}
