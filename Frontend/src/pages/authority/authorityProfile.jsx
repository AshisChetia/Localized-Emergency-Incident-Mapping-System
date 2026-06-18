// ─────────────────────────────────────────
// pages/authority/AuthorityProfile.jsx
// ─────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { colors, fonts } from "../../styles/designTokens";
import { 
  Building2, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  User, 
  Award,
  CheckCircle,
  Edit3,
  ExternalLink,
  Save,
  X,
  Navigation
} from "lucide-react";

// ── INDIA GEOFENCE ──
const INDIA_BOUNDS = { minLat: 6.0, maxLat: 37.0, minLng: 68.0, maxLng: 98.0 };
const isInsideIndia = (lat, lng) =>
  lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
  lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng;

const AuthorityProfile = () => {
  const { user, refreshUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Edit State
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  
  // Location State
  const [officeLocation, setOfficeLocation] = useState(null); // { latitude, longitude, accuracy }
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});

  // Has existing location?
  const hasExistingLocation = Boolean(user?.office_location && user.office_location.includes(","));
  const existingMapsUrl = hasExistingLocation
    ? `https://maps.google.com/?q=${user.office_location}`
    : null;

  const currentMapsUrl = officeLocation
    ? `https://maps.google.com/?q=${officeLocation.latitude},${officeLocation.longitude}`
    : existingMapsUrl;

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setOfficeLocation(null);
    setLocating(true);
    setErrors((prev) => ({ ...prev, office_location: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (!isInsideIndia(lat, lng)) {
          setLocating(false);
          setErrors((prev) => ({
            ...prev,
            office_location: `GPS returned coordinates outside India (${lat.toFixed(4)}, ${lng.toFixed(4)}). Disable VPN and retry.`,
          }));
          toast.error("Location rejected! Coordinates outside India.");
          return;
        }
        setOfficeLocation({ latitude: lat, longitude: lng, accuracy: position.coords.accuracy });
        setLocating(false);
        toast.success("Office Location Captured!");
      },
      (error) => {
        setLocating(false);
        let errorMsg = "Failed to get location.";
        if (error.code === 1) errorMsg = "Location access denied. Please allow it in browser settings.";
        if (error.code === 2) errorMsg = "Location unavailable. Turn on GPS/Wi-Fi.";
        if (error.code === 3) errorMsg = "Location request timed out.";
        setErrors((prev) => ({ ...prev, office_location: errorMsg }));
        toast.error(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!editData.name.trim() || editData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(editData.email.trim())) newErrors.email = "Invalid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    try {
      const updates = {
        name: editData.name.trim(),
        email: editData.email.trim().toLowerCase(),
      };
      
      if (officeLocation) {
        updates.office_location = `${officeLocation.latitude},${officeLocation.longitude}`;
      }

      await api.patch("/authority/profile", updates);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      if (refreshUser) await refreshUser();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setOfficeLocation(null);
    setErrors({});
  };

  const profileStyle = {
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

  const inputClass = "w-full bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--c-charcoal)] focus:ring-1 focus:ring-[var(--c-charcoal)] transition-all";

  return (
    <div style={profileStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] pb-16 relative overflow-hidden">
      
      {/* ── BACKGROUND BLOBS ── */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 relative z-10">
        
        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight mb-2" style={{ fontFamily: fonts.heading }}>
            Official Profile
          </h1>
          <p className="text-[var(--c-textSecondary)] text-sm font-medium">
            Manage your municipal account details and jurisdiction info.
          </p>
        </div>

        {/* ── MAIN PROFILE CARD ── */}
        <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl shadow-xl shadow-[var(--c-charcoal)]/5 overflow-hidden">
          
          {/* Top Banner Gradient */}
          <div className="h-32 w-full bg-gradient-to-r from-[var(--c-oliveDark)] via-[var(--c-olive)] to-[#9CA684]"></div>
          
          <div className="px-6 sm:px-10 pb-10">
            
            {/* Avatar & Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 -mt-12 sm:-mt-16 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                {/* Large Avatar */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl p-2 shadow-lg border border-[var(--c-borderLight)] shrink-0">
                  <div className="w-full h-full bg-[#F4F6F0] rounded-2xl flex items-center justify-center">
                    <Building2 className="w-10 h-10 sm:w-14 sm:h-14 text-[var(--c-olive)]" />
                  </div>
                </div>
                
                {/* Name & Badge */}
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
                      {user?.name || "Official Account"}
                    </h2>
                    <ShieldCheck className="w-6 h-6 text-[var(--c-accentGold)] mt-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--c-sage)]/50 border border-[var(--c-olive)]/20 text-[var(--c-oliveDark)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified Authority
                    </span>
                  </div>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 bg-[var(--c-charcoal)] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[var(--c-oliveDark)] transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              /* ── EDIT PROFILE FORM ── */
              <div className="mt-8 bg-white border border-[var(--c-borderLight)] rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--c-borderLight)]">
                  <div>
                    <h3 className="text-xl font-black text-[var(--c-charcoal)]" style={{ fontFamily: fonts.heading }}>Edit Official Details</h3>
                    <p className="text-[var(--c-textSecondary)] text-xs font-medium mt-1">Update your authority name, email, and GPS location. Pincode cannot be changed.</p>
                  </div>
                  <button type="button" onClick={cancelEdit} className="p-2 rounded-xl text-[var(--c-textSecondary)] hover:text-red-600 hover:bg-red-50 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Authority Name</label>
                      <input type="text" name="name" value={editData.name} onChange={handleEditChange} className={inputClass} placeholder="Municipality Name" />
                      {errors.name && <p className="text-red-500 text-[10px]">{errors.name}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Official Email</label>
                      <input type="email" name="email" value={editData.email} onChange={handleEditChange} className={inputClass} placeholder="official@domain.gov" />
                      {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Office Location (GPS)</label>
                    {officeLocation || hasExistingLocation ? (
                      <div className="bg-[var(--c-sage)]/40 border border-[var(--c-olive)]/20 rounded-xl px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[var(--c-olive)] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[var(--c-olive)] text-sm font-bold">{officeLocation ? "New Location Captured" : "Existing Location Active"}</p>
                            {officeLocation ? (
                              <p className="text-gray-500 text-xs mt-0.5 font-mono">
                                Lat: {officeLocation.latitude.toFixed(6)} • Lng: {officeLocation.longitude.toFixed(6)}
                              </p>
                            ) : (
                              <p className="text-gray-500 text-xs mt-0.5 font-mono truncate max-w-[200px] sm:max-w-[300px]">
                                {user.office_location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <button type="button" onClick={handleCaptureLocation} disabled={locating} className="text-xs font-bold bg-white border border-[var(--c-borderLight)] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                            {locating ? "Fetching..." : "Recapture GPS"}
                          </button>
                          <a href={currentMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                            <ExternalLink className="w-3 h-3" /> Maps
                          </a>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCaptureLocation}
                        disabled={locating}
                        className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-6 text-sm font-bold transition-colors ${
                          errors.office_location ? "border-red-400 text-red-600 bg-red-50" : "border-[var(--c-borderLight)] bg-white text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/20 hover:border-[var(--c-olive)]"
                        }`}
                      >
                        {locating ? (
                          <><span className="w-4 h-4 border-2 border-[var(--c-olive)]/30 border-t-[var(--c-olive)] rounded-full animate-spin" /> Pinpointing GPS...</>
                        ) : (
                          <><Navigation className="w-4 h-4" /> Capture GPS Location</>
                        )}
                      </button>
                    )}
                    {errors.office_location && <p className="text-red-500 text-[10px]">{errors.office_location}</p>}
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-[var(--c-borderLight)]">
                    <button type="button" onClick={cancelEdit} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-[var(--c-charcoal)] bg-white border border-[var(--c-borderLight)] hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] transition-colors shadow-md disabled:opacity-70">
                      {saving ? <Loader variant="inline" text="Saving..." /> : <><Save className="w-4 h-4" /> Save Profile</>}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── DETAILS GRID ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Jurisdiction */}
                <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[var(--c-olive)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-0.5">Jurisdiction Zone</p>
                    <p className="text-[var(--c-charcoal)] font-black text-lg tracking-widest">{user?.pincode || "N/A"}</p>
                  </div>
                </div>

                {/* Official Email */}
                <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-0.5">Official Email</p>
                    <p className="text-[var(--c-charcoal)] font-medium text-base truncate">{user?.email || "N/A"}</p>
                  </div>
                </div>

                {/* Office Location */}
                <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1 sm:col-span-2">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <Navigation className="w-6 h-6 text-[var(--c-olive)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-0.5">Office GPS Coordinates</p>
                    {existingMapsUrl ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                        <p className="text-[var(--c-charcoal)] font-mono text-sm truncate">{user?.office_location}</p>
                        <a href={existingMapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--c-olive)] hover:underline whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-[var(--c-borderLight)]">
                          <ExternalLink className="w-3.5 h-3.5" /> View on Maps
                        </a>
                      </div>
                    ) : (
                      <p className="text-[var(--c-textSecondary)] font-medium text-sm mt-1">Not captured yet</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Security Notice Section */}
            <div className="mt-8 bg-[#FFF8E6] border border-[#F2DCA2] rounded-2xl p-5 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[var(--c-accentGold)] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[var(--c-charcoal)] font-bold text-sm mb-1">Secure Local Access</h4>
                <p className="text-[var(--c-textSecondary)] text-xs leading-relaxed font-medium">
                  Your account is securely bound to Pincode <span className="font-bold text-[var(--c-charcoal)]">{user?.pincode}</span>. 
                  You only have authorization to view, manage, and resolve incident reports submitted by citizens within this specific geographic zone.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityProfile;
