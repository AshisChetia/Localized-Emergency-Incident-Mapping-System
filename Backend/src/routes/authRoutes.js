import express from "express";
const router = express.Router();

import {
  registerUser,
  loginUser,
  registerAuthority,
  loginAuthority,
  loginAdmin,
  getMe,
} from "../controllers/authController.js";

import  authMiddleware  from "../middleware/authMiddleware.js";

// Normal User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Authority Routes
router.post("/authority/register", registerAuthority);
router.post("/authority/login", loginAuthority);

// Admin Route
router.post("/admin/login", loginAdmin);

// Shared Profile Route (all roles)
router.get("/me", authMiddleware, getMe);

export default router;