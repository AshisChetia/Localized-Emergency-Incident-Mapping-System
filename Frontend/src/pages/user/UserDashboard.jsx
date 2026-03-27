// ─────────────────────────────────────────
// pages/user/UserDashboard.jsx
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyReports,
  deleteReport,
} from "../../services/reportService";
import ReportCard from "../../components/ReportCard";
import ReportForm from "../../components/ReportForm";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "../../styles/designTokens";
import { formatDateShort } from "../../utils/dateTimeUtils";
import {
  Plus, FileText, CheckCircle, AlertCircle, Search, 
  Activity, X, Trash2, MapPin, Clock,
  LayoutGrid, Map as MapIcon, ChevronRight, Building2
} from "lucide-react";

// ── LEAFLET MAP IMPORTS ──
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
  { key: "all", label: "Overview" },
  { key: "pending", label: "Action Needed" },
  { key: "resolved", label: "Completed" },
];

const UserDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyReports();
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
      setError("Failed to sync structural data.");
      toast.error("Telemetry error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (selectedReport || showForm) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedReport, showForm]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permenently remove this report?")) return;
    setDeleting(true);
    try {
      await deleteReport(id);
      toast.success("Record deleted");
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const totalReports = reports.length;
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  const filteredReports = reports.filter((report) => {
    const matchesTab = activeTab === "all" || report.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      report.description?.toLowerCase().includes(searchLower) ||
      report.pincode?.includes(searchLower) ||
      report.id?.toString().includes(searchLower);
    return matchesTab && matchesSearch;
  });

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

  return (
    <div style={dashboardStyle} className="min-h-screen bg-[var(--c-offWhite)] relative selection:bg-[var(--c-sage)] selection:text-[var(--c-charcoal)]">
      
      {/* ── ALERTS / MODALS ── */}
      <AnimatePresence>
        {showForm && (
          <ReportForm
            onClose={() => setShowForm(false)}
            onSuccess={() => { setShowForm(false); fetchReports(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedReport && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[var(--c-charcoal)]/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }} 
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh] overflow-hidden border border-[var(--c-borderLight)]"
            >
              
              {/* Image Side */}
              <div className="w-full md:w-5/12 bg-[var(--c-sage)]/10 border-b md:border-b-0 md:border-r border-[var(--c-borderLight)] relative shrink-0 min-h-[250px] md:min-h-0">
                 {selectedReport.image_url ? (
                  <img src={selectedReport.image_url} alt="Incident Context" className="w-full h-full object-cover" />
                 ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[var(--c-textSecondary)]/40 gap-4">
                    <AlertCircle className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">No Documentation Attached</span>
                  </div>
                 )}
                 <div className="absolute top-5 left-5 z-10 flex gap-2">
                    <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm border bg-white/95 backdrop-blur-sm ${selectedReport.status === 'resolved' ? 'text-[var(--c-oliveDark)] border-[var(--c-sage)]' : 'text-[var(--c-accentGold)] border-[#F2DCA2]'}`}>
                      {selectedReport.status}
                    </span>
                 </div>
              </div>

              {/* Data Side */}
              <div className="w-full md:w-7/12 flex flex-col bg-white overflow-y-auto">
                <div className="px-8 py-6 border-b border-[var(--c-borderLight)] flex items-center justify-between shrink-0 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <div>
                    <span className="text-xs font-medium text-[var(--c-textSecondary)] uppercase tracking-widest block mb-1">Incident Profile</span>
                    <h2 className="text-[var(--c-charcoal)] font-bold text-2xl tracking-tight" style={{ fontFamily: fonts.heading }}>
                      Case #{selectedReport.id.toString().padStart(4, '0')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2.5 rounded-xl bg-[var(--c-sage)]/20 text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/40 transition-colors border border-[var(--c-borderLight)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 flex flex-col gap-8 grow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-[var(--c-sage)]/20 rounded-2xl p-5 border border-[var(--c-sage)]/40 flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase text-[var(--c-textSecondary)] font-semibold tracking-wider">Date Logged</span>
                      <span className="text-sm font-semibold text-[var(--c-charcoal)] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--c-textSecondary)]" />
                        {formatDateShort(selectedReport.created_at)}
                      </span>
                    </div>

                    <div className="flex-1 bg-[var(--c-sage)]/20 rounded-2xl p-5 border border-[var(--c-sage)]/40 flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase text-[var(--c-textSecondary)] font-semibold tracking-wider">Coordinates</span>
                      <span className="text-sm font-semibold text-[var(--c-charcoal)] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--c-textSecondary)]" />
                        Zone: {selectedReport.pincode}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-[var(--c-textSecondary)] uppercase tracking-widest mb-3">Incident Transcript</h3>
                    <p className="text-[var(--c-charcoal)] text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {selectedReport.description}
                    </p>
                  </div>

                  {selectedReport.department && (
                     <div className="mt-auto bg-[var(--c-sage)]/30 rounded-2xl p-5 border border-[var(--c-olive)]/20 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-[var(--c-sage)]/40 flex items-center justify-center text-[var(--c-olive)] shadow-sm shrink-0">
                         <Building2 className="w-5 h-5" />
                       </div>
                       <div>
                         <span className="text-[11px] uppercase text-[var(--c-olive)] font-semibold tracking-wider">Assigned Department</span>
                         <p className="text-sm font-semibold text-[var(--c-charcoal)]">{selectedReport.department}</p>
                       </div>
                     </div>
                  )}

                </div>

                <div className="p-6 border-t border-[var(--c-borderLight)] shrink-0 flex items-center justify-between bg-[var(--c-sage)]/10">
                  <button
                    onClick={() => handleDelete(selectedReport.id)}
                    disabled={deleting || selectedReport.status === "resolved"}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      selectedReport.status === "resolved" 
                        ? "text-[var(--c-textSecondary)] bg-[var(--c-sage)]/20 cursor-not-allowed" 
                        : "text-[#d32f2f] bg-white hover:bg-[#ffebee] border border-[#ffcdd2] shadow-sm hover:shadow"
                    }`}
                  >
                    {deleting ? <Loader variant="spinner" size="sm" /> : <><Trash2 className="w-4 h-4" /> Revoke</>}
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="bg-[var(--c-charcoal)] hover:bg-[var(--c-oliveDark)] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    Close Profile <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SAAS GRADE DASHBOARD CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white border border-[var(--c-borderLight)] rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                <Activity className="w-7 h-7 text-[var(--c-accentGold)]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight mb-1" style={{ fontFamily: fonts.heading }}>
                  Dashboard
                </h1>
                <p className="text-[var(--c-textSecondary)] text-sm font-medium">
                  Welcome back, <span className="text-[var(--c-olive)] font-bold">{user?.name?.split(' ')[0] || "Citizen"}</span>
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-[var(--c-oliveDark)] hover:bg-[var(--c-olive)] active:bg-[var(--c-charcoal)] text-white px-6 py-3 rounded-2xl font-bold shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto text-sm"
            style={{ fontFamily: fonts.heading }}
          >
            <Plus className="w-5 h-5" />
            New Report
          </button>
        </div>

        {/* Premium Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-[var(--c-borderLight)] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--c-textSecondary)] text-sm font-semibold">Total Reports</span>
              <div className="w-10 h-10 rounded-xl bg-[var(--c-sage)]/30 flex items-center justify-center border border-[var(--c-sage)]/40">
                <FileText className="w-5 h-5 text-[var(--c-olive)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>{totalReports}</p>
              <span className="text-sm font-medium text-[var(--c-textSecondary)]">submitted</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[var(--c-borderLight)] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--c-textSecondary)] text-sm font-semibold">Pending Actions</span>
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] flex items-center justify-center border border-[#F2DCA2]">
                <AlertCircle className="w-5 h-5 text-[var(--c-accentGold)]" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>{pendingCount}</p>
              <span className="text-sm font-medium text-[var(--c-textSecondary)]">awaiting</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[var(--c-borderLight)] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--c-textSecondary)] text-sm font-semibold">Resolved</span>
              <div className="w-10 h-10 rounded-xl bg-[var(--c-sage)]/50 flex items-center justify-center border border-[var(--c-olive)]/20">
                <CheckCircle className="w-5 h-5 text-[var(--c-oliveDark)]" />
              </div>
            </div>
             <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-[var(--c-charcoal)] tracking-tight" style={{ fontFamily: fonts.heading }}>{resolvedCount}</p>
              <span className="text-sm font-medium text-[var(--c-textSecondary)]">completed</span>
            </div>
          </div>
        </div>

        {/* Dynamic SaaS Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          
          {/* Segmented Controls */}
          <div className="inline-flex p-1 bg-white border border-[var(--c-borderLight)] rounded-2xl overflow-x-auto hide-scrollbar w-full lg:w-auto shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 lg:flex-none whitespace-nowrap px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-[var(--c-charcoal)] text-white shadow-sm"
                    : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/20"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* View Segmented Toggle */}
            <div className="flex items-center p-1 bg-white border border-[var(--c-borderLight)] rounded-2xl shrink-0 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  viewMode === "grid" ? "bg-[var(--c-sage)]/50 text-[var(--c-olive)] shadow-sm" : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  viewMode === "map" ? "bg-[var(--c-sage)]/50 text-[var(--c-olive)] shadow-sm" : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)]"
                }`}
              >
                <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline">Map</span>
              </button>
            </div>

            {/* Premium Search input */}
            <div className="relative w-full lg:w-72 shrink-0 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--c-textSecondary)] group-focus-within:text-[var(--c-olive)] transition-colors" />
              <input
                type="text"
                placeholder="Search reports, zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[var(--c-borderLight)] rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-olive)]/20 focus:border-[var(--c-olive)] shadow-sm transition-all font-medium text-[var(--c-charcoal)] placeholder:text-[var(--c-textSecondary)]"
              />
            </div>
          </div>
        </div>

        {/* Content Zone */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-[var(--c-textSecondary)] bg-white rounded-3xl border border-[var(--c-borderLight)] shadow-sm">
              <Loader variant="spinner" size="xl" />
              <p className="mt-6 text-sm font-medium tracking-wide">Syncing your reports...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center bg-[#ffebee] rounded-3xl border border-[#ffcdd2] shadow-sm">
              <AlertCircle className="w-12 h-12 text-[#d32f2f] mb-4 opacity-80" />
              <p className="text-[#c62828] font-semibold mb-6">Failed to load reports</p>
              <button onClick={fetchReports} className="px-6 py-2.5 bg-white border border-[#ffcdd2] text-[#d32f2f] rounded-xl text-sm font-bold shadow-sm hover:bg-[#ffebee] transition-colors">
                Try Again
              </button>
            </div>
          ) : viewMode === "map" ? (
            // ── MAP VIEW ──
            <div className="w-full h-[650px] bg-white rounded-3xl p-2 shadow-sm border border-[var(--c-borderLight)]">
              <div className="w-full h-full rounded-[20px] overflow-hidden relative z-0">
                <MapContainer 
                  key={filteredReports.length > 0 ? filteredReports[0].id : "empty-map"}
                  center={[filteredReports[0]?.latitude || 26.1445, filteredReports[0]?.longitude || 91.7362]} 
                  zoom={14} 
                  className="w-full h-full z-0"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                  
                  {filteredReports.map((report) => (
                    report.latitude && report.longitude && (
                      <Marker key={report.id} position={[report.latitude, report.longitude]}>
                        <Popup className="saas-popup">
                          <div className="min-w-[260px] font-sans flex flex-col pt-1">
                            {report.image_url && (
                              <img src={report.image_url} alt="Env Data" className="w-full h-32 object-cover rounded-xl mb-4 border border-[var(--c-borderLight)]" />
                            )}
                            <div className="px-1 flex flex-col">
                              <span className={`self-start px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md border mb-2 ${report.status==='resolved'?'bg-[var(--c-sage)] text-[var(--c-olive)] border-[var(--c-olive)]/30':'bg-[#FFF8E6] text-[var(--c-accentGold)] border-[#F2DCA2]'}`}>
                                {report.status}
                              </span>
                              <p className="text-[13px] font-semibold text-[var(--c-charcoal)] leading-snug line-clamp-2 mt-1 mb-4">{report.description}</p>
                              <button onClick={()=>setSelectedReport(report)} className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--c-sage)]/20 hover:bg-[var(--c-sage)]/40 border border-[var(--c-sage)]/40 rounded-lg text-xs font-bold text-[var(--c-olive)] transition-colors">
                                View Profile <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            </div>
          ) : filteredReports.length === 0 ? (
            // ── GRID VIEW: EMPTY STATE ──
            <div className="flex flex-col items-center justify-center text-center bg-white border border-[var(--c-borderLight)] rounded-3xl shadow-sm py-24 px-6 relative overflow-hidden">
               <div className="w-20 h-20 bg-[var(--c-sage)]/20 rounded-2xl border border-[var(--c-sage)]/40 flex items-center justify-center mb-6 shadow-sm rotate-3">
                <Activity className="w-8 h-8 text-[var(--c-olive)]" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--c-charcoal)] mb-3 tracking-tight" style={{ fontFamily: fonts.heading }}>
                {searchQuery ? "No matches found" : activeTab !== "all" ? `No ${activeTab} operations` : "Your dashboard is empty"}
              </h3>
              <p className="text-[var(--c-textSecondary)] text-[15px] max-w-md mb-8">
                {searchQuery ? "We couldn't locate any records matching your search. Try different keywords." : "Start by submitting your first emergency report to help your community."}
              </p>
              
              {!searchQuery && activeTab === "all" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[var(--c-charcoal)] text-white hover:bg-[var(--c-oliveDark)] px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Create your first report
                </button>
              )}
            </div>
          ) : (
            // ── GRID VIEW: DATA REPORTS ──
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  mode="user"
                  onClick={setSelectedReport}
                />
              ))}
            </div>
          )}
        </div>

      </div>
      
      {/* Utility styles for premium map look */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .saas-popup .leaflet-popup-content-wrapper { border-radius: 1.25rem; padding: 12px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); background: white; }
        .saas-popup .leaflet-popup-content { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important; }
        .saas-popup .leaflet-popup-tip { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15); }
        
        .leaflet-bar { border: 1px solid rgba(0,0,0,0.1) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; border-radius: 0.75rem !important; overflow: hidden; }
        .leaflet-bar a { background-color: #fff !important; color: #2E2A1F !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; padding: 6px !important; transition: all 0.2s; }
        .leaflet-bar a:hover { background-color: #F8F5EC !important; color: #000 !important; }
      `}} />
    </div>
  );
};

export default UserDashboard;
