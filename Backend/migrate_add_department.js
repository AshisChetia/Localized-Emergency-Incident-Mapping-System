import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 4000,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });
    
    console.log("Adding department column to reports table...");
    await pool.query("ALTER TABLE reports ADD COLUMN department VARCHAR(100) NULL AFTER pincode");
    console.log("✅ Successfully added department column!");
    
    process.exit(0);

  } catch (err) {
    // Ignore error if column already exists
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log("✅ Department column already exists. Nothing to do.");
      process.exit(0);
    }
    console.error("❌ Error migrating database:", err);
    process.exit(1);
  }
})();
