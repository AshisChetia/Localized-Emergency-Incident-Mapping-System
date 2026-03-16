// ─────────────────────────────────────────
// context/AuthContext.jsx
// Global authentication state manager.
// Handles:
// - User login / logout for all 3 roles
//   (user, authority, admin)
// - Token storage in localStorage
// - Auto token verification on app start
// - Provides user object + auth methods
//   to every component via useAuth hook
//
// Consumed by:
// - Navbar.jsx       → show role based links
// - ProtectedRoute.jsx → guard role routes
// - ReportForm.jsx   → get user pincode
// - All pages        → get current user
// ─────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "../services/authService";

// ═════════════════════════════════════════
//  CONTEXT CREATION
// ═════════════════════════════════════════
const AuthContext = createContext(null);

// ═════════════════════════════════════════
//  TOKEN KEY CONSTANTS
//  Stored in localStorage under these keys
// ═════════════════════════════════════════
const TOKEN_KEY = "em_token";
const ROLE_KEY  = "em_role";

// ═════════════════════════════════════════
//  AUTH PROVIDER
// ═════════════════════════════════════════
export const AuthProvider = ({ children }) => {

  // ── State ───────────────────────────────
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);  // true on first load

  // ═══════════════════════════════════════
  //  SAVE TOKEN TO LOCALSTORAGE
  // ═══════════════════════════════════════
  const saveToken = (token, role) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY,  role);
  };

  // ═══════════════════════════════════════
  //  CLEAR TOKEN FROM LOCALSTORAGE
  // ═══════════════════════════════════════
  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  };

  // ═══════════════════════════════════════
  //  GET TOKEN FROM LOCALSTORAGE
  // ═══════════════════════════════════════
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getRole  = () => localStorage.getItem(ROLE_KEY);

  // ═══════════════════════════════════════
  //  VERIFY TOKEN ON APP START
  //  Runs once when app mounts.
  //  Calls GET /api/auth/me with stored
  //  token to check if session is still
  //  valid. If yes → restore user state.
  //  If no  → clear token and show login.
  // ═══════════════════════════════════════
  const verifyToken = useCallback(async () => {
    const token = getToken();

    // ── No token stored → guest user ────
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // ── Call /api/auth/me ─────────────
      // api.js interceptor auto-attaches
      // the token from localStorage so
      // no need to manually pass it here
      const response = await getMe();

      // ── Set user from response ────────
      setUser({
        ...response.data.user,
        token,
      });

    } catch (error) {
      // ── Token expired or invalid ──────
      // Clear everything and treat as guest
      console.warn("Session expired. Please login again.");
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Run verifyToken once on mount ───────
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // ═══════════════════════════════════════
  //  LOGIN
  //  Called by all 3 login pages after
  //  successful API response.
  //
  //  Usage in login pages:
  //  const { data } = await loginUser(creds)
  //  login(data.token, data.user)
  // ═══════════════════════════════════════
  const login = (token, userData) => {
    // ── Save token to localStorage ───────
    saveToken(token, userData.role);

    // ── Set user in context state ────────
    setUser({
      ...userData,
      token,
    });
  };

  // ═══════════════════════════════════════
  //  LOGOUT
  //  Clears token from localStorage and
  //  resets user state to null.
  //  Navbar.jsx calls this then redirects
  //  to home page.
  // ═══════════════════════════════════════
  const logout = () => {
    clearToken();
    setUser(null);
  };

  // ═══════════════════════════════════════
  //  UPDATE USER
  //  Used when user updates their profile.
  //  Merges new fields into existing user
  //  state without requiring re-login.
  // ═══════════════════════════════════════
  const updateUser = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  // ═══════════════════════════════════════
  //  REFRESH USER
  //  Re-fetches user data from /api/auth/me
  //  and updates state. Used after profile
  //  updates to sync latest data from DB.
  // ═══════════════════════════════════════
  const refreshUser = async () => {
    try {
      const response = await getMe();
      const token    = getToken();
      setUser({
        ...response.data.user,
        token,
      });
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  // ═══════════════════════════════════════
  //  COMPUTED HELPERS
  //  Shorthand boolean flags for role checks
  //  Use these in components instead of
  //  checking user.role === "xyz" everywhere
  // ═══════════════════════════════════════
  const isAuthenticated = !!user;
  const isUser          = user?.role === "user";
  const isAuthority     = user?.role === "authority";
  const isAdmin         = user?.role === "admin";

  // ═══════════════════════════════════════
  //  CONTEXT VALUE
  //  Everything exposed to child components
  // ═══════════════════════════════════════
  const value = {
    // ── State ────────────────────────────
    user,
    loading,

    // ── Auth Actions ─────────────────────
    login,
    logout,
    updateUser,
    refreshUser,

    // ── Token Helpers ─────────────────────
    getToken,
    getRole,

    // ── Role Booleans ─────────────────────
    isAuthenticated,
    isUser,
    isAuthority,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ═════════════════════════════════════════
//  useAuth HOOK
//  Clean way to consume AuthContext in
//  any component without importing
//  useContext + AuthContext every time.
//
//  Usage:
//  const { user, login, logout } = useAuth();
// ═════════════════════════════════════════
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside <AuthProvider>. " +
      "Wrap your App in <AuthProvider> in main.jsx"
    );
  }

  return context;
};

export default AuthContext;