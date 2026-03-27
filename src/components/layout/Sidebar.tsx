import { Globe, AlertTriangle, Building2, Brain, Radio, Heart, Database, Bot, Signal, FileText, Shield, Activity, Droplets, Wind, Flame } from "lucide-react";
import type { Lang } from "../../types";
import { T } from "../../i18n/translations";

interface SidebarProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  module: string;
  setModule: (m: string) => void;
  onClose?: () => void;
}

const navItems = (t: typeof T.pt) => [
  { id: "dashboard",   label: t.nav.dashboard,   icon: Shield,        badge: null },
  { id: "map",         label: t.nav.map,          icon: Globe,         badge: null },
  { id: "earthquakes", label: t.nav.earthquakes,  icon: Activity,      badge: null },
  { id: "floods",      label: t.nav.floods,       icon: Droplets,      badge: null },
  { id: "airquality",  label: t.nav.airquality,   icon: Wind,          badge: null },
  { id: "wildfires",   label: t.nav.wildfires,    icon: Flame,         badge: null },
  { id: "disasters",   label: t.nav.disasters,    icon: AlertTriangle, badge: 2    },
  { id: "urban",       label: t.nav.urban,        icon: Building2,     badge: 5    },
  { id: "ai",          label: t.nav.ai,           icon: Brain,         badge: null },
  { id: "alerts",      label: t.nav.alertSystem,  icon: Radio,         badge: 3    },
  { id: "impact",      label: t.nav.impact,       icon: Heart,         badge: null },
  { id: "data",        label: t.nav.data,         icon: Database,      badge: null },
  { id: "automation",  label: t.nav.automation,   icon: Bot,           badge: null },
  { id: "tech",        label: t.nav.tech,         icon: Signal,        badge: null },
  { id: "global",      label: t.nav.global,       icon: Globe,         badge: null },
  { id: "reports",     label: t.nav.reports,      icon: FileText,      badge: null },
];

export default function Sidebar({ lang, setLang, module, setModule, onClose }: SidebarProps) {
  const t = T[lang];
  const nav = navItems(t);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(180deg, #060e22 0%, #050d1f 100%)", borderRight: "1px solid #1a2744", width: "100%" }}>
      <div style={{ padding: "16px 12px", borderBottom: "1px solid #1a2744", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img src="/logo.png" alt="SENTRIX" style={{ width: 150, height: "auto", filter: "drop-shadow(0 0 8px rgba(6,182,212,0.4))" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700, letterSpacing: "0.15em" }}>{t.systemActive}</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ id, label, icon: Icon, badge }) => {
          const active = module === id;
          return (
            <button key={id} onClick={() => { setModule(id); onClose?.(); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left", background: active ? "rgba(249,115,22,0.12)" : "transparent", borderLeft: active ? "2px solid #f97316" : "2px solid transparent", color: active ? "#fed7aa" : "#4a6080", transition: "all 0.15s", justifyContent: "space-between" }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#94a3b8"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#4a6080"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
              </div>
              {badge && <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 6px", background: "rgba(239,68,68,0.2)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10 }}>{badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "10px 8px", borderTop: "1px solid #1a2744" }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "#0a1628", borderRadius: 8, border: "1px solid #1a2744" }}>
          {(["pt", "en", "es"] as Lang[]).map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 900, textTransform: "uppercase", background: lang === l ? "rgba(249,115,22,0.2)" : "transparent", color: lang === l ? "#f97316" : "#2a3a54", transition: "all 0.15s" }}
            >{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}