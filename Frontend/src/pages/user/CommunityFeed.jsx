import { useState, useEffect, useCallback } from "react";
import { getCommunityReports, verifyReport, unverifyReport } from "../../services/reportService";
import ReportCard from "../../components/ReportCard";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "../../styles/designTokens";
import { formatDateShort } from "../../utils/dateTimeUtils";
import { BadgeCheck, X, MapPin, Clock, Building2, ChevronRight } from "lucide-react";

const CommunityFeed = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verificationBusyId, setVerificationBusyId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

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

  const fetchCommunityFeed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCommunityReports();
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load community feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunityFeed();
  }, [fetchCommunityFeed]);

  useEffect(() => {
    if (selectedReport) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedReport]);

  const handleVerifyToggle = async (report) => {
    if (!report?.id || !report.can_verify) return;

    setVerificationBusyId(report.id);

    try {
      if (report.is_verified_by_me) {
        await unverifyReport(report.id);
        toast.success("Upvote removed");
      } else {
        await verifyReport(report.id);
        toast.success("Report upvoted");
      }

      if (selectedReport?.id === report.id) {
        setSelectedReport(null);
      }

      await fetchCommunityFeed();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update upvote");
    } finally {
      setVerificationBusyId(null);
    }
  };

  return (
    <div style={pageStyle} className="min-h-screen bg-[var(--c-offWhite)]">
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[var(--c-charcoal)]/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }}
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh] overflow-hidden border border-[var(--c-borderLight)]"
            >
              <div className="w-full md:w-5/12 bg-[var(--c-sage)]/10 border-b md:border-b-0 md:border-r border-[var(--c-borderLight)] relative shrink-0 min-h-[250px] md:min-h-0">
                {selectedReport.image_url ? (
                  <img src={selectedReport.image_url} alt="Incident Context" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--c-textSecondary)]/40">
                    No image available
                  </div>
                )}
                <div className="absolute top-5 left-5 z-10 flex gap-2">
                  <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm border bg-white/95 backdrop-blur-sm ${selectedReport.status === "resolved" ? "text-[var(--c-oliveDark)] border-[var(--c-sage)]" : "text-[var(--c-accentGold)] border-[#F2DCA2]"}`}>
                    {selectedReport.status}
                  </span>
                </div>
              </div>

              <div className="w-full md:w-7/12 flex flex-col bg-white overflow-y-auto">
                <div className="px-8 py-6 border-b border-[var(--c-borderLight)] flex items-center justify-between shrink-0 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <div>
                    <span className="text-xs font-medium text-[var(--c-textSecondary)] uppercase tracking-widest block mb-1">Community Report</span>
                    <h2 className="text-[var(--c-charcoal)] font-bold text-2xl tracking-tight" style={{ fontFamily: fonts.heading }}>
                      Case #{selectedReport.id.toString().padStart(4, "0")}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2.5 rounded-xl bg-[var(--c-sage)]/20 text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/40 transition-colors border border-[var(--c-borderLight)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 flex flex-col gap-8 grow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-[var(--c-sage)]/20 rounded-2xl p-5 border border-[var(--c-sage)]/40 flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase text-[var(--c-textSecondary)] font-semibold tracking-wider">Date Logged</span>
                      <span className="text-sm font-semibold text-[var(--c-charcoal)] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--c-textSecondary)]" />
                        {formatDateShort(selectedReport.created_at)}
                      </span>
                    </div>

                    <div className="flex-1 bg-[var(--c-sage)]/20 rounded-2xl p-5 border border-[var(--c-sage)]/40 flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase text-[var(--c-textSecondary)] font-semibold tracking-wider">Zone</span>
                      <span className="text-sm font-semibold text-[var(--c-charcoal)] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--c-textSecondary)]" />
                        {selectedReport.pincode}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[var(--c-textSecondary)] uppercase tracking-widest mb-3">Description</h3>
                    <p className="text-[var(--c-charcoal)] text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {selectedReport.description}
                    </p>
                  </div>

                  {selectedReport.department && (
                    <div className="bg-[var(--c-sage)]/30 rounded-2xl p-5 border border-[var(--c-olive)]/20 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[var(--c-sage)]/40 flex items-center justify-center text-[var(--c-olive)] shadow-sm shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] uppercase text-[var(--c-olive)] font-semibold tracking-wider">Assigned Department</span>
                        <p className="text-sm font-semibold text-[var(--c-charcoal)]">{selectedReport.department}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#FFF8E6] rounded-2xl p-5 border border-[#F2DCA2] flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#F2DCA2] flex items-center justify-center text-[var(--c-accentGold)] shadow-sm shrink-0">
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] uppercase text-[var(--c-accentGold)] font-semibold tracking-wider">Community Upvotes</span>
                      <p className="text-sm font-semibold text-[var(--c-charcoal)]">
                        {selectedReport.verification_count || 0} upvote{(selectedReport.verification_count || 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[var(--c-borderLight)] shrink-0 flex items-center justify-between bg-[var(--c-sage)]/10">
                  <button
                    onClick={() => handleVerifyToggle(selectedReport)}
                    disabled={verificationBusyId === selectedReport.id || !selectedReport.can_verify}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                      selectedReport.is_verified_by_me
                        ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-white bg-[var(--c-charcoal)] border-[var(--c-charcoal)]"
                    } ${(!selectedReport.can_verify || verificationBusyId === selectedReport.id) ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <BadgeCheck className="w-4 h-4" />
                    {verificationBusyId === selectedReport.id
                      ? "Syncing..."
                      : selectedReport.is_verified_by_me
                        ? "Remove Upvote"
                        : "Upvote Report"}
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="bg-[var(--c-charcoal)] hover:bg-[var(--c-oliveDark)] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    Close <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight flex items-center gap-3" style={{ fontFamily: fonts.heading }}>
              <BadgeCheck className="w-7 h-7 text-[var(--c-accentGold)]" />
              Community Upvote Feed
            </h1>
            <p className="text-sm text-[var(--c-textSecondary)] mt-2 max-w-2xl">
              Browse other local reports in your pincode before filing a duplicate. Upvoted incidents rise in authority priority.
            </p>
          </div>
          <div className="bg-white border border-[var(--c-borderLight)] rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--c-textSecondary)] shadow-sm">
            {reports.length} report{reports.length === 1 ? "" : "s"} in your pincode
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[320px] text-[var(--c-textSecondary)] bg-white rounded-3xl border border-[var(--c-borderLight)] shadow-sm">
            <Loader variant="spinner" size="xl" />
            <p className="mt-6 text-sm font-medium tracking-wide">Loading community feed...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center bg-white border border-[var(--c-borderLight)] rounded-3xl shadow-sm py-24 px-6">
            <div className="w-20 h-20 bg-[#FFF8E6] rounded-2xl border border-[#F2DCA2] flex items-center justify-center mb-6 shadow-sm">
              <BadgeCheck className="w-8 h-8 text-[var(--c-accentGold)]" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--c-charcoal)] mb-3 tracking-tight" style={{ fontFamily: fonts.heading }}>
              No other local reports yet
            </h3>
            <p className="text-[var(--c-textSecondary)] text-[15px] max-w-md">
              Reports from other people in your pincode will appear here for upvotes instead of duplicate submission.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={`community-${report.id}`}
                report={report}
                mode="user"
                onClick={setSelectedReport}
                onVerifyToggle={handleVerifyToggle}
                verifyLoading={verificationBusyId === report.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
