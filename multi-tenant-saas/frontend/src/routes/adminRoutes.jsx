// src/routes/adminRoutes.jsx
import { Route } from "react-router-dom";
import AdminLayout from "../admin/layouts/AdminLayout";
import AdminDashboard from "../admin/components/developerComponents/AdminDashboard";
import AllOrganizationsPage from "../components/organizations/AllOrganizationsPage";
import { SingleOrganizationPage } from "../components/organizations/SingleOrganizationPage";
import { AllOrganizationsShifts } from "../components/organizations/AllOrganizationsShifts";
import AllEmployeesPage from "../components/employees/AllEmployeesPage";
import DeveloperPortal from "../admin/DeveloperPortal";
import { HealthDashboard } from "../api/HealthDashboard";

export const adminRoutes = (
  <>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="organizations" element={<AllOrganizationsPage />} />
      <Route path="organizations/:id" element={<SingleOrganizationPage />} />
      <Route path="shifts" element={<AllOrganizationsShifts />} />
      <Route path="employees" element={<AllEmployeesPage />} />
      <Route path="developer" element={<DeveloperPortal />} />
      <Route path="apihealth" element={<HealthDashboard />} />
      {/* Legacy paths */}
      <Route path="org/all" element={<AllOrganizationsPage />} />
      <Route path="org/all/:id" element={<SingleOrganizationPage />} />
    </Route>
  </>
);
