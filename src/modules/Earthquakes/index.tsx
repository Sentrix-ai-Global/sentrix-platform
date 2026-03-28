import { useEffect, useRef, useState } from "react";
import { Activity, MapPin, Clock, AlertTriangle, Loader, TrendingUp, Maximize2, Minimize2 } from "lucide-react";
import type { Lang } from "../../types";
import { fetchEarthquakes, quakeColor, quakeRadius } from "../../services/mapServices";
import L from "leaflet";

interface Props { lang: Lang; }

const labels = {
  pt: {
    title: "TERREMOTOS EM TEMPO REAL", subtitle: "Dados USGS • Últimos 7 dias • Global",
    loading: "Carregando dados USGS...", noData: "Nenhum terremoto registrado.",
    mag: "Magnitude", depth: "Profundidade", location: "Local", time: "Horário",
    total: "Total de eventos", strong: "Fortes (M5+)", major: "Maiores (M7+)",
    low: "Baixo", moderate: "Moderado", high: "Alto", extreme: "Extremo",
    recent: "EVENTOS RECENTES", km: "km prof.", expand: "TELA CHEIA", collapse: "MINIMIZAR",
    legend: "LEGENDA",
  },
  en: {
    title: "REAL-TIME EARTHQUAKES", subtitle: "USGS Data • Last 7 days • Global",
    loading: "Loading USGS data...", noData: "No earthquakes recorded.",
    mag: "Magnitude", depth: "Depth", location: "Location", time: "Time",
    total: "Total events", strong: "Strong (M5+)", major: "Major (M7+)",
    low: "Low", moderate: "Moderate", high: "High", extreme: "Extreme",
    recent: "RECENT EVENTS", km: "km depth", expand: "FULL SCREEN", collapse: "MINIMIZE",
    legend: "LEGEND",
  },
  es: {
    title: "TERREMOTOS EN TIEMPO REAL", subtitle: "Datos USGS • Últimos 7 días • Global",
    loading: "Cargando datos USGS...", noData: "Sin terremotos registrados.",
    mag: "Magnitud", depth: "Profundidad", location: "Lugar", time: "Hora",
    total: "Total de eventos", strong: "Fuertes (M5+)", major: "Mayores (M7+)",
    low: "Bajo", moderate: "Moderado", high: "Alto", extreme: "Extremo",
    recent: "EVENTOS RECIENTES", km: "km prof.", expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR",
    legend: "LEYENDA",
  },
  fr: {
    title: "SÉISMES EN TEMPS RÉEL", subtitle: "Données USGS • 7 derniers jours • Monde",
    loading: "Chargement USGS…", noData: "Aucun séisme enregistré.",
    mag: "Magnitude", depth: "Profondeur", location: "Lieu", time: "Heure",
    total: "Événements totaux", strong: "Forts (M5+)", major: "Majeurs (M7+)",
    low: "Faible", moderate: "Modéré", high: "Élevé", extreme: "Extrême",
    recent: "ÉVÉNEMENTS RÉCENTS", km: "km prof.", expand: "PLEIN ÉCRAN", collapse: "RÉDUIRE",
    legend: "LÉGENDE",
  },
};

