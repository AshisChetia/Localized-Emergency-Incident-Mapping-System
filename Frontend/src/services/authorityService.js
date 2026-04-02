// ─────────────────────────────────────────
// services/authorityService.js
// Authority-specific API calls
// ─────────────────────────────────────────

import api from "./api";

// ═════════════════════════════════════════
//  AUTHORITY PROFILE
// ═════════════════════════════════════════

const getAuthorityProfile = () =>
  api.get("/authority/profile");

const getAuthorityDashboard = () =>
  api.get("/authority/dashboard");

// ═════════════════════════════════════════
//  TEAM MEMBER MANAGEMENT
// ═════════════════════════════════════════

// Create a new department manager
const createTeamMember = (data) =>
  api.post("/authority/team-members", data);

// Get all team members under this authority
const getTeamMembers = () =>
  api.get("/authority/team-members");

// Update a team member
const updateTeamMember = (memberId, data) =>
  api.put(`/authority/team-members/${memberId}`, data);

// Deactivate/remove a team member
const removeTeamMember = (memberId) =>
  api.delete(`/authority/team-members/${memberId}`);

// ═════════════════════════════════════════
//  EXPORT OBJECT
// ═════════════════════════════════════════

export const authorityService = {
  getAuthorityProfile,
  getAuthorityDashboard,
  createTeamMember,
  getTeamMembers,
  updateTeamMember,
  removeTeamMember,
};
