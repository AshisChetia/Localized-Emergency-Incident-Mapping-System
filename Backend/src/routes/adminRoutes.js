// ─────────────────────────────────────────
// routes/adminRoutes.js
// ─────────────────────────────────────────

import express from "express";
import authMiddleware  from "../middleware/authMiddleware.js";
import { isAdmin }        from "../middleware/roleMiddleware.js";

import {
  getAdminDashboard,
  getPendingRequests,
  approveAuthority,
  rejectAuthority,
  getAllAuthorities,
  getPincodeCoverage,
  getAllUsers,
  getPlatformStats,
  getAuthorityDetails,
} from "../controllers/adminController.js";

import { getAllReports } from "../controllers/reportController.js";

const router = express.Router();

// ── Dashboard Overview ──
router.get("/dashboard", authMiddleware, isAdmin, getAdminDashboard);
router.get("/stats", authMiddleware, isAdmin, getPlatformStats);

// ── Authority Management ──
// FIXED: Changed from "/authorities" to "/authorities/active" to match frontend
router.get("/authorities/active", authMiddleware, isAdmin, getAllAuthorities);
router.get("/authorities/pending", authMiddleware, isAdmin, getPendingRequests);
router.get("/authorities/:id/details", authMiddleware, isAdmin, getAuthorityDetails);

router.patch("/authorities/:id/approve", authMiddleware, isAdmin, approveAuthority);
router.delete("/authorities/:id/reject", authMiddleware, isAdmin, rejectAuthority);

// ── Coverage & Users ──
router.get("/coverage", authMiddleware, isAdmin, getPincodeCoverage);
router.get("/users", authMiddleware, isAdmin, getAllUsers);

// ── Reports Oversight ──
router.get("/reports", authMiddleware, isAdmin, getAllReports);

export default router;