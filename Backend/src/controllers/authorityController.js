// ─────────────────────────────────────────
// controllers/authorityController.js
// Handles authority-specific business logic
// for profile and combined dashboard data.
// Report CRUD logic stays in
// reportController.js as already built.
// ─────────────────────────────────────────

import Authority from "../models/Authority.js";
import Report from "../models/Report.js";

// ═════════════════════════════════════════
//  GET AUTHORITY PROFILE
//  GET /api/authority/profile
//  Access: Authority (Protected)
// ═════════════════════════════════════════
export const getAuthorityProfile = async (req, res) => {
    const authorityId = req.user.id;

    try {
        const authority = await Authority.findById(authorityId);

        if (!authority) {
            return res.status(404).json({
                message: "Authority account not found",
            });
        }

        // Never return password in response
        const { password, ...safeAuthority } = authority;

        return res.status(200).json({
            authority: { ...safeAuthority, role: "authority" },
        });
    } catch (error) {
        console.error("Get Authority Profile Error:", error);
        return res.status(500).json({
            message: "Server error while fetching authority profile",
        });
    }
};

// ═════════════════════════════════════════
//  GET AUTHORITY DASHBOARD
//  GET /api/authority/dashboard
//  Access: Authority (Protected)
//  Returns everything needed to render
//  the authority dashboard in one call:
//  overall stats + monthly chart data +
//  recent 5 pending reports
// ═════════════════════════════════════════
export const getAuthorityDashboard = async (req, res) => {
    const { pincode, name, department } = req.user;

    try {
        // ── Run all queries in parallel ──────
        const [overallStats, monthlyStats, recentReports] = await Promise.all([
            // Overall counts for this pincode
            Report.getStatsByPincode(pincode),

            // Last 6 months data for Chart.js
            Report.getMonthlyStatsByPincode(pincode),

            // Most recent 5 pending reports
            Report.findByPincode(pincode),
        ]);

        // ── Filter only pending from recent ──
        const pendingReports = recentReports
            .filter((r) => r.status === "pending")
            .slice(0, 5);

        return res.status(200).json({
            authority: {
                name,
                department,
                pincode,
            },
            stats: {
                overall: overallStats,
                monthly: monthlyStats,
            },
            recentPendingReports: pendingReports,
        });
    } catch (error) {
        console.error("Get Authority Dashboard Error:", error);
        return res.status(500).json({
            message: "Server error while fetching authority dashboard",
        });
    }
};