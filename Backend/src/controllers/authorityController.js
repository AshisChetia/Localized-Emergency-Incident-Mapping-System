// ─────────────────────────────────────────
// controllers/authorityController.js
// Handles authority-specific business logic
// for profile and combined dashboard data.
// Report CRUD logic stays in
// reportController.js as already built.
// ─────────────────────────────────────────

import Authority from "../models/Authority.js";
import Report from "../models/Report.js";
import TeamMember from "../models/TeamMember.js";
import bcrypt from "bcryptjs";

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
    const { pincode, name } = req.user;

    try {
        // ── Run all queries in parallel ──────
        const [overallStats, monthlyStats, recentReports] = await Promise.all([
            // Overall counts for this pincode
            Report.getStatsByPincode(pincode),

            // Last 6 months data for Chart.js
            Report.getMonthlyStatsByPincode(pincode),

            // Most recent pending reports
            Report.findByPincode(pincode),
        ]);

        // ── Filter only pending from recent ──
        const pendingReports = recentReports
            .filter((r) => r.status === "pending")
            .slice(0, 5);

        return res.status(200).json({
            authority: {
                name,
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

// ═══════════════════════════════════════════════════════════════════════════
//  TEAM MEMBER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════
//  CREATE TEAM MEMBER
//  POST /api/authority/team-members
//  Chief creates a new department manager
// ═══════════════════════════════════════
export const createTeamMember = async (req, res) => {
    const authorityId = req.user.id;
    const { name, email, password, sub_department } = req.body;

    try {
        // ── Validation ──────────────────────
        if (!name || !email || !password || !sub_department) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // ── Valid sub-departments ───────────
        const validDepts = ["water_supply", "roads", "sanitation", "parks"];
        if (!validDepts.includes(sub_department)) {
            return res.status(400).json({
                message: "Invalid sub-department selected",
            });
        }

        // ── Check email uniqueness ──────────
        const emailExists = await TeamMember.emailExists(email);
        if (emailExists) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        // ── Check if department already assigned ──
        const deptExists = await TeamMember.findByAuthorityAndDepartment(authorityId, sub_department);
        if (deptExists) {
            return res.status(409).json({
                message: `A manager for ${sub_department} is already assigned to your authority`,
            });
        }

        // ── Hash password ───────────────────
        const hashedPassword = await bcrypt.hash(password, 10);

        // ── Create team member ──────────────
        const result = await TeamMember.create({
            authority_id: authorityId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            sub_department,
        });

        return res.status(201).json({
            message: "Team member added successfully",
            teamMember: {
                id: result.insertId,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                sub_department,
                role: "department_manager",
            },
        });
    } catch (error) {
        console.error("Create Team Member Error:", error);
        return res.status(500).json({
            message: "Server error while creating team member",
        });
    }
};

// ═══════════════════════════════════════
//  GET ALL TEAM MEMBERS
//  GET /api/authority/team-members
//  Chief views all their team members
// ═══════════════════════════════════════
export const getTeamMembers = async (req, res) => {
    const authorityId = req.user.id;

    try {
        const teamMembers = await TeamMember.findByAuthority(authorityId);

        return res.status(200).json({
            teamMembers,
            total: teamMembers.length,
        });
    } catch (error) {
        console.error("Get Team Members Error:", error);
        return res.status(500).json({
            message: "Server error while fetching team members",
        });
    }
};

// ═══════════════════════════════════════
//  UPDATE TEAM MEMBER
//  PUT /api/authority/team-members/:memberId
//  Chief updates a team member's details
// ═══════════════════════════════════════
export const updateTeamMember = async (req, res) => {
    const authorityId = req.user.id;
    const { memberId } = req.params;
    const { name, email, sub_department } = req.body;

    try {
        // ── Validation ──────────────────────
        if (!name || !email || !sub_department) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        // ── Check member belongs to this authority ──
        const member = await TeamMember.findById(memberId);
        if (!member || member.authority_id !== authorityId) {
            return res.status(403).json({
                message: "Cannot update this team member",
            });
        }

        // ── Check if department already assigned to someone else ──
        if (member.sub_department !== sub_department) {
            const deptExists = await TeamMember.findByAuthorityAndDepartment(authorityId, sub_department);
            if (deptExists && deptExists.id !== parseInt(memberId)) {
                return res.status(409).json({
                    message: `A manager for ${sub_department} is already assigned to your authority`,
                });
            }
        }

        // ── Update team member ──────────────
        await TeamMember.update(memberId, {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            sub_department,
        });

        return res.status(200).json({
            message: "Team member updated successfully",
        });
    } catch (error) {
        console.error("Update Team Member Error:", error);
        return res.status(500).json({
            message: "Server error while updating team member",
        });
    }
};

// ═══════════════════════════════════════
//  DEACTIVATE TEAM MEMBER
//  DELETE /api/authority/team-members/:memberId
//  Chief removes a team member
// ═══════════════════════════════════════
export const removeTeamMember = async (req, res) => {
    const authorityId = req.user.id;
    const { memberId } = req.params;

    try {
        // ── Check member belongs to this authority ──
        const member = await TeamMember.findById(memberId);
        if (!member || member.authority_id !== authorityId) {
            return res.status(403).json({
                message: "Cannot remove this team member",
            });
        }

        // ── Permanent map team member deletion ──────────
        await TeamMember.delete(memberId);

        return res.status(200).json({
            message: "Team member removed successfully",
        });
    } catch (error) {
        console.error("Remove Team Member Error:", error);
        return res.status(500).json({
            message: "Server error while removing team member",
        });
    }
};