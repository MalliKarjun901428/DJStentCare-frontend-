import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDoctorsPage, AdminPatientsPage, AdminReportsPage, AdminNotificationsPage } from './pages/AdminPages';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard, PatientStentsPage, PatientAppointmentsPage, PatientNotificationsPage } from './pages/PatientPages';
import { EditProfile } from './pages/EditProfile';
import { ChangePassword } from './pages/ChangePassword';
import { About } from './pages/About';
import { 
  DoctorPatientsPage, 
  DoctorStentsPage, 
  DoctorAppointmentsPage, 
  DoctorNotificationsPage 
} from './pages/DoctorPages';
import { 
  PatientsPage, 
  StentsPage, 
  AppointmentsPage, 
  NotificationsPage, 
  ReportsPage, 
  SettingsPage 
} from './pages/CommonPages';
import './index.css';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={`/${user.role}`} />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRole="admin"><AdminDoctorsPage /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute allowedRole="admin"><AdminPatientsPage /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRole="admin"><AdminNotificationsPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><SettingsPage /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRole="doctor"><DoctorPatientsPage /></ProtectedRoute>} />
          <Route path="/doctor/stents" element={<ProtectedRoute allowedRole="doctor"><DoctorStentsPage /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><DoctorAppointmentsPage /></ProtectedRoute>} />
          <Route path="/doctor/notifications" element={<ProtectedRoute allowedRole="doctor"><DoctorNotificationsPage /></ProtectedRoute>} />
          <Route path="/doctor/settings" element={<ProtectedRoute allowedRole="doctor"><SettingsPage /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/stents" element={<ProtectedRoute allowedRole="patient"><PatientStentsPage /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute allowedRole="patient"><PatientAppointmentsPage /></ProtectedRoute>} />
          <Route path="/patient/notifications" element={<ProtectedRoute allowedRole="patient"><PatientNotificationsPage /></ProtectedRoute>} />
          <Route path="/patient/settings" element={<ProtectedRoute allowedRole="patient"><SettingsPage /></ProtectedRoute>} />

          {/* Profile & Common */}
          <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
