// ─────────────────────────────────────────
// pages/auth/AdminLogin.jsx
// Super Admin login page.
// Calls POST /api/auth/admin/login
// On success → saves token via login()
// from AuthContext → redirects to
// /admin/dashboard
//
// Design:
// - Purple theme (distinct from
//   blue=citizen and green=authority)
// - No register option (admin accounts
//   are created directly in the DB)
// - Extra security notice shown
// - Stricter feel than other login pages
// ─────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginAdmin } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  MapPin,
  User,
  AlertTriangle,
  KeyRound,
  Globe,
  BarChart2,
  Users,
} from "lucide-react";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const from = location.state?.from || "/admin/dashboard";

  // ── Form State ──────────────────────────
  const [formData, setFormData] = useState({
    email:    "",
    password: "",
  });
  const [errors,     setErrors]     = useState({});
  const [showPass,   setShowPass]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Failed attempts counter ─────────────
  // After 3 failed attempts show extra
  // warning to deter brute force
  const [failedAttempts, setFailedAttempts] = useState(0);

  // ── Input change handler ─────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ═══════════════════════════════════════
  //  VALIDATION
  // ═══════════════════════════════════════
  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Admin email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ═══════════════════════════════════════
  //  SUBMIT HANDLER
  // ═══════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const response = await loginAdmin({
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { token, admin } = response.data;

      // ── Save to context + localStorage ──
      login(token, { ...admin, role: "admin" });
      toast.success(`Welcome, ${admin.name}. Admin access granted.`);
      navigate(from, { replace: true });

    } catch (error) {
      const msg    = error?.response?.data?.message || "";
      const status = error?.response?.status;

      // ── Increment failed attempts ───────
      setFailedAttempts((prev) => prev + 1);

      if (status === 401 || status === 403) {
        toast.error("Invalid admin credentials");
        setErrors({
          email:    "Check your email",
          password: "Check your password",
        });
      } else if (status === 404) {
        toast.error("No admin account found with this email");
        setErrors((prev) => ({
          ...prev,
          email: "No admin account found",
        }));
      } else {
        toast.error(
          msg || "Login failed. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ════════════════════════════════════
           LEFT PANEL — Branding (desktop)
          ════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-950/40 to-gray-900 flex-col items-center justify-center p-12">

        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/4 w-40 h-40 bg-purple-800/20 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white font-bold text-2xl tracking-tight leading-none">
                Emergency<span className="text-purple-400">Map</span>
              </span>
              <span className="text-purple-500/70 text-xs font-medium tracking-widest uppercase">
                Super Admin Portal
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-3">
            <h2 className="text-white text-2xl font-semibold leading-snug">
              Full platform control <br />
              <span className="text-purple-400">
                in one dashboard.
              </span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              As Super Admin, you have complete oversight of the
              platform — manage authorities, monitor all reports
              across every pincode zone and review analytics.
            </p>
          </div>

          {/* Admin capabilities */}
          <div className="flex flex-col gap-3 w-full">
            {[
              {
                icon: <Users      className="w-4 h-4 text-purple-400" />,
                text: "Approve or reject authority registrations",
              },
              {
                icon: <Globe      className="w-4 h-4 text-purple-400" />,
                text: "View all reports across all pincodes",
              },
              {
                icon: <BarChart2  className="w-4 h-4 text-purple-400" />,
                text: "Monitor platform-wide resolution stats",
              },
              {
                icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
                text: "Full authority account management",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left"
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 text-left w-full">
            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-purple-400/80 text-xs leading-relaxed">
              This is a restricted area. Unauthorized access
              attempts are logged and monitored.
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
           RIGHT PANEL — Login Form
          ════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md flex flex-col gap-8">

          {/* ── Mobile Logo ──────────────── */}
          <div className="flex lg:hidden items-center justify-center gap-2.5">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl leading-none">
                Emergency<span className="text-purple-400">Map</span>
              </span>
              <span className="text-purple-500/70 text-xs tracking-widest uppercase">
                Super Admin Portal
              </span>
            </div>
          </div>

          {/* ── Header ───────────────────── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-white text-3xl font-bold tracking-tight">
                Admin Login
              </h1>
              {/* Restricted badge */}
              <span className="flex items-center gap-1 text-xs bg-red-500/15 border border-red-500/30 text-red-400 px-2.5 py-1 rounded-full font-medium">
                <ShieldCheck className="w-3 h-3" />
                Restricted
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Super Admin access only. Credentials are not shared.
            </p>
          </div>

          {/* ════════════════════════════════
               FAILED ATTEMPTS WARNING
               Shown after 3 failed attempts
              ════════════════════════════════ */}
          {failedAttempts >= 3 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-semibold text-sm">
                  Multiple failed attempts detected
                </p>
                <p className="text-red-400/70 text-xs mt-1 leading-relaxed">
                  You have failed {failedAttempts} times. If you
                  are the legitimate admin, please verify your
                  credentials carefully. Continued failed attempts
                  may lock your account.
                </p>
              </div>
            </div>
          )}

          {/* ── Security Notice ───────────── */}
          <div className="flex items-start gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-purple-400/70 text-xs leading-relaxed">
              This portal is restricted to Super Admins only.
              Unauthorized access is prohibited and all login
              attempts are monitored.
            </p>
          </div>

          {/* ── Login Form ───────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@emergencymap.com"
                  autoComplete="email"
                  className={`
                    w-full bg-gray-900 border rounded-xl pl-10 pr-4 py-3
                    text-white text-sm placeholder-gray-600
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${errors.email
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-gray-800 hover:border-gray-700 focus:border-purple-500/50 focus:ring-purple-500/20"
                    }
                  `}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className={`
                    w-full bg-gray-900 border rounded-xl pl-10 pr-11 py-3
                    text-white text-sm placeholder-gray-600
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${errors.password
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-gray-800 hover:border-gray-700 focus:border-purple-500/50 focus:ring-purple-500/20"
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="
                w-full flex items-center justify-center gap-2
                bg-purple-600 hover:bg-purple-500 active:bg-purple-700
                text-white font-semibold text-sm
                py-3 rounded-xl mt-1
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg shadow-purple-600/20
              "
            >
              {submitting ? (
                <Loader variant="inline" text="Verifying credentials..." />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Access Admin Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ───────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">OTHER PORTALS</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* ── Other Login Options ───────── */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-xs font-medium py-2.5 rounded-xl transition-all duration-200"
            >
              <User        className="w-3.5 h-3.5 text-blue-400" />
              Citizen Login
            </Link>
            <Link
              to="/authority/login"
              className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-xs font-medium py-2.5 rounded-xl transition-all duration-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              Authority Login
            </Link>
          </div>

          {/* ── Back to home ──────────────── */}
          <p className="text-center text-gray-600 text-xs pb-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-1.5 text-gray-500 hover:text-white transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Back to EmergencyMap Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;