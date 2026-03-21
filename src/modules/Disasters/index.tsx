import { Lang } from "../../types";
import { T } from "../../i18n/translations";
import { statusConfig, DisasterStatus } from "../../types";

interface DisastersProps {
  lang: Lang;
}

export default function Disasters({ lang }: DisastersProps) {
  const d = T[lang].disasters;
  const statusLabel = { critical: d.critical, alert: d.alert, monitoring: d.monitoring, safe: d.safe };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #f97316, #ef4444)", borderRadius: 2 }} />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>{d.title}</h1>
        </div>
        <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: 16 }}>{d.subtitle}</p>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {d.types.map((type, i) => {
          const sc = statusConfig[type.status as DisasterStatus];
          const sl = statusLabel[type.status as keyof typeof statusLabel];
          return (
            <div key={i}
              style={{ padding: 22, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: `1px solid ${sc.color}30`, transition: "all 0.2s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = sc.color + "60"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = sc.color + "30"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{type.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{type.name}</span>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 900, background: sc.color + "20", color: sc.color, border: `1px solid ${sc.color}40` }}>{sl}</span>
              </div>

              {/* Risk bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#4a6080", fontWeight: 700, textTransform: "uppercase" }}>{d.riskLevel}</span>
                  <span style={{ fontSize: 14, color: sc.color, fontWeight: 900, fontFamily: "monospace" }}>{type.risk}%</span>
                </div>
                <div style={{ height: 6, background: "#0a1628", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${type.risk}%`, background: `linear-gradient(90deg, ${sc.color}, ${sc.color}99)`, borderRadius: 3 }} />
                </div>
              </div>

              {/* Footer stats */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: sc.color, fontFamily: "monospace" }}>{type.alerts}</span>
                    <span style={{ fontSize: 12, color: "#4a6080", marginLeft: 4 }}>{d.alertsLabel}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#94a3b8", fontFamily: "monospace" }}>{type.areas}</span>
                    <span style={{ fontSize: 12, color: "#4a6080", marginLeft: 4 }}>{d.areasLabel}</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#2a3a54", fontFamily: "monospace" }}>{d.updated} {type.updated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}