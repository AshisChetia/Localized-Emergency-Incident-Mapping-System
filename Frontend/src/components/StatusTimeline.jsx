// ─────────────────────────────────────────
// components/StatusTimeline.jsx
// Vertical Amazon-style order tracking
// timeline for incident report statuses.
// Shows 5 steps: Reported → Under Review
// → In Progress → Resolved → Closed
// ─────────────────────────────────────────

import { CheckCircle2, Circle, FileText, Eye, Wrench, CheckCheck, Lock } from "lucide-react";

const STEPS = [
  { key: "reported",     label: "Reported",      icon: FileText,   description: "Incident submitted by citizen" },
  { key: "under_review", label: "Under Review",  icon: Eye,        description: "Being reviewed by authority" },
  { key: "in_progress",  label: "In Progress",   icon: Wrench,     description: "Work underway by department" },
  { key: "resolved",     label: "Resolved",      icon: CheckCheck,  description: "Issue has been fixed" },
  { key: "closed",       label: "Closed",        icon: Lock,       description: "Verified & archived" },
];

const StatusTimeline = ({ currentStatus, timestamps = {} }) => {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStatus);
  // If status not found (legacy "pending"), treat as step 0
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="flex flex-col gap-0">
      {STEPS.map((step, index) => {
        const isCompleted = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isFuture = index > activeIndex;
        const isLast = index === STEPS.length - 1;
        const StepIcon = step.icon;
        const timestamp = timestamps[step.key];

        return (
          <div key={step.key} className="flex gap-4">
            {/* Left: Circle + Line */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 shadow-md shadow-emerald-200"
                    : isCurrent
                      ? "bg-emerald-500 shadow-lg shadow-emerald-300 ring-4 ring-emerald-100"
                      : "bg-gray-200"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <StepIcon className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[32px] transition-all ${
                    isCompleted ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Right: Content */}
            <div className={`pb-6 pt-1 ${isLast ? "pb-0" : ""}`}>
              <div
                className={`px-4 py-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-emerald-50 border border-emerald-200"
                    : ""
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    isCompleted || isCurrent
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                  {timestamp && (
                    <span className="font-normal text-xs text-gray-500 ml-2">
                      {new Date(timestamp).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isCompleted || isCurrent ? "text-gray-500" : "text-gray-300"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
