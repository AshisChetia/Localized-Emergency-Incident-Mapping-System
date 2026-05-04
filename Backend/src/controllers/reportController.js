import cloudinary from "../config/cloudinary.js";
import reverseGeocode from "../utils/geocode.js";
import db from "../config/db.js";
import Report from "../models/Report.js";
import Authority from "../models/Authority.js";
import ReportVerification from "../models/ReportVerification.js";
import { GoogleGenAI } from "@google/genai";
import { sendReportConfirmation, sendStatusUpdate } from "../utils/emailService.js";

const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// ─────────────────────────────────────────
// HELPER: Normalize timestamps to ISO format
// ─────────────────────────────────────────
const normalizeReport = (report) => {
  if (!report) return report;
  
  const normalized = { ...report };

  normalized.verification_count = Number(normalized.verification_count || 0);
  normalized.is_verified_by_me = Boolean(Number(normalized.is_verified_by_me || 0));
  normalized.can_verify = Boolean(
    normalized.viewer_role === "user" &&
    normalized.status === "pending" &&
    normalized.user_id &&
    normalized.viewer_id &&
    normalized.user_id !== normalized.viewer_id &&
    normalized.pincode === normalized.viewer_pincode
  );
  
  // Convert created_at to ISO format if it exists
  if (normalized.created_at) {
    if (normalized.created_at instanceof Date) {
      normalized.created_at = normalized.created_at.toISOString();
    } else if (typeof normalized.created_at === 'string') {
      // If it's a string like "2026-03-27 08:19:00", convert to ISO
      const match = normalized.created_at.match(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        const [, year, month, day, hours, minutes, seconds] = match;
        normalized.created_at = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds)).toISOString();
      }
    }
  }
  
  // Convert updated_at to ISO format if it exists
  if (normalized.updated_at) {
    if (normalized.updated_at instanceof Date) {
      normalized.updated_at = normalized.updated_at.toISOString();
    } else if (typeof normalized.updated_at === 'string') {
      const match = normalized.updated_at.match(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/);
      if (match) {
        const [, year, month, day, hours, minutes, seconds] = match;
        normalized.updated_at = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds)).toISOString();
      }
    }
  }
  
  delete normalized.viewer_id;
  delete normalized.viewer_pincode;
  delete normalized.viewer_role;

  return normalized;
};

// Normalize array of reports
const normalizeReports = (reports) => {
  if (!Array.isArray(reports)) return reports;
  return reports.map(normalizeReport);
};

// ─────────────────────────────────────────
// src/controllers/reportController.js
// ─────────────────────────────────────────

