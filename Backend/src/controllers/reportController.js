import db from "../config/db.js";
import cloudinary from "../config/cloudinary.js";
import reverseGeocode from "../utils/geocode.js";


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
    // This line is crucial! It actually sends the buffer to Cloudinary.
    uploadStream.end(fileBuffer); 
  });
};

// ═════════════════════════════════════════
//  CREATE REPORT
//  POST /api/reports
//  Access: Normal User (Protected)
// ═════════════════════════════════════════
const createReport = async (req, res) => {
  const { description, latitude, longitude } = req.body;
  const userId = req.user.id;

  try {
    // ── Step 1: Validate required fields ──
    if (!description || !latitude || !longitude) {
      return res.status(400).json({
        message: "Description, latitude, and longitude are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Incident image is required",
      });
    }

    // ── Step 2: Upload image to Cloudinary ──
    let imageUrl = "";
    try {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "emergency_reports"
      );
      imageUrl = uploadResult.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      return res.status(500).json({
        message: "Image upload failed. Please try again.",
      });
    }

    // ── Step 3: Reverse geocode to get pincode ──
    let incidentPincode = "";
    try {
      incidentPincode = await reverseGeocode(
        parseFloat(latitude),
        parseFloat(longitude)
      );
    } catch (geoError) {
      console.error("Geocoding Error:", geoError);
      return res.status(500).json({
        message:
          "Could not determine pincode from location. Please try again.",
      });
    }

    if (!incidentPincode) {
      return res.status(400).json({
        message:
          "Unable to extract pincode from your coordinates. Please ensure you are in a valid location.",
      });
    }

    // ── Step 4: Save report to database ──
    const [result] = await db.query(
      `INSERT INTO reports 
        (user_id, description, image_url, latitude, longitude, pincode, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        description,
        imageUrl,
        parseFloat(latitude),
        parseFloat(longitude),
        incidentPincode,
        "pending",
      ]
    );

    // ── Step 5: Fetch the newly created report ──
    const [newReport] = await db.query(
      `SELECT 
          r.id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: "Report submitted successfully",
      report: newReport[0],
    });
  } catch (error) {
    console.error("Create Report Error:", error);
    // Send the real error back to Postman!
    return res.status(500).json({ 
      message: "Server error while creating report",
      errorDetails: error.message 
    });
  }
};

