// ─────────────────────────────────────────
// services/reportService.js
// All API calls related to reports
// ─────────────────────────────────────────

import api from "./api";

// POST /api/reports  (multipart/form-data)
export const createReport = (formData) =>
  api.post("/reports", formData);

// GET /api/reports/my  → citizen's own reports
export const getMyReports = () =>
  api.get("/reports/my");

// GET /api/reports/community -> citizen pincode feed
export const getCommunityReports = () =>
  api.get("/reports/community");

// GET /api/reports/pincode/:pincode  → authority
export const getReportsByPincode = (pincode) =>
  api.get(`/reports/pincode/${pincode}`);

// GET /api/reports/:id  → single report detail
export const getReportById = (id) =>
  api.get(`/reports/${id}`);

// PATCH /api/reports/:id/status
export const updateReportStatus = (id, status) =>
  api.patch(`/reports/${id}/status`, { status });

// GET /api/reports/stats  → monthly chart data
export const getReportStats = () =>
  api.get("/reports/stats");

// DELETE /api/reports/:id → Delete report
export const deleteReport = (id) =>
  api.delete(`/reports/${id}`);

// POST /api/reports/:id/verify
export const verifyReport = (id) =>
  api.post(`/reports/${id}/verify`);

// DELETE /api/reports/:id/verify
export const unverifyReport = (id) =>
  api.delete(`/reports/${id}/verify`);

// GET /api/reports/department-manager/assigned → team member's assigned reports
export const getAssignedReports = () =>
  api.get("/reports/department-manager/assigned");

// PATCH /api/reports/department-manager/:id/status → team member updates report status
export const updateReportStatusAsDeptManager = (id, status) =>
  api.patch(`/reports/department-manager/${id}/status`, { status });
