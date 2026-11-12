import React from "react";

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "U";
}

export default function Avatar({ name, imageUrl }) {
  return (
    <span className="pl-avatar" aria-hidden="true">
      {imageUrl ? <img src={imageUrl} alt="" /> : getInitials(name)}
    </span>
  );
}
