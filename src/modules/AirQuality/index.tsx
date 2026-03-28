import { useEffect, useRef, useState } from "react";
import { Wind, MapPin, AlertTriangle, Loader, Maximize2, Minimize2, Activity, Eye } from "lucide-react";
import type { Lang } from "../../types";
import { fetchAirQuality, airQualityColor, FLOOD_AIR_SAMPLE_POINTS, type AirQualityFeature as AQF } from "../../services/mapServices";
import L from "leaflet";

interface Props { lang: Lang; }

const labels = {
  pt: {
    title: "QUALIDADE DO AR EM TEMPO REAL", subtitle: "Open-Meteo Air Quality API • Dados globais ao vivo",
    clickMap: "Clique no mapa para analisar a qualidade do ar nessa região",
    expand: "TELA CHEIA", collapse: "MINIMIZAR", legend: "LEGENDA",
    aqi: "Índice AQI", pm25: "PM2.5 (µg/m³)", pm10: "PM10 (µg/m³)",
    good: "Boa", moderate: "Moderada", poor: "Ruim", hazardous: "Perigosa",
    lat: "Lat", lon: "Lon", airTitle: "QUALIDADE DO AR",
    total: "Total analisado", goodCount: "Boa", poorCount: "Ruim/Perigosa",
    analyzed: "PONTOS ANALISADOS", loading: "Carregando...",
    status: "Status",
  },
  en: {
    title: "REAL-TIME AIR QUALITY", subtitle: "Open-Meteo Air Quality API • Live global data",
    clickMap: "Click the map to analyze air quality in this region",
    expand: "FULL SCREEN", collapse: "MINIMIZE", legend: "LEGEND",
    aqi: "AQI Index", pm25: "PM2.5 (µg/m³)", pm10: "PM10 (µg/m³)",
    good: "Good", moderate: "Moderate", poor: "Poor", hazardous: "Hazardous",
    lat: "Lat", lon: "Lon", airTitle: "AIR QUALITY",
    total: "Total analyzed", goodCount: "Good", poorCount: "Poor/Hazardous",
    analyzed: "ANALYZED POINTS", loading: "Loading...",
    status: "Status",
  },
  es: {
    title: "CALIDAD DEL AIRE EN TIEMPO REAL", subtitle: "Open-Meteo Air Quality API • Datos globales en vivo",
    clickMap: "Clic en el mapa para analizar la calidad del aire en esta región",
    expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR", legend: "LEYENDA",
    aqi: "Índice AQI", pm25: "PM2.5 (µg/m³)", pm10: "PM10 (µg/m³)",
    good: "Buena", moderate: "Moderada", poor: "Mala", hazardous: "Peligrosa",
    lat: "Lat", lon: "Lon", airTitle: "CALIDAD DEL AIRE",
    total: "Total analizado", goodCount: "Buena", poorCount: "Mala/Peligrosa",
    analyzed: "PUNTOS ANALIZADOS", loading: "Cargando...",
    status: "Estado",
  },
  fr: {
    title: "QUALITÉ DE L’AIR EN TEMPS RÉEL", subtitle: "API Open-Meteo Air Quality • Données mondiales en direct",
    clickMap: "Cliquez sur la carte pour analyser la qualité de l’air dans cette zone",
    expand: "PLEIN ÉCRAN", collapse: "RÉDUIRE", legend: "LÉGENDE",
    aqi: "Indice AQI", pm25: "PM2,5 (µg/m³)", pm10: "PM10 (µg/m³)",
    good: "Bonne", moderate: "Modérée", poor: "Mauvaise", hazardous: "Dangereuse",
    lat: "Lat", lon: "Lon", airTitle: "QUALITÉ DE L’AIR",
    total: "Total analysé", goodCount: "Bonne", poorCount: "Mauvaise / dangereuse",
    analyzed: "POINTS ANALYSÉS", loading: "Chargement…",
    status: "Statut",
  },
};

