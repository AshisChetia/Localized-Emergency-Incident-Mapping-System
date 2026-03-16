// ─────────────────────────────────────────
// pages/user/UserProfile.jsx
// Citizen profile page.
// Shows current user info and allows:
// - Update name and pincode
// - Change password
// Calls PATCH /api/user/profile
// Calls PATCH /api/user/password
// ─────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import api from "../../services/api";
import {
  User,
  Mail,
  Hash,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Edit3,
  Shield,
  MapPin,
  Calendar,
  Camera,
  Save,
  X,
} from "lucide-react";

const UserProfile = () => {
  const { user, updateUser, refreshUser } = useAuth();

  // ── Profile edit state ──────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData,    setProfileData]    = useState({
    name:    user?.name    || "",
    pincode: user?.pincode || "",
  });
  const [profileErrors,  setProfileErrors]  = useState({});
  const [savingProfile,  setSavingProfile]  = useState(false);

  // ── Password change state ───────────────
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordData,    setPasswordData]    = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [passwordErrors,  setPasswordErrors]  = useState({});
  const [savingPassword,  setSavingPassword]  = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass,     setShowNewPass]     = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // ── Password strength ────────────────────
  const getStrength = (pass) => {
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
    return levels[score];
  };
  const strength = getStrength(passwordData.newPassword);

  // ── Format date ─────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
  };

  // ═══════════════════════════════════════
  //  PROFILE HANDLERS
  // ═══════════════════════════════════════
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      if (!/^\d*$/.test(value) || value.length > 6) return;
    }
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name])
      setProfileErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileData.name.trim())
      errs.name = "Name is required";
    else if (profileData.name.trim().length < 3)
      errs.name = "Name must be at least 3 characters";

    if (!profileData.pincode)
      errs.pincode = "Pincode is required";
    else if (profileData.pincode.length !== 6)
      errs.pincode = "Pincode must be exactly 6 digits";

    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      const res = await api.patch("/user/profile", {
        name:    profileData.name.trim(),
        pincode: profileData.pincode,
      });
      updateUser(res.data.user);
      toast.success("Profile updated successfully");
      setEditingProfile(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleProfileCancel = () => {
    setProfileData({
      name:    user?.name    || "",
      pincode: user?.pincode || "",
    });
    setProfileErrors({});
    setEditingProfile(false);
  };

  // ═══════════════════════════════════════
  //  PASSWORD HANDLERS
  // ═══════════════════════════════════════
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name])
      setPasswordErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordData.currentPassword)
      errs.currentPassword = "Current password is required";

    if (!passwordData.newPassword)
      errs.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 6)
      errs.newPassword = "Password must be at least 6 characters";

    if (!passwordData.confirmPassword)
      errs.confirmPassword = "Please confirm your new password";
    else if (passwordData.newPassword !== passwordData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.currentPassword === passwordData.newPassword
    )
      errs.newPassword = "New password must be different from current";

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSave = async () => {
    if (!validatePassword()) return;
    setSavingPassword(true);
    try {
      await api.patch("/user/password", {
        currentPassword: passwordData.currentPassword,
        newPassword:     passwordData.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword:     "",
        confirmPassword: "",
      });
      setEditingPassword(false);
    } catch (error) {
      const msg = error?.response?.data?.message || "";
      if (msg.toLowerCase().includes("current") ||
          msg.toLowerCase().includes("incorrect")) {
        setPasswordErrors((prev) => ({
          ...prev,
          currentPassword: "Current password is incorrect",
        }));
      } else {
        toast.error(msg || "Failed to change password");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword:     "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    setEditingPassword(false);
  };

  // ── Reusable input class ─────────────────
  const inputClass = (hasError) => `
    w-full bg-gray-950 border rounded-xl px-4 py-3
    text-white text-sm placeholder-gray-600
    focus:outline-none focus:ring-2 transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${hasError
      ? "border-red-500/60 focus:ring-red-500/20"
      : "border-gray-800 hover:border-gray-700 focus:border-blue-500/50 focus:ring-blue-500/20"
    }
  `;

  // ── Avatar initial ───────────────────────
  const avatarLetter = (user?.name || user?.email || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950 w-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* ════════════════════════════════
             PAGE HEADER
            ════════════════════════════════ */}
        <div className="flex flex-col gap-1">
          <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            My Profile
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your account information and security settings
          </p>
        </div>

        {/* ════════════════════════════════
             PROFILE HERO CARD
            ════════════════════════════════ */}
        <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Top gradient banner */}
          <div className="h-24 bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-gray-900 relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)`,
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          {/* Avatar + name */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">

              {/* Avatar */}
              <div className="relative w-fit">
                <div className="w-20 h-20 rounded-2xl bg-blue-600 border-4 border-gray-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20">
                  {avatarLetter}
                </div>
                {/* Online dot */}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
              </div>

              {/* Name + role */}
              <div className="flex flex-col gap-0.5 sm:pb-1">
                <h2 className="text-white text-xl font-bold leading-tight">
                  {user?.name || "Citizen"}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-medium">
                    Citizen
                  </span>
                  <span className="text-gray-500 text-xs">
                    Zone{" "}
                    <span className="text-blue-400 font-mono font-semibold">
                      {user?.pincode || "—"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick info row */}
            <div className="mt-5 flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {user?.email || "—"}
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Pincode {user?.pincode || "—"}
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Joined {formatDate(user?.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
             PROFILE INFO CARD
            ════════════════════════════════ */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Personal Information
                </h3>
                <p className="text-gray-500 text-xs">
                  Update your name and pincode zone
                </p>
              </div>
            </div>

            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
          </div>

          {/* Card body */}
          <div className="p-6 flex flex-col gap-5">
            {editingProfile ? (
              /* ── Edit Mode ───────────────── */
              <>
                {/* Name field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Your full name"
                    className={inputClass(profileErrors.name)}
                  />
                  {profileErrors.name && (
                    <p className="text-red-400 text-xs">
                      {profileErrors.name}
                    </p>
                  )}
                </div>

                {/* Pincode field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-blue-400" />
                    Pincode
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pincode"
                      value={profileData.pincode}
                      onChange={handleProfileChange}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      inputMode="numeric"
                      className={inputClass(profileErrors.pincode)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-mono">
                      {profileData.pincode.length}/6
                    </span>
                  </div>
                  {profileErrors.pincode && (
                    <p className="text-red-400 text-xs">
                      {profileErrors.pincode}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handleProfileCancel}
                    disabled={savingProfile}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={savingProfile}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                  >
                    {savingProfile ? (
                      <Loader variant="inline" text="Saving..." />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* ── View Mode ───────────────── */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: "Full Name",
                    value: user?.name || "—",
                    icon:  <User     className="w-4 h-4 text-blue-400" />,
                  },
                  {
                    label: "Email Address",
                    value: user?.email || "—",
                    icon:  <Mail     className="w-4 h-4 text-blue-400" />,
                    note:  "Cannot be changed",
                  },
                  {
                    label: "Pincode Zone",
                    value: user?.pincode || "—",
                    icon:  <Hash     className="w-4 h-4 text-blue-400" />,
                    mono:  true,
                  },
                  {
                    label: "Account Role",
                    value: "Citizen",
                    icon:  <Shield   className="w-4 h-4 text-blue-400" />,
                  },
                ].map((field) => (
                  <div
                    key={field.label}
                    className="bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-3.5 flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      {field.icon}
                      {field.label}
                    </div>
                    <p
                      className={`text-white text-sm font-medium ${
                        field.mono ? "font-mono" : ""
                      }`}
                    >
                      {field.value}
                    </p>
                    {field.note && (
                      <p className="text-gray-600 text-xs">
                        {field.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════
             CHANGE PASSWORD CARD
            ════════════════════════════════ */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Password & Security
                </h3>
                <p className="text-gray-500 text-xs">
                  Update your account password
                </p>
              </div>
            </div>

            {!editingPassword && (
              <button
                onClick={() => setEditingPassword(true)}
                className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Change
              </button>
            )}
          </div>

          {/* Card body */}
          <div className="p-6">
            {editingPassword ? (
              /* ── Password Edit Form ──────── */
              <div className="flex flex-col gap-5">

                {/* Current password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className={`${inputClass(passwordErrors.currentPassword)} pl-10 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showCurrentPass
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye    className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-red-400 text-xs">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className={`${inputClass(passwordErrors.newPassword)} pl-10 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showNewPass
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye    className="w-4 h-4" />
                      }
                    </button>
                  </div>

                  {/* Strength bar */}
                  {passwordData.newPassword && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            className={`
                              h-1 flex-1 rounded-full transition-all duration-300
                              ${strength.score >= lvl
                                ? strength.color
                                : "bg-gray-800"
                              }
                            `}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className="text-xs text-gray-500">
                          Strength:{" "}
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

                  {passwordErrors.newPassword && (
                    <p className="text-red-400 text-xs">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      className={`${inputClass(passwordErrors.confirmPassword)} pl-10 pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPass
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye    className="w-4 h-4" />
                      }
                    </button>
                    {/* Match check */}
                    {passwordData.confirmPassword &&
                      passwordData.newPassword === passwordData.confirmPassword && (
                      <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    )}
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-400 text-xs">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={handlePasswordCancel}
                    disabled={savingPassword}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordSave}
                    disabled={savingPassword}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20"
                  >
                    {savingPassword ? (
                      <Loader variant="inline" text="Updating..." />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Password View Mode ──────── */
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-gray-300 text-sm font-medium">
                      Password is set
                    </p>
                    <p className="text-gray-500 text-xs">
                      Last updated: {formatDate(user?.updated_at)}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Secured
                  </div>
                </div>

                {/* Tips */}
                <div className="flex flex-col gap-2">
                  <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">
                    Password tips
                  </p>
                  {[
                    "Use at least 8 characters",
                    "Include uppercase letters and numbers",
                    "Add special characters for extra security",
                  ].map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-gray-500 text-xs"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════
             ACCOUNT INFO CARD
            ════════════════════════════════ */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">
              Account Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Account Status",
                value: "Active",
                color: "text-green-400",
                dot:   "bg-green-400",
              },
              {
                label: "Member Since",
                value: formatDate(user?.created_at),
                color: "text-gray-300",
              },
              {
                label: "User ID",
                value: `#${user?.id || "—"}`,
                color: "text-gray-300",
                mono:  true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-3 flex flex-col gap-1"
              >
                <p className="text-gray-500 text-xs">{item.label}</p>
                <div className="flex items-center gap-1.5">
                  {item.dot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${item.dot}`}
                    />
                  )}
                  <p
                    className={`text-sm font-medium ${item.color} ${
                      item.mono ? "font-mono" : ""
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;