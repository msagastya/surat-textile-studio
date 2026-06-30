// ── Color system — Indian jewel-tone palette ─────────────────────────────────
export const T = {
  // Backgrounds — warm dark, layered
  bg:        "#07050a",       // deep aubergine-black
  surf:      "#0e0b10",       // dark plum surface
  panel:     "#141018",       // panel
  raise:     "#1c1822",       // raised element
  border:    "#2a2234",       // border
  borderBr:  "#3d3252",       // bright border

  // ── Saffron / Gold — primary accent ──
  gold:      "#e4a832",
  goldDim:   "#8a6218",
  goldFaint: "rgba(228,168,50,0.07)",
  goldGlow:  "rgba(228,168,50,0.15)",
  goldLine:  "rgba(228,168,50,0.40)",

  // ── Crimson / Ruby — weave & structural ──
  crimson:      "#e03e5c",
  crimsonDim:   "#7a1a2a",
  crimsonFaint: "rgba(224,62,92,0.07)",
  crimsonGlow:  "rgba(224,62,92,0.18)",
  crimsonLine:  "rgba(224,62,92,0.40)",

  // ── Indigo / Royal — analysis & AI ──
  indigo:      "#6b7ff5",
  indigoDim:   "#2e3a8a",
  indigoFaint: "rgba(107,127,245,0.07)",
  indigoGlow:  "rgba(107,127,245,0.15)",
  indigoLine:  "rgba(107,127,245,0.40)",

  // ── Teal / Peacock — design & canvas ──
  teal:      "#1fc8c0",
  tealDim:   "#0a6460",
  tealFaint: "rgba(31,200,192,0.07)",
  tealGlow:  "rgba(31,200,192,0.15)",
  tealLine:  "rgba(31,200,192,0.40)",

  // ── Emerald / Forest — cost & export ──
  emerald:      "#34c97a",
  emeraldDim:   "#155e38",
  emeraldFaint: "rgba(52,201,122,0.07)",
  emeraldGlow:  "rgba(52,201,122,0.15)",
  emeraldLine:  "rgba(52,201,122,0.40)",

  // ── Amethyst / Violet — colorways & palette ──
  violet:      "#bf6ff5",
  violetDim:   "#5a2480",
  violetFaint: "rgba(191,111,245,0.07)",
  violetGlow:  "rgba(191,111,245,0.15)",
  violetLine:  "rgba(191,111,245,0.40)",

  // ── Typography ──
  text:      "#ede4d5",
  textDim:   "#a296b0",
  muted:     "#6e5e82",

  // ── Legacy semantic (mapped to new system) ──
  red:       "#c0394a",
  redBr:     "#e03e5c",
  green:     "#155e38",
  greenBr:   "#34c97a",
  blue:      "#2e3a8a",
  blueBr:    "#6b7ff5",
};

// ── Tab group accent colors ───────────────────────────────────────────────────
// Used to color-code the 5 tab groups
export const TAB_ACCENT = {
  import:    T.gold,
  palette:   T.violet,
  recolor:   T.violet,
  colorways: T.violet,
  canvas:    T.teal,
  library:   T.teal,
  weave:     T.crimson,
  drawdown:  T.crimson,
  simulate:  T.crimson,
  repeat:    T.crimson,
  layers:    T.indigo,
  yarn:      T.emerald,
  analysis:  T.indigo,
  market:    T.emerald,
  export:    T.emerald,
};

export const TAB_ACCENT_FAINT = {
  import:    T.goldFaint,
  palette:   T.violetFaint,
  recolor:   T.violetFaint,
  colorways: T.violetFaint,
  canvas:    T.tealFaint,
  library:   T.tealFaint,
  weave:     T.crimsonFaint,
  drawdown:  T.crimsonFaint,
  simulate:  T.crimsonFaint,
  repeat:    T.crimsonFaint,
  layers:    T.indigoFaint,
  yarn:      T.emeraldFaint,
  analysis:  T.indigoFaint,
  market:    T.emeraldFaint,
  export:    T.emeraldFaint,
};

