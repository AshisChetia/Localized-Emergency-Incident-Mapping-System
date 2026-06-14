// ─────────────────────────────────────────
// pages/auth/AuthorityLogin.jsx
// ─────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginAuthority } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";

const AuthorityLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/authority/dashboard";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [pendingError, setPendingError] = useState("");
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
    if (pendingError) setPendingError(""); 
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
    setPendingError("");
    toast.dismiss();

    try {
      const response = await loginAuthority({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // FIXED: Extract 'authority' instead of 'user' to match the updated backend!
      const { token, authority } = response.data;

      // Log them in using the AuthContext
      login(token, authority);
      
      toast.success(`Welcome to the Authority Portal, ${authority.name}!`);
      
      // Navigate to the dashboard
      navigate(from, { replace: true });

    } catch (error) {
      if (error.response?.status === 403) {
        // Handle the "Pending Super Admin Approval" block specifically
        setPendingError(error.response.data.message);
      } else {
        toast.error(error?.response?.data?.message || "Invalid credentials.");
        setErrors({
          email: "Check your email",
          password: "Check your password",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={authStyle} className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-offWhite)]">
      
      {/* Premium Animated Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl shadow-2xl p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 bg-[var(--c-accentGold)] rounded-full flex items-center justify-center shadow-lg mb-2 border-4 border-[var(--c-offWhite)]">
            <Building2 className="w-8 h-8 text-[var(--c-charcoal)]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
            Authority Portal
          </h1>
          <p className="text-sm font-medium text-[var(--c-textSecondary)]">Official login for municipality administrators</p>
        </div>

        {/* Pending Approval Warning */}
        {pendingError && (
          <div className="bg-[#FFF8E6] border border-[#F2DCA2] rounded-2xl p-4 flex gap-3 text-left shadow-sm animate-pulse-fast">
            <AlertCircle className="w-5 h-5 text-[var(--c-accentGold)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[var(--c-charcoal)] tracking-tight">Approval Pending</h3>
              <p className="text-xs text-[var(--c-textSecondary)] mt-1 leading-relaxed font-medium">{pendingError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Official Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="official@municipality.gov"
                className={`w-full bg-white border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all ${errors.email ? "border-red-400 focus:ring-red-400" : "border-[var(--c-borderLight)] focus:border-[var(--c-charcoal)] focus:ring-[var(--c-charcoal)]"}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full bg-white border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all ${errors.password ? "border-red-400 focus:ring-red-400" : "border-[var(--c-borderLight)] focus:border-[var(--c-charcoal)] focus:ring-[var(--c-charcoal)]"}`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="w-full mt-2 flex items-center justify-center gap-2 bg-[var(--c-charcoal)] hover:bg-black text-[var(--c-offWhite)] font-bold text-sm py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            {submitting ? <Loader variant="inline" text="Authenticating..." /> : <>Access Dashboard <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        {/* Footer Links */}
        <div className="flex flex-col gap-4 text-center mt-2">
          <p className="text-sm text-[var(--c-textSecondary)]">
            Don't have an authority account? <Link to="/authority/register" className="text-[var(--c-accentGold)] font-black hover:underline">Request Access</Link>
          </p>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[var(--c-borderLight)]"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Other Portals</span>
            <div className="flex-grow border-t border-[var(--c-borderLight)]"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Link to="/login" className="text-xs font-bold px-4 py-2 rounded-lg bg-[var(--c-olive)]/10 text-[var(--c-oliveDark)] hover:bg-[var(--c-olive)]/20 transition-colors w-full sm:w-auto">
              Citizen Portal
            </Link>
            <Link to="/department-manager/login" className="text-xs font-bold px-4 py-2 rounded-lg bg-[var(--c-sage)]/20 text-[var(--c-oliveDark)] hover:bg-[var(--c-sage)]/40 transition-colors w-full sm:w-auto">
              Department Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthorityLogin;