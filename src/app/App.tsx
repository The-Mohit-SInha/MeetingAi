import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from "./components/DashboardLayout";
import { Overview } from "./components/Overview";
import { Meetings } from "./components/Meetings";
import { MeetingDetail } from "./components/MeetingDetail";
import { ActionItems } from "./components/ActionItems";
import { Calendar } from "./components/Calendar";
import { Analytics } from "./components/Analytics";
import { Participants } from "./components/Participants";
import { Profile } from "./components/Profile";
import { Notifications } from "./components/Notifications";
import { Settings } from "./components/Settings";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DiagnosticPage } from "./components/DiagnosticPage";
import { Admin } from "./components/Admin";

export default function App() {
  useEffect(() => {
    // Suppress Recharts duplicate key warnings (known Recharts internal issue)
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Encountered two children with the same key')
      ) {
        return; // Suppress this specific warning
      }
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="meetings" element={<Meetings />} />
              <Route path="meetings/:id" element={<MeetingDetail />} />
              <Route path="actions" element={<ActionItems />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="participants" element={<Participants />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}