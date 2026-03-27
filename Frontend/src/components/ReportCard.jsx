// ─────────────────────────────────────────
// components/ReportCard.jsx
// ─────────────────────────────────────────

import { MapPin, Clock, CheckCircle, AlertCircle, User, Building2, BadgeCheck } from "lucide-react";
import { colors, fonts } from "../styles/designTokens";
import { formatDateShort } from "../utils/dateTimeUtils";

const ReportCard = ({
  report,
  mode = "user",
  onClick,
  onVerifyToggle,
  verifyLoading = false,
}) => {
  const isResolved = report.status === "resolved";
  const canShowVerifyAction = mode === "user" && typeof onVerifyToggle === "function";

  const cardStyle = {
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-charcoal": colors.charcoal,
    fontFamily: fonts.body,
  };

  return (
    <div 
      style={cardStyle} 
      onClick={() => onClick && onClick(report)}
      className="group cursor-pointer bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col h-[420px] overflow-hidden hover:-translate-y-1 relative ring-1 ring-inset ring-white/50"
    >
      {/* ── Image Section ── */}
      <div className="relative h-48 w-full bg-[#f8f9fa] overflow-hidden shrink-0 border-b border-[rgba(0,0,0,0.04)]">
        {report.image_url ? (
          <img 
            src={report.image_url} 
            alt="Incident" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-3">
            <AlertCircle className="w-8 h-8 opacity-20" />
            <span className="text-[11px] font-bold tracking-widest uppercase opacity-40">No Image Uploaded</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm border ${
            isResolved 
              ? "bg-white/95 text-[var(--c-oliveDark)] border-[var(--c-sage)]"
              : "bg-white/95 text-[#D4AF37] border-[#D4AF37]/30"
          }`}>
            {isResolved ? <CheckCircle className="w-3.5 h-3.5 text-[var(--c-olive)]" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {isResolved ? "Resolved" : "Pending"}
          </span>
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="p-5 flex flex-col flex-grow">
        
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500 font-medium">
          <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-[var(--c-olive)]" /> {report.pincode}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 opacity-60" /> {formatDateShort(report.created_at)}
          </span>
        </div>

        <p className="text-[var(--c-charcoal)] text-sm leading-relaxed line-clamp-3 mb-4 flex-grow font-medium">
          {report.description}
        </p>

        {/* Footer Data */}
        <div className="mt-auto pt-4 border-t border-[rgba(0,0,0,0.04)] grid gap-2">
          <div className="flex items-center gap-2.5 text-xs text-gray-500">
            <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <BadgeCheck className="w-3 h-3" />
            </div>
            <span className="font-semibold text-[var(--c-charcoal)] truncate">
              {report.verification_count || 0} upvote{(report.verification_count || 0) === 1 ? "" : "s"}
            </span>
          </div>

          {report.department && (
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center text-[var(--c-olive)]">
                <Building2 className="w-3 h-3" />
              </div>
              <span className="font-semibold text-[var(--c-charcoal)] truncate">
                {report.department}
              </span>
            </div>
          )}
          
          {mode === "authority" && (
            <div className="flex items-center gap-2.5 text-xs text-gray-500">
              <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100">
                <User className="w-3 h-3" />
              </div>
              <span className="font-semibold text-[var(--c-charcoal)] truncate">
                {report.reporter_name || "Anonymous Citizen"}
              </span>
            </div>
          )}

          {canShowVerifyAction && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onVerifyToggle(report);
              }}
              disabled={verifyLoading || !report.can_verify}
              className={`mt-2 w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${
                report.is_verified_by_me
                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  : "bg-[var(--c-charcoal)] text-white border-[var(--c-charcoal)] hover:bg-[var(--c-oliveDark)]"
              } ${(!report.can_verify || verifyLoading) ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <BadgeCheck className="w-4 h-4" />
              {verifyLoading
                ? "Syncing..."
                : report.is_verified_by_me
                  ? "Remove Upvote"
                  : report.can_verify
                    ? "Upvote This Report"
                    : "Upvote Unavailable"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
