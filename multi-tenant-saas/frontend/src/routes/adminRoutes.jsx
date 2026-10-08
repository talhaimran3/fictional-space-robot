import { Route } from "react-router-dom";
import AdminLayout from "../admin/layouts/AdminLayout";
import { AllOrganizationsShifts } from "../components/organizations/AllOrganizationsShifts";
import AllOrganizationsPage from "../components/organizations/AllOrganizationsPage";
import { SingleOrganizationPage } from "../components/organizations/SingleOrganizationPage";
import DeveloperPortal from "../admin/DeveloperPortal";
import { HealthDashboard } from "../api/HealthDashboard";
import AdminDashboard from "../admin/components/developerComponents/AdminDashboard";
import AllEmployeesPage from "../components/employees/AllEmployeesPage";
import ProtectedRoute from "./ProtectedRoute";

export const adminRoutes = (
  <Route element={<ProtectedRoute roles={["developer"]} />}>
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="organizations" element={<AllOrganizationsPage />} />
      <Route path="organizations/:id" element={<SingleOrganizationPage />} />
      <Route path="shifts" element={<AllOrganizationsShifts />} />
      <Route path="developer" element={<DeveloperPortal />} />
      <Route path="apihealth" element={<HealthDashboard />} />
      <Route path="employees" element={<AllEmployeesPage />} />
      <Route path="org/all" element={<AllOrganizationsPage />} />
      <Route path="org/all/:id" element={<SingleOrganizationPage />} />
    </Route>
  </Route>
);
