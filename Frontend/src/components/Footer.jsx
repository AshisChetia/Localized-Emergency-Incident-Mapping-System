// ─────────────────────────────────────────
// components/Footer.jsx
// ─────────────────────────────────────────

import { Link, useLocation } from "react-router-dom";
import { MapPin, Github, Mail, ShieldCheck, ArrowUpRight } from "lucide-react";
import { colors, fonts } from "../styles/designTokens";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  // ── THE ULTIMATE RULE ──────────────────────────────────
  // If the user is NOT on the exact landing page ("/"), 
  // hide the footer completely.
  if (!isLanding) {
    return null;
  }

  // Map tokens to CSS variables for dynamic hover effects
  const footerStyle = {
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

  return (
    <footer
      style={footerStyle}
      className="bg-[var(--c-offWhite)] border-t border-[var(--c-borderLight)] mt-auto w-full px-0"
    >
      <div className="max-w-7xl mx-auto py-12 lg:py-16 px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12">
          
          {/* ── Brand Column ── */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-10 h-10 rounded-full bg-[var(--c-sage)] flex items-center justify-center group-hover:bg-[var(--c-olive)] transition-colors duration-500 shadow-sm">
                <MapPin className="w-5 h-5 text-[var(--c-oliveDark)] group-hover:text-[var(--c-offWhite)] transition-colors duration-500" strokeWidth={1.5} />
              </div>
              <span className="text-[var(--c-charcoal)] font-bold text-xl tracking-tight" style={{ fontFamily: fonts.heading }}>
                LEI<span className="text-[var(--c-accentGold)] font-medium italic">MS</span>
              </span>
            </Link>
            <p className="text-[var(--c-textSecondary)] text-base leading-relaxed max-w-sm">
              A community-driven platform streamlining civic reporting through automated geographic routing. Connecting citizens to local authorities with precision.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--c-oliveDark)] bg-[var(--c-sage)]/50 w-fit px-3 py-1.5 rounded-full mt-2" style={{ fontFamily: fonts.heading }}>
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
              Secured & Verified
            </div>
          </div>

          {/* ── Quick Links Column ── */}
          <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-5">
            <h4 className="text-[var(--c-charcoal)] font-bold text-sm uppercase tracking-widest" style={{ fontFamily: fonts.heading }}>
              Platform
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/admin/login" className="text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] text-sm font-medium transition-colors w-fit flex items-center gap-1 group">
                Super Admin <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
          </div>

          {/* ── Contact Column ── */}
          <div className="md:col-span-4 lg:col-span-5 flex flex-col gap-5">
            <h4 className="text-[var(--c-charcoal)] font-bold text-sm uppercase tracking-widest" style={{ fontFamily: fonts.heading }}>
              Connect
            </h4>
            <div className="flex flex-col gap-4">
              <a href="mailto:support@emergencymap.com" className="flex items-center gap-3 text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] text-sm font-medium transition-colors w-fit group">
                <div className="p-2 rounded-full bg-[var(--c-sage)]/50 group-hover:bg-[var(--c-sage)] transition-colors">
                   <Mail className="w-4 h-4 text-[var(--c-oliveDark)]" strokeWidth={1.5} />
                </div>
                support@emergencymap.com
              </a>
              <a href="https://github.com/AshisChetia/Localized-Emergency-Incident-Mapping-System" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] text-sm font-medium transition-colors w-fit group">
                 <div className="p-2 rounded-full bg-[var(--c-sage)]/50 group-hover:bg-[var(--c-sage)] transition-colors">
                   <Github className="w-4 h-4 text-[var(--c-oliveDark)]" strokeWidth={1.5} />
                </div>
                Open Source Repository
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-16 pt-8 border-t border-[var(--c-borderLight)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--c-muted)] text-sm font-medium">
            © {currentYear} EmergencyMap. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--c-olive)]"></span>
            <p className="text-[var(--c-muted)] text-sm font-medium">
              Built for local communities in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;