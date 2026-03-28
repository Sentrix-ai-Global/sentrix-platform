import { useEffect, useRef, useState } from "react";
import { Droplets, MapPin, AlertTriangle, Loader, Maximize2, Minimize2, Activity } from "lucide-react";
import type { Lang } from "../../types";
import { fetchFloodData, floodColor } from "../../services/mapServices";
import L from "leaflet";

interface Props { lang: Lang; }

const labels = {
  pt: {
    title: "ENCHENTES EM TEMPO REAL", subtitle: "Open-Meteo Flood API • Dados globais ao vivo",
    loading: "Carregando dados...", clickMap: "Clique no mapa para analisar enchentes nessa região",
    expand: "TELA CHEIA", collapse: "MINIMIZAR", legend: "LEGENDA",
    discharge: "Descarga (m³/s)", status: "Status do Rio",
    normal: "Normal", attention: "Atenção", critical: "Crítico",
    lat: "Lat", lon: "Lon", analyzed: "PONTOS ANALISADOS",
    noData: "Clique no mapa para ver dados de enchente.",
    river: "RIO / BACIA", floodTitle: "ENCHENTE — OPEN-METEO",
    total: "Total analisado", atention: "Em atenção", crit: "Críticos",
  },
  en: {
    title: "REAL-TIME FLOODS", subtitle: "Open-Meteo Flood API • Live global data",
    loading: "Loading data...", clickMap: "Click the map to analyze floods in this region",
    expand: "FULL SCREEN", collapse: "MINIMIZE", legend: "LEGEND",
    discharge: "Discharge (m³/s)", status: "River Status",
    normal: "Normal", attention: "Attention", critical: "Critical",
    lat: "Lat", lon: "Lon", analyzed: "ANALYZED POINTS",
    noData: "Click the map to see flood data.",
    river: "RIVER / BASIN", floodTitle: "FLOOD — OPEN-METEO",
    total: "Total analyzed", atention: "Attention", crit: "Critical",
  },
  es: {
    title: "INUNDACIONES EN TIEMPO REAL", subtitle: "Open-Meteo Flood API • Datos globales en vivo",
    loading: "Cargando datos...", clickMap: "Clic en el mapa para analizar inundaciones en esta región",
    expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR", legend: "LEYENDA",
    discharge: "Descarga (m³/s)", status: "Estado del Río",
    normal: "Normal", attention: "Atención", critical: "Crítico",
    lat: "Lat", lon: "Lon", analyzed: "PUNTOS ANALIZADOS",
    noData: "Clic en el mapa para ver datos de inundación.",
    river: "RÍO / CUENCA", floodTitle: "INUNDACIÓN — OPEN-METEO",
    total: "Total analizado", atention: "En atención", crit: "Críticos",
  },
  fr: {
    title: "INONDATIONS EN TEMPS RÉEL", subtitle: "API Open-Meteo Flood • Données mondiales en direct",
    loading: "Chargement…", clickMap: "Cliquez sur la carte pour analyser les crues dans cette zone",
    expand: "PLEIN ÉCRAN", collapse: "RÉDUIRE", legend: "LÉGENDE",
    discharge: "Débit (m³/s)", status: "État du fleuve",
    normal: "Normal", attention: "Attention", critical: "Critique",
    lat: "Lat", lon: "Lon", analyzed: "POINTS ANALYSÉS",
    noData: "Cliquez sur la carte pour voir les données.",
    river: "FLEUVE / BASSIN", floodTitle: "CRUE — OPEN-METEO",
    total: "Total analysé", atention: "En vigilance", crit: "Critiques",
  },
};

interface FloodPoint {
  lat: number; lon: number; discharge: number;
  level: "normal" | "attention" | "critical";
}

