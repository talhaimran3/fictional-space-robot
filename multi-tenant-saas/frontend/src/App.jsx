// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { publicRoutes } from "./routes/publicRoutes";
import { adminRoutes } from "./routes/adminRoutes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {publicRoutes}
          {adminRoutes}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
