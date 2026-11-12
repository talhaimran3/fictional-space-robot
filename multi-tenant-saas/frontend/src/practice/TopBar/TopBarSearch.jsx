import React from "react";
import { Search } from "lucide-react";

export default function TopBarSearch({ placeholder }) {
  return (
    <label className="pl-global-search">
      <Search size={18} aria-hidden="true" />
      <input type="search" aria-label="Search" placeholder={placeholder} />
    </label>
  );
}
