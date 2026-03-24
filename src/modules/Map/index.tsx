import { useEffect, useRef, useState } from "react";
import { Search, MapPin, ChevronRight, Loader, AlertTriangle, Navigation, Maximize2, Minimize2, Thermometer, Wind, Droplets, Eye, X, Activity, Flame } from "lucide-react";
import type { Lang } from "../../types";
import L from "leaflet";
import {
  fetchEarthquakes, fetchNasaFires, fetchInpeFires, fetchGdacsEvents,
  fetchFloodData, fetchAirQuality, fetchWeather,
  quakeColor, quakeRadius, airQualityColor, floodColor, gdacsColor, weatherCodes,
  type WeatherData, type FloodFeature, type AirQualityFeature, type GdacsEvent,
} from "../../services/mapServices";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapProps { lang: Lang; }
interface Location { display_name: string; lat: string; lon: string; place_id: number; }

const labels = {
  pt: {
    title: "MAPA INTELIGENTE",
    subtitle: "Meteorologia • Terremotos USGS • Incêndios NASA • INPE • Enchentes • Ar • GDACS ONU",
    placeholder: "Digite país, estado, cidade, rua ou endereço...",
    searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS",
    lat: "Lat", lon: "Lon", noResults: "Nenhum resultado encontrado.",
    expand: "TELA CHEIA", collapse: "MINIMIZAR",
    weatherTitle: "METEOROLOGIA", weatherFull: "DADOS METEOROLÓGICOS EM TEMPO REAL",
    temp: "Temp.", wind: "Vento", humidity: "Umidade", rain: "Chuva",
    loading: "Carregando...", clickHint: "🌐 Clique no mapa para dados ao vivo",
    quakeTitle: "TERREMOTO — USGS", quakeMag: "Magnitude", quakeDepth: "Profundidade", quakeTime: "Horário",
    quakeLayer: "🟠 TERREMOTOS", quakeLoading: "Carregando terremotos...",
    fireTitle: "INCÊNDIO — NASA FIRMS", fireLayer: "🔴 NASA FIRMS",
    fireLoading: "Carregando NASA...", fireBrightness: "Temperatura", fireConfidence: "Confiança",
    inpeTitle: "QUEIMADA — INPE BRASIL", inpeLayer: "🟡 INPE",
    inpeLoading: "Carregando INPE...", inpeMunicipality: "Município", inpeState: "Estado",
    floodTitle: "ENCHENTE — OPEN-METEO", floodDischarge: "Descarga (m³/s)", floodStatus: "Status do Rio",
    airTitle: "QUALIDADE DO AR", airAqi: "Índice AQI", airPm25: "PM2.5 (µg/m³)", airPm10: "PM10 (µg/m³)",
    gdacsTitle: "DESASTRE — GDACS ONU", gdacsLayer: "🔷 GDACS ONU", gdacsLoading: "Carregando ONU...",
    gdacsType: "Tipo", gdacsCountry: "País", gdacsAlert: "Nível ONU", gdacsDate: "Data",
    low: "Baixo", moderate: "Moderado", high: "Alto", extreme: "Extremo", legend: "LEGENDA",
    floodNormal: "Normal", floodAttention: "Atenção", floodCritical: "Crítico",
    airGood: "Boa", airModerate: "Moderada", airPoor: "Ruim", airHazardous: "Perigosa",
    gdacsGreen: "Verde", gdacsOrange: "Laranja", gdacsRed: "Vermelho",
  },
  en: {
    title: "SMART MAP",
    subtitle: "Weather • USGS Earthquakes • NASA Fires • INPE • Floods • Air • GDACS UN",
    placeholder: "Type country, state, city, street or address...",
    searching: "Searching...", search: "SEARCH", results: "RESULTS",
    lat: "Lat", lon: "Lon", noResults: "No results found.",
    expand: "FULL SCREEN", collapse: "MINIMIZE",
    weatherTitle: "WEATHER", weatherFull: "REAL-TIME WEATHER DATA",
    temp: "Temp.", wind: "Wind", humidity: "Humidity", rain: "Rain",
    loading: "Loading...", clickHint: "🌐 Click map for live data",
    quakeTitle: "EARTHQUAKE — USGS", quakeMag: "Magnitude", quakeDepth: "Depth", quakeTime: "Time",
    quakeLayer: "🟠 EARTHQUAKES", quakeLoading: "Loading earthquakes...",
    fireTitle: "FIRE — NASA FIRMS", fireLayer: "🔴 NASA FIRMS",
    fireLoading: "Loading NASA...", fireBrightness: "Temperature", fireConfidence: "Confidence",
    inpeTitle: "FIRE — INPE BRAZIL", inpeLayer: "🟡 INPE",
    inpeLoading: "Loading INPE...", inpeMunicipality: "Municipality", inpeState: "State",
    floodTitle: "FLOOD — OPEN-METEO", floodDischarge: "Discharge (m³/s)", floodStatus: "River Status",
    airTitle: "AIR QUALITY", airAqi: "AQI Index", airPm25: "PM2.5 (µg/m³)", airPm10: "PM10 (µg/m³)",
    gdacsTitle: "DISASTER — GDACS UN", gdacsLayer: "🔷 GDACS UN", gdacsLoading: "Loading UN...",
    gdacsType: "Type", gdacsCountry: "Country", gdacsAlert: "UN Level", gdacsDate: "Date",
    low: "Low", moderate: "Moderate", high: "High", extreme: "Extreme", legend: "LEGEND",
    floodNormal: "Normal", floodAttention: "Attention", floodCritical: "Critical",
    airGood: "Good", airModerate: "Moderate", airPoor: "Poor", airHazardous: "Hazardous",
    gdacsGreen: "Green", gdacsOrange: "Orange", gdacsRed: "Red",
  },
  es: {
    title: "MAPA INTELIGENTE",
    subtitle: "Meteorología • Terremotos USGS • Incendios NASA • INPE • Inundaciones • Aire • GDACS ONU",
    placeholder: "Escriba país, estado, ciudad, calle o dirección...",
    searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS",
    lat: "Lat", lon: "Lon", noResults: "Sin resultados.",
    expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR",
    weatherTitle: "METEOROLOGÍA", weatherFull: "DATOS METEOROLÓGICOS EN TIEMPO REAL",
    temp: "Temp.", wind: "Viento", humidity: "Humedad", rain: "Lluvia",
    loading: "Cargando...", clickHint: "🌐 Clic en el mapa para datos en vivo",
    quakeTitle: "TERREMOTO — USGS", quakeMag: "Magnitud", quakeDepth: "Profundidad", quakeTime: "Hora",
    quakeLayer: "🟠 TERREMOTOS", quakeLoading: "Cargando terremotos...",
    fireTitle: "INCENDIO — NASA FIRMS", fireLayer: "🔴 NASA FIRMS",
    fireLoading: "Cargando NASA...", fireBrightness: "Temperatura", fireConfidence: "Confianza",
    inpeTitle: "INCENDIO — INPE BRASIL", inpeLayer: "🟡 INPE",
    inpeLoading: "Cargando INPE...", inpeMunicipality: "Municipio", inpeState: "Estado",
    floodTitle: "INUNDACIÓN — OPEN-METEO", floodDischarge: "Descarga (m³/s)", floodStatus: "Estado del Río",
    airTitle: "CALIDAD DEL AIRE", airAqi: "Índice AQI", airPm25: "PM2.5 (µg/m³)", airPm10: "PM10 (µg/m³)",
    gdacsTitle: "DESASTRE — GDACS ONU", gdacsLayer: "🔷 GDACS ONU", gdacsLoading: "Cargando ONU...",
    gdacsType: "Tipo", gdacsCountry: "País", gdacsAlert: "Nivel ONU", gdacsDate: "Fecha",
    low: "Bajo", moderate: "Moderado", high: "Alto", extreme: "Extremo", legend: "LEYENDA",
    floodNormal: "Normal", floodAttention: "Atención", floodCritical: "Crítico",
    airGood: "Buena", airModerate: "Moderada", airPoor: "Mala", airHazardous: "Peligrosa",
    gdacsGreen: "Verde", gdacsOrange: "Naranja", gdacsRed: "Rojo",
  },
};

