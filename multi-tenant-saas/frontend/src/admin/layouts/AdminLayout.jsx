import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Navigation />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
