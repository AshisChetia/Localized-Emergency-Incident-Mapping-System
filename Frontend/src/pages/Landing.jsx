// ─────────────────────────────────────────
// pages/Landing.jsx
// ─────────────────────────────────────────

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, fonts } from "../styles/designTokens";
import {
  MapPin, ShieldCheck, Smartphone, Server, Activity, ArrowRight,
  Globe, Camera, BarChart3, Cloud, Navigation, UserCheck
} from "lucide-react";

const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  
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
    <div style={pageStyle} className="w-full bg-[var(--c-offWhite)] text-[var(--c-textPrimary)]">
      
      {/* ── HERO SECTION ── */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background blobs (CSS added in index.css) */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--c-sage)] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-[var(--c-accentGold)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--c-sage)]/60 border border-[var(--c-olive)]/20 mb-8 backdrop-blur-sm">
            <Globe className="w-4 h-4 text-[var(--c-oliveDark)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--c-oliveDark)]" style={{ fontFamily: fonts.heading }}>
              Pincode-First Emergency Response
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[var(--c-charcoal)] mb-6 leading-[1.1]" style={{ fontFamily: fonts.heading }}>
            Connecting citizens.<br />
            <span className="text-[var(--c-olive)]"> Empowering Authorities</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--c-textSecondary)] max-w-2xl mb-10 leading-relaxed">
            A community-driven mapping system that seamlessly routes civic issues directly to the exact local authority based on precise GPS coordinates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {isAuthenticated ? (
              <Link to={dashboardLink} className="flex items-center justify-center gap-2 bg-[var(--c-olive)] text-[var(--c-offWhite)] px-8 py-4 rounded-full font-bold shadow-lg shadow-[var(--c-olive)]/30 transition-all duration-300 hover:scale-105">
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="flex items-center justify-center gap-2 bg-[var(--c-olive)] text-[var(--c-offWhite)] px-8 py-4 rounded-full font-bold shadow-lg shadow-[var(--c-olive)]/30 transition-all duration-300 hover:scale-105 hover:bg-[var(--c-oliveDark)]">
                  Join as Citizen
                </Link>
                <Link to="/authority/register" className="flex items-center justify-center gap-2 bg-transparent text-[var(--c-charcoal)] border-2 border-[var(--c-borderLight)] px-8 py-4 rounded-full font-bold transition-all duration-300 hover:border-[var(--c-olive)] hover:bg-[var(--c-sage)]">
                  Authority Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── PURPOSE SECTION ── */}
      <section id="purpose" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-[var(--c-charcoal)] mb-6" style={{ fontFamily: fonts.heading }}>
              The Purpose
            </h2>
            <p className="text-[var(--c-textSecondary)] text-lg leading-relaxed">
              Traditional reporting methods are slow, untrackable, and often reach the wrong department. We built a 3-tier platform to bridge the gap between citizens and municipalities using automated geographic routing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Navigation, title: "Precision Routing", desc: "Every report is tagged with exact GPS coordinates and reverse-geocoded to a specific pincode." },
              { icon: BarChart3, title: "Total Transparency", desc: "Track the real-time status of your reports from Pending to Resolved with complete visibility." },
              { icon: ShieldCheck, title: "Verified Action", desc: "Only Super Admin-approved local officials can access and update reports for their jurisdiction." }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] hover:border-[var(--c-olive)] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-[var(--c-sage)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-7 h-7 text-[var(--c-oliveDark)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--c-charcoal)] mb-3" style={{ fontFamily: fonts.heading }}>{feature.title}</h3>
                <p className="text-[var(--c-textSecondary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (TECH STACK) ── */}
      <section id="how-it-works" className="py-24 bg-[var(--c-charcoal)] text-[var(--c-offWhite)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[var(--c-accentGold)] font-bold tracking-widest uppercase text-sm mb-4 block" style={{ fontFamily: fonts.heading }}>How it Works</span>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight" style={{ fontFamily: fonts.heading }}>
                Powered by a modern MERN architecture.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                When an incident is reported, our system utilizes the HTML5 Geolocation API and OpenStreetMap (Nominatim) for precise GPS tracking. Images are securely hosted via Cloudinary, and everything is orchestrated by a robust Node.js/Express.js backend.
              </p>
              
              <ul className="space-y-6">
                {[
                  { icon: Camera, title: "1. Capture & Upload", text: "Citizens take a live photo via mobile camera integration. Multer handles the stream." },
                  { icon: MapPin, title: "2. Geolocation Extraction", text: "Coordinates are fetched and reverse-geocoded to identify the exact incident Pincode." },
                  { icon: Server, title: "3. Automated Routing", text: "The MySQL database securely routes the report exclusively to the matching local authority." }
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--c-olive)] flex items-center justify-center mt-1">
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1" style={{ fontFamily: fonts.heading }}>{step.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Visual Representation */}
            <div className="relative h-[600px] w-full rounded-3xl overflow-hidden border border-gray-700 bg-gray-900 p-8 flex flex-col justify-between shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--c-accentGold)] opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--c-olive)] opacity-20 rounded-full blur-3xl"></div>
              
              <div className="z-10 bg-gray-800/50 backdrop-blur-md border border-gray-700 p-6 rounded-2xl mb-4 transform transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <Cloud className="text-blue-400" /> <span className="font-bold text-white">Cloudinary Hosting</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full w-full overflow-hidden"><div className="w-3/4 h-full bg-blue-400"></div></div>
              </div>

              <div className="z-10 bg-gray-800/50 backdrop-blur-md border border-gray-700 p-6 rounded-2xl mb-4 ml-12 transform transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="text-red-400" /> <span className="font-bold text-white">Nominatim Geocoding</span>
                </div>
                <p className="text-xs text-gray-400 font-mono">Lat: 26.1445, Lng: 91.7362 -{">"} Pincode: 781001</p>
              </div>

              <div className="z-10 bg-[var(--c-olive)]/20 backdrop-blur-md border border-[var(--c-olive)] p-6 rounded-2xl transform transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-[var(--c-sage)]" /> <span className="font-bold text-white">Authority Dashboard</span>
                </div>
                <p className="text-xs text-[var(--c-sage)]">New report routed successfully to jurisdiction.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES SECTION ── */}
      <section id="modules" className="py-24 bg-[var(--c-offWhite)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-[var(--c-charcoal)] mb-6" style={{ fontFamily: fonts.heading }}>
            Three Distinct User Modules
          </h2>
          <p className="text-[var(--c-textSecondary)] max-w-2xl mx-auto text-lg mb-16">
            Authentication is handled through strictly separated logic for each module to ensure absolute role-based security.
          </p>

          <div className="grid lg:grid-cols-3 gap-8 text-left">
            {/* Citizen */}
            <div className="bg-white rounded-3xl p-10 border border-[var(--c-borderLight)] shadow-lg hover:shadow-[var(--c-olive)]/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-sage)] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              <UserCheck className="w-10 h-10 text-[var(--c-oliveDark)] mb-6" />
              <h3 className="text-2xl font-bold text-[var(--c-charcoal)] mb-4" style={{ fontFamily: fonts.heading }}>Citizens</h3>
              <p className="text-[var(--c-textSecondary)] mb-6 leading-relaxed">
                Register by selecting your home pincode to access a simplified reporting dashboard. Capture photos, describe issues, and automatically fetch GPS coordinates.
              </p>
              <ul className="space-y-3 text-sm font-medium text-[var(--c-charcoal)]">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--c-olive)]"></div> Personal profile tracking</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--c-olive)]"></div> Live status updates (Pending/Resolved)</li>
              </ul>
            </div>

            {/* Authority */}
            <div className="bg-white rounded-3xl p-10 border border-[var(--c-borderLight)] shadow-lg hover:shadow-[var(--c-accentGold)]/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-backdrop)] rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              <BarChart3 className="w-10 h-10 text-[var(--c-accentGold)] mb-6" />
              <h3 className="text-2xl font-bold text-[var(--c-charcoal)] mb-4" style={{ fontFamily: fonts.heading }}>Authorities</h3>
              <p className="text-[var(--c-textSecondary)] mb-6 leading-relaxed">
                Submit a registration request to the Super Admin. Once approved, access a dashboard filtered entirely by your specific Pincode jurisdiction.
              </p>
              <ul className="space-y-3 text-sm font-medium text-[var(--c-charcoal)]">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--c-accentGold)]"></div> "Navigate in Google Maps" integration</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--c-accentGold)]"></div> Chart.js resolution analytics</li>
              </ul>
            </div>

            {/* Super Admin */}
            <div className="bg-white rounded-3xl p-10 border border-[var(--c-borderLight)] shadow-lg hover:shadow-gray-900/20 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150"></div>
              <ShieldCheck className="w-10 h-10 text-gray-800 mb-6" />
              <h3 className="text-2xl font-bold text-[var(--c-charcoal)] mb-4" style={{ fontFamily: fonts.heading }}>Super Admin</h3>
              <p className="text-[var(--c-textSecondary)] mb-6 leading-relaxed">
                The system gatekeeper. Manage platform integrity by verifying and approving Authority registrations, preventing unauthorized municipal access.
              </p>
              <ul className="space-y-3 text-sm font-medium text-[var(--c-charcoal)]">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div> High-level oversight dashboard</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div> Administrative coverage breakdown</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-[var(--c-olive)] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ fontFamily: fonts.heading }}>
            Ready to improve your neighborhood?
          </h2>
          <p className="text-[var(--c-sage)] text-lg mb-10">
            Join the community today and start reporting issues directly to the people who can fix them.
          </p>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-[var(--c-oliveDark)] px-10 py-5 rounded-full font-bold text-lg shadow-2xl transition-transform hover:scale-105">
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Landing;