export default function MapModule({ lang }: MapProps) {
  const l = labels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef      = useRef<L.Marker | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const activeRef      = useRef(true);

  const [query, setQuery]                       = useState("");
  const [results, setResults]                   = useState<Location[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [noResults, setNoResults]               = useState(false);
  const [fullscreen, setFullscreen]             = useState(false);
  const [weather, setWeather]                   = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading]     = useState(false);
  const [showWeatherPopup, setShowWeatherPopup] = useState(false);
  const [quake, setQuake]                       = useState<{ mag: number; place: string; time: number; lat: number; lon: number; depth: number } | null>(null);
  const [showQuakePopup, setShowQuakePopup]     = useState(false);
  const [quakeLoading, setQuakeLoading]         = useState(true);
  const [fireLoading, setFireLoading]           = useState(true);
  const [firePop, setFirePop]                   = useState<{ lat: number; lon: number; brightness: number; confidence: string } | null>(null);
  const [showFirePopup, setShowFirePopup]       = useState(false);
  const [inpeLoading, setInpeLoading]           = useState(true);
  const [inpePop, setInpePop]                   = useState<{ lat: number; lon: number; municipio: string; estado: string; bioma: string } | null>(null);
  const [showInpePopup, setShowInpePopup]       = useState(false);
  const [flood, setFlood]                       = useState<FloodFeature | null>(null);
  const [air, setAir]                           = useState<AirQualityFeature | null>(null);
  const [airLoading, setAirLoading]             = useState(false);
  const [gdacsLoading, setGdacsLoading]         = useState(true);
  const [gdacsPop, setGdacsPop]                 = useState<GdacsEvent | null>(null);
  const [showGdacsPopup, setShowGdacsPopup]     = useState(false);

  const closeAllPopups = () => {
    setShowWeatherPopup(false); setShowQuakePopup(false);
    setShowFirePopup(false); setShowInpePopup(false); setShowGdacsPopup(false);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (!activeRef.current) return;
    const map = mapInstanceRef.current;
    if (!map) return;
    if (clickMarkerRef.current) { clickMarkerRef.current.remove(); clickMarkerRef.current = null; }
    const clickIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;background:#06b6d4;border:2px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(6,182,212,0.9)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: "",
    });
    clickMarkerRef.current = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
    let cityName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    try {
      const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const geoData = await geo.json();
      cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || geoData.display_name?.split(",")[0] || cityName;
    } catch (_) {}
    closeAllPopups();
    setShowWeatherPopup(true); setWeatherLoading(true); setWeather(null);
    const w = await fetchWeather(lat, lng, cityName);
    if (activeRef.current) { setWeather(w); setWeatherLoading(false); }
    setAirLoading(true);
    const a = await fetchAirQuality(lat, lng);
    if (activeRef.current) { setAir(a); setAirLoading(false); }
    const f = await fetchFloodData(lat, lng);
    if (activeRef.current) setFlood(f);
  };

  const loadMapLayers = async (map: L.Map) => {
    setQuakeLoading(true);
    const quakes = await fetchEarthquakes();
    if (!activeRef.current) return;
    const qLayer = L.layerGroup().addTo(map);
    quakes.forEach(q => {
      const circle = L.circleMarker([q.lat, q.lon], {
        radius: quakeRadius(q.mag), fillColor: quakeColor(q.mag),
        color: "#fff", weight: 1.5, opacity: 0.9, fillOpacity: 0.75,
      }).addTo(qLayer);
      circle.on("click", (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e); closeAllPopups(); setQuake(q); setShowQuakePopup(true);
      });
    });
    setQuakeLoading(false);

    setFireLoading(true);
    const fires = await fetchNasaFires();
    if (!activeRef.current) return;
    const fLayer = L.layerGroup().addTo(map);
    fires.forEach(f => {
      const circle = L.circleMarker([f.lat, f.lon], {
        radius: 4, fillColor: "#ef4444", color: "#f97316", weight: 1, opacity: 1, fillOpacity: 0.85,
      }).addTo(fLayer);
      circle.on("click", (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e); closeAllPopups(); setFirePop(f); setShowFirePopup(true);
      });
    });
    setFireLoading(false);

    setInpeLoading(true);
    const inpe = await fetchInpeFires();
    if (!activeRef.current) return;
    const iLayer = L.layerGroup().addTo(map);
    inpe.forEach(f => {
      const inpeIcon = L.divIcon({
        html: `<div style="width:10px;height:10px;background:#f59e0b;border:1.5px solid #fff;border-radius:2px;transform:rotate(45deg);box-shadow:0 0 6px rgba(245,158,11,0.8)"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], className: "",
      });
      const marker = L.marker([f.lat, f.lon], { icon: inpeIcon }).addTo(iLayer);
      marker.on("click", (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e); closeAllPopups(); setInpePop(f); setShowInpePopup(true);
      });
    });
    setInpeLoading(false);

    setGdacsLoading(true);
    const gdacs = await fetchGdacsEvents();
    if (!activeRef.current) return;
    const gLayer = L.layerGroup().addTo(map);
    gdacs.forEach(g => {
      const color = gdacsColor(g.alertLevel);
      const gdacsIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:3px;box-shadow:0 0 8px ${color}99;transform:rotate(45deg)"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7], className: "",
      });
      const marker = L.marker([g.lat, g.lon], { icon: gdacsIcon }).addTo(gLayer);
      marker.on("click", (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e); closeAllPopups(); setGdacsPop(g); setShowGdacsPopup(true);
      });
    });
    setGdacsLoading(false);
  };

  useEffect(() => {
    activeRef.current = true;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { center: [0, 0], zoom: 2, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      map.on("click", (e: L.LeafletMouseEvent) => handleMapClick(e.latlng.lat, e.latlng.lng));
      mapInstanceRef.current = map;
      loadMapLayers(map);
    }, 200);

    return () => {
      activeRef.current = false;
      clearTimeout(timer);
      // ✅ NÃO chamamos map.remove() — o Leaflet não suporta ser destruído e recriado
    };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setResults([]); setNoResults(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`,
        { headers: { "Accept-Language": lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en" } }
      );
      const data = await res.json();
      if (data.length === 0) setNoResults(true);
      setResults(data);
    } catch { setNoResults(true); }
    setLoading(false);
  };

  const selectLocation = (loc: Location) => {
    const lat = parseFloat(loc.lat), lon = parseFloat(loc.lon);
    const map = mapInstanceRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.remove();
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<strong>${loc.display_name.split(",")[0]}</strong>`).openPopup();
    markerRef.current = marker;
    map.flyTo([lat, lon], 10, { animate: true, duration: 1.5 });
    setResults([]); setQuery(loc.display_name.split(",")[0]);
    handleMapClick(lat, lon);
  };

  const wInfo     = weather ? (weatherCodes[weather.weathercode] || { label: "—", icon: "🌡️" }) : null;
  const tempColor = weather ? (weather.temperature > 35 ? "#ef4444" : weather.temperature > 25 ? "#f59e0b" : weather.temperature < 5 ? "#3b82f6" : "#22c55e") : "#06b6d4";
  const quakeMagLabel    = (mag: number) => mag >= 7 ? l.extreme : mag >= 5 ? l.high : mag >= 3 ? l.moderate : l.low;
  const floodStatusLabel = (lv: FloodFeature["level"]) => lv === "critical" ? l.floodCritical : lv === "attention" ? l.floodAttention : l.floodNormal;
  const airLevelLabel    = (lv: AirQualityFeature["level"]) => lv === "hazardous" ? l.airHazardous : lv === "poor" ? l.airPoor : lv === "moderate" ? l.airModerate : l.airGood;
  const gdacsAlertLabel  = (lv: GdacsEvent["alertLevel"]) => lv === "red" ? l.gdacsRed : lv === "orange" ? l.gdacsOrange : l.gdacsGreen;

  const popupBase: React.CSSProperties = {
    position: "absolute", bottom: 16, left: 16, zIndex: 999,
    width: "min(280px, calc(100vw - 32px))",
    background: "rgba(6,14,34,0.97)", borderRadius: 14, padding: 16,
    backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    animation: "slideIn 0.3s ease",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
          <h1 style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 900, color: "#fff", margin: 0 }}>{l.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 16 }}>{l.subtitle}</p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={15} color="#4a6080" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder={l.placeholder}
            style={{ width: "100%", padding: "12px 12px 12px 38px", borderRadius: 10, background: "#0a1628", border: "1px solid #1a2744", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={search} disabled={loading}
          style={{ padding: "12px 20px", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #f97316)", border: "none", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}>
          {loading ? <Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Navigation size={15} />}
          {loading ? l.searching : l.search}
        </button>
      </div>

      {noResults && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={15} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#ef4444" }}>{l.noResults}</span>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ borderRadius: 12, background: "#0a1628", border: "1px solid #1a2744", overflow: "hidden" }}>
          <p style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 14px", borderBottom: "1px solid #1a2744", margin: 0, fontWeight: 700 }}>{results.length} {l.results}</p>
          {results.map((loc, i) => (
            <button key={i} onClick={() => selectLocation(loc)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", width: "100%", background: "transparent", border: "none", borderBottom: i < results.length - 1 ? "1px solid #1a2744" : "none", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <MapPin size={13} color="#06b6d4" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loc.display_name.split(",")[0]}</p>
                <p style={{ fontSize: 11, color: "#4a6080", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loc.display_name}</p>
              </div>
              <ChevronRight size={13} color="#4a6080" />
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#4a6080", flex: 1, minWidth: 100 }}>{l.clickHint}</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {quakeLoading ? <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> {l.quakeLoading}</span> : <span style={{ fontSize: 11, color: "#f97316", fontWeight: 700 }}>{l.quakeLayer}</span>}
          {fireLoading  ? <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> {l.fireLoading}</span>  : <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>{l.fireLayer}</span>}
          {inpeLoading  ? <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> {l.inpeLoading}</span>  : <span style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700 }}>{l.inpeLayer}</span>}
          {gdacsLoading ? <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> {l.gdacsLoading}</span> : <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700 }}>{l.gdacsLayer}</span>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, padding: "10px 14px", borderRadius: 10, background: "#0a1628", border: "1px solid #1a2744", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#4a6080", fontWeight: 700, textTransform: "uppercase" }}>{l.legend}:</span>
        <span style={{ fontSize: 11, color: "#22c55e" }}>🟢 M1-3</span>
        <span style={{ fontSize: 11, color: "#f59e0b" }}>🟡 M3-5</span>
        <span style={{ fontSize: 11, color: "#f97316" }}>🟠 M5-7</span>
        <span style={{ fontSize: 11, color: "#ef4444" }}>🔴 M7+/NASA</span>
        <span style={{ fontSize: 11, color: "#f59e0b" }}>🔷 INPE</span>
        <span style={{ fontSize: 11, color: "#22c55e" }}>🔷 GDACS Verde</span>
        <span style={{ fontSize: 11, color: "#f97316" }}>🔷 GDACS Laranja</span>
        <span style={{ fontSize: 11, color: "#ef4444" }}>🔷 GDACS Vermelho</span>
      </div>

      <div style={{ position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : "62vh", zIndex: fullscreen ? 9999 : 1, borderRadius: fullscreen ? 0 : 14, overflow: "hidden", border: "1px solid #1a2744" }}>
        <button onClick={() => setFullscreen(!fullscreen)}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {fullscreen ? l.collapse : l.expand}
        </button>

        {showWeatherPopup && (
          <div style={{ ...popupBase, border: "1px solid rgba(6,182,212,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{wInfo?.icon || "🌡️"}</span>
                <div>
                  <p style={{ fontSize: 12, color: "#06b6d4", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>{l.weatherTitle}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{wInfo?.label || "—"}</p>
                </div>
              </div>
              <button onClick={() => setShowWeatherPopup(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 6px", display: "flex" }}><X size={14} /></button>
            </div>
            {weather && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1a2744" }}><MapPin size={12} color="#06b6d4" /><span style={{ fontSize: 13, color: "#fff", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{weather.city}</span></div>}
            {weatherLoading && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Loader size={15} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 13, color: "#4a6080" }}>{l.loading}</span></div>}
            {weather && !weatherLoading && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { icon: Thermometer, label: l.temp,     value: `${weather.temperature}°C`,   color: tempColor },
                  { icon: Wind,        label: l.wind,     value: `${weather.windspeed} km/h`,  color: "#8b5cf6" },
                  { icon: Droplets,    label: l.humidity, value: `${weather.humidity}%`,       color: "#06b6d4" },
                  { icon: Eye,         label: l.rain,     value: `${weather.precipitation}mm`, color: weather.precipitation > 5 ? "#ef4444" : "#22c55e" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${color}20` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Icon size={12} color={color} /><span style={{ fontSize: 10, color: "#4a6080", textTransform: "uppercase" }}>{label}</span></div>
                    <p style={{ fontSize: 18, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            )}
            {air && !airLoading && (
              <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${airQualityColor(air.level)}30` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#4a6080", textTransform: "uppercase" }}>{l.airTitle}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: airQualityColor(air.level) }}>{airLevelLabel(air.level)}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>AQI <strong style={{ color: airQualityColor(air.level) }}>{air.aqi}</strong></span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>PM2.5 <strong style={{ color: "#fff" }}>{air.pm25.toFixed(1)}</strong></span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>PM10 <strong style={{ color: "#fff" }}>{air.pm10.toFixed(1)}</strong></span>
                </div>
              </div>
            )}
            {flood && (
              <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${floodColor(flood.level)}30` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 10, color: "#4a6080", textTransform: "uppercase" }}>{l.floodTitle}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: floodColor(flood.level) }}>{floodStatusLabel(flood.level)}</span>
                </div>
                <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
                  {l.floodDischarge}: <strong style={{ color: floodColor(flood.level) }}>{flood.discharge.toFixed(0)} m³/s</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {showQuakePopup && quake && (
          <div style={{ ...popupBase, border: `1px solid ${quakeColor(quake.mag)}70` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🌍</span>
                <div>
                  <p style={{ fontSize: 12, color: quakeColor(quake.mag), fontWeight: 900, textTransform: "uppercase", margin: 0 }}>{l.quakeTitle}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{quakeMagLabel(quake.mag)}</p>
                </div>
              </div>
              <button onClick={() => setShowQuakePopup(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 6px", display: "flex" }}><X size={14} /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1a2744" }}>
              <MapPin size={12} color={quakeColor(quake.mag)} />
              <span style={{ fontSize: 13, color: "#fff", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quake.place}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${quakeColor(quake.mag)}30` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Activity size={12} color={quakeColor(quake.mag)} /><span style={{ fontSize: 10, color: "#4a6080", textTransform: "uppercase" }}>{l.quakeMag}</span></div>
                <p style={{ fontSize: 22, fontWeight: 900, color: quakeColor(quake.mag), fontFamily: "monospace", margin: 0 }}>M {quake.mag.toFixed(1)}</p>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Activity size={12} color="#8b5cf6" /><span style={{ fontSize: 10, color: "#4a6080", textTransform: "uppercase" }}>{l.quakeDepth}</span></div>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#8b5cf6", fontFamily: "monospace", margin: 0 }}>{quake.depth.toFixed(0)}km</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #1a2744" }}>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{quake.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{quake.lon.toFixed(3)}</p></div>
              <div style={{ marginLeft: "auto" }}><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.quakeTime}</p><p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{new Date(quake.time).toLocaleTimeString()}</p></div>
            </div>
          </div>
        )}

        {showFirePopup && firePop && (
          <div style={{ ...popupBase, border: "1px solid rgba(239,68,68,0.6)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <div>
                  <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>{l.fireTitle}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>VIIRS SNPP — NASA</p>
                </div>
              </div>
              <button onClick={() => setShowFirePopup(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 6px", display: "flex" }}><X size={14} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(239,68,68,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Flame size={12} color="#ef4444" /><span style={{ fontSize: 10, color: "#4a6080", textTransform: "uppercase" }}>{l.fireBrightness}</span></div>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#ef4444", fontFamily: "monospace", margin: 0 }}>{firePop.brightness.toFixed(0)}K</p>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Activity size={12} color="#f59e0b" /><span style={{ fontSize: 10, color: "#4a6080", textTransform: "uppercase" }}>{l.fireConfidence}</span></div>
                <p style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", fontFamily: "monospace", margin: 0 }}>{firePop.confidence}%</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #1a2744" }}>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{firePop.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{firePop.lon.toFixed(3)}</p></div>
            </div>
          </div>
        )}

        {showInpePopup && inpePop && (
          <div style={{ ...popupBase, border: "1px solid rgba(245,158,11,0.6)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔥</span>
                <div>
                  <p style={{ fontSize: 12, color: "#f59e0b", fontWeight: 900, textTransform: "uppercase", margin: 0 }}>{l.inpeTitle}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>BDQueimadas — INPE</p>
                </div>
              </div>
              <button onClick={() => setShowInpePopup(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 6px", display: "flex" }}><X size={14} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.inpeMunicipality}</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>{inpePop.municipio}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.inpeState}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", margin: 0 }}>{inpePop.estado}</p>
                </div>
                <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>Bioma</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#f59e0b", margin: 0 }}>{inpePop.bioma}</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #1a2744" }}>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{inpePop.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{inpePop.lon.toFixed(3)}</p></div>
            </div>
          </div>
        )}

        {showGdacsPopup && gdacsPop && (
          <div style={{ ...popupBase, border: `1px solid ${gdacsColor(gdacsPop.alertLevel)}70` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🌐</span>
                <div>
                  <p style={{ fontSize: 12, color: gdacsColor(gdacsPop.alertLevel), fontWeight: 900, textTransform: "uppercase", margin: 0 }}>{l.gdacsTitle}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>GDACS — United Nations</p>
                </div>
              </div>
              <button onClick={() => setShowGdacsPopup(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 6px", display: "flex" }}><X size={14} /></button>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${gdacsColor(gdacsPop.alertLevel)}30`, marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.4 }}>{gdacsPop.title}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: `1px solid ${gdacsColor(gdacsPop.alertLevel)}30` }}>
                <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.gdacsAlert}</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: gdacsColor(gdacsPop.alertLevel), margin: 0 }}>{gdacsAlertLabel(gdacsPop.alertLevel)}</p>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.gdacsType}</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: "#8b5cf6", margin: 0 }}>{gdacsPop.type}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <MapPin size={12} color="#4a6080" />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{gdacsPop.country}</span>
            </div>
            <div style={{ display: "flex", gap: 16, paddingTop: 12, borderTop: "1px solid #1a2744" }}>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{gdacsPop.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{gdacsPop.lon.toFixed(3)}</p></div>
              <div style={{ marginLeft: "auto" }}><p style={{ fontSize: 10, color: "#2a3a54", margin: 0 }}>{l.gdacsDate}</p><p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{new Date(gdacsPop.date).toLocaleDateString()}</p></div>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {(weatherLoading || weather) && (
        <div style={{ padding: "16px 18px", borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid rgba(6,182,212,0.3)", animation: "slideIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ width: 4, height: 22, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
            <span style={{ fontSize: 12, color: "#06b6d4", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l.weatherFull}</span>
            {wInfo && <span style={{ fontSize: 18 }}>{wInfo.icon}</span>}
            {wInfo && <span style={{ fontSize: 12, color: "#94a3b8" }}>{wInfo.label}</span>}
            {weather && <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lat}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{weather.lat.toFixed(4)}</p></div>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0 }}>{l.lon}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{weather.lon.toFixed(4)}</p></div>
            </div>}
          </div>
          {weather && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><MapPin size={13} color="#06b6d4" /><span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{weather.city}</span></div>}
          {weatherLoading && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Loader size={16} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 13, color: "#4a6080" }}>{l.loading}</span></div>}
          {weather && !weatherLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              {[
                { icon: Thermometer, label: l.temp,     value: `${weather.temperature}°C`,   color: tempColor,   sub: weather.temperature > 35 ? "🔴 Extremo" : weather.temperature > 25 ? "🟡 Quente" : weather.temperature < 5 ? "🔵 Frio" : "🟢 Agradável" },
                { icon: Wind,        label: l.wind,     value: `${weather.windspeed} km/h`,  color: "#8b5cf6",   sub: weather.windspeed > 50 ? "🔴 Forte" : weather.windspeed > 20 ? "🟡 Moderado" : "🟢 Fraco" },
                { icon: Droplets,    label: l.humidity, value: `${weather.humidity}%`,       color: "#06b6d4",   sub: weather.humidity > 80 ? "🔵 Alta" : weather.humidity > 50 ? "🟡 Moderada" : "🟠 Baixa" },
                { icon: Eye,         label: l.rain,     value: `${weather.precipitation}mm`, color: weather.precipitation > 10 ? "#ef4444" : "#22c55e", sub: weather.precipitation > 10 ? "🔴 Intensa" : weather.precipitation > 0 ? "🟡 Leve" : "🟢 Sem chuva" },
              ].map(({ icon: Icon, label, value, color, sub }) => (
                <div key={label} style={{ padding: "12px 14px", borderRadius: 10, background: "#060e22", border: `1px solid ${color}25` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color + "60"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = color + "25"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><Icon size={13} color={color} /><span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span></div>
                  <p style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "monospace", margin: "0 0 4px" }}>{value}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{sub}</p>
                </div>
              ))}
            </div>
          )}
          {air && !airLoading && (
            <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 10, background: "#060e22", border: `1px solid ${airQualityColor(air.level)}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Wind size={13} color={airQualityColor(air.level)} />
                <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l.airTitle}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: airQualityColor(air.level) }}>{airLevelLabel(air.level)}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: l.airAqi,  value: air.aqi.toString(),  color: airQualityColor(air.level) },
                  { label: l.airPm25, value: air.pm25.toFixed(1), color: "#06b6d4" },
                  { label: l.airPm10, value: air.pm10.toFixed(1), color: "#8b5cf6" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${color}20` }}>
                    <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{label}</p>
                    <p style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {flood && (
            <div style={{ marginTop: 10, padding: "14px 16px", borderRadius: 10, background: "#060e22", border: `1px solid ${floodColor(flood.level)}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Droplets size={13} color={floodColor(flood.level)} />
                <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l.floodTitle}</span>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: floodColor(flood.level) }}>{floodStatusLabel(flood.level)}</span>
              </div>
              <p style={{ fontSize: 10, color: "#4a6080", margin: "0 0 4px", textTransform: "uppercase" }}>{l.floodDischarge}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: floodColor(flood.level), fontFamily: "monospace", margin: 0 }}>{flood.discharge.toFixed(0)} m³/s</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #4a6080; }
        .leaflet-container { background: #050d1f !important; font-family: Arial, sans-serif; }
        .leaflet-tile { filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-control-attribution { background: rgba(6,14,34,0.9) !important; color: #4a6080 !important; font-size: 10px; }
        .leaflet-control-attribution a { color: #06b6d4 !important; }
        .leaflet-control-zoom a { background: #0a1628 !important; color: #fff !important; border-color: #1a2744 !important; }
        .leaflet-popup-content-wrapper { background: #0a1628 !important; color: #fff !important; border: 1px solid #1a2744 !important; border-radius: 10px !important; }
        .leaflet-popup-tip { background: #0a1628 !important; }
      `}</style>
    </div>
  );
}