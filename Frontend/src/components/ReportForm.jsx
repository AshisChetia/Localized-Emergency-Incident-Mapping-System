// ─────────────────────────────────────────
// components/ReportForm.jsx
// ─────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createReport } from "../services/reportService";
import Loader from "./Loader";
import toast from "react-hot-toast";
import {
  MapPin, Camera, FileText, X, Upload, Navigation, AlertCircle, CheckCircle, Image as ImageIcon
} from "lucide-react";
import { colors, fonts } from "../styles/designTokens";

const ReportForm = ({ onSuccess, onClose }) => {
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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const formStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-textPrimary": colors.textPrimary,
    "--c-textSecondary": colors.textSecondary,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  // ═══════════════════════════════════════
  //  IMAGE SELECTION HANDLER
  // ═══════════════════════════════════════
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Only JPEG, PNG and WebP images are allowed" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be smaller than 5MB" }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: null }));
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

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
      (position) => {
        setLocation({
          latitude:  position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy:  Math.round(position.coords.accuracy),
        });
        setLocating(false);
        toast.success("Location captured successfully");
      },
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ═══════════════════════════════════════
  //  FORM VALIDATION & SUBMIT
  // ═══════════════════════════════════════
  const validate = () => {
    const newErrors = {};
    if (!description.trim()) newErrors.description = "Please describe the incident";
    else if (description.trim().length < 20) newErrors.description = "Description must be at least 20 characters";
    else if (description.trim().length > 500) newErrors.description = "Description cannot exceed 500 characters";

    if (!imageFile) newErrors.image = "Please capture or upload an incident photo";
    if (!location) newErrors.location = "Please capture your current GPS location";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("latitude",    location.latitude);
      formData.append("longitude",   location.longitude);
      formData.append("image",       imageFile);

      await createReport(formData);
      toast.success("Report submitted successfully!");

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Custom Animations for the Modal ── */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { 
          from { opacity: 0; transform: translateY(20px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-modal-backdrop { animation: modalFadeIn 0.3s ease-out forwards; }
        .animate-modal-card { animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />

      {/* ── Modal Backdrop ── */}
      <div 
        style={formStyle} 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--c-charcoal)]/40 backdrop-blur-sm p-4 sm:p-6 animate-modal-backdrop"
      >
        {/* ── Modal Container ── */}
        <div className="relative w-full max-w-lg bg-[var(--c-offWhite)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-modal-card">
          
          {/* ── Header (Sticky) ── */}
          <div className="bg-white px-6 py-5 border-b border-[var(--c-borderLight)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--c-sage)] rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[var(--c-oliveDark)]" />
              </div>
              <div>
                <h2 className="text-[var(--c-charcoal)] font-black text-xl" style={{ fontFamily: fonts.heading }}>
                  Report an Issue
                </h2>
                <p className="text-[var(--c-textSecondary)] text-xs font-medium">
                  Help improve your neighborhood
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* ── Scrollable Body ── */}
          <div className="overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
            <form id="report-form" onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--c-charcoal)]">
                  <FileText className="w-4 h-4 text-[var(--c-olive)]" />
                  Incident Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                  }}
                  placeholder="Describe the issue clearly (e.g., Deep pothole near the main intersection)..."
                  rows={4}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-[var(--c-textPrimary)] text-sm resize-none focus:outline-none focus:ring-1 transition-colors ${
                    errors.description ? "border-red-400 focus:ring-red-400" : "border-[var(--c-borderLight)] focus:ring-[var(--c-olive)] focus:border-[var(--c-olive)]"
                  }`}
                />
                <div className="flex items-center justify-between">
                  {errors.description ? <p className="text-red-500 text-xs font-medium">{errors.description}</p> : <span />}
                  <span className={`text-xs font-medium ${description.length > 450 ? "text-red-500" : "text-gray-400"}`}>
                    {description.length}/500
                  </span>
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--c-charcoal)]">
                  <Camera className="w-4 h-4 text-[var(--c-olive)]" />
                  Incident Photo
                </label>

                {imagePreview ? (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--c-borderLight)] group shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-[var(--c-charcoal)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-white/90 text-red-600 font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm hover:scale-105 transition-transform"
                      >
                        <X className="w-4 h-4" /> Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                      errors.image ? "border-red-400 bg-red-50" : "border-[var(--c-olive)]/30 bg-white hover:bg-[var(--c-sage)]/20 hover:border-[var(--c-olive)]"
                    }`}
                  >
                    <div className="w-10 h-10 bg-[var(--c-sage)]/50 rounded-full flex items-center justify-center">
                      <ImageIcon className={`w-5 h-5 ${errors.image ? "text-red-500" : "text-[var(--c-oliveDark)]"}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${errors.image ? "text-red-500" : "text-[var(--c-charcoal)]"}`}>
                        Tap to upload a photo
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">JPEG, PNG, WebP • Max 5MB</p>
                    </div>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                {errors.image && <p className="text-red-500 text-xs font-medium">{errors.image}</p>}
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--c-charcoal)]">
                  <MapPin className="w-4 h-4 text-[var(--c-olive)]" />
                  Exact Location
                </label>

                {location ? (
                  <div className="bg-[var(--c-sage)]/40 border border-[var(--c-olive)]/20 rounded-xl px-4 py-3 flex items-start justify-between gap-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[var(--c-oliveDark)] shrink-0" />
                      <div>
                        <p className="text-[var(--c-oliveDark)] text-sm font-bold">Location Secured</p>
                        <p className="text-[var(--c-textSecondary)] text-xs mt-0.5 font-mono">
                          {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={handleGetLocation} disabled={locating} className="text-xs font-bold text-[var(--c-oliveDark)] hover:underline shrink-0">
                      Recapture
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className={`w-full flex items-center justify-center gap-2 border rounded-xl px-4 py-3.5 text-sm font-bold transition-colors shadow-sm ${
                      errors.location ? "border-red-400 text-red-600 bg-red-50" : "border-[var(--c-borderLight)] bg-white text-[var(--c-charcoal)] hover:bg-[var(--c-sage)] hover:text-[var(--c-oliveDark)]"
                    }`}
                  >
                    {locating ? (
                      <><span className="w-4 h-4 border-2 border-[var(--c-olive)]/30 border-t-[var(--c-olive)] rounded-full animate-spin" /> Pinpointing GPS...</>
                    ) : (
                      <><Navigation className="w-4 h-4" /> Fetch My Coordinates</>
                    )}
                  </button>
                )}
                {errors.location && <p className="text-red-500 text-xs font-medium">{errors.location}</p>}
              </div>

            </form>
          </div>

          {/* ── Footer Actions (Sticky) ── */}
          <div className="bg-white px-6 py-5 border-t border-[var(--c-borderLight)] shrink-0 flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 bg-white hover:bg-gray-50 text-[var(--c-charcoal)] text-sm font-bold px-4 py-3.5 rounded-xl border border-[var(--c-borderLight)] shadow-sm transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              form="report-form"
              disabled={submitting}
              className="flex-[2] bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] text-white text-sm font-bold px-4 py-3.5 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
            >
              {submitting ? (
                <Loader variant="inline" text="Routing Report..." />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Submit Report
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ReportForm;  