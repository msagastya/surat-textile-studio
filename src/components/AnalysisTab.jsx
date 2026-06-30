import { T, btn, card, accentCard, h2c } from "../styles/theme.js";
import { buildLocalAnalysis } from "../utils/localAnalysis.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

const qColor = (q) => q >= 85 ? "#34c97a" : q >= 70 ? "#e4a832" : q >= 55 ? "#1fc8c0" : "#e03e5c";

function Row({ label, value, accent = T.textDim }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", padding:"7px 0", borderBottom:`1px solid ${T.border}` }}>
      <span style={{ color:T.muted, fontSize:10, letterSpacing:"1px", textTransform:"uppercase" }}>{label}</span>
      <span style={{ color:accent, fontSize:12, fontWeight:600, textAlign:"right", maxWidth:"55%" }}>{value || "—"}</span>
    </div>
  );
}

function SecHead({ color, title }) {
  return <div style={{ ...h2c(color), marginBottom:14 }}>{title}</div>;
}

function PulseLoader({ colors }) {
  return (
    <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
      {colors.map((c, i) => (
        <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c, boxShadow:`0 0 8px ${c}`,
          animation:`ds-pulse 1.3s ${i*0.18}s ease-in-out infinite` }} />
      ))}
      <style>{`@keyframes ds-pulse{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}`}</style>
    </div>
  );
}

