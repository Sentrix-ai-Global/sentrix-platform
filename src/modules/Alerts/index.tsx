import { useEffect, useRef } from "react";
import { CheckCircle, Clock, Users, MapPin, Send } from "lucide-react";
import type { Lang, RiskLevel } from "../../types";
import { levelConfig } from "../../types";
import { translationsBundle } from "../../i18n/translations";
import L from "leaflet";

const alertsMapHint: Record<Lang, string> = {
  pt: "Mapa de alertas ativos (região ilustrativa)",
  en: "Active alerts map (illustrative regions)",
  es: "Mapa de alertas activos (regiones ilustrativas)",
  fr: "Carte des alertes actives (régions illustratives)",
};

const alertCoords: [number, number][] = [
  [-23.64, -46.67], [-23.54, -46.64], [-23.52, -46.43], [-23.58, -46.69], [-23.50, -46.60],
];

interface AlertsProps { lang: Lang; }

export default function AlertSystem({ lang }: AlertsProps) {
  const al = translationsBundle(lang).alertSystem;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
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
      const alerts = translationsBundle(lang).alertSystem.alerts as { title: string; level: string; region: string; status: string }[];
      const map = L.map(mapRef.current, { center: [-23.55, -46.63], zoom: 10, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM", maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;
      const layer = L.featureGroup().addTo(map);
      alerts.forEach((alert, i) => {
        const coord = alertCoords[i] ?? alertCoords[0];
        const cfg = levelConfig[alert.level as RiskLevel];
        const m = L.circleMarker(coord, {
          radius: 11,
          fillColor: cfg.color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(layer);
        m.bindPopup(`<strong>${alert.title}</strong><br/>${alert.region}<br/>${alert.status}`);
      });
      try {
        map.fitBounds(layer.getBounds(), { padding: [24, 24], maxZoom: 11 });
      } catch {
        map.setView([-23.55, -46.63], 10);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [lang]);

  const statsCards = [
    { label: al.sent,    value: "3",     color: "#22c55e", icon: CheckCircle },
    { label: al.pending, value: "2",     color: "#f59e0b", icon: Clock       },
    { label: al.reach,   value: "47.5M", color: "#06b6d4", icon: Users       },
    { label: al.regions, value: "12",    color: "#8b5cf6", icon: MapPin      },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #ef4444, #f97316)", borderRadius: 2 }} />
          <h1 style={{ fontSize: "clamp(16px, 4vw, 24px)", fontWeight: 900, color: "#fff", margin: 0 }}>{al.title}</h1>
        </div>
        <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: 16 }}>{al.subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
        {statsCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label}
            style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", transition: "all 0.2s", cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ padding: 10, borderRadius: 10, background: color + "15", border: `1px solid ${color}25`, display: "inline-flex", marginBottom: 12 }}>
              <Icon size={16} color={color} />
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
            <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8 }}>{label}</p>
          </div>
        ))}
      </div>

      <button
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "14px 24px", borderRadius: 12, background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", color: "white", fontSize: 14, fontWeight: 900, cursor: "pointer", letterSpacing: "0.08em", transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(239,68,68,0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <Send size={18} />
        {al.newAlert}
      </button>

      <div>
        <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 800, margin: "0 0 8px", letterSpacing: "0.06em" }}>{alertsMapHint[lang]}</p>
        <div ref={mapRef} style={{ width: "100%", height: "38vh", minHeight: 240, borderRadius: 14, overflow: "hidden", border: "1px solid #1a2744" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {al.alerts.map((alert: any, i: number) => {
          const cfg = levelConfig[alert.level as RiskLevel];
          return (
            <div key={i} style={{ padding: 22, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: `1px solid ${cfg.border}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: cfg.color, borderRadius: "14px 0 0 14px" }} />
              <div style={{ paddingLeft: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{alert.title}</span>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 900, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, flexShrink: 0 }}>
                        {al[alert.level as "high" | "medium" | "low"]}
                      </span>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0,
                        background: alert.status === "sent" ? "rgba(34,197,94,0.1)" : alert.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(139,92,246,0.1)",
                        color: alert.status === "sent" ? "#22c55e" : alert.status === "pending" ? "#f59e0b" : "#8b5cf6",
                        border: `1px solid ${alert.status === "sent" ? "rgba(34,197,94,0.3)" : alert.status === "pending" ? "rgba(245,158,11,0.3)" : "rgba(139,92,246,0.3)"}`
                      }}>
                        {al[`${alert.status}_label` as keyof typeof al] as string}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{alert.message}</p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={12} color="#4a6080" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#4a6080" }}>{alert.region}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={12} color="#4a6080" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#4a6080" }}>{alert.reach.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {alert.channels.map((ch: string, j: number) => (
                      <span key={j} style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", color: "#6a8099" }}>{ch}</span>
                    ))}
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#2a3a54", fontFamily: "monospace" }}>{alert.time}</span>
                </div>

                {alert.status === "pending" && (
                  <button
                    style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 8, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                  >
                    <Send size={13} /> {al.sendNow}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}