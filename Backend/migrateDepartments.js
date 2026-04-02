// ─────────────────────────────────────────
// Database Migration: Update Authorities Table
// Purpose: Replace single 'department' column with
// 'major_department' and 'sub_department' for hierarchical structure
// ─────────────────────────────────────────

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

    console.log("🔄 Starting database migration...\n");

    // Step 1: Check if old 'department' column exists
    const [columns] = await pool.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'authorities' AND COLUMN_NAME = 'department'"
    );

    if (columns.length === 0) {
      console.log("✅ Migration already completed - 'department' column does not exist.");
      process.exit(0);
    }

    console.log("⚠️  Found old 'department' column - proceeding with migration...\n");

    // Step 2: Create new columns
    console.log("1️⃣  Adding new columns (major_department, sub_department)...");
    try {
      await pool.query(
        `ALTER TABLE authorities 
         ADD COLUMN major_department VARCHAR(100) NULL,
         ADD COLUMN sub_department VARCHAR(100) NULL`
      );
      console.log("   ✓ New columns added\n");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log("   ⚠️  Columns already exist, skipping...\n");
      } else {
        throw err;
      }
    }

    // Step 3: Migrate existing data (if any)
    console.log("2️⃣  Migrating existing department values...");
    const [existingData] = await pool.query(
      "SELECT DISTINCT department FROM authorities WHERE department IS NOT NULL AND department != ''"
    );

    if (existingData.length > 0) {
      console.log(`   Found ${existingData.length} unique departments to migrate:`);
      
      for (const row of existingData) {
        const oldDept = row.department;
        // Map old departments to new structure
        let majorDept = "unknown";
        let subDept = "unknown";

        if (oldDept.includes("Water")) {
          majorDept = "municipal_services";
          subDept = "water_supply";
        } else if (oldDept.includes("Sanitation") || oldDept.includes("Waste")) {
          majorDept = "municipal_services";
          subDept = "sanitation";
        } else if (oldDept.includes("Street") || oldDept.includes("Maintenance")) {
          majorDept = "municipal_services";
          subDept = "street_maintenance";
        } else if (oldDept.includes("Parks") || oldDept.includes("Gardens")) {
          majorDept = "municipal_services";
          subDept = "parks_gardens";
        } else if (oldDept.includes("Road") || oldDept.includes("Public Works")) {
          majorDept = "public_works";
          subDept = "roads";
        } else if (oldDept.includes("Bridge")) {
          majorDept = "public_works";
          subDept = "bridges";
        } else if (oldDept.includes("Drainage")) {
          majorDept = "public_works";
          subDept = "drainage";
        } else if (oldDept.includes("Building")) {
          majorDept = "public_works";
          subDept = "public_buildings";
        } else if (oldDept.includes("Electricity")) {
          majorDept = "utilities";
          subDept = "electricity";
        } else if (oldDept.includes("Sewage") || oldDept.includes("Gas")) {
          majorDept = "utilities";
          subDept = "water_sewage";
        }

        console.log(`   - "${oldDept}" → ${majorDept} > ${subDept}`);

        await pool.query(
          "UPDATE authorities SET major_department = ?, sub_department = ? WHERE department = ?",
          [majorDept, subDept, oldDept]
        );
      }
      console.log("   ✓ Data migration completed\n");
    } else {
      console.log("   ℹ️  No existing data to migrate\n");
    }

    // Step 4: Drop old department column (OPTIONAL - comment out to keep backup)
    // console.log("3️⃣  Dropping old 'department' column (backup)...");
    // await pool.query("ALTER TABLE authorities DROP COLUMN department");
    // console.log("   ✓ Old column removed\n");

    console.log("✅ Database migration completed successfully!\n");
    console.log("📝 Note: The old 'department' column still exists as a backup.");
    console.log("   To remove it later, run: ALTER TABLE authorities DROP COLUMN department;\n");

    process.exit(0);

  } catch (err) {
    console.error("❌ Migration Error:", err.message);
    process.exit(1);
  }
})();
