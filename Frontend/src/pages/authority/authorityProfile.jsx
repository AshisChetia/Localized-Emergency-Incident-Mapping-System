// ─────────────────────────────────────────
// pages/authority/AuthorityProfile.jsx
// ─────────────────────────────────────────

import { useAuth } from "../../context/AuthContext";
import { colors, fonts } from "../../styles/designTokens";
import { 
  Building2, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  User, 
  Award,
  CalendarDays,
  CheckCircle
} from "lucide-react";

const AuthorityProfile = () => {
  // Pull the logged-in authority's data from context
  const { user } = useAuth();

  const profileStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-textPrimary": colors.textPrimary,
    "--c-textSecondary": colors.textSecondary,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  return (
    <div style={profileStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] pb-16 relative overflow-hidden">
      
      {/* ── BACKGROUND BLOBS ── */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 relative z-10">
        
        {/* ── PAGE HEADER ── */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight mb-2" style={{ fontFamily: fonts.heading }}>
            Official Profile
          </h1>
          <p className="text-[var(--c-textSecondary)] text-sm font-medium">
            Manage your municipal account details and jurisdiction info.
          </p>
        </div>

        {/* ── MAIN PROFILE CARD ── */}
        <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl shadow-xl shadow-[var(--c-charcoal)]/5 overflow-hidden">
          
          {/* Top Banner Gradient */}
          <div className="h-32 w-full bg-gradient-to-r from-[var(--c-oliveDark)] via-[var(--c-olive)] to-[#9CA684]"></div>
          
          <div className="px-6 sm:px-10 pb-10">
            
            {/* Avatar & Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 -mt-12 sm:-mt-16 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                {/* Large Avatar */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl p-2 shadow-lg border border-[var(--c-borderLight)] shrink-0">
                  <div className="w-full h-full bg-[#F4F6F0] rounded-2xl flex items-center justify-center">
                    <Building2 className="w-10 h-10 sm:w-14 sm:h-14 text-[var(--c-olive)]" />
                  </div>
                </div>
                
                {/* Name & Badge */}
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
                      {user?.name || "Official Account"}
                    </h2>
                    <ShieldCheck className="w-6 h-6 text-[var(--c-accentGold)] mt-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--c-sage)]/50 border border-[var(--c-olive)]/20 text-[var(--c-oliveDark)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified Authority
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── DETAILS GRID ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Department */}
              <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-[var(--c-accentGold)]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-0.5">Assigned Department</p>
                  <p className="text-[var(--c-charcoal)] font-bold text-base">{user?.department || "N/A"}</p>
                </div>
              </div>

              {/* Jurisdiction */}
              <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-[var(--c-olive)]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-0.5">Jurisdiction Zone</p>
                  <p className="text-[var(--c-charcoal)] font-black text-lg tracking-widest">{user?.pincode || "N/A"}</p>
                </div>
              </div>

              {/* Official Email */}
              <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-0.5">Official Email</p>
                  <p className="text-[var(--c-charcoal)] font-medium text-base">{user?.email || "N/A"}</p>
                </div>
              </div>

              {/* Account Level */}
              <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 flex items-start gap-4 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-0.5">Account Role</p>
                  <p className="text-[var(--c-charcoal)] font-bold text-base capitalize">{user?.role || "Authority"}</p>
                </div>
              </div>

            </div>

            {/* Security Notice Section */}
            <div className="mt-8 bg-[#FFF8E6] border border-[#F2DCA2] rounded-2xl p-5 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[var(--c-accentGold)] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[var(--c-charcoal)] font-bold text-sm mb-1">Secure Local Access</h4>
                <p className="text-[var(--c-textSecondary)] text-xs leading-relaxed font-medium">
                  Your account is securely bound to Pincode <span className="font-bold text-[var(--c-charcoal)]">{user?.pincode}</span>. 
                  You only have authorization to view, manage, and resolve incident reports submitted by citizens within this specific geographic zone.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityProfile;