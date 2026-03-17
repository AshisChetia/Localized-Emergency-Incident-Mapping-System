// ─────────────────────────────────────────
// models/Admin.js
// Handles all database operations for the
// Super Admin account. Admin is seeded
// manually via seedAdmin.js and has no
// public registration route.
// ─────────────────────────────────────────

import db from "../config/db.js";

const Admin = {

  // ═══════════════════════════════════════
  //  FIND ADMIN BY EMAIL
  //  Used during Super Admin login
  // ═══════════════════════════════════════
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT * FROM admins WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  FIND ADMIN BY ID
  //  Used in authMiddleware token verify
  // ═══════════════════════════════════════
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT
          id,
          email,
          created_at
       FROM admins
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  GET PLATFORM OVERVIEW STATS
  //  One single query that returns all
  //  high level numbers for admin panel:
  //  total users, authorities, reports
  // ═══════════════════════════════════════
  getPlatformStats: async () => {
    const [[userStats], [authorityStats], [reportStats]] = await Promise.all([
      // Total registered users
      db.query(
        `SELECT COUNT(*) AS total_users FROM users`
      ),
      // Approved and pending authority counts
      db.query(
        `SELECT
            SUM(CASE WHEN is_approved = true  THEN 1 ELSE 0 END) AS approved_authorities,
            SUM(CASE WHEN is_approved = false THEN 1 ELSE 0 END) AS pending_authorities,
            COUNT(*) AS total_authorities
         FROM authorities`
      ),
      // Platform-wide report breakdown
      db.query(
        `SELECT
            COUNT(*) AS total_reports,
            SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending_reports,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_reports
         FROM reports`
      ),
    ]);

    return {
      users:       userStats[0],
      authorities: authorityStats[0],
      reports:     reportStats[0],
    };
  },

  // ═══════════════════════════════════════
  //  UPDATE ADMIN PASSWORD
  //  For admin password change if needed
  // ═══════════════════════════════════════
  updatePassword: async (id, hashedPassword) => {
    const [result] = await db.query(
      `UPDATE admins
       SET password = ?
       WHERE id = ?`,
      [hashedPassword, id]
    );
    return result;
  },
};

export default Admin;