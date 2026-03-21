import { useState } from "react";
import { Globe, AlertTriangle, Building2, Brain, Radio, Heart, Database, Bot, Signal, FileText, Menu, X, MapPin, Users, TrendingUp, Zap, Activity, Bell, Shield } from "lucide-react";

type Lang = "pt" | "en" | "es";

const T = {
  pt: {
    title: "PAINEL CENTRAL DE COMANDO",
    subtitle: "Monitoramento preditivo em tempo real • Estado de São Paulo",
    systemActive: "SISTEMA ATIVO", model: "MODELO IA v4.0",
    operator: "Operador", defense: "Defesa Civil SP",
    alerts: "ALERTAS ATIVOS", areas: "ÁREAS MONITORADAS",
    sensors: "SENSORES ONLINE", teams: "EQUIPES EM CAMPO",
    lives: "VIDAS PROTEGIDAS", damage: "PREJUÍZO EVITADO",
    actions: "AÇÕES RÁPIDAS",
    emitAlert: "EMITIR ALERTA", dispatch: "DESPACHAR EQUIPE",
    civil: "DEFESA CIVIL", comm: "COMUNICADO",
    checkSensors: "SENSORES", report: "RELATÓRIO",
    nav: {
      dashboard: "Painel Central", map: "Mapa Inteligente",
      disasters: "Catástrofes Naturais", urban: "Monitoramento Urbano",
      ai: "IA Preditiva", alertSystem: "Sistema de Alertas",
      impact: "Impacto Social", data: "Integração de Dados",
      automation: "Automação IA", tech: "Tecnologias",
      global: "Visão Global", reports: "Relatórios",
    }
  },
  en: {
    title: "CENTRAL COMMAND PANEL",
    subtitle: "Real-time predictive monitoring • State of São Paulo",
    systemActive: "SYSTEM ACTIVE", model: "AI MODEL v4.0",
    operator: "Operator", defense: "Civil Defense SP",
    alerts: "ACTIVE ALERTS", areas: "MONITORED AREAS",
    sensors: "SENSORS ONLINE", teams: "TEAMS IN FIELD",
    lives: "LIVES PROTECTED", damage: "DAMAGE AVOIDED",
    actions: "QUICK ACTIONS",
    emitAlert: "EMIT ALERT", dispatch: "DISPATCH TEAM",
    civil: "CIVIL DEFENSE", comm: "BROADCAST",
    checkSensors: "SENSORS", report: "REPORT",
    nav: {
      dashboard: "Command Center", map: "Smart Map",
      disasters: "Natural Disasters", urban: "Urban Monitoring",
      ai: "Predictive AI", alertSystem: "Alert System",
      impact: "Social Impact", data: "Data Integration",
      automation: "AI Automation", tech: "Technologies",
      global: "Global Vision", reports: "Reports",
    }
  },
  es: {
    title: "PANEL CENTRAL DE COMANDO",
    subtitle: "Monitoreo predictivo en tiempo real • Estado de São Paulo",
    systemActive: "SISTEMA ACTIVO", model: "MODELO IA v4.0",
    operator: "Operador", defense: "Defensa Civil SP",
    alerts: "ALERTAS ACTIVAS", areas: "ÁREAS MONITOREADAS",
    sensors: "SENSORES EN LÍNEA", teams: "EQUIPOS EN CAMPO",
    lives: "VIDAS PROTEGIDAS", damage: "DAÑO EVITADO",
    actions: "ACCIONES RÁPIDAS",
    emitAlert: "EMITIR ALERTA", dispatch: "DESPACHAR EQUIPO",
    civil: "DEFENSA CIVIL", comm: "COMUNICADO",
    checkSensors: "SENSORES", report: "INFORME",
    nav: {
      dashboard: "Panel Central", map: "Mapa Inteligente",
      disasters: "Catástrofes Naturales", urban: "Monitoreo Urbano",
      ai: "IA Predictiva", alertSystem: "Sistema de Alertas",
      impact: "Impacto Social", data: "Integración de Datos",
      automation: "Automatización IA", tech: "Tecnologías",
      global: "Visión Global", reports: "Informes",
    }
  }
};

const navItems = (t: typeof T.pt) => [
  { id: "dashboard", label: t.nav.dashboard, icon: Shield, badge: null },
  { id: "map", label: t.nav.map, icon: Globe, badge: null },
  { id: "disasters", label: t.nav.disasters, icon: AlertTriangle, badge: 2 },
  { id: "urban", label: t.nav.urban, icon: Building2, badge: 5 },
  { id: "ai", label: t.nav.ai, icon: Brain, badge: null },
  { id: "alerts", label: t.nav.alertSystem, icon: Radio, badge: 3 },
  { id: "impact", label: t.nav.impact, icon: Heart, badge: null },
  { id: "data", label: t.nav.data, icon: Database, badge: null },
  { id: "automation", label: t.nav.automation, icon: Bot, badge: null },
  { id: "tech", label: t.nav.tech, icon: Signal, badge: null },
  { id: "global", label: t.nav.global, icon: Globe, badge: null },
  { id: "reports", label: t.nav.reports, icon: FileText, badge: null },
];

const stats = (t: typeof T.pt) => [
  { icon: AlertTriangle, label: t.alerts, value: "3", color: "#ef4444", pulse: true },
  { icon: MapPin, label: t.areas, value: "127", color: "#3b82f6", pulse: false },
  { icon: Activity, label: t.sensors, value: "94%", color: "#22c55e", pulse: false },
  { icon: Users, label: t.teams, value: "8", color: "#f59e0b", pulse: false },
  { icon: Heart, label: t.lives, value: "2.8K", color: "#22c55e", pulse: false },
  { icon: TrendingUp, label: t.damage, value: "R$4.2B", color: "#06b6d4", pulse: false },
];

export default function App() {
  const [lang, setLang] = useState<Lang>("pt");
  const [module, setModule] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = T[lang];
  const nav = navItems(t);
  const statCards = stats(t);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "linear-gradient(180deg, #060e22 0%, #050d1f 100%)",
      borderRight: "1px solid #1a2744",
      width: mobile ? "100%" : "260px",
    }}>
      {/* Logo grande e impactante */}
      <div style={{
        padding: "24px 16px 16px",
        borderBottom: "1px solid #1a2744",
        display: "flex", flexDirection: "column", alignItems: "center",
        background: "linear-gradient(180deg, rgba(6,182,212,0.06) 0%, transparent 100%)",
        position: "relative",
      }}>
        {/* Glow atrás da logo */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 180, height: 180,
          background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <img
          src="/logo.png"
          alt="SENTRIX"
          style={{
            width: "100%",
            maxWidth: 220,
            height: "auto",
            objectFit: "contain",
            filter: "drop-shadow(0 0 16px rgba(6,182,212,0.5)) drop-shadow(0 0 32px rgba(6,182,212,0.2))",
            position: "relative",
            zIndex: 1,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, zIndex: 1 }}>
          <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, letterSpacing: "0.2em" }}>{t.systemActive}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ id, label, icon: Icon, badge }) => {
          const active = module === id;
          return (
            <button key={id} onClick={() => { setModule(id); setMenuOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, border: "none",
                cursor: "pointer", width: "100%", textAlign: "left",
                background: active ? "rgba(249,115,22,0.12)" : "transparent",
                borderLeft: active ? "2px solid #f97316" : "2px solid transparent",
                color: active ? "#fed7aa" : "#4a6080",
                transition: "all 0.15s",
                justifyContent: "space-between",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#94a3b8"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#4a6080"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
              </div>
              {badge && (
                <span style={{
                  fontSize: 9, fontWeight: 900, padding: "1px 5px",
                  background: "rgba(239,68,68,0.2)", color: "#ef4444",
                  border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10,
                }}>{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Lang */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid #1a2744" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "#0a1628", borderRadius: 8, border: "1px solid #1a2744" }}>
          {(["pt", "en", "es"] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{
                flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
                cursor: "pointer", fontSize: 11, fontWeight: 900,
                textTransform: "uppercase", letterSpacing: "0.1em",
                background: lang === l ? "rgba(249,115,22,0.2)" : "transparent",
                color: lang === l ? "#f97316" : "#2a3a54",
                transition: "all 0.15s",
              }}
            >{l}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#050d1f", overflow: "hidden" }}>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(249,115,22,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.025) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />
      <div style={{ position: "fixed", top: -150, left: -150, width: 600, height: 600, background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -150, right: -150, width: 600, height: 600, background: "radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Desktop Sidebar */}
      <aside style={{ flexShrink: 0, zIndex: 10, width: 260 }} className="desktop-only">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "relative", width: 280, zIndex: 51 }}>
            <button onClick={() => setMenuOpen(false)} style={{
              position: "absolute", top: 12, right: 12, zIndex: 52,
              background: "none", border: "none", color: "#4a6080", cursor: "pointer"
            }}>
              <X size={20} />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 10, minWidth: 0 }}>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", height: 54, flexShrink: 0,
          background: "rgba(6,14,34,0.95)", borderBottom: "1px solid #1a2744",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMenuOpen(true)} className="mobile-only"
              style={{ background: "none", border: "none", color: "#4a6080", cursor: "pointer", padding: 4 }}>
              <Menu size={20} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-only">
              <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, letterSpacing: "0.12em" }}>{t.systemActive}</span>
              <span style={{ color: "#1a2744", margin: "0 8px" }}>|</span>
              <span style={{ fontSize: 10, color: "#2a3a54", fontFamily: "monospace" }}>{t.model}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "none", border: "none", color: "#4a6080", cursor: "pointer", padding: 6 }}>
              <Bell size={16} />
              <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, background: "#ef4444", borderRadius: "50%" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "#0a1628", border: "1px solid #1a2744", borderRadius: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 7, fontWeight: 900, color: "white" }}>OP</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{t.operator}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          {module === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Title */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                  <div style={{ width: 3, height: 32, background: "linear-gradient(180deg, #f97316, #06b6d4)", borderRadius: 2 }} />
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>{t.title}</h1>
                </div>
                <p style={{ fontSize: 10, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.12em", marginLeft: 15 }}>{t.subtitle}</p>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                {statCards.map(({ icon: Icon, label, value, color, pulse }) => (
                  <div key={label} style={{
                    padding: 18, borderRadius: 12,
                    background: "linear-gradient(135deg, #0a1628, #060e22)",
                    border: "1px solid #1a2744", cursor: "default",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ padding: 8, borderRadius: 8, background: color + "15", border: `1px solid ${color}25` }}>
                        <Icon size={15} color={color} />
                      </div>
                      {pulse && <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
                    </div>
                    <p style={{ fontSize: 24, fontWeight: 900, color, fontFamily: "monospace", margin: 0, lineHeight: 1 }}>{value}</p>
                    <p style={{ fontSize: 9, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <p style={{ fontSize: 9, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12, fontWeight: 700 }}>{t.actions}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
                  {[
                    { icon: Zap, label: t.emitAlert, color: "#ef4444" },
                    { icon: Users, label: t.dispatch, color: "#f97316" },
                    { icon: Shield, label: t.civil, color: "#3b82f6" },
                    { icon: Radio, label: t.comm, color: "#22c55e" },
                    { icon: Activity, label: t.checkSensors, color: "#06b6d4" },
                    { icon: FileText, label: t.report, color: "#8b5cf6" },
                  ].map(({ icon: Icon, label, color }) => (
                    <button key={label} style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      padding: "14px 8px", borderRadius: 10,
                      background: color + "0d", border: `1px solid ${color}25`,
                      color, cursor: "pointer", transition: "all 0.15s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = color + "20"; e.currentTarget.style.transform = "scale(1.04)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = color + "0d"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      <Icon size={18} />
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div style={{
                padding: 32, borderRadius: 12,
                background: "linear-gradient(135deg, #0a1628, #060e22)",
                border: "1px solid #1a2744", textAlign: "center",
                minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 10,
              }}>
                <Globe size={40} color="#1a2744" />
                <p style={{ color: "#2a3a54", fontSize: 11, fontFamily: "monospace" }}>
                  🛰 SENTRIX MAP ENGINE — {lang === "pt" ? "Módulos em construção" : lang === "en" ? "Modules under construction" : "Módulos en construcción"}
                </p>
              </div>

            </div>
          )}

          {module !== "dashboard" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: 32, borderRadius: 16, background: "#0a1628", border: "1px solid #1a2744", textAlign: "center", maxWidth: 400 }}>
                <p style={{ color: "#f97316", fontWeight: 900, fontSize: 16, letterSpacing: "0.1em", marginBottom: 10 }}>
                  {nav.find(n => n.id === module)?.label}
                </p>
                <p style={{ color: "#2a3a54", fontSize: 11, fontFamily: "monospace" }}>
                  {lang === "pt" ? "Módulo em desenvolvimento" : lang === "en" ? "Module under development" : "Módulo en desarrollo"}
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          padding: "8px 24px", borderTop: "1px solid #1a2744",
          background: "rgba(6,14,34,0.95)", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 9, color: "#2a3a54", fontWeight: 700 }}>SENTRIX v3.0</span>
            <span style={{ color: "#1a2744" }}>•</span>
            <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700 }}>{t.systemActive}</span>
          </div>
          <span style={{ fontSize: 9, color: "#1a2744", fontFamily: "monospace" }}>INTELLIGENT GLOBAL RISK MANAGEMENT</span>
        </footer>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </div>
  );
}