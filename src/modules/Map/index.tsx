import { useEffect, useRef, useState } from "react";
import { Search, MapPin, ChevronRight, Loader, AlertTriangle, Navigation, Maximize2, Minimize2, Thermometer, Wind, Droplets, Eye, X, Activity } from "lucide-react";
import type { Lang } from "../../types";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapProps { lang: Lang; }
interface Location { display_name: string; lat: string; lon: string; place_id: number; }
interface Weather { temperature: number; windspeed: number; humidity: number; precipitation: number; weathercode: number; city: string; lat: number; lon: number; }
interface Quake { mag: number; place: string; time: number; lat: number; lon: number; depth: number; }

const labels = {
  pt: {
    title: "MAPA INTELIGENTE", subtitle: "Busca precisa • Meteorologia • Terremotos em tempo real",
    placeholder: "Digite país, estado, cidade, rua ou endereço...",
    searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS",
    lat: "Lat", lon: "Lon", noResults: "Nenhum resultado. Tente ser mais específico.",
    expand: "TELA CHEIA", collapse: "MINIMIZAR",
    weatherTitle: "METEOROLOGIA", weatherFull: "DADOS METEOROLÓGICOS EM TEMPO REAL",
    temp: "Temp.", wind: "Vento", humidity: "Umidade", rain: "Chuva",
    loading: "Carregando...", clickHint: "🌍 Clique no mapa para meteorologia • 🔴 Círculos = terremotos em tempo real",
    quakeTitle: "TERREMOTO DETECTADO", quakeMag: "Magnitude", quakeDepth: "Profundidade",
    quakeTime: "Horário", quakePlace: "Local", quakeLayer: "🔴 TERREMOTOS AO VIVO",
    quakeLoading: "Carregando terremotos...",
    low: "Baixo", moderate: "Moderado", high: "Alto", extreme: "Extremo",
  },
  en: {
    title: "SMART MAP", subtitle: "Precise search • Weather • Real-time earthquakes",
    placeholder: "Type country, state, city, street or address...",
    searching: "Searching...", search: "SEARCH", results: "RESULTS",
    lat: "Lat", lon: "Lon", noResults: "No results. Try to be more specific.",
    expand: "FULL SCREEN", collapse: "MINIMIZE",
    weatherTitle: "WEATHER", weatherFull: "REAL-TIME WEATHER DATA",
    temp: "Temp.", wind: "Wind", humidity: "Humidity", rain: "Rain",
    loading: "Loading...", clickHint: "🌍 Click map for weather • 🔴 Circles = real-time earthquakes",
    quakeTitle: "EARTHQUAKE DETECTED", quakeMag: "Magnitude", quakeDepth: "Depth",
    quakeTime: "Time", quakePlace: "Location", quakeLayer: "🔴 LIVE EARTHQUAKES",
    quakeLoading: "Loading earthquakes...",
    low: "Low", moderate: "Moderate", high: "High", extreme: "Extreme",
  },
  es: {
    title: "MAPA INTELIGENTE", subtitle: "Búsqueda precisa • Meteorología • Terremotos en tiempo real",
    placeholder: "Escriba país, estado, ciudad, calle o dirección...",
    searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS",
    lat: "Lat", lon: "Lon", noResults: "Sin resultados. Intente ser más específico.",
    expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR",
    weatherTitle: "METEOROLOGÍA", weatherFull: "DATOS METEOROLÓGICOS EN TIEMPO REAL",
    temp: "Temp.", wind: "Viento", humidity: "Humedad", rain: "Lluvia",
    loading: "Cargando...", clickHint: "🌍 Clic en el mapa para meteorología • 🔴 Círculos = terremotos en tiempo real",
    quakeTitle: "TERREMOTO DETECTADO", quakeMag: "Magnitud", quakeDepth: "Profundidad",
    quakeTime: "Hora", quakePlace: "Lugar", quakeLayer: "🔴 TERREMOTOS EN VIVO",
    quakeLoading: "Cargando terremotos...",
    low: "Bajo", moderate: "Moderado", high: "Alto", extreme: "Extremo",
  },
};

