import React from "react";
import { useAuth } from "../context/authContext";
import PlannrDashboard from "./PlannrDashboard";
import StaffSchedule from "./StaffSchedule";

export default function WorkspaceHome() {
  const { user } = useAuth();
  return user?.role === "staff" ? <StaffSchedule /> : <PlannrDashboard />;
}
