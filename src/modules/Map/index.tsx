import { useState } from "react";
import { Search, MapPin, Globe, ChevronRight, Loader } from "lucide-react";
import type { Lang } from "../../types";

interface MapProps {
  lang: Lang;
}

interface Location {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const mapLabels = {
  pt: { title: "MAPA INTELIGENTE", subtitle: "Busca global por País • Estado • Cidade • Bairro", searchPlaceholder: "Buscar país, estado, cidade ou bairro...", searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS", lat: "Latitude", lon: "Longitude" },
  en: { title: "SMART MAP", subtitle: "Global search by Country • State • City • Neighborhood", searchPlaceholder: "Search country, state, city or neighborhood...", searching: "Searching...", search: "SEARCH", results: "RESULTS", lat: "Latitude", lon: "Longitude" },
  es: { title: "MAPA INTELIGENTE", subtitle: "Búsqueda global por País • Estado • Ciudad • Barrio", searchPlaceholder: "Buscar país, estado, ciudad o barrio...", searching: "Buscando...", search: "BUSCAR", results: "RESULTADOS", lat: "Latitud", lon: "Longitud" },
};

export default function MapModule({ lang }: MapProps) {
  const l = mapLabels[lang];
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Location[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [mapUrl, setMapUrl]     = useState("https://www.openstreetmap.org/export/embed.html?bbox=-180,-85,180,85&layer=mapnik");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8`,
        { headers: { "Accept-Language": lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en" } }
      );
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setResults([]);
    }
    setLoading(false);
  };

  const selectLocation = (loc: Location) => {
    setSelected(loc);
    const lat = parseFloat(loc.lat);
    const lon = parseFloat(loc.lon);
    const delta = 0.8;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
    setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`);
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

      {/* Search bar */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} color="#4a6080" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder={l.searchPlaceholder}
            style={{ width: "100%", padding: "13px 14px 13px 42px", borderRadius: 10, background: "#0a1628", border: "1px solid #1a2744", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          style={{ padding: "13px 28px", borderRadius: 10, background: "linear-gradient(135deg, #06b6d4, #3b82f6)", border: "none", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
          {loading ? l.searching : l.search}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ borderRadius: 12, background: "#0a1628", border: "1px solid #1a2744", overflow: "hidden" }}>
          <p style={{ fontSize: 11, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 16px", borderBottom: "1px solid #1a2744", margin: 0, fontWeight: 700 }}>{l.results}</p>
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
            <p style={{ fontSize: 14, color: "#fff", fontWeight: 700, margin: 0 }}>{selected.display_name.split(",")[0]}</p>
            <p style={{ fontSize: 12, color: "#4a6080", margin: 0 }}>{selected.display_name}</p>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <p style={{ fontSize: 11, color: "#4a6080", margin: 0, textTransform: "uppercase" }}>{l.lat}</p>
              <p style={{ fontSize: 13, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{parseFloat(selected.lat).toFixed(4)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#4a6080", margin: 0, textTransform: "uppercase" }}>{l.lon}</p>
              <p style={{ fontSize: 13, color: "#06b6d4", fontFamily: "monospace", fontWeight: 700, margin: 0 }}>{parseFloat(selected.lon).toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #1a2744" }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="640"
          style={{ border: "none", display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
          title="SENTRIX Map"
        />
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #4a6080; }
      `}</style>
    </div>
  );
}