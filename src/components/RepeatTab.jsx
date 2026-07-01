import { useEffect, useRef } from "react";
import { T, inp, lbl, card, h2s, btn } from "../styles/theme.js";
import { applyRepeatMode } from "../utils/weaveUtils.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

const MODES = [
  ["straight",  "Straight",   "Standard tile repeat"],
  ["mirror-h",  "Mirror H",   "Horizontal mirror — symmetrical left-right"],
  ["mirror-v",  "Mirror V",   "Vertical mirror — symmetrical top-bottom"],
  ["brick",     "Brick",      "Half-step offset on every other row"],
  ["half-drop", "Half-drop",  "Vertical half-drop on alternating columns"],
  ["rotate-90", "Rotate 90°", "90° clockwise rotation of the repeat"],
];

export default function RepeatTab({
  repeatW, setRepeatW, repeatH, setRepeatH,
  repeatCandidates, image, previewRef,
  repeatMode, setRepeatMode,
  palette, weaveMatrix,
}) {
  const modeCanvasRef = useRef(null);
  const { isMobile } = useBreakpoint();
  const cmW = (repeatW / 96 * 2.54).toFixed(1);
  const cmH = (repeatH / 96 * 2.54).toFixed(1);

  // Main repeat preview (image-based, 3×3 tiled)
  useEffect(() => {
    const imgEl = image ? (() => { const i = new Image(); i.src = image; return i; })() : null;
    if (!imgEl || !previewRef?.current || !repeatW || !repeatH) return;
    imgEl.onload = () => {
      const cv = previewRef.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      cv.width = repeatW * 3;
      cv.height = repeatH * 3;
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) ctx.drawImage(imgEl, 0, 0, repeatW, repeatH, c * repeatW, r * repeatH, repeatW, repeatH);
      ctx.strokeStyle = T.gold;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      for (let r = 0; r <= 3; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * repeatH); ctx.lineTo(cv.width, r * repeatH); ctx.stroke();
      }
      for (let c = 0; c <= 3; c++) {
        ctx.beginPath(); ctx.moveTo(c * repeatW, 0); ctx.lineTo(c * repeatW, cv.height); ctx.stroke();
      }
    };
    if (imgEl.complete) imgEl.onload();
  }, [image, repeatW, repeatH, previewRef]);

  // Weave-matrix mode preview (color block tiles)
  useEffect(() => {
    const cv = modeCanvasRef.current;
    if (!cv || !weaveMatrix?.length || !palette?.length) return;

    const base = weaveMatrix;
    const modified = applyRepeatMode(base, repeatMode);
    if (!modified?.length || !modified[0]?.length) return;

    const rows = modified.length;
    const cols = modified[0].length;
    const sz = Math.max(2, Math.floor(280 / Math.max(rows, cols)));
    const tilesW = 4, tilesH = 4;

    cv.width = cols * sz * tilesW;
    cv.height = rows * sz * tilesH;
    const ctx = cv.getContext("2d");

    const warpHex = palette[0]?.hex || T.gold;
    const weftHex = palette[1]?.hex || T.surf;

    for (let tY = 0; tY < tilesH; tY++) {
      for (let tX = 0; tX < tilesW; tX++) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.fillStyle = modified[r][c] === 1 ? warpHex : weftHex;
            ctx.fillRect((tX * cols + c) * sz, (tY * rows + r) * sz, sz, sz);
            if (sz >= 4) {
              ctx.strokeStyle = "rgba(0,0,0,0.15)";
              ctx.strokeRect((tX * cols + c) * sz + 0.5, (tY * rows + r) * sz + 0.5, sz - 1, sz - 1);
            }
          }
        }
      }
    }
    // Unit cell indicator
    ctx.strokeStyle = T.gold;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(0, 0, cols * sz, rows * sz);
    ctx.setLineDash([]);
  }, [weaveMatrix, palette, repeatMode]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={h2s}>Pattern Repeat</div>
        <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
          {repeatW} × {repeatH} px &nbsp;<span style={{ color: T.muted, fontSize: 16 }}>({cmW} × {cmH} cm)</span>
        </div>
      </div>

      {/* Repeat mode selector */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={h2s}>Repeat Mode</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {MODES.map(([id, label, desc]) => {
            const active = repeatMode === id;
            return (
              <div
                key={id}
                onClick={() => setRepeatMode(id)}
                title={desc}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: `1px solid ${active ? T.goldDim : T.border}`,
                  background: active ? T.goldFaint : T.surf,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = T.borderBr; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = T.border; }}
              >
                <div style={{ color: active ? T.gold : T.text, fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{label}</div>
                <div style={{ color: T.muted, fontSize: 9, lineHeight: 1.5 }}>{desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr", gap: 24 }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={h2s}>Dimensions</div>
            <label style={lbl}>Width (px)</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
              <input type="number" value={repeatW} onChange={(e) => setRepeatW(+e.target.value)} style={{ ...inp, flex: 1 }} />
              <span style={{ color: T.muted, fontSize: 11, flexShrink: 0 }}>{cmW} cm</span>
            </div>
            <label style={lbl}>Height (px)</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="number" value={repeatH} onChange={(e) => setRepeatH(+e.target.value)} style={{ ...inp, flex: 1 }} />
              <span style={{ color: T.muted, fontSize: 11, flexShrink: 0 }}>{cmH} cm</span>
            </div>
          </div>

          {repeatCandidates.length > 0 && (
            <div style={card}>
              <div style={h2s}>Auto Detected</div>
              {repeatCandidates.map((r, i) => (
                <div
                  key={i}
                  onClick={() => { setRepeatW(r.width); setRepeatH(r.height); }}
                  style={{
                    background: i === 0 ? T.goldFaint : T.surf,
                    border: `1px solid ${i === 0 ? T.goldDim : T.border}`,
                    borderRadius: 9, padding: "10px 13px", marginBottom: 8,
                    cursor: "pointer", transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = T.goldDim}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = i === 0 ? T.goldDim : T.border}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ color: i === 0 ? T.gold : T.text, fontSize: 12, fontWeight: i === 0 ? 700 : 400 }}>
                      {i === 0 ? "✓ Best fit" : `Option ${i + 1}`} · {r.width}×{r.height}px
                    </span>
                    <span style={{ color: T.muted, fontSize: 10 }}>{(r.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 3, background: T.panel, borderRadius: 2 }}>
                    <div style={{ width: `${r.confidence * 100}%`, height: "100%", background: i === 0 ? T.gold : T.goldDim, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weave mode preview */}
          {weaveMatrix?.length > 0 && (
            <div style={card}>
              <div style={h2s}>Weave Tile Mode Preview</div>
              <div style={{ overflow: "auto", borderRadius: 8, border: `1px solid ${T.border}` }}>
                <canvas ref={modeCanvasRef} style={{ display: "block", imageRendering: "pixelated", maxWidth: "100%" }} />
              </div>
              <div style={{ color: T.muted, fontSize: 9, marginTop: 8, lineHeight: 1.7 }}>
                Gold border = one repeat unit. Mode: <span style={{ color: T.gold }}>{MODES.find(([id]) => id === repeatMode)?.[1]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Image preview */}
        <div style={card}>
          <div style={h2s}>3×3 Image Tile Preview</div>
          {image ? (
            <canvas ref={previewRef} style={{ maxWidth: "100%", borderRadius: 10, border: `1px solid ${T.border}`, display: "block" }} />
          ) : (
            <div style={{ textAlign: "center", padding: 80, color: T.muted }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🔁</div>
              <div>Load an image to see the repeat preview.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
