import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { isUser } from "../middleware/roleMiddleware.js";
import { updateProfile, updatePassword } from "../controllers/userController.js";

const router = express.Router();

// Both routes require the user to be logged in and have the 'user' role
router.patch("/profile", authMiddleware, isUser, updateProfile);
router.patch("/password", authMiddleware, isUser, updatePassword);

export default router;
