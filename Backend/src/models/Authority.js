// ─────────────────────────────────────────
// models/Authority.js
// Handles all database operations for
// local authority and municipality accounts
// ─────────────────────────────────────────

import db from "../config/db.js";

const Authority = {

  // ═══════════════════════════════════════
  //  CREATE AUTHORITY REQUEST
  //  Submitted with is_approved = false
  //  Super Admin must approve before login
  // ═══════════════════════════════════════
  create: async ({ name, email, password, pincode, department }) => {
    const [result] = await db.query(
      `INSERT INTO authorities
        (name, email, password, pincode, department, is_approved)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password, pincode, department, false]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  FIND AUTHORITY BY EMAIL
  //  Used during login and duplicate check
  // ═══════════════════════════════════════
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT * FROM authorities WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  FIND AUTHORITY BY ID
  //  Used in authMiddleware token verify
  // ═══════════════════════════════════════
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT
          id,
          name,
          email,
          pincode,
          department,
          is_approved,
          created_at
       FROM authorities
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  FIND ALL APPROVED AUTHORITIES
  //  Used in Super Admin dashboard to
  //  show all active authority accounts
  // ═══════════════════════════════════════
  findAllApproved: async () => {
    const [rows] = await db.query(
      `SELECT
          id,
          name,
          email,
          pincode,
          department,
          created_at
       FROM authorities
       WHERE is_approved = true
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  FIND ALL PENDING REQUESTS
  //  Used in Super Admin dashboard to
  //  show requests waiting for approval
  // ═══════════════════════════════════════
  findAllPending: async () => {
    const [rows] = await db.query(
      `SELECT
          id,
          name,
          email,
          pincode,
          department,
          created_at
       FROM authorities
       WHERE is_approved = false
       ORDER BY created_at ASC`
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  FIND ALL (APPROVED + PENDING)
  //  Full list for admin oversight
  // ═══════════════════════════════════════
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT
          id,
          name,
          email,
          pincode,
          department,
          is_approved,
          created_at
       FROM authorities
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  APPROVE AUTHORITY
  //  Super Admin sets is_approved = true
  // ═══════════════════════════════════════
  approveById: async (id) => {
    const [result] = await db.query(
      `UPDATE authorities
       SET is_approved = true
       WHERE id = ?`,
      [id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  REJECT / DELETE AUTHORITY REQUEST
  //  Super Admin removes the request
  //  permanently from the system
  // ═══════════════════════════════════════
  deleteById: async (id) => {
    const [result] = await db.query(
      `DELETE FROM authorities WHERE id = ?`,
      [id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  CHECK IF EMAIL EXISTS
  //  Lightweight duplicate email check
  // ═══════════════════════════════════════
  emailExists: async (email) => {
    const [rows] = await db.query(
      `SELECT id FROM authorities WHERE email = ?`,
      [email]
    );
    return rows.length > 0;
  },

  // ═══════════════════════════════════════
  //  COUNT ALL APPROVED AUTHORITIES
  //  Used in Super Admin dashboard stats
  // ═══════════════════════════════════════
  countApproved: async () => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM authorities
       WHERE is_approved = true`
    );
    return rows[0].total;
  },

  // ═══════════════════════════════════════
  //  COUNT ALL PENDING REQUESTS
  //  Used in Super Admin dashboard stats
  // ═══════════════════════════════════════
  countPending: async () => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM authorities
       WHERE is_approved = false`
    );
    return rows[0].total;
  },

  // ═══════════════════════════════════════
  //  GET COVERAGE BY PINCODE
  //  Shows admin how many approved
  //  authorities exist per pincode zone
  // ═══════════════════════════════════════
  getCoverageByPincode: async () => {
    const [rows] = await db.query(
      `SELECT
          pincode,
          COUNT(*) AS authority_count,
          GROUP_CONCAT(name SEPARATOR ', ') AS authority_names
       FROM authorities
       WHERE is_approved = true
       GROUP BY pincode
       ORDER BY authority_count DESC`
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  FIND AUTHORITIES BY PINCODE
  //  Returns all approved authorities
  //  for a specific pincode zone
  // ═══════════════════════════════════════
  findByPincode: async (pincode) => {
    const [rows] = await db.query(
      `SELECT
          id,
          name,
          email,
          department,
          created_at
       FROM authorities
       WHERE pincode = ?
         AND is_approved = true`,
      [pincode]
    );
    return rows;
  },
};

export default Authority;