// ═════════════════════════════════════════
//  GET LOGGED-IN USER'S OWN REPORTS
//  GET /api/reports/my
//  Access: Normal User (Protected)
// ═════════════════════════════════════════
const getMyReports = async (req, res) => {
  const userId = req.user.id;

  try {
    const [reports] = await db.promise().query(
      `SELECT 
          id,
          description,
          image_url,
          latitude,
          longitude,
          pincode,
          status,
          created_at
       FROM reports
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get My Reports Error:", error);
    return res.status(500).json({
      message: "Server error while fetching your reports",
    });
  }
};

// ═════════════════════════════════════════
//  GET REPORTS BY PINCODE
//  GET /api/reports/pincode
//  Access: Authority (Protected)
//  Returns only reports matching
//  the authority's own pincode
// ═════════════════════════════════════════
const getReportsByPincode = async (req, res) => {
  const authorityPincode = req.user.pincode;

  try {
    const [reports] = await db.promise().query(
      `SELECT 
          r.id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.pincode = ?
       ORDER BY 
          CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
          r.created_at DESC`,
      [authorityPincode]
    );

    return res.status(200).json({
      pincode: authorityPincode,
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get Reports By Pincode Error:", error);
    return res.status(500).json({
      message: "Server error while fetching reports for your pincode",
    });
  }
};

// ═════════════════════════════════════════
//  GET SINGLE REPORT BY ID
//  GET /api/reports/:id
//  Access: User (own report) or Authority
//  (report in their pincode)
// ═════════════════════════════════════════
const getReportById = async (req, res) => {
  const { id } = req.params;
  const { role, id: requesterId, pincode: authorityPincode } = req.user;

  try {
    const [reports] = await db.promise().query(
      `SELECT 
          r.id,
          r.user_id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = reports[0];

    // ── Access control ──
    // Users can only view their own reports
    if (role === "user" && report.user_id !== requesterId) {
      return res.status(403).json({
        message: "You are not authorized to view this report",
      });
    }

    // Authorities can only view reports in their pincode
    if (role === "authority" && report.pincode !== authorityPincode) {
      return res.status(403).json({
        message: "This report does not belong to your jurisdiction",
      });
    }

    return res.status(200).json({ report });
  } catch (error) {
    console.error("Get Report By ID Error:", error);
    return res.status(500).json({
      message: "Server error while fetching report",
    });
  }
};

// ═════════════════════════════════════════
//  UPDATE REPORT STATUS
//  PATCH /api/reports/:id/status
//  Access: Authority Only (Protected)
// ═════════════════════════════════════════
const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const authorityPincode = req.user.pincode;

  try {
    // ── Validate status value ──
    const allowedStatuses = ["pending", "resolved"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be either 'pending' or 'resolved'",
      });
    }

    // ── Check report exists ──
    const [reports] = await db.promise().query(
      "SELECT id, pincode, status FROM reports WHERE id = ?",
      [id]
    );

    if (reports.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = reports[0];

    // ── Ensure authority only updates reports in their pincode ──
    if (report.pincode !== authorityPincode) {
      return res.status(403).json({
        message: "You can only update reports within your jurisdiction",
      });
    }

    // ── Prevent redundant updates ──
    if (report.status === status) {
      return res.status(400).json({
        message: `Report is already marked as '${status}'`,
      });
    }

    // ── Update status ──
    await db.promise().query(
      "UPDATE reports SET status = ? WHERE id = ?",
      [status, id]
    );

    // ── Return updated report ──
    const [updatedReport] = await db.promise().query(
      `SELECT 
          r.id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    return res.status(200).json({
      message: `Report successfully marked as '${status}'`,
      report: updatedReport[0],
    });
  } catch (error) {
    console.error("Update Report Status Error:", error);
    return res.status(500).json({
      message: "Server error while updating report status",
    });
  }
};

// ═════════════════════════════════════════
//  GET ALL REPORTS (ADMIN OVERVIEW)
//  GET /api/reports/all
//  Access: Super Admin Only (Protected)
// ═════════════════════════════════════════
const getAllReports = async (req, res) => {
  try {
    const { status, pincode } = req.query;

    // ── Build dynamic query based on filters ──
    let query = `
      SELECT 
          r.id,
          r.description,
          r.image_url,
          r.latitude,
          r.longitude,
          r.pincode,
          r.status,
          r.created_at,
          u.name  AS reporter_name,
          u.email AS reporter_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += " AND r.status = ?";
      params.push(status);
    }

    if (pincode) {
      query += " AND r.pincode = ?";
      params.push(pincode);
    }

    query += " ORDER BY r.created_at DESC";

    const [reports] = await db.promise().query(query, params);

    // ── Summary counts ──
    const [summary] = await db.promise().query(
      `SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports`
    );

    return res.status(200).json({
      summary: summary[0],
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get All Reports Error:", error);
    return res.status(500).json({
      message: "Server error while fetching all reports",
    });
  }
};

// ═════════════════════════════════════════
//  GET REPORT STATS FOR AUTHORITY
//  GET /api/reports/stats
//  Access: Authority (Protected)
//  Used for Chart.js dashboard graphs
// ═════════════════════════════════════════
const getReportStats = async (req, res) => {
  const authorityPincode = req.user.pincode;

  try {
    // ── Overall counts ──
    const [overall] = await db.promise().query(
      `SELECT 
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports
       WHERE pincode = ?`,
      [authorityPincode]
    );

    // ── Monthly breakdown (last 6 months) ──
    const [monthly] = await db.promise().query(
      `SELECT 
          DATE_FORMAT(created_at, '%b %Y') AS month,
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved
       FROM reports
       WHERE pincode = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY MIN(created_at) ASC`,
      [authorityPincode]
    );

    return res.status(200).json({
      pincode: authorityPincode,
      overall: overall[0],
      monthly,
    });
  } catch (error) {
    console.error("Get Report Stats Error:", error);
    return res.status(500).json({
      message: "Server error while fetching report statistics",
    });
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