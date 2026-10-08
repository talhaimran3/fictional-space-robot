import {Route,Navigate} from "react-router-dom";
import AdminLayout from "../practice/AdminLayout";
import AdminDashboard from "../practice/AdminDashboard";
import Shifts from "../practice/Shifts";
import Timesheets from "../practice/TimesheetsLive";
import People from "../practice/People";
import Organizations from "../practice/Organizations";
import {useAuth} from "../context/authContext";
function AdminGuard(){const{isAuthenticated,loading}=useAuth();if(loading)return null;if(!isAuthenticated)return <Navigate to="/login" replace/>;return <AdminLayout/>;}
export const adminRoutes=(
 <Route path="/admin" element={<AdminGuard/>}>
  <Route index element={<AdminDashboard/>}/>
  <Route path="shifts" element={<Shifts/>}/>
  <Route path="timesheets" element={<Timesheets/>}/>
  <Route path="people" element={<People/>}/>
  <Route path="organizations" element={<Organizations/>}/>
 </Route>
);