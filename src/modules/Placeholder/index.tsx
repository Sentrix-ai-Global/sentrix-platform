import type { Lang } from "../../types";
import { T } from "../../i18n/translations";

interface PlaceholderProps {
  lang: Lang;
  moduleId: string;
}

export default function Placeholder({ lang, moduleId }: PlaceholderProps) {
  const t = T[lang];

  const labels: Record<string, Record<string, string>> = {
    pt: { map: "Mapa Inteligente", urban: "Monitoramento Urbano", impact: "Impacto Social", data: "Integração de Dados", automation: "Automação IA", tech: "Tecnologias", global: "Visão Global", reports: "Relatórios" },
    en: { map: "Smart Map", urban: "Urban Monitoring", impact: "Social Impact", data: "Data Integration", automation: "AI Automation", tech: "Technologies", global: "Global Vision", reports: "Reports" },
    es: { map: "Mapa Inteligente", urban: "Monitoreo Urbano", impact: "Impacto Social", data: "Integración de Datos", automation: "Automatización IA", tech: "Tecnologías", global: "Visión Global", reports: "Informes" },
    fr: { map: "Carte intelligente", urban: "Surveillance urbaine", impact: "Impact social", data: "Intégration des données", automation: "Automatisation IA", tech: "Technologies", global: "Vision mondiale", reports: "Rapports" },
  };

  const label = labels[lang]?.[moduleId] ?? moduleId;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 20 }}>
      <img src="/logo.png" alt="SENTRIX" style={{ width: 220, opacity: 0.3, filter: "drop-shadow(0 0 12px rgba(6,182,212,0.3))" }} />
      <div style={{ padding: 32, borderRadius: 16, background: "#0a1628", border: "1px solid #1a2744", textAlign: "center", maxWidth: 400 }}>
        <p style={{ color: "#f97316", fontWeight: 900, fontSize: 18, letterSpacing: "0.1em", marginBottom: 12 }}>{label}</p>
        <p style={{ color: "#4a6080", fontSize: 14, fontFamily: "monospace" }}>{t.inDev}</p>
      </div>
    </div>
  );
}