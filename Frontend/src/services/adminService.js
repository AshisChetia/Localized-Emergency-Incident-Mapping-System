// ─────────────────────────────────────────
// services/adminService.js
// ─────────────────────────────────────────

import api from "./api";

export const getAdminStats = () =>
  api.get("/admin/stats");

export const getPendingAuthorities = () =>
  api.get("/admin/authorities/pending");

// FIXED: Now perfectly aligns with the backend route
export const getActiveAuthorities = () =>
  api.get("/admin/authorities/active");

export const approveAuthority = (id) =>
  api.patch(`/admin/authorities/${id}/approve`);

export const rejectAuthority = (id) =>
  api.delete(`/admin/authorities/${id}/reject`); // FIXED: Changed to delete to match route

export const getAuthorityDetails = (id) => 
  api.get(`/admin/authorities/${id}/details`);