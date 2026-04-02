// ─────────────────────────────────────────
// pages/auth/DepartmentManagerLogin.jsx
// Team Member (Department Manager) Login
// ─────────────────────────────────────────

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginTeamMember } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";
import { useAuth } from "../../context/AuthContext";

const DepartmentManagerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    if (!formData.email.trim()) newErrors.email = "Email required";
    if (!formData.password) newErrors.password = "Password required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const response = await loginTeamMember({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { token, teamMember } = response.data;
      
      // Debug logging
      console.log("Login Response:", response.data);
      console.log("Team Member Data:", teamMember);
      
      if (!teamMember || !teamMember.role) {
        console.error("Invalid team member response:", teamMember);
        toast.error("Login response incomplete - missing role");
        setSubmitting(false);
        return;
      }
      
      login(token, teamMember);
      toast.success("Login successful!");
      navigate("/department-manager/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-white border border-[var(--c-borderLight)] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[var(--c-charcoal)]  focus:ring-1 focus:ring-[var(--c-charcoal)] transition-all";

  return (
    <div style={authStyle} className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden bg-[var(--c-offWhite)]">
      <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl shadow-2xl p-8 flex flex-col gap-5 my-8">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 bg-[var(--c-charcoal)] rounded-xl flex items-center justify-center shadow-md mb-2">
            <LogIn className="w-5 h-5 text-[var(--c-accentGold)]" />
          </div>
          <h1 className="text-2xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
            Department Manager
          </h1>
          <p className="text-sm text-gray-500">Access your department dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="manager@municipality.gov" className={inputClass} />
            </div>
            {errors.email && <p className="text-red-500 text-[10px]">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPass ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter password" className={inputClass} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-[10px]">{errors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="w-full mt-2 flex items-center justify-center gap-2 bg-[var(--c-charcoal)] hover:bg-black text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            {submitting ? <Loader variant="inline" text="Signing in..." /> : <>Sign In</>}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[var(--c-borderLight)]">
          <p className="text-xs text-gray-600">
            Not a department manager?{" "}
            <Link to="/login" className="text-[var(--c-olive)] font-bold hover:underline">
              Citizen Login
            </Link>
            {" | "}
            <Link to="/authority/login" className="text-[var(--c-accentGold)] font-bold hover:underline">
              Chief Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagerLogin;