export default function Earthquakes({ lang }: Props) {
  const l = labels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeRef      = useRef(true);
  const [quakes, setQuakes]         = useState<{ lat: number; lon: number; mag: number; place: string; time: number; depth: number }[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected]     = useState<{ lat: number; lon: number; mag: number; place: string; time: number; depth: number } | null>(null);

  const magLabel = (mag: number) => mag >= 7 ? l.extreme : mag >= 5 ? l.high : mag >= 3 ? l.moderate : l.low;

  useEffect(() => {
    activeRef.current = true;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { center: [20, 0], zoom: 2, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;

      fetchEarthquakes().then(data => {
        if (!activeRef.current) return;
        const sorted = [...data].sort((a, b) => b.time - a.time);
        setQuakes(sorted);
        setLoading(false);
        const layer = L.layerGroup().addTo(map);
        sorted.forEach(q => {
          const circle = L.circleMarker([q.lat, q.lon], {
            radius: quakeRadius(q.mag),
            fillColor: quakeColor(q.mag),
            color: "#fff", weight: 1.5, opacity: 0.9, fillOpacity: 0.8,
          }).addTo(layer);
          circle.on("click", () => {
            setSelected(q);
            map.flyTo([q.lat, q.lon], 6, { animate: true, duration: 1 });
          });
        });
      });
    }, 200);

    return () => { activeRef.current = false; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const total  = quakes.length;
  const strong = quakes.filter(q => q.mag >= 5).length;
  const major  = quakes.filter(q => q.mag >= 7).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #f97316, #ef4444)", borderRadius: 2 }} />
          <h1 style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 900, color: "#fff", margin: 0 }}>{l.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 16 }}>{l.subtitle}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: l.total,  value: total,  color: "#06b6d4", icon: Activity },
          { label: l.strong, value: strong, color: "#f97316", icon: TrendingUp },
          { label: l.major,  value: major,  color: "#ef4444", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ padding: "16px 18px", borderRadius: 12, background: "#0a1628", border: `1px solid ${color}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Mapa */}
      <div style={{ position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : "55vh", zIndex: fullscreen ? 9999 : 1, borderRadius: fullscreen ? 0 : 14, overflow: "hidden", border: "1px solid #1a2744" }}>

        {/* Botão tela cheia */}
        <button onClick={() => setFullscreen(!fullscreen)}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {fullscreen ? l.collapse : l.expand}
        </button>

        {/* Legenda */}
        <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 1000, background: "rgba(6,14,34,0.92)", borderRadius: 10, padding: "8px 12px", border: "1px solid #1a2744", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#4a6080", fontWeight: 700 }}>{l.legend}:</span>
          <span style={{ fontSize: 11, color: "#22c55e" }}>● M1-3</span>
          <span style={{ fontSize: 11, color: "#f59e0b" }}>● M3-5</span>
          <span style={{ fontSize: 11, color: "#f97316" }}>● M5-7</span>
          <span style={{ fontSize: 11, color: "#ef4444" }}>● M7+</span>
        </div>

        {/* Popup FLUTUANTE em baixo à esquerda */}
        {selected && (
          <div style={{
            position: "absolute", bottom: 16, left: 16, zIndex: 1000,
            background: "rgba(6,14,34,0.97)", borderRadius: 14, padding: 16,
            border: `1px solid ${quakeColor(selected.mag)}60`,
            width: "min(260px, calc(100vw - 120px))",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🌍</span>
                <span style={{ fontSize: 11, color: quakeColor(selected.mag), fontWeight: 900, textTransform: "uppercase" }}>{magLabel(selected.mag)}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 8px", fontSize: 14 }}>×</button>
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: quakeColor(selected.mag), fontFamily: "monospace", margin: "0 0 8px" }}>M {selected.mag.toFixed(1)}</p>
            <p style={{ fontSize: 13, color: "#fff", fontWeight: 700, margin: "0 0 10px", lineHeight: 1.4 }}>{selected.place}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.depth}</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: "#8b5cf6", fontFamily: "monospace", margin: 0 }}>{selected.depth.toFixed(0)} {l.km}</p>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid #1a2744" }}>
                <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.time}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", margin: 0 }}>{new Date(selected.time).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1000, display: "flex", alignItems: "center", gap: 10, background: "rgba(6,14,34,0.9)", padding: "12px 20px", borderRadius: 10 }}>
            <Loader size={16} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13, color: "#4a6080" }}>{l.loading}</span>
          </div>
        )}

        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Lista clicável */}
      <div>
        <p style={{ fontSize: 11, color: "#4a6080", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{l.recent}</p>
        {!loading && quakes.slice(0, 50).map((q, i) => (
          <div key={i}
            onClick={() => { setSelected(q); mapInstanceRef.current?.flyTo([q.lat, q.lon], 6, { animate: true, duration: 1 }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "#0a1628", border: `1px solid ${quakeColor(q.mag)}20`, marginBottom: 8, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = quakeColor(q.mag) + "60"; e.currentTarget.style.background = "#0d1e3a"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = quakeColor(q.mag) + "20"; e.currentTarget.style.background = "#0a1628"; }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: quakeColor(q.mag) + "20", border: `1px solid ${quakeColor(q.mag)}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: quakeColor(q.mag), fontFamily: "monospace" }}>M{q.mag.toFixed(1)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <MapPin size={11} color="#4a6080" />
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.place}</span>
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#4a6080" }}>📍 {q.lat.toFixed(2)}, {q.lon.toFixed(2)}</span>
                <span style={{ fontSize: 11, color: "#8b5cf6" }}>⬇ {q.depth.toFixed(0)} {l.km}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ padding: "3px 8px", borderRadius: 6, background: quakeColor(q.mag) + "20", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: quakeColor(q.mag), textTransform: "uppercase" }}>{magLabel(q.mag)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
                <Clock size={10} color="#4a6080" />
                <span style={{ fontSize: 10, color: "#4a6080" }}>{new Date(q.time).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .leaflet-container { background: #050d1f !important; }
        .leaflet-tile { filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-control-zoom a { background: #0a1628 !important; color: #fff !important; border-color: #1a2744 !important; }
        .leaflet-control-attribution { background: rgba(6,14,34,0.9) !important; color: #4a6080 !important; font-size: 10px; }
      `}</style>
    </div>
  );
}