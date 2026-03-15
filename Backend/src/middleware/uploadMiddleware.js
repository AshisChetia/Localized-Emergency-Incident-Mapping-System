// ─────────────────────────────────────────
// middleware/uploadMiddleware.js
// Handles image uploads using Multer with
// memory storage so the file buffer can be
// streamed directly to Cloudinary without
// saving anything to the local disk
// ─────────────────────────────────────────

import multer from "multer";

// ═════════════════════════════════════════
//  STORAGE CONFIGURATION
//  memoryStorage keeps the file in RAM as
//  a Buffer (req.file.buffer) so we can
//  pipe it straight to Cloudinary's
//  upload_stream without a temp file
// ═════════════════════════════════════════
const storage = multer.memoryStorage();

// ═════════════════════════════════════════
//  FILE TYPE FILTER
//  Only allow image files that are safe
//  and commonly supported for incident
//  photo reporting
// ═════════════════════════════════════════
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",   // iPhone camera format
    "image/heif",   // iPhone camera format
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed."
      ),
      false // Reject file
    );
  }
};

// ═════════════════════════════════════════
//  MULTER INSTANCE
//  Combines storage + fileFilter + size
//  limit into one configured instance
// ═════════════════════════════════════════
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 1,                   // Only 1 file per request
  },
});

// ═════════════════════════════════════════
//  SINGLE IMAGE UPLOAD MIDDLEWARE
//  Use this on any route that accepts
//  one incident photo
//  Field name must be "image" in the
//  multipart/form-data request body
// ═════════════════════════════════════════
export const uploadSingle = upload.single("image");

// ═════════════════════════════════════════
//  MULTER ERROR HANDLER MIDDLEWARE
//  Must be used AFTER uploadSingle in the
//  route chain to catch Multer-specific
//  errors cleanly and return proper JSON
//  instead of crashing the server
//
//  Usage in routes:
//  router.post("/", uploadSingle, handleUploadError, controller)
// ═════════════════════════════════════════
export const handleUploadError = (err, req, res, next) => {
  // ── Multer-specific errors ──
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          message: "Image is too large. Maximum allowed size is 5MB.",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          message: "Too many files. Only 1 image is allowed per report.",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          message:
            'Unexpected field name. Use "image" as the field name for the photo.',
        });

      default:
        return res.status(400).json({
          message: `Upload error: ${err.message}`,
        });
    }
  }

  // ── Custom fileFilter error (wrong file type) ──
  if (err) {
    return res.status(400).json({
      message: err.message,
    });
  }

  next();
};

// ═════════════════════════════════════════
//  FILE PRESENCE VALIDATOR MIDDLEWARE
//  Use this AFTER uploadSingle to ensure
//  the user actually attached an image
//  before the request reaches the
//  controller. Keeps controller clean.
// ═════════════════════════════════════════
export const requireImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Incident image is required. Please capture or upload a photo.",
    });
  }
  next();
};

// ═════════════════════════════════════════
//  FILE INFO LOGGER MIDDLEWARE (DEV ONLY)
//  Logs uploaded file details to console
//  during development. Remove or disable
//  in production.
// ═════════════════════════════════════════
export const logFileInfo = (req, res, next) => {
  if (process.env.NODE_ENV === "development" && req.file) {
    console.log("────────────────────────────────");
    console.log("📁 File Received:");
    console.log(`   Name     : ${req.file.originalname}`);
    console.log(`   Type     : ${req.file.mimetype}`);
    console.log(`   Size     : ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`   Encoding : ${req.file.encoding}`);
    console.log("────────────────────────────────");
  }
  next();
};

// ═════════════════════════════════════════
//  DEFAULT EXPORT
//  Export the raw multer instance so other
//  files can call upload.single() or
//  upload.fields() if needed in future
// ═════════════════════════════════════════
export default upload;