import { T } from "../styles/theme.js";

export default function StatBox({ label, value, sub, accent }) {
  const color = accent || T.gold;
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${T.panel} 0%, ${color}0a 100%)`,
        border: `1px solid ${color}44`,
        borderRadius: 14,
        padding: "20px 22px 18px",
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 4px 28px rgba(0,0,0,0.55), 0 0 0 1px ${color}18, inset 0 1px 0 rgba(255,255,255,0.04)`,
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color + "88";
        e.currentTarget.style.boxShadow = `0 4px 28px rgba(0,0,0,0.55), 0 0 0 2px ${color}44, 0 0 24px ${color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = color + "44";
        e.currentTarget.style.boxShadow = `0 4px 28px rgba(0,0,0,0.55), 0 0 0 1px ${color}18, inset 0 1px 0 rgba(255,255,255,0.04)`;
      }}
    >
      {/* Colored top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }} />

      {/* Subtle corner glow */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ color: T.textDim, fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ color, fontSize: 30, fontWeight: 700, fontFamily: "var(--font-mono)", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ color: T.textDim, fontSize: 10, marginTop: 8, lineHeight: 1 }}>{sub}</div>}
    </div>
  );
}
