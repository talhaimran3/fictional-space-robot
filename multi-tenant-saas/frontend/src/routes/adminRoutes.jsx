// src/routes/adminRoutes.jsx

import { Route, Outlet } from "react-router-dom";
import Navigation from "../admin/components/Navigation";
import { AllOrganizationsShifts } from "../components/organizations/AllOrganizationsShifts";
import AllOrganizationsPage from "../components/organizations/AllOrganizationsPage";
import { SingleOrganizationPage } from "../components/organizations/SingleOrganizationPage";
import DeveloperPortal from "../admin/DeveloperPortal";
import { HealthDashboard } from "../../api/HealthDashboard";
import AdminDashboard from "../admin/components/developerComponents/AdminDashboard";
import AllEmployeesPage from "../components/employees/AllEmployeesPage";

// Layout with separate Navbar component
const AdminLayout = () => {
  return (
    <>
      <Navigation />
      <main className="admin-main">
        <Outlet />
      </main>
    </>
  );
};

export const adminRoutes = (
  <>
    {/* Admin routes with Navigation */}
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="organizations" element={<AllOrganizationsPage />} />
      <Route path="organizations/:id" element={<SingleOrganizationPage />} />
      <Route path="shifts" element={<AllOrganizationsShifts />} />
      <Route path="developer" element={<DeveloperPortal />} />
      <Route path="apihealth" element={<HealthDashboard />} />
      <Route path="employees" element={<AllEmployeesPage />} />
      {/* Legacy paths (still work) */}
      <Route path="org/all" element={<AllOrganizationsPage />} />
      <Route path="org/all/:id" element={<SingleOrganizationPage />} />
    </Route>

    {/* Standalone admin routes (no layout) */}

  </>
);