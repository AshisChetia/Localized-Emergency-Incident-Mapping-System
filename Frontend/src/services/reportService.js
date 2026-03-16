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