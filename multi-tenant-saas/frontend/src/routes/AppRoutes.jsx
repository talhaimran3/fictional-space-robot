// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AllOrganizationsShifts } from "../components/organizations/AllOrganizationsShifts";
import { AddOrganization } from "../components/organizations/addOrganization";
import { SingleOrganizationPage } from "../components/organizations/singleOrganizationPage";
import { AddShiftForm } from "../components/shifts/AddShiftForm";
import { EditShiftForm } from "../components/shifts/EditShiftForm";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      {/* <Route path="/" element={<AllOrganizationsShifts />} /> */}
      <Route path="/add-tenant" element={<AddOrganization />} />
      <Route path="/singletenant/:id" element={<SingleOrganizationPage />} />
      <Route path="/singletenant/:id/add-shift" element={<AddShiftForm />} />
      <Route
        path="/singletenant/:id/edit-shift/:shiftId"
        element={<EditShiftForm />}
      />

      {/* <Route path="/login" element={<LoginPage />} /> */}
      {/* <Route path="/register" element={<RegisterTenantPage />} /> */}

      {/* 1. Developer / System Admin Portal */}
      {/* <Route element={<ProtectedRoute allowedRoles={["platform_admin"]} />}>
        <Route path="/admin/dashboard" element={<DeveloperDashboard />} />
        <Route path="/admin/tenants" element={<TenantManager />} />
      </Route> */}

      {/* 2. Tenant Owner Portal */}
      {/* <Route element={<ProtectedRoute allowedRoles={["owner"]} />}>
        <Route path="/owner/billing" element={<OwnerBilling />} />
        <Route path="/owner/locations" element={<LocationManager />} />
      </Route> */}

      {/* 3. Manager Portal (Owner + Manager Access) */}
      {/* <Route element={<ProtectedRoute allowedRoles={["owner", "manager"]} />}>
        <Route path="/manager/schedule" element={<RotaBuilder />} />
        <Route path="/manager/requests" element={<ShiftRequestsManager />} />
        <Route path="/manager/timesheets" element={<TimesheetApproval />} />
      </Route> */}

      {/* 4. Employee Portal (Accessible by All Internal Roles) */}
      {/* <Route
        element={
          <ProtectedRoute allowedRoles={["owner", "manager", "employee"]} />
        }
      >
        <Route path="/app/my-shifts" element={<EmployeeSchedule />} />
        <Route path="/app/open-shifts" element={<OpenShiftsBoard />} />
        <Route path="/app/requests" element={<EmployeeSwapRequests />} />
      </Route> */}

      {/* Fallback */}
      {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>
  );
}
