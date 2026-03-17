// ─────────────────────────────────────────
// services/adminService.js
// API calls for Super Admin operations
// ─────────────────────────────────────────

import api from "./api";

// GET /api/admin/stats
export const getAdminStats = () =>
  api.get("/admin/stats");

// GET /api/admin/authorities/pending
export const getPendingAuthorities = () =>
  api.get("/admin/authorities/pending");

// GET /api/admin/authorities/active
export const getActiveAuthorities = () =>
  api.get("/admin/authorities/active");

// PATCH /api/admin/authorities/:id/approve
export const approveAuthority = (id) =>
  api.patch(`/admin/authorities/${id}/approve`);

// PATCH /api/admin/authorities/:id/reject
export const rejectAuthority = (id) =>
  api.patch(`/admin/authorities/${id}/reject`);