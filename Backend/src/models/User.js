// ─────────────────────────────────────────
// models/User.js
// Handles all database operations for the
// normal citizen users of the platform
// ─────────────────────────────────────────

import db from "../config/db.js";

const User = {

  // ═══════════════════════════════════════
  //  CREATE USER
  //  Called during registration
  // ═══════════════════════════════════════
  create: async ({ name, email, password, pincode }) => {
    const [result] = await db.query(
      `INSERT INTO users 
        (name, email, password, pincode) 
       VALUES (?, ?, ?, ?)`,
      [name, email, password, pincode]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  FIND USER BY EMAIL
  //  Used during login and duplicate check
  // ═══════════════════════════════════════
  findByEmail: async (email) => {
    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  FIND USER BY ID
  //  Used in authMiddleware and getMe
  // ═══════════════════════════════════════
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT 
          id,
          name,
          email,
          pincode,
          created_at
       FROM users 
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // ═══════════════════════════════════════
  //  GET ALL USERS
  //  Used by Super Admin for oversight
  // ═══════════════════════════════════════
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT 
          id,
          name,
          email,
          pincode,
          created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // ═══════════════════════════════════════
  //  UPDATE USER PROFILE
  //  Allows user to update name or pincode
  // ═══════════════════════════════════════
  updateById: async (id, { name, pincode }) => {
    const [result] = await db.query(
      `UPDATE users 
       SET name = ?, pincode = ?
       WHERE id = ?`,
      [name, pincode, id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  UPDATE PASSWORD
  //  Stores new hashed password
  // ═══════════════════════════════════════
  updatePassword: async (id, hashedPassword) => {
    const [result] = await db.query(
      `UPDATE users 
       SET password = ?
       WHERE id = ?`,
      [hashedPassword, id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  DELETE USER
  //  Cascades to delete their reports too
  //  (based on FK constraint in SQL)
  // ═══════════════════════════════════════
  deleteById: async (id) => {
    const [result] = await db.query(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );
    return result;
  },

  // ═══════════════════════════════════════
  //  COUNT TOTAL USERS
  //  Used in Super Admin dashboard stats
  // ═══════════════════════════════════════
  countAll: async () => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM users`
    );
    return rows[0].total;
  },

  // ═══════════════════════════════════════
  //  CHECK IF EMAIL EXISTS
  //  Lightweight check without fetching
  //  full user object
  // ═══════════════════════════════════════
  emailExists: async (email) => {
    const [rows] = await db.query(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );
    return rows.length > 0;
  },
};

export default User;