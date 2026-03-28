import { useEffect, useRef, useState } from "react";
import { Building2, Activity, Droplets, Zap, Cloud, Maximize2, Minimize2 } from "lucide-react";
import type { Lang } from "../../types";
import L from "leaflet";

const copy: Record<Lang, {
  title: string; subtitle: string; traffic: string; water: string; power: string; urbanWx: string;
  sensors: string; expand: string; collapse: string; demo: string;
}> = {
  pt: {
    title: "MONITORAMENTO URBANO", subtitle: "Demo São Paulo • Sensores simulados • Dados abertos",
    traffic: "Fluxo viário", water: "Águas pluviais", power: "Rede elétrica", urbanWx: "Microclima",
    sensors: "PONTOS ATIVOS", expand: "TELA CHEIA", collapse: "MINIMIZAR", demo: "MVP — integração com APIs municipais na próxima fase",
  },
  en: {
    title: "URBAN MONITORING", subtitle: "São Paulo demo • Simulated sensors • Open data",
    traffic: "Traffic flow", water: "Stormwater", power: "Power grid", urbanWx: "Microclimate",
    sensors: "ACTIVE POINTS", expand: "FULL SCREEN", collapse: "MINIMIZE", demo: "MVP — municipal API integration next phase",
  },
  es: {
    title: "MONITOREO URBANO", subtitle: "Demo São Paulo • Sensores simulados • Datos abiertos",
    traffic: "Flujo vial", water: "Aguas pluviales", power: "Red eléctrica", urbanWx: "Microclima",
    sensors: "PUNTOS ACTIVOS", expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR", demo: "MVP — integración APIs municipales en siguiente fase",
  },
  fr: {
    title: "SURVEILLANCE URBAINE", subtitle: "Démo São Paulo • Capteurs simulés • Données ouvertes",
    traffic: "Trafic", water: "Eaux pluviales", power: "Réseau électrique", urbanWx: "Microclimat",
    sensors: "POINTS ACTIFS", expand: "PLEIN ÉCRAN", collapse: "RÉDUIRE", demo: "MVP — intégration APIs municipales phase suivante",
  },
};

const sensorPoints: { lat: number; lon: number; kind: "traffic" | "water" | "power" | "wx" }[] = [
  { lat: -23.5505, lon: -46.6333, kind: "traffic" },
  { lat: -23.56, lon: -46.62, kind: "water" },
  { lat: -23.54, lon: -46.65, kind: "power" },
  { lat: -23.565, lon: -46.64, kind: "wx" },
];

export default function Urban({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

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
      const map = L.map(mapRef.current, { center: [-23.55, -46.633], zoom: 11, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM", maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;
      const colors = { traffic: "#f97316", water: "#06b6d4", power: "#eab308", wx: "#8b5cf6" };
      sensorPoints.forEach(p => {
        const icon = L.divIcon({
          html: `<div style="width:12px;height:12px;background:${colors[p.kind]};border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px ${colors[p.kind]}"></div>`,
          iconSize: [12, 12], iconAnchor: [6, 6], className: "",
        });
        L.marker([p.lat, p.lon], { icon }).addTo(map);
      });
    }, 300);
    return () => {
      clearTimeout(timer);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const kpi = [
    { icon: Activity, label: t.traffic, v: 78, color: "#f97316" },
    { icon: Droplets, label: t.water, v: 62, color: "#06b6d4" },
    { icon: Zap, label: t.power, v: 91, color: "#eab308" },
    { icon: Cloud, label: t.urbanWx, v: 55, color: "#8b5cf6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
          <Building2 size={28} color="#06b6d4" style={{ flexShrink: 0 }} />
          <h1 style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 900, color: "#fff", margin: 0 }}>{t.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 44 }}>{t.subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {kpi.map(({ icon: Icon, label, v, color }) => (
          <div key={label} style={{ padding: 16, borderRadius: 12, background: "#0a1628", border: `1px solid ${color}35` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Icon size={14} color={color} /><span style={{ fontSize: 11, color: "#4a6080", fontWeight: 700 }}>{label}</span></div>
            <p style={{ fontSize: 22, fontWeight: 900, color, margin: 0, fontFamily: "monospace" }}>{v}%</p>
          </div>
        ))}
      </div>

      <div style={{ position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : "50vh", minHeight: 320, zIndex: fullscreen ? 9999 : 1, borderRadius: fullscreen ? 0 : 14, overflow: "hidden", border: "1px solid #1a2744" }}>
        <button type="button" onClick={() => setFullscreen(!fullscreen)} style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}{fullscreen ? t.collapse : t.expand}
        </button>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <p style={{ fontSize: 12, color: "#4a6080", margin: 0 }}><span style={{ color: "#06b6d4", fontWeight: 700 }}>{t.sensors}</span> · {sensorPoints.length} · {t.demo}</p>
    </div>
  );
}
