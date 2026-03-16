// ─────────────────────────────────────────
// pages/user/UserDashboard.jsx
// Citizen dashboard. Shows:
// - Stats summary cards
// - Submit new report (modal)
// - My reports grid with filter tabs
// Uses: ReportCard, ReportForm, Loader,
//       StatusBadge from components/
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyReports } from "../../services/reportService";
import ReportCard from "../../components/ReportCard";
import ReportForm from "../../components/ReportForm";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Inbox,
} from "lucide-react";

// ── Filter tab options ───────────────────
const TABS = [
  { key: "all",      label: "All Reports" },
  { key: "pending",  label: "Pending"     },
  { key: "resolved", label: "Resolved"    },
];

const UserDashboard = () => {
  const { user } = useAuth();

  // ── Data state ──────────────────────────
  const [reports,     setReports]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  // ── UI state ────────────────────────────
  const [activeTab,   setActiveTab]   = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm,    setShowForm]    = useState(false);

  // ═══════════════════════════════════════
  //  FETCH MY REPORTS
  // ═══════════════════════════════════════
  const fetchReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);

    try {
      const res = await getMyReports();
      setReports(res.data.reports || []);
    } catch {
      toast.error("Failed to load your reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ═══════════════════════════════════════
  //  COMPUTED STATS
  // ═══════════════════════════════════════
  const stats = {
    total:    reports.length,
    pending:  reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  // ═══════════════════════════════════════
  //  FILTER REPORTS
  // ═══════════════════════════════════════
  const filteredReports = reports
    .filter((r) => activeTab === "all" || r.status === activeTab)
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.description?.toLowerCase().includes(q) ||
        r.pincode?.toString().includes(q)
      );
    });

  // ── Form success handler ─────────────────
  const handleFormSuccess = () => {
    setShowForm(false);
    fetchReports(true);
  };

  // ── Stat card config ─────────────────────
  const statCards = [
    {
      label:   "Total Reports",
      value:   stats.total,
      icon:    <FileText  className="w-5 h-5" />,
      color:   "text-blue-400",
      bg:      "bg-blue-500/10 border-blue-500/20",
      iconBg:  "bg-blue-500/20",
    },
    {
      label:   "Pending",
      value:   stats.pending,
      icon:    <Clock     className="w-5 h-5" />,
      color:   "text-yellow-400",
      bg:      "bg-yellow-500/10 border-yellow-500/20",
      iconBg:  "bg-yellow-500/20",
    },
    {
      label:   "Resolved",
      value:   stats.resolved,
      icon:    <CheckCircle className="w-5 h-5" />,
      color:   "text-green-400",
      bg:      "bg-green-500/10 border-green-500/20",
      iconBg:  "bg-green-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {/* ════════════════════════════════
             PAGE HEADER
            ════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👋</span>
              <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                Hello,{" "}
                <span className="text-blue-400">
                  {user?.name?.split(" ")[0] || "Citizen"}
                </span>
              </h1>
            </div>
            <p className="text-gray-400 text-sm">
              Pincode zone:{" "}
              <span className="text-blue-400 font-semibold font-mono">
                {user?.pincode || "—"}
              </span>
              &nbsp;•&nbsp;
              Track and manage your incident reports
            </p>
          </div>

          {/* Report button */}
          <button
            onClick={() => setShowForm(true)}
            className="
              flex items-center justify-center gap-2
              bg-blue-600 hover:bg-blue-500 active:bg-blue-700
              text-white font-semibold text-sm
              px-5 py-2.5 rounded-xl w-full sm:w-auto
              transition-all duration-200
              shadow-lg shadow-blue-600/20
            "
          >
            <Plus className="w-4 h-4" />
            Report Incident
          </button>
        </div>

        {/* ════════════════════════════════
             STATS CARDS
            ════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`
                flex items-center gap-4 p-5
                bg-gray-900 border rounded-2xl
                transition-all duration-200 hover:scale-[1.02]
                ${card.bg}
              `}
            >
              <div
                className={`
                  w-11 h-11 rounded-xl flex items-center justify-center
                  shrink-0 ${card.iconBg} ${card.color}
                `}
              >
                {card.icon}
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold mt-0.5 ${card.color}`}>
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════
             REPORT FORM MODAL
            ════════════════════════════════ */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
              <ReportForm
                onSuccess={handleFormSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════
             REPORTS SECTION
            ════════════════════════════════ */}
        <div className="flex flex-col gap-5">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              My Reports
            </h2>
            {/* Refresh button */}
            <button
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Search + Tabs row */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by description or pincode..."
                className="
                  w-full bg-gray-900 border border-gray-800
                  hover:border-gray-700 focus:border-blue-500/50
                  focus:ring-2 focus:ring-blue-500/20
                  rounded-xl pl-10 pr-4 py-2.5
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

            {/* Filter tabs */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex-1 sm:flex-none text-xs font-medium px-3 py-2 rounded-lg
                    transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }
                  `}
                >
                  {tab.label}
                  {/* Count badge */}
                  <span
                    className={`
                      ml-1.5 text-[10px] font-semibold px-1.5 py-0.5
                      rounded-full inline-flex items-center
                      ${activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-gray-800 text-gray-500"
                      }
                    `}
                  >
                    {tab.key === "all"
                      ? stats.total
                      : tab.key === "pending"
                      ? stats.pending
                      : stats.resolved}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Report Grid / States ────────── */}
          {loading ? (
            <Loader variant="section" text="Loading your reports..." />
          ) : filteredReports.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-400 font-medium text-base">
                  {searchQuery
                    ? "No reports match your search"
                    : activeTab !== "all"
                    ? `No ${activeTab} reports`
                    : "No reports yet"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : "Submit your first incident report"}
                </p>
              </div>
              {!searchQuery && activeTab === "all" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors mt-1"
                >
                  <Plus className="w-4 h-4" />
                  Submit First Report
                </button>
              )}
            </div>
          ) : (
            /* Report cards grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  mode="user"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;