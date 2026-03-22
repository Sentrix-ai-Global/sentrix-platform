import { useEffect, useRef, useState } from "react";
import { Search, MapPin, ChevronRight, Loader, AlertTriangle, Navigation, Maximize2, Minimize2, Thermometer, Wind, Droplets, Eye } from "lucide-react";
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
interface Weather {
  temperature: number;
  windspeed: number;
  humidity: number;
  precipitation: number;
  weathercode: number;
  city: string;
}

const labels = {
  pt: {
    title: "MAPA INTELIGENTE", subtitle: "Busca precisa • Clique no mapa para dados meteorológicos em tempo real",
    placeholder: "Digite país, estado, cidade, rua ou endereço completo...",
    searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS",
    lat: "Latitude", lon: "Longitude", noResults: "Nenhum resultado. Tente ser mais específico.",
    location: "LOCALIZAÇÃO", expand: "TELA CHEIA", collapse: "MINIMIZAR",
    weatherTitle: "DADOS METEOROLÓGICOS", temp: "Temperatura", wind: "Vento",
    humidity: "Umidade", rain: "Precipitação", loading: "Carregando dados...",
    clickHint: "Clique em qualquer ponto do mapa para ver dados meteorológicos em tempo real",
  },
  en: {
    title: "SMART MAP", subtitle: "Precise search • Click the map for real-time weather data",
    placeholder: "Type country, state, city, street or full address...",
    searching: "Searching...", search: "SEARCH", results: "RESULTS",
    lat: "Latitude", lon: "Longitude", noResults: "No results. Try to be more specific.",
    location: "LOCATION", expand: "FULL SCREEN", collapse: "MINIMIZE",
    weatherTitle: "WEATHER DATA", temp: "Temperature", wind: "Wind",
    humidity: "Humidity", rain: "Precipitation", loading: "Loading data...",
    clickHint: "Click anywhere on the map to see real-time weather data",
  },
  es: {
    title: "MAPA INTELIGENTE", subtitle: "Búsqueda precisa • Haz clic en el mapa para datos meteorológicos",
    placeholder: "Escriba país, estado, ciudad, calle o dirección completa...",
    searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS",
    lat: "Latitud", lon: "Longitud", noResults: "Sin resultados. Intente ser más específico.",
    location: "UBICACIÓN", expand: "PANTALLA COMPLETA", collapse: "MINIMIZAR",
    weatherTitle: "DATOS METEOROLÓGICOS", temp: "Temperatura", wind: "Viento",
    humidity: "Humedad", rain: "Precipitación", loading: "Cargando datos...",
    clickHint: "Haz clic en cualquier punto del mapa para ver datos meteorológicos en tiempo real",
  },
};

const weatherCodes: Record<number, { label: string; icon: string }> = {
  0:  { label: "Céu limpo",         icon: "☀️" },
  1:  { label: "Predominante limpo", icon: "🌤️" },
  2:  { label: "Parcialmente nublado",icon: "⛅" },
  3:  { label: "Nublado",            icon: "☁️" },
  45: { label: "Neblina",            icon: "🌫️" },
  48: { label: "Geada",              icon: "🌫️" },
  51: { label: "Garoa leve",         icon: "🌦️" },
  61: { label: "Chuva leve",         icon: "🌧️" },
  63: { label: "Chuva moderada",     icon: "🌧️" },
  65: { label: "Chuva intensa",      icon: "🌧️" },
  71: { label: "Neve leve",          icon: "🌨️" },
  80: { label: "Pancadas de chuva",  icon: "⛈️" },
  95: { label: "Tempestade",         icon: "⛈️" },
  99: { label: "Tempestade severa",  icon: "🌩️" },
};

