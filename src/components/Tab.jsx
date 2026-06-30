import { T, TAB_ACCENT, TAB_ACCENT_FAINT } from "../styles/theme.js";

export default function Tab({ id, label, active, onClick, badge }) {
  const accent = TAB_ACCENT[id] || T.gold;
  const faint  = TAB_ACCENT_FAINT[id] || T.goldFaint;

  return (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: "0 16px",
        height: 44,
        border: "none",
        background: active ? faint : "transparent",
        color: active ? accent : T.textDim,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: active ? 700 : 400,
        letterSpacing: active ? "0.8px" : "0.3px",
        borderBottom: `2px solid ${active ? accent : "transparent"}`,
        borderTop: "2px solid transparent",
        cursor: "pointer",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = accent;
          e.currentTarget.style.background = faint;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = T.textDim;
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {label}
      {badge ? (
        <span style={{
          background: accent,
          color: "#fff",
          borderRadius: 8,
          padding: "1px 6px",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 0,
          lineHeight: "14px",
          mixBlendMode: "normal",
        }}>{badge > 99 ? "99+" : badge}</span>
      ) : null}
    </button>
  );
}
