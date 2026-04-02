import express from "express";
const router = express.Router();

import {
  registerUser,
  loginUser,
  registerAuthority,
  loginAuthority,
  loginTeamMember,
  loginAdmin,
  getMe,
  getDepartmentsByPincode,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

// Normal User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Authority Routes
router.post("/authority/register", registerAuthority);
router.post("/authority/login", loginAuthority);

// Team Member (Department Manager) Routes
router.post("/department-manager/login", loginTeamMember);

// Admin Route
router.post("/admin/login", loginAdmin);

// Shared Profile Route (all roles)
router.get("/me", authMiddleware, getMe);

// Public Department Lookup
router.get("/departments/:pincode", getDepartmentsByPincode);

export default router;