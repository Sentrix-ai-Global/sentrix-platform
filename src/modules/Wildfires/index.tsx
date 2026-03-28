import { useEffect, useRef, useState } from "react";
import { Flame, AlertTriangle, Loader, Maximize2, Minimize2, Activity } from "lucide-react";
import type { Lang } from "../../types";
import { fetchNasaFires, fetchInpeFires } from "../../services/mapServices";
import L from "leaflet";

interface Props { lang: Lang; }

const labels = {
  pt: {
    title: "QUEIMADAS E INCÊNDIOS EM TEMPO REAL",
    subtitle: "NASA FIRMS VIIRS • INPE BDQueimadas • Dados globais ao vivo",
    expand: "TELA CHEIA", collapse: "MINIMIZAR", legend: "LEGENDA",
    nasaFire: "🔴 NASA FIRMS", inpeFire: "🟡 INPE Brasil",
    total: "Total focos", nasa: "NASA FIRMS", inpe: "INPE Brasil",
    analyzed: "FOCOS DETECTADOS", loading: "Carregando dados...",
    brightness: "Temperatura (K)", confidence: "Confiança",
    municipality: "Município", state: "Estado", biome: "Bioma",
    lat: "Lat", lon: "Lon", fireTitle: "FOCO DE INCÊNDIO",
    nasaLoading: "Carregando NASA...", inpeLoading: "Carregando INPE...",
  },
  en: {
    title: "WILDFIRES IN REAL TIME",
    subtitle: "NASA FIRMS VIIRS • INPE BDQueimadas • Live global data",
    expand: "FULL SCREEN", collapse: "MINIMIZE", legend: "LEGEND",
    nasaFire: "🔴 NASA FIRMS", inpeFire: "🟡 INPE Brazil",
    total: "Total hotspots", nasa: "NASA FIRMS", inpe: "INPE Brazil",
    analyzed: "DETECTED HOTSPOTS", loading: "Loading data...",
    brightness: "Temperature (K)", confidence: "Confidence",
    municipality: "Municipality", state: "State", biome: "Biome",
    lat: "Lat", lon: "Lon", fireTitle: "FIRE HOTSPOT",
    nasaLoading: "Loading NASA...", inpeLoading: "Loading INPE...",
  },
  es: {
    title: "INCENDIOS EN TIEMPO REAL",
    subtitle: "NASA FIRMS VIIRS • INPE BDQueimadas • Datos globales en vivo",
    expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR", legend: "LEYENDA",
    nasaFire: "🔴 NASA FIRMS", inpeFire: "🟡 INPE Brasil",
    total: "Total focos", nasa: "NASA FIRMS", inpe: "INPE Brasil",
    analyzed: "FOCOS DETECTADOS", loading: "Cargando datos...",
    brightness: "Temperatura (K)", confidence: "Confianza",
    municipality: "Municipio", state: "Estado", biome: "Bioma",
    lat: "Lat", lon: "Lon", fireTitle: "FOCO DE INCENDIO",
    nasaLoading: "Cargando NASA...", inpeLoading: "Cargando INPE...",
  },
  fr: {
    title: "FEUX DE FORÊT ET BRÛLIS EN TEMPS RÉEL",
    subtitle: "NASA FIRMS VIIRS • INPE BDQueimadas • Données mondiales en direct",
    expand: "PLEIN ÉCRAN", collapse: "RÉDUIRE", legend: "LÉGENDE",
    nasaFire: "🔴 NASA FIRMS", inpeFire: "🟡 INPE Brésil",
    total: "Total foyers", nasa: "NASA FIRMS", inpe: "INPE Brésil",
    analyzed: "FOYEURS DÉTECTÉS", loading: "Chargement…",
    brightness: "Température (K)", confidence: "Confiance",
    municipality: "Commune", state: "État", biome: "Biome",
    lat: "Lat", lon: "Lon", fireTitle: "FOYER D’INCENDIE",
    nasaLoading: "Chargement NASA…", inpeLoading: "Chargement INPE…",
  },
};

interface FirePoint {
  lat: number; lon: number; source: "nasa" | "inpe";
  brightness?: number; confidence?: string;
  municipio?: string; estado?: string; bioma?: string;
}

