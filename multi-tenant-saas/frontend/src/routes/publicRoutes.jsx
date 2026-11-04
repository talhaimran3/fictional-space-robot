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
import WorkspaceHome from "../practice/WorkspaceHome";
import TimesheetsHome from "../practice/TimesheetsHome";
import PlannrOrganization from "../practice/PlannrOrganization";
import MyProfile from "../practice/MyProfile";
import AdminLayout from "../practice/AdminLayout";

export const PublicLayout = () => <><PublicNavbar/><Outlet/><Footer/></>;

export const publicRoutes = (
  <>
    <Route element={<PublicLayout/>}>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/pricing" element={<PricingPage/>}/>
      <Route path="/features" element={<FeaturesPage/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
    </Route>
    <Route element={<AdminLayout/>}>
      <Route path="admin2" element={<WorkspaceHome/>}/>
      <Route path="admin2/dashboard" element={<WorkspaceHome/>}/>
      <Route path="admin2/shifts" element={<PlannrShifts/>}/>
      <Route path="admin2/people" element={<PlannrPeoples/>}/>
      <Route path="admin2/timesheets" element={<TimesheetsHome/>}/>
      <Route path="admin2/profile" element={<MyProfile/>}/>
      <Route path="admin2/organizations" element={<PlannrOrganization/>}/>
    </Route>
  </>
);
