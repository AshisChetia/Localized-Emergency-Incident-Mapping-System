// ─────────────────────────────────────────
// pages/admin/AdminDashboard.jsx
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
import { colors, fonts } from "../../styles/designTokens";
import {
  Shield, Users, Building2, FileText, RefreshCw,
  Search, X, Inbox, CheckCircle, MapPin, Mail, Clock,
  Map as MapIcon
} from "lucide-react";

// ── LEAFLET MAP IMPORTS ──
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  
  // ── State for the Authority Network Map ──
  const [authorityMapPins, setAuthorityMapPins] = useState([]); 
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const dashboardStyle = {
    "--c-offWhite": colors.offWhite,
    "--c-olive": colors.olive,
    "--c-oliveDark": colors.oliveDark,
    "--c-sage": colors.sage,
    "--c-accentGold": colors.accentGold,
    "--c-charcoal": colors.charcoal,
    "--c-borderLight": colors.borderLight,
    fontFamily: fonts.body,
  };

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, pendingRes, activeRes] = await Promise.all([
        getAdminStats().catch(() => ({ data: {} })),
        getPendingAuthorities().catch(() => ({ data: { requests: [] } })),
        getActiveAuthorities().catch(() => ({ data: { authorities: [] } }))
      ]);

      setStats(statsRes.data.stats || { users: {}, authorities: {}, reports: {} });
      setPending(pendingRes.data.requests || pendingRes.data.authorities || []);
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

  // ── FETCH COORDINATES FOR AUTHORITIES ──
  useEffect(() => {
    const fetchAuthorityCoordinates = async () => {
      if (!active || active.length === 0) {
        setAuthorityMapPins([]);
        return;
      }

      const locations = [];
      // Get unique pincodes to avoid making redundant API calls
      const uniquePincodes = [...new Set(active.map(a => a.pincode).filter(Boolean))];

      for (const pin of uniquePincodes) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pin}&country=India&format=json`);
          const data = await res.json();
          
          if (data && data.length > 0) {
            // Find all authorities that share this pincode and attach the coordinates
            const authoritiesInZone = active.filter(a => a.pincode === pin);
            authoritiesInZone.forEach(auth => {
              locations.push({
                ...auth,
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
              });
            });
          }
          // Tiny delay to respect the free API's rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error("Geocoding failed for pincode:", pin);
        }
      }
      setAuthorityMapPins(locations);
    };

    fetchAuthorityCoordinates();
  }, [active]);

  const handleApprove = async (id) => {
    try {
      await approveAuthority(id);
      toast.success("Authority approved successfully!");
      await fetchDashboardData(true); 
    } catch (err) {
      toast.error("Failed to approve authority");
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to permanently reject this request?")) return;
    try {
      await rejectAuthority(id);
      toast.success("Authority request removed.");
      await fetchDashboardData(true); 
    } catch (err) {
      toast.error("Failed to reject authority");
    }
  };

  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.department?.toLowerCase().includes(q) ||
        a.pincode?.toString().includes(q) ||
        a.email?.toLowerCase().includes(q)
    );
  };

  const displayedPending = filterList(pending);
  const displayedActive = filterList(active);

  const statCards = [
    {
      label: "Total Citizens",
      value: stats?.users?.total_users || 0,
      icon: <Users className="w-5 h-5 text-[var(--c-oliveDark)]" />,
      bg: "bg-[var(--c-sage)]/30 border-[var(--c-olive)]/20",
      iconBg: "bg-[var(--c-sage)]",
    },
    {
      label: "Active Authorities",
      value: active.length,
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50 border-blue-100",
      iconBg: "bg-blue-100",
    },
    {
      label: "Pending Approvals",
      value: pending.length,
      icon: <Clock className="w-5 h-5 text-[var(--c-accentGold)]" />,
      bg: "bg-[#FFF8E6] border-[#F2DCA2]",
      iconBg: "bg-amber-100",
    },
    {
      label: "Total Reports",
      value: stats?.reports?.total_reports || 0,
      icon: <FileText className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50 border-purple-100",
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div style={dashboardStyle} className="min-h-[calc(100vh-80px)] bg-[var(--c-offWhite)] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[var(--c-charcoal)] rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-[var(--c-offWhite)]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)] tracking-tight mb-1" style={{ fontFamily: fonts.heading }}>
                Command Center
              </h1>
              <p className="text-[var(--c-textSecondary)] text-sm font-medium">
                System Overview • <span className="text-[var(--c-olive)]">{user?.email}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 bg-white border border-[var(--c-borderLight)] text-[var(--c-charcoal)] px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[var(--c-olive)]" : ""}`} />
            {refreshing ? "Syncing Data..." : "Refresh Dashboard"}
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                <p className="text-gray-500 text-xs sm:hidden mb-1 font-bold uppercase">{card.label}</p>
                <p className="text-3xl md:text-4xl font-black text-[var(--c-charcoal)]">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── GOD-MODE GLOBAL MAP ── */}
        <div className="mb-10 bg-white border border-[var(--c-borderLight)] rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-[var(--c-charcoal)] font-black text-lg sm:text-xl flex items-center gap-2" style={{ fontFamily: fonts.heading }}>
              <MapIcon className="w-5 h-5 text-[var(--c-olive)]" />
              Authority Network Map
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold text-[var(--c-textSecondary)] uppercase tracking-wider bg-[var(--c-offWhite)] px-4 py-2 rounded-full border border-[var(--c-borderLight)]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-sm"></span> Active Authority
              </span>
            </div>
          </div>

          <div className="w-full h-[350px] sm:h-[450px] rounded-2xl overflow-hidden border border-[var(--c-borderLight)] relative z-0">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-[var(--c-offWhite)]">
                <Loader variant="spinner" size="md" />
              </div>
            ) : (
              <MapContainer 
                key={authorityMapPins.length > 0 ? "auth-map" : "empty-map"}
                // Center on the first authority's location, or fallback to Assam
                center={authorityMapPins.length > 0 ? [authorityMapPins[0].latitude, authorityMapPins[0].longitude] : [26.2006, 92.9376]} 
                zoom={authorityMapPins.length > 0 ? 11 : 7} 
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {authorityMapPins.map((auth) => (
                  <CircleMarker
                    key={auth.id}
                    center={[auth.latitude, auth.longitude]}
                    radius={8}
                    pathOptions={{
                      fillColor: "#3b82f6", // Blue color for Authorities
                      color: "#ffffff",
                      weight: 2,
                      fillOpacity: 0.9,
                    }}
                  >
                    <Popup className="rounded-xl">
                      <div className="text-sm font-sans p-2 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <p className="font-bold text-[var(--c-charcoal)]">{auth.name}</p>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                          {auth.department}
                        </p>
                        <p className="text-xs text-[var(--c-textSecondary)] flex items-center gap-1.5 bg-[var(--c-offWhite)] p-1.5 rounded-md border border-[var(--c-borderLight)]">
                           <MapPin className="w-3.5 h-3.5 text-[var(--c-olive)]" /> Zone: {auth.pincode}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* FILTERS & TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab("pending")}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "pending"
                  ? "bg-[var(--c-charcoal)] text-white shadow-md"
                  : "bg-white border border-[var(--c-borderLight)] text-[var(--c-textSecondary)] hover:bg-[var(--c-sage)]/50"
              }`}
            >
              Pending Approvals
              {pending.length > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === "pending" ? "bg-white/20" : "bg-red-100 text-red-600"}`}>
                  {pending.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeTab === "active"
                  ? "bg-[var(--c-charcoal)] text-white shadow-md"
                  : "bg-white border border-[var(--c-borderLight)] text-[var(--c-textSecondary)] hover:bg-[var(--c-sage)]/50"
              }`}
            >
              Active Authorities
            </button>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by department or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[var(--c-borderLight)] rounded-full pl-11 pr-10 py-2.5 text-sm focus:outline-none focus:border-[var(--c-charcoal)] focus:ring-1 focus:ring-[var(--c-charcoal)] shadow-sm transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--c-textSecondary)] gap-4">
              <Loader variant="spinner" size="lg" />
              <p className="text-sm font-medium">Loading network data...</p>
            </div>
          ) : activeTab === "pending" ? (
            displayedPending.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center bg-white border border-[var(--c-borderLight)] rounded-3xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[var(--c-sage)] rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-[var(--c-olive)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--c-charcoal)] mb-2" style={{ fontFamily: fonts.heading }}>Inbox Zero</h3>
                <p className="text-[var(--c-textSecondary)] text-sm">No new authority registrations pending approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            displayedActive.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center bg-white border border-[var(--c-borderLight)] rounded-3xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-[var(--c-borderLight)] rounded-full flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-black text-[var(--c-charcoal)] mb-2" style={{ fontFamily: fonts.heading }}>No Results</h3>
                <p className="text-[var(--c-textSecondary)] text-sm">No active authorities match your search criteria.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-[var(--c-textSecondary)] uppercase tracking-wider">
                  <div className="col-span-4">Department & Name</div>
                  <div className="col-span-3">Contact Info</div>
                  <div className="col-span-3">Jurisdiction (Pincode)</div>
                  <div className="col-span-2 text-right">Joined Date</div>
                </div>
                
                {displayedActive.map((auth) => (
                  <div key={auth.id} className="bg-white border border-[var(--c-borderLight)] rounded-2xl p-5 hover:shadow-md transition-shadow grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    
                    <div className="col-span-1 sm:col-span-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[var(--c-charcoal)] font-bold text-sm truncate">{auth.name}</p>
                        <p className="text-[var(--c-textSecondary)] text-xs font-medium truncate uppercase tracking-wide mt-0.5">{auth.department}</p>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-3 flex items-center gap-2 text-[var(--c-charcoal)] text-sm">
                      <Mail className="w-4 h-4 sm:hidden text-gray-400" />
                      <span className="truncate">{auth.email}</span>
                    </div>

                    <div className="col-span-1 sm:col-span-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 sm:hidden text-[var(--c-olive)]" />
                      <span className="bg-[var(--c-offWhite)] border border-[var(--c-borderLight)] px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--c-charcoal)] tracking-widest flex items-center gap-2">
                         <MapPin className="w-3.5 h-3.5 hidden sm:block text-[var(--c-olive)]" /> {auth.pincode}
                      </span>
                    </div>

                    <div className="col-span-1 sm:col-span-2 text-left sm:text-right text-[var(--c-textSecondary)] text-sm font-medium">
                      <span className="sm:hidden mr-2">Joined:</span>
                      {new Date(auth.created_at || auth.updated_at).toLocaleDateString("en-IN", {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default AdminDashboard;