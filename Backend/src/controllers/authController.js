import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ── Import Models instead of DB ──
import User from "../models/User.js";
import Authority from "../models/Authority.js";
import Admin from "../models/Admin.js";

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
  const { name, email, password, pincode } = req.body;

  try {
    if (!name || !email || !password || !pincode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists using Model
    const userExists = await User.emailExists(email);
    if (userExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user using Model
    const result = await User.create({
      name,
      email,
      password: hashedPassword,
      pincode,
    });

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
  } catch (error) {
    console.error("Register User Error:", error);
    return res.status(500).json({ message: "Server error during registration", errorDetails: error.message });
  }
};

// ── Login User ──────────────────────────────
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user using Model
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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

    // Check if email already exists using Model
    const authorityExists = await Authority.emailExists(email);
    if (authorityExists) {
      return res.status(409).json({
        message: "An authority with this email already exists or has a pending request",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert authority using Model
    await Authority.create({
      name,
      email,
      password: hashedPassword,
      pincode,
      department,
    });

    return res.status(201).json({
      message: "Registration request submitted successfully. Please wait for Super Admin approval before logging in.",
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

    // Find authority using Model
    const authority = await Authority.findByEmail(email);

    if (!authority) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!authority.is_approved) {
      return res.status(403).json({
        message: "Your account is pending Super Admin approval. Please check back later.",
      });
    }

    const isMatch = await bcrypt.compare(password, authority.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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

    // Find admin using Model
    const admin = await Admin.findByEmail(email);

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

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
export const getMe = async (req, res) => {
  const { id, role } = req.user;

  try {
    let userRecord = null;

    // Fetch from correct model based on role
    if (role === "user") {
      userRecord = await User.findById(id);
    } else if (role === "authority") {
      userRecord = await Authority.findById(id);
    } else if (role === "admin") {
      userRecord = await Admin.findById(id);
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    if (!userRecord) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: { ...userRecord, role },
    });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Server error fetching profile" });
  }
};