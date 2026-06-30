import { T, btn, inp, card, h2s } from "../styles/theme.js";
import Swatch from "./Swatch.jsx";

const PRESETS = [
  ["Bridal Reds & Gold",  "Deep maroon, crimson, gold zari for bridal season Surat market"],
  ["Pastel Festival",     "Soft pink, mint, lavender, cream for summer catalog"],
  ["Royal Navy Export",   "Deep navy, ivory, silver for international buyers"],
  ["Navratri Garba",      "Bright orange, yellow, green, pink, fuchsia for Navratri season"],
  ["Wedding Lehenga",     "Magenta, hot pink, deep gold, emerald for lehenga catalog"],
  ["Daily Wear Muted",    "Dusty rose, sage, beige, soft blue for everyday sarees"],
];

export default function RecolorTab({ palette, setEditIdx, aiColorizePrompt, setAiColorizePrompt, runAIRecolor, aiColorizeBusy, image }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={h2s}>AI Recolor</div>
        <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
          Generate Surat Market Colorways
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Prompt + presets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card}>
            <div style={h2s}>Describe the Colorway</div>
            <textarea
              value={aiColorizePrompt}
              onChange={(e) => setAiColorizePrompt(e.target.value)}
              style={{ ...inp, height: 120, resize: "vertical", lineHeight: 1.8, fontSize: 13 }}
              placeholder={"e.g. Bridal red and gold for wedding season\ne.g. Pastel pink for summer collection\ne.g. Dark navy with silver zari for export"}
            />
            <button
              onClick={runAIRecolor}
              disabled={!palette.length || aiColorizeBusy || !aiColorizePrompt.trim()}
              style={{ ...btn("gold", !palette.length || aiColorizeBusy || !aiColorizePrompt.trim()), width: "100%", marginTop: 12, height: 40, fontSize: 12 }}
            >
              {aiColorizeBusy ? "Colorizing..." : "Apply AI Recolor →"}
            </button>
            {!palette.length && (
              <div style={{ color: T.muted, fontSize: 10, textAlign: "center", marginTop: 10 }}>
                Extract palette first from the Import tab
              </div>
            )}
          </div>

          <div style={card}>
            <div style={h2s}>Quick Presets</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PRESETS.map(([label, prompt]) => {
                const active = aiColorizePrompt === prompt;
                return (
                  <button
                    key={label}
                    onClick={() => setAiColorizePrompt(prompt)}
                    style={{
                      background: active ? T.goldFaint : T.surf,
                      border: `1px solid ${active ? T.goldDim : T.border}`,
                      color: active ? T.gold : T.textDim,
                      borderRadius: 20,
                      padding: "6px 14px",
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "var(--font-mono)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = T.goldDim; e.currentTarget.style.color = T.text; }}}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textDim; }}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Palette preview */}
        <div style={card}>
          <div style={h2s}>Current Palette</div>
          {palette.length === 0 ? (
            <div style={{ textAlign: "center", padding: 50, color: T.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🎨</div>
              <div>Extract colors from the Import tab first.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {palette.map((c, i) => <Swatch key={i} c={c} i={i} onEdit={setEditIdx} />)}
            </div>
          )}
          {image && palette.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ color: T.muted, fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>Design Preview</div>
              <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 10, border: `1px solid ${T.border}` }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
