// ─────────────────────────────────────────
// controllers/adminController.js
// Handles all Super Admin business logic:
// platform stats, authority management,
// pincode coverage, user oversight
// ─────────────────────────────────────────

import Admin from "../models/Admin.js";
import Authority from "../models/Authority.js";
import User from "../models/User.js";
import Report from "../models/Report.js";

// ═════════════════════════════════════════
//  GET ADMIN DASHBOARD
//  GET /api/admin/dashboard
//  Access: Super Admin (Protected)
//  Single endpoint that loads all data
//  needed for the admin dashboard page
// ═════════════════════════════════════════
export const getAdminDashboard = async (req, res) => {
    try {
        // ── Run all queries in parallel ──────
        const [
            platformStats,
            pendingRequests,
            approvedAuthorities,
            pincodeCoverage,
            reportsByPincode,
        ] = await Promise.all([
            Admin.getPlatformStats(),
            Authority.findAllPending(),
            Authority.findAllApproved(),
            Authority.getCoverageByPincode(),
            Report.getStatsByAllPincodes(),
        ]);

        return res.status(200).json({
            platformStats,
            pendingRequests: {
                count: pendingRequests.length,
                requests: pendingRequests,
            },
            approvedAuthorities: {
                count: approvedAuthorities.length,
                authorities: approvedAuthorities,
            },
            pincodeCoverage,
            reportsByPincode,
        });
    } catch (error) {
        console.error("Get Admin Dashboard Error:", error);
        return res.status(500).json({
            message: "Server error while fetching admin dashboard",
        });
    }
};

// ═════════════════════════════════════════
//  GET PLATFORM STATS
//  GET /api/admin/stats
//  Access: Super Admin (Protected)
// ═════════════════════════════════════════
export const getPlatformStats = async (req, res) => {
    try {
        const stats = await Admin.getPlatformStats();

        return res.status(200).json({ stats });
    } catch (error) {
        console.error("Get Platform Stats Error:", error);
        return res.status(500).json({
            message: "Server error while fetching platform stats",
        });
    }
};

// ═════════════════════════════════════════
//  GET ALL PENDING AUTHORITY REQUESTS
//  GET /api/admin/authorities/pending
//  Access: Super Admin (Protected)
// ═════════════════════════════════════════
export const getPendingRequests = async (req, res) => {
    try {
        const pendingRequests = await Authority.findAllPending();

        return res.status(200).json({
            total: pendingRequests.length,
            requests: pendingRequests,
        });
    } catch (error) {
        console.error("Get Pending Requests Error:", error);
        return res.status(500).json({
            message: "Server error while fetching pending requests",
        });
    }
};

// ═════════════════════════════════════════
//  APPROVE AUTHORITY
//  PATCH /api/admin/authorities/:id/approve
//  Access: Super Admin (Protected)
// ═════════════════════════════════════════
export const approveAuthority = async (req, res) => {
    const { id } = req.params;

    try {
        // ── Check authority exists ───────────
        const authority = await Authority.findById(id);

        if (!authority) {
            return res.status(404).json({
                message: "Authority registration request not found",
            });
        }

        // ── Check if already approved ────────
        if (authority.is_approved) {
            return res.status(400).json({
                message: "This authority account is already approved",
            });
        }

        // ── Approve in database ──────────────
        await Authority.approveById(id);

        // ── Return updated authority ─────────
        const updatedAuthority = await Authority.findById(id);
        const { password, ...safeAuthority } = updatedAuthority;

        return res.status(200).json({
            message: `Authority account for ${authority.name} has been approved successfully. They can now log in.`,
            authority: safeAuthority,
        });
    } catch (error) {
        console.error("Approve Authority Error:", error);
        return res.status(500).json({
            message: "Server error while approving authority",
        });
    }
};

// ═════════════════════════════════════════
//  REJECT AUTHORITY REQUEST
//  DELETE /api/admin/authorities/:id/reject
//  Access: Super Admin (Protected)
// ═════════════════════════════════════════
export const rejectAuthority = async (req, res) => {
    const { id } = req.params;

    try {
        // ── Check authority exists ───────────
        const authority = await Authority.findById(id);

        if (!authority) {
            return res.status(404).json({
                message: "Authority registration request not found",
            });
        }

        // ── Prevent rejecting already approved ──
        if (authority.is_approved) {
            return res.status(400).json({
                message:
                    "Cannot reject an already approved authority. Use the remove route instead.",
            });
        }

        // ── Delete the request permanently ───
        await Authority.deleteById(id);

        return res.status(200).json({
            message: `Registration request from ${authority.name} (${authority.email}) has been rejected and removed.`,
        });
    } catch (error) {
        console.error("Reject Authority Error:", error);
        return res.status(500).json({
            message: "Server error while rejecting authority request",
        });
    }
};

// ═════════════════════════════════════════
//  GET ALL APPROVED AUTHORITIES
//  GET /api/admin/authorities
//  Access: Super Admin (Protected)
// ═════════════════════════════════════════
export const getAllAuthorities = async (req, res) => {
    try {
        const authorities = await Authority.findAllApproved();

        return res.status(200).json({
            total: authorities.length,
            authorities,
        });
    } catch (error) {
        console.error("Get All Authorities Error:", error);
        return res.status(500).json({
            message: "Server error while fetching authorities",
        });
    }
};

// ═════════════════════════════════════════
//  GET PINCODE COVERAGE
//  GET /api/admin/coverage
//  Access: Super Admin (Protected)
// ═════════════════════════════════════════
export const getPincodeCoverage = async (req, res) => {
    try {
        const coverage = await Authority.getCoverageByPincode();

        return res.status(200).json({
            total_pincodes_covered: coverage.length,
            coverage,
        });
    } catch (error) {
        console.error("Get Pincode Coverage Error:", error);
        return res.status(500).json({
            message: "Server error while fetching pincode coverage",
        });
    }
};

// ═════════════════════════════════════════
//  GET ALL USERS
//  GET /api/admin/users
//  Access: Super Admin (Protected)
// ═════════════════════════════════════════
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        return res.status(200).json({
            total: users.length,
            users,
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        return res.status(500).json({
            message: "Server error while fetching users",
        });
    }
};