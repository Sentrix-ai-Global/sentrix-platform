import { Bell, Menu } from "lucide-react";
import type { Lang } from "../../types";
import { translationsBundle } from "../../i18n/translations";

interface HeaderProps {
  lang: Lang;
  onMenuOpen: () => void;
}

export default function Header({ lang, onMenuOpen }: HeaderProps) {
  const t = translationsBundle(lang);

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 56, flexShrink: 0,
      background: "rgba(6,14,34,0.95)", borderBottom: "1px solid #1a2744",
      backdropFilter: "blur(20px)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onMenuOpen} className="mobile-only" style={{ background: "none", border: "none", color: "#4a6080", cursor: "pointer", padding: 4 }}>
          <Menu size={22} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-only">
          <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 14, color: "#22c55e", fontWeight: 700, letterSpacing: "0.12em" }}>{t.systemActive}</span>
          <span style={{ color: "#1a2744", margin: "0 8px" }}>|</span>
          <span style={{ fontSize: 13, color: "#2a3a54", fontFamily: "monospace" }}>{t.model}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button style={{ position: "relative", background: "none", border: "none", color: "#4a6080", cursor: "pointer", padding: 6 }}>
          <Bell size={18} />
          <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "#ef4444", borderRadius: "50%" }} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", background: "#0a1628", border: "1px solid #1a2744", borderRadius: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: "white" }}>OP</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>{t.operator}</span>
        </div>
      </div>
    </header>
  );
}