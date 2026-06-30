import { T, TAB_ACCENT, TAB_ACCENT_FAINT } from "../styles/theme.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

// Short labels for small screens
const SHORT = {
  import:"Import", palette:"Colors", recolor:"Recolor", colorways:"Ways",
  canvas:"Canvas", library:"Library", weave:"Weave", drawdown:"Draft",
  simulate:"Sim", repeat:"Repeat", layers:"Layers", yarn:"Yarn",
  analysis:"Analysis", market:"Market", export:"Export",
};

export default function Tab({ id, label, active, onClick, badge }) {
  const { isMobile } = useBreakpoint();
  const accent = TAB_ACCENT[id] || T.gold;
  const faint  = TAB_ACCENT_FAINT[id] || T.goldFaint;
  const text   = isMobile ? (SHORT[id] || label) : label;

  return (
    <button
      className="tab-item"
      onClick={() => onClick(id)}
      style={{
        padding: isMobile ? "0 10px" : "0 16px",
        height: isMobile ? 34 : 44,
        border: "none",
        background: active ? faint : "transparent",
        color: active ? accent : T.textDim,
        fontFamily: "var(--font-mono)",
        fontSize: isMobile ? 10 : 11,
        fontWeight: active ? 700 : 400,
        letterSpacing: active ? "0.8px" : "0.3px",
        borderBottom: `2px solid ${active ? accent : "transparent"}`,
        borderTop: "2px solid transparent",
        cursor: "pointer",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!active) { e.currentTarget.style.color = accent; e.currentTarget.style.background = faint; }
      }}
      onMouseLeave={(e) => {
        if (!active) { e.currentTarget.style.color = T.textDim; e.currentTarget.style.background = "transparent"; }
      }}
    >
      {text}
      {badge ? (
        <span style={{
          background: accent, color: "#fff",
          borderRadius: 8, padding: "1px 5px",
          fontSize: 9, fontWeight: 700, lineHeight: "14px",
        }}>{badge > 99 ? "99+" : badge}</span>
      ) : null}
    </button>
  );
}
