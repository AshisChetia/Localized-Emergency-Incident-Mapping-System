// ─────────────────────────────────────────
// components/Loader.jsx
// Reusable loader with 3 variants:
// 1. fullscreen → covers entire page
//    Used during initial auth check
// 2. section    → fills its container
//    Used inside dashboard sections
// 3. inline     → tiny spinner in button
//    Used on submit buttons while loading
// ─────────────────────────────────────────

import { MapPin } from "lucide-react";

const Loader = ({ variant = "fullscreen", text = "Loading..." }) => {

  // ═══════════════════════════════════════
  //  VARIANT 1: FULLSCREEN
  //  Covers the entire viewport.
  //  Used in App.jsx while checking
  //  if user is already authenticated.
  // ═══════════════════════════════════════
  if (variant === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center gap-6">
        {/* Animated Logo */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <span className="absolute w-20 h-20 rounded-full bg-blue-600/20 animate-ping" />
          {/* Inner icon circle */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <MapPin className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-white font-bold text-2xl tracking-tight">
            Emergency<span className="text-blue-400">Map</span>
          </span>
          {/* Animated dots */}
          <div className="flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>

        {/* Loading text */}
        <p className="text-gray-500 text-sm">{text}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  VARIANT 2: SECTION
  //  Fills the height of its parent div.
  //  Used inside dashboards while data
  //  is being fetched from the backend.
  // ═══════════════════════════════════════
  if (variant === "section") {
    return (
      <div className="flex flex-col items-center justify-center w-full py-20 gap-4">
        {/* Spinning ring */}
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">{text}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  VARIANT 3: INLINE
  //  Tiny spinner used inside buttons
  //  while a form is being submitted.
  //  Usage:
  //  <button disabled={loading}>
  //    {loading
  //      ? <Loader variant="inline" />
  //      : "Submit Report"
  //    }
  //  </button>
  // ═══════════════════════════════════════
  if (variant === "inline") {
    return (
      <span className="flex items-center justify-center gap-2">
        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        <span>{text}</span>
      </span>
    );
  }

  return null;
};

export default Loader;