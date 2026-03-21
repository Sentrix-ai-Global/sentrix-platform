import { Globe, AlertTriangle, MapPin, Users, TrendingUp, Activity, Heart, FileText, Shield, Radio, Zap } from "lucide-react";
import { Lang } from "../../types";
import { T } from "../../i18n/translations";

interface DashboardProps {
  lang: Lang;
}

export default function Dashboard({ lang }: DashboardProps) {
  const t = T[lang];

  const statCards = [
    { icon: AlertTriangle, label: t.alerts,  value: "3",      color: "#ef4444", pulse: true  },
    { icon: MapPin,        label: t.areas,   value: "127",    color: "#3b82f6", pulse: false },
    { icon: Activity,      label: t.sensors, value: "94%",    color: "#22c55e", pulse: false },
    { icon: Users,         label: t.teams,   value: "8",      color: "#f59e0b", pulse: false },
    { icon: Heart,         label: t.lives,   value: "2.8K",   color: "#22c55e", pulse: false },
    { icon: TrendingUp,    label: t.damage,  value: "R$4.2B", color: "#06b6d4", pulse: false },
  ];

  const quickActions = [
    { icon: Zap,      label: t.emitAlert,    color: "#ef4444" },
    { icon: Users,    label: t.dispatch,     color: "#f97316" },
    { icon: Shield,   label: t.civil,        color: "#3b82f6" },
    { icon: Radio,    label: t.comm,         color: "#22c55e" },
    { icon: Activity, label: t.checkSensors, color: "#06b6d4" },
    { icon: FileText, label: t.report,       color: "#8b5cf6" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Hero logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px 24px", background: "linear-gradient(135deg, #0a1628, #060e22)", borderRadius: 16, border: "1px solid #1a2744", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 300, background: "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <img src="/logo.png" alt="SENTRIX" style={{ width: "100%", maxWidth: 480, height: "auto", filter: "drop-shadow(0 0 24px rgba(6,182,212,0.6)) drop-shadow(0 0 48px rgba(6,182,212,0.2))", position: "relative", zIndex: 1 }} />
        <p style={{ fontSize: 13, color: "#2a3a54", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace", marginTop: 16, zIndex: 1 }}>{t.subtitle}</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        {statCards.map(({ icon: Icon, label, value, color, pulse }) => (
          <div key={label}
            style={{ padding: 20, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", cursor: "default", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ padding: 10, borderRadius: 10, background: color + "15", border: `1px solid ${color}25` }}>
                <Icon size={16} color={color} />
              </div>
              {pulse && <span style={{ width: 9, height: 9, background: "#ef4444", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
            </div>
            <p style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "monospace", margin: 0 }}>{value}</p>
            <p style={{ fontSize: 13, color: "#4a6080", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 8 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p style={{ fontSize: 13, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 14, fontWeight: 700 }}>{t.actions}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          {quickActions.map(({ icon: Icon, label, color }) => (
            <button key={label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 8px", borderRadius: 12, background: color + "0d", border: `1px solid ${color}25`, color, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = color + "20"; e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = color + "0d"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div style={{ padding: 32, borderRadius: 14, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", textAlign: "center", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <Globe size={44} color="#1a2744" />
        <p style={{ fontSize: 13, color: "#2a3a54", fontFamily: "monospace" }}>🛰 SENTRIX MAP ENGINE – {t.building}</p>
      </div>

    </div>
  );
}