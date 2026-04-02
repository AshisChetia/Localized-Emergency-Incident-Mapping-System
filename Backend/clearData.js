// ─────────────────────────────────────────
// clearData.js
// Clear all test data from database
// Run: node clearData.js
// ─────────────────────────────────────────

import dotenv from "dotenv";
import pool from "./src/config/db.js";

dotenv.config();

const clearAllData = async () => {
  console.log("\n🗑️  Starting data clearing process...\n");

  try {
    const connection = await pool.getConnection();

    // Disable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    console.log("✓ Disabled foreign key checks\n");

    // List of tables to clear (in order of dependencies)
    const tables = [
      "team_members",
      "report_verifications",
      "reports",
      "admins",
      "authorities",
      "users",
    ];

    // Clear each table
    for (const table of tables) {
      try {
        const [result] = await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`✓ Cleared '${table}' table - ${result.affectedRows} rows deleted`);
      } catch (error) {
        console.log(`⚠ Skipped '${table}' - Table might not exist or already empty`);
      }
    }

    // Re-enable foreign key checks
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("\n✓ Re-enabled foreign key checks");

    // Verify all tables are empty
    console.log("\n📊 Verification of empty tables:\n");
    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${rows[0].count} rows`);
      } catch (error) {
        console.log(`  ${table}: Could not verify`);
      }
    }

    connection.release();

    console.log("\n✅ Database cleared successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error clearing database:", error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the script
clearAllData();
