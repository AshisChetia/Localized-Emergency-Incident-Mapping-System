// ─────────────────────────────────────────
// components/UrgencyBadge.jsx
// Displays the urgency level of a report.
// CRITICAL urgency shows a flashing red
// pulse animation to grab attention.
//
// Used in:
// - ReportCard.jsx
// - ReportDetailCard.jsx
// - DepartmentManagerDashboard.jsx
// ─────────────────────────────────────────

import { AlertTriangle, AlertCircle, Info } from "lucide-react";

const UrgencyBadge = ({ urgency, size = "default" }) => {

  // ── Size variants ───────────────────────
  const sizeStyles = {
    small:   "text-[10px] px-2 py-0.5 gap-1",
    default: "text-xs px-2.5 py-1 gap-1.5",
    large:   "text-sm px-3.5 py-1.5 gap-2",
  };

  const iconSizes = {
    small:   "w-3 h-3",
    default: "w-3.5 h-3.5",
    large:   "w-4 h-4",
  };

  // ── Urgency config ───────────────────────
  const urgencyConfig = {
    low: {
      label:     "Low",
      icon:      Info,
      bg:        "bg-emerald-50",
      text:      "text-emerald-700",
      border:    "border-emerald-200",
      dot:       "bg-emerald-500",
      animate:   false,
    },
    medium: {
      label:     "Medium",
      icon:      AlertCircle,
      bg:        "bg-amber-50",
      text:      "text-amber-700",
      border:    "border-amber-200",
      dot:       "bg-amber-500",
      animate:   false,
    },
    critical: {
      label:     "CRITICAL",
      icon:      AlertTriangle,
      bg:        "bg-red-50",
      text:      "text-red-700",
      border:    "border-red-300",
      dot:       "bg-red-500",
      animate:   true, // Flashing animation for critical
    },
  };

  const normalizedUrgency = (urgency || "medium").toLowerCase();
  const config = urgencyConfig[normalizedUrgency] || urgencyConfig.medium;
  const IconComponent = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-bold tracking-wide uppercase
        ${sizeStyles[size] || sizeStyles.default}
        ${config.bg} ${config.text} border ${config.border}
        ${config.animate ? "urgency-critical-flash" : ""}
      `}
    >
      {/* Animated pulse dot for critical */}
      {config.animate && (
        <span className="relative flex items-center justify-center mr-0.5">
          <span
            className={`
              absolute inline-flex rounded-full opacity-75 animate-ping
              ${size === "small" ? "w-1.5 h-1.5" : "w-2 h-2"}
              ${config.dot}
            `}
          />
          <span
            className={`
              relative inline-flex rounded-full
              ${size === "small" ? "w-1.5 h-1.5" : "w-2 h-2"}
              ${config.dot}
            `}
          />
        </span>
      )}

      <IconComponent className={iconSizes[size] || iconSizes.default} />
      {config.label}

      {/* ── Critical flashing CSS animation ── */}
      {config.animate && (
        <style>{`
          @keyframes urgencyCriticalFlash {
            0%, 100% { 
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
            }
            50% { 
              box-shadow: 0 0 12px 4px rgba(239, 68, 68, 0.25);
            }
          }
          .urgency-critical-flash {
            animation: urgencyCriticalFlash 2s ease-in-out infinite;
          }
        `}</style>
      )}
    </span>
  );
};

export default UrgencyBadge;
