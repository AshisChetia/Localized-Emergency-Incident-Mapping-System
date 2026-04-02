// ─────────────────────────────────────────
// middleware/roleMiddleware.js
// Restricts route access based on user role
// Works AFTER authMiddleware has verified
// the JWT and attached req.user
// ─────────────────────────────────────────

// ═════════════════════════════════════════
//  SINGLE ROLE MIDDLEWARE
//  Usage: roleMiddleware("user")
//         roleMiddleware("authority")
//         roleMiddleware("admin")
// ═════════════════════════════════════════
const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      // ── Ensure authMiddleware ran first ──
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized. Please log in first.",
        });
      }

      const { role } = req.user;

      if (role !== requiredRole) {
        return res.status(403).json({
          message: `Access denied. This route is restricted to '${requiredRole}' accounts only.`,
        });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);
      return res.status(500).json({
        message: "Server error in role verification",
      });
    }
  };
};

// ═════════════════════════════════════════
//  MULTI ROLE MIDDLEWARE
//  Use when a route is accessible by
//  more than one role
//  Usage: multiRoleMiddleware(["user", "authority"])
//         multiRoleMiddleware(["authority", "admin"])
// ═════════════════════════════════════════
const multiRoleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // ── Ensure authMiddleware ran first ──
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized. Please log in first.",
        });
      }

      const { role } = req.user;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          message: `Access denied. This route is restricted to: ${allowedRoles.join(", ")} accounts only.`,
        });
      }

      next();
    } catch (error) {
      console.error("Multi Role Middleware Error:", error);
      return res.status(500).json({
        message: "Server error in role verification",
      });
    }
  };
};

// ═════════════════════════════════════════
//  PRE-BUILT ROLE GUARDS
//  Ready-to-use named middleware functions
//  for cleaner route files
// ═════════════════════════════════════════

// ── Only normal registered citizens ──
const isUser = roleMiddleware("user");

// ── Only approved local authorities ──
const isAuthority = roleMiddleware("authority");

// ── Only the super admin ──
const isAdmin = roleMiddleware("admin");

// ── Only department managers ──
const isDepartmentManager = roleMiddleware("department_manager");

// ── Authority or Admin (shared access) ──
const isAuthorityOrAdmin = multiRoleMiddleware(["authority", "admin"]);

// ── Authority or Department Manager (shared status update access) ──
const isAuthorityOrDeptManager = multiRoleMiddleware(["authority", "department_manager"]);

// ── Any authenticated user of any role ──
const isAnyRole = multiRoleMiddleware(["user", "authority", "admin", "department_manager"]);

export {
  roleMiddleware,
  multiRoleMiddleware,
  isUser,
  isAuthority,
  isAdmin,
  isDepartmentManager,
  isAuthorityOrAdmin,
  isAuthorityOrDeptManager,
  isAnyRole,
};