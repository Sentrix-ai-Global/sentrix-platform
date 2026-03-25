import { useEffect, useState } from "react";
import { Activity, MapPin, Clock, AlertTriangle, Loader, TrendingUp } from "lucide-react";
import type { Lang } from "../../types";
import { fetchEarthquakes, quakeColor } from "../../services/mapServices";

interface Props { lang: Lang; }

const labels = {
  pt: {
    title: "TERREMOTOS EM TEMPO REAL",
    subtitle: "Dados USGS • Últimos 7 dias • Global",
    loading: "Carregando dados USGS...",
    noData: "Nenhum terremoto registrado.",
    mag: "Magnitude", depth: "Profundidade", location: "Local", time: "Horário",
    total: "Total de eventos", strong: "Fortes (M5+)", major: "Maiores (M7+)",
    low: "Baixo", moderate: "Moderado", high: "Alto", extreme: "Extremo",
    recent: "EVENTOS RECENTES", stats: "ESTATÍSTICAS",
    km: "km de profundidade",
  },
  en: {
    title: "REAL-TIME EARTHQUAKES",
    subtitle: "USGS Data • Last 7 days • Global",
    loading: "Loading USGS data...",
    noData: "No earthquakes recorded.",
    mag: "Magnitude", depth: "Depth", location: "Location", time: "Time",
    total: "Total events", strong: "Strong (M5+)", major: "Major (M7+)",
    low: "Low", moderate: "Moderate", high: "High", extreme: "Extreme",
    recent: "RECENT EVENTS", stats: "STATISTICS",
    km: "km depth",
  },
  es: {
    title: "TERREMOTOS EN TIEMPO REAL",
    subtitle: "Datos USGS • Últimos 7 días • Global",
    loading: "Cargando datos USGS...",
    noData: "Sin terremotos registrados.",
    mag: "Magnitud", depth: "Profundidad", location: "Lugar", time: "Hora",
    total: "Total de eventos", strong: "Fuertes (M5+)", major: "Mayores (M7+)",
    low: "Bajo", moderate: "Moderado", high: "Alto", extreme: "Extremo",
    recent: "EVENTOS RECIENTES", stats: "ESTADÍSTICAS",
    km: "km de profundidad",
  },
};

export default function Earthquakes({ lang }: Props) {
  const l = labels[lang];
  const [quakes, setQuakes] = useState<{ lat: number; lon: number; mag: number; place: string; time: number; depth: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEarthquakes().then(data => {
      const sorted = [...data].sort((a, b) => b.time - a.time);
      setQuakes(sorted);
      setLoading(false);
    });
  }, []);

  const magLabel = (mag: number) => mag >= 7 ? l.extreme : mag >= 5 ? l.high : mag >= 3 ? l.moderate : l.low;
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

      {/* Lista */}
      <div>
        <p style={{ fontSize: 11, color: "#4a6080", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{l.recent}</p>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 20 }}>
            <Loader size={16} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13, color: "#4a6080" }}>{l.loading}</span>
          </div>
        )}
        {!loading && quakes.length === 0 && (
          <p style={{ fontSize: 13, color: "#4a6080" }}>{l.noData}</p>
        )}
        {!loading && quakes.slice(0, 50).map((q, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "#0a1628", border: `1px solid ${quakeColor(q.mag)}20`, marginBottom: 8 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = quakeColor(q.mag) + "60"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = quakeColor(q.mag) + "20"; }}>
            {/* Magnitude */}
            <div style={{ width: 52, height: 52, borderRadius: 10, background: quakeColor(q.mag) + "20", border: `1px solid ${quakeColor(q.mag)}50`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: quakeColor(q.mag), fontFamily: "monospace" }}>M{q.mag.toFixed(1)}</span>
            </div>
            {/* Info */}
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
            {/* Nível + Hora */}
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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}