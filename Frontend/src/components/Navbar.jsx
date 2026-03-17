// ─────────────────────────────────────────
// components/Navbar.jsx
// ─────────────────────────────────────────

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, fonts } from "../styles/designTokens";
import {
  Menu, X, MapPin, LayoutDashboard, LogOut, LogIn, UserPlus
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navStyle = {
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

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "user") return "/user/dashboard";
    if (user.role === "authority") return "/authority/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/";
  };

  const scrollToSection = (e, id) => {
    if (location.pathname !== "/") return;
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    closeMenu();
  };

  // ── FIXED: Smart Profile Link Wrapper ──
  const ProfileWrapper = ({ children, className, onClick }) => {
    // Determine path based on role
    let profilePath = null;
    if (user?.role === "user") profilePath = "/user/profile";
    if (user?.role === "authority") profilePath = "/authority/profile";

    // If it's a user or authority, make it a clickable Link
    if (profilePath) {
      return (
        <Link 
          to={profilePath} 
          onClick={onClick} 
          className={`${className} hover:opacity-80 transition-opacity cursor-pointer group`}
        >
          {children}
        </Link>
      );
    }
    // Otherwise (like for admins without profiles yet), just render it as a div
    return <div className={className}>{children}</div>;
  };

  return (
    <nav
      style={navStyle}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--c-offWhite)]/80 backdrop-blur-lg shadow-sm py-3 border-b border-[var(--c-borderLight)]"
          : "bg-[var(--c-offWhite)] py-5 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/user/dashboard" onClick={closeMenu} className="flex items-center gap-2 group z-50">
          <div className="w-9 h-9 rounded-full bg-[var(--c-olive)] flex items-center justify-center group-hover:bg-[var(--c-oliveDark)] transition-colors duration-300 shadow-md">
            <MapPin className="w-4 h-4 text-[var(--c-offWhite)]" strokeWidth={2} />
          </div>
          <span className="text-[var(--c-charcoal)] font-bold text-xl tracking-tight" style={{ fontFamily: fonts.heading }}>
            Emergency<span className="text-[var(--c-accentGold)]">Map</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          {!user ? (
            <>
              <a href="/#hero" onClick={(e) => scrollToSection(e, "hero")} className="text-sm font-medium text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] transition-colors">Home</a>
              <a href="/#purpose" onClick={(e) => scrollToSection(e, "purpose")} className="text-sm font-medium text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] transition-colors">Purpose</a>
              <a href="/#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="text-sm font-medium text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] transition-colors">How it Works</a>
              <a href="/#modules" onClick={(e) => scrollToSection(e, "modules")} className="text-sm font-medium text-[var(--c-textSecondary)] hover:text-[var(--c-olive)] transition-colors">Modules</a>
            </>
          ) : (
            <Link to={getDashboardPath()} className="text-sm font-medium text-[var(--c-olive)] flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4 z-50">
          {!user ? (
            <>
              <Link to="/login" className="text-sm font-semibold text-[var(--c-charcoal)] hover:text-[var(--c-olive)] transition-colors px-4 py-2">
                Login
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-[var(--c-olive)] text-[var(--c-offWhite)] hover:bg-[var(--c-oliveDark)] px-5 py-2.5 rounded-full shadow-md transition-all duration-300 hover:-translate-y-0.5">
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-5">
              
              {/* Minimalist Profile Avatar */}
              <ProfileWrapper className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full bg-[var(--c-olive)] border-2 border-transparent group-hover:border-[var(--c-sage)] shadow-md flex items-center justify-center text-[var(--c-offWhite)] text-lg font-black transition-all cursor-pointer"
                  title={`${user.name || user.email} (${user.role})`}
                >
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
              </ProfileWrapper>
              
              <div className="h-6 w-px bg-[var(--c-borderLight)]"></div>

              <button 
                onClick={handleLogout} 
                title="Logout"
                className="p-2 rounded-full bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] text-[var(--c-textSecondary)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button onClick={toggleMenu} className="md:hidden p-2 text-[var(--c-charcoal)] z-50">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[var(--c-offWhite)] border-b border-[var(--c-borderLight)] shadow-xl transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-screen py-6 opacity-100" : "max-h-0 py-0 opacity-0"}`}>
        <div className="px-6 flex flex-col gap-4">
          {!user ? (
            <>
              <a href="/#hero" onClick={(e) => scrollToSection(e, "hero")} className="text-lg font-medium text-[var(--c-charcoal)]">Home</a>
              <a href="/#purpose" onClick={(e) => scrollToSection(e, "purpose")} className="text-lg font-medium text-[var(--c-charcoal)]">Purpose</a>
              <a href="/#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="text-lg font-medium text-[var(--c-charcoal)]">How it Works</a>
              <a href="/#modules" onClick={(e) => scrollToSection(e, "modules")} className="text-lg font-medium text-[var(--c-charcoal)]">Modules</a>
              
              <div className="h-px bg-[var(--c-borderLight)] my-2"></div>
              
              <Link to="/login" onClick={closeMenu} className="flex justify-center py-3 rounded-xl font-semibold bg-[var(--c-sage)] text-[var(--c-oliveDark)]">Login</Link>
              <Link to="/register" onClick={closeMenu} className="flex justify-center py-3 rounded-xl font-semibold bg-[var(--c-olive)] text-[var(--c-offWhite)] shadow-md">Register</Link>
            </>
          ) : (
             <>
               {/* Mobile Menu User Profile Link */}
               <ProfileWrapper onClick={closeMenu} className="flex items-center gap-3 mb-2 p-2 rounded-xl hover:bg-white transition-colors">
                 <div className="w-12 h-12 rounded-full bg-[var(--c-olive)] shadow-md flex items-center justify-center text-[var(--c-offWhite)] text-xl font-black">
                    {(user.name || user.email || "U")[0].toUpperCase()}
                 </div>
                 <div>
                   <p className="font-bold text-[var(--c-charcoal)] text-lg leading-tight">{user.name || user.email}</p>
                   <p className="text-xs font-bold text-[var(--c-textSecondary)] capitalize mt-0.5">{user.role}</p>
                 </div>
               </ProfileWrapper>
               
               <Link to={getDashboardPath()} onClick={closeMenu} className="flex items-center gap-3 text-lg font-medium text-[var(--c-charcoal)] p-2 hover:bg-white rounded-xl transition-colors">
                  <LayoutDashboard className="w-5 h-5 text-[var(--c-olive)]" /> Dashboard
               </Link>
               
               <div className="h-px bg-[var(--c-borderLight)] my-2"></div>
               
               <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">
                 <LogOut className="w-5 h-5" /> Logout
               </button>
             </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;