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
import { colors, fonts } from "../styles/designTokens";

const Loader = ({ variant = "fullscreen", text = "Loading..." }) => {

  const loaderStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-textPrimary": colors.textPrimary,
    "--c-textSecondary": colors.textSecondary,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  // ═══════════════════════════════════════
  //  VARIANT 1: FULLSCREEN
  //  Covers the entire viewport.
  // ═══════════════════════════════════════
  if (variant === "fullscreen") {
    return (
      <div style={loaderStyle} className="fixed inset-0 z-[9999] bg-[var(--c-offWhite)] flex flex-col items-center justify-center gap-6">
        {/* Animated Logo */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <span className="absolute w-20 h-20 rounded-full bg-[var(--c-olive)]/20 animate-ping" />
          {/* Inner icon circle */}
          <div className="w-16 h-16 bg-[var(--c-sage)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--c-olive)]/10 border border-[var(--c-borderLight)]">
            <MapPin className="w-8 h-8 text-[var(--c-oliveDark)]" />
          </div>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[var(--c-charcoal)] font-black text-2xl tracking-tight" style={{ fontFamily: fonts.heading }}>
            Emergency<span className="text-[var(--c-olive)]">Map</span>
          </span>
          {/* Animated dots */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 bg-[var(--c-olive)]/40 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-[var(--c-olive)]/70 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-[var(--c-olive)] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>

        {/* Loading text */}
        <p className="text-[var(--c-textSecondary)] text-sm font-bold tracking-widest uppercase mt-4">{text}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  VARIANT 2: SECTION
  //  Fills the height of its parent div.
  // ═══════════════════════════════════════
  if (variant === "section") {
    return (
      <div style={loaderStyle} className="flex flex-col items-center justify-center w-full py-20 gap-4">
        {/* Spinning ring */}
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--c-borderLight)] border-t-[var(--c-olive)] animate-spin" />
        </div>
        <p className="text-[var(--c-textSecondary)] text-sm font-bold">{text}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════
  //  VARIANT 3: INLINE
  //  Tiny spinner used inside buttons
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