import React from "react";
import { Menu } from "lucide-react";

export default function MobileMenuButton({ onClick }) {
  return (
    <button
      className="pl-mobile-hamburger"
      type="button"
      onClick={onClick}
      aria-label="Open navigation"
      aria-controls="pl-sidebar"
    >
      <Menu size={21} />
    </button>
  );
}
