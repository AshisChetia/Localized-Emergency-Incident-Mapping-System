import express from "express"
const router = express.Router();

import {
  createReport,
  getMyReports,
  getCommunityReports,
  getReportsByPincode,
  getReportById,
  updateReportStatus,
  getAllReports,
  getReportStats,
  getTeamMemberAssignedReports,
  deleteReport,
  verifyReport,
  unverifyReport
} from "../controllers/reportController.js";

import  authMiddleware  from "../middleware/authMiddleware.js";
import  {roleMiddleware, multiRoleMiddleware}  from "../middleware/roleMiddleware.js";
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

router.get(
  "/community",
  authMiddleware,
  roleMiddleware("user"),
  getCommunityReports
);

// Delete a report
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("user"),
  deleteReport
);

router.post(
  "/:id/verify",
  authMiddleware,
  roleMiddleware("user"),
  verifyReport
);

router.delete(
  "/:id/verify",
  authMiddleware,
  roleMiddleware("user"),
  unverifyReport
);

// ── Authority Routes ────────────────────────────────
router.get(
  "/pincode/:pincode", 
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
  multiRoleMiddleware(["authority", "department_manager"]),
  updateReportStatus
);

// ── Admin Routes ────────────────────────────────────
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllReports
);

// ── Department Manager Routes ───────────────────────
router.get(
  "/department-manager/assigned",
  authMiddleware,
  roleMiddleware("department_manager"),
  getTeamMemberAssignedReports
);

router.patch(
  "/department-manager/:id/status",
  authMiddleware,
  roleMiddleware("department_manager"),
  updateReportStatus
);

// ── Shared Routes ───────────────────────────────────
router.get(
  "/:id",
  authMiddleware,
  getReportById
);

export default router;
