import { Brain, Target, Bell, Clock, MapPin, ChevronRight, Cpu } from "lucide-react";
import { Lang } from "../../types";
import { T } from "../../i18n/translations";
import { levelConfig, RiskLevel } from "../../types";

interface AIProps {
  lang: Lang;
}

export default function AIPredictive({ lang }: AIProps) {
  const ai = T[lang].ai;

  const statsCards = [
    { icon: Target, label: ai.accuracy,    value: "94%", color: "#8b5cf6" },
    { icon: Brain,  label: ai.predictions, value: "5",   color: "#06b6d4" },
    { icon: Bell,   label: ai.autoAlerts,  value: "2",   color: "#f97316" },
    { icon: Clock,  label: ai.window,      value: "72h", color: "#22c55e" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 4, height: 36, background: "linear-gradient(180deg, #8b5cf6, #06b6d4)", borderRadius: 2 }} />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>{ai.title}</h1>
        </div>
        <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginLeft: 16 }}>{ai.subtitle}</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {statsCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label}
            style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", transition: "all 0.2s", cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ padding: 10, borderRadius: 10, background: color + "15", border: `1px solid ${color}25`, display: "inline-flex", marginBottom: 12 }}>
              <Icon size={16} color={color} />
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
            <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Model status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12 }}>
        <Cpu size={16} color="#8b5cf6" />
        <span style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 700 }}>{ai.modelActive}: SENTRIX-AI v4.0</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#2a3a54", fontFamily: "monospace" }}>{ai.lastUpdate}: 2 min</span>
      </div>

      {/* Events list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ai.events.map((event, i) => {
          const cfg = levelConfig[event.level as RiskLevel];
          const levelLabel = ai[event.level as keyof typeof ai] as string;
          return (
            <div key={i} style={{ padding: 22, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: `1px solid ${cfg.border}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: cfg.color, borderRadius: "14px 0 0 14px" }} />
              <div style={{ paddingLeft: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{event.title}</span>
                      {event.level === "critical" && <span style={{ width: 9, height: 9, background: cfg.color, borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={12} color="#4a6080" />
                      <span style={{ fontSize: 13, color: "#4a6080" }}>{event.location}</span>
                    </div>
                  </div>
                  <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 900, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{levelLabel}</span>
                </div>

                {/* Progress bars */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[
                    { label: ai.probability, value: event.probability, color: cfg.color },
                    { label: ai.confidence,  value: event.confidence,  color: "#06b6d4" }
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#4a6080", fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
                        <span style={{ fontSize: 13, color, fontWeight: 900, fontFamily: "monospace" }}>{value}%</span>
                      </div>
                      <div style={{ height: 5, background: "#0a1628", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Window */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Clock size={12} color="#4a6080" />
                  <span style={{ fontSize: 13, color: "#4a6080" }}>{ai.window_label}: <strong style={{ color: "#94a3b8" }}>{event.window}</strong></span>
                </div>

                {/* Factors */}
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>{ai.factors}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {event.factors.map((f, j) => (
                      <span key={j} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1a2744", color: "#6a8099" }}>{f}</span>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div style={{ padding: "10px 14px", borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <ChevronRight size={14} color={cfg.color} />
                  <span style={{ fontSize: 13, color: cfg.color, fontWeight: 600 }}>{ai.recommendation}: {event.recommendation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}