import { useCallback, useEffect, useState } from "react";
import { getMyAuthorityDetails } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { colors, fonts } from "../../styles/designTokens";
import {
  AlertCircle,
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  UserRoundCheck,
  Users,
  Navigation
} from "lucide-react";

const formatDepartment = (department) => {
  if (!department) return "Department";
  return department
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const AuthorityDetails = () => {
  const { user } = useAuth();
  const [authority, setAuthority] = useState(null);
  const [departmentManagers, setDepartmentManagers] = useState([]);
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageStyle = {
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

  const fetchAuthorityDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyAuthorityDetails();
      setAuthority(response.data.authority || null);
      setDepartmentManagers(response.data.departmentManagers || []);
      setPincode(response.data.pincode || user?.pincode || "");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load authority details");
      toast.error("Failed to load authority details");
    } finally {
      setLoading(false);
    }
  }, [user?.pincode]);

  useEffect(() => {
    fetchAuthorityDetails();
  }, [fetchAuthorityDetails]);

  // Handle new lat,lng format
  const hasLocation = Boolean(authority?.office_location && authority.office_location.includes(","));
  const mapsUrl = hasLocation
    ? `https://maps.google.com/?q=${authority.office_location}`
    : null;

  return (
    <div style={pageStyle} className="min-h-screen bg-[var(--c-offWhite)] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white border border-[var(--c-borderLight)] rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-6 h-6 text-[var(--c-accentGold)]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--c-textSecondary)]">Your Zone Authority</p>
                <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
                  Authority Details
                </h1>
              </div>
            </div>
            <p className="text-sm text-[var(--c-textSecondary)] font-medium">
              Showing the approved authority responsible for pincode <span className="font-bold text-[var(--c-charcoal)]">{pincode || user?.pincode}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAuthorityDetails}
            className="inline-flex items-center justify-center gap-2 bg-white border border-[var(--c-borderLight)] text-[var(--c-charcoal)] px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[var(--c-sage)]/20 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[360px] text-[var(--c-textSecondary)] bg-white rounded-3xl border border-[var(--c-borderLight)] shadow-sm">
            <Loader variant="spinner" size="xl" />
            <p className="mt-6 text-sm font-medium">Loading authority details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-bold">{error}</p>
          </div>
        ) : !authority ? (
          <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl p-10 text-center shadow-sm">
            <Building2 className="w-12 h-12 text-[var(--c-textSecondary)] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[var(--c-charcoal)] mb-2" style={{ fontFamily: fonts.heading }}>
              No approved authority found
            </h2>
            <p className="text-sm text-[var(--c-textSecondary)] max-w-md mx-auto">
              There is no approved authority account for your pincode yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[var(--c-borderLight)] rounded-3xl shadow-2xl shadow-[var(--c-olive)]/10 overflow-hidden flex flex-col transform transition-all duration-300">
              {/* Top Banner / Header Segment */}
              <div className="w-full bg-gradient-to-br from-[var(--c-oliveDark)] via-[var(--c-olive)] to-[var(--c-sage)] relative px-6 py-12 overflow-hidden flex flex-col items-center text-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJIMjR2LTJoMTJ6TTM2IDI0djJIMjR2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30 animate-[pulse_8s_ease-in-out_infinite]"></div>
                
                <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-3xl p-1.5 shadow-xl mb-5 hover:scale-110 transition-transform duration-500">
                  <div className="w-full h-full bg-gradient-to-br from-[#F4F6F0] to-[#E8ECE1] rounded-[1.2rem] flex items-center justify-center">
                    <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--c-olive)]" />
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md" style={{ fontFamily: fonts.heading }}>
                      {authority.name}
                    </h2>
                    <ShieldCheck className="w-6 h-6 text-[#FFD700] drop-shadow" />
                  </div>
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 shadow-sm">
                    <MapPin className="w-4 h-4" /> Jurisdiction Pincode: {authority.pincode}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 bg-white flex-1 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-[var(--c-offWhite)] hover:bg-[var(--c-sage)]/20 transition-colors rounded-2xl p-4 flex flex-col items-center text-center group cursor-default border border-transparent hover:border-[var(--c-olive)]/20">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-[var(--c-olive)]" />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-1">Official Email</p>
                    <a href={`mailto:${authority.email}`} className="text-[var(--c-charcoal)] font-semibold text-sm truncate w-full hover:text-[var(--c-olive)]" title={authority.email}>{authority.email}</a>
                  </div>
                  <div className="bg-[var(--c-offWhite)] hover:bg-[var(--c-sage)]/20 transition-colors rounded-2xl p-4 flex flex-col items-center text-center group cursor-default border border-transparent hover:border-[var(--c-olive)]/20">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-[#E65100]" />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-1">Active Zone</p>
                    <p className="text-[var(--c-charcoal)] font-black text-lg tracking-widest">{authority.pincode}</p>
                  </div>
                </div>

                {/* ── OFFICE LOCATION ── */}
                <div className="mt-auto">
                  {hasLocation ? (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block group">
                      <div className="relative overflow-hidden bg-[var(--c-charcoal)] rounded-2xl p-6 flex items-center gap-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--c-charcoal)]/30">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                        <div className="relative z-10 w-14 h-14 bg-[var(--c-olive)] rounded-2xl shadow-lg flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white/10">
                          <Navigation className="w-6 h-6 text-white" />
                        </div>
                        <div className="relative z-10 flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs font-bold text-[var(--c-accentGold)] uppercase tracking-widest mb-1 flex items-center gap-2">
                            Headquarters <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                          </p>
                          <p className="text-white font-medium text-sm truncate">{authority.office_location}</p>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="bg-[#FFF8E6] border border-[#F2DCA2] rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                        <AlertCircle className="w-5 h-5 text-[var(--c-accentGold)]" />
                      </div>
                      <div>
                        <h4 className="text-[var(--c-charcoal)] font-bold text-sm mb-1">Office Location Pending</h4>
                        <p className="text-[var(--c-textSecondary)] text-xs leading-relaxed font-medium">This authority has not published GPS coordinates.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl p-6 shadow-sm h-fit">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--c-textSecondary)]">Department Managers</p>
                  <h2 className="text-xl font-bold text-[var(--c-charcoal)]" style={{ fontFamily: fonts.heading }}>
                    Local Team
                  </h2>
                </div>
                <div className="w-11 h-11 bg-[var(--c-sage)]/30 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-[var(--c-olive)]" />
                </div>
              </div>

              {departmentManagers.length === 0 ? (
                <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-5 text-center">
                  <UserRoundCheck className="w-8 h-8 text-[var(--c-textSecondary)] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[var(--c-textSecondary)]">
                    No department managers are listed yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {departmentManagers.map((manager) => (
                    <div key={manager.id} className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-4 hover:border-[var(--c-olive)]/30 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-[var(--c-borderLight)] group-hover:border-[var(--c-olive)]/30 transition-colors">
                          <UserRoundCheck className="w-5 h-5 text-[var(--c-olive)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--c-charcoal)] truncate">{manager.name}</p>
                          <p className="text-[10px] font-bold text-[var(--c-olive)] uppercase tracking-wider mt-0.5">
                            {formatDepartment(manager.sub_department)}
                          </p>
                          <a href={`mailto:${manager.email}`} className="text-xs text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] break-all mt-1.5 inline-block font-medium">
                            {manager.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDetails;
