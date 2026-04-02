// ─────────────────────────────────────────
// models/TeamMember.js
// Handles database operations for team members
// (Sub-department managers assigned by chief)
// ─────────────────────────────────────────

import db from "../config/db.js";

const TeamMember = {

  // ═══════════════════════════════════════
  //  CREATE TEAM MEMBER
  //  Chief creates an account for manager
  // ═══════════════════════════════════════
  create: async ({ authority_id, name, email, password, sub_department }) => {
    const [result] = await db.query(
      `INSERT INTO team_members
        (authority_id, name, email, password, sub_department, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [authority_id, name, email, password, sub_department, 'department_manager', true]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  FIND BY EMAIL
  //  Used for login
  // ═══════════════════════════════════════
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT * FROM team_members WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  FIND BY ID
  //  Used in auth middleware token verify
  // ═══════════════════════════════════════
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT
          id,
          authority_id,
          name,
          email,
          sub_department,
          role,
          is_active,
          created_at
       FROM team_members
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  CHECK IF EMAIL EXISTS
  // ═══════════════════════════════════════
  emailExists: async (email) => {
    const [rows] = await db.query(
      `SELECT id FROM team_members WHERE email = ?`,
      [email]
    );
    return rows.length > 0;
  },

  // ═══════════════════════════════════════
  //  FIND ALL TEAM MEMBERS BY AUTHORITY
  //  Returns all managers under a chief
  // ═══════════════════════════════════════
  findByAuthority: async (authority_id) => {
    const [rows] = await db.query(
      `SELECT
          id,
          name,
          email,
          sub_department,
          is_active,
          created_at
       FROM team_members
       WHERE authority_id = ? AND is_active = true
       ORDER BY created_at DESC`,
      [authority_id]
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  FIND BY AUTHORITY + SUB-DEPARTMENT
  //  Get specific manager for a department
  // ═══════════════════════════════════════
  findByAuthorityAndDepartment: async (authority_id, sub_department) => {
    const [rows] = await db.query(
      `SELECT
          id,
          name,
          email,
          sub_department,
          is_active
       FROM team_members
       WHERE authority_id = ? AND sub_department = ? AND is_active = true`,
      [authority_id, sub_department]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  UPDATE TEAM MEMBER
  //  Chief can update manager details
  // ═══════════════════════════════════════
  update: async (id, { name, email, sub_department }) => {
    const [result] = await db.query(
      `UPDATE team_members
       SET name = ?, email = ?, sub_department = ?
       WHERE id = ?`,
      [name, email, sub_department, id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  DEACTIVATE TEAM MEMBER
  //  Chief removes manager (soft delete)
  // ═══════════════════════════════════════
  deactivate: async (id) => {
    const [result] = await db.query(
      `UPDATE team_members
       SET is_active = false
       WHERE id = ?`,
      [id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  DELETE TEAM MEMBER
  //  Permanent deletion
  // ═══════════════════════════════════════
  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM team_members WHERE id = ?`,
      [id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  COUNT BY AUTHORITY
  //  How many managers does this chief have
  // ═══════════════════════════════════════
  countByAuthority: async (authority_id) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM team_members
       WHERE authority_id = ? AND is_active = true`,
      [authority_id]
    );
    return rows[0].total;
  },
};

export default TeamMember;
