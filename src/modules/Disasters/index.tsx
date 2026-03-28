import { useEffect, useRef } from "react";
import type { Lang, DisasterStatus } from "../../types";
import { statusConfig } from "../../types";
import { T } from "../../i18n/translations";
import L from "leaflet";

const mapTitle: Record<Lang, string> = {
  pt: "Mapa de riscos (visão demo — Grande SP)",
  en: "Risk map (demo — Greater São Paulo)",
  es: "Mapa de riesgos (demo — Gran São Paulo)",
  fr: "Carte des risques (démo — Grand São Paulo)",
};

const center: [number, number] = [-23.55, -46.63];
const offsets: [number, number][] = [
  [-0.05, -0.06], [0.04, -0.04], [-0.03, 0.05], [0.05, 0.03], [-0.04, 0.04], [0.03, -0.07],
];

export default function Disasters({ lang }: { lang: Lang }) {
  const d = T[lang].disasters;
  const statusLabel = { critical: d.critical, alert: d.alert, monitoring: d.monitoring, safe: d.safe };
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
      const dd = T[lang].disasters;
      const slMap = { critical: dd.critical, alert: dd.alert, monitoring: dd.monitoring, safe: dd.safe };
      const map = L.map(mapRef.current, { center, zoom: 10, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM", maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;
      const layer = L.featureGroup().addTo(map);
      const types = dd.types as { name: string; status: string; risk: number; icon?: string }[];
      types.forEach((type, i) => {
        const sc = statusConfig[type.status as DisasterStatus];
        const lat = center[0] + (offsets[i]?.[0] ?? 0);
        const lon = center[1] + (offsets[i]?.[1] ?? 0);
        const circle = L.circleMarker([lat, lon], {
          radius: 8 + (type.risk ?? 50) / 20,
          fillColor: sc.color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.75,
        }).addTo(layer);
        const sl = slMap[type.status as keyof typeof slMap] ?? "";
        circle.bindPopup(`<strong>${type.icon ?? ""} ${type.name}</strong><br/>${sl} · ${type.risk}%`);
      });
      try {
        map.fitBounds(layer.getBounds(), { padding: [28, 28], maxZoom: 11 });
      } catch {
        map.setView(center, 10);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [lang]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #f97316, #ef4444)", borderRadius: 2 }} />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>{d.title}</h1>
        </div>
        <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: 16 }}>{d.subtitle}</p>
      </div>

      <div>
        <p style={{ fontSize: 12, color: "#06b6d4", fontWeight: 800, margin: "0 0 8px", letterSpacing: "0.06em" }}>{mapTitle[lang]}</p>
        <div ref={mapRef} style={{ width: "100%", height: "42vh", minHeight: 260, borderRadius: 14, overflow: "hidden", border: "1px solid #1a2744" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {d.types.map((type: any, i: number) => {
          const sc = statusConfig[type.status as DisasterStatus];
          const sl = statusLabel[type.status as keyof typeof statusLabel];
          return (
            <div key={i}
              style={{ padding: 22, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: `1px solid ${sc.color}30`, transition: "all 0.2s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = sc.color + "60"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = sc.color + "30"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{type.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{type.name}</span>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 900, background: sc.color + "20", color: sc.color, border: `1px solid ${sc.color}40` }}>{sl}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#4a6080", fontWeight: 700, textTransform: "uppercase" }}>{d.riskLevel}</span>
                  <span style={{ fontSize: 14, color: sc.color, fontWeight: 900, fontFamily: "monospace" }}>{type.risk}%</span>
                </div>
                <div style={{ height: 6, background: "#0a1628", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${type.risk}%`, background: `linear-gradient(90deg, ${sc.color}, ${sc.color}99)`, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: sc.color, fontFamily: "monospace" }}>{type.alerts}</span>
                    <span style={{ fontSize: 12, color: "#4a6080", marginLeft: 4 }}>{d.alertsLabel}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#94a3b8", fontFamily: "monospace" }}>{type.areas}</span>
                    <span style={{ fontSize: 12, color: "#4a6080", marginLeft: 4 }}>{d.areasLabel}</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#2a3a54", fontFamily: "monospace" }}>{d.updated} {type.updated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
