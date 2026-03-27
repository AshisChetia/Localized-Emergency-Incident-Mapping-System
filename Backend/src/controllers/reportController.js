import cloudinary from "../config/cloudinary.js";
import reverseGeocode from "../utils/geocode.js";
import Report from "../models/Report.js";
import Authority from "../models/Authority.js";
import ReportVerification from "../models/ReportVerification.js";
import { GoogleGenAI } from "@google/genai";

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
  // We ONLY accept visual coordinates, description, and department from the frontend.
  const { description, latitude, longitude, department } = req.body;
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

    // ── 2. AI AUTO-ROUTING (GEMINI) ──
    let assignedDepartment = "Municipal Corporation"; // Safe system default
    const MASTER_DEPARTMENTS = [
      "Municipal Corporation",
      "Public Works Department",
      "Electricity Department",
      "Water Supply Department"
    ];

    try {
      const prompt = `You are an automated emergency incident routing AI. Analyze this image. Based strictly on the visual evidence, classify this incident into EXACTLY ONE of the following 4 departments:
      - Municipal Corporation (civic issues, garbage, stray animals, public nuisances)
      - Public Works Department (road damage, potholes, infrastructure failure, structural collapse)
      - Electricity Department (fallen power lines, broken streetlights, electrical hazards)
      - Water Supply Department (burst pipes, severe flooding, sewage leaks, drainage issues)
      Even if the image is confusing, blurry, or seemingly unrelated, you MUST pick the single closest matching department from these 4. NEVER return 'General' or any other text. Only return the exact department name.`;

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
        // Absolute fallback if Gemini completely hallucinates or returns something invalid
        assignedDepartment = "Municipal Corporation";
      }
    } catch (aiError) {
      console.error("AI Routing Error:", aiError);
      assignedDepartment = "Municipal Corporation";
    }

    // ── 3. DATABASE SAVE ──
    const result = await Report.create({
      userId,
      description,
      imageUrl,
      latitude: parseFloat(latitude),   // Strict physical GPS point
      longitude: parseFloat(longitude), // Strict physical GPS point
      pincode: routingPincode,          // Strict Database Routing Token
      department: assignedDepartment    // 🤖 AI Assigned!
    });

    const newReport = await Report.findById(result.insertId);

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
      if (report.department && report.department !== req.user.department) {
        return res.status(403).json({ message: "This report belongs to a different department" });
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
  const authorityPincode = req.user.pincode;

  try {
    const allowedStatuses = ["pending", "resolved"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be either 'pending' or 'resolved'" });
    }

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.pincode !== authorityPincode) {
      return res.status(403).json({ message: "You can only update reports within your jurisdiction" });
    }

    if (report.department && report.department !== req.user.department) {
      return res.status(403).json({ message: "You can only update reports assigned to your department" });
    }

    if (report.status === status) {
      return res.status(400).json({ message: `Report is already marked as '${status}'` });
    }

    await Report.updateStatus(id, status);
    const updatedReport = await Report.findById(id);
    const normalized = normalizeReport(updatedReport);

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
  deleteReport,
  verifyReport,
  unverifyReport
};