export default function MapModule({ lang }: MapProps) {
  const l = labels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef      = useRef<L.Marker | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState<Location[]>([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState<Location | null>(null);
  const [noResults, setNoResults]   = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [weather, setWeather]       = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [clickCoords, setClickCoords]       = useState<{ lat: number; lon: number } | null>(null);

  const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
    setWeatherLoading(true);
    setWeather(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await res.json();
      const c = data.current;
      setWeather({
        temperature: c.temperature_2m,
        windspeed: c.wind_speed_10m,
        humidity: c.relative_humidity_2m,
        precipitation: c.precipitation,
        weathercode: c.weather_code,
        city: cityName || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      });
    } catch (e) {
      setWeather(null);
    }
    setWeatherLoading(false);
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

      // Click on map
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setClickCoords({ lat, lon: lng });

        if (clickMarkerRef.current) clickMarkerRef.current.remove();

        const clickIcon = L.divIcon({
          html: `<div style="width:16px;height:16px;background:#f97316;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(249,115,22,0.6)"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8], className: ""
        });

        const clickMarker = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
        clickMarkerRef.current = clickMarker;

        // Reverse geocode
        let cityName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        try {
          const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const geoData = await geo.json();
          cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || geoData.display_name?.split(",")[0] || cityName;
        } catch (_) {}

        fetchWeather(lat, lng, cityName);
      });

      mapInstanceRef.current = map;
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
    map.flyTo([lat, lon], 15, { animate: true, duration: 1.5 });
    setSelected(loc);
    setResults([]);
    setQuery(loc.display_name.split(",")[0]);
    fetchWeather(lat, lon, loc.display_name.split(",")[0]);
  };

  const wInfo = weather ? (weatherCodes[weather.weathercode] || { label: "Desconhecido", icon: "🌡️" }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>{l.title}</h1>
        </div>
        <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: 16 }}>{l.subtitle}</p>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} color="#4a6080" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder={l.placeholder}
            style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: 10, background: "#0a1628", border: "1px solid #1a2744", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={search} disabled={loading}
          style={{ padding: "13px 28px", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #f97316)", border: "none", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Navigation size={16} />}
          {loading ? l.searching : l.search}
        </button>
      </div>

      {/* No results */}
      {noResults && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#ef4444" }}>{l.noResults}</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ borderRadius: 12, background: "#0a1628", border: "1px solid #1a2744", overflow: "hidden" }}>
          <p style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 16px", borderBottom: "1px solid #1a2744", margin: 0, fontWeight: 700 }}>{results.length} {l.results}</p>
          {results.map((loc, i) => (
            <button key={i} onClick={() => selectLocation(loc)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%", background: "transparent", border: "none", borderBottom: i < results.length - 1 ? "1px solid #1a2744" : "none", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <MapPin size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loc.display_name.split(",")[0]}</p>
                <p style={{ fontSize: 11, color: "#4a6080", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loc.display_name}</p>
              </div>
              <ChevronRight size={14} color="#4a6080" />
            </button>
          ))}
        </div>
      )}

      {/* Weather panel */}
      {(weatherLoading || weather) && (
        <div style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid rgba(6,182,212,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 4, height: 24, background: "linear-gradient(180deg, #06b6d4, #3b82f6)", borderRadius: 2 }} />
            <p style={{ fontSize: 13, color: "#06b6d4", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{l.weatherTitle}</p>
            {weather && <span style={{ fontSize: 20 }}>{wInfo?.icon}</span>}
            {weather && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>{wInfo?.label}</p>}
            <p style={{ fontSize: 12, color: "#4a6080", margin: "0 0 0 auto" }}>{weather?.city}</p>
          </div>
          {weatherLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Loader size={16} color="#06b6d4" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13, color: "#4a6080" }}>{l.loading}</span>
            </div>
          )}
          {weather && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              {[
                { icon: Thermometer, label: l.temp,     value: `${weather.temperature}°C`, color: weather.temperature > 35 ? "#ef4444" : weather.temperature > 25 ? "#f59e0b" : "#06b6d4" },
                { icon: Wind,        label: l.wind,     value: `${weather.windspeed} km/h`, color: weather.windspeed > 50 ? "#ef4444" : "#8b5cf6" },
                { icon: Droplets,    label: l.humidity, value: `${weather.humidity}%`,      color: "#06b6d4" },
                { icon: Eye,         label: l.rain,     value: `${weather.precipitation} mm`, color: weather.precipitation > 10 ? "#ef4444" : "#22c55e" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{ padding: "14px 16px", borderRadius: 10, background: "#060e22", border: `1px solid ${color}25` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click hint */}
      {!weather && !weatherLoading && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
          <MapPin size={14} color="#06b6d4" />
          <span style={{ fontSize: 13, color: "#4a6080" }}>{l.clickHint}</span>
        </div>
      )}

      {/* Selected coords */}
      {selected && (
        <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <MapPin size={18} color="#06b6d4" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: "#4a6080", margin: 0, textTransform: "uppercase" }}>{l.location}</p>
            <p style={{ fontSize: 14, color: "#fff", fontWeight: 700, margin: "4px 0 2px" }}>{selected.display_name.split(",")[0]}</p>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, color: "#4a6080", margin: 0, textTransform: "uppercase" }}>{l.lat}</p>
              <p style={{ fontSize: 13, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{parseFloat(selected.lat).toFixed(6)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#4a6080", margin: 0, textTransform: "uppercase" }}>{l.lon}</p>
              <p style={{ fontSize: 13, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{parseFloat(selected.lon).toFixed(6)}</p>
            </div>
          </div>
        </div>
      )}

      {/* MAP */}
      <div style={{ position: fullscreen ? "fixed" : "relative", top: fullscreen ? 0 : "auto", left: fullscreen ? 0 : "auto", width: fullscreen ? "100vw" : "100%", height: fullscreen ? "100vh" : "65vh", zIndex: fullscreen ? 9999 : 1, borderRadius: fullscreen ? 0 : 14, overflow: "hidden", border: "1px solid #1a2744" }}>
        <button onClick={() => setFullscreen(!fullscreen)}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, padding: "8px 14px", borderRadius: 8, background: "rgba(6,14,34,0.9)", border: "1px solid #1a2744", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {fullscreen ? l.collapse : l.expand}
        </button>
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #4a6080; }
        .leaflet-container { background: #050d1f !important; font-family: Arial, sans-serif; }
        .leaflet-tile { filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-control-attribution { background: rgba(6,14,34,0.9) !important; color: #4a6080 !important; }
        .leaflet-control-attribution a { color: #06b6d4 !important; }
        .leaflet-control-zoom a { background: #0a1628 !important; color: #fff !important; border-color: #1a2744 !important; }
        .leaflet-popup-content-wrapper { background: #0a1628 !important; color: #fff !important; border: 1px solid #1a2744 !important; border-radius: 10px !important; }
        .leaflet-popup-tip { background: #0a1628 !important; }
      `}</style>
    </div>
  );
}