import { useEffect, useRef, useState } from "react";
import { AlertTriangle, MapPin, Users, TrendingUp, Activity, Heart, FileText, Shield, Radio, Zap, Search, ChevronRight, Loader, Navigation, Maximize2, Minimize2 } from "lucide-react";
import type { Lang } from "../../types";
import { translationsBundle } from "../../i18n/translations";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface DashboardProps { lang: Lang; }
interface Location { display_name: string; lat: string; lon: string; place_id: number; }

const mapLabels = {
  pt: { placeholder: "Buscar localização no mapa...", searching: "Buscando...", search: "BUSCAR", expand: "TELA CHEIA", collapse: "MINIMIZAR" },
  en: { placeholder: "Search location on map...", searching: "Searching...", search: "SEARCH", expand: "FULL SCREEN", collapse: "MINIMIZE" },
  es: { placeholder: "Buscar ubicación en el mapa...", searching: "Buscando...", search: "BUSCAR", expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR" },
  fr: { placeholder: "Rechercher un lieu sur la carte…", searching: "Recherche…", search: "RECHERCHER", expand: "PLEIN ÉCRAN", collapse: "RÉDUIRE" },
};

export default function Dashboard({ lang }: DashboardProps) {
  const t = translationsBundle(lang);
  const l = mapLabels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef      = useRef<L.Marker | null>(null);

  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState<Location[]>([]);
  const [loading, setLoading]       = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { center: [0, 0], zoom: 2, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;
    }, 100);
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6`,
        { headers: { "Accept-Language": lang === "pt" ? "pt-BR" : lang === "es" ? "es" : lang === "fr" ? "fr-FR" : "en" } }
      );
      const data = await res.json();
      setResults(data);
    } catch (e) { setResults([]); }
    setLoading(false);
  };

  const selectLocation = (loc: Location) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    const map = mapInstanceRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.remove();
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<strong>${loc.display_name.split(",")[0]}</strong>`).openPopup();
    markerRef.current = marker;
    map.flyTo([lat, lon], 15, { animate: true, duration: 1.5 });
    setResults([]);
    setQuery(loc.display_name.split(",")[0]);
  };

  const statCards = [
    { icon: AlertTriangle, label: t.alerts,  value: "3",      color: "#ef4444", pulse: true  },
    { icon: MapPin,        label: t.areas,   value: "127",    color: "#3b82f6", pulse: false },
    { icon: Activity,      label: t.sensors, value: "94%",    color: "#22c55e", pulse: false },
    { icon: Users,         label: t.teams,   value: "8",      color: "#f59e0b", pulse: false },
    { icon: Heart,         label: t.lives,   value: "2.8K",   color: "#22c55e", pulse: false },
    { icon: TrendingUp,    label: t.damage,  value: "R$4.2B", color: "#06b6d4", pulse: false },
  ];

  const quickActions = [
    { icon: Zap,      label: t.emitAlert,    color: "#ef4444" },
    { icon: Users,    label: t.dispatch,     color: "#f97316" },
    { icon: Shield,   label: t.civil,        color: "#3b82f6" },
    { icon: Radio,    label: t.comm,         color: "#22c55e" },
    { icon: Activity, label: t.checkSensors, color: "#06b6d4" },
    { icon: FileText, label: t.report,       color: "#8b5cf6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Hero logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 20px 20px", background: "linear-gradient(135deg, #0a1628, #060e22)", borderRadius: 16, border: "1px solid #1a2744", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 300, background: "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <img src="/logo.png" alt="SENTRIX" style={{ width: "100%", maxWidth: 420, height: "auto", filter: "drop-shadow(0 0 24px rgba(6,182,212,0.6))", position: "relative", zIndex: 1 }} />
        <p style={{ fontSize: 13, color: "#2a3a54", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace", marginTop: 12, zIndex: 1 }}>{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        {statCards.map(({ icon: Icon, label, value, color, pulse }) => (
          <div key={label}
            style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", cursor: "default", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ padding: 10, borderRadius: 10, background: color + "15", border: `1px solid ${color}25` }}>
                <Icon size={16} color={color} />
              </div>
              {pulse && <span style={{ width: 9, height: 9, background: "#ef4444", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
            <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ fontSize: 13, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14, fontWeight: 700 }}>{t.actions}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {quickActions.map(({ icon: Icon, label, color }) => (
            <button key={label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", borderRadius: 12, background: color + "0d", border: `1px solid ${color}25`, color, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = color + "20"; e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = color + "0d"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={15} color="#4a6080" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              placeholder={l.placeholder}
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, background: "#060e22", border: "1px solid #1a2744", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button onClick={search} disabled={loading}
            style={{ padding: "10px 20px", borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #f97316)", border: "none", color: "#fff", fontSize: 12, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Navigation size={14} />}
            {loading ? l.searching : l.search}
          </button>
        </div>

        {results.length > 0 && (
          <div style={{ borderRadius: 10, background: "#060e22", border: "1px solid #1a2744", overflow: "hidden" }}>
            {results.map((loc, i) => (
              <button key={i} onClick={() => selectLocation(loc)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", background: "transparent", border: "none", borderBottom: i < results.length - 1 ? "1px solid #1a2744" : "none", cursor: "pointer", textAlign: "left" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <MapPin size={13} color="#06b6d4" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "#fff", fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loc.display_name.split(",")[0]}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loc.display_name}</p>
                </div>
                <ChevronRight size={13} color="#4a6080" />
              </button>
            ))}
          </div>
        )}

        <div style={{
          position: fullscreen ? "fixed" : "relative",
          top: fullscreen ? 0 : "auto",
          left: fullscreen ? 0 : "auto",
          width: fullscreen ? "100vw" : "100%",
          height: fullscreen ? "100vh" : "55vh",
          zIndex: fullscreen ? 9999 : 1,
          borderRadius: fullscreen ? 0 : 10,
          overflow: "hidden",
          border: "1px solid #1a2744",
        }}>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {fullscreen ? l.collapse : l.expand}
          </button>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #4a6080; }
        .leaflet-container { background: #050d1f !important; font-family: Arial, sans-serif; }
        .leaflet-tile { filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-control-attribution { background: rgba(6,14,34,0.9) !important; color: #4a6080 !important; }
        .leaflet-control-attribution a { color: #06b6d4 !important; }
        .leaflet-control-zoom a { background: #0a1628 !important; color: #fff !important; border-color: #1a2744 !important; }
        .leaflet-popup-content-wrapper { background: #0a1628 !important; color: #fff !important; border: 1px solid #1a2744 !important; border-radius: 10px !important; }
        .leaflet-popup-tip { background: #0a1628 !important; }
      `}</style>
    </div>
  );
}