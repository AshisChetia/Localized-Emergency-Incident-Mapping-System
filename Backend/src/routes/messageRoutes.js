import express from "express";
import { getMessagesByReportId, sendMessage } from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Require authentication for messages
router.use(authMiddleware);

// Get messages for a report
router.get("/:reportId", getMessagesByReportId);

// Send a new message regarding a report
router.post("/:reportId", sendMessage);

export default router;
