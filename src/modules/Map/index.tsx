import { useEffect, useRef, useState } from "react";
import { Search, MapPin, ChevronRight, Loader, AlertTriangle, Navigation } from "lucide-react";
import type { Lang } from "../../types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapProps {
  lang: Lang;
}

interface Location {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const labels = {
  pt: { title: "MAPA INTELIGENTE", subtitle: "Busca precisa por País • Estado • Cidade • Rua • Número", placeholder: "Digite país, estado, cidade, rua ou endereço completo...", searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS ENCONTRADOS", lat: "Latitude", lon: "Longitude", noResults: "Nenhum resultado. Tente ser mais específico.", zoom: "ZOOM", location: "LOCALIZAÇÃO SELECIONADA" },
  en: { title: "SMART MAP", subtitle: "Precise search by Country • State • City • Street • Number", placeholder: "Type country, state, city, street or full address...", searching: "Searching...", search: "SEARCH", results: "RESULTS FOUND", lat: "Latitude", lon: "Longitude", noResults: "No results. Try to be more specific.", zoom: "ZOOM", location: "SELECTED LOCATION" },
  es: { title: "MAPA INTELIGENTE", subtitle: "Búsqueda precisa por País • Estado • Ciudad • Calle • Número", placeholder: "Escriba país, estado, ciudad, calle o dirección completa...", searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS ENCONTRADOS", lat: "Latitud", lon: "Longitud", noResults: "Sin resultados. Intente ser más específico.", zoom: "ZOOM", location: "UBICACIÓN SELECCIONADA" },
};

export default function MapModule({ lang }: MapProps) {
  const l = labels[lang];
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef      = useRef<L.Marker | null>(null);

  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Location[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [noResults, setNoResults] = useState(false);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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
    } catch (e) {
      setNoResults(true);
    }
    setLoading(false);
  };

  const selectLocation = (loc: Location) => {
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    const marker = L.marker([lat, lon]).addTo(map);
    marker.bindPopup(`<strong>${loc.display_name.split(",")[0]}</strong><br/>${loc.display_name}`).openPopup();
    markerRef.current = marker;

    // Zoom preciso
    map.flyTo([lat, lon], 15, { animate: true, duration: 1.2 });

    setSelected(loc);
    setResults([]);
    setQuery(loc.display_name.split(",")[0]);
  };

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
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder={l.placeholder}
            style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: 10, background: "#0a1628", border: "1px solid #1a2744", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <button onClick={search} disabled={loading}
          style={{ padding: "13px 28px", borderRadius: 10, background: "linear-gradient(135deg, #ef4444, #f97316)", border: "none", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Navigation size={16} />}
          {loading ? l.searching : l.search}
        </button>
      </div>

      {/* No results warning */}
      {noResults && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} color="#ef4444" />
          <span style={{ fontSize: 13, color: "#ef4444" }}>{l.noResults}</span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ borderRadius: 12, background: "#0a1628", border: "1px solid #1a2744", overflow: "hidden" }}>
          <p style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 16px", borderBottom: "1px solid #1a2744", margin: 0, fontWeight: 700 }}>
            {results.length} {l.results}
          </p>
          {results.map((loc, i) => (
            <button key={i} onClick={() => selectLocation(loc)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", width: "100%", background: "transparent", border: "none", borderBottom: i < results.length - 1 ? "1px solid #1a2744" : "none", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
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

      {/* Selected info */}
      {selected && (
        <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.3)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <MapPin size={18} color="#06b6d4" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: "#4a6080", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>{l.location}</p>
            <p style={{ fontSize: 14, color: "#fff", fontWeight: 700, margin: "4px 0 2px" }}>{selected.display_name.split(",")[0]}</p>
            <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{selected.display_name}</p>
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

      {/* MAP — Leaflet */}
      <div ref={mapRef} style={{ height: "65vh", borderRadius: 14, overflow: "hidden", border: "1px solid #1a2744", zIndex: 1 }} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #4a6080; }
        .leaflet-container { background: #050d1f !important; }
        .leaflet-tile { filter: invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-control-attribution { background: rgba(6,14,34,0.9) !important; color: #4a6080 !important; }
        .leaflet-control-attribution a { color: #06b6d4 !important; }
        .leaflet-control-zoom a { background: #0a1628 !important; color: #fff !important; border-color: #1a2744 !important; }
      `}</style>
    </div>
  );
}