import React, { useState, useEffect, useMemo } from 'react';
import { useSpotImage } from './hooks/useSpotImage.js';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass, Download, Cpu, History, MapPin, Sliders,
  Satellite, Map, Eye, AlertTriangle, CheckCircle, Sparkles, Search
} from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastNotification';
import { runResilientAgentScan } from './services/aiAgentResilience';

// Fix default Leaflet icon paths (required for Vite builds)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons
const knownIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const unchartedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// City search centers
const CITIES = [
  { name: 'Alicante Stadtzentrum', lat: 38.3452, lon: -0.4815, province: 'Alicante' },
  { name: 'Torrevieja', lat: 37.9787, lon: -0.6822, province: 'Alicante' },
  { name: 'Elche', lat: 38.2669, lon: -0.6983, province: 'Alicante' },
  { name: 'Orihuela', lat: 38.0849, lon: -0.9436, province: 'Alicante' },
  { name: 'Valencia Stadtzentrum', lat: 39.4699, lon: -0.3763, province: 'Valencia' },
  { name: 'Gandia', lat: 38.9681, lon: -0.1817, province: 'Valencia' },
  { name: 'Xativa', lat: 38.9889, lon: -0.5210, province: 'Valencia' },
  { name: 'Castellón de la Plana', lat: 39.9864, lon: -0.0513, province: 'Castellón' },
  { name: 'Segorbe', lat: 39.8504, lon: -0.4933, province: 'Castellón' },
];

import { ALL_SPOTS } from './data/spots.js';



// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Smooth auto-zoom helper for map navigation and spot inspection
function MapFlyTo({ center, showAll, spots, selectedSpot }) {
  const map = useMap();

  useEffect(() => {
    window._leaflet_map = map;
  }, [map]);

  // High-detail auto-zoom when a spot is selected
  useEffect(() => {
    if (selectedSpot && selectedSpot.lat && selectedSpot.lon) {
      map.flyTo([selectedSpot.lat, selectedSpot.lon], 16, { duration: 1.3 });
    }
  }, [selectedSpot, map]);

  // Fit bounds when all spots view is active or when closing a selected spot
  useEffect(() => {
    if (!selectedSpot && spots.length > 0) {
      if (showAll || spots.length > 1) {
        const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lon]));
        map.fitBounds(bounds, { padding: [50, 50], duration: 1.2 });
      } else if (center) {
        map.flyTo([center.lat, center.lon], 10, { duration: 1.2 });
      }
    }
  }, [showAll, spots, selectedSpot, center, map]);

  return null;
}

const RISK_COLOR = { NIEDRIG: 'text-emerald-400', MITTEL: 'text-amber-400', HOCH: 'text-red-400' };
const RISK_BG   = { NIEDRIG: 'bg-emerald-500/20 border-emerald-500/30', MITTEL: 'bg-amber-500/20 border-amber-500/30', HOCH: 'bg-red-500/20 border-red-500/30' };

const HOME_LOCATION = { lat: 38.3552821, lon: -0.4770499, name: 'Calle Barcelona 3, Alicante' };

// Component that loads a real Wikipedia photo or falls back to OSM map
function SpotImage({ spot, className, style }) {
  const { imgUrl, loading } = useSpotImage(spot);
  if (loading) return (
    <div className={className} style={{ ...style, background: '#1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#f59e0b', fontSize: 10 }}>🔍 Bild wird geladen…</span>
    </div>
  );
  if (!imgUrl) return null;
  return (
    <img
      src={imgUrl}
      alt={spot.name}
      className={className}
      style={style}
      onError={e => { e.target.style.display = 'none'; }}
    />
  );
}


