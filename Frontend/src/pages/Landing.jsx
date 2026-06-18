// ─────────────────────────────────────────
// pages/Landing.jsx v2
// Ultra-Smooth, Bento-Grid Awwwards Style
// ─────────────────────────────────────────

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, fonts } from "../styles/designTokens";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MapPin, ShieldCheck, Server, Globe, BarChart3, Cloud, Camera, UserCheck, Brain, MessageSquare, ThumbsUp, Users, Map } from "lucide-react";
import { useRef } from "react";

// ── Ultra-Smooth Beziers ──
const customEase = [0.16, 1, 0.3, 1]; // Apple-like smooth decel

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: customEase } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.8, ease: customEase } 
  }
};

const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const heroRef = useRef(null);

  // Very subtle zoom parallax for the hero image/bg to avoid lag
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yHeroBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const dashboardLink =
    user?.role === "admin" ? "/admin/dashboard" :
    user?.role === "authority" ? "/authority/dashboard" :
    "/user/dashboard";

  const pageStyle = {
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
    <div style={pageStyle} className="w-full bg-[var(--c-offWhite)] text-[var(--c-textPrimary)] antialiased selection:bg-[var(--c-olive)] selection:text-white overflow-hidden">
      
      {/* ── HERO SECTION ── */}
      <section id="hero" ref={heroRef} className="relative min-h-[95dvh] flex items-center justify-center pt-24 px-6 overflow-hidden scroll-mt-28">
        
        {/* Abstract Minimal Background Pattern instead of heavy Blobs */}
        <motion.div 
          style={{ y: yHeroBg, opacity: opacityHero }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"
        />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-start gap-8"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--c-borderLight)] bg-white/50 backdrop-blur-sm shadow-sm">
            <Globe className="w-4 h-4 text-[var(--c-olive)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--c-oliveDark)]">
              Next-Gen Civic Infrastructure
            </span>
          </motion.div>
          
          <motion.div variants={fadeUp} className="w-full">
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tight text-[var(--c-charcoal)] leading-[1.05]" style={{ fontFamily: fonts.heading }}>
              Connecting citizens.
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-medium tracking-tight text-[var(--c-olive)] leading-[1.05]" style={{ fontFamily: fonts.heading }}>
              Empowering Authorities.
            </h1>
          </motion.div>
          
          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-[var(--c-textSecondary)] max-w-2xl leading-relaxed font-light">
            A hyper-localized reporting engine. We automatically route your civic issues to the exact municipal authority using precision HTML5 Geolocation.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row flex-wrap gap-4 mt-4 w-full sm:w-auto justify-center sm:justify-start">
            {isAuthenticated ? (
              <Link to={dashboardLink} className="group relative overflow-hidden bg-[var(--c-olive)] text-white px-8 py-4 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]">
                <span className="relative z-10">Access Dashboard</span>
                <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="group relative overflow-hidden bg-[var(--c-charcoal)] text-white px-8 py-4 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <span className="relative z-10">Join as Citizen</span>
                  <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/authority/register" className="group relative border border-[var(--c-borderLight)] bg-white text-[var(--c-charcoal)] px-8 py-4 rounded-full font-medium text-lg flex items-center justify-center transition-all hover:border-[var(--c-olive)] hover:bg-[var(--c-offWhite)]">
                  Authority Portal
                </Link>
                <Link to="/department-manager/login" className="group relative border-2 border-[var(--c-sage)] bg-[var(--c-sage)]/10 text-[var(--c-charcoal)] px-8 py-4 rounded-full font-medium text-lg flex items-center justify-center transition-all hover:border-[var(--c-sage)] hover:bg-[var(--c-sage)]/20">
                  Team Member Login
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ── MARQUEE SECTION ── */}
      <div className="py-12 bg-[var(--c-sage)]/20 border-y border-[var(--c-sage)]/30 overflow-hidden flex whitespace-nowrap">
        <motion.div 
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex gap-16 item-center font-bold uppercase tracking-widest text-[#5B6E4A] text-lg lg:text-2xl"
          style={{ fontFamily: fonts.heading }}
        >
          {Array(8).fill("PRECISION ROUTING • LIVE TRACKING • AUTONOMOUS ALERTS • SECURE ENFORCEMENT •").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* ── BENTO GRID FEATURES ── */}
      <section className="py-32 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            id="purpose"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-20 max-w-2xl scroll-mt-28"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-medium text-[var(--c-charcoal)] mb-6 tracking-tight" style={{ fontFamily: fonts.heading }}>
              Engineered for absolute municipal clarity.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl text-[var(--c-textSecondary)] font-light leading-relaxed">
              We eliminated bureaucratic middle-men. Our architecture relies on strict GPS to Pincode mappings, ensuring only the responsible jurisdiction receives the report.
            </motion.p>
          </motion.div>

          {/* Grid Layout Container */}
          <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[300px] scroll-mt-28">
            
            {/* Block 1 - Wide: AI Urgency Detection */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
              className="md:col-span-2 relative bg-[var(--c-oliveDark)] text-white rounded-[2rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden group min-h-[300px] md:min-h-0"
            >
              <div className="relative z-10 w-full md:w-3/4">
                <Brain className="w-10 h-10 text-[var(--c-sage)] mb-6" />
                <h3 className="text-3xl font-medium mb-4" style={{ fontFamily: fonts.heading }}>Gemini AI Triage</h3>
                <p className="text-[var(--c-sage)] text-lg">Every uploaded photo is processed by Google Gemini Vision AI to automatically categorize the hazard and calculate an urgency severity matrix.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-[var(--c-olive)] to-transparent opacity-50 rounded-tl-full blur-2xl group-hover:opacity-80 transition-opacity"></div>
            </motion.div>

            {/* Block 2 - Square: Zero-Click Geocoding */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
              className="bg-[var(--c-offWhite)] rounded-[2rem] p-8 md:p-10 flex flex-col justify-between border border-[var(--c-borderLight)] overflow-hidden group hover:border-[var(--c-sage)] transition-colors min-h-[300px] md:min-h-0"
            >
              <div className="relative z-10">
                <MapPin className="w-10 h-10 text-[var(--c-oliveDark)] mb-6" />
                <h3 className="text-2xl font-medium text-[var(--c-charcoal)] mb-4" style={{ fontFamily: fonts.heading }}>Zero-Click GPS</h3>
                <p className="text-[var(--c-textSecondary)]">Precise HTML5 Geolocation enforces strict zonal isolation based on coordinate capturing.</p>
              </div>
            </motion.div>

            {/* Block 3 - Square: Community Consensus */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
              className="bg-[var(--c-charcoal)] text-white rounded-[2rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group min-h-[300px] md:min-h-0"
            >
              <div className="relative z-10">
                <ThumbsUp className="w-10 h-10 text-[var(--c-accentGold)] mb-6" />
                <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: fonts.heading }}>Community Upvoting</h3>
                <p className="text-gray-400">Citizens democratically elevate critical infrastructure failures through localized consensus.</p>
              </div>
            </motion.div>

            {/* Block 4 - Wide: Quad-Department & Analytics */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
              className="md:col-span-2 bg-gradient-to-br from-[#F4F1E1] to-white rounded-[2rem] p-8 md:p-10 flex flex-col justify-between border border-[var(--c-borderLight)] group hover:border-[var(--c-olive)] transition-colors relative overflow-hidden min-h-[300px] md:min-h-0"
            >
              <div className="relative z-10 w-full md:w-2/3">
                <Users className="w-10 h-10 text-[var(--c-olive)] mb-6" />
                <h3 className="text-3xl font-medium text-[var(--c-charcoal)] mb-4" style={{ fontFamily: fonts.heading }}>Quad-Department Routing</h3>
                <p className="text-[var(--c-textSecondary)] text-lg">Incidents are seamlessly delegated to distinct department managers (PWD, Water, Electricity, Garbage) with interactive performance analytics.</p>
              </div>
              <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden md:flex items-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                <motion.div initial={{ height: "40%" }} whileHover={{ height: "80%" }} className="w-8 h-20 bg-[var(--c-oliveDark)] rounded-t-lg transition-all"></motion.div>
                <motion.div initial={{ height: "60%" }} whileHover={{ height: "100%" }} className="w-8 h-32 bg-[var(--c-olive)] rounded-t-lg transition-all"></motion.div>
                <motion.div initial={{ height: "80%" }} whileHover={{ height: "60%" }} className="w-8 h-40 bg-[var(--c-sage)] rounded-t-lg transition-all"></motion.div>
              </div>
            </motion.div>

            {/* Block 5 - Wide: Direct Communication */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
              className="md:col-span-2 relative bg-[var(--c-offWhite)] rounded-[2rem] p-8 md:p-10 flex flex-col justify-between border border-[var(--c-borderLight)] overflow-hidden group hover:border-[var(--c-sage)] transition-colors min-h-[300px] md:min-h-0"
            >
              <div className="relative z-10 w-full md:w-3/4">
                <MessageSquare className="w-10 h-10 text-[var(--c-oliveDark)] mb-6" />
                <h3 className="text-3xl font-medium text-[var(--c-charcoal)] mb-4" style={{ fontFamily: fonts.heading }}>Bidirectional Complaints</h3>
                <p className="text-[var(--c-textSecondary)] text-lg">Break the bureaucratic wall. Citizens and municipal authorities can securely chat directly on active incident tickets to resolve nuances instantly.</p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-[var(--c-sage)] to-transparent opacity-20 rounded-tl-full blur-2xl group-hover:opacity-40 transition-opacity"></div>
            </motion.div>

            {/* Block 6 - Square: GPS Localization */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn}
              className="bg-[var(--c-oliveDark)] text-white rounded-[2rem] p-8 md:p-10 flex flex-col justify-between overflow-hidden relative group min-h-[300px] md:min-h-0"
            >
              <div className="relative z-10">
                <Map className="w-10 h-10 text-[var(--c-sage)] mb-6" />
                <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: fonts.heading }}>Office Localization</h3>
                <p className="text-[var(--c-sage)]">Interactive Google Maps directories pinpoint authority headquarters for citizens.</p>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[var(--c-olive)] blur-3xl rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── USER MODULES (TABBED OR CLEAN LIST) ── */}
      <section id="modules" className="py-32 bg-[var(--c-offWhite)] px-6 scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col md:flex-row gap-16"
          >
            <div className="md:w-1/3">
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-medium text-[var(--c-charcoal)] mb-6 tracking-tight sticky top-32" style={{ fontFamily: fonts.heading }}>
                Built for all stakeholders.
              </motion.h2>
            </div>
            
            <div className="md:w-2/3 flex flex-col gap-8">
              {[
                { icon: UserCheck, title: "Citizens", desc: "No complex onboarding. Just select a home pincode and start submitting geolocation-backed evidence." },
                { icon: Server, title: "Chief Authorities", desc: "Logged-in officials are locked strictly to their territory. They receive live alerts and update global statuses." },
                { icon: Users, title: "Department Managers", desc: "Specialized operational workflows. Managers only receive incidents assigned to their specific sub-department." },
                { icon: Globe, title: "Administrators", desc: "Global dashboard views. Ability to revoke authority keys and analyze system-wide incident resolution speed." }
              ].map((mod, i) => (
                <motion.div 
                  key={i} variants={fadeUp}
                  className="bg-white p-8 rounded-[2rem] border border-[var(--c-borderLight)] flex gap-6 items-start hover:shadow-xl hover:shadow-[var(--c-borderLight)] transition-shadow duration-500"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-[var(--c-offWhite)] rounded-2xl flex items-center justify-center border border-[var(--c-borderLight)]">
                    <mod.icon className="w-8 h-8 text-[var(--c-oliveDark)]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-[var(--c-charcoal)] mb-3" style={{ fontFamily: fonts.heading }}>{mod.title}</h3>
                    <p className="text-[var(--c-textSecondary)] text-lg leading-relaxed font-light">{mod.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER / CTA ── */}
      <section className="py-32 bg-[var(--c-charcoal)] relative overflow-hidden px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: customEase }}
            className="text-5xl md:text-7xl font-medium text-white mb-8 tracking-tight" style={{ fontFamily: fonts.heading }}
          >
            Ready to initiate change?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.1, ease: customEase }}
            className="text-gray-400 text-xl md:text-2xl mb-12 font-light"
          >
            Start reporting strictly-mapped incidents today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2, ease: customEase }}
          >
            <Link to="/register" className="inline-flex items-center justify-center bg-[var(--c-sage)] text-[var(--c-charcoal)] px-10 py-5 rounded-full font-medium text-lg hover:bg-white hover:scale-105 transition-all duration-300">
              Get Started for Free
            </Link>
          </motion.div>
        </div>
        
        {/* Subtle geometric footer pulse */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[300px] bg-[var(--c-olive)] blur-[120px] opacity-20 pointer-events-none rounded-[100%]"></div>
      </section>

    </div>
  );
};

export default Landing;
