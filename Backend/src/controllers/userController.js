import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ── Update Profile ─────────────────────────
export const updateProfile = async (req, res) => {
  const { id } = req.user;
  const { name, pincode, number } = req.body;

  try {
    const normalizedName = name?.trim();
    const normalizedPincode = String(pincode || "").trim();
    const normalizedNumber = String(number || "").trim();

    if (!normalizedName || !normalizedPincode) {
      return res.status(400).json({ message: "Name and pincode are required" });
    }

    if (normalizedPincode.length !== 6 || !/^\d{6}$/.test(normalizedPincode)) {
      return res.status(400).json({ message: "Pincode must be exactly 6 digits" });
    }

    if (normalizedNumber && (!/^\d{10}$/.test(normalizedNumber))) {
      return res.status(400).json({ message: "Phone number must be a valid 10-digit number" });
    }

    // In our model User.js, updateById takes name and pincode. Wait, let me check the model if it supports updating number.
    // Let me verify User.updateById definition in models/User.js:
    // It says: updateById: async (id, { name, pincode }) => { ... SET name = ?, pincode = ? WHERE id = ? }
    // I need to update the model first if we want to update the number.
    // For now, I will update both in the db.query directly if I want, or just call User.updateById if it doesn't support number.
    // Actually, I can just update name, pincode, and number directly here to be safe and avoid touching User.js if it doesn't support it, or I can update User.js.
    // I'll update User.js model.
    await User.updateById(id, { name: normalizedName, pincode: normalizedPincode, number: normalizedNumber });

    return res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Server error during profile update" });
  }
};

// ── Update Password ────────────────────────
export const updatePassword = async (req, res) => {
  const { id } = req.user;
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const { default: db } = await import("../config/db.js");
    const [rows] = await db.query(
      `SELECT password FROM users WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(id, hashedPassword);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    return res.status(500).json({ message: "Server error during password update" });
  }
};
