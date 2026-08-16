import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A] text-neutral-500">
        <div className="animate-pulse text-sm font-bold">Verifying authentication…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={requireAdmin ? '/admin/login' : '/login'}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return children;
};

export default ProtectedRoute;
