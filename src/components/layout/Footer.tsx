import type { Lang } from "../../types";
import { translationsBundle } from "../../i18n/translations";

interface FooterProps {
  lang: Lang;
}

export default function Footer({ lang }: FooterProps) {
  const t = translationsBundle(lang);
  return (
    <footer style={{
      padding: "10px 24px", borderTop: "1px solid #1a2744",
      background: "rgba(6,14,34,0.95)", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#2a3a54", fontWeight: 700 }}>SENTRIX v3.0</span>
        <span style={{ color: "#1a2744" }}>•</span>
        <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>{t.systemActive}</span>
      </div>
      <span style={{ fontSize: 12, color: "#1a2744", fontFamily: "monospace" }}>INTELLIGENT GLOBAL RISK MANAGEMENT</span>
    </footer>
  );
}