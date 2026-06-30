import { useRef, useState } from "react";
import { T, btn, lbl, card, h2s, sel } from "../styles/theme.js";

// Smart defaults based on fabric type
const FABRIC_PRESETS = {
  "Georgette":      { colors: 8,  hint: "Georgette uses soft gradients — 6–12 colors ideal" },
  "Jacquard":       { colors: 16, hint: "Jacquard supports complex multi-color patterns — 12–24 colors" },
  "Crepe":          { colors: 6,  hint: "Crepe typically uses 4–8 solid colors" },
  "Satin":          { colors: 10, hint: "Satin sheen works best with 8–14 colors" },
  "Chiffon":        { colors: 8,  hint: "Chiffon needs light, flowing colors — 6–12 ideal" },
  "Velvet":         { colors: 12, hint: "Velvet richness shows with 10–16 colors" },
  "Organza":        { colors: 8,  hint: "Organza is sheer — 6–10 colors work well" },
  "Banarasi Silk":  { colors: 20, hint: "Banarasi Silk is the richest — up to 24 colors possible" },
  "Pure Silk":      { colors: 16, hint: "Pure Silk: 12–20 colors for premium designs" },
  "Art Silk":       { colors: 12, hint: "Art Silk: 10–16 colors for good market range" },
};

function ModeChip({ id, label, desc, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, padding: "10px 14px", borderRadius: 10, cursor: "pointer",
        border: `1.5px solid ${active ? T.goldDim : T.border}`,
        background: active ? T.goldFaint : T.surf,
        transition: "all 0.15s",
      }}
    >
      <div style={{ color: active ? T.gold : T.textDim, fontWeight: 700, fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: T.muted, fontSize: 9, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function StepCard({ n, title, done, children }) {
  return (
    <div style={{
      ...card,
      padding: "16px 18px",
      borderColor: done ? T.goldDim : T.border,
      boxShadow: done
        ? `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${T.goldDim}`
        : "0 4px 24px rgba(0,0,0,0.5)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
          background: done ? T.green : T.goldFaint,
          border: `1.5px solid ${done ? T.greenBr : T.goldDim}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: done ? "#fff" : T.gold,
        }}>{done ? "✓" : n}</div>
        <span style={{ color: done ? T.textDim : T.text, fontSize: 12, fontWeight: 600, letterSpacing: "0.5px" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

export default function ImportTab({
  image, loadImage, imageDimensions, fabricType, zariType,
  colorCount, setColorCount, fab, epi, ppi, gsm, denier,
  processing, extractColors, aiLoading, runAI, palette, repeatW, repeatH,
}) {
  const fileRef = useRef(null);
  const [mode, setMode] = useState("auto");

  const preset = FABRIC_PRESETS[fabricType] || { colors: 12, hint: "Adjust color count for best results" };

  // Auto mode: extract + AI in one click
  const runAuto = () => {
    if (!image || processing) return;
    // Use smart default for this fabric type
    if (mode === "auto") setColorCount(preset.colors);
    extractColors();
    // AI runs after extraction (caller handles the palette flow)
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

      {/* ── Drop zone ── */}
      <div>
        <div
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) loadImage(f); }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${image ? T.goldDim : T.border}`,
            borderRadius: 16,
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: image ? T.panel : T.surf,
            overflow: "hidden",
            position: "relative",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => { if (!image) e.currentTarget.style.borderColor = T.gold; }}
          onMouseLeave={(e) => { if (!image) e.currentTarget.style.borderColor = T.border; }}
        >
          {image ? (
            <>
              <img src={image} alt="" style={{ maxWidth: "100%", maxHeight: 500, objectFit: "contain" }} />
              <div style={{
                position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
                background: "rgba(6,5,4,0.85)", border: `1px solid ${T.border}`,
                borderRadius: 20, padding: "5px 14px", fontSize: 10, color: T.textDim, whiteSpace: "nowrap",
              }}>Click to replace image</div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 48, userSelect: "none" }}>
              <div style={{ fontSize: 64, marginBottom: 20, opacity: 0.5 }}>🖼️</div>
              <div style={{ color: T.gold, fontFamily: "var(--font-serif)", fontSize: 18, marginBottom: 10, letterSpacing: 1 }}>
                Drop your fabric image here
              </div>
              <div style={{ color: T.textDim, fontSize: 12, lineHeight: 2 }}>
                JPG · PNG · BMP · TIFF · WebP<br />
                Saree · Loom photo · Design scan
              </div>
              <div style={{ marginTop: 20, display: "inline-block", border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 20px", color: T.muted, fontSize: 11 }}>
                or click to browse
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) loadImage(e.target.files[0]); }} />
        </div>

        {imageDimensions && (
          <div style={{ display: "flex", gap: 24, marginTop: 12, paddingLeft: 4 }}>
            {[["Dimensions", `${imageDimensions.width} × ${imageDimensions.height} px`], ["Fabric", fabricType], ["Zari", zariType]].map(([k, v]) => (
              <div key={k} style={{ fontSize: 10 }}>
                <span style={{ color: T.muted, letterSpacing: 1 }}>{k} </span>
                <span style={{ color: T.text }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Mode selector */}
        <div style={card}>
          <div style={h2s}>Workflow Mode</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <ModeChip id="auto"   label="Auto"   desc="One click — smart defaults" active={mode === "auto"}   onClick={() => setMode("auto")} />
            <ModeChip id="guided" label="Guided"  desc="Suggestions + few tweaks"  active={mode === "guided"} onClick={() => setMode("guided")} />
            <ModeChip id="manual" label="Manual"  desc="Full control of all settings" active={mode === "manual"} onClick={() => setMode("manual")} />
          </div>

          {/* Context tip */}
          {image && (
            <div style={{ background: T.raise, borderRadius: 8, padding: "10px 12px", fontSize: 10, color: T.textDim, lineHeight: 1.8, borderLeft: `2px solid ${T.goldDim}` }}>
              <span style={{ color: T.gold, fontWeight: 700 }}>Tip · </span>{preset.hint}
            </div>
          )}
        </div>

        {/* AUTO MODE */}
        {mode === "auto" && (
          <StepCard n={1} title="One-Click Setup" done={palette.length > 0}>
            <div style={{ color: T.textDim, fontSize: 11, lineHeight: 1.9, marginBottom: 14 }}>
              Smart defaults for <span style={{ color: T.gold }}>{fabricType}</span>:
              <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[["Colors", preset.colors], ["EPI", epi], ["PPI", ppi], ["GSM", gsm]].map(([k, v]) => (
                  <div key={k} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 10px" }}>
                    <div style={{ color: T.textDim, fontSize: 9, letterSpacing: "1.5px" }}>{k}</div>
                    <div style={{ color: T.gold, fontSize: 13, fontWeight: 700, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={runAuto} disabled={!image || processing}
              style={{ ...btn("gold", !image || processing), width: "100%", height: 42, fontSize: 12 }}>
              {processing ? "Processing..." : "Extract Everything Automatically"}
            </button>
            {palette.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 10, color: T.green, textAlign: "center" }}>
                {palette.length} colors extracted — check the Palette tab
              </div>
            )}
          </StepCard>
        )}

        {/* GUIDED MODE */}
        {mode === "guided" && (
          <>
            <StepCard n={1} title="Choose Color Count" done={palette.length > 0}>
              <div style={{ fontSize: 10, color: T.gold, marginBottom: 8 }}>
                Suggested for {fabricType}: <strong>{preset.colors}</strong> colors
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <input type="range" min={4} max={32} value={colorCount}
                  onChange={(e) => setColorCount(+e.target.value)} style={{ flex: 1 }} />
                <span style={{ color: T.gold, fontWeight: 700, fontSize: 18, minWidth: 28, textAlign: "right" }}>{colorCount}</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {[4, 8, 12, 16, 24].map((n) => (
                  <button key={n} onClick={() => setColorCount(n)}
                    style={{ ...btn(colorCount === n ? "gold" : "ghost"), height: 26, padding: "0 10px", fontSize: 10 }}>
                    {n}{n === preset.colors ? " ★" : ""}
                  </button>
                ))}
              </div>
              <button onClick={extractColors} disabled={!image || processing}
                style={{ ...btn("gold", !image || processing), width: "100%", height: 38 }}>
                {processing ? "Extracting..." : "Extract Colors & Detect Repeat"}
              </button>
            </StepCard>

            <StepCard n={2} title="AI Analysis" done={false}>
              <div style={{ fontSize: 10, color: T.textDim, marginBottom: 10, lineHeight: 1.8 }}>
                Optional — runs after extraction. Gets market price, fabric specs, and Surat catalog potential.
              </div>
              <button onClick={runAI} disabled={!image || aiLoading}
                style={{ ...btn(palette.length ? "gold" : "dim", !image || aiLoading), width: "100%", height: 38 }}>
                {aiLoading ? "Analyzing..." : "Run AI Analysis"}
              </button>
            </StepCard>
          </>
        )}

        {/* MANUAL MODE */}
        {mode === "manual" && (
          <>
            <StepCard n={1} title="Extract Colors" done={palette.length > 0}>
              <label style={lbl}>Colors / Yarns</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <input type="range" min={2} max={48} value={colorCount}
                  onChange={(e) => setColorCount(+e.target.value)} style={{ flex: 1 }} />
                <span style={{ color: T.gold, fontWeight: 700, fontSize: 18, minWidth: 28, textAlign: "right" }}>{colorCount}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                {[["EPI", epi], ["PPI", ppi], ["GSM", gsm], ["Denier", denier]].map(([k, v]) => (
                  <div key={k} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 10px" }}>
                    <div style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px" }}>{k}</div>
                    <div style={{ color: T.gold, fontSize: 14, fontWeight: 700, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ color: T.textDim, fontSize: 10, marginBottom: 12 }}>
                Yarn: <span style={{ color: T.gold }}>{fab.yarn}</span> · {fab.use}
              </div>

              <button onClick={extractColors} disabled={!image || processing}
                style={{ ...btn("gold", !image || processing), width: "100%", height: 38 }}>
                {processing ? "Extracting..." : "Extract Colors & Detect Repeat"}
              </button>
            </StepCard>

            <StepCard n={2} title="AI Analysis" done={false}>
              <p style={{ color: T.textDim, fontSize: 11, lineHeight: 1.8, marginBottom: 14 }}>
                Expert Surat market report — fabric type, zari, loom specs, catalog potential, and ₹ price estimate.
              </p>
              <button onClick={runAI} disabled={!image || aiLoading}
                style={{ ...btn("gold", !image || aiLoading), width: "100%", height: 38 }}>
                {aiLoading ? "Analyzing..." : "Run Full AI Analysis"}
              </button>
            </StepCard>
          </>
        )}

        {/* Quick stats — shown in all modes after extraction */}
        {palette.length > 0 && (
          <div style={card}>
            <div style={h2s}>Quick Stats</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                ["Colors", palette.length,               "#bf6ff5"],
                ["Dominant", palette[0]?.hex?.toUpperCase(), palette[0]?.hex || T.gold],
                ["Repeat W", `${repeatW}px`,             "#1fc8c0"],
                ["Repeat H", `${repeatH}px`,             "#1fc8c0"],
              ].map(([k, v, accent]) => (
                <div key={k} style={{
                  background: `linear-gradient(135deg, ${T.surf} 0%, ${accent}08 100%)`,
                  border: `1px solid ${accent}44`,
                  borderRadius: 10, padding: "10px 12px",
                  boxShadow: `0 0 12px ${accent}18`,
                }}>
                  <div style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>{k}</div>
                  <div style={{ color: accent, fontSize: 15, fontWeight: 700, marginTop: 4 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Color preview strip */}
            <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden", marginTop: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
              {palette.map((c, i) => (
                <div key={i} style={{ flex: c.percentage || 1, background: c.hex }} title={`${c.hex} · ${c.percentage?.toFixed(1)}%`} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
