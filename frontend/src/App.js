import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';

// User pages
import Dashboard        from './pages/user/Dashboard';
import ApplicationsPage from './pages/user/ApplicationsPage';
import BrowseJobsPage   from './pages/user/BrowseJobsPage';
import DocumentsPage    from './pages/user/DocumentsPage';
import RemindersPage    from './pages/user/RemindersPage';
import ProfilePage      from './pages/user/ProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminJobsPage  from './pages/admin/AdminJobsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

const PAGE_TITLES = {
  '/dashboard':       'Dashboard',
  '/applications':    'My Applications',
  '/jobs':            'Browse Jobs',
  '/documents':       'Documents',
  '/reminders':       'Reminders & Notifications',
  '/profile':         'My Profile',
  '/admin/dashboard': 'System Reports',
  '/admin/jobs':      'Manage Job Postings',
  '/admin/users':     'Manage Users',
};

const AppShell = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <Topbar pageTitles={PAGE_TITLES} />
      <div className="page-content">{children}</div>
    </div>
  </div>
);

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
};

const App = () => (
  <BrowserRouter>
    <Routes>

      {/* Public */}
      <Route path="/"                         element={<LandingPage />} />
      <Route path="/login"                    element={<LoginPage />} />
      <Route path="/register"                 element={<RegisterPage />} />
      <Route path="/forgot-password"          element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token"    element={<ResetPasswordPage />} />
      <Route path="/home"                     element={<HomeRedirect />} />

      {/* User */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRole="user"><AppShell><Dashboard /></AppShell></ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute allowedRole="user"><AppShell><ApplicationsPage /></AppShell></ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute allowedRole="user"><AppShell><BrowseJobsPage /></AppShell></ProtectedRoute>
      } />
      <Route path="/documents" element={
        <ProtectedRoute allowedRole="user"><AppShell><DocumentsPage /></AppShell></ProtectedRoute>
      } />
      <Route path="/reminders" element={
        <ProtectedRoute allowedRole="user"><AppShell><RemindersPage /></AppShell></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRole="user"><AppShell><ProfilePage /></AppShell></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin"><AppShell><AdminDashboard /></AppShell></ProtectedRoute>
      } />
      <Route path="/admin/jobs" element={
        <ProtectedRoute allowedRole="admin"><AppShell><AdminJobsPage /></AppShell></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRole="admin"><AppShell><AdminUsersPage /></AppShell></ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  </BrowserRouter>
);

export default App;