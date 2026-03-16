// ─────────────────────────────────────────
// components/ReportCard.jsx
// Displays a single report in a card view.
// Has two display modes:
// 1. user      → citizen sees own reports
//               no action buttons
// 2. authority → authority sees reports in
//               their pincode with status
//               toggle button
//
// Used in:
// - UserDashboard.jsx
// - AuthorityDashboard.jsx
// ─────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import toast from "react-hot-toast";
import { updateReportStatus } from "../services/reportService";
import {
  MapPin,
  Calendar,
  User,
  ChevronRight,
  CheckCircle,
  RotateCcw,
  ImageOff,
  Clock,
} from "lucide-react";

const ReportCard = ({ report, mode = "user", onStatusUpdate }) => {
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ── Format date ─────────────────────────
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day:   "2-digit",
      month: "short",
      year:  "numeric",
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", {
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ── Time ago helper ─────────────────────
  const timeAgo = (dateStr) => {
    const now      = new Date();
    const created  = new Date(dateStr);
    const diffMs   = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs  = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1)  return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs  < 24) return `${diffHrs}h ago`;
    if (diffDays < 7)  return `${diffDays}d ago`;
    return formatDate(dateStr);
  };

  // ═══════════════════════════════════════
  //  STATUS TOGGLE HANDLER
  //  Authority only → flips between
  //  pending ↔ resolved
  // ═══════════════════════════════════════
  const handleStatusToggle = async (e) => {
    e.stopPropagation(); // prevent card click nav

    const newStatus =
      report.status === "pending" ? "resolved" : "pending";

    setUpdating(true);
    try {
      await updateReportStatus(report.id, newStatus);
      toast.success(
        `Report marked as ${newStatus}`
      );
      if (onStatusUpdate) onStatusUpdate(report.id, newStatus);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to update status. Please try again.";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  // ── Navigate to detail view ─────────────
  const handleCardClick = () => {
    if (mode === "user") {
      navigate(`/user/dashboard`);
    } else if (mode === "authority") {
      navigate(`/authority/reports/${report.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/20 flex flex-col"
    >
      {/* ── Report Image ─────────────────── */}
      <div className="relative h-44 bg-gray-800 overflow-hidden shrink-0">
        {!imgError && report.image_url ? (
          <img
            src={report.image_url}
            alt="Incident"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageOff className="w-8 h-8 text-gray-600" />
            <span className="text-gray-600 text-xs">No image</span>
          </div>
        )}

        {/* Status Badge overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={report.status} size="small" />
        </div>

        {/* Time ago overlay */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-gray-300 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(report.created_at)}
        </div>
      </div>

      {/* ── Card Body ────────────────────── */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
          {report.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-col gap-1.5">

          {/* Location */}
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              {report.latitude?.toFixed(4)},&nbsp;
              {report.longitude?.toFixed(4)}
              &nbsp;•&nbsp;
              <span className="text-blue-400 font-medium">
                {report.pincode}
              </span>
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>
              {formatDate(report.created_at)}&nbsp;at&nbsp;
              {formatTime(report.created_at)}
            </span>
          </div>

          {/* Reporter name (authority mode only) */}
          {mode === "authority" && report.reporter_name && (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>
                Reported by&nbsp;
                <span className="text-gray-300 font-medium">
                  {report.reporter_name}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ── Card Footer ──────────────────── */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800 mt-auto">

          {/* View details link */}
          <span className="text-blue-400 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </span>

          {/* Authority action button */}
          {mode === "authority" && (
            <button
              onClick={handleStatusToggle}
              disabled={updating}
              className={`
                flex items-center gap-1.5 text-xs font-medium px-3 py-1.5
                rounded-lg border transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                ${report.status === "pending"
                  ? "border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/20"
                  : "border-yellow-500/40 text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20"
                }
              `}
            >
              {updating ? (
                <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : report.status === "pending" ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              {updating
                ? "Updating..."
                : report.status === "pending"
                ? "Mark Resolved"
                : "Reopen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;