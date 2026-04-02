// ─────────────────────────────────────────
// pages/auth/AuthorityRegister.jsx
// Municipal Chief Registration
// Simplified - Chief registers for entire zone
// ─────────────────────────────────────────

import { useState } from "react";
import { Link } from "react-router-dom";
import { registerAuthority } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Building2, Mail, Lock, Eye, EyeOff, User, Hash, CheckCircle, ArrowRight } from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";

const AuthorityRegister = () => {
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    pincode: "", 
  });
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

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    if (!formData.password) newErrors.password = "Required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Must match";
    if (formData.pincode.length !== 6) newErrors.pincode = "6 digits required";
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

  // ── SUCCESS STATE ──────────────────────────────────────
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

  // ── REGISTRATION FORM ──────────────────────────────────
  return (
    <div style={authStyle} className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-offWhite)]">
      <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-[500px] bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl shadow-2xl p-8 flex flex-col gap-5 my-8">
        
        <div className="flex flex-col items-center text-center gap-1">
          <div className="w-10 h-10 bg-[var(--c-charcoal)] rounded-xl flex items-center justify-center shadow-md mb-2">
            <Building2 className="w-5 h-5 text-[var(--c-accentGold)]" />
          </div>
          <h1 className="text-2xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
            Official Registration
          </h1>
          <p className="text-sm text-gray-500">Request access for your local department.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Authority / Official Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., John Doe or Guwahati Municipality" className={inputClass} />
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
              <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="400001" maxLength={6} className={inputClass} />
            </div>
            {errors.pincode && <p className="text-red-500 text-[10px]">{errors.pincode}</p>}
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

        <div className="flex flex-col gap-3 text-center mt-1">
          <p className="text-sm text-gray-500">
            Already have an approved account? <Link to="/authority/login" className="text-[var(--c-accentGold)] font-bold hover:underline">Sign in here</Link>
          </p>
          <div className="h-px w-full bg-[var(--c-borderLight)] my-1"></div>
          <p className="text-xs text-gray-400">
            Not a local official? <Link to="/register" className="text-[var(--c-olive)] font-bold hover:underline">Go to Citizen Registration</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthorityRegister;