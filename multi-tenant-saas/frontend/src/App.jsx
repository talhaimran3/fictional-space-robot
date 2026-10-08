import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { publicRoutes } from "./routes/publicRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { organizationRoutes } from "./routes/organizationRoutes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {publicRoutes}
          {organizationRoutes}
          {adminRoutes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
