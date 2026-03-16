// ─────────────────────────────────────────
// routes/adminRoutes.js
// All routes exclusive to the Super Admin.
// Every route here is protected by:
// 1. authMiddleware → valid JWT required
// 2. isAdmin        → role must be "admin"
// The Super Admin has global read access
// and manages authority registrations.
// ─────────────────────────────────────────

import express from "express";
import authMiddleware  from "../middleware/authMiddleware.js";
import { isAdmin }        from "../middleware/roleMiddleware.js";

// ── Controller Imports ──────────────────
import {
  getAdminDashboard,
  getPendingRequests,
  approveAuthority,
  rejectAuthority,
  getAllAuthorities,
  getPincodeCoverage,
  getAllUsers,
  getPlatformStats,
} from "../controllers/adminController.js";

import {
  getAllReports,
} from "../controllers/reportController.js";

const router = express.Router();

// ═════════════════════════════════════════
//  ADMIN DASHBOARD ROUTE
// ═════════════════════════════════════════

// ── GET /api/admin/dashboard ─────────────
// Returns the full high-level overview:
// total users, total approved authorities,
// pending requests count, total reports,
// pending vs resolved report summary.
// Single endpoint to load entire dashboard.
router.get(
  "/dashboard",
  authMiddleware,
  isAdmin,
  getAdminDashboard
);

// ═════════════════════════════════════════
//  PLATFORM STATS ROUTE
// ═════════════════════════════════════════

// ── GET /api/admin/stats ─────────────────
// Returns platform-wide aggregated stats:
// user count, authority counts (approved
// + pending), report counts (total,
// pending, resolved). Used for stat cards
// at top of admin dashboard.
router.get(
  "/stats",
  authMiddleware,
  isAdmin,
  getPlatformStats
);

// ═════════════════════════════════════════
//  AUTHORITY MANAGEMENT ROUTES
// ═════════════════════════════════════════

// ── GET /api/admin/authorities ───────────
// Returns all approved authority accounts
// across the entire platform with their
// pincode and department info.
// Used for the authorities table in admin
// dashboard.
router.get(
  "/authorities",
  authMiddleware,
  isAdmin,
  getAllAuthorities
);

// ── GET /api/admin/authorities/pending ───
// Returns all authority registration
// requests that are still waiting for
// Super Admin approval (is_approved=false)
// Newest requests appear first.
router.get(
  "/authorities/pending",
  authMiddleware,
  isAdmin,
  getPendingRequests
);

// ── PATCH /api/admin/authorities/:id/approve
// Super Admin approves an authority
// registration request. Sets is_approved
// to true so the authority can now login.
router.patch(
  "/authorities/:id/approve",
  authMiddleware,
  isAdmin,
  approveAuthority
);

// ── DELETE /api/admin/authorities/:id/reject
// Super Admin permanently rejects and
// removes an authority registration
// request from the system.
router.delete(
  "/authorities/:id/reject",
  authMiddleware,
  isAdmin,
  rejectAuthority
);

// ═════════════════════════════════════════
//  PINCODE COVERAGE ROUTES
// ═════════════════════════════════════════

// ── GET /api/admin/coverage ──────────────
// Returns a breakdown of how many approved
// authorities exist per pincode zone along
// with their names. Shows admin which zones
// are covered and which are not.
router.get(
  "/coverage",
  authMiddleware,
  isAdmin,
  getPincodeCoverage
);

// ═════════════════════════════════════════
//  USER MANAGEMENT ROUTES
// ═════════════════════════════════════════

// ── GET /api/admin/users ─────────────────
// Returns all registered citizen user
// accounts for Super Admin oversight.
// Passwords are never returned in response.
router.get(
  "/users",
  authMiddleware,
  isAdmin,
  getAllUsers
);

// ═════════════════════════════════════════
//  REPORT OVERSIGHT ROUTES
// ═════════════════════════════════════════

// ── GET /api/admin/reports ───────────────
// Returns all reports across the entire
// platform. Supports optional query params:
// ?status=pending   → filter by status
// ?pincode=400001   → filter by pincode
// Both filters can be combined together.
router.get(
  "/reports",
  authMiddleware,
  isAdmin,
  getAllReports
);

export default router;