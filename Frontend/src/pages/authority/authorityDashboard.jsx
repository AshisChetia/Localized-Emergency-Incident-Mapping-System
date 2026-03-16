// ─────────────────────────────────────────
// pages/authority/AuthorityDashboard.jsx
// Authority dashboard. Shows:
// - Stats summary cards
// - Monthly chart (StatsChart)
// - All reports in authority's pincode
//   with filter tabs + search
// - Report detail modal (ReportDetailCard)
// Uses: ReportCard, ReportDetailCard,
//       StatsChart, Loader, StatusBadge
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getReportsByPincode,
  getReportStats,
  updateReportStatus,
} from "../../services/reportService";
import ReportCard       from "../../components/ReportCard";
import ReportDetailCard from "../../components/ReportDetailCard";
import StatsChart       from "../../components/StatsChart";
import Loader           from "../../components/Loader";
import StatusBadge      from "../../components/StatusBadge";
import toast            from "react-hot-toast";
import {
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  RefreshCw,
  Search,
  X,
  Inbox,
  BarChart2,
  MapPin,
  ChevronDown,
  List,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";

// ── Filter tab config ────────────────────
const TABS = [
  { key: "all",      label: "All"      },
  { key: "pending",  label: "Pending"  },
  { key: "resolved", label: "Resolved" },
];

// ── Sort options ─────────────────────────
const SORT_OPTIONS = [
  { key: "newest", label: "Newest First"  },
  { key: "oldest", label: "Oldest First"  },
  { key: "status", label: "By Status"     },
];

const AuthorityDashboard = () => {
  const { user } = useAuth();

  // ── Data state ──────────────────────────
  const [reports,      setReports]      = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // ── UI state ────────────────────────────
  const [activeTab,      setActiveTab]      = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [sortKey,        setSortKey]        = useState("newest");
  const [showSortMenu,   setShowSortMenu]   = useState(false);
  const [viewMode,       setViewMode]       = useState("grid"); // grid | list
  const [showChart,      setShowChart]      = useState(true);

  // ── Detail modal state ───────────────────
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail,     setShowDetail]     = useState(false);

  // ═══════════════════════════════════════
  //  FETCH REPORTS
  // ═══════════════════════════════════════
  const fetchReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);

    try {
      const res = await getReportsByPincode(user?.pincode);
      setReports(res.data.reports || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.pincode]);

  // ═══════════════════════════════════════
  //  FETCH MONTHLY STATS (for chart)
  // ═══════════════════════════════════════
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getReportStats();
      setMonthlyStats(res.data.monthly || []);
    } catch {
      // silently fail chart — not critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  // ═══════════════════════════════════════
  //  COMPUTED STATS
  // ═══════════════════════════════════════
  const stats = {
    total:    reports.length,
    pending:  reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    rate:     reports.length > 0
      ? Math.round(
          (reports.filter((r) => r.status === "resolved").length /
            reports.length) *
            100
        )
      : 0,
  };

  // ═══════════════════════════════════════
  //  FILTER + SORT REPORTS
  // ═══════════════════════════════════════
  const filteredReports = reports
    // tab filter
    .filter((r) => activeTab === "all" || r.status === activeTab)
    // search filter
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.description?.toLowerCase().includes(q)      ||
        r.pincode?.toString().includes(q)              ||
        r.reporter_name?.toLowerCase().includes(q)
      );
    })
    // sort
    .sort((a, b) => {
      if (sortKey === "newest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortKey === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortKey === "status")
        return a.status.localeCompare(b.status);
      return 0;
    });

  // ═══════════════════════════════════════
  //  STATUS UPDATE HANDLER
  //  Called from ReportCard + ReportDetailCard
  // ═══════════════════════════════════════
  const handleStatusUpdate = (reportId, newStatus) => {
    // Optimistically update local state
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: newStatus } : r
      )
    );

    // Also update selected report if open in detail
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // ── Open detail modal ────────────────────
  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowDetail(true);
  };

  // ── Stat card config ─────────────────────
  const statCards = [
    {
      label:  "Total Reports",
      value:  stats.total,
      icon:   <FileText   className="w-5 h-5" />,
      color:  "text-blue-400",
      bg:     "bg-blue-500/10 border-blue-500/20",
      iconBg: "bg-blue-500/20",
    },
    {
      label:  "Pending",
      value:  stats.pending,
      icon:   <Clock      className="w-5 h-5" />,
      color:  "text-yellow-400",
      bg:     "bg-yellow-500/10 border-yellow-500/20",
      iconBg: "bg-yellow-500/20",
    },
    {
      label:  "Resolved",
      value:  stats.resolved,
      icon:   <CheckCircle className="w-5 h-5" />,
      color:  "text-green-400",
      bg:     "bg-green-500/10 border-green-500/20",
      iconBg: "bg-green-500/20",
    },
    {
      label:  "Resolution Rate",
      value:  `${stats.rate}%`,
      icon:   <BarChart2  className="w-5 h-5" />,
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

          {/* Left: greeting */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              {/* Authority badge */}
              <div className="w-10 h-10 bg-green-600/20 border border-green-500/30 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
                  Authority Dashboard
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  Welcome back,{" "}
                  <span className="text-green-400 font-medium">
                    {user?.name || "Authority"}
                  </span>
                </p>
              </div>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1">
                <MapPin className="w-3 h-3 text-green-400" />
                <span className="text-gray-400 text-xs">
                  Zone:{" "}
                  <span className="text-green-400 font-mono font-semibold">
                    {user?.pincode || "—"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-full px-3 py-1">
                <ShieldCheck className="w-3 h-3 text-green-400" />
                <span className="text-gray-400 text-xs">
                  {user?.department || "Department"}
                </span>
              </div>
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-green-400 text-xs font-medium">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Right: refresh + chart toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowChart((p) => !p)}
              className={`
                flex items-center gap-1.5 text-xs font-medium px-3 py-2
                rounded-xl border transition-all duration-200
                ${showChart
                  ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400"
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }
              `}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {showChart ? "Hide Chart" : "Show Chart"}
              </span>
            </button>

            <button
              onClick={() => { fetchReports(true); fetchStats(); }}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {refreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>
          </div>
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
             RESOLUTION PROGRESS BAR
            ════════════════════════════════ */}
        {stats.total > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 sm:px-6 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-semibold">
                  Overall Resolution Progress
                </span>
              </div>
              <span className="text-green-400 text-sm font-bold">
                {stats.rate}%
              </span>
            </div>

            {/* Progress bar track */}
            <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
                style={{ width: `${stats.rate}%` }}
              />
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                <span className="text-yellow-400 font-semibold">
                  {stats.pending}
                </span>{" "}
                pending
              </span>
              <span>
                <span className="text-green-400 font-semibold">
                  {stats.resolved}
                </span>{" "}
                of{" "}
                <span className="text-white font-semibold">
                  {stats.total}
                </span>{" "}
                resolved
              </span>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
             MONTHLY STATS CHART
            ════════════════════════════════ */}
        {showChart && (
          <div className="transition-all duration-300">
            {statsLoading ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <Loader variant="section" text="Loading chart data..." />
              </div>
            ) : (
              <StatsChart
                monthlyData={monthlyStats}
                title="Monthly Incident Overview"
              />
            )}
          </div>
        )}

        {/* ════════════════════════════════
             REPORTS SECTION
            ════════════════════════════════ */}
        <div className="flex flex-col gap-5">

          {/* Section header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                Pincode Reports
                <span className="text-xs font-normal text-gray-500 ml-1">
                  ({filteredReports.length} shown)
                </span>
              </h2>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`
                    p-2 rounded-lg transition-all
                    ${viewMode === "grid"
                      ? "bg-green-600 text-white"
                      : "text-gray-500 hover:text-white"
                    }
                  `}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`
                    p-2 rounded-lg transition-all
                    ${viewMode === "list"
                      ? "bg-green-600 text-white"
                      : "text-gray-500 hover:text-white"
                    }
                  `}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search + Sort + Tabs */}
            <div className="flex flex-col sm:flex-row gap-3">

              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by description, reporter or pincode..."
                  className="
                    w-full bg-gray-900 border border-gray-800
                    hover:border-gray-700 focus:border-green-500/50
                    focus:ring-2 focus:ring-green-500/20
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

              <div className="flex gap-2">

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu((p) => !p)}
                    className="flex items-center gap-1.5 h-full bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white text-xs font-medium px-3 py-2.5 rounded-xl transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showSortMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSortMenu(false)}
                      />
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-2 z-20 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => {
                              setSortKey(opt.key);
                              setShowSortMenu(false);
                            }}
                            className={`
                              w-full text-left px-4 py-2.5 text-sm transition-colors
                              ${sortKey === opt.key
                                ? "bg-green-600/20 text-green-400 font-medium"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white"
                              }
                            `}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Filter tabs */}
                <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
                  {TABS.map((tab) => {
                    const count =
                      tab.key === "all"
                        ? stats.total
                        : tab.key === "pending"
                        ? stats.pending
                        : stats.resolved;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`
                          text-xs font-medium px-3 py-2 rounded-lg
                          transition-all duration-200 whitespace-nowrap
                          ${activeTab === tab.key
                            ? "bg-green-600 text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                          }
                        `}
                      >
                        {tab.label}
                        <span
                          className={`
                            ml-1.5 text-[10px] font-semibold
                            px-1.5 py-0.5 rounded-full
                            ${activeTab === tab.key
                              ? "bg-white/20 text-white"
                              : "bg-gray-800 text-gray-500"
                            }
                          `}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Reports content ──────────── */}
          {loading ? (
            <Loader variant="section" text="Loading reports..." />
          ) : filteredReports.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-gray-900/40 border border-gray-800 border-dashed rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <p className="text-gray-400 font-medium text-base">
                  {searchQuery
                    ? "No reports match your search"
                    : activeTab !== "all"
                    ? `No ${activeTab} reports in your zone`
                    : "No reports in your pincode zone yet"}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {searchQuery
                    ? "Try a different keyword"
                    : "Reports submitted by citizens will appear here"}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear search
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            /* ── Grid view ─────────────── */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleReportClick(report)}
                  className="cursor-pointer"
                >
                  <ReportCard
                    report={report}
                    mode="authority"
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* ── List view ─────────────── */
            <div className="flex flex-col gap-2">
              {filteredReports.map((report) => (
                <ListReportRow
                  key={report.id}
                  report={report}
                  onStatusUpdate={handleStatusUpdate}
                  onClick={() => handleReportClick(report)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════
           REPORT DETAIL MODAL
          ════════════════════════════════════ */}
      {showDetail && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl my-auto">
            <ReportDetailCard
              report={selectedReport}
              mode="authority"
              onStatusUpdate={handleStatusUpdate}
              onBack={() => {
                setShowDetail(false);
                setSelectedReport(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════
//  LIST ROW COMPONENT (internal)
//  Used when viewMode === "list"
//  Compact single-line report row
// ═════════════════════════════════════════
const ListReportRow = ({ report, onStatusUpdate, onClick }) => {
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });

  const handleToggle = async (e) => {
    e.stopPropagation();
    const newStatus = report.status === "pending" ? "resolved" : "pending";
    setUpdating(true);
    try {
      await updateReportStatus(report.id, newStatus);
      toast.success(`Marked as ${newStatus}`);
      onStatusUpdate(report.id, newStatus);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="
        group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4
        bg-gray-900 border border-gray-800 hover:border-gray-700
        rounded-xl px-4 py-4 cursor-pointer
        transition-all duration-200 hover:bg-gray-900/80
      "
    >
      {/* Status badge */}
      <div className="shrink-0">
        <StatusBadge status={report.status} size="small" />
      </div>

      {/* Description */}
      <p className="flex-1 text-gray-300 text-sm line-clamp-1 min-w-0">
        {report.description}
      </p>

      {/* Meta info */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">

        {/* Reporter */}
        {report.reporter_name && (
          <span className="text-gray-500 text-xs hidden md:block">
            {report.reporter_name}
          </span>
        )}

        {/* Date */}
        <span className="text-gray-600 text-xs hidden sm:block">
          {formatDate(report.created_at)}
        </span>

        {/* Pincode */}
        <span className="text-blue-400 text-xs font-mono font-semibold hidden lg:block">
          {report.pincode}
        </span>

        {/* Toggle button */}
        <button
          onClick={handleToggle}
          disabled={updating}
          className={`
            flex items-center gap-1.5 text-xs font-medium
            px-3 py-1.5 rounded-lg border transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${report.status === "pending"
              ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
              : "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
            }
          `}
        >
          {updating ? (
            <span className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
          ) : report.status === "pending" ? (
            <CheckCircle className="w-3.5 h-3.5" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {updating
              ? "..."
              : report.status === "pending"
              ? "Resolve"
              : "Reopen"}
          </span>
        </button>

        {/* Chevron */}
        <ChevronDown className="w-4 h-4 text-gray-600 -rotate-90 group-hover:text-gray-400 transition-colors hidden sm:block" />
      </div>
    </div>
  );
};

export default AuthorityDashboard;