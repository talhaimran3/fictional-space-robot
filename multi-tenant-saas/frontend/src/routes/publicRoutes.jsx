// src/routes/publicRoutes.jsx
import { Route, Outlet } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import PricingPage from "../components/PricingPage";
import Login from "../auth/login";
import Register from "../auth/register";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";
import PlannrShifts from "../practice/PlannrShifts";
import PlannrPeoples from "../practice/PlannrPeople";
import PlannrDashboard from "../practice/PlannrDashboard";
import PlannrTimesheets from "../practice/Timesheets";
import AdminLayout from "../practice/AdminLayout";

export const PublicLayout = () => {
  return (
    <>
      <PublicNavbar />
      <Outlet /> <Footer />
    </>
  );
};
export const publicRoutes = (
  <>
    {/* Marketing only */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    {/* Plannr app shell — no PublicNavbar/Footer */}
    <Route element={<AdminLayout />}>
      <Route path="/dashboard" element={<PlannrDashboard />} />
      <Route path="/shifts" element={<PlannrShifts />} />
      <Route path="/people" element={<PlannrPeoples />} />
      <Route path="/timesheets" element={<PlannrTimesheets />} />
    </Route>
  </>
);