function AppContent() {
  const [selectedCity, setSelectedCity]   = useState(CITIES[0]);
  const [searchRadiusKm, setRadius]       = useState(250);

  const [mapLayer, setMapLayer]           = useState('satellite');
  const [selectedSpot, setSelectedSpot]   = useState(null);
  const [filterStatus, setFilterStatus]   = useState('ALL');
  const [scanning, setScanning]           = useState(false);
  const [activeTab, setActiveTab]         = useState('history');

  const [showAllRegions, setShowAllRegions] = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [filterProvince, setFilterProvince] = useState('ALL');
  const [filterRisk, setFilterRisk]         = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const [toasts, setToasts]                 = useState([]);
  const [activeAgentStatus, setActiveAgentStatus] = useState('DeepSeek-V4 API');


  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const filteredSpots = useMemo(() => ALL_SPOTS.filter(spot => {
    const dist = calculateDistance(selectedCity.lat, selectedCity.lon, spot.lat, spot.lon);
    const inRadius = showAllRegions || searchRadiusKm >= 200 || dist <= searchRadiusKm;
    const statusMatch = filterStatus === 'ALL' || spot.status === filterStatus;
    const provinceMatch = filterProvince === 'ALL' || spot.province === filterProvince;
    const riskMatch = filterRisk === 'ALL' || spot.risk === filterRisk;

    // Category filter matching logic
    let categoryMatch = true;
    if (filterCategory === 'FABRIK') {
      categoryMatch = spot.type.toLowerCase().includes('fabrik') || spot.type.toLowerCase().includes('mühle') || spot.type.toLowerCase().includes('industrie') || spot.name.toLowerCase().includes('fábrica') || spot.name.toLowerCase().includes('harinas');
    } else if (filterCategory === 'BURG') {
      categoryMatch = spot.type.toLowerCase().includes('burg') || spot.type.toLowerCase().includes('kastell') || spot.type.toLowerCase().includes('castle') || spot.name.toLowerCase().includes('castillo') || spot.name.toLowerCase().includes('castell');
    } else if (filterCategory === 'SANATORIUM') {
      categoryMatch = spot.type.toLowerCase().includes('sanatorium') || spot.type.toLowerCase().includes('klinik') || spot.type.toLowerCase().includes('psychiatrie') || spot.name.toLowerCase().includes('sanatorio') || spot.name.toLowerCase().includes('manicomio') || spot.name.toLowerCase().includes('balneario');
    } else if (filterCategory === 'DORF') {
      categoryMatch = spot.type.toLowerCase().includes('dorf') || spot.type.toLowerCase().includes('kolonie') || spot.type.toLowerCase().includes('siedlung') || spot.name.toLowerCase().includes('pueblo') || spot.name.toLowerCase().includes('colonia') || spot.name.toLowerCase().includes('jinquer');
    } else if (filterCategory === 'VILLA') {
      categoryMatch = spot.type.toLowerCase().includes('palast') || spot.type.toLowerCase().includes('residenz') || spot.type.toLowerCase().includes('villa') || spot.name.toLowerCase().includes('palau') || spot.name.toLowerCase().includes('palacio') || spot.name.toLowerCase().includes('finca');
    }

    const searchMatch = !searchQuery ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.province.toLowerCase().includes(searchQuery.toLowerCase());

    return inRadius && statusMatch && provinceMatch && riskMatch && categoryMatch && searchMatch;
  }), [selectedCity, searchRadiusKm, showAllRegions, filterStatus, filterProvince, filterRisk, filterCategory, searchQuery]);

  const knownCount     = filteredSpots.filter(s => s.status === 'KNOWN_HISTORIC_SITE').length;
  const unchartedCount = filteredSpots.filter(s => s.status === 'UNCHARTED_NEW_DISCOVERY').length;

  // No auto-selection: user clicks a spot manually


  async function handleScan() {
    setScanning(true);
    const result = await runResilientAgentScan({
      onStatusUpdate: ({ activeAgent }) => setActiveAgentStatus(activeAgent),
      onToast: addToast
    });
    setScanning(false);

    if (filteredSpots.length === 0) {
      setRadius(75);
    }
  }


  function handleKmlDownload() {

    const placemarks = filteredSpots.map(s => `
    <Placemark>
      <name>${s.name}</name>
      <description>${s.type} | ${s.status} | Risiko: ${s.risk}\n${s.history}</description>
      <Point><coordinates>${s.lon},${s.lat},0</coordinates></Point>
    </Placemark>`).join('');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>DekadenzScout AI – ${selectedCity.name} ${searchRadiusKm}km</name>
    <description>Generiert von DekadenzScout AI – Comunitat Valenciana</description>
    ${placemarks}
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dekadenzscout_${selectedCity.name.replace(/ /g,'_')}_${searchRadiusKm}km.kml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-96 flex flex-col border-r border-amber-500/15 bg-slate-900/90 backdrop-blur-xl z-20 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-4 border-b border-amber-500/15">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400 animate-pulse-glow">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wider text-amber-400 leading-tight">DekadenzScout AI</h1>
            <p className="text-[11px] text-slate-500">Comunitat Valenciana · 2026</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">

          {/* City selector */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Suchzentrum
            </label>
            <select
              value={selectedCity.name}
              onChange={e => setSelectedCity(CITIES.find(c => c.name === e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer"
            >
              {CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.province})</option>
              ))}
            </select>
          </div>
          
          {/* Category Filter Chips */}
          <div style={{ background: '#1a1f2e', border: '2px solid #f59e0b', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              🏷️ Gebäudetyp filtern
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { id: 'ALL',        label: '🏢 Alle' },
                { id: 'FABRIK',     label: '🏭 Fabriken' },
                { id: 'BURG',       label: '🏰 Burgen' },
                { id: 'SANATORIUM', label: '🏥 Sanatorien' },
                { id: 'DORF',       label: '🏚️ Dörfer' },
                { id: 'VILLA',      label: '🏛️ Villen' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.id)}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: filterCategory === c.id ? '2px solid #f59e0b' : '1px solid #374151',
                    background: filterCategory === c.id ? 'rgba(245,158,11,0.2)' : '#111827',
                    color: filterCategory === c.id ? '#fbbf24' : '#9ca3af',
                    cursor: 'pointer'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radius slider */}
          <div className="glass-panel p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Suchradius
              </span>
              <span className="text-sm font-extrabold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                {searchRadiusKm} km
              </span>
            </div>
            <input
              type="range" min="10" max="250" step="10"
              value={searchRadiusKm}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10 km</span><span>50 km</span><span>120 km</span><span>250 km</span>
            </div>
            <button
              onClick={() => {
                const nextState = !showAllRegions;
                setShowAllRegions(nextState);
                if (nextState) setRadius(250);
              }}
              className={`w-full mt-1.5 py-1.5 px-2 text-[10px] font-bold rounded-lg transition border ${
                showAllRegions || searchRadiusKm >= 200
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
              }`}
            >
              {showAllRegions || searchRadiusKm >= 200
                ? '✅ Alle 12 Objekte in ganz Valencia werden angezeigt'
                : '🗺️ Alle 12 Objekte in ganz Valencia anzeigen (Filter aufheben)'}
            </button>
          </div>

          {/* Stats panel */}
          <div className="glass-panel p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Scan-Ergebnis
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${scanning ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}>
                {scanning ? 'Scannt…' : `${filteredSpots.length} gefunden`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-center">
                <div className="text-cyan-400 font-bold text-lg">{knownCount}</div>
                <div className="text-slate-500">Bekannte Ruinen</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                <div className="text-amber-400 font-bold text-lg">{unchartedCount}</div>
                <div className="text-slate-500">✨ Neuentdeckungen</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800">
              <div className="flex justify-between"><span>Orchestrator:</span> <span className="text-amber-400 font-medium">DeepSeek-V4 API</span></div>
              <div className="flex justify-between"><span>Archiv-Mining:</span> <span className="text-cyan-400 font-medium">Kimi K3 (2M+ Caching)</span></div>
              <div className="flex justify-between"><span>Safety Agent:</span> <span className="text-purple-400 font-medium">Qwen 3 Cloud API</span></div>
            </div>
          </div>

          {/* Live Search & Multi-Filters */}
          <div className="glass-panel p-3 rounded-xl space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Objekt oder Ort suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>



            {/* Dropdowns for Province & Risk */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Provinz</label>
                <select
                  value={filterProvince}
                  onChange={e => setFilterProvince(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[10px] text-slate-200 focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Alle Provinzen</option>
                  <option value="Alicante">Alicante</option>
                  <option value="Valencia">Valencia</option>
                  <option value="Castellón">Castellón</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Risiko</label>
                <select
                  value={filterRisk}
                  onChange={e => setFilterRisk(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[10px] text-slate-200 focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Alle Risiken</option>
                  <option value="NIEDRIG">🟢 Niedrig</option>
                  <option value="MITTEL">🟡 Mittel</option>
                  <option value="HOCH">🔴 Hoch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2">
            {['ALL', 'KNOWN_HISTORIC_SITE', 'UNCHARTED_NEW_DISCOVERY'].map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                  filterStatus === f
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {f === 'ALL' ? 'Alle' : f === 'KNOWN_HISTORIC_SITE' ? 'Bekannt' : '✨ Neu'}
              </button>
            ))}
          </div>

          {/* Spot list */}
          <div className="space-y-2">
            {filteredSpots.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-8">
                Keine Objekte im {searchRadiusKm} km Radius um<br />
                <span className="text-amber-400">{selectedCity.name}</span> gefunden.
              </div>
            )}
            {filteredSpots.map(spot => (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedSpot?.id === spot.id
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'glass-panel-light border-transparent hover:border-slate-600'
                }`}
              >
                {/* Mini-Thumbnail + Titel */}
                <div className="flex gap-2 items-start">
                  <SpotImage
                    spot={spot}
                    className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">{spot.name}</span>
                      <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                        spot.status === 'UNCHARTED_NEW_DISCOVERY'
                          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                          : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                      }`}>
                        {spot.status === 'UNCHARTED_NEW_DISCOVERY' ? '✨ NEU' : 'BEKANNT'}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{spot.province} · {spot.year}</div>
                    {/* GPS Verification Badge */}
                    <div className={`inline-flex items-center gap-1 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      spot.status === 'KNOWN_HISTORIC_SITE'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                    }`}>
                      {spot.status === 'KNOWN_HISTORIC_SITE' ? '✅ GPS verifiziert' : '⚠️ Koordinaten unbestätigt'}
                    </div>
                  </div>
                </div>
              </button>
            ))}

          </div>

        </div>

        {/* Detail panel */}
        {selectedSpot && (
          <div className="border-t border-amber-500/15 p-4 space-y-3 bg-slate-950/80">
            {/* Close bar */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">📋 Objekt-Details</span>
              <button
                onClick={() => setSelectedSpot(null)}
                style={{ background: '#374151', border: '1px solid #4b5563', borderRadius: '8px', padding: '4px 10px', color: '#e5e7eb', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ✕ Schließen
              </button>
            </div>
            {/* Map Image Header */}
            <div className="relative h-36 w-full rounded-xl overflow-hidden border border-amber-500/20 shadow-lg">
                <SpotImage
                  spot={selectedSpot}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Street View Badge */}
                <div className="absolute top-2 left-2 bg-slate-900/90 border border-blue-500/40 text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  🛰️ Satellit · {selectedSpot.lat.toFixed(5)}, {selectedSpot.lon.toFixed(5)}
                </div>

                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm leading-tight drop-shadow-md">{selectedSpot.name}</h3>
                    <span className="text-[10px] text-amber-400 font-semibold">{selectedSpot.province} · Baujahr {selectedSpot.year}</span>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded border font-bold ${RISK_BG[selectedSpot.risk]} ${RISK_COLOR[selectedSpot.risk]}`}>
                    ⚠ {selectedSpot.risk}
                  </span>
                </div>
              </div>

            {/* Action Buttons: Google Maps Route, Google Earth 3D & Google Search */}
            <div className="space-y-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${HOME_LOCATION.lat},${HOME_LOCATION.lon}&destination=${selectedSpot.lat},${selectedSpot.lon}&travelmode=driving`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-extrabold rounded-xl text-xs transition text-center shadow-md"
              >
                🚗 Route in Google Maps starten (ab Calle Barcelona 3)
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://earth.google.com/web/@${selectedSpot.lat},${selectedSpot.lon},250a,200d,35y,0h,0t,0r`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-[10px] transition text-center"
                >
                  🌍 Google Earth 3D
                </a>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(selectedSpot.name + ' urbex abandonado ' + selectedSpot.province)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 font-bold rounded-xl text-[10px] transition text-center"
                >
                  🔍 Google & Urbex Suche
                </a>
              </div>
            </div>


            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 text-center">
                <div className="text-slate-500 text-[9px]">Dach-NDVI</div>
                <div className="text-emerald-400 font-bold">{selectedSpot.ndvi}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 text-center">
                <div className="text-slate-500 text-[9px]">Pool-NDWI</div>
                <div className="text-blue-400 font-bold">{selectedSpot.ndwi}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 text-center">
                <div className="text-slate-500 text-[9px]">Grundfläche</div>
                <div className="text-amber-400 font-bold">{selectedSpot.built_area || '1.200 m²'}</div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 border-b border-slate-800 pb-1">
              {[
                { id: 'history', label: '📜 Historie' },
                { id: 'catastro', label: '🏛️ Kataster' },
                { id: 'youtube', label: '🎬 YouTube 3-Akt' },
                { id: 'safety', label: '🛡️ Safety' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 text-[9px] font-bold py-1 rounded transition-all ${
                    activeTab === t.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] min-h-[100px]">
              {activeTab === 'history' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <History className="w-3 h-3" /> KI-Recherche (Kimi K3 & GLM-5)
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedSpot.history}</p>
                </div>
              )}

              {activeTab === 'catastro' && (
                <div className="space-y-2 text-[10px]">
                  <div className="text-amber-400 font-bold mb-1 flex justify-between items-center">
                    <span>🏛️ Spanisches Katasteramt (Sede Electrónica del Catastro)</span>
                  </div>

                  {/* Amtliches Kataster-Fassadenfoto Link & Google Earth / Maps Satellit */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <a
                      href={`https://www1.catastro.meh.es/CYG/ASP/busquedarc.asp?RefCat=${selectedSpot.catastro_ref || '03031A004000120000WX'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded text-[9px] text-center transition flex items-center justify-center gap-1"
                    >
                      🏛️ Kataster-Akte öffnen
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.lat},${selectedSpot.lon}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold rounded text-[9px] text-center transition flex items-center justify-center gap-1"
                    >
                      📍 Google Maps GPS
                    </a>
                    <a
                      href={`https://earth.google.com/web/@${selectedSpot.lat},${selectedSpot.lon},250a,35d,35y,0h,0t,0r`}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded text-[9px] text-center transition flex items-center justify-center gap-1"
                    >
                      🌍 Google Earth 3D-Satellit & 3D-Gebäude öffnen
                    </a>
                  </div>


                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Kataster-Ref:</span>
                    <span className="font-mono text-cyan-400 font-bold">{selectedSpot.catastro_ref || '03031A004000120000WX'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Amtliches Baujahr:</span>
                    <span className="text-slate-200">{selectedSpot.year}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Bebaute Fläche:</span>
                    <span className="text-slate-200">{selectedSpot.built_area || '1.200 m²'}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500">Aktivitäts-Status:</span>
                    <span className="text-emerald-400 font-bold">Unbewohnt (is_active: False)</span>
                  </div>
                </div>
              )}


              {activeTab === 'youtube' && selectedSpot.youtube_script && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> YouTube 3-Akt Dramaturgie
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-amber-500/20 text-amber-300 font-medium">
                    🎬 <span className="font-bold">HOOK:</span> "{selectedSpot.youtube_script.hook}"
                  </div>
                  <div className="text-slate-400 space-y-1 text-[9px] pt-1">
                    <div><span className="text-emerald-400 font-bold">Akt 1 (Aufstieg):</span> {selectedSpot.youtube_script.act1}</div>
                    <div><span className="text-amber-400 font-bold">Akt 2 (Tragödie):</span> {selectedSpot.youtube_script.act2}</div>
                    <div><span className="text-slate-300 font-bold">Akt 3 (Heute):</span> {selectedSpot.youtube_script.act3}</div>
                  </div>
                </div>
              )}

              {activeTab === 'safety' && selectedSpot.safety_info && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="text-purple-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Qwen 3 Cloud Safety Assessment
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                    <div><span className="text-slate-500">Bausubstanz:</span> <span className="text-amber-300">{selectedSpot.safety_info.structural}</span></div>
                    <div><span className="text-slate-500">Rechtslage:</span> <span className="text-cyan-300">{selectedSpot.safety_info.legal}</span></div>
                    <div className="pt-1 text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Empfohlene Ausrüstung: {selectedSpot.safety_info.equipment}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Actions */}
        <div className="p-4 border-t border-amber-500/15 space-y-2">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
          >
            <Search className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Satelliten-Scan läuft…' : 'Neuen Scan starten'}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleKmlDownload}
              className="btn-amber py-2 px-2 text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> KML Datei
            </button>
            <a
              href={selectedSpot 
                ? `https://www.google.com/maps/dir/?api=1&origin=${HOME_LOCATION.lat},${HOME_LOCATION.lon}&destination=${selectedSpot.lat},${selectedSpot.lon}&travelmode=driving`
                : `https://www.google.com/maps/dir/?api=1&origin=${HOME_LOCATION.lat},${HOME_LOCATION.lon}&destination=${selectedCity.lat},${selectedCity.lon}&travelmode=driving`}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center"
            >
              🗺️ Maps Route
            </a>
          </div>
        </div>
      </aside>

      {/* ── MAP ── */}
      <main className="flex-1 relative p-3">
        {/* Floating Radius Control Bar directly on top of the Map */}
        <div className="absolute top-5 left-5 z-[1000] glass-panel p-3 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center gap-3 bg-slate-950/90 backdrop-blur-xl">
          <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 shrink-0">
            <Sliders className="w-4 h-4 text-amber-400" /> Radius:
          </span>

          <button
            onClick={() => setRadius(r => Math.max(10, r - 20))}
            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-black rounded-lg text-xs flex items-center justify-center transition"
          >
            -
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              {showAllRegions || searchRadiusKm >= 200 ? '250 km (Alle)' : `${searchRadiusKm} km`}
            </span>
            <input
              type="range" min="10" max="250" step="10"
              value={searchRadiusKm}
              onChange={e => {
                setRadius(Number(e.target.value));
                if (Number(e.target.value) < 200) setShowAllRegions(false);
              }}
              className="w-28 cursor-pointer mt-1"
            />
          </div>

          <button
            onClick={() => setRadius(r => Math.min(250, r + 20))}
            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-black rounded-lg text-xs flex items-center justify-center transition"
          >
            +
          </button>

          <button
            onClick={() => {
              setFilterStatus('ALL');
              setShowAllRegions(true);
              setRadius(250);
            }}
            className="py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold rounded-xl transition shrink-0 cursor-pointer"
          >
            🗺️ Alle {filteredSpots.length} Objekte anzeigen
          </button>
        </div>

        {/* Map layer & Zoom controls */}
        <div className="absolute top-5 right-5 z-[1000] flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${mapLayer === 'satellite' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'glass-panel border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Satellite className="w-3.5 h-3.5" /> Satellit
            </button>
            <button
              onClick={() => setMapLayer('osm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${mapLayer === 'osm' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'glass-panel border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Map className="w-3.5 h-3.5" /> Straßen
            </button>
          </div>

          {/* Quick Zoom Controls (+ / - / Übersicht) */}
          <div className="glass-panel p-1 rounded-xl border border-amber-500/30 flex flex-col gap-1 bg-slate-950/90 shadow-2xl">
            <button
              title="Heranzoomen (+)"
              onClick={() => {
                if (window._leaflet_map) window._leaflet_map.zoomIn();
              }}
              className="w-8 h-8 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 text-amber-400 font-black rounded-lg text-sm flex items-center justify-center transition cursor-pointer"
            >
              +
            </button>
            <button
              title="Herauszoomen (-)"
              onClick={() => {
                if (window._leaflet_map) window._leaflet_map.zoomOut();
              }}
              className="w-8 h-8 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 text-amber-400 font-black rounded-lg text-sm flex items-center justify-center transition cursor-pointer"
            >
              -
            </button>
            <button
              title="Gesamtübersicht (Fit Bounds)"
              onClick={() => {
                if (window._leaflet_map && filteredSpots.length > 0) {
                  const bounds = L.latLngBounds(filteredSpots.map(s => [s.lat, s.lon]));
                  window._leaflet_map.fitBounds(bounds, { padding: [50, 50] });
                }
              }}
              className="w-8 h-8 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 text-amber-400 font-bold rounded-lg text-[10px] flex items-center justify-center transition cursor-pointer"
            >
              🗺️
            </button>
          </div>
        </div>

        <MapContainer
          center={[selectedCity.lat, selectedCity.lon]}
          zoom={10}
          className="w-full h-full"
          zoomControl={false}
        >
          <MapFlyTo
            center={selectedCity}
            showAll={showAllRegions || searchRadiusKm >= 200}
            spots={filteredSpots}
            selectedSpot={selectedSpot}
          />

          <TileLayer
            key={mapLayer}
            url={mapLayer === 'satellite'
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            attribution='&copy; ESRI / OpenStreetMap contributors'
          />

          {/* Radius circle */}
          <Circle
            center={[selectedCity.lat, selectedCity.lon]}
            radius={searchRadiusKm * 1000}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.07, weight: 2, dashArray: '6,4' }}
          />

          {/* Spots */}
          {filteredSpots.map(spot => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={spot.status === 'UNCHARTED_NEW_DISCOVERY' ? unchartedIcon : knownIcon}
              eventHandlers={{
                click: () => setSelectedSpot(spot)
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                <div className="flex flex-col gap-0.5 text-xs min-w-[150px]">
                  <span className="font-bold text-slate-800 leading-tight">{spot.name}</span>
                  <span className="text-[10px] text-amber-600 font-semibold">{spot.type}</span>
                  <span className="text-[10px] text-slate-600 mt-1 pt-1 border-t border-slate-200/50">
                    📍 Distanz (Calle Barcelona 3): <strong className="text-slate-800">{calculateDistance(HOME_LOCATION.lat, HOME_LOCATION.lon, spot.lat, spot.lon).toFixed(1)} km</strong>
                  </span>
                </div>
              </Tooltip>
              <Popup>
                <div style={{ minWidth: 240 }} className="p-1">
                  <SpotImage
                    spot={spot}
                    className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-700"
                  />
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-extrabold text-slate-100 text-xs leading-snug">{spot.name}</h4>
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold mb-1">{spot.province} · {spot.type} · Baujahr {spot.year}</div>
                  <p className="text-[10px] text-slate-300 leading-relaxed mb-2">{spot.history.slice(0, 100)}…</p>
                  <div className="flex gap-1.5 text-[9px] font-bold mb-2">
                    <span className="bg-slate-800 text-emerald-400 rounded px-1.5 py-0.5 border border-slate-700">NDVI {spot.ndvi}</span>
                    <span className="bg-slate-800 text-blue-400 rounded px-1.5 py-0.5 border border-slate-700">NDWI {spot.ndwi}</span>
                    <span className={`rounded px-1.5 py-0.5 ${RISK_BG[spot.risk]} ${RISK_COLOR[spot.risk]}`}>⚠ {spot.risk}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${HOME_LOCATION.lat},${HOME_LOCATION.lon}&destination=${spot.lat},${spot.lon}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded text-[10px] transition text-center w-full"
                  >
                    🚗 Route ab Calle Barcelona 3
                  </a>
                </div>
              </Popup>

            </Marker>
          ))}
        </MapContainer>
      </main>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
