// ─────────────────────────────────────────
// pages/department-manager/DepartmentManagerDashboard.jsx
// Team Member Dashboard - see assigned reports with
// full detail view and status update controls
// ─────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAssignedReports, getReportById } from "../../services/reportService";
import ReportDetailCard from "../../components/ReportDetailCard";
import Loader from "../../components/Loader";
import StatsChart from "../../components/StatsChart";
import toast from "react-hot-toast";
import {
  Briefcase, AlertCircle, Clock, CheckCircle2,
  MapPin, Calendar, Filter, Eye, X, Lock, BarChart2, Navigation,
  FileText
} from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DepartmentManagerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, resolved: 0, total: 0 });
  const [activeFilter, setActiveFilter] = useState("all");
  const [overviewMode, setOverviewMode] = useState("map");

  // Report detail modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const dashStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-textSecondary": colors.textSecondary,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  // Format sub-department name for display
  const formatSubDepartment = (deptId) => {
    const depts = {
      water_supply: "Water Supply",
      roads: "Roads & Highways",
      sanitation: "Sanitation & Waste",
      parks: "Parks & Public Gardens",
      electricity: "Electricity Distribution",
    };
    return depts[deptId] || deptId;
  };

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await getAssignedReports();
      setReports(response.data?.reports || []);
      setStats({
        reported: response.data?.stats?.reported || 0,
        underReview: response.data?.stats?.underReview || 0,
        inProgress: response.data?.stats?.inProgress || 0,
        resolved: response.data?.stats?.resolved || 0,
        closed: response.data?.stats?.closed || 0,
        total: response.data?.stats?.total || 0,
      });
    } catch (error) {
      toast.error("Failed to load assigned reports");
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // ── Open Report Detail ──
  const openReportDetail = async (reportId) => {
    setDetailLoading(true);
    try {
      const response = await getReportById(reportId);
      setSelectedReport(response.data?.report || null);
    } catch (error) {
      toast.error("Failed to load report details");
      console.error(error);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Handle status update from detail view ──
  const handleDetailStatusUpdate = (reportId, newStatus) => {
    // Optimistic UI updates
    setSelectedReport((prev) => prev ? { ...prev, status: newStatus } : prev);
    setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: newStatus } : r));
    
    // Background silent sync for stats
    loadData(true); 
  };

  // ── Filter reports ──
  const filteredReports = reports.filter((r) => {
    if (activeFilter === "all") return true;
    return r.status === activeFilter;
  });

  // ── Status badge styling ──
  const getStatusStyle = (status) => {
    switch (status) {
      case "reported":
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", label: "Reported" };
      case "under_review":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Under Review" };
      case "in_progress":
        return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "In Progress" };
      case "resolved":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Resolved" };
      case "closed":
        return { bg: "bg-emerald-900/10", text: "text-emerald-900", border: "border-emerald-900/20", label: "Closed" };
      // Legacy
      case "pending":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };
    }
  };

  // ── Format date ──
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch { return dateStr; }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div style={dashStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[var(--c-charcoal)] mb-2" style={{ fontFamily: fonts.heading }}>
          Department Dashboard
        </h1>
        <p className="text-gray-600">
          Managing: <span className="font-bold text-[var(--c-charcoal)]">{formatSubDepartment(user?.sub_department)}</span>
          {user?.pincode && <span className="text-sm ml-2 text-[var(--c-textSecondary)]">• Pincode: {user.pincode}</span>}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total", count: stats.total, icon: Briefcase, bg: "bg-blue-50", iconColor: "text-blue-500" },
          { label: "Reported", count: stats.reported, icon: AlertCircle, bg: "bg-gray-50", iconColor: "text-gray-500" },
          { label: "Under Review", count: stats.underReview, icon: Eye, bg: "bg-amber-50", iconColor: "text-amber-500" },
          { label: "In Progress", count: stats.inProgress, icon: Clock, bg: "bg-blue-50", iconColor: "text-blue-500" },
          { label: "Resolved", count: stats.resolved, icon: CheckCircle2, bg: "bg-emerald-50", iconColor: "text-emerald-500" },
          { label: "Closed", count: stats.closed, icon: Lock, bg: "bg-emerald-100", iconColor: "text-emerald-700" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border border-gray-200 rounded-xl p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</h3>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <p className="text-3xl font-black text-[var(--c-charcoal)]">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {[
          { key: "all", label: "All Reports" },
          { key: "reported", label: "Reported" },
          { key: "under_review", label: "Under Review" },
          { key: "in_progress", label: "In Progress" },
          { key: "resolved", label: "Resolved" },
          { key: "closed", label: "Closed" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeFilter === tab.key
                ? "bg-[var(--c-olive)] text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({tab.key === "all" ? reports.length : reports.filter(r => r.status === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* ── STRATEGIC OVERVIEW (MAP vs CHART) ── */}
      <div className="flex items-center gap-2 mb-4 bg-white border border-gray-200 p-1.5 rounded-full w-fit shadow-sm">
        <button
          onClick={() => setOverviewMode("map")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            overviewMode === "map" ? "bg-[var(--c-sage)] text-[var(--c-oliveDark)] shadow-sm" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Navigation className="w-4 h-4" /> Department Coverage Map
        </button>
        <button
          onClick={() => setOverviewMode("chart")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            overviewMode === "chart" ? "bg-[var(--c-sage)] text-[var(--c-oliveDark)] shadow-sm" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Top Voted Incidents
        </button>
      </div>

      <div className="mb-8 transition-all duration-300">
        {overviewMode === "map" ? (
          <div className="w-full h-[400px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative z-0">
            <MapContainer
              key={filteredReports.length > 0 ? filteredReports[0].id : "empty-map"}
              center={filteredReports.length > 0 ? [filteredReports[0].latitude, filteredReports[0].longitude] : [26.2006, 92.9376]}
              zoom={filteredReports.length > 0 ? 13 : 7}
              className="w-full h-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredReports.map((report) => (
                report.latitude && report.longitude && (
                  <Marker key={report.id} position={[report.latitude, report.longitude]}>
                    <Popup className="rounded-xl overflow-hidden shadow-lg border-0 p-0 m-0">
                      <div className="p-1 min-w-[200px] font-sans">
                        {report.image_url && <img src={report.image_url} alt="Incident" className="w-full h-24 object-cover rounded-lg mb-2" />}
                        <p className="text-sm font-bold text-gray-800 truncate mt-1">{report.description}</p>
                        <button
                          onClick={() => {
                            setDetailLoading(true);
                            getReportById(report.id).then(res => {
                              setSelectedReport(res.data?.report);
                              setShowDetail(true);
                              setDetailLoading(false);
                            });
                          }}
                          className="mt-3 flex items-center justify-center gap-1.5 w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold py-1.5 rounded-lg transition-colors border border-gray-200"
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
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-[400px]">
            <StatsChart
              reports={reports}
              title={`Most Critical Issues (${formatSubDepartment(user?.sub_department)})`}
              onSelectReport={(r) => openReportDetail(r.id)}
            />
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[var(--c-charcoal)]">
            {activeFilter === "all" ? "All Assigned Reports" : `${activeFilter.replace("_", " ")} Reports`}
            <span className="text-sm font-normal text-gray-400 ml-2">({filteredReports.length})</span>
          </h2>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No reports found</p>
            <p className="text-gray-300 text-sm mt-1">
              {activeFilter !== "all" ? "Try changing the filter." : "Reports assigned to your department will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.map((report) => {
              const statusStyle = getStatusStyle(report.status);

              return (
                <div
                  key={report.id}
                  onClick={() => openReportDetail(report.id)}
                  className="p-5 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    {report.image_url && (
                      <div className="w-full md:w-32 h-32 md:h-24 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                        <img src={report.image_url} alt="Report" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm text-[var(--c-charcoal)] font-medium line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {statusStyle.label}
                          </span>
                          <Eye className="w-4 h-4 text-gray-300 group-hover:text-[var(--c-olive)] transition-colors" />
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {report.pincode || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(report.created_at)}
                        </span>
                        {report.department && (
                          <span className="flex items-center gap-1 text-[var(--c-olive)] font-medium">
                            <Briefcase className="w-3 h-3" /> {report.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Report Detail Modal ── */}
      {(selectedReport || detailLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => { if (!detailLoading) setSelectedReport(null); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center">
                <Loader variant="section" text="Loading report details..." />
              </div>
            ) : (
              <>
                {/* Close button */}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-all shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <ReportDetailCard
                  report={selectedReport}
                  mode="department_manager"
                  onStatusUpdate={handleDetailStatusUpdate}
                  onBack={() => setSelectedReport(null)}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagerDashboard;
