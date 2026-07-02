import { T, btn, card, h2s } from "../styles/theme.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

const FORMATS = [
  ["png",  "Design PNG",  "Indexed color cartoon (1px per hook) — import into ArahWeave or Textronic, assign weave structures, then export to JC5/EP", "🖼️"],
  ["bmp",  "Loom Card BMP", "1-bit Windows BMP from weave matrix — Stäubli JC5/JC6 reads this natively via 'Import Design'. Transfer via USB pen drive.", "⬛"],
  ["wif",  "WIF v1.1",   "Weaving Information File — opens in ArahWeave, WeavePoint, ScotWeave, Fiberworks, iWeaveIt, DigiBunai", "🔷"],
  ["json", "JSON",        "Full design data + AI analysis + all specs",          "🟡"],
  ["csv",  "CSV",         "Palette + yarn table for Excel / ERP",                "🟢"],
  ["all",  "ALL",         "Download all 5 files at once",                        "⭐"],
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
              ["PNG",  "Design cartoon — one pixel per hook/pick, colors match yarn palette. Load into ArahWeave (Jacquard menu) or Textronic to assign weave structures per color, then export to JC5 or EP from there."],
              ["BMP",  "1-bit loom card from weave matrix. White=hook raised, black=hook down. Stäubli JC5/JC6 reads this natively under 'Import → BMP'. Transfer via USB pen drive to controller."],
              ["WIF",  "Weaving Information File v1.1 — open standard read by ArahWeave, WeavePoint, ScotWeave, Fiberworks, iWeaveIt, SwiftWeave, DigiBunai, and handweaving.net. Uses Liftplan section for Jacquard; Threading+Tieup+Treadling for shaft looms."],
              ["JSON", "Complete structured export with AI analysis, market data, repeat, and all technical specs."],
              ["CSV",  "Yarn and color table for Excel, ERP systems, or production planning."],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 11 }}>
                <span style={{ color: T.gold, fontWeight: 700, flexShrink: 0, width: 36 }}>{k}</span>
                <span style={{ color: T.textDim, lineHeight: 1.7 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: "10px 12px", background: T.raise, borderRadius: 8, border: `1px solid ${T.borderBr}`, fontSize: 10, color: T.textDim, lineHeight: 1.8 }}>
              <span style={{ color: T.gold, fontWeight: 700 }}>Surat workflow: </span>
              Export PNG → open in ArahWeave/Textronic → assign weave per color → software exports JC5/EP to your Stäubli controller.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
