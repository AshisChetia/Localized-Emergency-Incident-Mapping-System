// ─────────────────────────────────────────
// components/ReportCard.jsx
// ─────────────────────────────────────────

import { MapPin, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { colors, fonts } from "../styles/designTokens";

const ReportCard = ({ report, mode = "user", onClick }) => {
  const isResolved = report.status === "resolved";

  const cardStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown date";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short", day: "numeric", year: "numeric"
    });
  };

  return (
    <div 
      style={cardStyle} 
      onClick={() => onClick && onClick(report)}
      className="group cursor-pointer bg-white border border-[var(--c-borderLight)] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col transform hover:-translate-y-1"
    >
      {/* ── Image Section ── */}
      <div className="relative h-48 w-full bg-[var(--c-sage)]/20 overflow-hidden shrink-0 border-b border-[var(--c-borderLight)]">
        {report.image_url ? (
          <img 
            src={report.image_url} 
            alt="Incident" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[var(--c-muted)] gap-2">
            <AlertCircle className="w-8 h-8 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
          </div>
        )}
        
        {/* Absolute Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isResolved ? (
            <span className="flex items-center gap-1.5 bg-[var(--c-sage)]/95 backdrop-blur-md text-[var(--c-oliveDark)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-[var(--c-olive)]/20">
              <CheckCircle className="w-3.5 h-3.5" /> Resolved
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-[#FFF8E6]/95 backdrop-blur-md text-[var(--c-accentGold)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#F2DCA2]">
              <AlertCircle className="w-3.5 h-3.5" /> Pending
            </span>
          )}
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="p-6 flex flex-col flex-grow bg-white">
        
        <div className="flex items-center justify-between mb-4">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--c-charcoal)] bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] px-3 py-1.5 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-[var(--c-olive)]" /> {report.pincode}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--c-textSecondary)] font-medium">
            <Clock className="w-3.5 h-3.5 opacity-70" /> {formatDate(report.created_at)}
          </span>
        </div>

        <p className="text-[var(--c-charcoal)] text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
          {report.description}
        </p>

        {mode === "authority" && (
          <div className="mt-auto pt-4 border-t border-[var(--c-borderLight)]">
            <div className="flex items-center gap-2 text-xs text-[var(--c-textSecondary)] bg-[var(--c-offWhite)] p-2.5 rounded-xl border border-[var(--c-borderLight)]">
              <div className="w-6 h-6 rounded-full bg-[var(--c-accentGold)]/20 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-[var(--c-accentGold)]" />
              </div>
              <span className="font-bold truncate text-[var(--c-charcoal)]">
                {report.reporter_name || "Citizen Reporter"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;