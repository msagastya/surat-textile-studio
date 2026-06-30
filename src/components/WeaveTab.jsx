import { T, btn, inp, lbl, card, h2s } from "../styles/theme.js";
import { WEAVE_PRESETS } from "../data/weavePresets.js";
import WeaveGrid from "./WeaveGrid.jsx";

export default function WeaveTab({ weaveName, setWeaveName, weaveMatrix, setWeaveMatrix, fabricType, fab }) {
  const handleToggle = (ri, ci) => {
    setWeaveMatrix(weaveMatrix.map((row, r) =>
      r === ri ? row.map((v, c) => (c === ci ? (v ? 0 : 1) : v)) : row
    ));
  };

  const flat = weaveMatrix.flat();
  const on = flat.filter(Boolean).length;
  const total = flat.length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={h2s}>Weave Draft</div>
        <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
          {weaveName.charAt(0).toUpperCase() + weaveName.slice(1)} · {fabricType}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={h2s}>Presets</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(WEAVE_PRESETS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => { setWeaveName(k); setWeaveMatrix(v.matrix); }}
                  style={{
                    background: weaveName === k ? T.goldFaint : T.surf,
                    border: `1px solid ${weaveName === k ? T.goldDim : T.border}`,
                    color: weaveName === k ? T.gold : T.textDim,
                    borderRadius: 8,
                    padding: "9px 12px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { if (weaveName !== k) { e.currentTarget.style.borderColor = T.borderBr; e.currentTarget.style.color = T.text; }}}
                  onMouseLeave={(e) => { if (weaveName !== k) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textDim; }}}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{k}</div>
                  <div style={{ fontSize: 9, color: weaveName === k ? T.goldDim : T.muted, marginTop: 2 }}>{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={h2s}>Structure</div>
            {[
              ["Shafts",   weaveMatrix.length],
              ["Picks",    weaveMatrix[0]?.length || 0],
              ["Interlacing", `${on}/${total}`],
              ["Coverage", `${((on / total) * 100).toFixed(0)}%`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: T.muted }}>{k}</span>
                <span style={{ color: k === "Coverage" ? T.gold : T.text, fontWeight: k === "Coverage" ? 700 : 400 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ color: T.textDim, fontSize: 11 }}>
              <span style={{ display: "inline-block", width: 12, height: 12, background: T.gold, borderRadius: 2, verticalAlign: "middle", marginRight: 5 }} />
              Warp up (interlacing)
              &nbsp;&nbsp;
              <span style={{ display: "inline-block", width: 12, height: 12, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 2, verticalAlign: "middle", marginRight: 5 }} />
              Warp down
            </div>
            <div style={{ color: T.muted, fontSize: 10 }}>Click cells to toggle</div>
          </div>

          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <WeaveGrid matrix={weaveMatrix} cellSize={20} onToggle={handleToggle} />
          </div>

          <label style={lbl}>Raw Matrix JSON</label>
          <textarea
            value={JSON.stringify(weaveMatrix)}
            onChange={(e) => { try { setWeaveMatrix(JSON.parse(e.target.value)); } catch { } }}
            style={{ ...inp, height: 80, resize: "vertical", fontSize: 10, lineHeight: 1.6 }}
          />
        </div>
      </div>
    </div>
  );
}
