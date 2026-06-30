import { T } from "../styles/theme.js";

export default function WeaveGrid({ matrix, cellSize = 14, onToggle }) {
  if (!matrix?.length) return null;
  const interactive = typeof onToggle === "function";

  return (
    <div style={{
      display: "inline-block",
      border: `1px solid ${T.border}`,
      borderRadius: 6,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
    }}>
      {matrix.map((row, ri) => (
        <div key={ri} style={{ display: "flex" }}>
          {row.map((v, ci) => (
            <div
              key={ci}
              onClick={interactive ? () => onToggle(ri, ci) : undefined}
              style={{
                width: cellSize,
                height: cellSize,
                background: v ? T.gold : T.bg,
                border: `0.5px solid ${T.border}`,
                cursor: interactive ? "pointer" : "default",
                transition: interactive ? "background 0.1s" : "none",
              }}
              onMouseEnter={interactive ? (e) => {
                if (!v) e.currentTarget.style.background = T.goldDim;
              } : undefined}
              onMouseLeave={interactive ? (e) => {
                e.currentTarget.style.background = v ? T.gold : T.bg;
              } : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
