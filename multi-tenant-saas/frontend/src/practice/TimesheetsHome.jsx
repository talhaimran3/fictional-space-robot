import React from "react";
import { useAuth } from "../context/authContext";
import PlannrTimesheets from "./Timesheets";
import MyTimesheets from "./MyTimesheets";

export default function TimesheetsHome() {
  const { user } = useAuth();
  return user?.role === "staff" ? <MyTimesheets /> : <PlannrTimesheets />;
}
