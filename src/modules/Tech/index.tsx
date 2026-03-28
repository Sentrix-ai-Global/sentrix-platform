import { Signal } from "lucide-react";
import type { Lang } from "../../types";

const copy: Record<Lang, { title: string; subtitle: string }> = {
  pt: { title: "STACK TECNOLÓGICO", subtitle: "Ferramentas gratuitas / open-source no front-end" },
  en: { title: "TECHNOLOGY STACK", subtitle: "Free / open-source front-end tooling" },
  es: { title: "STACK TECNOLÓGICO", subtitle: "Herramientas gratuitas y open source" },
  fr: { title: "STACK TECHNOLOGIQUE", subtitle: "Outils front-end gratuits / open source" },
};

const stack = [
  { name: "React 19", note: "UI" },
  { name: "TypeScript", note: "Tipagem" },
  { name: "Vite 8", note: "Build" },
  { name: "Leaflet", note: "Mapas" },
  { name: "Tailwind CSS 4", note: "Estilo" },
  { name: "Supabase (opcional)", note: "Postgres + API" },
  { name: "Lucide", note: "Ícones" },
];

export default function Tech({ lang }: { lang: Lang }) {
  const c = copy[lang];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #3b82f6, #06b6d4)", borderRadius: 2 }} />
          <Signal size={26} color="#3b82f6" />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{c.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 42 }}>{c.subtitle}</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {stack.map(s => (
          <div key={s.name} style={{ padding: "14px 20px", borderRadius: 10, background: "#0a1628", border: "1px solid #1a2744" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>{s.name}</p>
            <p style={{ fontSize: 11, color: "#4a6080", margin: 0 }}>{s.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
