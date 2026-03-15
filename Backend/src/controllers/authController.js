import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import db from "../config/db.js"

// ─────────────────────────────────────────
// HELPER: Generate JWT Token
// ─────────────────────────────────────────
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "72d" });
};

// ═════════════════════════════════════════
//  NORMAL USER AUTH
// ═════════════════════════════════════════

// ── Register User ──────────────────────────
export const registerUser = async (req, res) => {
  const { name, email, password, pincode, number } = req.body;

  try {
    // Check all fields
    if (!name || !email || !password || !pincode || !number) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    try {
      console.log("Attempting SQL Insert...");
      const [result] = await db.query(
        "INSERT INTO users (name, email, password, pincode, number) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, pincode, number]
      );
      
      // Generate token
      const token = generateToken(result.insertId, "user"); 
      
      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: result.insertId,
          name,
          email,
          pincode,
          role: "user",
        },
      });
    } catch (dbError) {
      console.error("EXACT SQL ERROR:", dbError);
      return res.status(500).json({ message: "Database Error", error: dbError.message });
    }


  } catch (error) {
    console.error("Register User Error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// ── Login User ──────────────────────────────
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user.id, "user");

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        pincode: user.pincode,
        role: "user",
      },
    });
  } catch (error) {
    console.error("Login User Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ═════════════════════════════════════════
//  AUTHORITY AUTH
// ═════════════════════════════════════════

// ── Register Authority (Request Only) ──────
export const registerAuthority = async (req, res) => {
  const { name, email, password, pincode, department } = req.body;

  try {
    if (!name || !email || !password || !pincode || !department) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists in authorities table
    const [existingAuthority] = await db.query(
      "SELECT id FROM authorities WHERE email = ?",
      [email]
    );

    if (existingAuthority.length > 0) {
      return res.status(409).json({
        message: "An authority with this email already exists or has a pending request",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert authority with is_approved = false (pending)
    await db.query(
      "INSERT INTO authorities (name, email, password, pincode, department, is_approved) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, pincode, department, false]
    );

    return res.status(201).json({
      message:
        "Registration request submitted successfully. Please wait for Super Admin approval before logging in.",
    });
  } catch (error) {
    console.error("Register Authority Error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// ── Login Authority ─────────────────────────
export const loginAuthority = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find authority
    const [authorities] = await db.promise().query(
      "SELECT * FROM authorities WHERE email = ?",
      [email]
    );

    if (authorities.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const authority = authorities[0];

    // Check if approved by Super Admin
    if (!authority.is_approved) {
      return res.status(403).json({
        message:
          "Your account is pending Super Admin approval. Please check back later.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, authority.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(authority.id, "authority");

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: authority.id,
        name: authority.name,
        email: authority.email,
        pincode: authority.pincode,
        department: authority.department,
        role: "authority",
      },
    });
  } catch (error) {
    console.error("Login Authority Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ═════════════════════════════════════════
//  SUPER ADMIN AUTH
// ═════════════════════════════════════════

// ── Login Admin ─────────────────────────────
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find admin
    const [admins] = await db.promise().query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const admin = admins[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(admin.id, "admin");

    return res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Login Admin Error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ── Get Current Logged-In User Profile ──────
// Works for all three roles based on JWT token
export const getMe = async (req, res) => {
  const { id, role } = req.user;

  try {
    let query = "";
    let tableName = "";

    if (role === "user") {
      tableName = "users";
      query = "SELECT id, name, email, pincode FROM users WHERE id = ?";
    } else if (role === "authority") {
      tableName = "authorities";
      query =
        "SELECT id, name, email, pincode, department FROM authorities WHERE id = ?";
    } else if (role === "admin") {
      tableName = "admins";
      query = "SELECT id, email FROM admins WHERE id = ?";
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    const [rows] = await db.promise().query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: { ...rows[0], role },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
};