const createReport = async (req, res) => {
  // We accept visual coordinates, description, and optional department override from the frontend.
  const { description, latitude, longitude, department: userDepartmentOverride } = req.body;
  const userId = req.user.id;

  // 👉 THE GUARANTEED ROUTING LOCK: 
  // We grab the citizen's registered pincode directly from their verified Auth Token!
  const routingPincode = req.user.pincode;

  try {
    if (!description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Description and precise location are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Incident image is required" });
    }

    // ── 1. UPLOAD IMAGE ──
    let imageUrl = "";
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "emergency_reports");
      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      return res.status(500).json({ message: "Image upload failed." });
    }

    // ── 2. DEPARTMENT ROUTING ──
    let assignedDepartment = "Garbage Management"; // Default to Garbage/Civic if unsure
    const MASTER_DEPARTMENTS = [
      "Public Works Department",
      "Water Supply Department",
      "Electricity Department",
      "Garbage Management"
    ];

    // ── 2a. CHECK IF USER PROVIDED A MANUAL DEPARTMENT OVERRIDE ──
    const userOverride = userDepartmentOverride?.trim();
    const isValidOverride = userOverride && MASTER_DEPARTMENTS.find(d => d.toLowerCase() === userOverride.toLowerCase());

    if (isValidOverride) {
      // User explicitly chose a department — skip AI routing
      assignedDepartment = isValidOverride;
      console.log(`📋 User override: Department set to "${assignedDepartment}"`);
    } else {
      // ── 2b. AI AUTO-ROUTING (GEMINI) ──
      try {
        const prompt = `You are an automated emergency incident routing AI. Analyze BOTH the attached image AND the citizen's description below.
        
        Citizen's Description: "${description}"
        
        The description contains critical context that might not be perfectly clear from the image alone. You must weigh BOTH the visual evidence and the text to accurately classify this incident into EXACTLY ONE of the following 4 departments:
        - Public Works Department (road damage, potholes, infrastructure failure, structural collapse)
        - Water Supply Department (burst pipes, severe flooding, sewage leaks, drainage issues)
        - Electricity Department (fallen power lines, broken streetlights, electrical hazards)
        - Garbage Management (garbage piles, waste disposal, sanitation issues, public nuisances)
        
        Even if the image is confusing, rely on the description to make your decision. MUST pick the single closest matching department from these 4. NEVER return any other text. Only return the exact department name.`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            prompt,
            {
              inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
              }
            }
          ]
        });

        const aiResponse = response.text.trim();

        // Strict exact match enforcement against the 4 master categories
        const matchedDept = MASTER_DEPARTMENTS.find(d => d.toLowerCase() === aiResponse.toLowerCase());

        if (matchedDept) {
          assignedDepartment = matchedDept;
        } else {
          // Absolute fallback
          assignedDepartment = "Garbage Management";
        }
      } catch (aiError) {
        console.error("AI Routing Error:", aiError);
        assignedDepartment = "Garbage Management";
      }
    }

    // ── 3. DATABASE SAVE ──
    const result = await Report.create({
      userId,
      description,
      imageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pincode: routingPincode,
      department: assignedDepartment
    });

    // ── 4. AUTO-ASSIGN TO TEAM MEMBER ──
    // Map AI department names to sub_department IDs
    const departmentMapping = {
      "Public Works Department": "pwd",
      "Water Supply Department": "water_supply",
      "Electricity Department": "electricity",
      "Garbage Management": "garbage_management"
    };

    const subDeptId = departmentMapping[assignedDepartment];

    if (subDeptId) {
      try {
        // Find the team member managing this sub_department for the authority in this pincode
        const [rows] = await db.query(
          `SELECT tm.id FROM team_members tm
           JOIN authorities a ON tm.authority_id = a.id
           WHERE a.pincode = ? AND tm.sub_department = ? AND tm.is_active = true
           LIMIT 1`,
          [routingPincode, subDeptId]
        );

        if (rows && rows.length > 0) {
          // Update the report to assign it to this team member
          await db.query(
            `UPDATE reports SET assigned_to = ?, sub_department = ? WHERE id = ?`,
            [rows[0].id, subDeptId, result.insertId]
          );
        }
      } catch (assignError) {
        console.error("Auto-assign to team member failed:", assignError);
        // Don't fail the report creation if auto-assignment fails
      }
    }


    const newReport = await Report.findById(result.insertId);

    // ── 5. SEND CONFIRMATION EMAIL (Asynchronous) ──
    if (req.user?.email) {
      sendReportConfirmation(req.user.email, newReport);
    }

    return res.status(201).json({
      message: `Report routed successfully to your home zone: ${routingPincode}`,
      report: newReport,
    });
  } catch (error) {
    console.error("Create Report Error:", error);
    return res.status(500).json({ message: "Server error while creating report" });
  }
};

const getMyReports = async (req, res) => {
  const userId = req.user.id;
  try {
    const reports = await Report.findByUserId(userId);
    const normalized = normalizeReports(reports);
    return res.status(200).json({ total: normalized.length, reports: normalized });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching your reports" });
  }
};

const getCommunityReports = async (req, res) => {
  const { id: userId, pincode } = req.user;

  try {
    const reports = await Report.findCommunityByPincode(pincode, userId);
    const enriched = reports.map((report) => ({
      ...report,
      viewer_id: userId,
      viewer_pincode: pincode,
      viewer_role: req.user.role,
    }));
    const normalized = normalizeReports(enriched);

    return res.status(200).json({
      pincode,
      total: normalized.length,
      reports: normalized,
    });
  } catch (error) {
    console.error("Fetch Community Reports Error:", error);
    return res.status(500).json({ message: "Server error while fetching community reports" });
  }
};

const getReportsByPincode = async (req, res) => {
  const targetPincode = req.params.pincode || req.user.pincode;
  const targetDepartment = req.user.role === "authority" ? req.user.department : null;

  try {
    const reports = await Report.findByPincode(targetPincode, targetDepartment, req.user.id);
    const normalized = normalizeReports(reports);
    return res.status(200).json({
      pincode: targetPincode,
      total: normalized.length,
      reports: normalized
    });
  } catch (error) {
    console.error("Fetch Pincode Reports Error:", error);
    return res.status(500).json({ message: "Server error while fetching reports" });
  }
};

