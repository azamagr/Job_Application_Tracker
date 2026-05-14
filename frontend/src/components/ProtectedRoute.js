import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * - If not logged in → redirect to /login
 * - If logged in but wrong role → redirect to their correct home
 * - allowedRole: 'user' | 'admin' | undefined (any authenticated user)
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  // Still checking auth (token validation in progress)
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (allowedRole && user.role !== allowedRole) {
    const correctHome = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={correctHome} replace />;
  }

  return children;
};

export default ProtectedRoute;