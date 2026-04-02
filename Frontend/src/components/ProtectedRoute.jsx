// ─────────────────────────────────────────
// components/ProtectedRoute.jsx
// Guards routes based on:
// 1. Authentication → must be logged in
// 2. Role           → must match allowed role
//
// Usage in App.jsx:
// <ProtectedRoute allowedRole="user">
//   <UserDashboard />
// </ProtectedRoute>
//
// <ProtectedRoute allowedRole="authority">
//   <AuthorityDashboard />
// </ProtectedRoute>
//
// <ProtectedRoute allowedRole="admin">
//   <AdminDashboard />
// </ProtectedRoute>
// ─────────────────────────────────────────

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

// ── Role → redirect path map ────────────
// If user is logged in but hits a route
// that belongs to a different role,
// redirect them to their own dashboard
const roleDashboardPath = {
  user:                 "/user/dashboard",
  authority:            "/authority/dashboard",
  department_manager:   "/department-manager/dashboard",
  admin:                "/admin/dashboard",
};

// ── Role → login path map ───────────────
// If user is NOT logged in, send them to
// the correct login page for that route
const roleLoginPath = {
  user:                 "/login",
  authority:            "/authority/login",
  department_manager:   "/department-manager/login",
  admin:                "/admin/login",
};

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log(`ProtectedRoute check for ${allowedRole}:`, {
    loading,
    userExists: !!user,
    userRole: user?.role,
    userNeedsLogin: !user,
    wrongRole: user && user.role !== allowedRole,
  });

  // ── Still checking auth state ───────────
  // Show fullscreen loader while AuthContext
  // is verifying the token on app start
  if (loading) {
    return <Loader variant="fullscreen" text="Verifying session..." />;
  }

  // ── Not logged in at all ────────────────
  // Redirect to the correct login page
  // based on which route they tried to access.
  // Save the attempted path so we can
  // redirect back after login if needed.
  if (!user) {
    const loginPath = roleLoginPath[allowedRole] || "/login";
    console.log(`Redirecting to login: ${loginPath}`);
    return (
      <Navigate
        to={loginPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ── Logged in but wrong role ────────────
  // Example: authority tries to access
  // /user/dashboard → redirect to
  // /authority/dashboard
  if (user.role !== allowedRole) {
    const correctDashboard = roleDashboardPath[user.role] || "/";
    console.log(`Role mismatch: user is ${user.role}, route requires ${allowedRole}. Redirecting to ${correctDashboard}`);
    return <Navigate to={correctDashboard} replace />;
  }

  // ── Authorized → render the page ───────
  console.log(`ProtectedRoute authorized for ${allowedRole}`);
  return children;
};

export default ProtectedRoute;