// ─────────────────────────────────────────
// pages/auth/AuthorityRegister.jsx
// Municipal Chief Registration
// ─────────────────────────────────────────

import { useState } from "react";
import { Link } from "react-router-dom";
import { registerAuthority } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Building2, Mail, Lock, Eye, EyeOff, User, Hash, CheckCircle, ArrowRight, Navigation, ExternalLink } from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";

// ── INDIA GEOFENCE ──
const INDIA_BOUNDS = { minLat: 6.0, maxLat: 37.0, minLng: 68.0, maxLng: 98.0 };
const isInsideIndia = (lat, lng) =>
  lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
  lng >= INDIA_BOUNDS.minLng && lng <= INDIA_BOUNDS.maxLng;

const AuthorityRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    pincode: "",
  });
  const [officeLocation, setOfficeLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const authStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode" && (!/^\d*$/.test(value) || value.length > 6)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    if (!formData.password) newErrors.password = "Required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Must match";
    if (formData.pincode.length !== 6) newErrors.pincode = "6 digits required";
    if (!officeLocation) newErrors.office_location = "Please capture your office GPS location";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await registerAuthority({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        pincode: formData.pincode,
        office_location: `${officeLocation.latitude},${officeLocation.longitude}`,
      });
      setIsSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white border border-[var(--c-borderLight)] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[var(--c-charcoal)] focus:ring-1 focus:ring-[var(--c-charcoal)] transition-all";

  if (isSuccess) {
    return (
      <div style={authStyle} className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-offWhite)]">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl shadow-2xl p-10 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#FFF8E6] rounded-full flex items-center justify-center mb-2 border border-[#F2DCA2]">
            <CheckCircle className="w-8 h-8 text-[var(--c-accentGold)]" />
          </div>
          <h2 className="text-2xl font-black text-[var(--c-charcoal)]" style={{ fontFamily: fonts.heading }}>Request Submitted</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your registration request has been sent to the Super Admin. You will be able to log in once your official account is verified and approved.
          </p>
          <Link to="/authority/login" className="mt-4 w-full flex justify-center items-center gap-2 bg-[var(--c-charcoal)] text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors shadow-md">
            Return to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={authStyle} className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-offWhite)]">
      <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-[500px] bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl shadow-2xl p-8 flex flex-col gap-5 my-8">
        
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 bg-[var(--c-accentGold)] rounded-full flex items-center justify-center shadow-lg mb-2 border-4 border-[var(--c-offWhite)]">
            <Building2 className="w-8 h-8 text-[var(--c-charcoal)]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
            Authority Registration
          </h1>
          <p className="text-sm font-medium text-[var(--c-textSecondary)]">Request access for your local municipality</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Authority / Official Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Sivasagar Municipal Dept" className={inputClass} />
            </div>
            {errors.name && <p className="text-red-500 text-[10px]">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Official Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="official@municipality.gov" className={inputClass} />
            </div>
            {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Jurisdiction Pincode</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="785640" maxLength={6} className={inputClass} />
            </div>
            {errors.pincode && <p className="text-red-500 text-[10px]">{errors.pincode}</p>}
          </div>

          {/* ── GPS OFFICE LOCATION CAPTURE ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Office Location (GPS)</label>
            {officeLocation ? (
              <div className="bg-[var(--c-sage)]/40 border border-[var(--c-olive)]/20 rounded-xl px-4 py-3 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--c-olive)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[var(--c-olive)] text-sm font-bold">Location Captured</p>
                      <p className="text-gray-500 text-xs mt-0.5 font-mono">
                        Lat: {officeLocation.latitude.toFixed(6)} • Lng: {officeLocation.longitude.toFixed(6)}
                        {officeLocation.accuracy && <span className="text-gray-400"> • ±{Math.round(officeLocation.accuracy)}m</span>}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={handleCaptureLocation} disabled={locating} className="text-xs font-bold text-[var(--c-olive)] hover:underline shrink-0">
                    {locating ? "Fetching..." : "Recapture"}
                  </button>
                </div>
                <a
                  href={`https://maps.google.com/?q=${officeLocation.latitude},${officeLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--c-olive)] bg-white/80 border border-[var(--c-olive)]/20 rounded-lg py-1.5 hover:bg-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Verify on Google Maps
                </a>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCaptureLocation}
                disabled={locating}
                className={`w-full flex items-center justify-center gap-2 border rounded-xl px-4 py-3.5 text-sm font-bold transition-colors shadow-sm ${
                  errors.office_location
                    ? "border-red-400 text-red-600 bg-red-50"
                    : "border-[var(--c-borderLight)] bg-white text-[var(--c-charcoal)] hover:bg-[var(--c-sage)] hover:text-[var(--c-olive)]"
                }`}
              >
                {locating ? (
                  <><span className="w-4 h-4 border-2 border-[var(--c-olive)]/30 border-t-[var(--c-olive)] rounded-full animate-spin" /> Pinpointing GPS...</>
                ) : (
                  <><Navigation className="w-4 h-4" /> Capture Office Location</>
                )}
              </button>
            )}
            <p className="text-gray-400 text-[9px]">Stand at or near your office and capture GPS. Users will use this to navigate to your office.</p>
            {errors.office_location && <p className="text-red-500 text-[10px]">{errors.office_location}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 chars" className={inputClass} />
              </div>
              {errors.password && <p className="text-red-500 text-[10px]">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter" className={inputClass} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-[10px]">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full mt-2 flex items-center justify-center gap-2 bg-[var(--c-charcoal)] hover:bg-black text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            {submitting ? <Loader variant="inline" text="Submitting Request..." /> : <>Submit Request <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="flex flex-col gap-4 text-center mt-2">
          <p className="text-sm text-[var(--c-textSecondary)]">
            Already have an approved account? <Link to="/authority/login" className="text-[var(--c-accentGold)] font-black hover:underline">Sign in here</Link>
          </p>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[var(--c-borderLight)]"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Other Portals</span>
            <div className="flex-grow border-t border-[var(--c-borderLight)]"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Link to="/register" className="text-xs font-bold px-4 py-2 rounded-lg bg-[var(--c-olive)]/10 text-[var(--c-oliveDark)] hover:bg-[var(--c-olive)]/20 transition-colors w-full sm:w-auto">
              Citizen Registration
            </Link>
            <Link to="/login" className="text-xs font-bold px-4 py-2 rounded-lg bg-[var(--c-sage)]/20 text-[var(--c-oliveDark)] hover:bg-[var(--c-sage)]/40 transition-colors w-full sm:w-auto">
              Citizen Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthorityRegister;
