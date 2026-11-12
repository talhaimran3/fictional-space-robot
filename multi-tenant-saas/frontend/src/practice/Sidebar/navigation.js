import {
  Building2,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  UserRound,
  Users,
} from "lucide-react";

export const MANAGEMENT_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin2" },
  { label: "Shifts", icon: CalendarDays, path: "/admin2/shifts" },
  { label: "Timesheets", icon: Clock3, path: "/admin2/timesheets" },
  { label: "People", icon: Users, path: "/admin2/people" },
  { label: "Organizations", icon: Building2, path: "/admin2/organizations" },
  { label: "My Profile", icon: UserRound, path: "/admin2/profile" },
];

export const STAFF_ITEMS = [
  { label: "My Schedule", icon: CalendarDays, path: "/admin2" },
  { label: "My Timesheets", icon: Clock3, path: "/admin2/timesheets" },
  { label: "My Profile", icon: UserRound, path: "/admin2/profile" },
];
