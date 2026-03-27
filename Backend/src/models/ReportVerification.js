import db from "../config/db.js";

const ReportVerification = {
  verify: async (reportId, userId) => {
    const [result] = await db.query(
      `INSERT INTO report_verifications (report_id, user_id)
       VALUES (?, ?)`,
      [reportId, userId]
    );

    return result;
  },

  remove: async (reportId, userId) => {
    const [result] = await db.query(
      `DELETE FROM report_verifications
       WHERE report_id = ? AND user_id = ?`,
      [reportId, userId]
    );

    return result;
  },

  hasVerified: async (reportId, userId) => {
    const [rows] = await db.query(
      `SELECT id
       FROM report_verifications
       WHERE report_id = ? AND user_id = ?
       LIMIT 1`,
      [reportId, userId]
    );

    return rows.length > 0;
  },

  countByReportId: async (reportId) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM report_verifications
       WHERE report_id = ?`,
      [reportId]
    );

    return rows[0]?.total || 0;
  },
};

export default ReportVerification;
