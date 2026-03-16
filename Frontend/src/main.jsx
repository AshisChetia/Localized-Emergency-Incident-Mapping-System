// ─────────────────────────────────────────
// main.jsx
// Application entry point.
// Wraps app in AuthProvider so every
// component can access auth state via
// useAuth() hook
// ─────────────────────────────────────────

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        {/* ── Global Toast Notifications ── */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#111827",
              color:       "#f9fafb",
              border:      "1px solid #1f2937",
              borderRadius: "12px",
              fontSize:    "14px",
              padding:     "12px 16px",
            },
            success: {
              iconTheme: {
                primary:    "#22c55e",
                secondary:  "#111827",
              },
            },
            error: {
              iconTheme: {
                primary:    "#ef4444",
                secondary:  "#111827",
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);