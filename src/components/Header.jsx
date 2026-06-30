import { useState } from "react";
import { T, inp, sel } from "../styles/theme.js";
import { SURAT_FABRICS, SURAT_MARKETS, ZARI_TYPES } from "../data/suratFabrics.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

export default function Header({ designName, setDesignName, fabricType, setFabricType, zariType, setZariType, targetMarket, setTargetMarket }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      background: `linear-gradient(180deg, #120e1e 0%, ${T.surf} 100%)`,
      borderBottom: `1px solid ${T.border}`,
      position: "sticky", top: 0, zIndex: 100,
      boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
    }}>

      {/* ── Row 1: Brand bar ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: `0 ${isMobile ? 14 : 28}px`,
        height: isMobile ? 48 : 56,
        borderBottom: `1px solid ${T.border}`,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
          <div style={{
            width: isMobile ? 34 : 40, height: isMobile ? 34 : 40,
            borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.gold} 0%, ${T.crimson} 40%, ${T.indigo} 80%, ${T.teal} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? 18 : 22,
            boxShadow: `0 0 24px ${T.goldGlow}, 0 4px 12px rgba(0,0,0,0.5)`,
          }}>🧵</div>
          <div>
            <div style={{
              background: `linear-gradient(90deg, ${T.gold} 0%, ${T.crimson} 50%, ${T.indigo} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              fontFamily: "var(--font-serif)",
              fontSize: isMobile ? 13 : isTablet ? 15 : 18,
              fontWeight: 700, letterSpacing: isMobile ? "1px" : "3px", lineHeight: 1,
            }}>
              {isMobile ? "SURAT TEXTILE" : "SURAT TEXTILE STUDIO"}
            </div>
            {!isMobile && (
              <div style={{ color: T.textDim, fontSize: 9, letterSpacing: "3px", marginTop: 4 }}>
                AI-POWERED · JC5 · EP · JACQUARD · DOBBY
              </div>
            )}
          </div>
        </div>

        {/* Right: chips + mobile menu toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderRight: `1px solid ${T.border}`, paddingRight: 14 }}>
              {!isTablet && (
                <>
                  <Chip label="JC5"  color={T.teal}    />
                  <Chip label="EP"   color={T.violet}   />
                  <Chip label="WIF"  color={T.crimson}  />
                </>
              )}
              <Chip label="AI"   color={T.gold} active />
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.emerald, boxShadow: `0 0 8px ${T.emeraldGlow}` }} />
            {!isMobile && <span style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px" }}>LIVE</span>}
          </div>
          {/* Mobile menu toggle */}
          {isMobile && (
            <button onClick={() => setMenuOpen((o) => !o)} style={{
              background: menuOpen ? T.indigoFaint : "transparent",
              border: `1px solid ${menuOpen ? T.indigo : T.border}`,
              borderRadius: 7, padding: "6px 10px", color: T.textDim, fontSize: 16,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {/* ── Row 2: Design context (desktop/tablet: inline; mobile: collapsible) ── */}
      {(!isMobile || menuOpen) && (
        <div className="header-context" style={{
          ...(isMobile ? {
            flexDirection: "column", alignItems: "stretch", height: "auto",
            padding: "10px 14px", gap: 8,
            borderBottom: `1px solid ${T.border}`,
          } : {}),
        }}>
          {!isMobile && <span style={{ color: T.textDim, fontSize: 10, letterSpacing: "2px", flexShrink: 0 }}>DESIGN</span>}

          <input
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            style={{
              ...inp,
              width: isMobile ? "100%" : 180,
              height: isMobile ? 40 : 30,
              padding: "0 12px", borderRadius: 6, fontSize: 12,
              borderColor: T.goldDim,
            }}
            placeholder="Design name..."
          />

          {!isMobile && <div style={{ width: 1, height: 20, background: T.border, flexShrink: 0 }} />}

          <FieldGroup label="FABRIC" color={T.teal} isMobile={isMobile}>
            <select value={fabricType} onChange={(e) => setFabricType(e.target.value)}
              style={{ ...sel, width: isMobile ? "100%" : 138, height: isMobile ? 40 : 30, padding: isMobile ? "0 28px 0 12px" : "0 28px 0 10px", borderRadius: 6, fontSize: 11 }}>
              {Object.keys(SURAT_FABRICS).map((f) => <option key={f}>{f}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label="ZARI" color={T.gold} isMobile={isMobile}>
            <select value={zariType} onChange={(e) => setZariType(e.target.value)}
              style={{ ...sel, width: isMobile ? "100%" : 158, height: isMobile ? 40 : 30, padding: isMobile ? "0 28px 0 12px" : "0 28px 0 10px", borderRadius: 6, fontSize: 11 }}>
              {ZARI_TYPES.map((z) => <option key={z}>{z}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label="MARKET" color={T.emerald} isMobile={isMobile}>
            <select value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)}
              style={{ ...sel, width: isMobile ? "100%" : 200, height: isMobile ? 40 : 30, padding: isMobile ? "0 28px 0 12px" : "0 28px 0 10px", borderRadius: 6, fontSize: 11 }}>
              {SURAT_MARKETS.map((m) => <option key={m.name}>{m.name}</option>)}
            </select>
          </FieldGroup>
        </div>
      )}

      {/* Rainbow accent */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${T.violet} 0%, ${T.teal} 18%, ${T.crimson} 36%, ${T.gold} 54%, ${T.emerald} 72%, ${T.indigo} 90%, ${T.violet} 100%)`,
        opacity: 0.7,
      }} />
    </header>
  );
}

function Chip({ label, color, active }) {
  return (
    <span style={{
      fontSize: 9, letterSpacing: "1px",
      color: active ? color : T.muted, fontWeight: active ? 700 : 400,
      border: `1px solid ${active ? color + "88" : T.border}`,
      borderRadius: 4, padding: "2px 7px",
      background: active ? color + "18" : "transparent",
      boxShadow: active ? `0 0 8px ${color}40` : "none",
    }}>{label}</span>
  );
}

function FieldGroup({ label, color = T.textDim, children, isMobile }) {
  return (
    <div style={{ display: "flex", alignItems: isMobile ? "stretch" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 4 : 7, width: isMobile ? "100%" : "auto" }}>
      <span style={{ color, fontSize: isMobile ? 9 : 10, letterSpacing: "1.5px", fontWeight: 600 }}>{label}</span>
      {children}
    </div>
  );
}