export default function Floods({ lang }: Props) {
  const l = labels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeRef      = useRef(true);
  const [points, setPoints]         = useState<FloodPoint[]>([]);
  const [loading, setLoading]       = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected]     = useState<FloodPoint | null>(null);

  const levelLabel = (lv: FloodPoint["level"]) =>
    lv === "critical" ? l.critical : lv === "attention" ? l.attention : l.normal;

  const addPoint = async (lat: number, lon: number, map: L.Map) => {
    setLoading(true);
    const data = await fetchFloodData(lat, lon);
    if (!activeRef.current || !data) { setLoading(false); return; }
    const point: FloodPoint = { lat, lon, discharge: data.discharge, level: data.level };
    setPoints(prev => [...prev, point]);
    setSelected(point);

    const color = floodColor(data.level);
    const icon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 10px ${color}99"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8], className: "",
    });
    const marker = L.marker([lat, lon], { icon }).addTo(map);
    marker.on("click", () => setSelected(point));
    setLoading(false);
  };

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
      const map = L.map(mapRef.current, { center: [0, 0], zoom: 2, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      map.on("click", (e: L.LeafletMouseEvent) => addPoint(e.latlng.lat, e.latlng.lng, map));
      mapInstanceRef.current = map;
    }, 500);

    return () => { activeRef.current = false; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const total     = points.length;
  const attention = points.filter(p => p.level === "attention").length;
  const critical  = points.filter(p => p.level === "critical").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
          <h1 style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 900, color: "#fff", margin: 0 }}>{l.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 16 }}>{l.subtitle}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: l.total,    value: total,     color: "#06b6d4", icon: Activity },
          { label: l.atention, value: attention, color: "#f59e0b", icon: AlertTriangle },
          { label: l.crit,     value: critical,  color: "#ef4444", icon: Droplets },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ padding: "16px 18px", borderRadius: 12, background: "#0a1628", border: `1px solid ${color}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Dica */}
      <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
        <Droplets size={14} color="#06b6d4" />
        <span style={{ fontSize: 12, color: "#4a6080" }}>{l.clickMap}</span>
        {loading && <Loader size={13} color="#06b6d4" style={{ marginLeft: "auto", animation: "spin 1s linear infinite" }} />}
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
          <span style={{ fontSize: 11, color: "#22c55e" }}>● {l.normal}</span>
          <span style={{ fontSize: 11, color: "#f59e0b" }}>● {l.attention}</span>
          <span style={{ fontSize: 11, color: "#ef4444" }}>● {l.critical}</span>
        </div>

        {/* Popup flutuante em baixo à esquerda */}
        {selected && (
          <div style={{
            position: "absolute", bottom: 16, left: 16, zIndex: 1000,
            background: "rgba(6,14,34,0.97)", borderRadius: 14, padding: 16,
            border: `1px solid ${floodColor(selected.level)}60`,
            width: "min(260px, calc(100vw - 120px))",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Droplets size={16} color={floodColor(selected.level)} />
                <span style={{ fontSize: 11, color: floodColor(selected.level), fontWeight: 900, textTransform: "uppercase" }}>{l.floodTitle}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 8px", fontSize: 14 }}>×</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase" }}>{l.status}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: floodColor(selected.level) }}>{levelLabel(selected.level)}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: floodColor(selected.level), fontFamily: "monospace", margin: "0 0 10px" }}>{selected.discharge.toFixed(0)} m³/s</p>
            <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 2px", textTransform: "uppercase" }}>{l.discharge}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a2744" }}>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", margin: 0 }}>{selected.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", margin: 0 }}>{selected.lon.toFixed(3)}</p></div>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Lista de pontos analisados */}
      {points.length > 0 && (
        <div>
          <p style={{ fontSize: 11, color: "#4a6080", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{l.analyzed}</p>
          {[...points].reverse().map((p, i) => (
            <div key={i}
              onClick={() => { setSelected(p); mapInstanceRef.current?.flyTo([p.lat, p.lon], 8, { animate: true, duration: 1 }); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "#0a1628", border: `1px solid ${floodColor(p.level)}20`, marginBottom: 8, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = floodColor(p.level) + "60"; e.currentTarget.style.background = "#0d1e3a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = floodColor(p.level) + "20"; e.currentTarget.style.background = "#0a1628"; }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: floodColor(p.level) + "20", border: `1px solid ${floodColor(p.level)}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Droplets size={22} color={floodColor(p.level)} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <MapPin size={11} color="#4a6080" />
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>📍 {p.lat.toFixed(3)}, {p.lon.toFixed(3)}</span>
                </div>
                <span style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace" }}>{p.discharge.toFixed(0)} m³/s</span>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ padding: "3px 8px", borderRadius: 6, background: floodColor(p.level) + "20" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: floodColor(p.level), textTransform: "uppercase" }}>{levelLabel(p.level)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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