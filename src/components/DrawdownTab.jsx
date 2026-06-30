import { useState, useCallback } from "react";
import { T, btn, card, h2s, h2c, sel, lbl } from "../styles/theme.js";
import { genThreading, genTieup, genTreadling, computeDrawdown } from "../utils/weaveUtils.js";

const CELL = 16;

const SHAFT_PRESETS = [4, 6, 8, 12, 16, 24];
const THREADING_PATTERNS = ["straight", "pointed", "broken", "rosepath"];
const TIEUP_PATTERNS = ["straight", "plain", "twill-z", "twill-s", "satin", "basket"];
const TREADLING_PATTERNS = ["straight", "reverse", "pointed"];

function DraftGrid({ rows, cols, matrix, onToggle, rowLabel, colLabel, warpColor, weftColor, orientation = "normal" }) {
  const [hover, setHover] = useState(null);
  const isWarp = warpColor !== undefined;
  const cellSz = CELL;

  return (
    <div style={{ overflowAuto: "auto" }}>
      {colLabel && (
        <div style={{ display: "flex", paddingLeft: rowLabel ? 44 : 0, marginBottom: 2 }}>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} style={{ width: cellSz, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.textDim, flexShrink: 0 }}>
              {c + 1}
            </div>
          ))}
        </div>
      )}
      <div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} style={{ display: "flex", alignItems: "center" }}>
            {rowLabel && (
              <div style={{ width: 40, fontSize: 9, color: T.textDim, textAlign: "right", paddingRight: 4, flexShrink: 0 }}>
                {r + 1}
              </div>
            )}
            {Array.from({ length: cols }, (_, c) => {
              const on = matrix?.[r]?.[c] === 1;
              const isHov = hover?.[0] === r && hover?.[1] === c;
              let bg;
              if (isWarp) {
                bg = on ? (warpColor || T.gold) : (weftColor || T.surf);
              } else {
                bg = on ? T.gold : T.surf;
              }
              if (!on && isHov) bg = T.goldGlow;
              if (on && isHov) bg = T.goldDim;
              return (
                <div
                  key={c}
                  onClick={() => onToggle?.(r, c)}
                  onMouseEnter={() => setHover([r, c])}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    width: cellSz,
                    height: cellSz,
                    background: bg,
                    border: `0.5px solid ${T.border}`,
                    cursor: onToggle ? "pointer" : "default",
                    flexShrink: 0,
                    transition: "background 0.08s",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DrawdownTab({
  threading, setThreading,
  tieup, setTieup,
  treadling, setTreadling,
  numShafts, setNumShafts,
  numTreadles, setNumTreadles,
  numEnds, setNumEnds,
  numPicks, setNumPicks,
  loomType, setLoomType,
  warpYarnIdx, weftYarnIdx,
  palette,
}) {
  const [threadingPat, setThreadingPat] = useState("straight");
  const [tieupPat, setTieupPat] = useState("straight");
  const [treadlingPat, setTreadlingPat] = useState("straight");
  const [draftMode, setDraftMode] = useState("auto");

  // One-click loom recipes (Auto mode)
  const LOOM_RECIPES = {
    "Plain Weave":       { shafts: 2, treadles: 2, ends: 16, picks: 16, tp: "straight", tu: "plain",  tr: "straight", loom: "frame" },
    "2/2 Twill":         { shafts: 4, treadles: 4, ends: 16, picks: 16, tp: "straight", tu: "twill-z", tr: "straight", loom: "frame" },
    "Satin 5-shaft":     { shafts: 5, treadles: 5, ends: 20, picks: 20, tp: "straight", tu: "satin",  tr: "straight", loom: "dobby" },
    "Pointed Twill":     { shafts: 8, treadles: 8, ends: 24, picks: 24, tp: "pointed",  tu: "twill-z", tr: "pointed", loom: "dobby" },
    "Basket Weave":      { shafts: 4, treadles: 4, ends: 16, picks: 16, tp: "straight", tu: "basket", tr: "straight", loom: "frame" },
    "Jacquard 16-hook":  { shafts: 16,treadles:16, ends: 32, picks: 32, tp: "straight", tu: "straight",tr:"straight", loom: "jacquard" },
  };
  const [selectedRecipe, setSelectedRecipe] = useState("2/2 Twill");

  const drawdown = computeDrawdown(threading, tieup, treadling);
  const warpColor = palette[warpYarnIdx]?.hex;
  const weftColor = palette[weftYarnIdx]?.hex;

  const applyRecipe = (name) => {
    const r = LOOM_RECIPES[name];
    if (!r) return;
    setLoomType(r.loom);
    setNumShafts(r.shafts); setNumTreadles(r.treadles);
    setNumEnds(r.ends);     setNumPicks(r.picks);
    setThreadingPat(r.tp);  setTieupPat(r.tu); setTreadlingPat(r.tr);
    setThreading(genThreading(r.ends, r.shafts, r.tp));
    setTieup(genTieup(r.shafts, r.treadles, r.tu));
    setTreadling(genTreadling(r.picks, r.treadles, r.tr));
  };

  const rebuildAll = useCallback((ns = numShafts, nt = numTreadles, ne = numEnds, np = numPicks, tp = threadingPat, tu = tieupPat, tr = treadlingPat) => {
    setThreading(genThreading(ne, ns, tp));
    setTieup(genTieup(ns, nt, tu));
    setTreadling(genTreadling(np, nt, tr));
  }, [numShafts, numTreadles, numEnds, numPicks, threadingPat, tieupPat, treadlingPat, setThreading, setTieup, setTreadling]);

  const toggleThreading = (r, c) => {
    const next = threading.slice();
    next[c] = r;
    setThreading(next);
  };
  const toggleTieup = (r, c) => {
    const next = tieup.map((row) => [...row]);
    next[r][c] = next[r][c] ? 0 : 1;
    setTieup(next);
  };
  const toggleTreadling = (r, c) => {
    const next = treadling.slice();
    next[r] = c;
    setTreadling(next);
  };

  const threadingMatrix = Array.from({ length: numShafts }, (_, s) =>
    threading.map((shaft) => shaft === s ? 1 : 0)
  );
  const treadlingMatrix = Array.from({ length: numPicks }, (_, p) =>
    Array.from({ length: numTreadles }, (_, t) => treadling[p] === t ? 1 : 0)
  );

  const warpCoverage = (() => {
    let total = 0, warpUp = 0;
    drawdown.forEach((row) => row.forEach((v) => { total++; if (v) warpUp++; }));
    return total ? Math.round(warpUp / total * 100) : 0;
  })();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <div style={h2c(T.crimson)}>Weave Draft · Draw-down</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            Threading · Tie-up · Treadling
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["auto", "guided", "manual"].map((m) => (
            <button key={m} onClick={() => setDraftMode(m)} style={{
              ...btn(draftMode === m ? "gold" : "ghost"),
              height: 28, padding: "0 12px", fontSize: 9, letterSpacing: "1.5px",
            }}>{m.toUpperCase()}</button>
          ))}
          <div style={{ width: 1, height: 28, background: T.border, margin: "0 4px" }} />
          <div style={{ background: warpColor || T.gold, width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}` }} title="Warp" />
          <div style={{ background: weftColor || T.surf, width: 26, height: 26, borderRadius: 6, border: `1px solid ${T.border}` }} title="Weft" />
          <div style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, padding: "0 14px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: T.textDim, fontSize: 10 }}>WARP FACE</span>
            <span style={{ color: T.gold, fontSize: 13, fontWeight: 700 }}>{warpCoverage}%</span>
          </div>
        </div>
      </div>

      {/* ── Auto mode: loom recipes ── */}
      {draftMode === "auto" && (
        <div style={{ ...card, marginBottom: 20, padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px", whiteSpace: "nowrap" }}>QUICK SETUP</div>
            {Object.keys(LOOM_RECIPES).map((name) => (
              <button key={name} onClick={() => { setSelectedRecipe(name); applyRecipe(name); }}
                style={{
                  ...btn(selectedRecipe === name ? "gold" : "ghost"),
                  height: 30, padding: "0 14px", fontSize: 10,
                }}>
                {name}
              </button>
            ))}
          </div>
          {selectedRecipe && (
            <div style={{ marginTop: 10, fontSize: 10, color: T.textDim, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
              Applied: <span style={{ color: T.gold }}>{selectedRecipe}</span>
              {" · "}{LOOM_RECIPES[selectedRecipe]?.shafts} shafts
              {" · "}{LOOM_RECIPES[selectedRecipe]?.ends} ends
              {" · "}{LOOM_RECIPES[selectedRecipe]?.tp} threading
            </div>
          )}
        </div>
      )}

      {/* ── Guided mode: pattern suggestions ── */}
      {draftMode === "guided" && (
        <div style={{ ...card, marginBottom: 20, padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px" }}>THREADING</span>
            {THREADING_PATTERNS.map((p) => (
              <button key={p} onClick={() => { setThreadingPat(p); rebuildAll(numShafts, numTreadles, numEnds, numPicks, p, tieupPat, treadlingPat); }}
                style={{ ...btn(threadingPat === p ? "gold" : "ghost"), height: 28, padding: "0 10px", fontSize: 10 }}>{p}</button>
            ))}
            <span style={{ color: T.border }}>|</span>
            <span style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px" }}>TIE-UP</span>
            {TIEUP_PATTERNS.map((p) => (
              <button key={p} onClick={() => { setTieupPat(p); rebuildAll(numShafts, numTreadles, numEnds, numPicks, threadingPat, p, treadlingPat); }}
                style={{ ...btn(tieupPat === p ? "gold" : "ghost"), height: 28, padding: "0 10px", fontSize: 10 }}>{p}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, marginBottom: 20 }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={h2s}>Loom Setup</div>
            <label style={lbl}>Loom Type</label>
            <select value={loomType} onChange={(e) => setLoomType(e.target.value)} style={{ ...sel, marginBottom: 14 }}>
              <option value="frame">Frame Loom (2–16 shafts)</option>
              <option value="dobby">Dobby Loom (up to 24 shafts)</option>
              <option value="jacquard">Jacquard (individual hooks)</option>
            </select>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Shafts</label>
                <select value={numShafts} onChange={(e) => { const v = +e.target.value; setNumShafts(v); rebuildAll(v, numTreadles, numEnds, numPicks); }} style={sel}>
                  {SHAFT_PRESETS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Treadles</label>
                <select value={numTreadles} onChange={(e) => { const v = +e.target.value; setNumTreadles(v); rebuildAll(numShafts, v, numEnds, numPicks); }} style={sel}>
                  {[2, 4, 6, 8, 12, 16].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Warp Ends</label>
                <select value={numEnds} onChange={(e) => { const v = +e.target.value; setNumEnds(v); rebuildAll(numShafts, numTreadles, v, numPicks); }} style={sel}>
                  {[8, 12, 16, 24, 32].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Picks</label>
                <select value={numPicks} onChange={(e) => { const v = +e.target.value; setNumPicks(v); rebuildAll(numShafts, numTreadles, numEnds, v); }} style={sel}>
                  {[8, 12, 16, 24, 32].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={h2s}>Presets</div>
            <label style={lbl}>Threading</label>
            <select value={threadingPat} onChange={(e) => { setThreadingPat(e.target.value); setThreading(genThreading(numEnds, numShafts, e.target.value)); }} style={{ ...sel, marginBottom: 10 }}>
              {THREADING_PATTERNS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>

            <label style={lbl}>Tie-up</label>
            <select value={tieupPat} onChange={(e) => { setTieupPat(e.target.value); setTieup(genTieup(numShafts, numTreadles, e.target.value)); }} style={{ ...sel, marginBottom: 10 }}>
              {TIEUP_PATTERNS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>

            <label style={lbl}>Treadling</label>
            <select value={treadlingPat} onChange={(e) => { setTreadlingPat(e.target.value); setTreadling(genTreadling(numPicks, numTreadles, e.target.value)); }} style={{ ...sel, marginBottom: 14 }}>
              {TREADLING_PATTERNS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>

            <button onClick={() => rebuildAll()} style={{ ...btn("gold"), width: "100%" }}>
              Apply Preset
            </button>
          </div>

          <div style={{ ...card, fontSize: 11, color: T.textDim, lineHeight: 1.9 }}>
            <div style={h2s}>Legend</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, background: T.gold, borderRadius: 2 }} />
              <span>Shaft lifted / warp up</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 14, height: 14, background: T.surf, border: `1px solid ${T.border}`, borderRadius: 2 }} />
              <span>Shaft down / weft up</span>
            </div>
          </div>
        </div>

        {/* The four-quadrant draft diagram */}
        <div style={card}>
          <div style={h2s}>Draft Diagram · Click any cell to toggle</div>
          <div style={{ overflowX: "auto", overflowY: "auto" }}>
            {/* Row 1: Threading (top-left) + Tie-up (top-right) */}
            <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2, marginBottom: 6 }}>THREADING</div>
                <DraftGrid
                  rows={numShafts}
                  cols={numEnds}
                  matrix={threadingMatrix}
                  onToggle={toggleThreading}
                  rowLabel
                  colLabel
                />
              </div>
              <div style={{ borderLeft: `2px solid ${T.borderBr}`, marginLeft: 8, paddingLeft: 16 }}>
                <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2, marginBottom: 6 }}>TIE-UP</div>
                <DraftGrid
                  rows={numShafts}
                  cols={numTreadles}
                  matrix={tieup}
                  onToggle={toggleTieup}
                  rowLabel
                  colLabel
                />
              </div>
            </div>

            <div style={{ height: 1, background: T.borderBr, margin: "10px 0 10px 0" }} />

            {/* Row 2: Draw-down (bottom-left) + Treadling (bottom-right) */}
            <div style={{ display: "flex", gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2, marginBottom: 6 }}>DRAW-DOWN (computed)</div>
                <DraftGrid
                  rows={numPicks}
                  cols={numEnds}
                  matrix={drawdown}
                  rowLabel
                  colLabel
                  warpColor={warpColor}
                  weftColor={weftColor}
                />
              </div>
              <div style={{ borderLeft: `2px solid ${T.borderBr}`, marginLeft: 8, paddingLeft: 16 }}>
                <div style={{ fontSize: 9, color: T.textDim, letterSpacing: 2, marginBottom: 6 }}>TREADLING</div>
                <DraftGrid
                  rows={numPicks}
                  cols={numTreadles}
                  matrix={treadlingMatrix}
                  onToggle={toggleTreadling}
                  rowLabel
                  colLabel
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hook assignment for jacquard */}
      {loomType === "jacquard" && (
        <div style={card}>
          <div style={h2s}>Jacquard Hook Assignment</div>
          <div style={{ color: T.textDim, fontSize: 12, lineHeight: 1.9, marginBottom: 14 }}>
            In jacquard weaving, each warp end (column) is controlled by an individual hook. The draw-down above is the direct hook control map — column i = hook i.
            Hook state is read from the draw-down: warp-up cells (gold) = hook raised for that pick.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px,1fr))", gap: 8 }}>
            {threading.slice(0, numEnds).map((_, i) => (
              <div key={i} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ color: T.muted, fontSize: 8, letterSpacing: 1 }}>HOOK</div>
                <div style={{ color: T.gold, fontWeight: 700, fontSize: 14 }}>{i + 1}</div>
                <div style={{ color: T.textDim, fontSize: 9 }}>End {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dobby chain */}
      {loomType === "dobby" && (
        <div style={card}>
          <div style={h2s}>Dobby Chain Draft</div>
          <div style={{ color: T.textDim, fontSize: 12, lineHeight: 1.9, marginBottom: 14 }}>
            The dobby peg sequence (or electronic dobby) controls which shafts lift on each pick. Derived from treadling + tie-up above.
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "max-content" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  <th style={{ color: T.textDim, fontSize: 10, letterSpacing: 1.5, padding: "8px 12px", textAlign: "left", fontWeight: 400 }}>Pick</th>
                  {Array.from({ length: numShafts }, (_, s) => (
                    <th key={s} style={{ color: T.textDim, fontSize: 10, letterSpacing: 1.5, padding: "8px 12px", textAlign: "center", fontWeight: 400 }}>Sh {s + 1}</th>
                  ))}
                  <th style={{ color: T.textDim, fontSize: 10, letterSpacing: 1.5, padding: "8px 12px", textAlign: "left", fontWeight: 400 }}>Treadle</th>
                </tr>
              </thead>
              <tbody>
                {treadling.map((treadle, pick) => (
                  <tr key={pick} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "7px 12px", color: T.muted, fontSize: 11 }}>{pick + 1}</td>
                    {Array.from({ length: numShafts }, (_, s) => {
                      const lifted = tieup[s]?.[treadle] === 1;
                      return (
                        <td key={s} style={{ padding: "7px 12px", textAlign: "center" }}>
                          {lifted
                            ? <span style={{ color: T.gold, fontSize: 13, fontWeight: 700 }}>●</span>
                            : <span style={{ color: T.border, fontSize: 13 }}>○</span>}
                        </td>
                      );
                    })}
                    <td style={{ padding: "7px 12px", color: T.textDim, fontSize: 11 }}>T{treadle + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
