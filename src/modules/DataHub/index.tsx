import { Database, ExternalLink, CheckCircle2 } from "lucide-react";
import type { Lang } from "../../types";

const copy: Record<Lang, { title: string; subtitle: string; active: string; free: string }> = {
  pt: { title: "INTEGRAÇÃO DE DADOS", subtitle: "Fontes públicas gratuitas utilizadas no MVP", active: "Ativo", free: "Sem custo de licença" },
  en: { title: "DATA INTEGRATION", subtitle: "Public free sources used in the MVP", active: "Active", free: "No license fee" },
  es: { title: "INTEGRACIÓN DE DATOS", subtitle: "Fuentes públicas gratuitas del MVP", active: "Activo", free: "Sin licencia" },
  fr: { title: "INTÉGRATION DES DONNÉES", subtitle: "Sources publiques gratuites du MVP", active: "Actif", free: "Sans redevance" },
};

const sources = [
  { name: "USGS Earthquake Hazards", url: "https://earthquake.usgs.gov/", desc: "GeoJSON • sismos globais" },
  { name: "Open-Meteo", url: "https://open-meteo.com/", desc: "Flood + Air Quality + forecast" },
  { name: "NASA FIRMS (VIIRS)", url: "https://firms.modaps.eosdis.nasa.gov/", desc: "Focos de calor globais" },
  { name: "INPE Queimadas", url: "https://queimadas.dgi.inpe.br/", desc: "Brasil — focos autorizados" },
  { name: "GDACS", url: "https://www.gdacs.org/", desc: "Alertas multirisco ONU" },
  { name: "OpenStreetMap / Nominatim", url: "https://nominatim.openstreetmap.org/", desc: "Geocodificação" },
];

export default function DataHub({ lang }: { lang: Lang }) {
  const c = copy[lang];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #22c55e, #06b6d4)", borderRadius: 2 }} />
          <Database size={26} color="#22c55e" />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{c.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 42 }}>{c.subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
        {sources.map(s => (
          <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
            style={{ padding: 18, borderRadius: 12, background: "#0a1628", border: "1px solid #1a2744", textDecoration: "none", color: "inherit", display: "block", transition: "border-color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#06b6d470"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>{s.name}</p>
                <p style={{ fontSize: 12, color: "#4a6080", margin: 0 }}>{s.desc}</p>
              </div>
              <ExternalLink size={16} color="#06b6d4" style={{ flexShrink: 0 }} />
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#22c55e", fontWeight: 700 }}><CheckCircle2 size={12} />{c.active}</span>
              <span style={{ fontSize: 11, color: "#2a3a54" }}>{c.free}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
