// ─────────────────────────────────────────
// pages/authority/AuthorityDashboard.jsx
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
import { colors, fonts } from "../../styles/designTokens";
import {
  ShieldCheck, FileText, Clock, CheckCircle, RefreshCw,
  Search, X, Inbox, BarChart2, MapPin, ChevronDown,
  List, LayoutGrid, SlidersHorizontal, Building2
} from "lucide-react";

const TABS = [
  { key: "all",      label: "All Reports" },
  { key: "pending",  label: "Pending"  },
  { key: "resolved", label: "Resolved" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest First"  },
  { key: "oldest", label: "Oldest First"  },
  { key: "status", label: "By Status"     },
];

const AuthorityDashboard = () => {
  const { user } = useAuth();

  const [reports,      setReports]      = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const [activeTab,      setActiveTab]      = useState("all");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [sortKey,        setSortKey]        = useState("newest");
  const [showSortMenu,   setShowSortMenu]   = useState(false);
  const [viewMode,       setViewMode]       = useState("grid");
  const [showChart,      setShowChart]      = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail,     setShowDetail]     = useState(false);

  const dashboardStyle = {
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

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getReportStats();
      setMonthlyStats(res.data.monthly || []);
    } catch {
      // silently fail chart
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [fetchReports, fetchStats]);

  const stats = {
    total:    reports.length,
    pending:  reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    rate:     reports.length > 0
      ? Math.round((reports.filter((r) => r.status === "resolved").length / reports.length) * 100)
      : 0,
  };

  const filteredReports = reports
    .filter((r) => activeTab === "all" || r.status === activeTab)
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.description?.toLowerCase().includes(q) ||
        r.pincode?.toString().includes(q) ||
        r.reporter_name?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortKey === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortKey === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortKey === "status") return a.status.localeCompare(b.status);
      return 0;
    });

  const handleStatusUpdate = (reportId, newStatus) => {
    setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: newStatus } : r));
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => ({ ...prev, status: newStatus }));
    }
    fetchStats(); 
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowDetail(true);
  };

  const statCards = [
    {
      label: "Total Reports",
      value: stats.total,
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 border-blue-100",
      iconBg: "bg-blue-100",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock className="w-5 h-5 text-[var(--c-accentGold)]" />,
      bg: "bg-[#FFF8E6] border-[#F2DCA2]",
      iconBg: "bg-amber-100",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <CheckCircle className="w-5 h-5 text-[var(--c-oliveDark)]" />,
      bg: "bg-[var(--c-sage)]/30 border-[var(--c-olive)]/20",
      iconBg: "bg-[var(--c-sage)]",
    },
    {
      label: "Resolution Rate",
      value: `${stats.rate}%`,
      icon: <BarChart2 className="w-5 h-5 text-[var(--c-charcoal)]" />,
      bg: "bg-gray-50 border-gray-200",
      iconBg: "bg-gray-200",
    },
  ];

  return (
    <div style={dashboardStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white border border-[var(--c-borderLight)] rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Building2 className="w-7 h-7 text-[var(--c-accentGold)]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight mb-1" style={{ fontFamily: fonts.heading }}>
                  Authority Dashboard
                </h1>
                <p className="text-[var(--c-textSecondary)] text-sm font-medium">
                  Welcome back, <span className="text-[var(--c-olive)] font-bold">{user?.name || "Official"}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 bg-white border border-[var(--c-borderLight)] rounded-full px-3 py-1.5 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[var(--c-olive)]" />
                <span className="text-[var(--c-textSecondary)] text-xs font-bold uppercase tracking-wider">
                  Zone: <span className="text-[var(--c-charcoal)]">{user?.pincode || "—"}</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-[var(--c-borderLight)] rounded-full px-3 py-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--c-accentGold)]" />
                <span className="text-[var(--c-charcoal)] text-xs font-bold uppercase tracking-wider">
                  {user?.department || "Department"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--c-sage)]/50 border border-[var(--c-olive)]/20 rounded-full px-3 py-1.5 shadow-sm">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--c-olive)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--c-oliveDark)]" />
                </span>
                <span className="text-[var(--c-oliveDark)] text-xs font-bold uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowChart((p) => !p)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-sm ${
                showChart
                  ? "bg-[var(--c-charcoal)] text-white"
                  : "bg-white border border-[var(--c-borderLight)] text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)]"
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">{showChart ? "Hide Chart" : "Show Chart"}</span>
            </button>

            <button
              onClick={() => { fetchReports(true); fetchStats(); }}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-[var(--c-borderLight)] text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30 px-4 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[var(--c-olive)]" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, idx) => (
            <div key={idx} className={`p-5 rounded-3xl border flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${card.bg}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  {card.icon}
                </div>
                <span className="text-xs font-bold text-[var(--c-textSecondary)] uppercase tracking-wider hidden sm:block">
                  {card.label}
                </span>
              </div>
              <div>
                <p className="text-[var(--c-textSecondary)] text-xs sm:hidden mb-1 font-bold uppercase">{card.label}</p>
                <p className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)]">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── RESOLUTION PROGRESS ── */}
        {stats.total > 0 && (
          <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl px-6 py-5 flex flex-col gap-4 shadow-sm mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--c-olive)]" />
                <span className="text-[var(--c-charcoal)] text-sm font-black uppercase tracking-wider">Overall Resolution Progress</span>
              </div>
              <span className="text-[var(--c-olive)] text-lg font-black">{stats.rate}%</span>
            </div>
            <div className="w-full h-3 bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--c-olive)] to-[var(--c-oliveDark)] transition-all duration-1000 ease-out"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--c-textSecondary)]">
              <span><span className="text-[var(--c-accentGold)]">{stats.pending}</span> pending</span>
              <span><span className="text-[var(--c-olive)]">{stats.resolved}</span> of <span className="text-[var(--c-charcoal)]">{stats.total}</span> resolved</span>
            </div>
          </div>
        )}

        {/* ── CHART SECTION ── */}
        {showChart && (
          <div className="mb-8 transition-all duration-300">
            {statsLoading ? (
              <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl p-8 flex items-center justify-center shadow-sm">
                <Loader variant="section" text="Loading analytics..." />
              </div>
            ) : (
              <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl p-6 shadow-sm">
                 <StatsChart monthlyData={monthlyStats} title="Monthly Incident Overview" />
              </div>
            )}
          </div>
        )}

        {/* ── REPORTS SECTION ── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[var(--c-charcoal)] font-black text-xl flex items-center gap-2" style={{ fontFamily: fonts.heading }}>
                <FileText className="w-6 h-6 text-[var(--c-olive)]" />
                Zone Incidents
                <span className="text-sm font-bold text-[var(--c-textSecondary)] bg-white border border-[var(--c-borderLight)] px-2 py-0.5 rounded-full ml-2">
                  {filteredReports.length}
                </span>
              </h2>

              <div className="flex items-center gap-1 bg-white border border-[var(--c-borderLight)] rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[var(--c-sage)] text-[var(--c-oliveDark)] shadow-sm" : "text-gray-400 hover:text-[var(--c-charcoal)]"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[var(--c-sage)] text-[var(--c-oliveDark)] shadow-sm" : "text-gray-400 hover:text-[var(--c-charcoal)]"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by issue, reporter name, or pincode..."
                  className="w-full bg-white border border-[var(--c-borderLight)] rounded-full pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-[var(--c-charcoal)] focus:ring-1 focus:ring-[var(--c-charcoal)] shadow-sm transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--c-charcoal)]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* FIXED CONTAINER: No more overflow-x-hidden on the dropdown! */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                
                {/* Sort Dropdown */}
                <div className="relative shrink-0 z-20">
                  <button
                    onClick={() => setShowSortMenu((p) => !p)}
                    className="flex items-center gap-2 h-full bg-white border border-[var(--c-borderLight)] hover:bg-[var(--c-offWhite)] text-[var(--c-charcoal)] text-sm font-bold px-4 py-2.5 rounded-full transition-all shadow-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">{SORT_OPTIONS.find((s) => s.key === sortKey)?.label}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 bg-white border border-[var(--c-borderLight)] rounded-2xl shadow-xl overflow-hidden w-48 py-2">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }}
                            className={`w-full text-left px-5 py-3 text-sm transition-colors ${sortKey === opt.key ? "bg-[var(--c-sage)]/50 text-[var(--c-oliveDark)] font-bold" : "text-[var(--c-charcoal)] hover:bg-[var(--c-offWhite)] font-medium"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex bg-white border border-[var(--c-borderLight)] rounded-full p-1 gap-1 shadow-sm overflow-x-auto hide-scrollbar">
                  {TABS.map((tab) => {
                    const count = tab.key === "all" ? stats.total : tab.key === "pending" ? stats.pending : stats.resolved;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-all flex items-center whitespace-nowrap gap-2 ${
                          activeTab === tab.key
                            ? "bg-[var(--c-charcoal)] text-white shadow-md"
                            : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-offWhite)]"
                        }`}
                      >
                        {tab.label}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-[var(--c-offWhite)] border border-[var(--c-borderLight)]"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ── DATA RENDER ── */}
          {loading ? (
            <div className="py-12"><Loader variant="section" text="Syncing zone reports..." /></div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white border border-[var(--c-borderLight)] rounded-3xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[var(--c-sage)] flex items-center justify-center mb-2">
                <Inbox className="w-8 h-8 text-[var(--c-olive)]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--c-charcoal)]" style={{ fontFamily: fonts.heading }}>
                  {searchQuery ? "No matches found" : activeTab !== "all" ? `No ${activeTab} reports` : "Zone is clear"}
                </h3>
                <p className="text-[var(--c-textSecondary)] text-sm font-medium mt-1">
                  {searchQuery ? "Try adjusting your search terms" : "New incidents submitted by citizens will appear here."}
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div key={report.id} onClick={() => handleReportClick(report)} className="cursor-pointer transform hover:-translate-y-1 transition-transform">
                  <ReportCard report={report} mode="authority" onStatusUpdate={handleStatusUpdate} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredReports.map((report) => (
                <ListReportRow key={report.id} report={report} onStatusUpdate={handleStatusUpdate} onClick={() => handleReportClick(report)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {showDetail && selectedReport && (
        <div className="fixed inset-0 z-50 bg-[var(--c-charcoal)]/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl my-auto animate-modal-card">
            <ReportDetailCard
              report={selectedReport}
              mode="authority"
              onStatusUpdate={handleStatusUpdate}
              onBack={() => { setShowDetail(false); setSelectedReport(null); }}
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-modal-card { animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};

// ═════════════════════════════════════════
//  LIST ROW COMPONENT (Light Premium Theme)
// ═════════════════════════════════════════
const ListReportRow = ({ report, onStatusUpdate, onClick }) => {
  const [updating, setUpdating] = useState(false);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

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
      className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white border border-[var(--c-borderLight)] rounded-2xl px-5 py-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-[var(--c-charcoal)]"
    >
      <div className="shrink-0">
        <StatusBadge status={report.status} size="small" />
      </div>

      <p className="flex-1 text-[var(--c-charcoal)] font-medium text-sm line-clamp-1 min-w-0">
        {report.description}
      </p>

      <div className="flex items-center gap-4 shrink-0 flex-wrap">
        {report.reporter_name && (
          <span className="text-[var(--c-textSecondary)] text-xs font-bold uppercase tracking-wider hidden md:block">
            {report.reporter_name}
          </span>
        )}
        <span className="text-[var(--c-textSecondary)] font-medium text-xs hidden sm:block">
          {formatDate(report.created_at)}
        </span>
        <span className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] px-2.5 py-1 rounded-md text-[var(--c-charcoal)] text-xs font-bold tracking-widest hidden lg:block">
          {report.pincode}
        </span>

        <button
          onClick={handleToggle}
          disabled={updating}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all disabled:opacity-50 shadow-sm transform hover:-translate-y-0.5 ${
            report.status === "pending"
              ? "bg-[var(--c-olive)] border-[var(--c-oliveDark)] text-white hover:bg-[var(--c-oliveDark)]"
              : "bg-[#FFF8E6] border-[#F2DCA2] text-[var(--c-accentGold)] hover:bg-[#F2DCA2]/30"
          }`}
        >
          {updating ? (
            <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : report.status === "pending" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {updating ? "Syncing..." : report.status === "pending" ? "Resolve" : "Reopen"}
          </span>
        </button>

        <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-[var(--c-charcoal)] transition-colors hidden sm:block" />
      </div>
    </div>
  );
};

export default AuthorityDashboard;