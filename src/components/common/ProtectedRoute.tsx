import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Safeguard: Check storage in case context state is hydrating
  const effectiveUser = user || authService.getCurrentUser();
  const isEffectivelyAuthenticated = isAuthenticated || !!effectiveUser;

  if (!isEffectivelyAuthenticated || !effectiveUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(effectiveUser.role)) {
    // Only redirect if user is attempting unauthorized access to a different portal
    // If user is navigating their own portal subroutes, NEVER kick them back to dashboard
    if (!location.pathname.startsWith(`/${effectiveUser.role}/`)) {
      return <Navigate to={`/${effectiveUser.role}/dashboard`} replace />;
    }
  }

  return <Outlet />;
};