interface AirPoint {
  lat: number; lon: number; aqi: number; pm25: number; pm10: number;
  level: "good" | "moderate" | "poor" | "hazardous";
}

export default function AirQuality({ lang }: Props) {
  const l = labels[lang] ?? labels.pt;
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeRef      = useRef(true);
  const [points, setPoints]         = useState<AirPoint[]>([]);
  const [loading, setLoading]       = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected]     = useState<AirPoint | null>(null);

  const levelLabel = (lv: AirPoint["level"]) =>
    lv === "hazardous" ? l.hazardous : lv === "poor" ? l.poor : lv === "moderate" ? l.moderate : l.good;

  const addPoint = async (lat: number, lon: number, map: L.Map) => {
    setLoading(true);
    const data = await fetchAirQuality(lat, lon);
    if (!activeRef.current || !data) { setLoading(false); return; }
    const point: AirPoint = { lat, lon, aqi: data.aqi, pm25: data.pm25, pm10: data.pm10, level: data.level };
    setPoints(prev => [...prev, point]);
    setSelected(point);
    const color = airQualityColor(data.level);
    const icon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:${color};border:2px solid #fff;border-radius:4px;box-shadow:0 0 10px ${color}99;transform:rotate(45deg)"></div>`,
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
      const map = L.map(mapRef.current, { center: [-15, -55], zoom: 3, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      map.on("click", (e: L.LeafletMouseEvent) => addPoint(e.latlng.lat, e.latlng.lng, map));
      mapInstanceRef.current = map;

      void (async () => {
        setLoading(true);
        const batch = await Promise.all(
          FLOOD_AIR_SAMPLE_POINTS.map(({ lat, lon }) => fetchAirQuality(lat, lon).then(d => (d ? { lat, lon, d } : null)))
        );
        if (!activeRef.current) { setLoading(false); return; }
        const valid = batch.filter((x): x is { lat: number; lon: number; d: AQF } => x != null);
        const next: AirPoint[] = [];
        const fg = L.featureGroup();
        for (const { lat, lon, d } of valid) {
          const point: AirPoint = { lat, lon, aqi: d.aqi, pm25: d.pm25, pm10: d.pm10, level: d.level };
          next.push(point);
          const color = airQualityColor(d.level);
          const icon = L.divIcon({
            html: `<div style="width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:4px;box-shadow:0 0 8px ${color}99;transform:rotate(45deg)"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7], className: "",
          });
          const marker = L.marker([lat, lon], { icon }).addTo(map);
          marker.on("click", () => setSelected(point));
          fg.addLayer(marker);
        }
        setPoints(next);
        if (next.length) setSelected(next[0]);
        setLoading(false);
        if (fg.getLayers().length) {
          try {
            map.fitBounds(fg.getBounds(), { padding: [36, 36], maxZoom: 5 });
          } catch { map.setView([-15, -55], 3); }
        }
      })();
    }, 450);
    return () => {
      activeRef.current = false;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch { /* empty */ }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const total   = points.length;
  const goodCnt = points.filter(p => p.level === "good").length;
  const poorCnt = points.filter(p => p.level === "poor" || p.level === "hazardous").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #22c55e, #06b6d4)", borderRadius: 2 }} />
          <h1 style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 900, color: "#fff", margin: 0 }}>{l.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 16 }}>{l.subtitle}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: l.total,     value: total,   color: "#06b6d4", icon: Activity },
          { label: l.goodCount, value: goodCnt, color: "#22c55e", icon: Eye },
          { label: l.poorCount, value: poorCnt, color: "#ef4444", icon: AlertTriangle },
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
      <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
        <Wind size={14} color="#22c55e" />
        <span style={{ fontSize: 12, color: "#4a6080" }}>{l.clickMap}</span>
        {loading && <Loader size={13} color="#22c55e" style={{ marginLeft: "auto", animation: "spin 1s linear infinite" }} />}
      </div>

      {/* Mapa */}
      <div style={{ position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : "55vh", zIndex: fullscreen ? 9999 : 1, borderRadius: fullscreen ? 0 : 14, overflow: "hidden", border: "1px solid #1a2744" }}>

        <button onClick={() => setFullscreen(!fullscreen)}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {fullscreen ? l.collapse : l.expand}
        </button>

        {/* Legenda */}
        <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 1000, background: "rgba(6,14,34,0.92)", borderRadius: 10, padding: "8px 12px", border: "1px solid #1a2744", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#4a6080", fontWeight: 700 }}>{l.legend}:</span>
          <span style={{ fontSize: 11, color: "#22c55e" }}>◆ {l.good}</span>
          <span style={{ fontSize: 11, color: "#f59e0b" }}>◆ {l.moderate}</span>
          <span style={{ fontSize: 11, color: "#f97316" }}>◆ {l.poor}</span>
          <span style={{ fontSize: 11, color: "#ef4444" }}>◆ {l.hazardous}</span>
        </div>

        {/* Popup flutuante em baixo à esquerda */}
        {selected && (
          <div style={{
            position: "absolute", bottom: 16, left: 16, zIndex: 1000,
            background: "rgba(6,14,34,0.97)", borderRadius: 14, padding: 16,
            border: `1px solid ${airQualityColor(selected.level)}60`,
            width: "min(280px, calc(100vw - 120px))",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Wind size={16} color={airQualityColor(selected.level)} />
                <span style={{ fontSize: 11, color: airQualityColor(selected.level), fontWeight: 900, textTransform: "uppercase" }}>{l.airTitle}</span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 8px", fontSize: 14 }}>×</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase" }}>{l.status}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: airQualityColor(selected.level) }}>{levelLabel(selected.level)}</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color: airQualityColor(selected.level), fontFamily: "monospace", margin: "0 0 12px" }}>AQI {selected.aqi}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(6,182,212,0.3)" }}>
                <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.pm25}</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#06b6d4", fontFamily: "monospace", margin: 0 }}>{selected.pm25.toFixed(1)}</p>
              </div>
              <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.pm10}</p>
                <p style={{ fontSize: 16, fontWeight: 900, color: "#8b5cf6", fontFamily: "monospace", margin: 0 }}>{selected.pm10.toFixed(1)}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: "1px solid #1a2744" }}>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", margin: 0 }}>{selected.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", margin: 0 }}>{selected.lon.toFixed(3)}</p></div>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Lista */}
      {points.length > 0 && (
        <div>
          <p style={{ fontSize: 11, color: "#4a6080", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{l.analyzed}</p>
          {[...points].reverse().map((p, i) => (
            <div key={i}
              onClick={() => { setSelected(p); mapInstanceRef.current?.flyTo([p.lat, p.lon], 8, { animate: true, duration: 1 }); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "#0a1628", border: `1px solid ${airQualityColor(p.level)}20`, marginBottom: 8, cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = airQualityColor(p.level) + "60"; e.currentTarget.style.background = "#0d1e3a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = airQualityColor(p.level) + "20"; e.currentTarget.style.background = "#0a1628"; }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: airQualityColor(p.level) + "20", border: `1px solid ${airQualityColor(p.level)}50`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: airQualityColor(p.level), fontFamily: "monospace" }}>AQI<br />{p.aqi}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <MapPin size={11} color="#4a6080" />
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>📍 {p.lat.toFixed(3)}, {p.lon.toFixed(3)}</span>
                </div>
                <span style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace" }}>PM2.5: {p.pm25.toFixed(1)} | PM10: {p.pm10.toFixed(1)}</span>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ padding: "3px 8px", borderRadius: 6, background: airQualityColor(p.level) + "20" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: airQualityColor(p.level), textTransform: "uppercase" }}>{levelLabel(p.level)}</span>
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