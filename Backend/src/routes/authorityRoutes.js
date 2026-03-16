// ─────────────────────────────────────────
// routes/authorityRoutes.js
// All routes exclusive to approved local
// authority and municipality accounts.
// Every route here is protected by:
// 1. authMiddleware  → valid JWT required
// 2. isAuthority     → role must be "authority"
// ─────────────────────────────────────────

import express from "express";
import authMiddleware  from "../middleware/authMiddleware.js";
import { isAuthority }   from "../middleware/roleMiddleware.js";

// ── Controller Imports ──────────────────
// We handle authority-specific logic in
// authorityController.js which we will
// build next. Report-related logic stays
// in reportController.js as already built.
import {
  getAuthorityDashboard,
  getAuthorityProfile,
} from "../controllers/authorityController.js";

import {
  getReportsByPincode,
  updateReportStatus,
  getReportStats,
  getReportById,
} from "../controllers/reportController.js";

const router = express.Router();

// ═════════════════════════════════════════
//  AUTHORITY PROFILE ROUTES
// ═════════════════════════════════════════

// ── GET /api/authority/profile ──────────
// Returns the logged-in authority's own
// profile details (name, email, pincode,
// department) fetched live from DB
router.get(
  "/profile",
  authMiddleware,
  isAuthority,
  getAuthorityProfile
);

// ═════════════════════════════════════════
//  AUTHORITY DASHBOARD ROUTES
// ═════════════════════════════════════════

// ── GET /api/authority/dashboard ────────
// Returns combined dashboard data:
// overall stats + monthly chart data +
// recent reports for authority's pincode
router.get(
  "/dashboard",
  authMiddleware,
  isAuthority,
  getAuthorityDashboard
);

// ═════════════════════════════════════════
//  REPORT MANAGEMENT ROUTES
//  (Authority can only manage reports
//   within their own pincode zone)
// ═════════════════════════════════════════

// ── GET /api/authority/reports ──────────
// Returns all reports filtered by the
// authority's pincode from JWT payload.
// Pending reports appear first then
// resolved sorted by newest created.
router.get(
  "/reports",
  authMiddleware,
  isAuthority,
  getReportsByPincode
);

// ── GET /api/authority/reports/stats ────
// Returns overall + monthly breakdown
// data for Chart.js graphs on the
// authority dashboard page
router.get(
  "/reports/stats",
  authMiddleware,
  isAuthority,
  getReportStats
);

// ── GET /api/authority/reports/:id ──────
// Returns full detail of a single report.
// Authority can only view reports that
// belong to their pincode jurisdiction.
// Access control is enforced inside
// getReportById controller.
router.get(
  "/reports/:id",
  authMiddleware,
  isAuthority,
  getReportById
);

// ── PATCH /api/authority/reports/:id/status
// Updates report status from pending to
// resolved or resolved back to pending.
// Authority can only update reports in
// their pincode. Enforced in controller.
router.patch(
  "/reports/:id/status",
  authMiddleware,
  isAuthority,
  updateReportStatus
);

export default router;