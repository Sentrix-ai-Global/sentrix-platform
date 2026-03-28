import { useState } from "react";
import { FileText, Calendar, CheckSquare } from "lucide-react";
import type { Lang } from "../../types";

const copy: Record<Lang, {
  title: string; subtitle: string; period: string; modules: string; gen: string;
  done: string; note: string;
}> = {
  pt: {
    title: "RELATÓRIOS", subtitle: "Gerador conceitual — export PDF na roadmap",
    period: "Período", modules: "Módulos incluídos", gen: "GERAR RELATÓRIO (DEMO)",
    done: "Pedido registado (demo). Integração PDF + e-mail na fase seguinte.",
    note: "Os dados agregados virão de caches Supabase / APIs em produção.",
  },
  en: {
    title: "REPORTS", subtitle: "Concept generator — PDF export on roadmap",
    period: "Period", modules: "Included modules", gen: "GENERATE REPORT (DEMO)",
    done: "Request logged (demo). PDF + email in next phase.",
    note: "Aggregated data will come from Supabase caches / APIs in production.",
  },
  es: {
    title: "INFORMES", subtitle: "Generador conceptual — PDF en roadmap",
    period: "Período", modules: "Módulos incluidos", gen: "GENERAR INFORME (DEMO)",
    done: "Solicitud registrada (demo). PDF + correo en siguiente fase.",
    note: "Datos agregados vía Supabase / APIs en producción.",
  },
  fr: {
    title: "RAPPORTS", subtitle: "Générateur conceptuel — export PDF sur la roadmap",
    period: "Période", modules: "Modules inclus", gen: "GÉNÉRER LE RAPPORT (DÉMO)",
    done: "Demande enregistrée (démo). PDF + e-mail phase suivante.",
    note: "Données agrégées via Supabase / APIs en production.",
  },
};

const modIds = ["map", "earthquakes", "floods", "airquality", "wildfires", "disasters"] as const;

export default function Reports({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const [picked, setPicked] = useState<Set<string>>(new Set(modIds));
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = (id: string) => {
    setPicked(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #f97316, #eab308)", borderRadius: 2 }} />
          <FileText size={26} color="#f97316" />
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{c.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.08em", marginLeft: 42 }}>{c.subtitle}</p>
      </div>

      <div style={{ padding: 20, borderRadius: 14, background: "#0a1628", border: "1px solid #1a2744" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Calendar size={16} color="#06b6d4" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>{c.period}</span>
        </div>
        <input type="text" readOnly value="— 30 dias (demo) —" style={{ width: "100%", maxWidth: 320, padding: "12px 14px", borderRadius: 8, background: "#060e22", border: "1px solid #1a2744", color: "#4a6080", fontSize: 13, boxSizing: "border-box" }} />

        <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "22px 0 12px", fontSize: 13, fontWeight: 700, color: "#94a3b8" }}><CheckSquare size={16} color="#06b6d4" />{c.modules}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {modIds.map(id => (
            <button key={id} type="button" onClick={() => toggle(id)}
              style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${picked.has(id) ? "#f9731650" : "#1a2744"}`, background: picked.has(id) ? "rgba(249,115,22,0.12)" : "#060e22", color: picked.has(id) ? "#fed7aa" : "#4a6080", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
              {id}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => setMsg(c.done)} style={{ marginTop: 22, padding: "14px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: 14, fontWeight: 900, cursor: "pointer", letterSpacing: "0.06em" }}>
          {c.gen}
        </button>
        {msg && <p style={{ marginTop: 16, fontSize: 13, color: "#22c55e", lineHeight: 1.5 }}>{msg}</p>}
        <p style={{ marginTop: 16, fontSize: 12, color: "#2a3a54", lineHeight: 1.5 }}>{c.note}</p>
      </div>
    </div>
  );
}
