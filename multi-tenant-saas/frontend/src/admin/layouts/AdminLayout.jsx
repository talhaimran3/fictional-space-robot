// multi-tenant-saas/frontend/src/layouts/AdminLayout.jsx

import { Outlet } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* Top navbar + sidebar */}
      <Navigation />

      {/* Page content rendered by React Router */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}