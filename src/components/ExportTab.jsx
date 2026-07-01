import { T, btn, card, h2s } from "../styles/theme.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

const FORMATS = [
  ["jc5",  "JC5",  "NedGraphics Jacquard 5 — loom ready",                "🔵"],
  ["ep",   "EP",   "Electronic Pattern — Stäubli / Bonas loom transfer",  "🟣"],
  ["wif",  "WIF",  "Weaving Information File — PixeLoom / Fiberworks / AdaGio compatible", "🟠"],
  ["json", "JSON", "Full design data + AI analysis + all specs",          "🟡"],
  ["csv",  "CSV",  "Palette + yarn table for Excel / ERP",                "🟢"],
  ["all",  "ALL",  "Download all 5 files at once",                        "⭐"],
];

export default function ExportTab({
  exportFmt, setExportFmt, doExport, palette, designName, fabricType, zariType,
  targetMarket, epi, ppi, gsm, denier, weaveName, repeatW, repeatH, aiAnalysis, costEstimate,
}) {
  const { isMobile } = useBreakpoint();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={h2s}>Export</div>
        <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
          {designName}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: 24 }}>
        {/* Format picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={h2s}>Format</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {FORMATS.map(([v, label, desc, icon]) => {
                const active = exportFmt === v;
                return (
                  <div
                    key={v}
                    onClick={() => setExportFmt(v)}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 10,
                      cursor: "pointer",
                      border: `1px solid ${active ? T.goldDim : T.border}`,
                      background: active ? T.goldFaint : T.surf,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = T.borderBr; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = T.border; }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>{icon}</span>
                    <div>
                      <div style={{ color: active ? T.gold : T.text, fontWeight: 700, fontSize: 12 }}>{label}</div>
                      <div style={{ color: T.muted, fontSize: 10, marginTop: 3, lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={doExport}
              disabled={palette.length === 0}
              style={{ ...btn("gold", palette.length === 0), width: "100%", height: 42, fontSize: 12 }}
            >
              Download {exportFmt.toUpperCase()} →
            </button>

            {palette.length === 0 && (
              <div style={{ color: T.muted, fontSize: 10, textAlign: "center", marginTop: 10 }}>
                Extract colors first to enable export
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card}>
            <div style={h2s}>Design Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["Design", designName],
                ["Fabric", fabricType],
                ["Zari", zariType],
                ["Market", targetMarket.split(" ")[0]],
                ["Colors", palette.length || "–"],
                ["EPI/PPI", `${epi}/${ppi}`],
                ["GSM", gsm],
                ["Denier", denier],
                ["Weave", weaveName],
                ["Repeat", `${repeatW}×${repeatH}px`],
                ["AI Report", aiAnalysis ? "✓ Included" : "Not run"],
                ["Cost/m", costEstimate ? `₹${costEstimate.perMeter}` : "–"],
              ].map(([k, v]) => (
                <div key={k} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 9, padding: "10px 14px" }}>
                  <div style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>{k}</div>
                  <div style={{ color: T.text, fontSize: 13, marginTop: 4, fontWeight: 500 }}>{v || "–"}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={h2s}>Format Guide</div>
            {[
              ["JC5",  "NedGraphics-compatible Jacquard 5 with full color table, weave structure, and zari data."],
              ["EP",   "Electronic Pattern (PostScript) for Stäubli, Bonas, Grosse, and compatible loom systems."],
              ["JSON", "Complete structured export with AI analysis, market data, repeat, and all technical specs."],
              ["CSV",  "Yarn and color table for Excel, ERP systems, or production planning."],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 11 }}>
                <span style={{ color: T.gold, fontWeight: 700, flexShrink: 0, width: 36 }}>{k}</span>
                <span style={{ color: T.textDim, lineHeight: 1.7 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
