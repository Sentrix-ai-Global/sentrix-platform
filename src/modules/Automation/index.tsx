import { Bot, ArrowRight, Radio, Brain, Database } from "lucide-react";
import type { Lang } from "../../types";

const copy: Record<Lang, { title: string; subtitle: string; ingest: string; model: string; notify: string; mvp: string }> = {
  pt: {
    title: "AUTOMAÇÃO IA", subtitle: "Pipeline conceitual — ingestão → modelo → alertas",
    ingest: "Ingestão", model: "Modelo / regras", notify: "Canais de alerta", mvp: "MVP com dados abertos; orquestração completa na fase enterprise.",
  },
  en: {
    title: "AI AUTOMATION", subtitle: "Concept pipeline — ingest → model → alerts",
    ingest: "Ingest", model: "Model / rules", notify: "Alert channels", mvp: "MVP on open data; full orchestration in enterprise phase.",
  },
  es: {
    title: "AUTOMATIZACIÓN IA", subtitle: "Pipeline conceptual — ingesta → modelo → alertas",
    ingest: "Ingesta", model: "Modelo / reglas", notify: "Canales", mvp: "MVP con datos abiertos; orquestación enterprise después.",
  },
  fr: {
    title: "AUTOMATISATION IA", subtitle: "Pipeline conceptuel — ingestion → modèle → alertes",
    ingest: "Ingestion", model: "Modèle / règles", notify: "Canaux d’alerte", mvp: "MVP sur données ouvertes; orchestration en phase enterprise.",
  },
};

export default function Automation({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const steps = [
    { icon: Database, label: c.ingest, color: "#06b6d4" },
    { icon: Brain, label: c.model, color: "#8b5cf6" },
    { icon: Radio, label: c.notify, color: "#f97316" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #8b5cf6, #06b6d4)", borderRadius: 2 }} />
          <Bot size={26} color="#8b5cf6" />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{c.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 42 }}>{c.subtitle}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", padding: "32px 16px", background: "#0a1628", borderRadius: 14, border: "1px solid #1a2744" }}>
        {steps.map((s, i) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 28px", borderRadius: 12, background: "#060e22", border: `1px solid ${s.color}40`, minWidth: 140 }}>
              <s.icon size={28} color={s.color} />
              <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", textAlign: "center" }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight size={22} color="#2a3a54" style={{ flexShrink: 0 }} />}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "#4a6080", lineHeight: 1.6, margin: 0 }}>{c.mvp}</p>
    </div>
  );
}
