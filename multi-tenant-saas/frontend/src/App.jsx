import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Marketing Pages
import LandingPage from "./components/LandingPage";
import PricingPage from "./components/PricingPage";
import PublicNavbar from "./components/PublicNavbar";
import Login from "./auth/login";
import Register from "./auth/register";
import { AuthProvider } from "../context/authContext";
import { AllOrganizationsShifts } from "./components/organizations/AllOrganizationsShifts";
import AllOrganizationsPage from "./components/organizations/AllOrganizationsPage";
import { SingleOrganizationPage } from "./components/organizations/singleOrganizationPage";
import { AddShiftForm } from "./components/shifts/AddShiftForm";
import { EditShiftForm } from "./components/shifts/EditShiftForm";
import DeveloperPortal from "./admin/DeveloperPortal";
import { HealthDashboard } from "../api/HealthDashboard";

// // Authenticated Application Portals
// import DeveloperAdminPortal from './components/DeveloperAdminPortal';
// import OwnerPortal from './components/OwnerPortal';
// import ManagerPortal from './components/ManagerPortal';
// import ModernRosterView from './components/ModernRosterView';
// import EmployeePortal from './components/EmployeePortal';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PublicNavbar />
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<LandingPage />} />
                    <Route path="/admin/apihealth" element={<HealthDashboard />} />

          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
                    <Route path="/developer" element={<DeveloperPortal />} />

          <Route path="/admin" element={<AllOrganizationsShifts />} />
          <Route path="/org/all" element={<AllOrganizationsPage />} />
          <Route path="/org/all/:id" element={<SingleOrganizationPage />} />
          <Route
            path="/singletenant/:id/add-shift"
            element={<AddShiftForm />}
          />
          <Route
            path="/singletenant/:id/edit-shift/:shiftId"
            element={<EditShiftForm />}
          />
          {/* Internal Application Portals
        <Route path="/admin" element={<DeveloperAdminPortal />} />
        <Route path="/owner" element={<OwnerPortal />} />
        <Route path="/manager" element={<ManagerPortal />} />
        <Route path="/roster" element={<ModernRosterView />} />
        <Route path="/employee" element={<EmployeePortal />} /> */}

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
