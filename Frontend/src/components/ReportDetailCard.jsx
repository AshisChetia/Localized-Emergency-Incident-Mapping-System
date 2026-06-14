// ─────────────────────────────────────────
// components/ReportDetailCard.jsx
// ─────────────────────────────────────────

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import StatusTimeline from "./StatusTimeline";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { updateReportStatus, updateReportStatusAsDeptManager } from "../services/reportService";
import { colors, fonts } from "../styles/designTokens";
import {
  MapPin, User, Phone, ArrowLeft, CheckCircle,
  RotateCcw, ExternalLink, ImageOff, Clock, FileText,
  AlertCircle, ShieldCheck, CalendarDays, Download, FileText as FileTextIcon, BadgeCheck, Eye, Wrench, Lock
} from "lucide-react";
import { generateDocketPDF } from "../utils/docketGenerator";
import { formatDate } from "../utils/dateTimeUtils";
import UrgencyBadge from "./UrgencyBadge";

const ReportDetailCard = ({ report, mode = "user", onStatusUpdate, onBack }) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const openInMaps = () => {
    // FIXED: Removed the stray '0' and corrected the URL format
    const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
    window.open(url, "_blank", "noopener noreferrer");
  };

  const handleStatusToggle = async (targetStatus = null) => {
    // Determine new status
    let newStatus;
    if (targetStatus) {
      newStatus = targetStatus;
    } else {
      // Legacy toggle for simple pending/resolved
      newStatus = report.status === "pending" ? "resolved" : "pending";
    }
    
    setUpdating(true);
    try {
      if (mode === "department_manager") {
        await updateReportStatusAsDeptManager(report.id, newStatus);
      } else {
        await updateReportStatus(report.id, newStatus);
      }
      toast.success(`Incident status updated to ${newStatus.replace("_", " ")}`);
      if (onStatusUpdate) onStatusUpdate(report.id, newStatus);
      
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status. Please try again.");
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
              Official Incident Record
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyBadge urgency={report.urgency} size="default" />
          <StatusBadge status={report.status} size="default" />
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Status Timeline */}
          <div className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-3xl p-6 sm:p-8 shadow-sm h-full">
            <h4 className="text-sm font-black text-[var(--c-charcoal)] uppercase tracking-wider mb-8 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--c-olive)]" /> Incident Progress
            </h4>
            <StatusTimeline currentStatus={report.status} timestamps={{ reported: report.created_at }} />
          </div>
          
          {/* Right: Data Cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-[var(--c-borderLight)] rounded-2xl p-6 shadow-sm">
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

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white border border-[var(--c-borderLight)] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[10px] text-[var(--c-textSecondary)] uppercase tracking-widest font-black mb-2">
                    <User className="w-3.5 h-3.5 text-blue-500" /> Reporter
                  </div>
                  <p className="text-[var(--c-charcoal)] font-black text-sm truncate">
                    {report.reporter_name || "Unknown"}
                  </p>
                  <p className="text-[var(--c-textSecondary)] text-[10px] mt-0.5 truncate">{report.reporter_number || "No Phone"}</p>
               </div>

               <div className="bg-[#FFF8E6] border border-[#F2DCA2] rounded-2xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                  <div className="flex items-center gap-2 text-[10px] text-[#9a7a00] uppercase tracking-widest font-black mb-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-[var(--c-accentGold)]" /> Upvotes
                  </div>
                  <p className="text-[var(--c-charcoal)] text-xl font-black relative z-10">
                    {report.verification_count || 0}
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* ── Authority/DeptManager/User Export Section ── */}
        {(mode === "authority" || mode === "user" || mode === "department_manager") && (
          <div className="mt-6 p-6 bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-[var(--c-oliveDark)]">
              <FileTextIcon className="w-4 h-4" />
              Official Docket Export
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  setExporting(true);
                  try {
                    await generateDocketPDF(report);
                    toast.success('📄 Official PDF Docket Downloaded!');
                  } catch (e) {
                    const details = e?.message ? ` ${e.message}` : "";
                    toast.error(`PDF export failed.${details}`);
                  } finally {
                    setExporting(false);
                  }
                }}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-2 bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
              >
                {exporting ? <Loader variant="inline" size="sm" /> : (
                  <>
                    <Download className="w-4 h-4" />
                    PDF Docket
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-[var(--c-textSecondary)] mt-3 text-center font-medium uppercase tracking-wider">
              Branded PDF for official records
            </p>
          </div>
        )}

        {/* ── Authority / Dept Manager Action Section ── */}
        {(mode === "authority" || mode === "department_manager") && (
          <div className="mt-4 p-5 sm:p-8 rounded-3xl border border-[var(--c-borderLight)] bg-white shadow-xl">
            <h4 className="text-sm font-black text-[var(--c-charcoal)] uppercase tracking-wider mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--c-olive)]" /> Official Action Panel
            </h4>
            
            <div className="flex flex-wrap gap-3">
              {/* If reported -> Under Review (Authority & DeptMgr) */}
              {(report.status === "reported" || report.status === "pending") && (
                <button
                  onClick={() => handleStatusToggle("under_review")}
                  disabled={updating || exporting}
                  className="flex-1 min-w-[180px] flex items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow hover:-translate-y-0.5"
                >
                  {updating ? <Loader variant="inline" size="sm" /> : <><Eye className="w-4 h-4" /> Begin Review</>}
                </button>
              )}

              {/* If under review -> In Progress (Authority & DeptMgr) */}
              {report.status === "under_review" && (
                <>
                  <button
                    onClick={() => handleStatusToggle("in_progress")}
                    disabled={updating || exporting}
                    className="flex-1 min-w-[180px] flex items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-all shadow hover:-translate-y-0.5"
                  >
                    {updating ? <Loader variant="inline" size="sm" /> : <><Wrench className="w-4 h-4" /> Start Field Work</>}
                  </button>
                  <button
                    onClick={() => handleStatusToggle("reported")}
                    disabled={updating || exporting}
                    className="flex shrink-0 items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Revert
                  </button>
                </>
              )}

              {/* If in progress -> Resolved (Authority & DeptMgr) */}
              {report.status === "in_progress" && (
                <>
                  <button
                    onClick={() => handleStatusToggle("resolved")}
                    disabled={updating || exporting}
                    className="flex-1 min-w-[180px] flex items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-[var(--c-olive)] text-white hover:bg-[var(--c-oliveDark)] transition-all shadow hover:-translate-y-0.5"
                  >
                    {updating ? <Loader variant="inline" size="sm" /> : <><CheckCircle className="w-4 h-4" /> Mark Resolved</>}
                  </button>
                  <button
                    onClick={() => handleStatusToggle("under_review")}
                    disabled={updating || exporting}
                    className="flex shrink-0 items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Revert
                  </button>
                </>
              )}
              
              {/* If resolved -> Closed (Authority ONLY) OR Revert to In Progress */}
              {report.status === "resolved" && (
                <>
                  {mode === "authority" && (
                    <button
                      onClick={() => handleStatusToggle("closed")}
                      disabled={updating || exporting}
                      className="flex-1 min-w-[180px] flex items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-gray-800 text-white hover:bg-black transition-all shadow hover:-translate-y-0.5"
                    >
                      {updating ? <Loader variant="inline" size="sm" /> : <><Lock className="w-4 h-4" /> Officially Close & Archive</>}
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusToggle("in_progress")}
                    disabled={updating || exporting}
                    className={`${mode === "authority" ? "flex shrink-0" : "flex-1 min-w-[180px]"} items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-white border-2 border-[var(--c-accentGold)] text-[var(--c-accentGold)] hover:bg-[var(--c-accentGold)] hover:text-white transition-all`}
                  >
                    <RotateCcw className="w-4 h-4" /> Revert to In Progress
                  </button>
                </>
              )}

              {/* If Closed -> Reopen (Authority & Dept Manager) */}
              {report.status === "closed" && (
                <button
                  onClick={() => handleStatusToggle("in_progress")}
                  disabled={updating || exporting}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold px-6 py-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all shadow-sm"
                >
                  {updating ? <Loader variant="inline" size="sm" /> : <><RotateCcw className="w-4 h-4" /> Reopen Archived Report</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailCard;
