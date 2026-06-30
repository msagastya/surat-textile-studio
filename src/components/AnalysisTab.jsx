import { T, btn, card, h2s, h2c } from "../styles/theme.js";

const SECTIONS = [
  { name: "Fabric ID",   color: "#1fc8c0" },
  { name: "Design",      color: "#bf6ff5" },
  { name: "Tech Specs",  color: "#6b7ff5" },
  { name: "Zari Work",   color: "#e4a832" },
  { name: "Market Fit",  color: "#34c97a" },
  { name: "Loom Setup",  color: "#e03e5c" },
  { name: "Yarn",        color: "#e4a832" },
  { name: "Catalog",     color: "#34c97a" },
  { name: "Cost",        color: "#34c97a" },
  { name: "Tips",        color: "#6b7ff5" },
];

const DOTS = [
  "#e4a832", "#e03e5c", "#bf6ff5", "#6b7ff5", "#1fc8c0",
  "#34c97a", "#e4a832", "#e03e5c", "#bf6ff5", "#6b7ff5",
];

export default function AnalysisTab({ aiLoading, aiAnalysis, runAI, image }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={h2c("#6b7ff5")}>AI Analysis</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            Surat Market Expert Report
          </div>
        </div>
        <button onClick={runAI} disabled={!image || aiLoading} style={btn("indigo", !image || aiLoading)}>
          {aiLoading ? "Analyzing..." : "Re-analyze →"}
        </button>
      </div>

      {aiLoading && (
        <div style={{
          ...card,
          textAlign: "center", padding: 80,
          background: `linear-gradient(135deg, ${T.panel} 0%, rgba(107,127,245,0.06) 100%)`,
          border: `1px solid rgba(107,127,245,0.3)`,
        }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🤖</div>
          <div style={{
            background: "linear-gradient(90deg, #e4a832, #e03e5c, #bf6ff5, #6b7ff5, #1fc8c0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            fontFamily: "var(--font-serif)", fontSize: 20, marginBottom: 10, fontWeight: 700,
          }}>
            Analyzing with Surat market expertise...
          </div>
          <div style={{ color: T.textDim, fontSize: 12, lineHeight: 2.2 }}>
            Fabric identification · Zari detection · Loom setup · Catalog fit · Price estimate
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28 }}>
            {DOTS.slice(0, 5).map((col, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: "50%", background: col,
                animation: `ds-pulse 1.4s ${i * 0.18}s ease-in-out infinite`,
                boxShadow: `0 0 8px ${col}`,
              }} />
            ))}
          </div>
          <style>{`@keyframes ds-pulse{0%,100%{opacity:0.2;transform:scale(0.7)}50%{opacity:1;transform:scale(1.3)}}`}</style>
        </div>
      )}

      {!aiLoading && aiAnalysis && (
        <div style={{
          ...card,
          background: `linear-gradient(135deg, ${T.panel} 0%, rgba(107,127,245,0.04) 100%)`,
          border: `1px solid rgba(107,127,245,0.25)`,
        }}>
          {/* Section index pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${T.border}` }}>
            {SECTIONS.map((s, i) => (
              <span key={s.name} style={{
                background: s.color + "18",
                border: `1px solid ${s.color}44`,
                borderRadius: 20,
                padding: "4px 12px", fontSize: 10, color: s.color,
                display: "inline-flex", alignItems: "center", gap: 6,
                fontWeight: 600,
              }}>
                <span style={{ opacity: 0.6 }}>{i + 1}</span>
                {s.name}
              </span>
            ))}
          </div>
          <pre style={{ color: T.text, fontSize: 12, lineHeight: 2.2, whiteSpace: "pre-wrap", margin: 0, fontFamily: "var(--font-mono)" }}>
            {aiAnalysis}
          </pre>
        </div>
      )}

      {!aiLoading && !aiAnalysis && (
        <div style={{
          ...card, textAlign: "center", padding: 80,
          background: `linear-gradient(135deg, ${T.panel} 0%, rgba(107,127,245,0.04) 100%)`,
        }}>
          <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.3 }}>🤖</div>
          <div style={{ color: T.textDim, fontSize: 16, fontFamily: "var(--font-serif)", marginBottom: 10 }}>No analysis yet</div>
          <div style={{ color: T.muted, fontSize: 12 }}>
            Load a fabric image and click{" "}
            <span style={{ color: "#6b7ff5" }}>"Run Full AI Analysis"</span>
            {" "}in the Import tab.
          </div>
        </div>
      )}
    </div>
  );
}
