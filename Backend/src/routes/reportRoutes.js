import express from "express"
const router = express.Router();

import {
  createReport,
  getMyReports,
  getReportsByPincode,
  getReportById,
  updateReportStatus,
  getAllReports,
  getReportStats,
} from "../controllers/reportController.js";

import  authMiddleware  from "../middleware/authMiddleware.js";
import  {roleMiddleware}  from "../middleware/roleMiddleware.js";
import {
  uploadSingle,
  handleUploadError,
  requireImage,
  logFileInfo,
} from "../middleware/uploadMiddleware.js";

// ── Normal User Routes ──────────────────────────────
// Create a new report (with image upload)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("user"),
  uploadSingle,
  handleUploadError,
  requireImage,
  logFileInfo,
  createReport
);

// Get logged-in user's own reports
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("user"),
  getMyReports
);

// ── Authority Routes ────────────────────────────────
// Get all reports filtered by authority's pincode
router.get(
  "/pincode",
  authMiddleware,
  roleMiddleware("authority"),
  getReportsByPincode
);

// Get Chart.js stats for authority dashboard
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("authority"),
  getReportStats
);

// Update a report's status (pending → resolved)
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("authority"),
  updateReportStatus
);

// ── Admin Routes ────────────────────────────────────
// Get all reports with optional filters
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllReports
);

// ── Shared Routes ───────────────────────────────────
// Get single report by ID (user sees own, authority sees pincode)
router.get(
  "/:id",
  authMiddleware,
  getReportById
);

export default router;