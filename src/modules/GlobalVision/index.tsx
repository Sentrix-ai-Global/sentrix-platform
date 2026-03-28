import { useEffect, useRef, useState } from "react";
import { Globe, Loader, Maximize2, Minimize2 } from "lucide-react";
import type { Lang } from "../../types";
import L from "leaflet";
import { fetchGdacsEvents, gdacsColor, type GdacsEvent } from "../../services/mapServices";

const copy: Record<Lang, {
  title: string; subtitle: string; loading: string; expand: string; collapse: string;
  events: string; hint: string;
}> = {
  pt: {
    title: "VISÃO GLOBAL", subtitle: "GDACS — eventos multirisco ONU no mapa",
    loading: "Carregando GDACS…", expand: "TELA CHEIA", collapse: "MINIMIZAR",
    events: "eventos ativos", hint: "Clique num marcador para detalhes (título no popup nativo).",
  },
  en: {
    title: "GLOBAL VISION", subtitle: "GDACS — UN multi-hazard events on the map",
    loading: "Loading GDACS…", expand: "FULL SCREEN", collapse: "MINIMIZE",
    events: "active events", hint: "Click a marker for details.",
  },
  es: {
    title: "VISIÓN GLOBAL", subtitle: "GDACS — eventos multiamenaza ONU",
    loading: "Cargando GDACS…", expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR",
    events: "eventos activos", hint: "Clic en un marcador para detalles.",
  },
  fr: {
    title: "VISION MONDIALE", subtitle: "GDACS — événements multi-risques ONU",
    loading: "Chargement GDACS…", expand: "PLEIN ÉCRAN", collapse: "RÉDUIRE",
    events: "événements actifs", hint: "Cliquez sur un marqueur pour les détails.",
  },
};

export default function GlobalVision({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeRef = useRef(true);
  const [list, setList] = useState<GdacsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected] = useState<GdacsEvent | null>(null);

  useEffect(() => {
    activeRef.current = true;
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
      const map = L.map(mapRef.current, { center: [20, 0], zoom: 2, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM", maxZoom: 19 }).addTo(map);
      mapInstanceRef.current = map;

      setLoading(true);
      fetchGdacsEvents().then(data => {
        if (!activeRef.current) return;
        setList(data);
        setLoading(false);
        const layer = L.featureGroup().addTo(map);
        data.forEach(g => {
          const color = gdacsColor(g.alertLevel);
          const icon = L.divIcon({
            html: `<div style="width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:3px;transform:rotate(45deg);box-shadow:0 0 8px ${color}99"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7], className: "",
          });
          const marker = L.marker([g.lat, g.lon], { icon }).addTo(layer);
          marker.on("click", () => setSelected(g));
        });
        if (data.length) {
          try {
            map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 5 });
          } catch {
            map.setView([data[0].lat, data[0].lon], 4);
          }
        }
      });
    }, 300);

    return () => {
      activeRef.current = false;
      clearTimeout(timer);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #3b82f6, #22c55e)", borderRadius: 2 }} />
          <Globe size={26} color="#3b82f6" />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{t.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 42 }}>{t.subtitle}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#f59e0b", fontSize: 13 }}><Loader size={16} style={{ animation: "spin 1s linear infinite" }} />{t.loading}</span>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 800, color: "#22c55e" }}>{list.length} {t.events}</span>
        )}
        <span style={{ fontSize: 12, color: "#4a6080" }}>{t.hint}</span>
      </div>

      <div style={{ position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : "58vh", minHeight: 300, zIndex: fullscreen ? 9999 : 1, borderRadius: fullscreen ? 0 : 14, overflow: "hidden", border: "1px solid #1a2744" }}>
        <button type="button" onClick={() => setFullscreen(!fullscreen)} style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}{fullscreen ? t.collapse : t.expand}
        </button>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {selected && (
        <div style={{ padding: 16, borderRadius: 12, background: "#0a1628", border: `1px solid ${gdacsColor(selected.alertLevel)}50` }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: "0 0 8px", lineHeight: 1.4 }}>{selected.title}</p>
          <p style={{ fontSize: 12, color: "#4a6080", margin: 0 }}>{selected.type} · {selected.country}</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
