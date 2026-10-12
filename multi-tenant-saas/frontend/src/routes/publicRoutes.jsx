// src/routes/publicRoutes.jsx
import { Route, Outlet } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import PricingPage from "../components/PricingPage";
import FeaturesPage from "../components/FeaturesPage";
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
      <Outlet />
      <Footer />
    </>
  );
};

export const publicRoutes = (
  <>
    {/* Marketing + auth */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>

    {/* Plannr practice app shell — no PublicNavbar/Footer */}
    <Route element={<AdminLayout />}>
      <Route path="admin2" element={<PlannrDashboard />} />
      <Route path="admin2/shifts" element={<PlannrShifts />} />
      <Route path="admin2/people" element={<PlannrPeoples />} />
      <Route path="admin2/timesheets" element={<PlannrTimesheets />} />
    </Route>
  </>
);
