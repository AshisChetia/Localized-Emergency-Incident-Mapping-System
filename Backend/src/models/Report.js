// ─────────────────────────────────────────
// models/Report.js
// Handles all database operations for
// incident reports submitted by citizens
// ─────────────────────────────────────────

import db from "../config/db.js";

const Report = {

  // ═══════════════════════════════════════
  //  CREATE REPORT
  //  Called after image is uploaded to
  //  Cloudinary and pincode is geocoded
  // ═══════════════════════════════════════
  create: async ({
    userId,
    description,
    imageUrl,
    latitude,
    longitude,
    pincode,
  }) => {
    const [result] = await db.query(
      `INSERT INTO reports
        (user_id, description, image_url, latitude, longitude, pincode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, description, imageUrl, latitude, longitude, pincode, "pending"]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  FIND REPORT BY ID
  //  Joins with users table to include
  //  reporter name and email
  // ═══════════════════════════════════════
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT
          r.id,
          r.user_id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  FIND ALL REPORTS BY USER ID
  //  Returns citizen's own report history
  //  ordered by newest first
  // ═══════════════════════════════════════
  findByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT
          id,
          description,
          image_url,
          latitude,
          longitude,
          pincode,
          status,
          created_at
       FROM reports
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  FIND ALL REPORTS BY PINCODE
  //  Used by authority dashboard
  //  Pending reports appear first then
  //  resolved sorted by newest
  // ═══════════════════════════════════════
  findByPincode: async (pincode) => {
    const [rows] = await db.query(
      `SELECT
          r.id,
          r.user_id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.pincode = ?
       ORDER BY
          CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
          r.created_at DESC`,
      [pincode]
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  FIND ALL REPORTS (ADMIN)
  //  Supports optional status and pincode
  //  filters for Super Admin overview
  // ═══════════════════════════════════════
  findAll: async ({ status = null, pincode = null } = {}) => {
    let query = `
      SELECT
          r.id,
          r.user_id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += " AND r.status = ?";
      params.push(status);
    }

    if (pincode) {
      query += " AND r.pincode = ?";
      params.push(pincode);
    }

    query += " ORDER BY r.created_at DESC";

    const [rows] = await db.query(query, params);
    return rows;
  },

  // ═══════════════════════════════════════
  //  UPDATE REPORT STATUS
  //  Authority marks pending → resolved
  //  or resolved → pending
  // ═══════════════════════════════════════
  updateStatus: async (id, status) => {
    const [result] = await db.query(
      `UPDATE reports 
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  GET OVERALL STATS BY PINCODE
  //  Returns total, pending, resolved
  //  counts for authority dashboard
  // ═══════════════════════════════════════
  getStatsByPincode: async (pincode) => {
    const [rows] = await db.query(
      `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports
       WHERE pincode = ?`,
      [pincode]
    );
    return rows[0];
  },

  // ═══════════════════════════════════════
  //  GET MONTHLY STATS BY PINCODE
  //  Returns last 6 months breakdown
  //  Used for Chart.js graphs in
  //  authority dashboard
  // ═══════════════════════════════════════
  getMonthlyStatsByPincode: async (pincode) => {
    const [rows] = await db.query(
      `SELECT
          DATE_FORMAT(created_at, '%b %Y') AS month,
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports
       WHERE pincode = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY MIN(created_at) ASC`,
      [pincode]
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  GET GLOBAL STATS (ADMIN)
  //  Total platform-wide report summary
  // ═══════════════════════════════════════
  getGlobalStats: async () => {
    const [rows] = await db.query(
      `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports`
    );
    return rows[0];
  },

  // ═══════════════════════════════════════
  //  GET STATS GROUPED BY PINCODE (ADMIN)
  //  Shows admin how many reports exist
  //  per pincode across entire platform
  // ═══════════════════════════════════════
  getStatsByAllPincodes: async () => {
    const [rows] = await db.query(
      `SELECT
          pincode,
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports
       GROUP BY pincode
       ORDER BY total DESC`
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  COUNT REPORTS BY USER
  //  Quick count for user profile stats
  // ═══════════════════════════════════════
  countByUserId: async (userId) => {
    const [rows] = await db.query(
      `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports
       WHERE user_id = ?`,
      [userId]
    );
    return rows[0];
  },

// ═══════════════════════════════════════
  //  DELETE REPORT
  //  Allows citizens to delete their own
  //  reports from the dashboard
  // ═══════════════════════════════════════
  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM reports WHERE id = ?`,
      [id]
    );
    return result;
  },
};

export default Report;