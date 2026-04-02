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
//  DEPARTMENT MANAGER AUTH
// ═════════════════════════════════════════

// POST /api/auth/department-manager/login
export const loginTeamMember = async (data) => {
  console.log("authService.loginTeamMember - Sending request with:", { email: data.email });
  try {
    const response = await api.post("/auth/department-manager/login", data);
    console.log("authService.loginTeamMember - API Response received:", {
      status: response.status,
      hasToken: !!response.data.token,
      hasTeamMember: !!response.data.teamMember,
      teamMemberKeys: response.data.teamMember ? Object.keys(response.data.teamMember) : [],
      teamMemberRole: response.data.teamMember?.role,
      fullResponse: response.data,
    });
    return response;
  } catch (error) {
    console.error("authService.loginTeamMember - API Error:", {
      message: error.message,
      status: error.response?.status,
      errorData: error.response?.data,
    });
    throw error;
  }
};

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