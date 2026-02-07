import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * High-level component to protect routes from unauthenticated users.
 * Optionally checks for allowed roles.
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role_name)) {
        // If user doesn't have the required role, redirect to dashboard or unauthorized page
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

/**
 * Granular component to show/hide UI elements based on roles.
 */
export const RoleGate = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user || !allowedRoles.includes(user.role_name)) {
        return null;
    }

    return <>{children}</>;
};
