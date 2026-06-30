import { T } from "../styles/theme.js";

export default function Swatch({ c, i, onEdit }) {
  const [r, g, b] = c.rgb;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const fg = luma > 140 ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.9)";
  const fgMuted = luma > 140 ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";

  return (
    <div
      onClick={() => onEdit(i)}
      title={`${c.hex.toUpperCase()} · ${c.percentage?.toFixed(1)}% · ${c.yarnName || `Yarn ${i + 1}`}\nClick to edit`}
      style={{
        background: c.hex,
        width: 78,
        height: 90,
        borderRadius: 10,
        cursor: "pointer",
        border: "1.5px solid rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 0 6px",
        transition: "transform 0.18s, box-shadow 0.18s",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 3px 12px rgba(0,0,0,0.5)",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.05)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.6)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.5)";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.3)";
      }}
    >
      {/* Rank badge */}
      {i === 0 && (
        <div style={{ position: "absolute", top: 6, left: 6, background: "rgba(0,0,0,0.55)", borderRadius: 4, padding: "2px 5px", fontSize: 8, color: T.gold, fontWeight: 700, letterSpacing: "0.5px" }}>
          #1
        </div>
      )}

      {/* Bottom info strip */}
      <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", margin: "0 5px", borderRadius: 6, padding: "4px 6px", textAlign: "center" }}>
        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: fg, fontWeight: 700, letterSpacing: "0.3px" }}>
          {c.hex.toUpperCase()}
        </div>
        <div style={{ fontSize: 8, color: fgMuted, marginTop: 1 }}>
          {c.percentage?.toFixed(1)}%
        </div>
        <div style={{ fontSize: 8, color: fgMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 60 }}>
          {c.yarnName || `Yarn ${i + 1}`}
        </div>
      </div>
    </div>
  );
}
