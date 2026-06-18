import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000, // TiDB Serverless uses port 4000
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ── TIDB CLOUD CONNECTION FIXES ──
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // ── TIDB SECURE SSL FIX ──
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ TiDB Database Connected Successfully');

    // ── AUTO-MIGRATION: Ensure is_read column exists ──
    try {
      await connection.query('ALTER TABLE report_messages ADD COLUMN is_read TINYINT(1) DEFAULT 0');
      console.log('📦 Migration: added is_read column to report_messages table');
    } catch (migErr) {
      // Silence duplicate column errors (1060 or ER_DUP_FIELDNAME)
      const isDuplicate = migErr.errno === 1060 || migErr.code === 'ER_DUP_FIELDNAME' || migErr.message.includes('Duplicate column');
      if (!isDuplicate) {
        console.warn('⚠️ Migration warning:', migErr.message);
      }
    }
    connection.release();
  } catch (error) {
    console.error('❌ TiDB Connection Failed:', error.message);
  }
};

export default pool;
