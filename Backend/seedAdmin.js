import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    // 1. Clear out the old, broken data so we start fresh
    await pool.query("DELETE FROM admins");
    console.log("🧹 Cleared old admin records...");

    // 2. Grab the variables and heavily TRIM them of invisible characters!
    const email = (process.env.ADMIN_EMAIL || "").trim();
    const password = (process.env.ADMIN_PASSWORD || "").trim();

    if (!email || !password) {
      console.error("❌ ERROR: Email or Password is empty in .env file.");
      process.exit(1);
    }

    // 3. Hash the clean, trimmed password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 4. Insert into the database
    await pool.query(
      "INSERT INTO admins (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    console.log(`✅ Admin seeded successfully!`);
    console.log(`📧 Clean Email: "${email}"`);
    console.log(`🔑 Clean Password: "${password}"`);
    process.exit(0);

  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    process.exit(1);
  }
})();