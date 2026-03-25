import cloudinary from "../config/cloudinary.js";
import reverseGeocode from "../utils/geocode.js";
import Report from "../models/Report.js";

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
    if (!description || !department || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "Description, department, and precise location are required" });
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

    // ── 2. DATABASE SAVE ──
    const result = await Report.create({
      userId,
      description,
      imageUrl,
      latitude: parseFloat(latitude),   // Strict physical GPS point
      longitude: parseFloat(longitude), // Strict physical GPS point
      pincode: routingPincode,          // Strict Database Routing Token
      department                        // Selected by citizen based on their pincode
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
    return res.status(200).json({ total: reports.length, reports });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching your reports" });
  }
};

const getReportsByPincode = async (req, res) => {
  const targetPincode = req.params.pincode || req.user.pincode;
  const targetDepartment = req.user.role === "authority" ? req.user.department : null;

  try {
    const reports = await Report.findByPincode(targetPincode, targetDepartment);
    return res.status(200).json({ 
      pincode: targetPincode, 
      total: reports.length, 
      reports 
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
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (role === "user" && report.user_id !== requesterId) {
      return res.status(403).json({ message: "You are not authorized to view this report" });
    }
    if (role === "authority") {
      if (report.pincode !== authorityPincode) {
        return res.status(403).json({ message: "This report does not belong to your jurisdiction" });
      }
      if (report.department && report.department !== req.user.department) {
        return res.status(403).json({ message: "This report belongs to a different department" });
      }
    }
    return res.status(200).json({ report });
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

    return res.status(200).json({ message: `Report successfully marked as '${status}'`, report: updatedReport });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating report status" });
  }
};

const getAllReports = async (req, res) => {
  try {
    const { status, pincode } = req.query;
    const reports = await Report.findAll({ status, pincode });
    const summary = await Report.getGlobalStats();
    return res.status(200).json({ summary, total: reports.length, reports });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching all reports" });
  }
};

const getReportStats = async (req, res) => {
  const authorityPincode = req.user.pincode;
  try {
    const overall = await Report.getStatsByPincode(authorityPincode);
    const monthly = await Report.getMonthlyStatsByPincode(authorityPincode);
    return res.status(200).json({ pincode: authorityPincode, overall, monthly });
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

export {
  createReport,
  getMyReports,
  getReportsByPincode,
  getReportById,
  updateReportStatus,
  getAllReports,
  getReportStats,
  deleteReport
};