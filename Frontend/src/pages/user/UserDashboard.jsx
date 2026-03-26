// ─────────────────────────────────────────
// pages/user/UserDashboard.jsx
// ─────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyReports, deleteReport } from "../../services/reportService";
import ReportCard from "../../components/ReportCard";
import ReportForm from "../../components/ReportForm";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "../../styles/designTokens";
import {
  Plus, FileText, CheckCircle, AlertCircle, Search, 
  Activity, X, Trash2, MapPin, Clock, ArrowRight,
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
  };

  return (
    <div style={dashboardStyle} className="min-h-screen bg-[#F9FAFB] relative font-sans text-gray-900 selection:bg-[var(--c-sage)] selection:text-[var(--c-charcoal)]">
      
      {/* ── PREMIUM DECORATIVE GLOW ── */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#F3F4F6] to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[500px] bg-[var(--c-sage)] opacity-[0.15] blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[10%] right-[-5%] w-[40%] h-[400px] bg-amber-200 opacity-[0.1] blur-[100px] rounded-full pointer-events-none z-0"></div>

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }} 
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh] overflow-hidden border border-gray-100 ring-1 ring-black/5"
            >
              
              {/* Image Side */}
              <div className="w-full md:w-5/12 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 relative shrink-0 min-h-[250px] md:min-h-0">
                 {selectedReport.image_url ? (
                  <img src={selectedReport.image_url} alt="Incident Context" className="w-full h-full object-cover" />
                 ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                    <AlertCircle className="w-12 h-12 stroke-[1.5]" />
                    <span className="text-xs font-semibold uppercase tracking-wider">No Documentation Attached</span>
                  </div>
                 )}
                 <div className="absolute top-5 left-5 z-10 flex gap-2">
                    <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm border bg-white/95 backdrop-blur-sm ${selectedReport.status === 'resolved' ? 'text-[var(--c-olive)] border-green-200' : 'text-amber-600 border-amber-200'}`}>
                      {selectedReport.status}
                    </span>
                 </div>
              </div>

              {/* Data Side */}
              <div className="w-full md:w-7/12 flex flex-col bg-white overflow-y-auto">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-1">Incident Profile</span>
                    <h2 className="text-[var(--c-charcoal)] font-bold text-2xl tracking-tight" style={{ fontFamily: fonts.heading }}>
                      Case #{selectedReport.id.toString().padStart(4, '0')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 flex flex-col gap-8 grow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Date Logged</span>
                      <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {new Date(selectedReport.created_at).toLocaleDateString("en-IN", { day:'2-digit', month: 'short', year: 'numeric'})}
                      </span>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wider">Coordinates</span>
                      <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Zone: {selectedReport.pincode}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Incident Transcript</h3>
                    <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {selectedReport.description}
                    </p>
                  </div>

                  {selectedReport.department && (
                     <div className="mt-auto bg-green-50/50 rounded-2xl p-5 border border-green-100 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white border border-green-200 flex items-center justify-center text-[var(--c-olive)] shadow-sm shrink-0">
                         <Building2 className="w-5 h-5" />
                       </div>
                       <div>
                         <span className="text-[11px] uppercase text-[var(--c-olive)] font-semibold tracking-wider">Assigned Department</span>
                         <p className="text-sm font-semibold text-green-900">{selectedReport.department}</p>
                       </div>
                     </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 shrink-0 flex items-center justify-between bg-gray-50">
                  <button
                    onClick={() => handleDelete(selectedReport.id)}
                    disabled={deleting || selectedReport.status === "resolved"}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      selectedReport.status === "resolved" 
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed" 
                        : "text-red-600 bg-white hover:bg-red-50 border border-red-100 shadow-sm hover:shadow"
                    }`}
                  >
                    {deleting ? <Loader variant="spinner" size="sm" /> : <><Trash2 className="w-4 h-4" /> Revoke</>}
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="bg-[var(--c-charcoal)] hover:bg-black text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-20 relative z-10">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-[40px] md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2" style={{ fontFamily: fonts.heading }}>
              Dashboard
            </h1>
            <p className="text-gray-500 text-base font-medium">
              Welcome back, {user?.name?.split(' ')[0] || "Citizen"}. Here's an overview of your civic impact.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-[var(--c-oliveDark)] hover:bg-[var(--c-olive)] text-white px-6 py-3.5 rounded-xl font-semibold shadow-md shadow-gray-900/10 transition-all hover:-translate-y-0.5 w-full sm:w-auto text-[15px]"
          >
            <Plus className="w-5 h-5" />
            New Report
          </button>
        </div>

        {/* Premium Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Total Volume</span>
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: fonts.heading }}>{totalReports}</p>
              <span className="text-sm font-medium text-gray-400">files</span>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[160px]">
             <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Pending Actions</span>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: fonts.heading }}>{pendingCount}</p>
              <span className="text-sm font-medium text-gray-400">unresolved</span>
            </div>
          </div>

          <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500">Completed Operations</span>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center border border-green-100">
                <CheckCircle className="w-5 h-5 text-[var(--c-olive)]" />
              </div>
            </div>
             <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: fonts.heading }}>{resolvedCount}</p>
              <span className="text-sm font-medium text-gray-400">resolved</span>
            </div>
          </div>
        </div>

        {/* Dynamic SaaS Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          
          {/* Segmented Controls */}
          <div className="inline-flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 overflow-x-auto hide-scrollbar w-full lg:w-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 lg:flex-none whitespace-nowrap px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* View Segmented Toggle */}
            <div className="flex items-center p-1 bg-gray-100/80 border border-gray-200/60 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  viewMode === "grid" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  viewMode === "map" ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline">Map</span>
              </button>
            </div>

            {/* Premium Search input */}
            <div className="relative w-full lg:w-72 shrink-0 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-600 transition-colors" />
              <input
                type="text"
                placeholder="Search case IDs, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/5 focus:border-gray-300 shadow-sm transition-all font-medium text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Content Zone */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader variant="spinner" size="xl" />
              <p className="mt-6 text-sm font-medium tracking-wide">Syncing local documents...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center bg-red-50 rounded-3xl border border-red-100">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-80" />
              <p className="text-red-900 font-semibold mb-6">Database synchronization interrupted</p>
              <button onClick={fetchReports} className="px-6 py-2.5 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors">
                Retry Connection
              </button>
            </div>
          ) : viewMode === "map" ? (
            // ── PREMIUM MAP VIEW ──
            <div className="w-full h-[650px] bg-white rounded-3xl p-2 shadow-sm border border-gray-100 ring-1 ring-black/5">
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
                              <img src={report.image_url} alt="Env Data" className="w-full h-32 object-cover rounded-xl mb-4 border border-gray-100" />
                            )}
                            <div className="px-1 flex flex-col">
                              <span className={`self-start px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-md border mb-2 ${report.status==='resolved'?'bg-green-50 text-[var(--c-olive)] border-green-200':'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                {report.status}
                              </span>
                              <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 mt-1 mb-4">{report.description}</p>
                              <button onClick={()=>setSelectedReport(report)} className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 transition-colors">
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
            <div className="flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-3xl shadow-sm py-24 px-6 relative overflow-hidden">
               <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-6 shadow-sm rotate-3">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                {searchQuery ? "No matches found" : activeTab !== "all" ? `No ${activeTab} operations` : "Your dashboard is empty"}
              </h3>
              <p className="text-gray-500 text-[15px] max-w-md mb-8">
                {searchQuery ? "We couldn't locate any records answering your criteria. Please alter the queries and try again." : "Start documenting issues across your community to establish an active civic footprint."}
              </p>
              
              {!searchQuery && activeTab === "all" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gray-900 text-white hover:bg-black px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-gray-900/10 active:scale-95"
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
        
        .saas-popup .leaflet-popup-content-wrapper { border-radius: 1.25rem; padding: 12px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.05); }
        .saas-popup .leaflet-popup-content { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important; }
        .saas-popup .leaflet-popup-tip { box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15); }
        
        .leaflet-bar { border: 1px solid rgba(0,0,0,0.1) !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; border-radius: 0.75rem !important; overflow: hidden; }
        .leaflet-bar a { background-color: #fff !important; color: #111827 !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; padding: 6px !important; transition: all 0.2s; }
        .leaflet-bar a:hover { background-color: #f9fafb !important; color: #000 !important; }
      `}} />
    </div>
  );
};

export default UserDashboard;