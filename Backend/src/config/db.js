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
    connection.release();
  } catch (error) {
    console.error('❌ TiDB Connection Failed:', error.message);
  }
};

export default pool;