// ─────────────────────────────────────────
// pages/auth/AuthorityRegister.jsx
// Authority registration page.
// Calls POST /api/auth/authority/register
// Does NOT auto-login after registration
// because the account must be approved
// by Super Admin first.
// Shows a clear success state with
// instructions after submission.
// ─────────────────────────────────────────

import { useState } from "react";
import { Link } from "react-router-dom";
import { registerAuthority } from "../../services/authService";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Hash,
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  AlertCircle,
  FileCheck,
} from "lucide-react";

// ── Department options ──────────────────
const DEPARTMENTS = [
  "Municipal Corporation",
  "Fire Department",
  "Police Department",
  "Public Works Department",
  "Electricity Department",
  "Water Supply Department",
  "Health Department",
  "Disaster Management",
  "Traffic Police",
  "Other",
];

const AuthorityRegister = () => {

  // ── Form State ──────────────────────────
  const [formData, setFormData] = useState({
    name:       "",
    email:      "",
    password:   "",
    confirmPassword: "",
    pincode:    "",
    department: "",
  });
  const [errors,      setErrors]      = useState({});
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  // ── Success state ───────────────────────
  // After successful registration, replace
  // form with a pending approval notice
  const [submitted, setSubmitted] = useState(false);

  // ── Input change handler ─────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "pincode") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ── Password strength ────────────────────
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8)           score++;
    if (/[A-Z]/.test(pass))         score++;
    if (/[0-9]/.test(pass))         score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const levels = [
      { score: 0, label: "",       color: "" },
      { score: 1, label: "Weak",   color: "bg-red-500" },
      { score: 2, label: "Fair",   color: "bg-yellow-500" },
      { score: 3, label: "Good",   color: "bg-blue-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
    ];
    return levels[score] || levels[0];
  };

  const strength = getPasswordStrength(formData.password);

  // ═══════════════════════════════════════
  //  VALIDATION
  // ═══════════════════════════════════════
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Authority / Organization name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Official email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.department) {
      newErrors.department = "Please select your department";
    }

    if (!formData.pincode) {
      newErrors.pincode = "Pincode zone is required";
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await registerAuthority({
        name:       formData.name.trim(),
        email:      formData.email.trim().toLowerCase(),
        password:   formData.password,
        pincode:    formData.pincode,
        department: formData.department,
      });

      // ── Show success state, do NOT login
      setSubmitted(true);
      toast.success("Registration submitted! Awaiting admin approval.");

    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(msg);

      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered",
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Input base class helper ─────────────
  const inputClass = (field) => `
    w-full bg-gray-900 border rounded-xl pl-10 pr-4 py-3
    text-white text-sm placeholder-gray-600
    focus:outline-none focus:ring-2 transition-all duration-200
    ${errors[field]
      ? "border-red-500/60 focus:ring-red-500/20"
      : "border-gray-800 hover:border-gray-700 focus:border-green-500/50 focus:ring-green-500/20"
    }
  `;

  // ═══════════════════════════════════════
  //  SUCCESS / SUBMITTED STATE
  //  Replaces entire form after submission
  // ═══════════════════════════════════════
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg flex flex-col items-center gap-8 text-center">

          {/* Success Icon */}
          <div className="relative">
            <div className="w-24 h-24 bg-green-600/20 border border-green-500/30 rounded-3xl flex items-center justify-center">
              <FileCheck className="w-12 h-12 text-green-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-950">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="flex flex-col gap-3">
            <h1 className="text-white text-3xl font-bold">
              Request Submitted!
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
              Your authority registration request has been submitted
              successfully. The Super Admin will review your details
              and approve your account.
            </p>
          </div>

          {/* Steps card */}
          <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 text-left">
            <h3 className="text-white font-semibold text-sm">
              What happens next?
            </h3>
            {[
              {
                icon: <Clock className="w-4 h-4 text-yellow-400" />,
                title: "Admin Reviews Request",
                desc: "The Super Admin will review your registration details",
                bg: "bg-yellow-500/10 border-yellow-500/20",
              },
              {
                icon: <CheckCircle className="w-4 h-4 text-green-400" />,
                title: "Account Gets Approved",
                desc: "Once approved, your account will be activated",
                bg: "bg-green-500/10 border-green-500/20",
              },
              {
                icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
                title: "Login & Manage Reports",
                desc: "You can then login and manage incidents in your zone",
                bg: "bg-blue-500/10 border-blue-500/20",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {/* Step number */}
                <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div
                  className={`
                    flex-1 flex items-start gap-3 border rounded-xl px-3 py-2.5
                    ${item.bg}
                  `}
                >
                  <span className="shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-gray-200 text-sm font-medium leading-tight">
                      {item.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Registered info pill */}
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 w-full">
            <Mail className="w-4 h-4 text-gray-500 shrink-0" />
            <p className="text-gray-400 text-sm">
              Registered as:{" "}
              <span className="text-white font-medium">
                {formData.email}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to="/authority/login"
              className="
                flex-1 flex items-center justify-center gap-2
                bg-green-600 hover:bg-green-500 text-white
                text-sm font-semibold py-3 px-4 rounded-xl
                transition-colors shadow-lg shadow-green-600/20
              "
            >
              <ShieldCheck className="w-4 h-4" />
              Go to Authority Login
            </Link>
            <Link
              to="/"
              className="
                flex-1 flex items-center justify-center gap-2
                bg-gray-900 hover:bg-gray-800 border border-gray-800
                text-gray-300 hover:text-white
                text-sm font-medium py-3 px-4 rounded-xl
                transition-colors
              "
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  MAIN REGISTRATION FORM
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ════════════════════════════════════
           LEFT PANEL — Branding (desktop)
          ════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-green-950/40 to-gray-900 flex-col items-center justify-center p-12">

        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(34,197,94,0.4) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(34,197,94,0.4) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-green-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />

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
              Register your authority <br />
              <span className="text-green-400">
                to serve your zone.
              </span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Submit your authority details for Super Admin review.
              Once approved, you will gain full access to manage
              incidents in your pincode jurisdiction.
            </p>
          </div>

          {/* Requirements */}
          <div className="flex flex-col gap-3 w-full">
            <p className="text-gray-500 text-xs uppercase tracking-wider font-medium text-left">
              Required Information
            </p>
            {[
              { icon: "🏛️", text: "Official organization name" },
              { icon: "📧", text: "Official email address" },
              { icon: "🏢", text: "Department / division type" },
              { icon: "📍", text: "Pincode zone of jurisdiction" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left"
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-gray-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Approval process note */}
          <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-left w-full">
            <AlertCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <p className="text-green-400/80 text-xs leading-relaxed">
              All registrations are manually reviewed and approved
              by the platform Super Admin to ensure authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
           RIGHT PANEL — Register Form
          ════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md flex flex-col gap-7">

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
              Authority Registration
            </h1>
            <p className="text-gray-400 text-sm">
              Submit your details for Super Admin approval
            </p>
          </div>

          {/* ── Approval Notice Banner ────── */}
          <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-4 py-3">
            <Clock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-400/80 text-xs leading-relaxed">
              Your account will be inactive until approved by the
              Super Admin. You will not be able to login immediately.
            </p>
          </div>

          {/* ── Form ─────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            noValidate
          >

            {/* Authority / Org Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-300"
              >
                Authority / Organization Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai Municipal Corporation"
                  autoComplete="organization"
                  className={inputClass("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Official Email */}
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
                  className={inputClass("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Department + Pincode side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Department Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="department"
                  className="text-sm font-medium text-gray-300"
                >
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`
                      appearance-none w-full bg-gray-900 border rounded-xl
                      pl-10 pr-8 py-3 text-sm
                      focus:outline-none focus:ring-2 transition-all duration-200
                      ${errors.department
                        ? "border-red-500/60 focus:ring-red-500/20 text-gray-300"
                        : "border-gray-800 hover:border-gray-700 focus:border-green-500/50 focus:ring-green-500/20 text-gray-300"
                      }
                      ${!formData.department ? "text-gray-600" : "text-white"}
                    `}
                  >
                    <option value="" disabled className="text-gray-600 bg-gray-900">
                      Select...
                    </option>
                    {DEPARTMENTS.map((dept) => (
                      <option
                        key={dept}
                        value={dept}
                        className="bg-gray-900 text-white"
                      >
                        {dept}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown arrow */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.department && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Pincode */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="pincode"
                  className="text-sm font-medium text-gray-300"
                >
                  Pincode Zone
                </label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    maxLength={6}
                    inputMode="numeric"
                    className={inputClass("pincode")}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono">
                    {formData.pincode.length}/6
                  </span>
                </div>
                {errors.pincode && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                    {errors.pincode}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={`${inputClass("password")} pr-11`}
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

              {/* Password Strength Bar */}
              {formData.password && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`
                          h-1 flex-1 rounded-full transition-all duration-300
                          ${strength.score >= level
                            ? strength.color
                            : "bg-gray-800"
                          }
                        `}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-gray-500">
                      Password strength:{" "}
                      <span
                        className={`font-medium ${
                          strength.score === 1 ? "text-red-400"    :
                          strength.score === 2 ? "text-yellow-400" :
                          strength.score === 3 ? "text-blue-400"   :
                          "text-green-400"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {errors.password && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`${inputClass("confirmPassword")} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />
                  }
                </button>

                {/* Match indicator */}
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
                  {errors.confirmPassword}
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
                py-3 rounded-xl mt-2
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg shadow-green-600/20
              "
            >
              {submitting ? (
                <Loader variant="inline" text="Submitting Request..." />
              ) : (
                <>
                  Submit Registration Request
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Login Link ────────────────── */}
          <p className="text-center text-gray-500 text-sm">
            Already have an approved account?{" "}
            <Link
              to="/authority/login"
              className="text-green-400 hover:text-green-300 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>

          {/* ── Citizen link ──────────────── */}
          <p className="text-center text-gray-600 text-xs pb-2">
            Registering as a citizen instead?{" "}
            <Link
              to="/register"
              className="text-gray-400 hover:text-white transition-colors underline underline-offset-2"
            >
              Citizen Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorityRegister;