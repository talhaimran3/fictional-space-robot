// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/authContext";
import { publicRoutes } from "./routes/publicRoutes";
import { adminRoutes } from "./routes/adminRoutes";



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Public navbar only on public pages – 
            you can later move this inside a PublicLayout if you want */}

        <Routes>
          {/* Public routes */}
          {publicRoutes}

          {/* Admin / authenticated routes */}
          {adminRoutes}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}