export default function Wildfires({ lang }: Props) {
  const l = labels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeRef      = useRef(true);
  const [fires, setFires]           = useState<FirePoint[]>([]);
  const [nasaLoading, setNasaLoading] = useState(true);
  const [inpeLoading, setInpeLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected]     = useState<FirePoint | null>(null);

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
      mapInstanceRef.current = map;

      // NASA FIRMS
      setNasaLoading(true);
      fetchNasaFires().then(data => {
        if (!activeRef.current) return;
        const nasaLayer = L.layerGroup().addTo(map);
        const nasaPoints: FirePoint[] = [];
        data.forEach(f => {
          const point: FirePoint = { lat: f.lat, lon: f.lon, source: "nasa", brightness: f.brightness, confidence: f.confidence };
          nasaPoints.push(point);
          const circle = L.circleMarker([f.lat, f.lon], {
            radius: 4, fillColor: "#ef4444", color: "#f97316", weight: 1, opacity: 1, fillOpacity: 0.85,
          }).addTo(nasaLayer);
          circle.on("click", () => setSelected(point));
        });
        setFires(prev => [...prev, ...nasaPoints]);
        setNasaLoading(false);
      });

      // INPE
      setInpeLoading(true);
      fetchInpeFires().then(data => {
        if (!activeRef.current) return;
        const inpeLayer = L.layerGroup().addTo(map);
        const inpePoints: FirePoint[] = [];
        data.forEach(f => {
          const point: FirePoint = { lat: f.lat, lon: f.lon, source: "inpe", municipio: f.municipio, estado: f.estado, bioma: f.bioma };
          inpePoints.push(point);
          const icon = L.divIcon({
            html: `<div style="width:10px;height:10px;background:#f59e0b;border:1.5px solid #fff;border-radius:2px;transform:rotate(45deg);box-shadow:0 0 6px rgba(245,158,11,0.8)"></div>`,
            iconSize: [10, 10], iconAnchor: [5, 5], className: "",
          });
          const marker = L.marker([f.lat, f.lon], { icon }).addTo(inpeLayer);
          marker.on("click", () => setSelected(point));
        });
        setFires(prev => [...prev, ...inpePoints]);
        setInpeLoading(false);
      });
    }, 500);

    return () => { activeRef.current = false; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const total    = fires.length;
  const nasaCount = fires.filter(f => f.source === "nasa").length;
  const inpeCount = fires.filter(f => f.source === "inpe").length;

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
          { label: l.total, value: total,     color: "#f97316", icon: Flame },
          { label: l.nasa,  value: nasaCount, color: "#ef4444", icon: Activity },
          { label: l.inpe,  value: inpeCount, color: "#f59e0b", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ padding: "16px 18px", borderRadius: 12, background: "#0a1628", border: `1px solid ${color}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>
              {label === l.total && nasaLoading && inpeLoading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Status carregamento */}
      <div style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", flexWrap: "wrap" }}>
        {nasaLoading
          ? <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> {l.nasaLoading}</span>
          : <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>{l.nasaFire} ✓</span>}
        {inpeLoading
          ? <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> {l.inpeLoading}</span>
          : <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>{l.inpeFire} ✓</span>}
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
          <span style={{ fontSize: 11, color: "#ef4444" }}>● {l.nasaFire}</span>
          <span style={{ fontSize: 11, color: "#f59e0b" }}>◆ {l.inpeFire}</span>
        </div>

        {/* Popup flutuante em baixo à esquerda */}
        {selected && (
          <div style={{
            position: "absolute", bottom: 16, left: 16, zIndex: 1000,
            background: "rgba(6,14,34,0.97)", borderRadius: 14, padding: 16,
            border: `1px solid ${selected.source === "nasa" ? "#ef4444" : "#f59e0b"}60`,
            width: "min(270px, calc(100vw - 120px))",
            backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <span style={{ fontSize: 11, color: selected.source === "nasa" ? "#ef4444" : "#f59e0b", fontWeight: 900, textTransform: "uppercase" }}>
                  {selected.source === "nasa" ? "NASA FIRMS" : "INPE Brasil"}
                </span>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 8px", fontSize: 14 }}>×</button>
            </div>

            {selected.source === "nasa" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.brightness}</p>
                  <p style={{ fontSize: 18, fontWeight: 900, color: "#ef4444", fontFamily: "monospace", margin: 0 }}>{selected.brightness?.toFixed(0)}K</p>
                </div>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.confidence}</p>
                  <p style={{ fontSize: 18, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace", margin: 0 }}>{selected.confidence}%</p>
                </div>
              </div>
            )}

            {selected.source === "inpe" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 2px", textTransform: "uppercase" }}>{l.municipality}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{selected.municipio}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 2px", textTransform: "uppercase" }}>{l.state}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", margin: 0 }}>{selected.estado}</p>
                  </div>
                  <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 2px", textTransform: "uppercase" }}>{l.biome}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", margin: 0 }}>{selected.bioma}</p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: "1px solid #1a2744" }}>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", margin: 0 }}>{selected.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", margin: 0 }}>{selected.lon.toFixed(3)}</p></div>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
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