const weatherCodes: Record<number, { label: string; icon: string }> = {
  0: { label: "Céu limpo", icon: "☀️" }, 1: { label: "Predominante limpo", icon: "🌤️" },
  2: { label: "Parcialmente nublado", icon: "⛅" }, 3: { label: "Nublado", icon: "☁️" },
  45: { label: "Neblina", icon: "🌫️" }, 51: { label: "Garoa leve", icon: "🌦️" },
  61: { label: "Chuva leve", icon: "🌧️" }, 63: { label: "Chuva moderada", icon: "🌧️" },
  65: { label: "Chuva intensa", icon: "🌧️" }, 71: { label: "Neve leve", icon: "🌨️" },
  80: { label: "Pancadas de chuva", icon: "⛈️" }, 95: { label: "Tempestade", icon: "⛈️" },
  99: { label: "Tempestade severa", icon: "🌩️" },
};

const quakeColor = (mag: number) => mag >= 7 ? "#ef4444" : mag >= 5 ? "#f97316" : mag >= 3 ? "#f59e0b" : "#22c55e";
const quakeRadius = (mag: number) => Math.max(6, mag * 5);

export default function MapModule({ lang }: MapProps) {
  const l = labels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef      = useRef<L.Marker | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);
  const quakeLayerRef  = useRef<L.LayerGroup | null>(null);

  const [query, setQuery]                   = useState("");
  const [results, setResults]               = useState<Location[]>([]);
  const [loading, setLoading]               = useState(false);
  const [noResults, setNoResults]           = useState(false);
  const [fullscreen, setFullscreen]         = useState(false);
  const [weather, setWeather]               = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showWeatherPopup, setShowWeatherPopup] = useState(false);
  const [quake, setQuake]                   = useState<Quake | null>(null);
  const [showQuakePopup, setShowQuakePopup] = useState(false);
  const [quakeLoading, setQuakeLoading]     = useState(true);
  const [selected, setSelected]             = useState<Location | null>(null);

  const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
    setWeatherLoading(true);
    setShowWeatherPopup(true);
    setShowQuakePopup(false);
    setWeather(null);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`);
      const data = await res.json();
      const c = data.current;
      setWeather({ temperature: c.temperature_2m, windspeed: c.wind_speed_10m, humidity: c.relative_humidity_2m, precipitation: c.precipitation, weathercode: c.weather_code, city: cityName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`, lat, lon });
    } catch (e) { setShowWeatherPopup(false); }
    setWeatherLoading(false);
  };

  const loadEarthquakes = async (map: L.Map) => {
    setQuakeLoading(true);
    try {
      const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
      const data = await res.json();
      if (quakeLayerRef.current) quakeLayerRef.current.clearLayers();
      const layer = quakeLayerRef.current || L.layerGroup().addTo(map);
      quakeLayerRef.current = layer;

      data.features.forEach((f: any) => {
        const [lon, lat] = f.geometry.coordinates;
        const mag = f.properties.mag;
        const place = f.properties.place;
        const time = f.properties.time;
        const depth = f.geometry.coordinates[2];
        if (!mag || mag < 1) return;

        const circle = L.circleMarker([lat, lon], {
          radius: quakeRadius(mag),
          fillColor: quakeColor(mag),
          color: "#fff",
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.7,
        }).addTo(layer);

        circle.on("click", (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          setQuake({ mag, place, time, lat, lon, depth });
          setShowQuakePopup(true);
          setShowWeatherPopup(false);
        });
      });
    } catch (e) {}
    setQuakeLoading(false);
  };

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { center: [0, 0], zoom: 2, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);

      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (clickMarkerRef.current) clickMarkerRef.current.remove();
        const clickIcon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#f97316;border:2px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(249,115,22,0.9)"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7], className: ""
        });
        clickMarkerRef.current = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
        let cityName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const geoData = await geo.json();
          cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || geoData.display_name?.split(",")[0] || cityName;
        } catch (_) {}
        fetchWeather(lat, lng, cityName);
      });

      mapInstanceRef.current = map;
      loadEarthquakes(map);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);
  }, [fullscreen]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setNoResults(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&addressdetails=1`,
        { headers: { "Accept-Language": lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en" } }
      );
      const data = await res.json();
      if (data.length === 0) setNoResults(true);
      setResults(data);
    } catch (e) { setNoResults(true); }
    setLoading(false);
  };

  const selectLocation = (loc: Location) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    const map = mapInstanceRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.remove();
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<strong>${loc.display_name.split(",")[0]}</strong>`).openPopup();
    markerRef.current = marker;
    map.flyTo([lat, lon], 10, { animate: true, duration: 1.5 });
    setSelected(loc);
    setResults([]);
    setQuery(loc.display_name.split(",")[0]);
    fetchWeather(lat, lon, loc.display_name.split(",")[0]);
  };

  const wInfo = weather ? (weatherCodes[weather.weathercode] || { label: "—", icon: "🌡️" }) : null;
  const tempColor = weather ? (weather.temperature > 35 ? "#ef4444" : weather.temperature > 25 ? "#f59e0b" : weather.temperature < 5 ? "#3b82f6" : "#22c55e") : "#06b6d4";

  const quakeMagLabel = (mag: number) => mag >= 7 ? l.extreme : mag >= 5 ? l.high : mag >= 3 ? l.moderate : l.low;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{l.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 16 }}>{l.subtitle}</p>
      </div>

      {/* Search */}
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

      {/* No results */}
      {noResults && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={15} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#ef4444" }}>{l.noResults}</span>
        </div>
      )}

      {/* Results */}
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

      {/* Hint + quake status */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", flexWrap: "wrap" }}>
        <MapPin size={13} color="#06b6d4" />
        <span style={{ fontSize: 12, color: "#4a6080", flex: 1 }}>{l.clickHint}</span>
        {quakeLoading
          ? <span style={{ fontSize: 11, color: "#f59e0b", display: "flex", alignItems: "center", gap: 4 }}><Loader size={11} style={{ animation: "spin 1s linear infinite" }} /> {l.quakeLoading}</span>
          : <span style={{ fontSize: 11, color: "#ef4444", fontWeight: 700 }}>{l.quakeLayer}</span>
        }
      </div>

      {/* MAP */}
      <div style={{ position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : "62vh", zIndex: fullscreen ? 9999 : 1, borderRadius: fullscreen ? 0 : 14, overflow: "hidden", border: "1px solid #1a2744" }}>

        {/* Fullscreen button */}
        <button onClick={() => setFullscreen(!fullscreen)}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {fullscreen ? l.collapse : l.expand}
        </button>

        {/* WEATHER POPUP */}
        {showWeatherPopup && (
          <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 999, width: "min(280px, calc(100vw - 32px))", background: "rgba(6,14,34,0.96)", border: "1px solid rgba(6,182,212,0.4)", borderRadius: 14, padding: 16, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{wInfo?.icon || "🌡️"}</span>
                <div>
                  <p style={{ fontSize: 12, color: "#06b6d4", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{l.weatherTitle}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{wInfo?.label || "—"}</p>
                </div>
              </div>
              <button onClick={() => setShowWeatherPopup(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 6px", display: "flex" }}>
                <X size={14} />
              </button>
            </div>
            {weather && <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #1a2744" }}><MapPin size={12} color="#f97316" /><span style={{ fontSize: 13, color: "#fff", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{weather.city}</span></div>}
            {weatherLoading && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Loader size={15} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 13, color: "#4a6080" }}>{l.loading}</span></div>}
            {weather && !weatherLoading && (
              <>
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
                <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a2744" }}>
                  <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0, textTransform: "uppercase" }}>{l.lat}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{weather.lat.toFixed(4)}</p></div>
                  <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0, textTransform: "uppercase" }}>{l.lon}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{weather.lon.toFixed(4)}</p></div>
                </div>
              </>
            )}
          </div>
        )}

        {/* QUAKE POPUP */}
        {showQuakePopup && quake && (
          <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 999, width: "min(280px, calc(100vw - 32px))", background: "rgba(6,14,34,0.96)", border: `1px solid ${quakeColor(quake.mag)}60`, borderRadius: 14, padding: 16, backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🌍</span>
                <div>
                  <p style={{ fontSize: 12, color: quakeColor(quake.mag), fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{l.quakeTitle}</p>
                  <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{quakeMagLabel(quake.mag)}</p>
                </div>
              </div>
              <button onClick={() => setShowQuakePopup(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1a2744", borderRadius: 6, color: "#4a6080", cursor: "pointer", padding: "4px 6px", display: "flex" }}>
                <X size={14} />
              </button>
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
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0, textTransform: "uppercase" }}>{l.lat}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{quake.lat.toFixed(3)}</p></div>
              <div><p style={{ fontSize: 10, color: "#2a3a54", margin: 0, textTransform: "uppercase" }}>{l.lon}</p><p style={{ fontSize: 11, color: "#4a6080", fontFamily: "monospace", margin: 0 }}>{quake.lon.toFixed(3)}</p></div>
              <div style={{ marginLeft: "auto" }}><p style={{ fontSize: 10, color: "#2a3a54", margin: 0, textTransform: "uppercase" }}>{l.quakeTime}</p><p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{new Date(quake.time).toLocaleTimeString()}</p></div>
            </div>
          </div>
        )}

        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* PAINEL FIXO ABAIXO */}
      {(weatherLoading || weather) && (
        <div style={{ padding: "16px 18px", borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid rgba(6,182,212,0.3)", animation: "slideIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ width: 4, height: 22, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
            <span style={{ fontSize: 12, color: "#06b6d4", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l.weatherFull}</span>
            {wInfo && <span style={{ fontSize: 18 }}>{wInfo.icon}</span>}
            {wInfo && <span style={{ fontSize: 12, color: "#94a3b8" }}>{wInfo.label}</span>}
            {weather && <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0, textTransform: "uppercase" }}>{l.lat}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{weather.lat.toFixed(4)}</p></div>
              <div><p style={{ fontSize: 10, color: "#4a6080", margin: 0, textTransform: "uppercase" }}>{l.lon}</p><p style={{ fontSize: 11, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{weather.lon.toFixed(4)}</p></div>
            </div>}
          </div>
          {weather && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><MapPin size={13} color="#f97316" /><span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{weather.city}</span></div>}
          {weatherLoading && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Loader size={16} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 13, color: "#4a6080" }}>{l.loading}</span></div>}
          {weather && !weatherLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
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
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: #4a6080; }
        .leaflet-container { background: #050d1f !important; font-family: Arial, sans-serif; }
        .leaflet-tile { filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-control-attribution { background: rgba(6,14,34,0.9) !important; color: #4a6080 !important; font-size: 10px; }
        .leaflet-control-attribution a { color: #06b6d4 !important; }
        .leaflet-control-zoom a { background: #0a1628 !important; color: #fff !important; border-color: #1a2744 !important; }
        .leaflet-popup-content-wrapper { background: #0a1628 !important; color: #fff !important; border: 1px solid #1a2744 !important; border-radius: 10px !important; }
        .leaflet-popup-tip { background: #0a1628 !important; }
        @media (max-width: 768px) {
          h1 { font-size: 18px !important; }
        }
      `}</style>
    </div>
  );
}