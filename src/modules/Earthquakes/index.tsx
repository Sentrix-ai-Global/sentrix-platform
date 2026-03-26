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
    legend: "LEGENDA", clickMap: "Clique num marcador para ver detalhes",
  },
  en: {
    title: "REAL-TIME EARTHQUAKES", subtitle: "USGS Data • Last 7 days • Global",
    loading: "Loading USGS data...", noData: "No earthquakes recorded.",
    mag: "Magnitude", depth: "Depth", location: "Location", time: "Time",
    total: "Total events", strong: "Strong (M5+)", major: "Major (M7+)",
    low: "Low", moderate: "Moderate", high: "High", extreme: "Extreme",
    recent: "RECENT EVENTS", km: "km depth", expand: "FULL SCREEN", collapse: "MINIMIZE",
    legend: "LEGEND", clickMap: "Click a marker to see details",
  },
  es: {
    title: "TERREMOTOS EN TIEMPO REAL", subtitle: "Datos USGS • Últimos 7 días • Global",
    loading: "Cargando datos USGS...", noData: "Sin terremotos registrados.",
    mag: "Magnitud", depth: "Profundidad", location: "Lugar", time: "Hora",
    total: "Total de eventos", strong: "Fuertes (M5+)", major: "Mayores (M7+)",
    low: "Bajo", moderate: "Moderado", high: "Alto", extreme: "Extremo",
    recent: "EVENTOS RECIENTES", km: "km prof.", expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR",
    legend: "LEYENDA", clickMap: "Clic en un marcador para ver detalles",
  },
};

export default function Earthquakes({ lang }: Props) {
  const l = labels[lang];
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeRef = useRef(true);

  const [quakes, setQuakes] = useState<{ lat: number; lon: number; mag: number; place: string; time: number; depth: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const magLabel = (mag: number) => mag >= 7 ? l.extreme : mag >= 5 ? l.high : mag >= 3 ? l.moderate : l.low;

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

    let map: L.Map | null = null;
    let layer: L.LayerGroup | null = null;

    const init = setTimeout(() => {
      if (!mapRef.current) return;

      map = L.map(mapRef.current, { center: [20, 0], zoom: 2 });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      loadData();
    }, 200);

    async function loadData() {
      setLoading(true);
      const data = await fetchEarthquakes();
      if (!activeRef.current || !map) return;

      const sorted = [...data].sort((a, b) => b.time - a.time);
      setQuakes(sorted);
      setLoading(false);

      if (layer) layer.clearLayers();
      layer = L.layerGroup().addTo(map);

      sorted.forEach(q => {
        const circle = L.circleMarker([q.lat, q.lon], {
          radius: quakeRadius(q.mag),
          fillColor: quakeColor(q.mag),
          color: "#fff",
          weight: 1.5,
          fillOpacity: 0.8,
        }).addTo(layer!);

        circle.on("click", () => setSelected(q));
      });
    }

    const interval = setInterval(loadData, 60000);

    return () => {
      activeRef.current = false;
      clearTimeout(init);
      clearInterval(interval);
      if (layer) layer.clearLayers();
      if (map) map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const total = quakes.length;
  const strong = quakes.filter(q => q.mag >= 5).length;
  const major = quakes.filter(q => q.mag >= 7).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ color: "#fff" }}>{l.title}</h1>
        <p style={{ color: "#4a6080" }}>{l.subtitle}</p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <div>{l.total}: {loading ? "-" : total}</div>
        <div>{l.strong}: {loading ? "-" : strong}</div>
        <div>{l.major}: {loading ? "-" : major}</div>
      </div>

      <div style={{ position: "relative", height: fullscreen ? "100vh" : "60vh" }}>
        <button onClick={() => setFullscreen(!fullscreen)}>
          {fullscreen ? l.collapse : l.expand}
        </button>

        {selected && (
          <div>
            M {selected.mag} - {selected.place}
          </div>
        )}

        {loading && <div>{l.loading}</div>}

        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}