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
    
    // Get the reports table schema
    console.log("\n=== REPORTS TABLE SCHEMA ===\n");
    const [schemaRows] = await pool.query(
      "SHOW CREATE TABLE reports"
    );
    console.log("CREATE TABLE Statement:");
    console.log(schemaRows[0]['Create Table']);
    
    // Get column information
    console.log("\n=== COLUMN DETAILS ===\n");
    const [columnInfo] = await pool.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reports'
       ORDER BY ORDINAL_POSITION`,
      [process.env.DB_NAME]
    );
    
    console.table(columnInfo);
    
    process.exit(0);

  } catch (err) {
    console.error("❌ Error retrieving schema:", err);
    process.exit(1);
  }
})();