function StatChip({ label, value, accent }) {
  return (
    <div style={{ background:T.surf, border:`1px solid ${accent}44`, borderRadius:10, padding:"10px 12px",
      boxShadow:`0 0 12px ${accent}18`, gridColumn:"span 1" }}>
      <div style={{ color:T.muted, fontSize:9, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      <div style={{ color:accent, fontSize:15, fontWeight:700 }}>{value}</div>
    </div>
  );
}

export default function AnalysisTab({
  geminiData, geminiLoading, scanImage,
  image, fabricType, zariType, palette,
  epi, ppi, gsm, repeatW, repeatH, targetMarket, colorCount,
}) {
  const { isMobile, isTablet } = useBreakpoint();
  const local = (geminiData || palette.length > 0)
    ? buildLocalAnalysis({ fabricType, zariType, palette, epi, ppi, gsm, repeatW, repeatH, geminiData, targetMarket, colorCount })
    : null;

  // ── No image loaded ──────────────────────────────────────────────────────────
  if (!image) return (
    <div style={{ ...accentCard("#6b7ff5"), textAlign:"center", padding:80 }}>
      <div style={{ fontSize:64, marginBottom:20, opacity:.2 }}>🔬</div>
      <div style={{ color:T.textDim, fontSize:16, fontFamily:"var(--font-serif)" }}>No fabric loaded</div>
      <div style={{ color:T.muted, fontSize:12, marginTop:8 }}>Upload a fabric image in the Import tab to begin analysis.</div>
    </div>
  );

  return (
    <div className="grid-2col">

      {/* ── GEMINI VISION CARD ────────────────────────────────────────────── */}
      <div style={{ ...accentCard("#6b7ff5") }}>
        <SecHead color="#6b7ff5" title="Gemini Vision Scan" />

        {geminiLoading && (
          <div style={{ textAlign:"center", padding:48 }}>
            <PulseLoader colors={["#6b7ff5","#bf6ff5","#1fc8c0","#e4a832","#e03e5c"]} />
            <div style={{ color:T.textDim, fontSize:11, marginTop:16, lineHeight:2 }}>
              Identifying fabric · Detecting pattern · Reading zari · Scoring quality...
            </div>
          </div>
        )}

        {!geminiLoading && !geminiData && (
          <div style={{ textAlign:"center", padding:28 }}>
            <div style={{ fontSize:40, marginBottom:14, opacity:.4 }}>👁️</div>
            <div style={{ color:T.textDim, fontSize:12, lineHeight:1.9, marginBottom:18 }}>
              Gemini Vision reads the fabric image and detects<br />
              fabric type, pattern, zari, texture, colors, and quality score.
            </div>
            <button onClick={scanImage} style={{ ...btn("indigo"), width:"100%", height:42 }}>
              Scan Image with Gemini
            </button>
          </div>
        )}

        {!geminiLoading && geminiData && (
          <>
            {/* Quality + confidence header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{
                background:qColor(geminiData.qualityScore)+"22",
                border:`1px solid ${qColor(geminiData.qualityScore)}66`,
                borderRadius:20, padding:"4px 14px",
                color:qColor(geminiData.qualityScore), fontSize:12, fontWeight:700,
              }}>
                Quality {geminiData.qualityScore}/100
              </div>
              <div style={{ color:T.muted, fontSize:10 }}>
                {Math.round(geminiData.confidence*100)}% confidence
              </div>
            </div>

            <Row label="Fabric Type"    value={geminiData.fabricType}    accent={T.gold}    />
            <Row label="Weave Type"     value={geminiData.weaveType}     accent={T.indigo}  />
            <Row label="Pattern"        value={geminiData.pattern}       accent={T.violet}  />
            <Row label="Texture"        value={geminiData.texture}       accent={T.teal}    />
            <Row label="Zari"           value={geminiData.zariType}      accent={T.gold}    />
            <Row label="Finish"         value={geminiData.finish}        accent={T.textDim} />
            <Row label="Market Tier"    value={geminiData.marketTier}    accent={T.emerald} />
            <Row label="Best Use"       value={geminiData.suggestedUse}  accent={T.textDim} />
            <Row label="Color Count"    value={`${geminiData.suggestedColorCount} yarns recommended`} accent={T.violet} />

            {/* Detected color bar */}
            {geminiData.dominantColors?.length > 0 && (
              <div style={{ marginTop:14 }}>
                <div style={{ color:T.muted, fontSize:9, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:7 }}>
                  Detected Colors
                </div>
                <div style={{ display:"flex", height:18, borderRadius:6, overflow:"hidden", marginBottom:8,
                  boxShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>
                  {geminiData.dominantColors.map((c, i) => (
                    <div key={i} style={{ flex:c.pct||1, background:c.hex }} title={`${c.name} (${c.pct}%)`} />
                  ))}
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {geminiData.dominantColors.map((c, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:c.hex, border:`1px solid ${T.border}` }} />
                      <span style={{ color:T.textDim, fontSize:9 }}>{c.name} ({c.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expert notes */}
            {geminiData.notes && (
              <div style={{ marginTop:14, background:T.raise, borderRadius:8, padding:"10px 12px",
                borderLeft:`2px solid #6b7ff5`, fontSize:10, color:T.textDim, lineHeight:1.9 }}>
                <span style={{ color:"#6b7ff5", fontWeight:700 }}>Expert Note · </span>
                {geminiData.notes}
              </div>
            )}

            <button onClick={scanImage} style={{ ...btn("ghost"), width:"100%", marginTop:14, height:30, fontSize:10 }}>
              Re-scan Image
            </button>
          </>
        )}
      </div>

      {/* ── RIGHT COLUMN: LOCAL ANALYSIS ────────────────────────────────────── */}
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        {/* Market Pricing */}
        {local ? (
          <div style={accentCard("#34c97a")}>
            <SecHead color="#34c97a" title="Surat Market Pricing" />
            <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10, marginBottom:14 }}>
              <StatChip label="Wholesale Min" value={`₹${local.priceMin.toLocaleString("en-IN")}/m`} accent="#34c97a" />
              <StatChip label="Wholesale Max" value={`₹${local.priceMax.toLocaleString("en-IN")}/m`} accent="#e4a832" />
            </div>
            <Row label="Segment"        value={local.tier}       accent={T.gold}    />
            <Row label="Gross Margin"   value={`~${local.margin}%`} accent={local.margin > 40 ? "#34c97a" : "#e4a832"} />
            {local.markets.map((m, i) => (
              <Row key={i} label={i===0?"Primary Market":"Also In"} value={m} accent={i===0?T.emerald:T.textDim} />
            ))}
          </div>
        ) : (
          <div style={{ ...card, textAlign:"center", padding:32 }}>
            <div style={{ color:T.muted, fontSize:12 }}>Scan image or extract colors to see market pricing</div>
          </div>
        )}

        {/* Catalog */}
        {local && (
          <div style={accentCard("#bf6ff5")}>
            <SecHead color="#bf6ff5" title="Catalog Fit" />
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
              {local.catalog.map((s) => (
                <span key={s} style={{ background:T.violetFaint, border:`1px solid ${T.violetDim}`,
                  borderRadius:16, padding:"5px 14px", color:T.violet, fontSize:10, fontWeight:600 }}>{s}</span>
              ))}
            </div>
            <Row label="Design Rating"  value={`${local.rating} / 10`} accent={qColor(local.rating*10)} />
            <Row label="Repeat Pattern" value={local.repeatSummary}    accent={T.textDim} />
            <Row label="Colors"         value={local.colorsSummary}    accent={T.violet}  />
          </div>
        )}
      </div>

      {/* ── COST BREAKDOWN ──────────────────────────────────────────────────── */}
      {local && (
        <div style={accentCard("#e4a832")}>
          <SecHead color="#e4a832" title="Manufacturing Cost (per meter)" />
          <Row label="Yarn / Raw Material" value={`₹${local.yarnCost}`}   accent={T.gold}    />
          <Row label="Weaving Charge"      value={`₹${local.weaveCost}`}  accent={T.textDim} />
          <Row label="Zari Work"           value={`₹${local.zariCost}`}   accent={T.gold}    />
          <Row label="Finishing & Process" value={`₹${local.finCost}`}    accent={T.textDim} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:12, padding:"10px 0",
            borderTop:`1px solid ${T.goldLine}` }}>
            <span style={{ color:T.gold, fontWeight:700, fontSize:12 }}>Total Manufacturing Cost</span>
            <span style={{ color:T.gold, fontWeight:700, fontSize:17 }}>₹{local.totalCost}/m</span>
          </div>
          <div style={{ color:T.muted, fontSize:10, marginTop:6 }}>
            Wholesale margin ≈ {local.margin}% · Retail 2–3× wholesale
          </div>
        </div>
      )}

      {/* ── YARN & LOOM ─────────────────────────────────────────────────────── */}
      {local && (
        <div style={accentCard("#1fc8c0")}>
          <SecHead color="#1fc8c0" title="Yarn & Loom Specifications" />

          <div style={{ color:T.muted, fontSize:9, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:8 }}>
            Yarn Plan
          </div>
          <Row label="Warp Yarn"     value={local.yarn.warp}     accent={T.teal}    />
          <Row label="Weft Yarn"     value={local.yarn.weft}     accent={T.teal}    />
          <Row label="Yarn Type"     value={local.yarn.type}     accent={T.textDim} />

          <div style={{ color:T.muted, fontSize:9, letterSpacing:"1.5px", textTransform:"uppercase", margin:"14px 0 8px" }}>
            Loom Setup
          </div>
          <Row label="Loom Type"     value={local.loom.loom}     accent={T.gold}    />
          <Row label="Hooks / Shafts" value={local.loom.hooks !== "—" ? local.loom.hooks : local.loom.shafts} accent={T.textDim} />
          <Row label="RPM Range"     value={local.loom.rpm}      accent={T.textDim} />

          <div style={{ color:T.muted, fontSize:9, letterSpacing:"1.5px", textTransform:"uppercase", margin:"14px 0 8px" }}>
            Technical Specs
          </div>
          <Row label="EPI" value={epi} accent={T.teal}    />
          <Row label="PPI" value={ppi} accent={T.teal}    />
          <Row label="GSM" value={gsm} accent={T.textDim} />
        </div>
      )}
    </div>
  );
}
