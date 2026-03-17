// ─────────────────────────────────────────
// pages/user/UserProfile.jsx
// ─────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import api from "../../services/api";
import {
  User, Mail, Hash, Lock, Eye, EyeOff, CheckCircle, Edit3, 
  MapPin, Calendar, Save, X, Phone, ShieldCheck
} from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";

const UserProfile = () => {
  const { user, refreshUser } = useAuth();

  // ── Profile Edit State ──────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    pincode: user?.pincode || "",
    number: user?.number || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password Change State ───────────────
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const profileStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short", year: "numeric", day: "numeric"
    });
  };

  // ── Profile Handlers ────────────────────
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode" && (!/^\d*$/.test(value) || value.length > 6)) return;
    if (name === "number" && (!/^\d*$/.test(value) || value.length > 10)) return;
    
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileData.name.trim()) errs.name = "Name is required";
    if (profileData.pincode.length !== 6) errs.pincode = "6 digits required";
    if (profileData.number.length !== 10) errs.number = "10 digits required";
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitProfile = async () => {
    if (!validateProfile()) return;
    setSavingProfile(true);
    try {
      await api.patch("/user/profile", profileData);
      toast.success("Profile updated successfully!");
      setEditingProfile(false);
      if (refreshUser) await refreshUser();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password Handlers ───────────────────
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordData.currentPassword) errs.currentPassword = "Required";
    if (!passwordData.newPassword) errs.newPassword = "Required";
    else if (passwordData.newPassword.length < 6) errs.newPassword = "Min 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) errs.confirmPassword = "Must match new password";
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitPassword = async () => {
    if (!validatePassword()) return;
    setSavingPassword(true);
    try {
      await api.patch("/user/password", passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = "w-full bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-[var(--c-olive)] focus:ring-1 focus:ring-[var(--c-olive)] transition-all";

  return (
    <div style={profileStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="max-w-5xl mx-auto relative z-10 flex flex-col gap-8">
        
        {/* ── HEADER CARD ── */}
        <div className="bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 bg-[var(--c-olive)] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {(user?.name || user?.email || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-black text-[var(--c-charcoal)] mb-1" style={{ fontFamily: fonts.heading }}>
              {user?.name}
            </h1>
            <p className="text-[var(--c-textSecondary)] flex items-center justify-center sm:justify-start gap-2 mb-4">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--c-sage)]/50 text-[var(--c-oliveDark)] text-xs font-bold rounded-full uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5" /> Citizen Account
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[var(--c-borderLight)] text-[var(--c-textSecondary)] text-xs font-bold rounded-full">
                <Calendar className="w-3.5 h-3.5" /> Joined {formatDate(user?.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ── PERSONAL INFO CARD ── */}
          <div className="bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl p-6 sm:p-8 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--c-sage)]/50 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--c-oliveDark)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--c-charcoal)]" style={{ fontFamily: fonts.heading }}>Personal Details</h2>
              </div>
              {!editingProfile ? (
                <button onClick={() => setEditingProfile(true)} className="p-2 text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] hover:bg-[var(--c-sage)]/30 rounded-full transition-colors">
                  <Edit3 className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={() => {
                  setEditingProfile(false);
                  setProfileData({ name: user?.name, pincode: user?.pincode, number: user?.number });
                  setProfileErrors({});
                }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {editingProfile ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className={inputClass} />
                  </div>
                  {profileErrors.name && <p className="text-red-500 text-[10px]">{profileErrors.name}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Pincode</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" name="pincode" value={profileData.pincode} onChange={handleProfileChange} className={inputClass} />
                    </div>
                    {profileErrors.pincode && <p className="text-red-500 text-[10px]">{profileErrors.pincode}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" name="number" value={profileData.number} onChange={handleProfileChange} className={inputClass} />
                    </div>
                    {profileErrors.number && <p className="text-red-500 text-[10px]">{profileErrors.number}</p>}
                  </div>
                </div>

                <button onClick={submitProfile} disabled={savingProfile} className="mt-2 w-full flex items-center justify-center gap-2 bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] text-white font-bold py-2.5 rounded-xl transition-all shadow-md">
                  {savingProfile ? <Loader variant="inline" text="Saving..." /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</span>
                  <p className="text-[var(--c-charcoal)] font-medium text-lg">{user?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Home Pincode</span>
                    <p className="flex items-center gap-1.5 text-[var(--c-charcoal)] font-medium">
                      <MapPin className="w-4 h-4 text-[var(--c-olive)]" /> {user?.pincode}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</span>
                    <p className="flex items-center gap-1.5 text-[var(--c-charcoal)] font-medium">
                      <Phone className="w-4 h-4 text-[var(--c-olive)]" /> {user?.number || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── SECURITY CARD ── */}
          <div className="bg-white/80 backdrop-blur-xl border border-[var(--c-borderLight)] rounded-3xl p-6 sm:p-8 shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--c-accentGold)]/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[var(--c-accentGold)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--c-charcoal)]" style={{ fontFamily: fonts.heading }}>Security</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Enter current password" className={inputClass} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && <p className="text-red-500 text-[10px]">{passwordErrors.currentPassword}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPass ? "text" : "password"} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="Min. 6 chars" className={inputClass} />
                  </div>
                  {passwordErrors.newPassword && <p className="text-red-500 text-[10px]">{passwordErrors.newPassword}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[var(--c-charcoal)] uppercase tracking-wider">Confirm New</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPass ? "text" : "password"} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} placeholder="Re-enter new" className={inputClass} />
                  </div>
                  {passwordErrors.confirmPassword && <p className="text-red-500 text-[10px]">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>

              <button onClick={submitPassword} disabled={savingPassword} className="mt-2 w-full flex items-center justify-center gap-2 bg-[var(--c-charcoal)] hover:bg-black text-white font-bold py-2.5 rounded-xl transition-all shadow-md">
                {savingPassword ? <Loader variant="inline" text="Updating..." /> : <><Lock className="w-4 h-4" /> Update Password</>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;