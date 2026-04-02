// ─────────────────────────────────────────
// components/StatusBadge.jsx
// Reusable badge that displays the status
// of a report. Used in:
// - ReportCard.jsx
// - ReportDetailCard.jsx
// - UserDashboard.jsx  (report list)
// - AuthorityDashboard.jsx (report list)
// - AdminDashboard.jsx (report table)
// ─────────────────────────────────────────

import { Clock, CheckCircle } from "lucide-react";

const StatusBadge = ({ status, size = "default" }) => {

  // ── Size variants ───────────────────────
  const sizeStyles = {
    small:   "text-xs px-2 py-0.5 gap-1",
    default: "text-sm px-3 py-1 gap-1.5",
    large:   "text-base px-4 py-1.5 gap-2",
  };

  // ── Status config ───────────────────────
  const statusConfig = {
    reported: {
      label:     "Reported",
      icon:      <Clock className={size === "small" ? "w-3 h-3" : "w-4 h-4"} />,
      styles:    "bg-gray-500/15 text-gray-700 border border-gray-500/30",
      dot:       "bg-gray-500",
      pulse:     false,
    },
    under_review: {
      label:     "Under Review",
      icon:      <Clock className={size === "small" ? "w-3 h-3" : "w-4 h-4"} />,
      styles:    "bg-yellow-500/15 text-yellow-600 border border-yellow-500/30",
      dot:       "bg-yellow-500",
      pulse:     true,
    },
    in_progress: {
      label:     "In Progress",
      icon:      <Clock className={size === "small" ? "w-3 h-3" : "w-4 h-4"} />,
      styles:    "bg-blue-500/15 text-blue-600 border border-blue-500/30",
      dot:       "bg-blue-500",
      pulse:     true,
    },
    resolved: {
      label:     "Resolved",
      icon:      <CheckCircle className={size === "small" ? "w-3 h-3" : "w-4 h-4"} />,
      styles:    "bg-green-500/15 text-green-600 border border-green-500/30",
      dot:       "bg-green-500",
      pulse:     false,
    },
    closed: {
      label:     "Closed",
      icon:      <CheckCircle className={size === "small" ? "w-3 h-3" : "w-4 h-4"} />,
      styles:    "bg-emerald-700/15 text-emerald-800 border border-emerald-700/30",
      dot:       "bg-emerald-700",
      pulse:     false,
    },
    // Legacy support
    pending: {
      label:     "Pending",
      icon:      <Clock className={size === "small" ? "w-3 h-3" : "w-4 h-4"} />,
      styles:    "bg-yellow-500/15 text-yellow-600 border border-yellow-500/30",
      dot:       "bg-yellow-500",
      pulse:     true,
    },
  };

  // ── Fallback for unknown status ─────────
  const config = statusConfig[status] || {
    label:  status || "Unknown",
    icon:   null,
    styles: "bg-gray-500/15 text-gray-400 border border-gray-500/30",
    dot:    "bg-gray-400",
    pulse:  false,
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeStyles[size] || sizeStyles.default}
        ${config.styles}
      `}
    >
      {/* Animated pulse dot for pending */}
      <span className="relative flex items-center justify-center">
        {config.pulse ? (
          <>
            <span
              className={`
                absolute inline-flex rounded-full opacity-75 animate-ping
                ${size === "small" ? "w-2 h-2" : "w-2.5 h-2.5"}
                ${config.dot}
              `}
            />
            <span
              className={`
                relative inline-flex rounded-full
                ${size === "small" ? "w-2 h-2" : "w-2.5 h-2.5"}
                ${config.dot}
              `}
            />
          </>
        ) : (
          config.icon
        )}
      </span>

      {config.label}
    </span>
  );
};

export default StatusBadge;