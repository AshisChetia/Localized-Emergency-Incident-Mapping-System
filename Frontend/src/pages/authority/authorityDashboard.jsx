// ─────────────────────────────────────────
// pages/authority/AuthorityDashboard.jsx
// ─────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getReportsByPincode,
  updateReportStatus,
} from "../../services/reportService";
import ReportCard from "../../components/ReportCard";
import ReportDetailCard from "../../components/ReportDetailCard";
import StatsChart from "../../components/StatsChart";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";
import { colors, fonts } from "../../styles/designTokens";
import { parseUTCDate, formatDate } from "../../utils/dateTimeUtils";
import {
  ShieldCheck, FileText, Clock, CheckCircle, RefreshCw,
  Search, X, Inbox, BarChart2, MapPin, ChevronDown,
  List, LayoutGrid, SlidersHorizontal, Building2,
  Map as MapIcon 
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const TABS = [
  { key: "all", label: "All Reports" },
  { key: "reported", label: "Reported" },
  { key: "under_review", label: "Under Review" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const SORT_OPTIONS = [
  { key: "impact", label: "Most Upvoted" },
  { key: "newest", label: "Newest First" },
  { key: "oldest", label: "Oldest First" },
  { key: "status", label: "By Status" },
];

const getReportTimestamp = (report) => {
  if (!report?.created_at) {
    return Number(report?.id || 0);
  }

  const directTime = Date.parse(report.created_at);
  if (Number.isFinite(directTime)) {
    return directTime;
  }

  const parsed = parseUTCDate(report.created_at);
  const parsedTime = parsed instanceof Date ? parsed.getTime() : Number.NaN;
  return Number.isFinite(parsedTime) ? parsedTime : Number(report?.id || 0);
};

const compareReportsByDate = (a, b, direction = "desc") => {
  const timeDiff = getReportTimestamp(a) - getReportTimestamp(b);
  if (timeDiff !== 0) {
    return direction === "desc" ? -timeDiff : timeDiff;
  }

  const idDiff = Number(a?.id || 0) - Number(b?.id || 0);
  return direction === "desc" ? -idDiff : idDiff;
};

const AuthorityDashboard = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const [overviewMode, setOverviewMode] = useState("map");

  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

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
    else setLoading(true);

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

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const stats = {
    total: reports.length,
    reported: reports.filter((r) => r.status === "reported").length,
    underReview: reports.filter((r) => r.status === "under_review").length,
    inProgress: reports.filter((r) => r.status === "in_progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    closed: reports.filter((r) => r.status === "closed").length,
    rate: reports.length > 0
      ? Math.round((reports.filter((r) => r.status === "resolved" || r.status === "closed").length / reports.length) * 100)
      : 0,
  };

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const scopedReports = reports.filter((report) => {
      if (activeTab !== "all" && report.status !== activeTab) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        report.description?.toLowerCase().includes(query) ||
        report.pincode?.toString().includes(query) ||
        report.reporter_name?.toLowerCase().includes(query)
      );
    });

    const sortedReports = [...scopedReports];

    sortedReports.sort((a, b) => {
      if (sortKey === "impact") {
        const impactDiff = Number(b.verification_count || 0) - Number(a.verification_count || 0);
        if (impactDiff !== 0) return impactDiff;
        return compareReportsByDate(a, b, "desc");
      }

      if (sortKey === "newest") {
        return compareReportsByDate(a, b, "desc");
      }

      if (sortKey === "oldest") {
        return compareReportsByDate(a, b, "asc");
      }

      if (sortKey === "status") {
        const statusDiff = a.status.localeCompare(b.status);
        if (statusDiff !== 0) return statusDiff;
        return compareReportsByDate(a, b, "desc");
      }

      return compareReportsByDate(a, b, "desc");
    });

    return sortedReports;
  }, [reports, activeTab, searchQuery, sortKey]);

  const handleStatusUpdate = (reportId, newStatus) => {
    setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: newStatus } : r));
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowDetail(true);
  };

  const statCards = [
    {
      label: "Total Reports",
      value: stats.total,
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50 border-blue-200",
      iconBg: "bg-blue-100",
    },
    {
      label: "Reported",
      value: stats.reported,
      icon: <Clock className="w-5 h-5 text-gray-500" />,
      bg: "bg-gray-50 border-gray-200",
      iconBg: "bg-gray-100",
    },
    {
      label: "Under Review",
      value: stats.underReview,
      icon: <Search className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-50 border-amber-200",
      iconBg: "bg-amber-100",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: <RefreshCw className="w-5 h-5 text-blue-500" />,
      bg: "bg-blue-50 border-blue-200",
      iconBg: "bg-blue-100",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      bg: "bg-emerald-50 border-emerald-200",
      iconBg: "bg-emerald-100",
    },
    {
      label: "Closed",
      value: stats.closed,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
      bg: "bg-emerald-100 border-emerald-300",
      iconBg: "bg-emerald-200",
    },
  ];

  return (
    <div style={dashboardStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] pb-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">

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
              {user?.department && (
                <div className="flex items-center gap-1.5 bg-white border border-[var(--c-borderLight)] rounded-full px-3 py-1.5 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-[var(--c-olive)]" />
                  <span className="text-[var(--c-charcoal)] text-xs font-bold tracking-wider">
                    {user?.department}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-[var(--c-sage)]/50 border border-[var(--c-olive)]/20 rounded-full px-3 py-1.5 shadow-sm">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--c-olive)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--c-oliveDark)]" />
                </span>
                <span className="text-[var(--c-oliveDark)] text-xs font-bold uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 bg-white border border-[var(--c-borderLight)] rounded-xl p-1 shadow-sm shrink-0">
              <button
                onClick={() => setOverviewMode("map")}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${overviewMode === "map" ? "bg-[var(--c-charcoal)] text-white" : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30"}`}
              >
                <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline">Live Map</span>
              </button>
              <button
                onClick={() => setOverviewMode("chart")}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${overviewMode === "chart" ? "bg-[var(--c-charcoal)] text-white" : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30"}`}
              >
                <BarChart2 className="w-4 h-4" /> <span className="hidden sm:inline">Upvote Chart</span>
              </button>
            </div>

            <button
              onClick={() => { fetchReports(true); }}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-[var(--c-borderLight)] text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30 px-4 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[var(--c-olive)]" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((card, idx) => (
            <div key={idx} className={`p-5 rounded-3xl border flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ${card.bg}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>{card.icon}</div>
                <span className="text-xs font-bold text-[var(--c-textSecondary)] uppercase tracking-wider hidden sm:block">{card.label}</span>
              </div>
              <div>
                <p className="text-[var(--c-textSecondary)] text-xs sm:hidden mb-1 font-bold uppercase">{card.label}</p>
                <p className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)]">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── STRATEGIC OVERVIEW (MAP vs CHART) ── */}
        <div className="mb-8 transition-all duration-300">
          {overviewMode === "map" ? (
            <div className="w-full h-[500px] bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-3xl overflow-hidden shadow-sm relative z-0">
              <MapContainer
                key={filteredReports.length > 0 ? filteredReports[0].id : "empty-assam-view"}
                center={filteredReports.length > 0 
                  ? [filteredReports[0].latitude, filteredReports[0].longitude] 
                  : [26.2006, 92.9376] 
                }
                zoom={filteredReports.length > 0 ? 13 : 7}
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredReports.map((report) => (
                  report.latitude && report.longitude && (
                    <Marker key={report.id} position={[report.latitude, report.longitude]}>
                      <Popup className="rounded-xl overflow-hidden shadow-lg border-0 p-0 m-0">
                        <div className="p-1 min-w-[200px] font-sans">
                          {report.image_url && (
                            <img src={report.image_url} alt="Incident" className="w-full h-24 object-cover rounded-lg mb-2" />
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.status === "pending" ? "bg-[#FFF8E6] text-[#d4af37]" : "bg-[#87a96b]/30 text-[#4b5320]"}`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#333333] truncate mt-1">{report.description}</p>
                          <button
                            onClick={() => handleReportClick(report)}
                            className="mt-3 flex items-center justify-center gap-1.5 w-full bg-[#faf9f6] hover:bg-[#87a96b]/50 text-[#4b5320] text-xs font-bold py-1.5 rounded-lg transition-colors border border-[#e5e7eb]"
                          >
                            <FileText className="w-3 h-3" /> View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          ) : (
            <div className="bg-white border border-[var(--c-borderLight)] rounded-3xl p-6 shadow-sm">
              <StatsChart
                reports={reports}
                title="Top Upvoted Reports"
                onSelectReport={handleReportClick}
              />
            </div>
          )}
        </div>

        {/* ── REPORTS SECTION (LIST/GRID) ── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[var(--c-charcoal)] font-black text-xl flex items-center gap-2" style={{ fontFamily: fonts.heading }}>
                <FileText className="w-6 h-6 text-[var(--c-olive)]" /> Zone Incidents
                <span className="text-sm font-bold text-[var(--c-textSecondary)] bg-white border border-[var(--c-borderLight)] px-2 py-0.5 rounded-full ml-2">
                  {filteredReports.length}
                </span>
              </h2>

              <div className="flex items-center gap-1 bg-white border border-[var(--c-borderLight)] rounded-xl p-1 shadow-sm shrink-0">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[var(--c-sage)] text-[var(--c-oliveDark)] shadow-sm" : "text-gray-400 hover:text-[var(--c-charcoal)]"}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[var(--c-sage)] text-[var(--c-oliveDark)] shadow-sm" : "text-gray-400 hover:text-[var(--c-charcoal)]"}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── FIXED MOBILE TOOLBAR (Scrollable, no clipping) ── */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative w-full lg:flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by issue, reporter name, or pincode..."
                  className="w-full bg-white border border-[var(--c-borderLight)] rounded-full pl-11 pr-10 py-3 text-sm focus:outline-none focus:border-[var(--c-charcoal)] focus:ring-1 focus:ring-[var(--c-charcoal)] shadow-sm transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative shrink-0 z-30 self-start">
                  <button onClick={() => setShowSortMenu((p) => !p)} className="flex items-center gap-2 h-full bg-white border border-[var(--c-borderLight)] hover:bg-[var(--c-offWhite)] text-[var(--c-charcoal)] text-sm font-bold px-4 py-2.5 rounded-full transition-all shadow-sm">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">{SORT_OPTIONS.find((s) => s.key === sortKey)?.label}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute left-0 top-full mt-2 bg-white border border-[var(--c-borderLight)] rounded-2xl shadow-xl overflow-hidden w-48 py-2 z-30">
                        {SORT_OPTIONS.map((opt) => (
                          <button key={opt.key} onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }} className={`w-full text-left px-5 py-3 text-sm transition-colors ${sortKey === opt.key ? "bg-[var(--c-sage)]/50 text-[var(--c-oliveDark)] font-bold" : "text-[var(--c-charcoal)] hover:bg-[var(--c-offWhite)] font-medium"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0">
                  {TABS.map((tab) => {
                    let count = 0;
                    if (tab.key === "all") count = stats.total;
                    else if (tab.key === "reported") count = stats.reported;
                    else if (tab.key === "under_review") count = stats.underReview;
                    else if (tab.key === "in_progress") count = stats.inProgress;
                    else if (tab.key === "resolved") count = stats.resolved;
                    else if (tab.key === "closed") count = stats.closed;
                    
                    return (
                      <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`text-sm font-bold px-4 py-2.5 rounded-full transition-all flex items-center whitespace-nowrap gap-2 border shadow-sm ${activeTab === tab.key ? "bg-[var(--c-charcoal)] text-white border-[var(--c-charcoal)]" : "bg-white text-[var(--c-textSecondary)] border-[var(--c-borderLight)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-offWhite)]"}`}>
                        {tab.label}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20" : "bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] text-[var(--c-textSecondary)]"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12"><Loader variant="section" text="Syncing zone reports..." /></div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center bg-white border border-[var(--c-borderLight)] rounded-3xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[var(--c-sage)] flex items-center justify-center mb-2">
                <Inbox className="w-8 h-8 text-[var(--c-olive)]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--c-charcoal)]" style={{ fontFamily: fonts.heading }}>{searchQuery ? "No matches found" : activeTab !== "all" ? `No ${activeTab} reports` : "Zone is clear"}</h3>
                <p className="text-[var(--c-textSecondary)] text-sm font-medium mt-1">{searchQuery ? "Try adjusting your search terms" : "New incidents submitted by citizens will appear here."}</p>
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

      {showDetail && selectedReport && (
        <div className="fixed inset-0 z-50 bg-[var(--c-charcoal)]/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl my-auto animate-modal-card">
            <ReportDetailCard report={selectedReport} mode="authority" onStatusUpdate={handleStatusUpdate} onBack={() => { setShowDetail(false); setSelectedReport(null); }} />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-modal-card { animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; }
        .leaflet-popup-content { margin: 8px; }
      `}} />
    </div>
  );
};

const ListReportRow = ({ report, onStatusUpdate, onClick }) => {
  const [updating, setUpdating] = useState(false);

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
    <div onClick={onClick} className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white border border-[var(--c-borderLight)] rounded-2xl px-5 py-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-[var(--c-charcoal)]">
      <div className="shrink-0"><StatusBadge status={report.status} size="small" /></div>
      <p className="flex-1 text-[var(--c-charcoal)] font-medium text-sm line-clamp-1 min-w-0">{report.description}</p>
      <div className="flex items-center gap-4 shrink-0 flex-wrap">
        {report.reporter_name && <span className="text-[var(--c-textSecondary)] text-xs font-bold uppercase tracking-wider hidden md:block">{report.reporter_name}</span>}
        <span className="text-[var(--c-textSecondary)] text-xs font-bold uppercase tracking-wider hidden md:block">
          {report.verification_count || 0} upvote{(report.verification_count || 0) === 1 ? "" : "s"}
        </span>
        <span className="text-[var(--c-textSecondary)] font-medium text-xs hidden sm:block">{formatDate(report.created_at)}</span>
        <span className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] px-2.5 py-1 rounded-md text-[var(--c-charcoal)] text-xs font-bold tracking-widest hidden lg:block">{report.pincode}</span>
        <button className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all shadow-sm transform hover:-translate-y-0.5 bg-[var(--c-offWhite)] border-[var(--c-borderLight)] text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Details</span>
        </button>
        <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90 group-hover:text-[var(--c-charcoal)] transition-colors hidden sm:block" />
      </div>
    </div>
  );
};

export default AuthorityDashboard;
