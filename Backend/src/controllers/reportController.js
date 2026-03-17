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

// ═════════════════════════════════════════
//  CREATE REPORT (Fixed Pincode Logic)
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

    let imageUrl = "";
    try {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "emergency_reports");
      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      return res.status(500).json({ message: "Image upload failed. Please try again." });
    }

    // ── PINCODE FIX: Strict Validation & Fallback ──
    let incidentPincode = req.user.pincode; // Default to user's home pincode
    
    try {
      const geoResult = await reverseGeocode(parseFloat(latitude), parseFloat(longitude));
      const geoPincode = geoResult?.toString().trim();
      
      // Only use the geocoded pincode if it is exactly 6 digits
      if (geoPincode && /^\d{6}$/.test(geoPincode)) {
        incidentPincode = geoPincode;
      }
    } catch (geoError) {
      console.warn("Geocoding failed, falling back to citizen's registered pincode.");
    }

    const result = await Report.create({
      userId,
      description,
      imageUrl,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      pincode: incidentPincode
    });

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
  const authorityPincode = req.user.pincode;
  try {
    const reports = await Report.findByPincode(authorityPincode);
    return res.status(200).json({ pincode: authorityPincode, total: reports.length, reports });
  } catch (error) {
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
    if (role === "authority" && report.pincode !== authorityPincode) {
      return res.status(403).json({ message: "This report does not belong to your jurisdiction" });
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

// ═════════════════════════════════════════
//  DELETE REPORT
// ═════════════════════════════════════════
const deleteReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Security: Only the user who created it can delete it
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