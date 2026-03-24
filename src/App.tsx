import { useState } from "react";
import { X } from "lucide-react";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Dashboard    from "./modules/Dashboard";
import AIPredictive from "./modules/AI";
import AlertSystem  from "./modules/Alerts";
import Disasters    from "./modules/Disasters";
import MapModule    from "./modules/Map";
import Placeholder  from "./modules/Placeholder";

import type { Lang } from "./types";

export default function App() {
  const [lang, setLang]         = useState<Lang>("pt");
  const [module, setModule]     = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#050d1f", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(249,115,22,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.025) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
      <aside style={{ flexShrink: 0, zIndex: 10, width: 220 }} className="desktop-only">
        <Sidebar lang={lang} setLang={setLang} module={module} setModule={setModule} />
      </aside>
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)" }} onClick={() => setMenuOpen(false)} />
          <div style={{ position: "relative", width: 260, zIndex: 51 }}>
            <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 12, right: 12, zIndex: 52, background: "none", border: "none", color: "#4a6080", cursor: "pointer" }}>
              <X size={20} />
            </button>
            <Sidebar lang={lang} setLang={setLang} module={module} setModule={setModule} onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 10, minWidth: 0 }}>
        <Header lang={lang} onMenuOpen={() => setMenuOpen(true)} />
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>

          {/* Mapa sempre montado — só esconde com CSS para o Leaflet não quebrar */}
          <div style={{ display: module === "map" ? "block" : "none" }}>
            <MapModule lang={lang} />
          </div>

          {module === "dashboard" && <Dashboard    lang={lang} />}
          {module === "ai"        && <AIPredictive lang={lang} />}
          {module === "alerts"    && <AlertSystem  lang={lang} />}
          {module === "disasters" && <Disasters    lang={lang} />}
          {module !== "dashboard" && module !== "ai" && module !== "alerts" && module !== "disasters" && module !== "map" && (
            <Placeholder lang={lang} moduleId={module} />
          )}

        </main>
        <Footer lang={lang} />
      </div>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .desktop-only { display: flex !important; }
        .mobile-only  { display: none  !important; }
        @media (max-width: 768px) {
          .desktop-only { display: none  !important; }
          .mobile-only  { display: flex  !important; }
        }
      `}</style>
    </div>
  );
}