// ─────────────────────────────────────────
// middleware/authMiddleware.js
// Verifies JWT token from request headers
// and attaches decoded user to req.user
// ─────────────────────────────────────────
import jwt from "jsonwebtoken"
import db from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  try {
    // ── Extract token from Authorization header ──
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    // ── Verify token ──
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Session expired. Please log in again.",
        });
      }
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
      });
    }

    const { id, role } = decoded;

    // ── Verify user still exists in DB
    //    and fetch live pincode for authority ──
    let query  = "";
    let fields = "";

    if (role === "user") {
      fields = "id, name, email, pincode";
      query  = `SELECT ${fields} FROM users WHERE id = ?`;
    } else if (role === "authority") {
      fields = "id, name, email, pincode, department, is_approved";
      query  = `SELECT ${fields} FROM authorities WHERE id = ?`;
    } else if (role === "admin") {
      fields = "id, email";
      query  = `SELECT ${fields} FROM admins WHERE id = ?`;
    } else {
      return res.status(403).json({
        message: "Invalid role in token.",
      });
    }

    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Account no longer exists. Please register again.",
      });
    }

    const dbUser = rows[0];

    // ── Block unapproved authorities ──
    if (role === "authority" && !dbUser.is_approved) {
      return res.status(403).json({
        message:
          "Your authority account is still pending Super Admin approval.",
      });
    }

    // ── Attach full user info to request ──
    req.user = { ...dbUser, role };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      message: "Server error during authentication",
    });
  }
};

export default authMiddleware;