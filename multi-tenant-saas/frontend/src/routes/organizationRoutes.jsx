import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import OrganizationLayout from "../practice/OrganizationLayout";
import PlannrDashboard from "../practice/PlannrDashboard";
import PlannrShifts from "../practice/PlannrShifts";
import PlannrPeoples from "../practice/PlannrPeople";
import PlannrTimesheets from "../practice/Timesheets";

export const organizationRoutes = (
  <Route element={<ProtectedRoute roles={["admin", "manager", "staff"]} />}>
    <Route path="/org/:organizationId" element={<OrganizationLayout />}>
      <Route index element={<PlannrDashboard />} />
      <Route path="dashboard" element={<PlannrDashboard />} />
      <Route path="shifts" element={<PlannrShifts />} />
      <Route path="people" element={<PlannrPeoples />} />
      <Route path="timesheets" element={<PlannrTimesheets />} />
    </Route>
  </Route>
);
