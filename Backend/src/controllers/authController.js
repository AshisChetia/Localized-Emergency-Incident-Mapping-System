// ─────────────────────────────────────────
// controllers/authController.js
// ─────────────────────────────────────────

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const IN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^\d{6}$/;

// ═════════════════════════════════════════
//  NORMAL USER AUTH
// ═════════════════════════════════════════

// ── Register User ──────────────────────────
export const registerUser = async (req, res) => {
  const { name, email, password, pincode, number } = req.body;

  try {
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPincode = String(pincode || "").trim();
    const normalizedNumber = String(number || "").trim();

    if (!normalizedName || !normalizedEmail || !password || !normalizedPincode || !normalizedNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (!PINCODE_REGEX.test(normalizedPincode)) {
      return res.status(400).json({ message: "Pincode must be exactly 6 digits" });
    }

    if (!IN_MOBILE_REGEX.test(normalizedNumber)) {
      return res.status(400).json({ message: "Phone number must be a valid 10-digit Indian mobile number" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const userExists = await User.emailExists(normalizedEmail);
    if (userExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const numberExists = await User.numberExists(normalizedNumber);
    if (numberExists) {
      return res.status(409).json({ message: "Phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      pincode: normalizedPincode,
      number: normalizedNumber,
    });

    const token = generateToken(result.insertId, "user");

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: result.insertId,
        name: normalizedName,
        email: normalizedEmail,
        pincode: normalizedPincode,
        number: normalizedNumber,
        role: "user",
      },
    });
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
        number: user.number,
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

    const authorityExists = await Authority.emailExists(email);
    if (authorityExists) {
      return res.status(409).json({
        message: "An authority with this email already exists or has a pending request",
      });
    }

    const deptExists = await Authority.findByPincodeAndDepartment(pincode, department);
    if (deptExists) {
      return res.status(409).json({
        message: `An authority for ${department} already exists in pincode ${pincode}. Only one authority per department per pincode is allowed.`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Authority.create({
      name,
      email,
      password: hashedPassword,
      pincode,
      department,
    });

    return res.status(201).json({
      message: "Registration request submitted successfully. Please wait for Super Admin approval.",
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
      authority: { // FIXED: Sent as 'authority'
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
// ── Login Admin ─────────────────────────────
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  console.log("\n=== 🕵️ ADMIN LOGIN ATTEMPT ===");
  console.log("1. Email received from browser:", email);
  console.log("2. Password received from browser:", password);

  try {
    if (!email || !password) {
      console.log("❌ FAIL: Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findByEmail(email);
    console.log("3. Database Search Result:", admin ? `Found Admin (ID: ${admin.id})` : "NULL (No user found with this email!)");

    if (!admin) {
      console.log("❌ FAIL: Rejected at Email check");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("4. Hash in Database:", admin.password);
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("5. Password Match Result:", isMatch);

    if (!isMatch) {
      console.log("❌ FAIL: Rejected at Password check");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log("✅ SUCCESS: Passwords match! Generating token...");
    const token = generateToken(admin.id, "admin");

    return res.status(200).json({
      message: "Admin login successful",
      token,
      admin: { 
        id: admin.id,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// ── Get Current Logged-In User Profile ──────
export const getMe = async (req, res) => {
  const { id, role } = req.user;

  try {
    let userRecord = null;

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

// ═════════════════════════════════════════
//  GET DEPARTMENTS BY PINCODE (PUBLIC)
// ═════════════════════════════════════════

export const getDepartmentsByPincode = async (req, res) => {
  const { pincode } = req.params;

  try {
    if (!pincode) {
      return res.status(400).json({ message: "Pincode is required" });
    }

    const departments = await Authority.findApprovedDepartmentsByPincode(pincode);
    
    return res.status(200).json({
      pincode,
      departments,
    });
  } catch (error) {
    console.error("Get Departments Error:", error);
    return res.status(500).json({ message: "Server error fetching departments" });
  }
};
