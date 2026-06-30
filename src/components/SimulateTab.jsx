import { useRef, useEffect, useState } from "react";
import { T, card, h2s, lbl, sel, btn } from "../styles/theme.js";

function hexToRgbArr(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function blendColor(base, overlay, alpha) {
  return [
    Math.round(base[0] * (1 - alpha) + overlay[0] * alpha),
    Math.round(base[1] * (1 - alpha) + overlay[1] * alpha),
    Math.round(base[2] * (1 - alpha) + overlay[2] * alpha),
  ];
}

export default function SimulateTab({ weaveMatrix, palette, warpYarnIdx, setWarpYarnIdx, weftYarnIdx, setWeftYarnIdx }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(8);
  const [tiles, setTiles] = useState(6);
  const [showGrid, setShowGrid] = useState(false);
  const [texture, setTexture] = useState("smooth");

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !weaveMatrix?.length || !weaveMatrix[0]?.length || !palette?.length) return;

    const matrix = weaveMatrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const warpHex = palette[warpYarnIdx]?.hex || "#c8a84b";
    const weftHex = palette[weftYarnIdx]?.hex || "#060504";
    const warpRgb = hexToRgbArr(warpHex);
    const weftRgb = hexToRgbArr(weftHex);

    cv.width = cols * zoom * tiles;
    cv.height = rows * zoom * tiles;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const imageData = ctx.createImageData(cv.width, cv.height);
    const data = imageData.data;

    for (let tileY = 0; tileY < tiles; tileY++) {
      for (let tileX = 0; tileX < tiles; tileX++) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const warpUp = matrix[r][c] === 1;
            let baseRgb = warpUp ? warpRgb : weftRgb;

            // Render each cell as zoom×zoom pixels with shading
            for (let py = 0; py < zoom; py++) {
              for (let px = 0; px < zoom; px++) {
                const gx = (tileX * cols + c) * zoom + px;
                const gy = (tileY * rows + r) * zoom + py;
                const idx = (gy * cv.width + gx) * 4;

                let rgb = [...baseRgb];

                if (texture === "smooth" && zoom >= 4) {
                  // Yarn shading: top edge highlight, bottom edge shadow
                  if (py === 0) rgb = blendColor(rgb, [255, 255, 255], 0.15);
                  else if (py === zoom - 1) rgb = blendColor(rgb, [0, 0, 0], 0.2);
                  // Side highlight for warp threads
                  if (warpUp) {
                    if (px === 0 || px === zoom - 1) rgb = blendColor(rgb, [0, 0, 0], 0.1);
                    if (px === 1) rgb = blendColor(rgb, [255, 255, 255], 0.05);
                  } else {
                    if (py === 0 || py === 1) rgb = blendColor(rgb, [255, 255, 255], 0.05);
                  }
                  // Center sheen
                  const cx = Math.abs(px - zoom / 2) / (zoom / 2);
                  const cy = Math.abs(py - zoom / 2) / (zoom / 2);
                  const center = 1 - Math.max(cx, cy);
                  if (center > 0.4 && warpUp) rgb = blendColor(rgb, [255, 255, 255], center * 0.07);
                }

                if (texture === "linen" && zoom >= 4) {
                  // Linen-like texture
                  const noise = ((px * 3 + py * 7 + r + c) % 5) / 5;
                  rgb = blendColor(rgb, warpUp ? [255, 255, 255] : [0, 0, 0], noise * 0.06);
                }

                if (showGrid && zoom >= 6 && (px === 0 || py === 0)) {
                  rgb = blendColor(rgb, [0, 0, 0], 0.3);
                }

                data[idx] = rgb[0];
                data[idx + 1] = rgb[1];
                data[idx + 2] = rgb[2];
                data[idx + 3] = 255;
              }
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [weaveMatrix, palette, warpYarnIdx, weftYarnIdx, zoom, tiles, showGrid, texture]);

  const downloadSim = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement("a");
    a.download = "fabric-simulation.png";
    a.href = cv.toDataURL("image/png");
    a.click();
  };

  if (!palette?.length) {
    return (
      <div style={{ ...card, textAlign: "center", padding: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.25 }}>🧵</div>
        <div style={{ color: T.textDim, fontSize: 16, fontFamily: "var(--font-serif)", marginBottom: 8 }}>No colors loaded</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Extract a palette and set up the weave to simulate fabric.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={h2s}>Fabric Simulation</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            Woven Cloth Preview
          </div>
        </div>
        <button onClick={downloadSim} style={btn("dim")}>Download PNG</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={h2s}>Yarn Assignment</div>

            <label style={lbl}>Warp Yarn</label>
            <select value={warpYarnIdx} onChange={(e) => setWarpYarnIdx(+e.target.value)} style={{ ...sel, marginBottom: 14 }}>
              {palette.map((c, i) => (
                <option key={i} value={i}>{c.yarnName || `Yarn ${i + 1}`} · {c.hex}</option>
              ))}
            </select>

            <label style={lbl}>Weft Yarn</label>
            <select value={weftYarnIdx} onChange={(e) => setWeftYarnIdx(+e.target.value)} style={{ ...sel, marginBottom: 14 }}>
              {palette.map((c, i) => (
                <option key={i} value={i}>{c.yarnName || `Yarn ${i + 1}`} · {c.hex}</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: palette[warpYarnIdx]?.hex, height: 36, borderRadius: 8, border: `2px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: 1 }}>WARP</span>
              </div>
              <div style={{ flex: 1, background: palette[weftYarnIdx]?.hex, height: 36, borderRadius: 8, border: `2px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: 1 }}>WEFT</span>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={h2s}>View Settings</div>

            <label style={lbl}>Zoom — {zoom}×</label>
            <input type="range" min={2} max={24} value={zoom} onChange={(e) => setZoom(+e.target.value)} style={{ width: "100%", marginBottom: 14, accentColor: T.gold }} />

            <label style={lbl}>Tile grid — {tiles}×{tiles}</label>
            <input type="range" min={2} max={12} value={tiles} onChange={(e) => setTiles(+e.target.value)} style={{ width: "100%", marginBottom: 14, accentColor: T.gold }} />

            <label style={lbl}>Texture mode</label>
            <select value={texture} onChange={(e) => setTexture(e.target.value)} style={{ ...sel, marginBottom: 14 }}>
              <option value="smooth">Smooth (silk / satin)</option>
              <option value="linen">Linen (natural texture)</option>
              <option value="flat">Flat (schematic)</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, color: T.textDim }}>
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} style={{ accentColor: T.gold }} />
              Show interlacement grid
            </label>
          </div>

          <div style={{ ...card, fontSize: 11, color: T.textDim, lineHeight: 1.9 }}>
            <div style={h2s}>Reading the simulation</div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ display: "inline-block", width: 12, height: 12, background: palette[warpYarnIdx]?.hex, borderRadius: 2, verticalAlign: "middle", marginRight: 6 }} />
              Warp face — thread passes over weft
            </div>
            <div>
              <span style={{ display: "inline-block", width: 12, height: 12, background: palette[weftYarnIdx]?.hex, borderRadius: 2, verticalAlign: "middle", marginRight: 6 }} />
              Weft face — thread passes under warp
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div style={card}>
          <div style={h2s}>{tiles}×{tiles} Tile · {weaveMatrix?.length || 0}×{weaveMatrix?.[0]?.length || 0} repeat</div>
          <div style={{ overflow: "auto", maxHeight: "65vh", borderRadius: 8, border: `1px solid ${T.border}`, display: "inline-block" }}>
            <canvas
              ref={canvasRef}
              style={{ display: "block", imageRendering: "pixelated" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
