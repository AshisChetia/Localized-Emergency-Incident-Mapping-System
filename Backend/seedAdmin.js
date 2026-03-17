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
    
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      "INSERT INTO admins (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );
    console.log(`Admin seeded successfully!\nEmail: ${email}\nPassword: ${password}`);
    process.exit(0);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
        console.log("Admin already exists. Email: admin@system.local, Password: adminpassword");
        process.exit(0);
    }
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
})();
