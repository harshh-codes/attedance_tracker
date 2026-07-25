import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// Auth & Admin Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import PendingRegistrations from './pages/admin/PendingRegistrations';
import AdminProfile from './pages/admin/AdminProfile';
import AdminAttendanceLog from './pages/admin/AdminAttendanceLog';
import AdminReports from './pages/admin/AdminReports';
import OfficeSettings from './pages/admin/OfficeSettings';
import CompanySettings from './pages/admin/CompanySettings';
import AuditLogs from './pages/admin/AuditLogs';
import SecurityDashboard from './pages/admin/SecurityDashboard';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeAttendanceHistory from './pages/employee/EmployeeAttendanceHistory';

// Error Pages
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/errors/NotFound';
import ServerError from './pages/errors/ServerError';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Executive Dashboard">
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/pending-registrations"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Pending Registrations">
                  <PendingRegistrations />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Employee Directory">
                  <EmployeeManagement />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Company Attendance Log">
                  <AdminAttendanceLog />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Reports & Analytics">
                  <AdminReports />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/security"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Security Command Center">
                  <SecurityDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/office-settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Office Settings">
                  <OfficeSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/company-settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="Company Settings">
                  <CompanySettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="System Audit Directory">
                  <AuditLogs />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout pageTitle="My Profile">
                  <AdminProfile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeLayout pageTitle="Employee Portal">
                  <EmployeeDashboard />
                </EmployeeLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeLayout pageTitle="My Profile">
                  <EmployeeProfile />
                </EmployeeLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/attendance"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeLayout pageTitle="My Attendance Log">
                  <EmployeeAttendanceHistory />
                </EmployeeLayout>
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="/404" element={<NotFound />} />

          {/* Root & Catch-all Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
