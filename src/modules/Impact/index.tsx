import { Heart, Users, Shield, TrendingDown, BarChart3 } from "lucide-react";
import type { Lang } from "../../types";
import { T } from "../../i18n/translations";

const extra: Record<Lang, { title: string; subtitle: string; reach: string; efficacy: string; resilience: string }> = {
  pt: {
    title: "IMPACTO SOCIAL", subtitle: "Indicadores consolidados • Narrativa para autoridades e comunidade",
    reach: "Pessoas alcançadas (simulação)", efficacy: "Eficácia de alerta precoce", resilience: "Resiliência urbana",
  },
  en: {
    title: "SOCIAL IMPACT", subtitle: "Consolidated metrics • Narrative for authorities and communities",
    reach: "People reached (simulation)", efficacy: "Early-warning efficacy", resilience: "Urban resilience",
  },
  es: {
    title: "IMPACTO SOCIAL", subtitle: "Indicadores consolidados • Narrativa para autoridades",
    reach: "Personas alcanzadas (simulación)", efficacy: "Eficacia de alerta temprana", resilience: "Resiliencia urbana",
  },
  fr: {
    title: "IMPACT SOCIAL", subtitle: "Indicateurs consolidés • Narratif pour les autorités",
    reach: "Personnes touchées (simulation)", efficacy: "Efficacité d’alerte précoce", resilience: "Résilience urbaine",
  },
};

export default function Impact({ lang }: { lang: Lang }) {
  const t = T[lang];
  const e = extra[lang];

  const bars = [
    { label: e.reach, pct: 88, color: "#22c55e" },
    { label: e.efficacy, pct: 76, color: "#06b6d4" },
    { label: e.resilience, pct: 64, color: "#8b5cf6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #ec4899, #f97316)", borderRadius: 2 }} />
          <Heart size={26} color="#ec4899" />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{e.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 42 }}>{e.subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {[
          { icon: Heart, label: t.lives, value: "12.4M", sub: "YTD", color: "#ec4899" },
          { icon: TrendingDown, label: t.damage, value: "R$ 2.1B", sub: "evitados (demo)", color: "#22c55e" },
          { icon: Users, label: t.teams, value: "340", sub: "equipes / sim.", color: "#06b6d4" },
          { icon: Shield, label: t.alerts, value: "89", sub: "ativos", color: "#f97316" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} style={{ padding: 22, borderRadius: 14, background: "#0a1628", border: `1px solid ${color}35` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Icon size={18} color={color} />
              <span style={{ fontSize: 12, color: "#4a6080", fontWeight: 700 }}>{label}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 4px", fontFamily: "monospace" }}>{value}</p>
            <span style={{ fontSize: 11, color: "#2a3a54" }}>{sub}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: 24, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <BarChart3 size={18} color="#f97316" />
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>KPI</span>
        </div>
        {bars.map(b => (
          <div key={b.label} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>{b.label}</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: b.color, fontFamily: "monospace" }}>{b.pct}%</span>
            </div>
            <div style={{ height: 8, background: "#050d1f", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${b.pct}%`, height: "100%", background: `linear-gradient(90deg, ${b.color}, ${b.color}88)`, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
