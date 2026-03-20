// ─────────────────────────────────────────
// services/api.js
// Configured Axios instance used by all
// service files. Handles:
// - Base URL from .env
// - Auto token attachment on every request
// - Global 401 response handling
// ─────────────────────────────────────────

import axios from "axios";

// ── Create Axios instance ───────────────
// Replace lines 14-20 in api.js with this:
const api = axios.create({
  // VERCEL FIX: Use a relative path so the frontend automatically talks to the Vercel Serverless backend
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds
});

// ═════════════════════════════════════════
//  REQUEST INTERCEPTOR
//  Runs before every API call.
//  Reads token from localStorage and
//  attaches it as Bearer token in header.
// ═════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("em_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ── For FormData (file uploads) ──────
    // Let browser set correct multipart
    // boundary automatically by removing
    // the default JSON content type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ═════════════════════════════════════════
//  RESPONSE INTERCEPTOR
//  Runs after every API response.
//  Handles 401 Unauthorized globally:
//  clears token + redirects to login
//  without needing to handle it in
//  every single component manually.
// ═════════════════════════════════════════
api.interceptors.response.use(
  // ── Success → pass through ────────────
  (response) => response,

  // ── Error → handle globally ───────────
  (error) => {
    if (error.response?.status === 401) {
      // ── Clear stored session ──────────
      localStorage.removeItem("em_token");
      localStorage.removeItem("em_role");

      // ── Redirect to home ──────────────
      // Only redirect if not already on
      // a login/auth related page
      const currentPath = window.location.pathname;
      const authPaths   = ["/login", "/register", "/authority/login", "/authority/register", "/admin/login", "/"];

      if (!authPaths.includes(currentPath)) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;