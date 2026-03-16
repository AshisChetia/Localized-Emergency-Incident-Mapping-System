// ─────────────────────────────────────────
// pages/admin/AdminDashboard.jsx
// Super Admin console. Shows:
// - Platform-wide statistics
// - Pending authority registrations
// - Active authorities list
// Allows admin to approve or reject requests.
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminStats,
  getPendingAuthorities,
  getActiveAuthorities,
  approveAuthority,
  rejectAuthority,
} from "../../services/adminService";
import AuthorityRequestCard from "../../components/AuthorityRequestCard";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  Shield,
  Users,
  Building2,
  FileText,
  RefreshCw,
  Search,
  X,
  Inbox,
  CheckCircle,
  MapPin,
  Mail,
  Clock,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  // ── Data state ──────────────────────────
  const [stats,        setStats]        = useState(null);
  const [pending,      setPending]      = useState([]);
  const [active,       setActive]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // ── UI state ────────────────────────────
  const [activeTab,   setActiveTab]   = useState("pending"); // pending | active
  const [searchQuery, setSearchQuery] = useState("");

  // ═══════════════════════════════════════
  //  FETCH DATA
  // ═══════════════════════════════════════
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);

    try {
      // Fetch all required data in parallel
      const [statsRes, pendingRes, activeRes] = await Promise.all([
        getAdminStats().catch(() => ({ data: {} })),
        getPendingAuthorities().catch(() => ({ data: { authorities: [] } })),
        getActiveAuthorities().catch(() => ({ data: { authorities: [] } })),
      ]);

      setStats(statsRes.data.stats || { users: 0, reports: 0 });
      setPending(pendingRes.data.authorities || []);
      setActive(activeRes.data.authorities || []);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ═══════════════════════════════════════
  //  ACTION HANDLERS (Approve / Reject)
  // ═══════════════════════════════════════
  const handleApprove = async (id) => {
    await approveAuthority(id);
    // Move from pending to active locally to avoid full refetch
    const approvedAuth = pending.find((a) => a.id === id);
    if (approvedAuth) {
      setPending((prev) => prev.filter((a) => a.id !== id));
      setActive((prev) => [
        { ...approvedAuth, status: "approved", updated_at: new Date() },
        ...prev,
      ]);
    }
  };

  const handleReject = async (id) => {
    await rejectAuthority(id);
    // Remove from pending locally
    setPending((prev) => prev.filter((a) => a.id !== id));
  };

  // ═══════════════════════════════════════
  //  FILTERING
  // ═══════════════════════════════════════
  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.name?.toLowerCase().includes(q)       ||
        a.department?.toLowerCase().includes(q) ||
        a.pincode?.toString().includes(q)       ||
        a.email?.toLowerCase().includes(q)
    );
  };

  const displayedPending = filterList(pending);
  const displayedActive  = filterList(active);

  // ── Stat card config ─────────────────────
  const statCards = [
    {
      label:  "Total Citizens",
      value:  stats?.users || 0,
      icon:   <Users className="w-5 h-5" />,
      color:  "text-blue-400",
      bg:     "bg-blue-500/10 border-blue-500/20",
      iconBg: "bg-blue-500/20",
    },
    {
      label:  "Active Authorities",
      value:  active.length,
      icon:   <Building2 className="w-5 h-5" />,
      color:  "text-green-400",
      bg:     "bg-green-500/10 border-green-500/20",
      iconBg: "bg-green-500/20",
    },
    {
      label:  "Pending Approvals",
      value:  pending.length,
      icon:   <Clock className="w-5 h-5" />,
      color:  "text-yellow-400",
      bg:     "bg-yellow-500/10 border-yellow-500/20",
      iconBg: "bg-yellow-500/20",
    },
    {
      label:  "Total Reports",
      value:  stats?.reports || 0,
      icon:   <FileText className="w-5 h-5" />,
      color:  "text-purple-400",
      bg:     "bg-purple-500/10 border-purple-500/20",
      iconBg: "bg-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {/* ════════════════════════════════
             PAGE HEADER
            ════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          
          {/* Left: Branding & Greeting */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  Super Admin Console
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  System overview and authority management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-medium border border-purple-500/30">
                Level: Primary Access
              </span>
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user?.email}
              </span>
            </div>
          </div>

          {/* Right: Refresh button */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-all disabled:opacity-50 shrink-0 h-fit"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing Data..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* ════════════════════════════════
             STAT CARDS
            ════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`
                flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4
                p-4 sm:p-5 bg-gray-900 border rounded-2xl
                transition-all duration-200 hover:scale-[1.02]
                ${card.bg}
              `}
            >
              <div
                className={`
                  w-10 h-10 sm:w-11 sm:h-11 rounded-xl
                  flex items-center justify-center shrink-0
                  ${card.iconBg} ${card.color}
                `}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium leading-tight">
                  {card.label}
                </p>
                <p className={`text-2xl sm:text-3xl font-bold mt-0.5 ${card.color}`}>
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════
             MAIN MANAGEMENT SECTION
            ════════════════════════════════ */}
        <div className="flex flex-col gap-5 bg-gray-900/50 border border-gray-800/80 rounded-3xl p-4 sm:p-6">

          {/* Controls: Tabs & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("pending")}
                className={`
                  flex-1 sm:flex-none text-sm font-medium px-4 py-2.5 rounded-lg
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${activeTab === "pending"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }
                `}
              >
                Pending Requests
                {pending.length > 0 && (
                  <span className={`
                    text-xs px-1.5 py-0.5 rounded-md
                    ${activeTab === "pending" ? "bg-white/20 text-white" : "bg-gray-800 text-gray-400"}
                  `}>
                    {pending.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab("active")}
                className={`
                  flex-1 sm:flex-none text-sm font-medium px-4 py-2.5 rounded-lg
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${activeTab === "active"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }
                `}
              >
                Active Authorities
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search departments, pincodes..."
                className="
                  w-full bg-gray-900 border border-gray-800
                  hover:border-gray-700 focus:border-purple-500/50
                  focus:ring-2 focus:ring-purple-500/20
                  rounded-xl pl-10 pr-10 py-2.5
                  text-white text-sm placeholder-gray-600
                  focus:outline-none transition-all duration-200
                "
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── Content Area ─────────────── */}
          <div className="mt-2">
            {loading ? (
              <div className="py-12">
                <Loader variant="section" text="Loading authorities..." />
              </div>
            ) : activeTab === "pending" ? (
              /* PENDING TAB */
              displayedPending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-gray-800 border-dashed rounded-2xl bg-gray-900/40">
                  <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500/50" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">No pending requests</p>
                    <p className="text-gray-500 text-sm mt-1">All authority accounts are up to date.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {displayedPending.map((req) => (
                    <AuthorityRequestCard
                      key={req.id}
                      request={req}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )
            ) : (
              /* ACTIVE TAB */
              displayedActive.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-gray-800 border-dashed rounded-2xl bg-gray-900/40">
                  <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                    <Inbox className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">No active authorities found</p>
                    {searchQuery && <p className="text-gray-500 text-sm mt-1">Try a different search term.</p>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Table Header (hidden on mobile) */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Authority Name & Dept</div>
                    <div className="col-span-3">Contact Email</div>
                    <div className="col-span-3">Jurisdiction</div>
                    <div className="col-span-2 text-right">Joined</div>
                  </div>
                  
                  {/* List Rows */}
                  {displayedActive.map((auth) => (
                    <div
                      key={auth.id}
                      className="group bg-gray-900 border border-gray-800 rounded-xl p-4 sm:px-5 sm:py-4 hover:border-purple-500/30 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                    >
                      {/* Name & Dept */}
                      <div className="col-span-1 sm:col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{auth.name}</p>
                          <p className="text-gray-500 text-xs truncate">{auth.department}</p>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-span-1 sm:col-span-3 flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-4 h-4 sm:hidden" />
                        <span className="truncate">{auth.email}</span>
                      </div>

                      {/* Pincode */}
                      <div className="col-span-1 sm:col-span-3 flex items-center gap-2 text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 sm:hidden text-purple-400" />
                        <span className="bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-md text-xs font-mono font-medium text-gray-300">
                          {auth.pincode}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-1 sm:col-span-2 text-left sm:text-right text-gray-500 text-xs">
                        <span className="sm:hidden font-medium text-gray-400 mr-2">Joined:</span>
                        {new Date(auth.created_at || auth.updated_at).toLocaleDateString("en-IN", {
                          month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;