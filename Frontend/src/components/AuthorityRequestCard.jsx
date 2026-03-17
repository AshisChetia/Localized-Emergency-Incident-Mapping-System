// ─────────────────────────────────────────
// components/AuthorityRequestCard.jsx
// ─────────────────────────────────────────

import { useState } from "react";
import { ShieldAlert, Mail, MapPin, Clock, Check, X } from "lucide-react";
import { colors, fonts } from "../styles/designTokens";
import Loader from "./Loader";

const AuthorityRequestCard = ({ request, onApprove, onReject }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    await onApprove(request.id);
    setIsApproving(false);
  };

  const handleReject = async () => {
    setIsRejecting(true);
    await onReject(request.id);
    setIsRejecting(false);
  };

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

  return (
    <div style={cardStyle} className="bg-white border border-[var(--c-borderLight)] rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col gap-6">
      
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FFF8E6] border border-[#F2DCA2] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-[var(--c-accentGold)]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-black text-[var(--c-charcoal)] truncate" style={{ fontFamily: fonts.heading }}>
              {request.name}
            </h3>
            <p className="text-xs font-bold text-[var(--c-textSecondary)] uppercase tracking-wider truncate mt-0.5">
              {request.department}
            </p>
          </div>
        </div>
        <span className="bg-[#FFF8E6] text-[var(--c-accentGold)] border border-[#F2DCA2] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shrink-0 shadow-sm">
          Pending
        </span>
      </div>

      {/* ── DETAILS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--c-offWhite)] rounded-2xl p-4 border border-[var(--c-borderLight)]">
        
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider">Email</p>
            <p className="text-sm font-medium text-[var(--c-charcoal)] truncate">{request.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-[var(--c-olive)] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider">Jurisdiction</p>
            <p className="text-sm font-bold text-[var(--c-charcoal)] truncate">{request.pincode}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:col-span-2">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[var(--c-textSecondary)] uppercase tracking-wider">Requested On</p>
            <p className="text-sm font-medium text-[var(--c-charcoal)] truncate">
              {new Date(request.created_at).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </p>
          </div>
        </div>

      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex items-center gap-3 mt-auto">
        <button
          onClick={handleReject}
          disabled={isRejecting || isApproving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isRejecting ? <Loader variant="spinner" size="sm" /> : <><X className="w-4 h-4" /> Reject</>}
        </button>
        <button
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] text-white font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isApproving ? <Loader variant="spinner" size="sm" /> : <><Check className="w-4 h-4" /> Approve</>}
        </button>
      </div>

    </div>
  );
};

export default AuthorityRequestCard;