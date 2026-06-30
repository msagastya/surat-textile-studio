import { useState, useCallback } from "react";
import { T, btn, card, h2s, sel, lbl } from "../styles/theme.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

function contrastText(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return lum > 0.3 ? "rgba(20,16,8,0.85)" : "rgba(255,255,255,0.85)";
}

async function fetchColorways(palette, prompt) {
  const colors = palette.map((c, i) => `${i + 1}. ${c.hex} (${c.yarnName || "Yarn " + (i + 1)})`).join("\n");
  const messages = [{
    role: "user",
    content: `You are a Surat textile color expert. Given this base palette:\n${colors}\n\nUser request: "${prompt || "Generate 4 beautiful colorway variations for Surat market"}"\n\nReturn ONLY a JSON array of 4 colorway objects. Each colorway is an array of hex colors matching the base palette count (${palette.length} colors). Example:\n[["#color1","#color2",...],["#color1","#color2",...],["#color1","#color2",...],["#color1","#color2",...]]\n\nMake them beautiful, commercially viable, and appropriate for Surat weaving. Return raw JSON only, no markdown.`,
  }];
  const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
  const data = await res.json();
  const raw = data.text || "";
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in response");
  return JSON.parse(match[0]);
}

function SwatchRow({ cw, idx, active, onActivate, onDelete, onRename, onColorClick }) {
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(cw.name);

  return (
    <div style={{
      ...card,
      borderColor: active ? T.goldDim : T.border,
      background: active ? T.goldFaint : T.panel,
      marginBottom: 12,
      padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {active && <span style={{ color: T.gold, fontSize: 10 }}>✓</span>}
          {editName ? (
            <input
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={() => { setEditName(false); onRename(idx, nameVal); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setEditName(false); onRename(idx, nameVal); } }}
              autoFocus
              style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 6, color: T.text, fontSize: 12, padding: "4px 8px", fontFamily: "var(--font-mono)", outline: "none" }}
            />
          ) : (
            <span
              style={{ color: active ? T.gold : T.text, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              onDoubleClick={() => setEditName(true)}
            >
              {cw.name}
            </span>
          )}
          <span style={{ color: T.muted, fontSize: 10 }}>{cw.palette.length} colors</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!active && (
            <button onClick={() => onActivate(idx)} style={{ ...btn("gold"), height: 28, fontSize: 9, padding: "0 12px" }}>
              Apply →
            </button>
          )}
          {active && (
            <span style={{ ...btn("ghost"), height: 28, fontSize: 9, padding: "0 12px", pointerEvents: "none", opacity: 0.6 }}>
              Active
            </span>
          )}
          {idx > 0 && (
            <button onClick={() => onDelete(idx)} style={{ ...btn("ghost"), height: 28, fontSize: 9, padding: "0 12px" }}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {cw.palette.map((c, ci) => (
          <div
            key={ci}
            onClick={() => onColorClick?.(idx, ci)}
            title={c.hex}
            style={{
              width: 48,
              height: 48,
              background: c.hex,
              borderRadius: 8,
              border: `2px solid ${T.border}`,
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
              transition: "transform 0.12s, border-color 0.12s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.borderColor = T.goldDim; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = T.border; }}
          >
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(0,0,0,0.5)", borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
              fontSize: 8, color: "rgba(255,255,255,0.9)", textAlign: "center", padding: "2px 0",
              fontFamily: "var(--font-mono)",
            }}>
              {c.hex.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ColorwaysTab({ palette, setPalette, colorways, setColorways }) {
  const { isMobile } = useBreakpoint();
  const [busy, setBusy] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState("");
  const [colorPicker, setColorPicker] = useState(null); // {cwIdx, colorIdx}

  const addColorway = () => {
    const base = colorways[activeIdx] || { name: "Base", palette };
    const newCw = {
      name: `Colorway ${colorways.length + 1}`,
      palette: base.palette.map((c) => ({ ...c })),
    };
    setColorways((prev) => [...prev, newCw]);
    setActiveIdx(colorways.length);
  };

  const activateCw = useCallback((idx) => {
    setActiveIdx(idx);
    setPalette(colorways[idx].palette.map((c) => ({ ...c })));
  }, [colorways, setPalette]);

  const deleteCw = (idx) => {
    setColorways((prev) => prev.filter((_, i) => i !== idx));
    if (activeIdx >= idx) setActiveIdx(Math.max(0, activeIdx - 1));
  };

  const renameCw = (idx, name) => {
    setColorways((prev) => prev.map((cw, i) => i === idx ? { ...cw, name } : cw));
  };

  const handleColorChange = (cwIdx, colorIdx, hex) => {
    setColorways((prev) => prev.map((cw, ci) => {
      if (ci !== cwIdx) return cw;
      return {
        ...cw,
        palette: cw.palette.map((c, pi) => pi === colorIdx ? { ...c, hex } : c),
      };
    }));
  };

  const generateAI = async () => {
    if (!palette.length) return;
    setBusy(true);
    setError("");
    try {
      const result = await fetchColorways(palette, prompt);
      const newCws = result.map((hexArr, i) => ({
        name: `AI Colorway ${colorways.length + i + 1}`,
        palette: palette.map((c, pi) => ({ ...c, hex: hexArr[pi] || c.hex })),
      }));
      setColorways((prev) => [...prev, ...newCws]);
    } catch (e) {
      setError("AI generation failed: " + e.message);
    }
    setBusy(false);
  };

  if (!palette.length) {
    return (
      <div style={{ ...card, textAlign: "center", padding: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.25 }}>🎨</div>
        <div style={{ color: T.textDim, fontSize: 16, fontFamily: "var(--font-serif)", marginBottom: 8 }}>No palette yet</div>
        <div style={{ color: T.muted, fontSize: 12 }}>Extract colors from an image to start creating colorways.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="tab-header">
        <div>
          <div style={h2s}>Colorways</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            {colorways.length} Variant{colorways.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="tab-header-actions" style={{ display: "flex", gap: 10 }}>
          <button onClick={addColorway} style={btn("dim")}>+ Add Colorway</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: 24 }}>
        {/* AI generator panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={h2s}>AI Generator</div>
            <label style={lbl}>Style prompt (optional)</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Pastel bridal palette for Dubai market, keep the zari gold but shift blues to mint..."
              style={{
                background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8,
                color: T.text, fontFamily: "var(--font-mono)", fontSize: 11,
                padding: "10px 12px", width: "100%", boxSizing: "border-box",
                resize: "vertical", minHeight: 80, outline: "none", lineHeight: 1.8, marginBottom: 14,
              }}
            />
            <button
              onClick={generateAI}
              disabled={busy}
              style={{ ...btn("gold", busy), width: "100%" }}
            >
              {busy ? "Generating..." : "Generate 4 Colorways →"}
            </button>
            {error && <div style={{ color: T.redBr, fontSize: 10, marginTop: 8 }}>{error}</div>}
          </div>

          <div style={card}>
            <div style={h2s}>Instructions</div>
            <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.9 }}>
              <div style={{ marginBottom: 8 }}>• <strong style={{ color: T.text }}>Double-click</strong> a colorway name to rename it</div>
              <div style={{ marginBottom: 8 }}>• <strong style={{ color: T.text }}>Click a swatch</strong> to edit that color</div>
              <div style={{ marginBottom: 8 }}>• <strong style={{ color: T.text }}>Apply →</strong> sends the colorway to the main palette</div>
              <div>• Use <strong style={{ color: T.text }}>AI Generator</strong> to create variations automatically</div>
            </div>
          </div>

          {/* Color picker popup */}
          {colorPicker && (
            <div style={{ ...card, borderColor: T.goldDim }}>
              <div style={h2s}>Edit Color</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, background: colorways[colorPicker.cwIdx]?.palette[colorPicker.colorIdx]?.hex, borderRadius: 8, border: `1px solid ${T.border}` }} />
                <input
                  type="color"
                  value={colorways[colorPicker.cwIdx]?.palette[colorPicker.colorIdx]?.hex || "#000000"}
                  onChange={(e) => handleColorChange(colorPicker.cwIdx, colorPicker.colorIdx, e.target.value)}
                  style={{ width: 60, height: 40, cursor: "pointer", background: "none", border: "none", padding: 0 }}
                />
                <button onClick={() => setColorPicker(null)} style={{ ...btn("ghost"), height: 28, fontSize: 9, padding: "0 10px" }}>Done</button>
              </div>
            </div>
          )}
        </div>

        {/* Colorway list */}
        <div>
          {colorways.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>🎨</div>
              <div style={{ color: T.textDim }}>Click <strong style={{ color: T.gold }}>+ Add Colorway</strong> or <strong style={{ color: T.gold }}>Generate</strong> to create variants.</div>
            </div>
          ) : (
            colorways.map((cw, idx) => (
              <SwatchRow
                key={idx}
                cw={cw}
                idx={idx}
                active={idx === activeIdx}
                onActivate={activateCw}
                onDelete={deleteCw}
                onRename={renameCw}
                onColorClick={(cwIdx, colorIdx) => setColorPicker({ cwIdx, colorIdx })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
