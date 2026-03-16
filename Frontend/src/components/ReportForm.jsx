// ─────────────────────────────────────────
// components/ReportForm.jsx
// Form for citizens to submit new incident
// reports with:
// - Description textarea
// - Image upload with preview
// - Live GPS location capture
// - Submit with loading state
//
// Used in:
// - UserDashboard.jsx (as modal or section)
// ─────────────────────────────────────────

import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { createReport } from "../services/reportService";
import Loader from "./Loader";
import toast from "react-hot-toast";
import {
  MapPin,
  Camera,
  FileText,
  X,
  Upload,
  Navigation,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const ReportForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();

  // ── Form State ──────────────────────────
  const [description, setDescription] = useState("");
  const [imageFile,   setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation]       = useState(null);
  const [errors, setErrors]           = useState({});

  // ── Loading States ──────────────────────
  const [locating,    setLocating]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const fileInputRef = useRef(null);

  // ═══════════════════════════════════════
  //  IMAGE SELECTION HANDLER
  // ═══════════════════════════════════════
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ── Validate file type ───────────────
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPEG, PNG and WebP images are allowed",
      }));
      return;
    }

    // ── Validate file size (5MB max) ─────
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image must be smaller than 5MB",
      }));
      return;
    }

    // ── Clear old error, set file ────────
    setErrors((prev) => ({ ...prev, image: null }));
    setImageFile(file);

    // ── Generate preview URL ─────────────
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Remove selected image ───────────────
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ═══════════════════════════════════════
  //  GPS LOCATION CAPTURE
  // ═══════════════════════════════════════
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setErrors((prev) => ({ ...prev, location: null }));

    navigator.geolocation.getCurrentPosition(
      // ── Success ──────────────────────
      (position) => {
        setLocation({
          latitude:  position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy:  Math.round(position.coords.accuracy),
        });
        setLocating(false);
        toast.success("Location captured successfully");
      },
      // ── Error ────────────────────────
      (error) => {
        setLocating(false);
        const messages = {
          1: "Location access denied. Please allow location permission.",
          2: "Location unavailable. Please try again.",
          3: "Location request timed out. Please try again.",
        };
        const msg = messages[error.code] || "Failed to get location";
        setErrors((prev) => ({ ...prev, location: msg }));
        toast.error(msg);
      },
      {
        enableHighAccuracy: true,
        timeout:            10000,
        maximumAge:         0,
      }
    );
  };

  // ═══════════════════════════════════════
  //  FORM VALIDATION
  // ═══════════════════════════════════════
  const validate = () => {
    const newErrors = {};

    if (!description.trim()) {
      newErrors.description = "Please describe the incident";
    } else if (description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (description.trim().length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    if (!imageFile) {
      newErrors.image = "Please capture or upload an incident photo";
    }

    if (!location) {
      newErrors.location = "Please capture your current GPS location";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ═══════════════════════════════════════
  //  FORM SUBMIT HANDLER
  // ═══════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // ── Build FormData for multipart ───
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("latitude",    location.latitude);
      formData.append("longitude",   location.longitude);
      formData.append("image",       imageFile);

      await createReport(formData);

      toast.success("Report submitted successfully!");

      // ── Reset form ─────────────────────
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      setLocation(null);
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = "";

      // ── Notify parent to refresh list ──
      if (onSuccess) onSuccess();

    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to submit report. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full">

      {/* ── Form Header ──────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg leading-tight">
              Report an Incident
            </h2>
            <p className="text-gray-500 text-xs">
              All fields are required
            </p>
          </div>
        </div>

        {/* Close button (if used in modal) */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Description Field ─────────── */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <FileText className="w-4 h-4 text-blue-400" />
            Incident Description
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description)
                setErrors((prev) => ({ ...prev, description: null }));
            }}
            placeholder="Describe the incident clearly. Include what happened, severity and any other relevant details..."
            rows={4}
            className={`
              w-full bg-gray-800 border rounded-xl px-4 py-3 text-white
              text-sm placeholder-gray-600 resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              transition-colors duration-200
              ${errors.description
                ? "border-red-500/60 focus:ring-red-500/30"
                : "border-gray-700 hover:border-gray-600"
              }
            `}
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <p className="text-red-400 text-xs">{errors.description}</p>
            ) : (
              <span />
            )}
            <span
              className={`text-xs ml-auto ${
                description.length > 450
                  ? "text-red-400"
                  : "text-gray-600"
              }`}
            >
              {description.length}/500
            </span>
          </div>
        </div>

        {/* ── Image Upload Field ────────── */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Camera className="w-4 h-4 text-blue-400" />
            Incident Photo
          </label>

          {/* Image Preview */}
          {imagePreview ? (
            <div className="relative w-full rounded-xl overflow-hidden border border-gray-700 group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              {/* Remove overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove Photo
                </button>
              </div>

              {/* File name badge */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-400" />
                {imageFile?.name}
              </div>
            </div>
          ) : (
            /* Upload Drop Zone */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`
                w-full h-36 border-2 border-dashed rounded-xl
                flex flex-col items-center justify-center gap-2
                transition-colors duration-200 cursor-pointer
                ${errors.image
                  ? "border-red-500/60 bg-red-500/5"
                  : "border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5 bg-gray-800/50"
                }
              `}
            >
              <Upload
                className={`w-7 h-7 ${
                  errors.image ? "text-red-400" : "text-gray-500"
                }`}
              />
              <div className="text-center">
                <p
                  className={`text-sm font-medium ${
                    errors.image ? "text-red-400" : "text-gray-400"
                  }`}
                >
                  Click to upload photo
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  JPEG, PNG, WebP • Max 5MB
                </p>
              </div>
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />

          {errors.image && (
            <p className="text-red-400 text-xs">{errors.image}</p>
          )}
        </div>

        {/* ── GPS Location Field ────────── */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <MapPin className="w-4 h-4 text-blue-400" />
            Incident Location
          </label>

          {location ? (
            /* Location captured success card */
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-green-400 text-sm font-medium">
                    Location Captured
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Lat: {location.latitude.toFixed(6)}&nbsp;&nbsp;
                    Lng: {location.longitude.toFixed(6)}
                  </p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Accuracy: ±{location.accuracy}m
                  </p>
                </div>
              </div>
              {/* Re-capture button */}
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="text-xs text-gray-400 hover:text-white transition-colors shrink-0 underline underline-offset-2"
              >
                Recapture
              </button>
            </div>
          ) : (
            /* Capture location button */
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className={`
                w-full flex items-center justify-center gap-2
                border rounded-xl px-4 py-3 text-sm font-medium
                transition-colors duration-200
                ${errors.location
                  ? "border-red-500/60 text-red-400 bg-red-500/5 hover:bg-red-500/10"
                  : "border-gray-700 text-gray-300 bg-gray-800 hover:border-blue-500/50 hover:text-blue-400"
                }
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
            >
              {locating ? (
                <>
                  <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  Getting your location...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Capture Current Location
                </>
              )}
            </button>
          )}

          {errors.location && (
            <p className="text-red-400 text-xs">{errors.location}</p>
          )}
        </div>

        {/* ── Form Actions ──────────────── */}
        <div className="flex items-center gap-3 pt-2">
          {/* Cancel button (if used in modal) */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-3 rounded-xl border border-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader variant="inline" text="Submitting Report..." />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Submit Report
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;