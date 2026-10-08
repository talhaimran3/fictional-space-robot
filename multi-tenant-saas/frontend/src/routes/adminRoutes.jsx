import {Route} from "react-router-dom";
import AdminLayout from "../practice/AdminLayout";
import AdminDashboard from "../practice/AdminDashboard";
import Shifts from "../practice/Shifts";
import Timesheets from "../practice/TimesheetsLive";
import People from "../practice/People";
import Organizations from "../practice/Organizations";
export const adminRoutes=(
 <Route path="/admin" element={<AdminLayout/>}>
  <Route index element={<AdminDashboard/>}/>
  <Route path="shifts" element={<Shifts/>}/>
  <Route path="timesheets" element={<Timesheets/>}/>
  <Route path="people" element={<People/>}/>
  <Route path="organizations" element={<Organizations/>}/>
 </Route>
);