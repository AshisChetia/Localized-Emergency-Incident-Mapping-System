// ─────────────────────────────────────────
// components/ReportDetailCard.jsx
// ─────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { updateReportStatus } from "../services/reportService";
import { colors, fonts } from "../styles/designTokens";
import {
  MapPin, User, Mail, Hash, ArrowLeft, CheckCircle,
  RotateCcw, ExternalLink, ImageOff, Clock, FileText,
  AlertCircle, ShieldCheck, CalendarDays
} from "lucide-react";

const ReportDetailCard = ({ report, mode = "user", onStatusUpdate, onBack }) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [imgError, setImgError] = useState(false);

  const detailStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-textSecondary": colors.textSecondary,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  if (!report) return <Loader variant="section" text="Syncing report details..." />;

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

  const openInMaps = () => {
    // FIXED: Removed the stray '0' and corrected the URL format
    const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
    window.open(url, "_blank", "noopener noreferrer");
  };

  const handleStatusToggle = async () => {
    const newStatus = report.status === "pending" ? "resolved" : "pending";
    setUpdating(true);
    try {
      await updateReportStatus(report.id, newStatus);
      toast.success(`Incident status updated to ${newStatus}`);
      if (onStatusUpdate) onStatusUpdate(report.id, newStatus);
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={detailStyle} className="bg-white/95 backdrop-blur-md border border-[var(--c-borderLight)] rounded-3xl overflow-hidden w-full shadow-2xl animate-modal-slide">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--c-borderLight)] bg-[var(--c-offWhite)]/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack ? onBack : () => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-[var(--c-borderLight)] text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h3 className="text-lg font-black text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>
               Incident Report
            </h3>
            <div className="flex items-center gap-1.5 text-[var(--c-textSecondary)] text-xs font-bold uppercase tracking-widest">
              <Hash className="w-3 h-3" /> #{report.id}
            </div>
          </div>
        </div>
        <StatusBadge status={report.status} size="default" />
      </div>

      <div className="p-6 sm:p-8 flex flex-col gap-8">
        
        {/* ── Image Section ── */}
        <div className="relative w-full h-72 sm:h-96 bg-[var(--c-offWhite)] rounded-3xl overflow-hidden border border-[var(--c-borderLight)] shadow-inner">
          {!imgError && report.image_url ? (
            <>
              <img
                src={report.image_url}
                alt="Incident Evidence"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
              <a
                href={report.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-[var(--c-charcoal)]/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-lg"
              >
                <ExternalLink className="w-4 h-4" /> View Full Evidence
              </a>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[var(--c-offWhite)]">
              <ImageOff className="w-12 h-12 text-gray-300" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Evidence Unavailable</p>
            </div>
          )}
        </div>

        {/* ── Info Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left: Description & Location */}
          <div className="flex flex-col gap-6">
            <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-[var(--c-textSecondary)] uppercase tracking-widest font-black mb-4">
                <FileText className="w-4 h-4 text-[var(--c-olive)]" />
                Detailed Description
              </div>
              <p className="text-[var(--c-charcoal)] text-sm leading-relaxed font-medium">
                {report.description}
              </p>
            </div>

            <div className="bg-[var(--c-sage)]/20 border border-[var(--c-olive)]/10 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs text-[var(--c-oliveDark)] uppercase tracking-widest font-black">
                  <MapPin className="w-4 h-4" /> Location Details
                </div>
                <span className="text-xs font-black bg-white border border-[var(--c-olive)]/20 px-3 py-1 rounded-full text-[var(--c-oliveDark)]">
                  ZONE {report.pincode}
                </span>
              </div>
              <button
                onClick={openInMaps}
                className="w-full flex items-center justify-center gap-2 bg-white border border-[var(--c-borderLight)] text-[var(--c-charcoal)] font-bold text-xs py-3 rounded-xl hover:bg-[var(--c-offWhite)] transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4 text-[var(--c-olive)]" />
                Pinpoint on Google Maps
              </button>
            </div>
          </div>

          {/* Right: Reporter & Timestamps */}
          <div className="flex flex-col gap-6">
             <div className="bg-white border border-[var(--c-borderLight)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-[var(--c-textSecondary)] uppercase tracking-widest font-black mb-5">
                  <User className="w-4 h-4 text-blue-500" /> Reporter Information
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] flex items-center justify-center text-[var(--c-charcoal)] text-xl font-black shadow-sm">
                    {(report.reporter_name || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--c-charcoal)] font-black text-base truncate">
                      {report.reporter_name || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[var(--c-textSecondary)] text-xs mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{report.reporter_email || "Not Provided"}</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-white border border-[var(--c-borderLight)] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-[var(--c-textSecondary)] uppercase tracking-widest font-black mb-5">
                  <Clock className="w-4 h-4 text-[var(--c-accentGold)]" /> System Timestamps
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-1">
                      <span className="text-[var(--c-textSecondary)] text-[10px] font-bold uppercase">Date</span>
                      <span className="text-[var(--c-charcoal)] text-sm font-bold flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" /> {formatDate(report.created_at)}
                      </span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[var(--c-textSecondary)] text-[10px] font-bold uppercase">Exact Time</span>
                      <span className="text-[var(--c-charcoal)] text-sm font-bold">{formatTime(report.created_at)}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* ── Authority Action Section ── */}
        {mode === "authority" && (
          <div className={`mt-4 p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg ${
            report.status === "pending" ? "bg-[#FFF8E6] border-[#F2DCA2]" : "bg-[var(--c-sage)]/30 border-[var(--c-olive)]/20"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                report.status === "pending" ? "bg-amber-100" : "bg-[var(--c-sage)]"
              }`}>
                {report.status === "pending" ? <AlertCircle className="w-6 h-6 text-[var(--c-accentGold)]" /> : <ShieldCheck className="w-6 h-6 text-[var(--c-oliveDark)]" />}
              </div>
              <div className="text-center sm:text-left">
                <p className={`text-base font-black ${report.status === "pending" ? "text-amber-800" : "text-[var(--c-oliveDark)]"}`}>
                  {report.status === "pending" ? "Awaiting Municipal Action" : "Incident Resolved Successfully"}
                </p>
                <p className="text-[var(--c-textSecondary)] text-xs font-bold mt-1 uppercase tracking-tight">
                  {report.status === "pending" ? "Resolution required for Zone Public Safety" : "Case closed. Incident records archived."}
                </p>
              </div>
            </div>

            <button
              onClick={handleStatusToggle}
              disabled={updating}
              className={`min-w-[180px] flex items-center justify-center gap-2 text-sm font-black px-8 py-3.5 rounded-2xl transition-all shadow-md transform hover:-translate-y-1 ${
                report.status === "pending"
                  ? "bg-[var(--c-olive)] text-white hover:bg-[var(--c-oliveDark)]"
                  : "bg-white border-2 border-[var(--c-accentGold)] text-[var(--c-accentGold)] hover:bg-[var(--c-accentGold)] hover:text-white"
              }`}
            >
              {updating ? <Loader variant="inline" text="Syncing..." /> : report.status === "pending" ? <><CheckCircle className="w-4 h-4" /> Mark Resolved</> : <><RotateCcw className="w-4 h-4" /> Reopen Incident</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailCard;