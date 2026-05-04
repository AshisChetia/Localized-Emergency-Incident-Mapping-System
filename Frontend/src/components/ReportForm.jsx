// ─────────────────────────────────────────
// components/ReportForm.jsx
// ─────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createReport } from "../services/reportService";
import Loader from "./Loader";
import toast from "react-hot-toast";
import {
  MapPin, Camera, FileText, X, Upload, Navigation, AlertCircle, CheckCircle, Image as ImageIcon, Building2, ChevronDown
} from "lucide-react";
import { colors, fonts } from "../styles/designTokens";

// ═══════════════════════════════════════
//  INDIA GEOFENCE BOUNDS
// ═══════════════════════════════════════
const INDIA_BOUNDS = {
  minLat: 6.0,   
  maxLat: 37.0,  
  minLng: 68.0,  
  maxLng: 98.0,  
};

const isInsideIndia = (lat, lng) =>
  lat >= INDIA_BOUNDS.minLat &&
  lat <= INDIA_BOUNDS.maxLat &&
  lng >= INDIA_BOUNDS.minLng &&
  lng <= INDIA_BOUNDS.maxLng;

const ReportForm = ({ onSuccess, onClose }) => {
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [departmentOverride, setDepartmentOverride] = useState("");
  const [showDeptOverride, setShowDeptOverride] = useState(false);

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── NEW: Dual Refs for Camera and Gallery ──
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

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
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocation(null);
    setLocating(true);
    setErrors((prev) => ({ ...prev, location: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (!isInsideIndia(lat, lng)) {
          setLocating(false);
          setErrors((prev) => ({
            ...prev,
            location: `GPS returned coordinates outside India (${lat.toFixed(4)}, ${lng.toFixed(4)}). Please disable any VPN, turn on your device's location/GPS, and try again.`,
          }));
          toast.error("Location rejected! Coordinates are outside India. Disable VPN and retry.");
          return;
        }

        setLocation({
          latitude: lat,
          longitude: lng,
          accuracy: position.coords.accuracy,
        });
        setLocating(false);
        toast.success("Location Captured Successfully!");
      },
      (error) => {
        console.error("GPS Error:", error);
        setLocating(false);
        let errorMsg = "Failed to get location.";
        if (error.code === 1) errorMsg = "Location access denied. Please allow it in your browser settings.";
        if (error.code === 2) errorMsg = "Location unavailable. Please turn on GPS/Wi-Fi on your device and ensure no VPN is active.";
        if (error.code === 3) errorMsg = "Location request timed out. Please try again.";
        setErrors((prev) => ({ ...prev, location: errorMsg }));
        toast.error(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const validate = () => {
    const newErrors = {};
    
    if (!description.trim()) newErrors.description = "Please describe the incident";
    else if (description.trim().length < 20) newErrors.description = "Description must be at least 20 characters";
    else if (description.trim().length > 500) newErrors.description = "Description cannot exceed 500 characters";

    if (!imageFile) newErrors.image = "Please capture or upload an incident photo";
    if (!location) newErrors.location = "Please capture your exact GPS location";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!validate()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    const loadingToastId = toast.loading("Uploading image & routing report...");

    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("image", imageFile);

      // If user explicitly selected a department override, include it
      if (departmentOverride) {
        formData.append("department", departmentOverride);
      }

      await createReport(formData);

      toast.dismiss(loadingToastId);
      toast.success("Report submitted successfully!");

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error(error?.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { 
          from { opacity: 0; transform: translateY(20px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-modal-backdrop { animation: modalFadeIn 0.3s ease-out forwards; }
        .animate-modal-card { animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div style={formStyle} className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--c-charcoal)]/40 backdrop-blur-sm p-4 sm:p-6 animate-modal-backdrop">
        <div className="relative w-full max-w-lg bg-[var(--c-offWhite)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-modal-card">

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
              <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
            <form id="report-form" onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">

              {/* 🤖 AI Routing Badge */}
              <div className="bg-[var(--c-sage)]/30 border border-[var(--c-olive)]/20 rounded-xl p-4 flex items-start gap-3 mt-1 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-[var(--c-olive)]/30 shadow-sm mt-0.5">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--c-charcoal)] mb-0.5 flex items-center gap-1.5">
                    AI Auto-Routing Enabled
                    <span className="relative flex w-2 h-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </h4>
                  <p className="text-xs font-medium text-[var(--c-textSecondary)] leading-relaxed">
                    Our Vision AI will instantly analyze your uploaded image upon submission and automatically assign it to the correct local department (e.g., PWD, Water Supply) without you having to guess.
                  </p>
                </div>
              </div>

              {/* 🏢 Department Override (Collapsible) */}
              <div className="border border-[var(--c-borderLight)] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDeptOverride(!showDeptOverride)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-sm font-bold text-[var(--c-charcoal)]">
                    <Building2 className="w-4 h-4 text-[var(--c-olive)]" />
                    {departmentOverride ? `Override: ${departmentOverride}` : "Override Department (Optional)"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDeptOverride ? "rotate-180" : ""}`} />
                </button>
                {showDeptOverride && (
                  <div className="px-4 pb-4 pt-2 bg-gray-50/50 flex flex-col gap-2">
                    <p className="text-xs text-[var(--c-textSecondary)] mb-1">Select a sub-department to override the AI classification, or leave it to the AI.</p>
                    {[
                      { value: "", label: "🤖 Let AI Decide" },
                      { value: "Public Works Department", label: "🛤️ Roads & Highways (PWD)" },
                      { value: "Water Supply Department", label: "💧 Water Supply" },
                      { value: "Electricity Department", label: "⚡ Electricity Distribution" },
                      { value: "Garbage Management", label: "♻️ Garbage Management" },
                    ].map((dept) => (
                      <button
                        key={dept.value}
                        type="button"
                        onClick={() => {
                          setDepartmentOverride(dept.value);
                          if (!dept.value) setShowDeptOverride(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          departmentOverride === dept.value
                            ? "bg-[var(--c-olive)] text-white shadow-sm"
                            : "bg-white text-[var(--c-textPrimary)] hover:bg-[var(--c-sage)]/30 border border-[var(--c-borderLight)]"
                        }`}
                      >
                        {dept.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--c-charcoal)]">
                  <FileText className="w-4 h-4 text-[var(--c-olive)]" /> Incident Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                  }}
                  placeholder="Describe the issue clearly..."
                  rows={4}
                  className={`w-full bg-white border rounded-xl px-4 py-3 text-[var(--c-textPrimary)] text-sm resize-none focus:outline-none focus:ring-1 transition-colors ${errors.description ? "border-red-400 focus:ring-red-400" : "border-[var(--c-borderLight)] focus:ring-[var(--c-olive)] focus:border-[var(--c-olive)]"
                    }`}
                />
                <div className="flex items-center justify-between">
                  {errors.description ? <p className="text-red-500 text-xs font-medium">{errors.description}</p> : <span />}
                  <span className={`text-xs font-medium ${description.length > 450 ? "text-red-500" : "text-gray-400"}`}>{description.length}/500</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--c-charcoal)]">
                  <Camera className="w-4 h-4 text-[var(--c-olive)]" /> Incident Photo
                </label>
                
                {imagePreview ? (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--c-borderLight)] group shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-[var(--c-charcoal)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={handleRemoveImage} className="bg-white/90 text-red-600 font-bold text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm hover:scale-105 transition-transform">
                        <X className="w-4 h-4" /> Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── NEW DUAL BUTTON UI ──
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => cameraInputRef.current?.click()} 
                      className={`flex-1 h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors ${errors.image ? "border-red-400 bg-red-50" : "border-[var(--c-olive)]/30 bg-white hover:bg-[var(--c-sage)]/20 hover:border-[var(--c-olive)]"}`}
                    >
                      <div className="w-10 h-10 bg-[var(--c-sage)]/50 rounded-full flex items-center justify-center">
                        <Camera className={`w-5 h-5 ${errors.image ? "text-red-500" : "text-[var(--c-oliveDark)]"}`} />
                      </div>
                      <span className={`text-sm font-bold ${errors.image ? "text-red-500" : "text-[var(--c-charcoal)]"}`}>Live Camera</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => galleryInputRef.current?.click()} 
                      className={`flex-1 h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors ${errors.image ? "border-red-400 bg-red-50" : "border-[var(--c-olive)]/30 bg-white hover:bg-[var(--c-sage)]/20 hover:border-[var(--c-olive)]"}`}
                    >
                      <div className="w-10 h-10 bg-[var(--c-sage)]/50 rounded-full flex items-center justify-center">
                        <ImageIcon className={`w-5 h-5 ${errors.image ? "text-red-500" : "text-[var(--c-oliveDark)]"}`} />
                      </div>
                      <span className={`text-sm font-bold ${errors.image ? "text-red-500" : "text-[var(--c-charcoal)]"}`}>Gallery</span>
                    </button>
                  </div>
                )}
                
                {/* ── TWO HIDDEN INPUTS TO FORCE HARDWARE BEHAVIOR ── */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment" 
                  onChange={handleImageChange}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {errors.image && <p className="text-red-500 text-xs font-medium text-center">{errors.image}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-sm font-bold text-[var(--c-charcoal)]">
                  <MapPin className="w-4 h-4 text-[var(--c-olive)]" /> Exact Location
                </label>
                {location ? (
                  <div className="bg-[var(--c-sage)]/40 border border-[var(--c-olive)]/20 rounded-xl px-4 py-3 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[var(--c-oliveDark)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[var(--c-oliveDark)] text-sm font-bold">Location Captured</p>
                          <p className="text-[var(--c-textSecondary)] text-xs mt-0.5 font-mono">
                            Lat: {location.latitude.toFixed(6)} • Lng: {location.longitude.toFixed(6)}
                            {location.accuracy && <span className="text-gray-400"> • ±{Math.round(location.accuracy)}m</span>}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={handleGetLocation} disabled={locating} className="text-xs font-bold text-[var(--c-oliveDark)] hover:underline shrink-0">
                        {locating ? "Fetching..." : "Recapture"}
                      </button>
                    </div>
                    {/* FIXED GOOGLE MAPS LINK */}
                    <a
                      href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--c-olive)] bg-white/80 border border-[var(--c-olive)]/20 rounded-lg py-1.5 hover:bg-white transition-colors"
                    >
                      <Navigation className="w-3 h-3" /> Verify on Google Maps
                    </a>
                  </div>
                ) : (
                  <button type="button" onClick={handleGetLocation} disabled={locating} className={`w-full flex items-center justify-center gap-2 border rounded-xl px-4 py-3.5 text-sm font-bold transition-colors shadow-sm ${errors.location ? "border-red-400 text-red-600 bg-red-50" : "border-[var(--c-borderLight)] bg-white text-[var(--c-charcoal)] hover:bg-[var(--c-sage)] hover:text-[var(--c-oliveDark)]"}`}>
                    {locating ? <><span className="w-4 h-4 border-2 border-[var(--c-olive)]/30 border-t-[var(--c-olive)] rounded-full animate-spin" /> Pinpointing Your GPS...</> : <><Navigation className="w-4 h-4" /> Fetch My Location</>}
                  </button>
                )}
                {errors.location && <p className="text-red-500 text-xs font-medium">{errors.location}</p>}
              </div>

            </form>
          </div>

          <div className="bg-white px-6 py-5 border-t border-[var(--c-borderLight)] shrink-0 flex items-center gap-3">
            {onClose && (
              <button type="button" onClick={onClose} disabled={submitting} className="flex-1 bg-white hover:bg-gray-50 text-[var(--c-charcoal)] text-sm font-bold px-4 py-3.5 rounded-xl border border-[var(--c-borderLight)] shadow-sm transition-colors">
                Cancel
              </button>
            )}
            <button type="button" onClick={handleSubmit} disabled={submitting} className="flex-[2] bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] text-white text-sm font-bold px-4 py-3.5 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5">
              {submitting ? <Loader variant="inline" text="Routing Report..." /> : <span className="flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> Submit Report</span>}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ReportForm;
