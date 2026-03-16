// ─────────────────────────────────────────
// components/ReportDetailCard.jsx
// Shows the full details of a single
// report. Displays everything:
// image, description, location, reporter
// info, timestamps and status.
//
// Has two modes:
// 1. user      → read only, no actions
// 2. authority → status toggle button
//
// Used in:
// - AuthorityDashboard.jsx (detail view)
// ─────────────────────────────────────────

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import Loader from "./Loader";
import toast from "react-hot-toast";
import { updateReportStatus } from "../services/reportService";
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Hash,
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  ImageOff,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

const ReportDetailCard = ({ report, mode = "user", onStatusUpdate, onBack }) => {
  const navigate   = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!report) {
    return <Loader variant="section" text="Loading report details..." />;
  }

  // ── Format helpers ──────────────────────
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day:     "2-digit",
      month:   "long",
      year:    "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-IN", {
      hour:   "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  // ── Open in Google Maps ─────────────────
  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${report.latitude},${report.longitude}`;
    window.open(url, "_blank", "noopener noreferrer");
  };

  // ═══════════════════════════════════════
  //  STATUS TOGGLE
  //  Authority only
  // ═══════════════════════════════════════
  const handleStatusToggle = async () => {
    const newStatus =
      report.status === "pending" ? "resolved" : "pending";

    setUpdating(true);
    try {
      await updateReportStatus(report.id, newStatus);
      toast.success(`Report marked as ${newStatus}`);
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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden w-full">

      {/* ── Header ───────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={onBack ? onBack : () => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-gray-700">|</span>

          {/* Report ID */}
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Hash className="w-4 h-4" />
            <span>Report #{report.id}</span>
          </div>
        </div>

        {/* Status Badge */}
        <StatusBadge status={report.status} size="default" />
      </div>

      {/* ── Image Section ─────────────────── */}
      <div className="relative w-full h-64 sm:h-80 bg-gray-800">
        {!imgError && report.image_url ? (
          <>
            <img
              src={report.image_url}
              alt="Incident"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            {/* Open full image overlay */}
            <a
              href={report.image_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-black/90 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Full Image
            </a>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ImageOff className="w-12 h-12 text-gray-600" />
            <p className="text-gray-600 text-sm">Image unavailable</p>
          </div>
        )}
      </div>

      {/* ── Content Body ─────────────────── */}
      <div className="p-6 flex flex-col gap-6">

        {/* ── Description ─────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Incident Description
          </div>
          <p className="text-gray-200 text-sm leading-relaxed bg-gray-800/60 border border-gray-800 rounded-xl px-4 py-3">
            {report.description}
          </p>
        </div>

        {/* ── Info Grid ───────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Location */}
          <div className="bg-gray-800/60 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Location Details
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Pincode</span>
                <span className="text-blue-400 text-sm font-semibold">
                  {report.pincode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Latitude</span>
                <span className="text-gray-300 text-xs font-mono">
                  {report.latitude}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Longitude</span>
                <span className="text-gray-300 text-xs font-mono">
                  {report.longitude}
                </span>
              </div>
            </div>
            {/* Open in Maps button */}
            <button
              onClick={openInMaps}
              className="mt-1 w-full flex items-center justify-center gap-2 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </button>
          </div>

          {/* Reporter Info */}
          <div className="bg-gray-800/60 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Reporter Info
            </div>
            <div className="flex flex-col gap-2">
              {/* Reporter name */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                  {(report.reporter_name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-medium">
                    {report.reporter_name || "Unknown User"}
                  </p>
                  <p className="text-gray-600 text-xs">Citizen</p>
                </div>
              </div>

              {/* Reporter email */}
              {report.reporter_email && (
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {report.reporter_email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-800/60 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 sm:col-span-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Timestamps
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-xs">Reported On</span>
                <span className="text-gray-300 text-sm font-medium">
                  {formatDate(report.created_at)}
                </span>
                <span className="text-gray-600 text-xs">
                  {formatTime(report.created_at)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-gray-500 text-xs">Current Status</span>
                <StatusBadge status={report.status} size="small" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Authority Action Section ──────── */}
        {mode === "authority" && (
          <div
            className={`
              flex flex-col sm:flex-row items-start sm:items-center
              justify-between gap-4 p-4 rounded-xl border
              ${report.status === "pending"
                ? "bg-yellow-500/5 border-yellow-500/20"
                : "bg-green-500/5 border-green-500/20"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-5 h-5 mt-0.5 shrink-0 ${
                  report.status === "pending"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              />
              <div>
                <p
                  className={`text-sm font-medium ${
                    report.status === "pending"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {report.status === "pending"
                    ? "This report is awaiting resolution"
                    : "This report has been resolved"}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {report.status === "pending"
                    ? "Mark as resolved once the issue has been addressed"
                    : "You can reopen this report if the issue recurs"}
                </p>
              </div>
            </div>

            {/* Toggle button */}
            <button
              onClick={handleStatusToggle}
              disabled={updating}
              className={`
                shrink-0 flex items-center gap-2 text-sm font-semibold
                px-5 py-2.5 rounded-xl border transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                ${report.status === "pending"
                  ? "bg-green-600 hover:bg-green-500 border-green-600 text-white"
                  : "bg-yellow-600/20 hover:bg-yellow-600/30 border-yellow-500/40 text-yellow-400"
                }
              `}
            >
              {updating ? (
                <>
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Updating...
                </>
              ) : report.status === "pending" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark as Resolved
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Reopen Report
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailCard;