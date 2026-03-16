// ─────────────────────────────────────────
// pages/auth/AuthorityLogin.jsx
// Authority login page.
// Calls POST /api/auth/authority/login
// On success → saves token via login()
// from AuthContext → redirects to
// /authority/dashboard
// Only approved authorities can login.
// Unapproved ones get a clear message.
// ─────────────────────────────────────────

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginAuthority } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  MapPin,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  AlertCircle,
  User,
} from "lucide-react";

const AuthorityLogin = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const from = location.state?.from || "/authority/dashboard";

  // ── Form State ──────────────────────────
  const [formData, setFormData] = useState({
    email:    "",
    password: "",
  });
  const [errors,     setErrors]     = useState({});
  const [showPass,   setShowPass]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Pending approval notice state ───────
  // Shows a special notice card if the
  // authority account is not approved yet
  const [pendingNotice, setPendingNotice] = useState(false);

  // ── Input change handler ─────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setPendingNotice(false);
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
      newErrors.email = "Email is required";
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
    setPendingNotice(false);

    try {
      const response = await loginAuthority({
        email:    formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { token, authority } = response.data;

      login(token, { ...authority, role: "authority" });
      toast.success(`Welcome back, ${authority.name}!`);
      navigate(from, { replace: true });

    } catch (error) {
      const msg =
        error?.response?.data?.message || "";
      const status = error?.response?.status;

      // ── Account pending approval ────────
      // Backend returns 403 when authority
      // exists but is_approved = false
      if (status === 403 || msg.toLowerCase().includes("approved")) {
        setPendingNotice(true);
        return;
      }

      toast.error(msg || "Login failed. Please check your credentials.");

      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: "No account found with this email" }));
      } else if (msg.toLowerCase().includes("password")) {
        setErrors((prev) => ({ ...prev, password: "Incorrect password" }));
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-green-950/40 to-gray-900 flex-col items-center justify-center p-12">

        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-green-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-emerald-600/10 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-md">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white font-bold text-2xl tracking-tight leading-none">
                Emergency<span className="text-green-400">Map</span>
              </span>
              <span className="text-green-500/70 text-xs font-medium tracking-widest uppercase">
                Authority Portal
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-3">
            <h2 className="text-white text-2xl font-semibold leading-snug">
              Manage incidents in <br />
              <span className="text-green-400">
                your pincode zone.
              </span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              As an approved local authority, you can view, manage
              and resolve all reported incidents within your
              designated area.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3 w-full">
            {[
              {
                icon: <Building2 className="w-4 h-4 text-green-400" />,
                text: "View all reports in your pincode",
              },
              {
                icon: <ShieldCheck className="w-4 h-4 text-green-400" />,
                text: "Mark incidents as resolved",
              },
              {
                icon: <MapPin className="w-4 h-4 text-green-400" />,
                text: "Track resolution progress with charts",
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

          {/* Approval notice */}
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-left w-full">
            <Clock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              New authority accounts require Super Admin approval
              before login access is granted.
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
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl leading-none">
                Emergency<span className="text-green-400">Map</span>
              </span>
              <span className="text-green-500/70 text-xs tracking-widest uppercase">
                Authority Portal
              </span>
            </div>
          </div>

          {/* ── Header ───────────────────── */}
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-bold tracking-tight">
              Authority Login
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to manage reports in your zone
            </p>
          </div>

          {/* ════════════════════════════════
               PENDING APPROVAL NOTICE
               Shown when backend returns 403
              ════════════════════════════════ */}
          {pendingNotice && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold text-sm">
                    Account Pending Approval
                  </h3>
                  <p className="text-yellow-400/70 text-xs mt-1 leading-relaxed">
                    Your authority account has been registered but is
                    awaiting Super Admin approval. You will be able
                    to login once your account is approved.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                <p className="text-yellow-500/70 text-xs">
                  Contact your Super Admin for faster approval
                </p>
              </div>
            </div>
          )}

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
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="authority@department.gov.in"
                  autoComplete="email"
                  className={`
                    w-full bg-gray-900 border rounded-xl pl-10 pr-4 py-3
                    text-white text-sm placeholder-gray-600
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${errors.email
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-gray-800 hover:border-gray-700 focus:border-green-500/50 focus:ring-green-500/20"
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
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`
                    w-full bg-gray-900 border rounded-xl pl-10 pr-11 py-3
                    text-white text-sm placeholder-gray-600
                    focus:outline-none focus:ring-2 transition-all duration-200
                    ${errors.password
                      ? "border-red-500/60 focus:ring-red-500/20"
                      : "border-gray-800 hover:border-gray-700 focus:border-green-500/50 focus:ring-green-500/20"
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
                bg-green-600 hover:bg-green-500 active:bg-green-700
                text-white font-semibold text-sm
                py-3 rounded-xl mt-1
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg shadow-green-600/20
              "
            >
              {submitting ? (
                <Loader variant="inline" text="Signing in..." />
              ) : (
                <>
                  Sign In as Authority
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ───────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">OR</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* ── Other Login Options ───────── */}
          <div className="flex flex-col gap-3">
            <p className="text-gray-500 text-xs text-center uppercase tracking-wider font-medium">
              Login as a different role
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-xs font-medium py-2.5 rounded-xl transition-all duration-200"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                Citizen Login
              </Link>
              <Link
                to="/admin/login"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-xs font-medium py-2.5 rounded-xl transition-all duration-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Admin Login
              </Link>
            </div>
          </div>

          {/* ── Register Link ──────────────── */}
          <p className="text-center text-gray-500 text-sm">
            Don't have an authority account?{" "}
            <Link
              to="/authority/register"
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;