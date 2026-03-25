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
import {
  Plus, FileText, CheckCircle, AlertCircle, Search, 
  Activity, X, Trash2, MapPin, Clock, Building2,
  LayoutGrid, Map as MapIcon, Navigation
} from "lucide-react";
import { colors, fonts } from "../../styles/designTokens";

// ── LEAFLET MAP IMPORTS ──
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet markers not loading in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const TABS = [
  { key: "all", label: "All Reports" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
];

const UserDashboard = () => {
  const { user } = useAuth();

  // ── Data state ──────────────────────────
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── UI state ────────────────────────────
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  
  // ── Modal state ─────────────────────────
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyReports();
      setReports(res.data.reports || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your reports. Please try again.");
      toast.error("Could not fetch reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Prevent background scrolling when details modal is open
  useEffect(() => {
    if (selectedReport) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedReport]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report? This cannot be undone.")) return;
    
    setDeleting(true);
    try {
      await deleteReport(id);
      toast.success("Report deleted successfully");
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete report");
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

  return (
    <div style={dashboardStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] pb-16 relative">
      
      {/* ── CREATE REPORT MODAL ── */}
      {showForm && (
        <ReportForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchReports();
          }}
        />
      )}

      {/* ── REPORT DETAILS & DELETE MODAL ── */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[var(--c-charcoal)]/40 backdrop-blur-sm animate-modal-backdrop">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-modal-card">
            
            <div className="px-6 py-4 border-b border-[var(--c-borderLight)] flex items-center justify-between shrink-0 bg-[var(--c-offWhite)]">
              <h2 className="text-[var(--c-charcoal)] font-black text-xl" style={{ fontFamily: fonts.heading }}>
                Incident Details
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-full hover:bg-[var(--c-borderLight)] text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex flex-col gap-6 hide-scrollbar">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {selectedReport.status === "resolved" ? (
                    <span className="flex items-center gap-1.5 bg-[var(--c-sage)] text-[var(--c-oliveDark)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4" /> Resolved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 bg-[#FFF8E6] border border-[#F2DCA2] text-[var(--c-accentGold)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" /> Pending
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--c-textSecondary)] bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] px-3 py-1 rounded-full">
                    <MapPin className="w-3.5 h-3.5" /> {selectedReport.pincode}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-[var(--c-textSecondary)] font-medium">
                  <Clock className="w-4 h-4" /> 
                  {new Date(selectedReport.created_at).toLocaleDateString("en-IN", {
                    month: "long", day: "numeric", year: "numeric", hour: '2-digit', minute:'2-digit'
                  })}
                </span>
              </div>

              {selectedReport.image_url && (
                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[var(--c-borderLight)]">
                  <img 
                    src={selectedReport.image_url} 
                    alt="Incident" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="bg-[var(--c-offWhite)] p-5 rounded-2xl border border-[var(--c-borderLight)]">
                <h3 className="text-xs font-bold text-[var(--c-textSecondary)] uppercase tracking-wider mb-2">Description</h3>
                <p className="text-[var(--c-charcoal)] text-base leading-relaxed whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[var(--c-sage)]/20 p-4 rounded-xl border border-[var(--c-sage)]">
                <MapPin className="w-5 h-5 text-[var(--c-olive)] shrink-0" />
                <div>
                  <p className="text-[var(--c-charcoal)] font-bold text-sm">Precise Coordinates</p>
                  <p className="text-[var(--c-textSecondary)] text-xs font-mono mt-0.5">
                    Lat: {selectedReport.latitude} • Lng: {selectedReport.longitude}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--c-borderLight)] bg-[var(--c-offWhite)] shrink-0 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedReport.id)}
                disabled={deleting || selectedReport.status === "resolved"}
                title={selectedReport.status === "resolved" ? "Cannot delete resolved reports" : ""}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  selectedReport.status === "resolved" 
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed" 
                    : "text-red-600 hover:text-white bg-red-50 hover:bg-red-600"
                }`}
              >
                {deleting ? <Loader variant="spinner" size="sm" /> : <><Trash2 className="w-4 h-4" /> Delete Report</>}
              </button>
              
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-[var(--c-charcoal)] hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-transform hover:-translate-y-0.5 shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight mb-2" style={{ fontFamily: fonts.heading }}>
              Hello, {user?.name?.split(' ')[0] || "Citizen"} 👋
            </h1>
            <p className="text-[var(--c-textSecondary)] text-base">
              Here is the impact you've made in your community so far.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-[var(--c-olive)] hover:bg-[var(--c-oliveDark)] text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-[var(--c-olive)]/20 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Report an Issue
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
          <div className="bg-white border border-[var(--c-borderLight)] rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-2 text-[var(--c-textSecondary)] mb-3">
              <FileText className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider hidden sm:block">Total</span>
            </div>
            <p className="text-2xl md:text-4xl font-black text-[var(--c-charcoal)]">{totalReports}</p>
          </div>

          <div className="bg-[#FFF8E6] border border-[#F2DCA2] rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-2 text-[var(--c-accentGold)] mb-3">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider hidden sm:block">Pending</span>
            </div>
            <p className="text-2xl md:text-4xl font-black text-[var(--c-accentGold)]">{pendingCount}</p>
          </div>

          <div className="bg-[var(--c-sage)]/30 border border-[var(--c-olive)]/20 rounded-2xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-2 text-[var(--c-oliveDark)] mb-3">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider hidden sm:block">Resolved</span>
            </div>
            <p className="text-2xl md:text-4xl font-black text-[var(--c-oliveDark)]">{resolvedCount}</p>
          </div>
        </div>

        {/* ── TOOLBAR (TABS, MAP TOGGLE, SEARCH) ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-[var(--c-charcoal)] text-white shadow-md"
                    : "bg-white border border-[var(--c-borderLight)] text-[var(--c-textSecondary)] hover:bg-[var(--c-sage)]/50 hover:text-[var(--c-charcoal)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Toggle & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            
            <div className="flex items-center gap-1 bg-white border border-[var(--c-borderLight)] rounded-xl p-1 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 sm:flex-none p-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                  viewMode === "grid" 
                    ? "bg-[var(--c-charcoal)] text-white shadow-md" 
                    : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> 
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex-1 sm:flex-none p-2 sm:px-4 sm:py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                  viewMode === "map" 
                    ? "bg-[var(--c-charcoal)] text-white shadow-md" 
                    : "text-[var(--c-textSecondary)] hover:text-[var(--c-charcoal)] hover:bg-[var(--c-sage)]/30"
                }`}
              >
                <MapIcon className="w-4 h-4" /> 
                <span>Map</span>
              </button>
            </div>

            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[var(--c-borderLight)] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--c-olive)] focus:ring-1 focus:ring-[var(--c-olive)] shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── MAIN DATA RENDERING ── */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--c-textSecondary)] gap-4">
              <Loader variant="spinner" size="lg" />
              <p className="text-sm font-medium">Fetching your reports...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-red-50 rounded-3xl border border-red-100 p-6">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button onClick={fetchReports} className="px-5 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold hover:bg-red-200 transition-colors">
                Try Again
              </button>
            </div>
          ) : viewMode === "map" ? (
            // ── MAP VIEW (Always renders if Map Tab is selected, even if empty) ──
            <div className="w-full h-[500px] bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] rounded-3xl overflow-hidden shadow-inner relative z-0">
              <MapContainer 
                key={filteredReports.length > 0 ? filteredReports[0].id : "empty-map"}
                center={[filteredReports[0]?.latitude || 26.1445, filteredReports[0]?.longitude || 91.7362]} 
                zoom={13} 
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {filteredReports.map((report) => (
                  report.latitude && report.longitude && (
                    <Marker key={report.id} position={[report.latitude, report.longitude]}>
                      <Popup className="rounded-xl overflow-hidden shadow-lg border-0 p-0 m-0">
                        <div className="p-1 min-w-[200px] font-sans">
                          {report.image_url && (
                            <img 
                              src={report.image_url} 
                              alt="Incident" 
                              className="w-full h-24 object-cover rounded-lg mb-2"
                            />
                          )}
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              report.status === "pending" ? "bg-[#FFF8E6] text-[#d4af37]" : "bg-[#87a96b]/30 text-[#4b5320]"
                            }`}>
                              {report.status}
                            </span>
                            <span className="text-xs text-gray-500">#{report.id}</span>
                          </div>
                          <p className="text-sm font-bold text-[#333333] truncate mt-1">
                            {report.description}
                          </p>
                          <a
                            href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center justify-center gap-1.5 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-1.5 rounded-lg transition-colors border border-blue-200"
                          >
                            <MapPin className="w-3 h-3" /> Open in Google Maps
                          </a>
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="mt-1.5 flex items-center justify-center gap-1.5 w-full bg-[#faf9f6] hover:bg-[#87a96b]/50 text-[#4b5320] text-xs font-bold py-1.5 rounded-lg transition-colors border border-[#e5e7eb]"
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
          ) : filteredReports.length === 0 ? (
            // ── GRID VIEW: EMPTY STATE (Perfectly spaced for Mobile) ──
            <div className="flex flex-col items-center justify-center text-center bg-white border border-[var(--c-borderLight)] rounded-3xl p-6 sm:p-10 shadow-sm py-12 mb-8">
              <div className="w-16 h-16 bg-[var(--c-sage)] rounded-full flex items-center justify-center mb-5 shrink-0">
                <Activity className="w-8 h-8 text-[var(--c-oliveDark)]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--c-charcoal)] mb-3" style={{ fontFamily: fonts.heading }}>
                {searchQuery
                  ? "No matching reports found"
                  : activeTab !== "all"
                  ? `No ${activeTab} reports`
                  : "Your dashboard is quiet"}
              </h3>
              <p className="text-[var(--c-textSecondary)] text-sm max-w-sm mb-6">
                {searchQuery
                  ? "Try adjusting your search terms to find what you're looking for."
                  : "You haven't submitted any civic issues yet. Spot a problem in your neighborhood? Let the authorities know!"}
              </p>
              
              {!searchQuery && activeTab === "all" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-2 w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--c-sage)] text-[var(--c-oliveDark)] hover:bg-[var(--c-olive)] hover:text-white px-6 py-3.5 rounded-full text-sm font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Submit Your First Report
                </button>
              )}
            </div>
          ) : (
            // ── GRID VIEW: DATA REPORTS ──
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      
      {/* Utility styles for modals and scrollbars */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { 
          from { opacity: 0; transform: translateY(20px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-modal-backdrop { animation: modalFadeIn 0.3s ease-out forwards; }
        .animate-modal-card { animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; }
        .leaflet-popup-content { margin: 8px; }
      `}} />
    </div>
  );
};

export default UserDashboard;