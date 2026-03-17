// ─────────────────────────────────────────
// pages/auth/AdminLogin.jsx
// ─────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginAdmin } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle } from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/admin/dashboard";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const response = await loginAdmin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      const { token, user } = response.data;
      login(token, user);
      toast.success("Super Admin access granted.");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid admin credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={authStyle} className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-offWhite)]">
      {/* Animated Blobs - Darker/Subtler for Admin */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--c-charcoal)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl shadow-2xl p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--c-accentGold)] bg-[var(--c-accentGold)]/10 px-3 py-1 rounded-full mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Restricted Access
          </div>
          <div className="w-12 h-12 bg-[var(--c-charcoal)] rounded-2xl flex items-center justify-center shadow-md mb-1">
            <ShieldCheck className="w-6 h-6 text-[var(--c-offWhite)]" />
          </div>
          <h1 className="text-2xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
            Super Admin
          </h1>
          <p className="text-sm text-gray-500">System gatekeeper login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@system.local"
                className="w-full bg-white border border-[var(--c-borderLight)] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--c-charcoal)] focus:ring-1 focus:ring-[var(--c-charcoal)] transition-all"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter admin password"
                className="w-full bg-white border border-[var(--c-borderLight)] rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-[var(--c-charcoal)] focus:ring-1 focus:ring-[var(--c-charcoal)] transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="w-full mt-2 flex items-center justify-center gap-2 bg-[var(--c-charcoal)] hover:bg-black text-[var(--c-offWhite)] font-bold text-sm py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            {submitting ? <Loader variant="inline" text="Verifying..." /> : <>Authorize Access <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Footer Links */}
        <div className="flex flex-col gap-3 text-center mt-2">
          <div className="h-px w-full bg-[var(--c-borderLight)] my-1"></div>
          <p className="text-xs text-gray-400">
            Not a system administrator? <Link to="/login" className="text-[var(--c-olive)] font-bold hover:underline">Return to Citizen Portal</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;