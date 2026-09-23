// src/routes/publicRoutes.jsx
import { Route, Outlet } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import PricingPage from "../components/PricingPage";
import Login from "../auth/login";
import Register from "../auth/register";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";

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
    <Route element={<PublicLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
  </>
);
