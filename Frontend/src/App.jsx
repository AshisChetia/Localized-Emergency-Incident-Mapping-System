// ─────────────────────────────────────────
// App.jsx
// ─────────────────────────────────────────

import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import UserLogin from "./pages/auth/UserLogin";
import UserRegister from "./pages/auth/UserRegister";
import AuthorityLogin from "./pages/auth/AuthorityLogin";
import AuthorityRegister from "./pages/auth/AuthorityRegister";
import AdminLogin from "./pages/auth/AdminLogin";

import Landing from "./pages/Landing";
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import CommunityFeed from "./pages/user/CommunityFeed";
import AuthorityDashboard from "./pages/authority/authorityDashboard";
import AuthorityProfile from "./pages/authority/authorityProfile";
import AdminDashboard from "./pages/admin/adminDashboard";

const App = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[#F8F5EC] text-[#2B2820] flex flex-col">
      <Navbar />

      {/* Conditionally apply max-width ONLY if we are not on the landing page */}
      <main className={`flex-1 ${!isLanding ? "pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" : ""}`}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />

          <Route path="/authority/login" element={<AuthorityLogin />} />
          <Route path="/authority/register" element={<AuthorityRegister />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/user/dashboard"
            element={ <ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute> }
          />
          <Route
            path="/user/profile"
            element={ <ProtectedRoute allowedRole="user"><UserProfile /></ProtectedRoute> }
          />
          <Route
            path="/user/community"
            element={ <ProtectedRoute allowedRole="user"><CommunityFeed /></ProtectedRoute> }
          />

          <Route
            path="/authority/dashboard"
            element={ <ProtectedRoute allowedRole="authority"><AuthorityDashboard /></ProtectedRoute> }
          />
          <Route
            path="/authority/profile"
            element={ <ProtectedRoute allowedRole="authority"><AuthorityProfile /></ProtectedRoute> }
          />

          <Route
            path="/admin/dashboard"
            element={ <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute> }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
