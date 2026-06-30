import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { T, btn, card, h2s, h2c, lbl, sel } from "../styles/theme.js";
import { MOTIF_LIBRARY, getMotifGrid, scaleMotif, placeMotif } from "../data/motifLibrary.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

// ── Geometry helpers ────────────────────────────────────────────────────────
function linePoints(r0, c0, r1, c1) {
  const pts = [];
  const dr = Math.abs(r1 - r0), dc = Math.abs(c1 - c0);
  const sr = r0 < r1 ? 1 : -1, sc = c0 < c1 ? 1 : -1;
  let err = dr - dc, r = r0, c = c0;
  for (;;) {
    pts.push([r, c]);
    if (r === r1 && c === c1) break;
    const e2 = 2 * err;
    if (e2 > -dc) { err -= dc; r += sr; }
    if (e2 < dr) { err += dr; c += sc; }
  }
  return pts;
}

function rectPoints(r0, c0, r1, c1, filled) {
  const pts = [];
  const minR = Math.min(r0, r1), maxR = Math.max(r0, r1);
  const minC = Math.min(c0, c1), maxC = Math.max(c0, c1);
  for (let r = minR; r <= maxR; r++)
    for (let c = minC; c <= maxC; c++)
      if (filled || r === minR || r === maxR || c === minC || c === maxC)
        pts.push([r, c]);
  return pts;
}

function circlePoints(r0, c0, r1, c1, filled) {
  const pts = [];
  const cr = (r0 + r1) / 2, cc = (c0 + c1) / 2;
  const rad = Math.sqrt(Math.pow(r1 - r0, 2) + Math.pow(c1 - c0, 2)) / 2;
  const minR = Math.max(0, Math.floor(cr - rad) - 1);
  const maxR = Math.ceil(cr + rad) + 1;
  const minC = Math.max(0, Math.floor(cc - rad) - 1);
  const maxC = Math.ceil(cc + rad) + 1;
  for (let r = minR; r <= maxR; r++)
    for (let c = minC; c <= maxC; c++) {
      const d = Math.sqrt(Math.pow(r - cr, 2) + Math.pow(c - cc, 2));
      if (filled ? d <= rad : Math.abs(d - rad) < 0.9)
        pts.push([r, c]);
    }
  return pts;
}

function floodFill(grid, w, h, r0, c0, fillIdx) {
  const targetIdx = grid[r0 * w + c0];
  if (targetIdx === fillIdx) return grid;
  const next = [...grid];
  const stack = [[r0, c0]];
  while (stack.length) {
    const [r, c] = stack.pop();
    if (r < 0 || r >= h || c < 0 || c >= w) continue;
    const i = r * w + c;
    if (next[i] !== targetIdx) continue;
    next[i] = fillIdx;
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return next;
}

// ── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
  { id: "pencil",   label: "Pencil",     key: "P", icon: "✏️" },
  { id: "eraser",   label: "Eraser",     key: "E", icon: "◻" },
  { id: "fill",     label: "Fill",       key: "F", icon: "⬛" },
  { id: "line",     label: "Line",       key: "L", icon: "╱" },
  { id: "rect",     label: "Rectangle",  key: "R", icon: "▭" },
  { id: "circle",   label: "Circle",     key: "C", icon: "○" },
  { id: "eyedrop",  label: "Eyedropper", key: "I", icon: "🩸" },
  { id: "move",     label: "Pan",        key: "V", icon: "✥" },
];

