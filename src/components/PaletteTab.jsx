import { useState } from "react";
import { T, btn, inp, sel, lbl, card, h2s, h2c } from "../styles/theme.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { hexToRgb } from "../utils/colorUtils.js";
import { reduceColors } from "../utils/weaveUtils.js";
import Swatch from "./Swatch.jsx";

export default function PaletteTab({ palette, setPalette, editIdx, setEditIdx, image, processing, extractColors, setTab, harmonyData }) {
  const { isMobile } = useBreakpoint();
  const [reduceTarget, setReduceTarget] = useState(8);

  const handleReduce = () => {
    if (palette.length <= reduceTarget) return;
    setPalette(reduceColors(palette, reduceTarget));
  };

  return (
    <div>
      {/* Header */}
      <div className="tab-header">
        <div>
          <div style={h2s}>Color Palette</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            {palette.length} Yarns Extracted
          </div>
        </div>
        <div className="tab-header-actions" style={{ display: "flex", gap: 8 }}>
          <button onClick={extractColors} disabled={!image || processing} style={btn("ghost", !image || processing)}>
            Re-extract
          </button>
          <button onClick={() => setTab("colorways")} style={btn("dim")}>
            Colorways
          </button>
          <button onClick={() => setTab("recolor")} style={btn("gold")}>
            AI Recolor →
          </button>
        </div>
      </div>

      {/* Color reduction bar */}
      {palette.length > 2 && (
        <div style={{ ...card, marginBottom: 16, display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", flexWrap: "wrap" }}>
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, textTransform: "uppercase", flexShrink: 0 }}>Color Reduction</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: T.textDim, fontSize: 12, flexShrink: 0 }}>Reduce to</span>
            <input type="range" min={2} max={Math.max(2, palette.length - 1)} value={reduceTarget}
              onChange={(e) => setReduceTarget(+e.target.value)}
              style={{ flex: 1, accentColor: T.gold }} />
            <span style={{ color: T.gold, fontWeight: 700, fontSize: 14, width: 24, flexShrink: 0 }}>{reduceTarget}</span>
            <span style={{ color: T.muted, fontSize: 11 }}>colors</span>
          </div>
          <button onClick={handleReduce} disabled={palette.length <= reduceTarget} style={btn("dim", palette.length <= reduceTarget)}>
            Merge Similar →
          </button>
          <div style={{ color: T.muted, fontSize: 10, flexShrink: 0 }}>{palette.length} → {reduceTarget}</div>
        </div>
      )}

      {/* Harmony analysis strip */}
      {harmonyData && palette.length > 0 && (
        <div style={{ ...card, marginBottom: 16, display: "flex", gap: 20, alignItems: "center", padding: "12px 20px",
          background: `linear-gradient(135deg, ${T.panel} 0%, rgba(107,127,245,0.07) 100%)`,
          borderColor: "rgba(107,127,245,0.3)" }}>
          <div style={{ color: T.indigo, fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "2px",
            textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }}>Color Harmony</div>
          {[
            ["Type",       harmonyData.harmonyType,                  T.violet],
            ["Colorful",   `${harmonyData.colorfulCount} yarns`,     T.indigo],
            ["Avg Light",  `${harmonyData.avgLightness}%`,           T.textDim],
            ["Max Chroma", harmonyData.maxChroma,                    T.emerald],
          ].map(([k, v, c]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ color: T.muted, fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 3 }}>{k}</div>
              <div style={{ color: c, fontSize: 12, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {palette.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎨</div>
          <div style={{ color: T.textDim, fontSize: 14 }}>Import an image and extract colors to begin.</div>
        </div>
      ) : (
        <>
          {/* Swatches */}
          {/* Full-width color bar */}
          <div style={{ display: "flex", height: 14, borderRadius: 10, overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
            {palette.map((c, i) => (
              <div key={i} onClick={() => setEditIdx(i)}
                style={{ flex: c.percentage || 1, background: c.hex, cursor: "pointer", transition: "flex 0.2s" }}
                title={`${c.hex} · ${c.percentage?.toFixed(1)}%`} />
            ))}
          </div>

          <div style={{ ...card, marginBottom: 16, background: `linear-gradient(135deg, ${T.panel} 0%, rgba(191,111,245,0.05) 100%)`, borderColor: "rgba(191,111,245,0.2)" }}>
            <div style={h2c("#bf6ff5")}>Extracted Yarns — click to edit</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {palette.map((c, i) => <Swatch key={i} c={c} i={i} onEdit={setEditIdx} />)}
            </div>
          </div>

          {/* Editor */}
          {editIdx !== null && palette[editIdx] && (
            <div style={{ ...card, marginBottom: 16, borderColor: T.goldDim, boxShadow: `0 0 0 1px ${T.goldDim}, 0 8px 32px rgba(200,168,75,0.1)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={h2s}>Edit Yarn {editIdx + 1}</div>
                <button onClick={() => setEditIdx(null)} style={btn("gold")}>✓ Done</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 14 }}>
                <div>
                  <label style={lbl}>Yarn Name</label>
                  <input style={inp} value={palette[editIdx].yarnName || ""}
                    onChange={(e) => { const p = [...palette]; p[editIdx] = { ...p[editIdx], yarnName: e.target.value }; setPalette(p); }} />
                </div>
                <div>
                  <label style={lbl}>Weave Zone</label>
                  <select style={sel} value={palette[editIdx].weaveType || "plain"}
                    onChange={(e) => { const p = [...palette]; p[editIdx] = { ...p[editIdx], weaveType: e.target.value }; setPalette(p); }}>
                    {["plain", "twill", "satin", "jacquard", "dobby", "velvet", "crepe", "basket"].map((w) => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Color</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="color" value={palette[editIdx].hex}
                      onChange={(e) => { const p = [...palette]; p[editIdx] = { ...p[editIdx], hex: e.target.value, rgb: hexToRgb(e.target.value) }; setPalette(p); }}
                      style={{ width: 40, height: 38, borderRadius: 7, cursor: "pointer", border: `1px solid ${T.border}`, background: "none" }} />
                    <input style={{ ...inp, flex: 1 }} value={palette[editIdx].hex}
                      onChange={(e) => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) { const p = [...palette]; p[editIdx] = { ...p[editIdx], hex: e.target.value, rgb: hexToRgb(e.target.value) }; setPalette(p); } }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Usage</label>
                  <div style={{ ...inp, color: T.gold, fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center" }}>
                    {palette[editIdx].percentage?.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div style={card}>
            <div style={h2s}>Full Palette Table</div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["#", "Swatch", "Hex", "RGB", "Yarn Name", "Usage", "g/m²", "Zone", ""].map((h) => (
                      <th key={h} style={{ color: T.muted, textAlign: "left", padding: "10px 12px", fontWeight: 400, fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {palette.map((c, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} onClick={() => setEditIdx(i)}>
                      <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{i + 1}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ width: 28, height: 28, background: c.hex, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }} />
                      </td>
                      <td style={{ padding: "10px 12px", color: c.hex, fontWeight: 700, fontSize: 12, textShadow: "0 0 8px currentColor" }}>{c.hex.toUpperCase()}</td>
                      <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{c.rgb.join(", ")}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12 }}>{c.yarnName || `Yarn ${i + 1}`}</td>
                      <td style={{ padding: "10px 12px", minWidth: 120 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 56, height: 4, background: T.surf, borderRadius: 2 }}>
                            <div style={{ width: `${Math.min(c.percentage, 100)}%`, height: "100%", background: c.hex, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 12 }}>{c.percentage?.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{(c.percentage * 0.85).toFixed(1)}</td>
                      <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{c.weaveType || "plain"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <button style={{ ...btn("ghost"), height: 28, padding: "0 10px", fontSize: 12 }}
                          onClick={(e) => { e.stopPropagation(); setEditIdx(i); }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
