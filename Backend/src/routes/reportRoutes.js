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
  deleteReport // Added
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

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("user"),
  getMyReports
);

// Delete a report
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("user"),
  deleteReport
);

// ── Authority Routes ────────────────────────────────
router.get(
  "/pincode",
  authMiddleware,
  roleMiddleware("authority"),
  getReportsByPincode
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("authority"),
  getReportStats
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("authority"),
  updateReportStatus
);

// ── Admin Routes ────────────────────────────────────
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllReports
);

// ── Shared Routes ───────────────────────────────────
router.get(
  "/:id",
  authMiddleware,
  getReportById
);

export default router;