// ── DesignCanvas ────────────────────────────────────────────────────────────
export default function DesignCanvas({
  grid, setGrid, gridW, gridH, setGridW, setGridH,
  palette, activeColorIdx, setActiveColorIdx,
}) {
  const cvRef = useRef(null);
  const overlayRef = useRef(null);

  const { isMobile } = useBreakpoint();

  // tool state
  const [tool, setTool] = useState("pencil");
  const [zoom, setZoom] = useState(8);
  const [mirrorH, setMirrorH] = useState(false);
  const [mirrorV, setMirrorV] = useState(false);
  const [filled, setFilled] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);
  const [showGrid, setShowGrid] = useState(true);

  // motif panel
  const [motifOpen, setMotifOpen] = useState(false);
  const [selMotif, setSelMotif] = useState("diamond");
  const [motifSize, setMotifSize] = useState(16);
  const [motifC1, setMotifC1] = useState(0);
  const [motifC2, setMotifC2] = useState(1);
  const [motifC3, setMotifC3] = useState(2);
  const [placingMotif, setPlacingMotif] = useState(false);
  const [motifPreview, setMotifPreview] = useState(null);

  // resize panel
  const [resizeW, setResizeW] = useState(gridW);
  const [resizeH, setResizeH] = useState(gridH);

  // undo/redo
  const histRef = useRef([]);
  const redoRef = useRef([]);
  const isDrawRef = useRef(false);
  const lastCell = useRef(null);

  const pushHist = useCallback((prev) => {
    histRef.current = [...histRef.current.slice(-79), [...prev]];
    redoRef.current = [];
  }, []);

  const undo = useCallback(() => {
    if (!histRef.current.length) return;
    const prev = histRef.current[histRef.current.length - 1];
    redoRef.current = [[...grid], ...redoRef.current.slice(0, 49)];
    histRef.current = histRef.current.slice(0, -1);
    setGrid(prev);
  }, [grid, setGrid]);

  const redo = useCallback(() => {
    if (!redoRef.current.length) return;
    const next = redoRef.current[0];
    histRef.current = [...histRef.current, [...grid]];
    redoRef.current = redoRef.current.slice(1);
    setGrid(next);
  }, [grid, setGrid]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "Z")) { e.preventDefault(); redo(); return; }
      const map = { p: "pencil", e: "eraser", f: "fill", l: "line", r: "rect", c: "circle", i: "eyedrop", v: "move" };
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
      if (e.key === "[") setZoom((z) => Math.max(2, z - 2));
      if (e.key === "]") setZoom((z) => Math.min(32, z + 2));
      if (e.ctrlKey && e.key === "a") { e.preventDefault(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo, redo]);

  // Mirror helper
  const applyCell = useCallback((next, r, c, idx) => {
    const set = (pr, pc) => {
      if (pr >= 0 && pr < gridH && pc >= 0 && pc < gridW)
        next[pr * gridW + pc] = idx;
    };
    set(r, c);
    if (mirrorH) set(r, gridW - 1 - c);
    if (mirrorV) set(gridH - 1 - r, c);
    if (mirrorH && mirrorV) set(gridH - 1 - r, gridW - 1 - c);
  }, [gridW, gridH, mirrorH, mirrorV]);

  // Preview cells for line/rect/circle
  const previewCells = useMemo(() => {
    if (!dragStart || !hoverCell || !["line", "rect", "circle"].includes(tool)) return [];
    if (tool === "line") return linePoints(dragStart.r, dragStart.c, hoverCell.r, hoverCell.c);
    if (tool === "circle") return circlePoints(dragStart.r, dragStart.c, hoverCell.r, hoverCell.c, filled);
    return rectPoints(dragStart.r, dragStart.c, hoverCell.r, hoverCell.c, filled);
  }, [dragStart, hoverCell, tool, filled]);

  // ── Canvas render ──────────────────────────────────────────────────────────
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const sz = zoom;
    cv.width = gridW * sz;
    cv.height = gridH * sz;

    // Background
    ctx.fillStyle = T.raise;
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Cells
    for (let r = 0; r < gridH; r++) {
      for (let c = 0; c < gridW; c++) {
        const ci = grid[r * gridW + c];
        if (ci > 0 && palette[ci - 1]) {
          ctx.fillStyle = palette[ci - 1].hex;
          ctx.fillRect(c * sz, r * sz, sz, sz);
        }
      }
    }

    // Preview cells (semi-transparent)
    if (previewCells.length > 0) {
      const activeHex = palette[activeColorIdx]?.hex || T.gold;
      ctx.fillStyle = activeHex;
      ctx.globalAlpha = 0.55;
      previewCells.forEach(([r, c]) => {
        if (r >= 0 && r < gridH && c >= 0 && c < gridW)
          ctx.fillRect(c * sz, r * sz, sz, sz);
      });
      ctx.globalAlpha = 1;
    }

    // Motif preview
    if (motifPreview && hoverCell) {
      const { data, w, h } = motifPreview;
      ctx.globalAlpha = 0.6;
      for (let mr = 0; mr < h; mr++) {
        for (let mc = 0; mc < w; mc++) {
          const v = data[mr * w + mc];
          if (v === 0) continue;
          const colorMap = [null, palette[motifC1]?.hex, palette[motifC2]?.hex, palette[motifC3]?.hex];
          ctx.fillStyle = colorMap[v] || T.gold;
          const pr = hoverCell.r + mr, pc = hoverCell.c + mc;
          if (pr < gridH && pc < gridW)
            ctx.fillRect(pc * sz, pr * sz, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Grid lines
    if (sz >= 4 && showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      for (let r = 0; r <= gridH; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * sz); ctx.lineTo(cv.width, r * sz); ctx.stroke();
      }
      for (let c = 0; c <= gridW; c++) {
        ctx.beginPath(); ctx.moveTo(c * sz, 0); ctx.lineTo(c * sz, cv.height); ctx.stroke();
      }
      // Heavier lines every 8 cells
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      for (let r = 0; r <= gridH; r += 8) {
        ctx.beginPath(); ctx.moveTo(0, r * sz); ctx.lineTo(cv.width, r * sz); ctx.stroke();
      }
      for (let c = 0; c <= gridW; c += 8) {
        ctx.beginPath(); ctx.moveTo(c * sz, 0); ctx.lineTo(c * sz, cv.height); ctx.stroke();
      }
    }

    // Mirror guides
    if (mirrorH || mirrorV) {
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = T.goldLine;
      ctx.lineWidth = 1.5;
      if (mirrorH) {
        const x = (gridW / 2) * sz;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, cv.height); ctx.stroke();
      }
      if (mirrorV) {
        const y = (gridH / 2) * sz;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cv.width, y); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Hover highlight
    if (hoverCell && !["line", "rect", "circle"].includes(tool)) {
      ctx.strokeStyle = T.gold;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hoverCell.c * sz + 0.75, hoverCell.r * sz + 0.75, sz - 1.5, sz - 1.5);
    }
  }, [grid, palette, zoom, mirrorH, mirrorV, previewCells, hoverCell, showGrid, activeColorIdx, motifPreview, motifC1, motifC2, motifC3, gridW, gridH]);

  // ── Mouse utils ────────────────────────────────────────────────────────────
  const getCell = (e) => {
    const cv = cvRef.current;
    if (!cv) return null;
    const rect = cv.getBoundingClientRect();
    const scaleX = cv.width / rect.width;
    const scaleY = cv.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const c = Math.floor(px / zoom);
    const r = Math.floor(py / zoom);
    if (r < 0 || r >= gridH || c < 0 || c >= gridW) return null;
    return { r, c };
  };

  const getColorIdx = (e) => e.button === 2 ? 0 : activeColorIdx + 1;

  const onMouseDown = (e) => {
    e.preventDefault();
    const cell = getCell(e);
    if (!cell) return;
    const { r, c } = cell;
    const ci = getColorIdx(e);

    if (placingMotif && motifPreview) {
      const { data, w, h } = motifPreview;
      const motif2d = Array.from({ length: h }, (_, mr) => Array.from({ length: w }, (_, mc) => data[mr * w + mc]));
      const colorMap = [0, motifC1 + 1, motifC2 + 1, motifC3 + 1];
      pushHist(grid);
      setGrid(placeMotif(grid, gridW, gridH, motif2d, r, c, colorMap));
      return;
    }

    if (tool === "eyedrop") {
      const existing = grid[r * gridW + c];
      if (existing > 0) setActiveColorIdx(existing - 1);
      return;
    }
    if (tool === "fill") {
      pushHist(grid);
      setGrid(floodFill(grid, gridW, gridH, r, c, ci));
      return;
    }
    if (tool === "pencil" || tool === "eraser") {
      isDrawRef.current = true;
      lastCell.current = { r, c };
      pushHist(grid);
      const next = [...grid];
      applyCell(next, r, c, tool === "eraser" ? 0 : ci);
      setGrid(next);
      return;
    }
    if (["line", "rect", "circle"].includes(tool)) {
      setDragStart({ r, c, ci });
    }
  };

  const onMouseMove = (e) => {
    const cell = getCell(e);
    setHoverCell(cell);

    if (!cell) return;
    const { r, c } = cell;

    if ((tool === "pencil" || tool === "eraser") && isDrawRef.current) {
      const last = lastCell.current;
      if (!last || (last.r === r && last.c === c)) return;
      const pts = linePoints(last.r, last.c, r, c);
      const next = [...grid];
      const ci = tool === "eraser" ? 0 : activeColorIdx + 1;
      pts.forEach(([pr, pc]) => applyCell(next, pr, pc, ci));
      lastCell.current = { r, c };
      setGrid(next);
    }
  };

  const onMouseUp = (e) => {
    isDrawRef.current = false;
    lastCell.current = null;
    const cell = getCell(e);

    if (["line", "rect", "circle"].includes(tool) && dragStart && previewCells.length > 0) {
      pushHist(grid);
      const next = [...grid];
      previewCells.forEach(([pr, pc]) => applyCell(next, pr, pc, dragStart.ci || activeColorIdx + 1));
      setGrid(next);
      setDragStart(null);
    }
  };

  const onMouseLeave = () => setHoverCell(null);

  // ── Motif helpers ──────────────────────────────────────────────────────────
  const previewMotif = () => {
    const motif2d = getMotifGrid(selMotif);
    if (!motif2d) return;
    const scaled = scaleMotif(motif2d, motifSize, motifSize);
    const data = scaled.flat();
    setMotifPreview({ data, w: motifSize, h: motifSize });
    setPlacingMotif(true);
  };

  const cancelMotif = () => { setPlacingMotif(false); setMotifPreview(null); };

  // ── Grid resize ────────────────────────────────────────────────────────────
  const applyResize = () => {
    const w = Math.max(8, Math.min(256, resizeW));
    const h = Math.max(8, Math.min(256, resizeH));
    const next = Array(w * h).fill(0);
    for (let r = 0; r < Math.min(h, gridH); r++)
      for (let c = 0; c < Math.min(w, gridW); c++)
        next[r * w + c] = grid[r * gridW + c];
    pushHist(grid);
    setGridW(w); setGridH(h);
    setGrid(next);
  };

  // ── Auto-fill from palette ─────────────────────────────────────────────────
  const autoFill = () => {
    if (!palette.length) return;
    const next = Array(gridW * gridH).fill(0);
    for (let i = 0; i < next.length; i++)
      next[i] = (i % palette.length) + 1;
    pushHist(grid);
    setGrid(next);
  };

  const clearAll = () => { pushHist(grid); setGrid(Array(gridW * gridH).fill(0)); };

  const filledCells = grid.filter(Boolean).length;
  const coverage = Math.round(filledCells / grid.length * 100);
  const cursor = tool === "eyedrop" ? "crosshair" : tool === "fill" ? "cell" : tool === "eraser" ? "not-allowed" : "crosshair";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={h2c(T.teal)}>Design Canvas · Point Paper</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            {gridW}×{gridH} hooks · {filledCells.toLocaleString()} painted · {coverage}% filled
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={undo} title="Ctrl+Z" style={{ ...btn("ghost"), height: 32, padding: "0 12px", fontSize: 11 }}>↩ Undo</button>
          <button onClick={redo} title="Ctrl+Y" style={{ ...btn("ghost"), height: 32, padding: "0 12px", fontSize: 11 }}>↪ Redo</button>
          <button onClick={clearAll} style={{ ...btn("ghost"), height: 32, padding: "0 12px", fontSize: 11 }}>Clear</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16 }}>
        {/* Left toolbar */}
        <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", flexWrap: isMobile ? "wrap" : "nowrap", gap: 10, width: isMobile ? "100%" : 220, flexShrink: 0 }}>

          {/* Tools */}
          <div style={card}>
            <div style={h2s}>Tools</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTool(t.id); setPlacingMotif(false); setMotifPreview(null); }}
                  title={`${t.label} (${t.key})`}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 10px", borderRadius: 8,
                    border: `1px solid ${tool === t.id ? T.goldDim : T.border}`,
                    background: tool === t.id ? T.goldFaint : T.surf,
                    color: tool === t.id ? T.gold : T.textDim,
                    cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)",
                    fontWeight: tool === t.id ? 700 : 400,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            {["rect", "circle"].includes(tool) && (
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, color: T.textDim, marginTop: 10 }}>
                <input type="checkbox" checked={filled} onChange={(e) => setFilled(e.target.checked)} style={{ accentColor: T.gold }} />
                Filled shape
              </label>
            )}
          </div>

          {/* Active color */}
          <div style={card}>
            <div style={h2s}>Active Color</div>
            {palette.length === 0 ? (
              <div style={{ color: T.muted, fontSize: 11 }}>Extract palette first</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {palette.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveColorIdx(i)}
                    title={c.yarnName || c.hex}
                    style={{
                      width: 28, height: 28, background: c.hex, borderRadius: 6,
                      border: `2px solid ${i === activeColorIdx ? T.gold : T.border}`,
                      cursor: "pointer", flexShrink: 0,
                      boxShadow: i === activeColorIdx ? `0 0 0 2px ${T.goldDim}` : "none",
                      transition: "all 0.1s",
                    }}
                  />
                ))}
              </div>
            )}
            {palette[activeColorIdx] && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 20, height: 20, background: palette[activeColorIdx].hex, borderRadius: 4 }} />
                <span style={{ color: T.gold, fontSize: 11, fontFamily: "var(--font-mono)" }}>
                  {palette[activeColorIdx].hex.toUpperCase()}
                </span>
                <span style={{ color: T.muted, fontSize: 10 }}>
                  {palette[activeColorIdx].yarnName || `Yarn ${activeColorIdx + 1}`}
                </span>
              </div>
            )}
          </div>

          {/* Mirror */}
          <div style={card}>
            <div style={h2s}>Mirror Drawing</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setMirrorH((v) => !v)}
                style={{ ...btn(mirrorH ? "gold" : "ghost"), flex: 1, height: 32, fontSize: 10 }}
              >
                ↔ H
              </button>
              <button
                onClick={() => setMirrorV((v) => !v)}
                style={{ ...btn(mirrorV ? "gold" : "ghost"), flex: 1, height: 32, fontSize: 10 }}
              >
                ↕ V
              </button>
            </div>
            {(mirrorH || mirrorV) && (
              <div style={{ fontSize: 10, color: T.gold, marginTop: 8 }}>
                Mirror {mirrorH && mirrorV ? "H+V" : mirrorH ? "horizontal" : "vertical"} active — gold guide line shown
              </div>
            )}
          </div>

          {/* View */}
          <div style={card}>
            <div style={h2s}>View</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <button onClick={() => setZoom((z) => Math.max(2, z - 2))} style={{ ...btn("ghost"), width: 32, height: 28, padding: 0, fontSize: 16 }}>−</button>
              <span style={{ color: T.gold, fontWeight: 700, fontSize: 14, flex: 1, textAlign: "center" }}>{zoom}×</span>
              <button onClick={() => setZoom((z) => Math.min(32, z + 2))} style={{ ...btn("ghost"), width: 32, height: 28, padding: 0, fontSize: 16 }}>+</button>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, color: T.textDim }}>
              <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} style={{ accentColor: T.gold }} />
              Show grid lines
            </label>
          </div>

          {/* Motif library */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={h2s}>Motif Library</div>
              <button onClick={() => setMotifOpen((v) => !v)} style={{ ...btn("ghost"), height: 24, padding: "0 8px", fontSize: 9 }}>
                {motifOpen ? "Close" : "Open"}
              </button>
            </div>
            {motifOpen && (
              <>
                <label style={lbl}>Motif</label>
                <select value={selMotif} onChange={(e) => setSelMotif(e.target.value)} style={{ ...sel, marginBottom: 10 }}>
                  {MOTIF_LIBRARY.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <label style={lbl}>Size (cells)</label>
                <select value={motifSize} onChange={(e) => setMotifSize(+e.target.value)} style={{ ...sel, marginBottom: 10 }}>
                  {[8, 12, 16, 20, 24, 32].map((n) => <option key={n} value={n}>{n}×{n}</option>)}
                </select>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                  {[["C1", motifC1, setMotifC1], ["C2", motifC2, setMotifC2], ["C3", motifC3, setMotifC3]].map(([lname, val, setter]) => (
                    <div key={lname}>
                      <div style={{ fontSize: 9, color: T.textDim, marginBottom: 4 }}>{lname}</div>
                      <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        {palette.slice(0, 6).map((c, i) => (
                          <div key={i} onClick={() => setter(i)} style={{ width: 16, height: 16, background: c.hex, borderRadius: 3, border: `1.5px solid ${val === i ? T.gold : T.border}`, cursor: "pointer" }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {!placingMotif ? (
                  <button onClick={previewMotif} style={{ ...btn("gold"), width: "100%" }}>
                    Preview & Place →
                  </button>
                ) : (
                  <div>
                    <div style={{ color: T.gold, fontSize: 10, marginBottom: 8, lineHeight: 1.6 }}>
                      Click on canvas to place the motif. Right-click to cancel.
                    </div>
                    <button onClick={cancelMotif} style={{ ...btn("ghost"), width: "100%" }}>Cancel</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Canvas size */}
          <div style={card}>
            <div style={h2s}>Canvas Size</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div>
                <label style={lbl}>Width</label>
                <select value={resizeW} onChange={(e) => setResizeW(+e.target.value)} style={sel}>
                  {[16, 24, 32, 48, 64, 96, 128, 192, 256].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Height</label>
                <select value={resizeH} onChange={(e) => setResizeH(+e.target.value)} style={sel}>
                  {[16, 24, 32, 48, 64, 96, 128, 192, 256].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <button onClick={applyResize} style={{ ...btn("dim"), width: "100%" }}>Resize Canvas</button>
          </div>
        </div>

        {/* Main canvas */}
        <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
          {palette.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.25 }}>🎨</div>
              <div style={{ color: T.textDim, fontSize: 16, fontFamily: "var(--font-serif)", marginBottom: 8 }}>No palette loaded</div>
              <div style={{ color: T.muted, fontSize: 12 }}>Extract colors from the Import tab first, then come back to paint.</div>
            </div>
          ) : (
            <div style={{ background: "#0a0806", borderRadius: 12, padding: 16, display: "inline-block", border: `1px solid ${T.border}` }}>
              <canvas
                ref={cvRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  display: "block",
                  cursor: placingMotif ? "copy" : cursor,
                  imageRendering: "pixelated",
                  maxWidth: "100%",
                }}
              />
              {hoverCell && (
                <div style={{ color: T.muted, fontSize: 9, marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  Row {hoverCell.r + 1} · Col {hoverCell.c + 1}
                  {grid[hoverCell.r * gridW + hoverCell.c] > 0 && (
                    <span style={{ color: T.gold, marginLeft: 8 }}>
                      {palette[grid[hoverCell.r * gridW + hoverCell.c] - 1]?.hex}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: quick actions */}
        <div style={{ width: isMobile ? "100%" : 180, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={card}>
            <div style={h2s}>Quick Fill</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={autoFill} style={{ ...btn("dim"), width: "100%", height: 32, fontSize: 10 }}>
                Fill with Palette
              </button>
              {palette.slice(0, 8).map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    pushHist(grid);
                    setGrid(Array(gridW * gridH).fill(i + 1));
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surf, cursor: "pointer", color: T.textDim, fontSize: 10 }}
                >
                  <div style={{ width: 14, height: 14, background: c.hex, borderRadius: 3, flexShrink: 0 }} />
                  Fill all
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...card, fontSize: 10, color: T.textDim, lineHeight: 2 }}>
            <div style={h2s}>Shortcuts</div>
            {[["P", "Pencil"], ["E", "Eraser"], ["F", "Fill"], ["L", "Line"], ["R", "Rect"], ["C", "Circle"], ["I", "Eyedrop"], ["[/]", "Zoom −/+"], ["Ctrl+Z", "Undo"], ["Ctrl+Y", "Redo"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: T.gold, fontFamily: "var(--font-mono)", fontSize: 9 }}>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
