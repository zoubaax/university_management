import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * High-level component to protect routes from unauthenticated users.
 * Checks for allowed allowedPermissions or allowedRoles.
 */
export const ProtectedRoute = ({ children, allowedRoles = [], allowedPermissions = [] }) => {
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

    // Determine access based on role OR permission
    let hasAccess = false;

    if (user?.role_name === 'SUPER_ADMIN') {
        hasAccess = true; // SUPER_ADMIN always has access
    } else {
        if (allowedPermissions.length > 0) {
            // Check if user has AT LEAST ONE of the required permissions
            const userPermissions = user?.permissions || [];
            hasAccess = allowedPermissions.some(p => userPermissions.includes(p));

            // Fallback for legacy hardcoded roles if permissions aren't set up yet
            if (!hasAccess && allowedRoles.length > 0) {
                const legacyRoles = ['STUDENT', 'PROFESSOR', 'CLUB_PRESIDENT'];
                if (legacyRoles.includes(user?.role_name)) {
                    hasAccess = allowedRoles.includes(user?.role_name);
                }
            }
        } else if (allowedRoles.length > 0) {
            hasAccess = allowedRoles.includes(user?.role_name);
        } else {
            // No restrictions specified (like Dashboard or Profile)
            hasAccess = true;
        }
    }

    if (!hasAccess) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

/**
 * Granular component to show/hide UI elements based on roles or permissions.
 */
export const RoleGate = ({ children, allowedRoles = [], allowedPermissions = [] }) => {
    const { user } = useAuth();

    if (!user) return null;

    if (user.role_name === 'SUPER_ADMIN') return <>{children}</>;

    let hasAccess = false;

    if (allowedPermissions.length > 0) {
        const userPermissions = user.permissions || [];
        hasAccess = allowedPermissions.some(p => userPermissions.includes(p));
        if (!hasAccess && allowedRoles.length > 0) {
            const legacyRoles = ['STUDENT', 'PROFESSOR', 'CLUB_PRESIDENT'];
            if (legacyRoles.includes(user.role_name)) {
                hasAccess = allowedRoles.includes(user.role_name);
            }
        }
    } else if (allowedRoles.length > 0) {
        hasAccess = allowedRoles.includes(user.role_name);
    } else {
        hasAccess = true;
    }

    if (!hasAccess) return null;

    return <>{children}</>;
};
