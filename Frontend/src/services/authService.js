// ─────────────────────────────────────────
// services/authService.js
// All API calls related to authentication
// for all 3 roles: user, authority, admin
// ─────────────────────────────────────────

import api from "./api";

// ═════════════════════════════════════════
//  USER AUTH
// ═════════════════════════════════════════

// POST /api/auth/register
export const registerUser = (data) =>
  api.post("/auth/register", data);

// POST /api/auth/login
export const loginUser = (data) =>
  api.post("/auth/login", data);

// ═════════════════════════════════════════
//  AUTHORITY AUTH
// ═════════════════════════════════════════

// POST /api/auth/authority/register
export const registerAuthority = (data) =>
  api.post("/auth/authority/register", data);

// POST /api/auth/authority/login
export const loginAuthority = (data) =>
  api.post("/auth/authority/login", data);

// ═════════════════════════════════════════
//  ADMIN AUTH
// ═════════════════════════════════════════

// POST /api/auth/admin/login
export const loginAdmin = (data) =>
  api.post("/auth/admin/login", data);

// ═════════════════════════════════════════
//  SHARED → GET CURRENT USER
//  Called by AuthContext verifyToken
//  on every app start to restore session
//  Token is auto-attached by api.js
//  interceptor from localStorage
// ═════════════════════════════════════════

// GET /api/auth/me
export const getMe = () =>
  api.get("/auth/me");

// ═════════════════════════════════════════
//  PUBLIC → GET DEPARTMENTS BY PINCODE
// ═════════════════════════════════════════

// GET /api/auth/departments/:pincode
export const getDepartmentsByPincode = (pincode) =>
  api.get(`/auth/departments/${pincode}`);