// ── Buttons ───────────────────────────────────────────────────────────────────
export const btn = (variant = "gold", disabled = false) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  height: 36,
  padding: "0 18px",
  borderRadius: 8,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.8px",
  textTransform: "uppercase",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.38 : 1,
  whiteSpace: "nowrap",
  transition: "opacity 0.15s, box-shadow 0.15s, transform 0.08s",
  border: "1px solid",
  ...(variant === "gold"    ? { background: T.gold,    color: "#0a0608", borderColor: T.gold,    boxShadow: `0 0 12px ${T.goldGlow}` } : {}),
  ...(variant === "crimson" ? { background: T.crimson, color: "#fff",    borderColor: T.crimson, boxShadow: `0 0 12px ${T.crimsonGlow}` } : {}),
  ...(variant === "indigo"  ? { background: T.indigo,  color: "#fff",    borderColor: T.indigo,  boxShadow: `0 0 12px ${T.indigoGlow}` } : {}),
  ...(variant === "teal"    ? { background: T.teal,    color: "#051312", borderColor: T.teal,    boxShadow: `0 0 12px ${T.tealGlow}` } : {}),
  ...(variant === "emerald" ? { background: T.emerald, color: "#051209", borderColor: T.emerald, boxShadow: `0 0 12px ${T.emeraldGlow}` } : {}),
  ...(variant === "violet"  ? { background: T.violet,  color: "#fff",    borderColor: T.violet,  boxShadow: `0 0 12px ${T.violetGlow}` } : {}),
  ...(variant === "red"     ? { background: T.red,     color: "#fff",    borderColor: T.red } : {}),
  ...(variant === "green"   ? { background: T.green,   color: T.text,    borderColor: T.green } : {}),
  ...(variant === "blue"    ? { background: T.blue,    color: T.text,    borderColor: T.blue } : {}),
  ...(variant === "ghost"   ? { background: "transparent", color: T.textDim, borderColor: T.border } : {}),
  ...(variant === "dim"     ? { background: T.raise,   color: T.textDim, borderColor: T.border } : {}),
});

// ── Inputs ───────────────────────────────────────────────────────────────────
export const inp = {
  background: T.surf,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.text,
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  padding: "9px 12px",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

export const sel = {
  ...inp,
  cursor: "pointer",
  paddingRight: 30,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='5'%3E%3Cpath d='M0 0l5 5 5-5z' fill='%236e5e82'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 11px center",
  appearance: "none",
};

// ── Labels ───────────────────────────────────────────────────────────────────
export const lbl = {
  display: "block",
  color: T.textDim,
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  letterSpacing: "1.8px",
  textTransform: "uppercase",
  marginBottom: 6,
};

// ── Cards ────────────────────────────────────────────────────────────────────
export const card = {
  background: T.panel,
  border: `1px solid ${T.border}`,
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 4px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
};

// Card with colored accent — pass an accent color hex
export const accentCard = (accentHex) => ({
  ...card,
  borderColor: accentHex ? `${accentHex}44` : T.border,
  boxShadow: accentHex
    ? `0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accentHex}22, inset 0 1px 0 rgba(255,255,255,0.03)`
    : card.boxShadow,
  background: accentHex
    ? `linear-gradient(135deg, ${T.panel} 0%, ${accentHex}08 100%)`
    : T.panel,
});

// ── Section heading ───────────────────────────────────────────────────────────
export const h2s = {
  color: T.gold,
  fontFamily: "var(--font-mono)",
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  margin: "0 0 18px 0",
  paddingLeft: 10,
  borderLeft: `2px solid ${T.gold}`,
  lineHeight: "14px",
};

// Colored section heading
export const h2c = (color = T.gold) => ({
  ...h2s,
  color,
  borderLeftColor: color,
});