const getReportById = async (req, res) => {
  const { id } = req.params;
  const { role, id: requesterId, pincode: authorityPincode } = req.user;
  try {
    const report = await Report.findById(id, requesterId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (role === "user" && report.user_id !== requesterId) {
      if (report.pincode !== req.user.pincode) {
        return res.status(403).json({ message: "You are not authorized to view this report" });
      }
    }
    if (role === "authority") {
      if (report.pincode !== authorityPincode) {
        return res.status(403).json({ message: "This report does not belong to your jurisdiction" });
      }
    }
    if (role === "department_manager") {
      if (report.pincode !== req.user.pincode) {
        return res.status(403).json({ message: "This report does not belong to your jurisdiction" });
      }
    }
    const normalized = normalizeReport({
      ...report,
      viewer_id: requesterId,
      viewer_pincode: req.user.pincode,
      viewer_role: req.user.role,
    });
    return res.status(200).json({ report: normalized });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching report" });
  }
};

const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userPincode = req.user.pincode;
  const userRole = req.user.role;

  try {
    const allowedStatuses = ["reported", "under_review", "in_progress", "resolved", "closed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be one of: reported, under_review, in_progress, resolved, closed" });
    }

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // ── Jurisdiction check ──
    if (report.pincode !== userPincode) {
      return res.status(403).json({ message: "You can only update reports within your jurisdiction" });
    }

    // ── Department Manager: can only set up to 'resolved', not 'closed' ──
    if (userRole === "department_manager") {
      if (status === "closed") {
        return res.status(403).json({ message: "Only the authority can close a report" });
      }
      if (report.assigned_to !== req.user.id) {
        // Check if report matches their sub_department even if not directly assigned
        const departmentMapping = {
          "Municipal Corporation": "sanitation",
          "Public Works Department": "roads",
          "Electricity Department": "electricity",
          "Water Supply Department": "water_supply"
        };
        const reportSubDept = departmentMapping[report.department];
        if (reportSubDept !== req.user.sub_department) {
          return res.status(403).json({ message: "This report is not assigned to your department" });
        }
      }
    }

    if (report.status === status) {
      return res.status(400).json({ message: `Report is already marked as '${status}'` });
    }

    await Report.updateStatus(id, status);
    const updatedReport = await Report.findById(id);
    const normalized = normalizeReport(updatedReport);

    // ── 5. SEND STATUS UPDATE EMAIL (Asynchronous) ──
    if (updatedReport?.reporter_email) {
      sendStatusUpdate(updatedReport.reporter_email, updatedReport, status);
    }

    return res.status(200).json({ message: `Report successfully marked as '${status}'`, report: normalized });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating report status" });
  }
};

const getAllReports = async (req, res) => {
  try {
    const { status, pincode } = req.query;
    const reports = await Report.findAll({ status, pincode }, req.user.id);
    const normalized = normalizeReports(reports);
    const summary = await Report.getGlobalStats();
    return res.status(200).json({ summary, total: normalized.length, reports: normalized });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching all reports" });
  }
};

const getReportStats = async (req, res) => {
  const authorityPincode = req.user.pincode;
  try {
    const overall = await Report.getStatsByPincode(authorityPincode);
    const monthly = await Report.getMonthlyStatsByPincode(authorityPincode);
    const normalizedOverall = normalizeReport(overall);
    const normalizedMonthly = normalizeReports(monthly);
    return res.status(200).json({ pincode: authorityPincode, overall: normalizedOverall, monthly: normalizedMonthly });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching report statistics" });
  }
};

