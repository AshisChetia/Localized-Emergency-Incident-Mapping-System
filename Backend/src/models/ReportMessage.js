import db from "../config/db.js";

const ReportMessage = {
  // Add a new message
  create: async ({ reportId, senderType, senderId, message }) => {
    const [result] = await db.query(
      `INSERT INTO report_messages (report_id, sender_type, sender_id, message)
       VALUES (?, ?, ?, ?)`,
      [reportId, senderType, senderId, message]
    );
    return result;
  },

  // Get all messages for a specific report
  // Joins users and authorities to get sender info
  findByReportId: async (reportId) => {
    const [rows] = await db.query(
      `SELECT
          m.id,
          m.report_id,
          m.sender_type,
          m.sender_id,
          m.message,
          m.created_at,
          u.name AS user_name,
          a.name AS authority_name
       FROM report_messages m
       LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id
       LEFT JOIN authorities a ON m.sender_type = 'authority' AND m.sender_id = a.id
       WHERE m.report_id = ?
       ORDER BY m.created_at ASC`,
      [reportId]
    );
    
    // Format rows to have a consistent 'sender_name'
    return rows.map(row => {
      const formatted = { ...row };
      if (formatted.sender_type === 'user') {
        formatted.sender_name = formatted.user_name || "Citizen";
      } else {
        formatted.sender_name = formatted.authority_name ? `Authority ${formatted.authority_name}` : "Authority";
      }
      delete formatted.user_name;
      delete formatted.authority_name;
      return formatted;
    });
  }
};

export default ReportMessage;
