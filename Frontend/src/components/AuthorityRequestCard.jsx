// ─────────────────────────────────────────
// components/AuthorityRequestCard.jsx
// Displays a single pending authority
// registration request for the Super Admin
// to either approve or reject.
//
// Shows: name, email, pincode, department,
// request date and action buttons.
//
// Used in:
// - AdminDashboard.jsx (pending requests)
// ─────────────────────────────────────────

import { useState } from "react";
import toast from "react-hot-toast";
import { approveAuthority, rejectAuthority } from "../services/adminService";
import {
  User,
  Mail,
  MapPin,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

const AuthorityRequestCard = ({ request, onApprove, onReject }) => {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // ── Format date ─────────────────────────
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });

  // ── Days since request ──────────────────
  const daysSince = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  // ═══════════════════════════════════════
  //  APPROVE HANDLER
  // ═══════════════════════════════════════
  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveAuthority(request.id);
      toast.success(
        `${request.name}'s account has been approved!`
      );
      if (onApprove) onApprove(request.id);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to approve request. Please try again.";
      toast.error(msg);
    } finally {
      setApproving(false);
    }
  };

  // ═══════════════════════════════════════
  //  REJECT HANDLER
  // ═══════════════════════════════════════
  const handleReject = async () => {
    // ── Confirm before permanent delete ──
    const confirmed = window.confirm(
      `Are you sure you want to reject ${request.name}'s request? This action cannot be undone.`
    );
    if (!confirmed) return;

    setRejecting(true);
    try {
      await rejectAuthority(request.id);
      toast.success(
        `${request.name}'s request has been rejected`
      );
      if (onReject) onReject(request.id);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to reject request. Please try again.";
      toast.error(msg);
    } finally {
      setRejecting(false);
    }
  };

  const isActionDisabled = approving || rejecting;

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex flex-col gap-4 transition-colors duration-200">

      {/* ── Card Header ──────────────────── */}
      <div className="flex items-start justify-between gap-3">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg shrink-0">
            {(request.name || "A")[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold text-base leading-tight">
              {request.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500 text-xs">
                Authority Request
              </span>
            </div>
          </div>
        </div>

        {/* Pending badge */}
        <span className="shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      </div>

      {/* ── Info Grid ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

        {/* Email */}
        <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-800 rounded-xl px-3 py-2.5">
          <Mail className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Email</p>
            <p className="text-gray-300 text-sm truncate">
              {request.email}
            </p>
          </div>
        </div>

        {/* Department */}
        <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-800 rounded-xl px-3 py-2.5">
          <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Department</p>
            <p className="text-gray-300 text-sm truncate">
              {request.department}
            </p>
          </div>
        </div>

        {/* Pincode */}
        <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-800 rounded-xl px-3 py-2.5">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="text-gray-500 text-xs">Pincode Zone</p>
            <p className="text-gray-300 text-sm font-mono font-semibold">
              {request.pincode}
            </p>
          </div>
        </div>

        {/* Requested date */}
        <div className="flex items-center gap-2 bg-gray-800/60 border border-gray-800 rounded-xl px-3 py-2.5">
          <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <p className="text-gray-500 text-xs">Requested</p>
            <p className="text-gray-300 text-sm">
              {formatDate(request.created_at)}
              <span className="text-gray-600 ml-1.5 text-xs">
                ({daysSince(request.created_at)})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Buttons ────────────────── */}
      <div className="flex items-center gap-3 pt-1">

        {/* Reject Button */}
        <button
          onClick={handleReject}
          disabled={isActionDisabled}
          className="
            flex-1 flex items-center justify-center gap-2
            text-sm font-medium px-4 py-2.5 rounded-xl border
            bg-red-500/10 border-red-500/30 text-red-400
            hover:bg-red-500/20 hover:border-red-500/50
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {rejecting ? (
            <>
              <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              Rejecting...
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              Reject
            </>
          )}
        </button>

        {/* Approve Button */}
        <button
          onClick={handleApprove}
          disabled={isActionDisabled}
          className="
            flex-1 flex items-center justify-center gap-2
            text-sm font-semibold px-4 py-2.5 rounded-xl
            bg-green-600 hover:bg-green-500 text-white
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {approving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Approve
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthorityRequestCard;