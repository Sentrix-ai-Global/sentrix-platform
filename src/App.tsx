import { useState } from "react";
import { Globe, AlertTriangle, Building2, Brain, Radio, Heart, Database, Bot, Signal, FileText, Menu, X, MapPin, Users, TrendingUp, Zap, Activity, Bell, Shield, ChevronRight, Clock, Target, Cpu, TrendingDown } from "lucide-react";

type Lang = "pt" | "en" | "es";

const T = {
  pt: {
    title: "PAINEL CENTRAL DE COMANDO",
    subtitle: "Monitoramento preditivo em tempo real • Estado de São Paulo",
    systemActive: "SISTEMA ATIVO", model: "MODELO IA v4.0",
    operator: "Operador",
    alerts: "ALERTAS ATIVOS", areas: "ÁREAS MONITORADAS",
    sensors: "SENSORES ONLINE", teams: "EQUIPES EM CAMPO",
    lives: "VIDAS PROTEGIDAS", damage: "PREJUÍZO EVITADO",
    actions: "AÇÕES RÁPIDAS",
    emitAlert: "EMITIR ALERTA", dispatch: "DESPACHAR EQUIPE",
    civil: "DEFESA CIVIL", comm: "COMUNICADO",
    checkSensors: "SENSORES", report: "RELATÓRIO",
    building: "Módulos em construção",
    inDev: "Módulo em desenvolvimento",
    ai: {
      title: "INTELIGÊNCIA ARTIFICIAL PREDITIVA",
      subtitle: "Previsões • Classificação de risco • Alertas automáticos preventivos",
      accuracy: "PRECISÃO DO MODELO",
      predictions: "PREVISÕES ATIVAS",
      autoAlerts: "ALERTAS AUTO",
      window: "JANELA PREV.",
      critical: "CRÍTICO", high: "ALTO", medium: "MÉDIO", low: "BAIXO",
      probability: "Probabilidade", confidence: "Confiança IA",
      factors: "Fatores contribuintes",
      recommendation: "Recomendação",
      window_label: "Janela",
      modelActive: "Modelo ativo",
      lastUpdate: "Última atualização",
      events: [
        {
          title: "Enchente Urbana", location: "Zona Sul – Jabaquara, Santo Amaro",
          level: "critical", probability: 87, confidence: 92,
          window: "Próximas 6 horas",
          factors: ["Precipitação 120mm prevista", "Solo saturado", "Maré alta"],
          recommendation: "Evacuar áreas de risco imediato",
        },
        {
          title: "Deslizamento de Terra", location: "Zona Norte – Brasilândia",
          level: "high", probability: 73, confidence: 85,
          window: "12–24 horas",
          factors: ["Acumulado 72h: 180mm", "Inclinação > 30°", "Histórico de ocorrências"],
          recommendation: "Monitoramento intensivo e alerta preventivo",
        },
        {
          title: "Colapso de Tráfego", location: "Marginal Pinheiros – Toda extensão",
          level: "medium", probability: 65, confidence: 78,
          window: "Hoje 17:00–20:00",
          factors: ["Evento no Allianz Parque", "Obras Km 8", "Previsão de chuva"],
          recommendation: "Ativar rotas alternativas e sinalização",
        },
        {
          title: "Onda de Calor Extremo", location: "Região Metropolitana",
          level: "medium", probability: 82, confidence: 88,
          window: "Próximos 3–5 dias",
          factors: ["Massa de ar quente", "Baixa umidade", "Bloqueio atmosférico"],
          recommendation: "Alertar população vulnerável e ampliar atendimento",
        },
        {
          title: "Tempestade Severa", location: "Zona Leste",
          level: "low", probability: 35, confidence: 62,
          window: "48–72 horas",
          factors: ["Sistema frontal em formação", "Instabilidade moderada"],
          recommendation: "Continuar monitoramento padrão",
        },
      ]
    },
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
    operator: "Operator",
    alerts: "ACTIVE ALERTS", areas: "MONITORED AREAS",
    sensors: "SENSORS ONLINE", teams: "TEAMS IN FIELD",
    lives: "LIVES PROTECTED", damage: "DAMAGE AVOIDED",
    actions: "QUICK ACTIONS",
    emitAlert: "EMIT ALERT", dispatch: "DISPATCH TEAM",
    civil: "CIVIL DEFENSE", comm: "BROADCAST",
    checkSensors: "SENSORS", report: "REPORT",
    building: "Modules under construction",
    inDev: "Module under development",
    ai: {
      title: "PREDICTIVE ARTIFICIAL INTELLIGENCE",
      subtitle: "Forecasts • Risk classification • Automatic preventive alerts",
      accuracy: "MODEL ACCURACY", predictions: "ACTIVE PREDICTIONS",
      autoAlerts: "AUTO ALERTS", window: "PRED. WINDOW",
      critical: "CRITICAL", high: "HIGH", medium: "MEDIUM", low: "LOW",
      probability: "Probability", confidence: "AI Confidence",
      factors: "Contributing factors", recommendation: "Recommendation",
      window_label: "Window", modelActive: "Model active", lastUpdate: "Last update",
      events: [
        { title: "Urban Flood", location: "South Zone – Jabaquara, Santo Amaro", level: "critical", probability: 87, confidence: 92, window: "Next 6 hours", factors: ["120mm precipitation forecast", "Saturated soil", "High tide"], recommendation: "Evacuate risk areas immediately" },
        { title: "Landslide", location: "North Zone – Brasilândia", level: "high", probability: 73, confidence: 85, window: "12–24 hours", factors: ["72h accumulation: 180mm", "Slope > 30°", "Historical occurrences"], recommendation: "Intensive monitoring and preventive alert" },
        { title: "Traffic Collapse", location: "Marginal Pinheiros – Full extension", level: "medium", probability: 65, confidence: 78, window: "Today 17:00–20:00", factors: ["Event at Allianz Parque", "Works Km 8", "Rain forecast"], recommendation: "Activate alternative routes and signaling" },
        { title: "Extreme Heat Wave", location: "Metropolitan Region", level: "medium", probability: 82, confidence: 88, window: "Next 3–5 days", factors: ["Hot air mass", "Low humidity", "Atmospheric blocking"], recommendation: "Alert vulnerable population and expand care" },
        { title: "Severe Storm", location: "East Zone", level: "low", probability: 35, confidence: 62, window: "48–72 hours", factors: ["Frontal system forming", "Moderate instability"], recommendation: "Continue standard monitoring" },
      ]
    },
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
    operator: "Operador",
    alerts: "ALERTAS ACTIVAS", areas: "ÁREAS MONITOREADAS",
    sensors: "SENSORES EN LÍNEA", teams: "EQUIPOS EN CAMPO",
    lives: "VIDAS PROTEGIDAS", damage: "DAÑO EVITADO",
    actions: "ACCIONES RÁPIDAS",
    emitAlert: "EMITIR ALERTA", dispatch: "DESPACHAR EQUIPO",
    civil: "DEFENSA CIVIL", comm: "COMUNICADO",
    checkSensors: "SENSORES", report: "INFORME",
    building: "Módulos en construcción",
    inDev: "Módulo en desarrollo",
    ai: {
      title: "INTELIGENCIA ARTIFICIAL PREDICTIVA",
      subtitle: "Previsiones • Clasificación de riesgo • Alertas automáticas preventivas",
      accuracy: "PRECISIÓN DEL MODELO", predictions: "PREDICCIONES ACTIVAS",
      autoAlerts: "ALERTAS AUTO", window: "VENTANA PREV.",
      critical: "CRÍTICO", high: "ALTO", medium: "MEDIO", low: "BAJO",
      probability: "Probabilidad", confidence: "Confianza IA",
      factors: "Factores contribuyentes", recommendation: "Recomendación",
      window_label: "Ventana", modelActive: "Modelo activo", lastUpdate: "Última actualización",
      events: [
        { title: "Inundación Urbana", location: "Zona Sur – Jabaquara, Santo Amaro", level: "critical", probability: 87, confidence: 92, window: "Próximas 6 horas", factors: ["Precipitación 120mm prevista", "Suelo saturado", "Marea alta"], recommendation: "Evacuar áreas de riesgo inmediatamente" },
        { title: "Deslizamiento de Tierra", location: "Zona Norte – Brasilândia", level: "high", probability: 73, confidence: 85, window: "12–24 horas", factors: ["Acumulado 72h: 180mm", "Inclinación > 30°", "Historial de ocurrencias"], recommendation: "Monitoreo intensivo y alerta preventiva" },
        { title: "Colapso de Tráfico", location: "Marginal Pinheiros – Toda la extensión", level: "medium", probability: 65, confidence: 78, window: "Hoy 17:00–20:00", factors: ["Evento en Allianz Parque", "Obras Km 8", "Previsión de lluvia"], recommendation: "Activar rutas alternativas y señalización" },
        { title: "Ola de Calor Extremo", location: "Región Metropolitana", level: "medium", probability: 82, confidence: 88, window: "Próximos 3–5 días", factors: ["Masa de aire caliente", "Baja humedad", "Bloqueo atmosférico"], recommendation: "Alertar población vulnerable y ampliar atención" },
        { title: "Tormenta Severa", location: "Zona Este", level: "low", probability: 35, confidence: 62, window: "48–72 horas", factors: ["Sistema frontal en formación", "Inestabilidad moderada"], recommendation: "Continuar monitoreo estándar" },
      ]
    },
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

const levelConfig = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  high: { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(180deg, #060e22 0%, #050d1f 100%)", borderRight: "1px solid #1a2744", width: mobile ? "100%" : "220px" }}>
      <div style={{ padding: "16px 12px", borderBottom: "1px solid #1a2744", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src="/logo.png" alt="SENTRIX" style={{ width: 140, height: "auto", filter: "drop-shadow(0 0 8px rgba(6,182,212,0.4))" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, letterSpacing: "0.15em" }}>{t.systemActive}</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ id, label, icon: Icon, badge }) => {
          const active = module === id;
          return (
            <button key={id} onClick={() => { setModule(id); setMenuOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left", background: active ? "rgba(249,115,22,0.12)" : "transparent", borderLeft: active ? "2px solid #f97316" : "2px solid transparent", color: active ? "#fed7aa" : "#4a6080", transition: "all 0.15s", justifyContent: "space-between" }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#94a3b8"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#4a6080"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={14} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
              </div>
              {badge && <span style={{ fontSize: 9, fontWeight: 900, padding: "1px 5px", background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>{badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "10px 8px", borderTop: "1px solid #1a2744" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "#0a1628", borderRadius: 8, border: "1px solid #1a2744" }}>
          {(["pt", "en", "es"] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", background: lang === l ? "rgba(249,115,22,0.2)" : "transparent", color: lang === l ? "#f97316" : "#2a3a54", transition: "all 0.15s" }}
            >{l}</button>
          ))}
        </div>
      </div>
    </div>
  );

  const AIPredictiveModule = () => {
    const ai = t.ai;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ width: 3, height: 32, background: "linear-gradient(180deg, #8b5cf6, #06b6d4)", borderRadius: 2 }} />
            <h1 style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>{ai.title}</h1>
          </div>
          <p style={{ fontSize: 10, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.12em", marginLeft: 15 }}>{ai.subtitle}</p>
        </div>

        {/* Stats IA */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {[
            { icon: Target, label: ai.accuracy, value: "94%", color: "#8b5cf6" },
            { icon: Brain, label: ai.predictions, value: "5", color: "#06b6d4" },
            { icon: Bell, label: ai.autoAlerts, value: "2", color: "#f97316" },
            { icon: Clock, label: ai.window, value: "72h", color: "#22c55e" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ padding: 16, borderRadius: 12, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ padding: 8, borderRadius: 8, background: color + "15", border: `1px solid ${color}25`, display: "inline-flex", marginBottom: 10 }}>
                <Icon size={14} color={color} />
              </div>
              <p style={{ fontSize: 24, fontWeight: 900, color, fontFamily: "monospace", margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 9, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Model badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 10 }}>
          <Cpu size={14} color="#8b5cf6" />
          <span style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.1em" }}>{ai.modelActive}: SENTRIX-AI v4.0</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#2a3a54", fontFamily: "monospace" }}>{ai.lastUpdate}: 2 min</span>
        </div>

        {/* Predictions list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ai.events.map((event, i) => {
            const cfg = levelConfig[event.level as keyof typeof levelConfig];
            const levelLabel = ai[event.level as keyof typeof ai] as string;
            return (
              <div key={i} style={{ padding: 20, borderRadius: 12, background: "linear-gradient(135deg, #0a1628, #060e22)", border: `1px solid ${cfg.border}`, position: "relative", overflow: "hidden" }}>
                {/* Level accent */}
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: cfg.color, borderRadius: "12px 0 0 12px" }} />

                <div style={{ paddingLeft: 8 }}>
                  {/* Title row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{event.title}</span>
                        {event.level === "critical" && <span style={{ width: 8, height: 8, background: cfg.color, borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={10} color="#2a3a54" />
                        <span style={{ fontSize: 10, color: "#4a6080" }}>{event.location}</span>
                      </div>
                    </div>
                    <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 900, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, letterSpacing: "0.08em" }}>
                      {levelLabel}
                    </span>
                  </div>

                  {/* Bars */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[
                      { label: ai.probability, value: event.probability, color: cfg.color },
                      { label: ai.confidence, value: event.confidence, color: "#06b6d4" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 9, color: "#4a6080", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                          <span style={{ fontSize: 11, color, fontWeight: 900, fontFamily: "monospace" }}>{value}%</span>
                        </div>
                        <div style={{ height: 4, background: "#0a1628", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 2, transition: "width 1s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Window */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <Clock size={10} color="#2a3a54" />
                    <span style={{ fontSize: 10, color: "#4a6080" }}>{ai.window_label}: <strong style={{ color: "#94a3b8" }}>{event.window}</strong></span>
                  </div>

                  {/* Factors */}
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 9, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 700 }}>{ai.factors}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {event.factors.map((f, j) => (
                        <span key={j} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 9, background: "rgba(255,255,255,0.04)", border: "1px solid #1a2744", color: "#4a6080" }}>{f}</span>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <ChevronRight size={12} color={cfg.color} />
                    <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{ai.recommendation}: {event.recommendation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderModule = () => {
    if (module === "ai") return <AIPredictiveModule />;
    if (module === "dashboard") return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px 24px", background: "linear-gradient(135deg, #0a1628, #060e22)", borderRadius: 16, border: "1px solid #1a2744", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, height: 300, background: "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <img src="/logo.png" alt="SENTRIX" style={{ width: "100%", maxWidth: 480, height: "auto", filter: "drop-shadow(0 0 24px rgba(6,182,212,0.6)) drop-shadow(0 0 48px rgba(6,182,212,0.2))", position: "relative", zIndex: 1 }} />
          <p style={{ fontSize: 11, color: "#2a3a54", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "monospace", marginTop: 16, zIndex: 1 }}>{t.subtitle}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {statCards.map(({ icon: Icon, label, value, color, pulse }) => (
            <div key={label} style={{ padding: 18, borderRadius: 12, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", cursor: "default", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ padding: 8, borderRadius: 8, background: color + "15", border: `1px solid ${color}25` }}><Icon size={15} color={color} /></div>
                {pulse && <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color, fontFamily: "monospace", margin: 0, lineHeight: 1 }}>{value}</p>
              <p style={{ fontSize: 9, color: "#2a3a54", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 6 }}>{label}</p>
            </div>
          ))}
        </div>
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
              <button key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: 10, background: color + "0d", border: `1px solid ${color}25`, color, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = color + "20"; e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = color + "0d"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: 32, borderRadius: 12, background: "linear-gradient(135deg, #0a1628, #060e22)", border: "1px solid #1a2744", textAlign: "center", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
          <Globe size={40} color="#1a2744" />
          <p style={{ color: "#2a3a54", fontSize: 11, fontFamily: "monospace" }}>🛰 SENTRIX MAP ENGINE — {t.building}</p>
        </div>
      </div>
    );
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 16 }}>
        <img src="/logo.png" alt="SENTRIX" style={{ width: 200, opacity: 0.3, filter: "drop-shadow(0 0 12px rgba(6,182,212,0.3))" }} />
        <div style={{ padding: 32, borderRadius: 16, background: "#0a1628", border: "1px solid #1a2744", textAlign: "center", maxWidth: 400 }}>
          <p style={{ color: "#f97316", fontWeight: 900, fontSize: 16, letterSpacing: "0.1em", marginBottom: 10 }}>{nav.find(n => n.id === module)?.label}</p>
          <p style={{ color: "#2a3a54", fontSize: 11, fontFamily: "monospace" }}>{t.inDev}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#050d1f", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(249,115,22,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      <aside style={{ flexShrink: 0, zIndex: 10, width: 220 }} className="desktop-only"><Sidebar /></aside>
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "relative", width: 260, zIndex: 51 }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 12, right: 12, zIndex: 52, background: "none", border: "none", color: "#4a6080", cursor: "pointer" }}><X size={20} /></button>
            <Sidebar mobile />
          </div>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 10, minWidth: 0 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 54, flexShrink: 0, background: "rgba(6,14,34,0.95)", borderBottom: "1px solid #1a2744", backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMenuOpen(true)} className="mobile-only" style={{ background: "none", border: "none", color: "#4a6080", cursor: "pointer", padding: 4 }}><Menu size={20} /></button>
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
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>{renderModule()}</main>
        <footer style={{ padding: "8px 24px", borderTop: "1px solid #1a2744", background: "rgba(6,14,34,0.95)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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