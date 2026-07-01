import { T, card, h2s } from "../styles/theme.js";
import { SURAT_MARKETS, SURAT_FABRICS } from "../data/suratFabrics.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

export default function MarketTab({ targetMarket, setTargetMarket }) {
  const { isMobile } = useBreakpoint();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={h2s}>Market Intelligence</div>
        <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
          Surat Textile Markets
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 32 }}>
        {SURAT_MARKETS.map((m) => {
          const active = m.name === targetMarket;
          return (
            <div
              key={m.name}
              onClick={() => setTargetMarket(m.name)}
              style={{
                ...card,
                cursor: "pointer",
                borderColor: active ? T.goldDim : T.border,
                background: active ? T.goldFaint : T.panel,
                boxShadow: active
                  ? `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${T.goldDim}`
                  : "0 4px 24px rgba(0,0,0,0.5)",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = T.borderBr; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = T.border; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ color: active ? T.gold : T.text, fontWeight: 700, fontSize: 14 }}>{m.name}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ background: T.surf, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 10, padding: "2px 9px", fontSize: 9, letterSpacing: 1 }}>{m.zone}</span>
                  {active && <span style={{ color: T.greenBr, fontSize: 12 }}>✓</span>}
                </div>
              </div>
              <div style={{ color: T.textDim, fontSize: 12, lineHeight: 1.7 }}>{m.specialty}</div>
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={h2s}>Fabric Specifications</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 14 }}>
        {Object.entries(SURAT_FABRICS).map(([name, info]) => (
          <div key={name} style={card}>
            <div style={{ color: T.gold, fontWeight: 700, fontSize: 13, marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
              {name}
            </div>
            <div style={{ fontSize: 11, lineHeight: 2 }}>
              {[["Denier", info.denier], ["EPI/PPI", `${info.EPI}/${info.PPI}`], ["GSM", info.GSM], ["Yarn", info.yarn], ["Use", info.use]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: T.muted }}>{k}</span>
                  <span style={{ color: T.text }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", marginTop: 2 }}>
                <span style={{ color: T.muted }}>Markets</span>
                <span style={{ color: T.gold, textAlign: "right", maxWidth: 140, fontSize: 10 }}>{info.markets.join(", ")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