// ═════════════════════════════════════════
// GET TEAM MEMBER'S ASSIGNED REPORTS
// GET /api/reports/team-member/assigned
// Returns reports assigned to this department manager
// ═════════════════════════════════════════
const getTeamMemberAssignedReports = async (req, res) => {
  const teamMemberId = req.user.id;
  const pincode = req.user.pincode;
  const subDept = req.user.sub_department;
  
  // Map sub_department to the Master Department name stored in the 'department' column
  const reverseDepartmentMapping = {
    pwd: "Public Works Department",
    water_supply: "Water Supply Department",
    electricity: "Electricity Department",
    garbage_management: "Garbage Management",
  };
  const masterDept = reverseDepartmentMapping[subDept] || subDept;

  try {
    // Query all reports in the same pincode and belonging to this department
    const [reports] = await db.query(
      `SELECT 
          id, user_id, description, pincode, 
          status, assigned_to, sub_department, department,
          image_url, latitude, longitude, 
          created_at
       FROM reports
       WHERE pincode = ? AND (department = ? OR sub_department = ?)
       ORDER BY created_at DESC`,
      [pincode, masterDept, subDept]
    );

    const normalized = normalizeReports(reports);

    // Calculate stats for this department's reports
    const [reportedStats] = await db.query(
      `SELECT COUNT(*) as count FROM reports 
       WHERE pincode = ? AND (department = ? OR sub_department = ?) AND status = 'reported'`,
      [pincode, masterDept, subDept]
    );
    const [underReviewStats] = await db.query(
      `SELECT COUNT(*) as count FROM reports 
       WHERE pincode = ? AND (department = ? OR sub_department = ?) AND status = 'under_review'`,
      [pincode, masterDept, subDept]
    );
    const [inProgressStats] = await db.query(
      `SELECT COUNT(*) as count FROM reports 
       WHERE pincode = ? AND (department = ? OR sub_department = ?) AND status = 'in_progress'`,
      [pincode, masterDept, subDept]
    );
    const [resolvedStats] = await db.query(
      `SELECT COUNT(*) as count FROM reports 
       WHERE pincode = ? AND (department = ? OR sub_department = ?) AND status = 'resolved'`,
      [pincode, masterDept, subDept]
    );
    const [closedStats] = await db.query(
      `SELECT COUNT(*) as count FROM reports 
       WHERE pincode = ? AND (department = ? OR sub_department = ?) AND status = 'closed'`,
      [pincode, masterDept, subDept]
    );

    return res.status(200).json({
      reports: normalized,
      stats: {
        reported: reportedStats[0]?.count || 0,
        underReview: underReviewStats[0]?.count || 0,
        inProgress: inProgressStats[0]?.count || 0,
        resolved: resolvedStats[0]?.count || 0,
        closed: closedStats[0]?.count || 0,
        total: normalized.length
      }
    });
  } catch (error) {
    console.error("Get Team Member Reports Error:", error);
    return res.status(500).json({ message: "Server error while fetching assigned reports" });
  }
};

const deleteReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.user_id !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this report" });
    }

    await Report.delete(id);

    return res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Delete Report Error:", error);
    return res.status(500).json({ message: "Server error while deleting report" });
  }
};

const verifyReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const report = await Report.findById(id, userId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.user_id === userId) {
      return res.status(400).json({ message: "You cannot verify your own report" });
    }

    if (report.pincode !== req.user.pincode) {
      return res.status(403).json({ message: "You can only verify reports from your own pincode" });
    }

    if (report.status !== "pending") {
      return res.status(400).json({ message: "Only pending reports can be verified" });
    }

    const alreadyVerified = await ReportVerification.hasVerified(id, userId);

    if (alreadyVerified) {
      return res.status(409).json({ message: "You have already verified this report" });
    }

    await ReportVerification.verify(id, userId);

    const updatedReport = await Report.findById(id, userId);
    const normalized = normalizeReport({
      ...updatedReport,
      viewer_id: userId,
      viewer_pincode: req.user.pincode,
      viewer_role: req.user.role,
    });

    return res.status(201).json({
      message: "Report verified successfully",
      report: normalized,
    });
  } catch (error) {
    console.error("Verify Report Error:", error);
    return res.status(500).json({ message: "Server error while verifying report" });
  }
};

const unverifyReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const report = await Report.findById(id, userId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.pincode !== req.user.pincode) {
      return res.status(403).json({ message: "You can only manage verifications in your own pincode" });
    }

    const existingVerification = await ReportVerification.hasVerified(id, userId);

    if (!existingVerification) {
      return res.status(404).json({ message: "You have not verified this report yet" });
    }

    await ReportVerification.remove(id, userId);

    const updatedReport = await Report.findById(id, userId);
    const normalized = normalizeReport({
      ...updatedReport,
      viewer_id: userId,
      viewer_pincode: req.user.pincode,
      viewer_role: req.user.role,
    });

    return res.status(200).json({
      message: "Verification removed successfully",
      report: normalized,
    });
  } catch (error) {
    console.error("Unverify Report Error:", error);
    return res.status(500).json({ message: "Server error while removing verification" });
  }
};

export {
  createReport,
  getMyReports,
  getCommunityReports,
  getReportsByPincode,
  getReportById,
  updateReportStatus,
  getAllReports,
  getReportStats,
  getTeamMemberAssignedReports,
  deleteReport,
  verifyReport,
  unverifyReport
};
