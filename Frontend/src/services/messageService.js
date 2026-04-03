// ─────────────────────────────────────────
// services/messageService.js
// API calls related to messaging and complaints
// ─────────────────────────────────────────

import api from "./api";

// GET /api/messages/:reportId
export const getMessagesByReportId = (reportId) =>
  api.get(`/messages/${reportId}`);

// POST /api/messages/:reportId
export const sendMessage = (reportId, messageData) =>
  api.post(`/messages/${reportId}`, messageData);
