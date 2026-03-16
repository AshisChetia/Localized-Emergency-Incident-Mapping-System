import cloudinary from "../config/cloudinary.js";
import reverseGeocode from "../utils/geocode.js";

// ── Import Report Model ──
import Report from "../models/Report.js";

// ─────────────────────────────────────────
// HELPER: Upload Buffer to Cloudinary
// ─────────────────────────────────────────
const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Stream Error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// ═════════════════════════════════════════
//  CREATE REPORT
// ═════════════════════════════════════════
const createReport = async (req, res) => {
  const { description, latitude, longitude } = req.body;
  const userId = req.user.id;

  try {
    if (!description || !latitude || !longitude) {
      return res.status(400).json({ message: "Description, latitude, and longitude are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Incident image is required" });
    }

    // Upload image
    let imageUrl = "";
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "emergency_reports");
      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }

    // Geocode location
    let incidentPincode = "";
    try {
      incidentPincode = await reverseGeocode(parseFloat(latitude), parseFloat(longitude));
    } catch (geoError) {
      return res.status(500).json({ message: "Could not determine pincode from location." });
    }

    if (!incidentPincode) {
      return res.status(400).json({ message: "Unable to extract pincode from coordinates." });
    }

    // Save report using Model
    const result = await Report.create({
      userId,
      description,
      imageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pincode: incidentPincode
    });

    // Fetch the fresh report data
    const newReport = await Report.findById(result.insertId);

    return res.status(201).json({
      message: "Report submitted successfully",
      report: newReport,
    });
  } catch (error) {
    console.error("Create Report Error:", error);
    return res.status(500).json({ message: "Server error while creating report", errorDetails: error.message });
  }
};

// ═════════════════════════════════════════
//  GET LOGGED-IN USER'S OWN REPORTS
// ═════════════════════════════════════════
const getMyReports = async (req, res) => {
  const userId = req.user.id;

  try {
    const reports = await Report.findByUserId(userId);

    return res.status(200).json({
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get My Reports Error:", error);
    return res.status(500).json({ message: "Server error while fetching your reports" });
  }
};

// ═════════════════════════════════════════
//  GET REPORTS BY PINCODE
// ═════════════════════════════════════════
const getReportsByPincode = async (req, res) => {
  const authorityPincode = req.user.pincode;

  try {
    const reports = await Report.findByPincode(authorityPincode);

    return res.status(200).json({
      pincode: authorityPincode,
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get Reports By Pincode Error:", error);
    return res.status(500).json({ message: "Server error while fetching reports" });
  }
};

// ═════════════════════════════════════════
//  GET SINGLE REPORT BY ID
// ═════════════════════════════════════════
const getReportById = async (req, res) => {
  const { id } = req.params;
  const { role, id: requesterId, pincode: authorityPincode } = req.user;

  try {
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Access control
    if (role === "user" && report.user_id !== requesterId) {
      return res.status(403).json({ message: "You are not authorized to view this report" });
    }

    if (role === "authority" && report.pincode !== authorityPincode) {
      return res.status(403).json({ message: "This report does not belong to your jurisdiction" });
    }

    return res.status(200).json({ report });
  } catch (error) {
    console.error("Get Report By ID Error:", error);
    return res.status(500).json({ message: "Server error while fetching report" });
  }
};

// ═════════════════════════════════════════
//  UPDATE REPORT STATUS
// ═════════════════════════════════════════
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

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.pincode !== authorityPincode) {
      return res.status(403).json({ message: "You can only update reports within your jurisdiction" });
    }

    if (report.status === status) {
      return res.status(400).json({ message: `Report is already marked as '${status}'` });
    }

    // Update using Model
    await Report.updateStatus(id, status);

    // Return the fresh updated report
    const updatedReport = await Report.findById(id);

    return res.status(200).json({
      message: `Report successfully marked as '${status}'`,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Update Report Status Error:", error);
    return res.status(500).json({ message: "Server error while updating report status" });
  }
};

// ═════════════════════════════════════════
//  GET ALL REPORTS (ADMIN OVERVIEW)
// ═════════════════════════════════════════
const getAllReports = async (req, res) => {
  try {
    const { status, pincode } = req.query;

    const reports = await Report.findAll({ status, pincode });
    const summary = await Report.getGlobalStats();

    return res.status(200).json({
      summary,
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get All Reports Error:", error);
    return res.status(500).json({ message: "Server error while fetching all reports" });
  }
};

// ═════════════════════════════════════════
//  GET REPORT STATS FOR AUTHORITY
// ═════════════════════════════════════════
const getReportStats = async (req, res) => {
  const authorityPincode = req.user.pincode;

  try {
    const overall = await Report.getStatsByPincode(authorityPincode);
    const monthly = await Report.getMonthlyStatsByPincode(authorityPincode);

    return res.status(200).json({
      pincode: authorityPincode,
      overall,
      monthly,
    });
  } catch (error) {
    console.error("Get Report Stats Error:", error);
    return res.status(500).json({ message: "Server error while fetching report statistics" });
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
};