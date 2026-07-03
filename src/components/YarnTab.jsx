import { useState } from "react";
import { T, inp, card, h2s, lbl } from "../styles/theme.js";
import StatBox from "./StatBox.jsx";
import { NED_LOOMS } from "../data/nedLooms.js";
import { validateLoom } from "../utils/loomValidator.js";
import { NED_YARNS, NED_MATERIALS } from "../data/nedYarns.js";
// Accent color constants inline (avoiding circular dep)
const EMERALD = "#34c97a";
const GOLD    = "#e4a832";
const TEAL    = "#1fc8c0";
const VIOLET  = "#bf6ff5";

// Surat yarn library — standard types with approximate Pantone references
const YARN_LIBRARY = [
  { name: "Real Silk",          denier: 20,  price: 4200, pantone: "13-0858",  type: "filament" },
  { name: "Art Silk (Viscose)", denier: 75,  price:  180, pantone: "14-4102",  type: "filament" },
  { name: "Polyester Bright",   denier: 75,  price:  120, pantone: "neutral",   type: "filament" },
  { name: "Polyester Dull",     denier: 100, price:   90, pantone: "neutral",   type: "filament" },
  { name: "Tested Zari",        denier: 150, price:  620, pantone: "13-0858",  type: "metallic" },
  { name: "Banaras Real Zari",  denier: 120, price: 3200, pantone: "12-0752",  type: "metallic" },
  { name: "Silver Zari",        denier: 120, price:  820, pantone: "12-0712",  type: "metallic" },
  { name: "Spun Polyester",     denier: 150, price:   60, pantone: "neutral",   type: "spun"     },
  { name: "Cotton",             denier: 200, price:   75, pantone: "neutral",   type: "spun"     },
  { name: "Nylon",              denier: 70,  price:  200, pantone: "neutral",   type: "filament" },
  { name: "Lurex (Metallic)",   denier: 100, price:  380, pantone: "12-0752",  type: "metallic" },
  { name: "Chenille",           denier: 400, price:  320, pantone: "neutral",   type: "spun"     },
];

function WarpBeamCalc({ epi, ppi }) {
  const [fabricWidthCm, setFabricWidthCm] = useState(110);
  const [fabricLengthM, setFabricLengthM] = useState(100);
  const [weavingLossPercent, setWeavingLossPercent] = useState(12);
  const [selectedYarn, setSelectedYarn] = useState(YARN_LIBRARY[0]);
  const [loom, setLoom] = useState(NED_LOOMS[0]);

  const widthIn = fabricWidthCm / 2.54;
  const totalEnds = Math.round(epi * widthIn);
  const loomCheck = validateLoom(loom, epi, fabricWidthCm);
  const loomWasteM = 2.5;
  const totalLengthM = fabricLengthM * (1 + weavingLossPercent / 100) + loomWasteM;
  const yarnPerEndM = totalLengthM;
  const totalYarnM = totalEnds * yarnPerEndM;
  const totalYarnKm = (totalYarnM / 1000).toFixed(2);
  const metricCount = 1000000 / selectedYarn.denier;
  const totalWeightKg = (totalYarnM / (metricCount * 1000)).toFixed(3);
  const costEstimate = (totalWeightKg * selectedYarn.price).toFixed(0);

  return (
    <div style={card}>
      <div style={h2s}>Warp Beam Calculator</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={lbl}>Fabric Width (cm)</label>
          <input type="number" value={fabricWidthCm} onChange={(e) => setFabricWidthCm(+e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Order Length (m)</label>
          <input type="number" value={fabricLengthM} onChange={(e) => setFabricLengthM(+e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Weaving Loss %</label>
          <input type="number" value={weavingLossPercent} onChange={(e) => setWeavingLossPercent(+e.target.value)} style={inp} />
        </div>
        <div>
          <label style={lbl}>Yarn Type</label>
          <select value={selectedYarn.name} onChange={(e) => setSelectedYarn(YARN_LIBRARY.find((y) => y.name === e.target.value) || YARN_LIBRARY[0])}
            style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: "var(--font-mono)", fontSize: 11, padding: "9px 12px", width: "100%", outline: "none", boxSizing: "border-box" }}>
            {YARN_LIBRARY.map((y) => <option key={y.name}>{y.name}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Denier</label>
          <div style={{ ...inp, color: T.gold, fontWeight: 700, display: "flex", alignItems: "center" }}>
            {selectedYarn.denier}D
          </div>
        </div>
        <div>
          <label style={lbl}>Price/kg (₹)</label>
          <div style={{ ...inp, color: T.gold, fontWeight: 700, display: "flex", alignItems: "center" }}>
            ₹{selectedYarn.price}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          ["Total Ends", totalEnds, `${epi} EPI × ${widthIn.toFixed(1)}"`, T.gold],
          ["Total Warp Length", `${totalLengthM.toFixed(1)} m`, `${fabricLengthM}m + ${weavingLossPercent}% loss + loom waste`, T.text],
          ["Total Yarn", `${totalYarnKm} km`, `${(totalYarnM / 1000).toFixed(1)} km warp`, T.text],
          ["Warp Weight", `${totalWeightKg} kg`, selectedYarn.name, T.text],
          ["Warp Cost", `₹${costEstimate}`, `@ ₹${selectedYarn.price}/kg`, T.gold],
          ["Cost / Meter", `₹${(costEstimate / fabricLengthM).toFixed(1)}`, "warp yarn only", T.textDim],
          ["Metric Count", metricCount.toFixed(0), `Nm (${selectedYarn.denier}D)`, T.textDim],
          ["EPI", epi, "ends per inch", T.textDim],
        ].map(([label, value, sub, col]) => (
          <div key={label} style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ color: T.textDim, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
            <div style={{ color: col, fontWeight: 700, fontSize: 16, fontFamily: "var(--font-mono)" }}>{value}</div>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ color: T.muted, fontSize: 10, marginTop: 12, lineHeight: 1.8 }}>
        Formula: Total ends = EPI × width(in) · Total length = order × (1 + loss%) + 2.5m loom waste · Weight = (total yarn m) / (Nm × 1000)
      </div>

      {/* Loom hook-capacity check (NedGraphics machine-conversion library) */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={h2s}>Loom Capacity Check</div>
          <select value={loom.id} onChange={(e) => setLoom(NED_LOOMS.find((l) => l.id === e.target.value) || NED_LOOMS[0])}
            style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: "var(--font-mono)", fontSize: 11, padding: "9px 12px", outline: "none" }}>
            {NED_LOOMS.map((l) => <option key={l.id} value={l.id}>{l.name} — {l.hooks.toLocaleString()} hooks</option>)}
          </select>
        </div>
        <div style={{
          borderRadius: 10, padding: "12px 16px",
          border: `1px solid ${loomCheck.fits ? "rgba(52,201,122,0.4)" : "rgba(230,90,90,0.5)"}`,
          background: loomCheck.fits ? "rgba(52,201,122,0.08)" : "rgba(230,90,90,0.08)",
        }}>
          <div style={{ color: loomCheck.fits ? "#34c97a" : "#e65a5a", fontSize: 12, fontWeight: 700 }}>
            {loomCheck.fits ? "✓ Fits" : "✗ Over capacity"}
          </div>
          <div style={{ color: T.textDim, fontSize: 11, marginTop: 5, lineHeight: 1.6 }}>{loomCheck.message}</div>
          <div style={{ width: "100%", height: 5, background: T.surf, borderRadius: 3, marginTop: 8 }}>
            <div style={{ width: `${loomCheck.usedPct}%`, height: "100%", borderRadius: 3, background: loomCheck.fits ? "#34c97a" : "#e65a5a" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YarnTab({ costEstimate, palette, fabricType, zariType, gsm, epi, ppi, denier, fab, designNotes, setDesignNotes }) {
  const [activeSection, setActiveSection] = useState("consumption");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={h2s}>Yarn & Cost</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            {costEstimate ? `₹${costEstimate.perMeter} / meter` : "Extract colors to estimate cost"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["consumption", "warp-beam", "yarn-library"].map((s) => (
            <button key={s} onClick={() => setActiveSection(s)}
              style={{
                padding: "8px 16px", borderRadius: 8, border: `1px solid ${activeSection === s ? T.goldDim : T.border}`,
                background: activeSection === s ? T.goldFaint : "transparent",
                color: activeSection === s ? T.gold : T.textDim,
                cursor: "pointer", fontSize: 11, fontFamily: "var(--font-mono)",
                fontWeight: activeSection === s ? 700 : 400,
              }}>
              {s === "consumption" ? "Consumption" : s === "warp-beam" ? "Warp Beam" : "Yarn Library"}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "consumption" && (
        <>
          {!costEstimate ? (
            <div style={{ ...card, textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🧵</div>
              <div style={{ color: T.textDim }}>Extract colors from an image first.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                <StatBox label="Est. Cost / Meter" value={`₹${costEstimate.perMeter}`} sub={`${fabricType} + ${zariType}`} accent={EMERALD} />
                <StatBox label="Fabric GSM"         value={gsm}                         sub="grams per sq meter"             accent={TEAL} />
                <StatBox label="EPI × PPI"          value={`${epi}×${ppi}`}             sub="ends & picks per inch"          accent={GOLD} />
                <StatBox label="Denier"             value={denier}                      sub={fab.yarn}                       accent={VIOLET} />
              </div>

              <div style={{ ...card, marginBottom: 16 }}>
                <div style={h2s}>Yarn Consumption</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {["#", "Color", "Yarn Name", "Area %", "g/m²", "Cost/m (₹)", "Yarn Type", "Zone"].map((h) => (
                          <th key={h} style={{ color: T.textDim, textAlign: "left", padding: "10px 12px", fontWeight: 400, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {palette.map((c, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{i + 1}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ width: 26, height: 26, background: c.hex, borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }} />
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12 }}>{c.yarnName || `Yarn ${i + 1}`}</td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 60, height: 4, background: T.surf, borderRadius: 2 }}>
                                <div style={{ width: `${Math.min(c.percentage, 100)}%`, height: "100%", background: c.hex, borderRadius: 2, opacity: 0.9 }} />
                              </div>
                              <span style={{ fontSize: 12 }}>{c.percentage?.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px", color: T.gold, fontWeight: 600, fontSize: 12 }}>{(c.percentage * 0.85).toFixed(1)}</td>
                          <td style={{ padding: "10px 12px", fontSize: 12 }}>₹{((c.percentage / 100) * costEstimate.perMeter).toFixed(1)}</td>
                          <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{fab.yarn}</td>
                          <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{c.weaveType || "plain"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={card}>
                <div style={h2s}>Design Notes</div>
                <textarea
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  style={{ ...inp, height: 100, resize: "vertical", lineHeight: 1.8, fontSize: 13 }}
                  placeholder="Buyer name · order qty · finishing notes · delivery deadline · special instructions..."
                />
              </div>
            </>
          )}
        </>
      )}

      {activeSection === "warp-beam" && <WarpBeamCalc epi={epi} ppi={ppi} />}

      {activeSection === "yarn-library" && (
        <div style={card}>
          <div style={h2s}>Surat Yarn Library</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Yarn Type", "Denier", "Type", "Approx. Price/kg (₹)", "Pantone Ref", "Common Use"].map((h) => (
                    <th key={h} style={{ color: T.textDim, textAlign: "left", padding: "10px 12px", fontWeight: 400, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {YARN_LIBRARY.map((y) => (
                  <tr key={y.name} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "10px 12px", color: T.text, fontSize: 12, fontWeight: 600 }}>{y.name}</td>
                    <td style={{ padding: "10px 12px", color: T.gold, fontSize: 12 }}>{y.denier}D</td>
                    <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{y.type}</td>
                    <td style={{ padding: "10px 12px", color: T.gold, fontSize: 12, fontWeight: 600 }}>₹{y.price.toLocaleString()}</td>
                    <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>PMS {y.pantone}</td>
                    <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>
                      {y.type === "metallic" ? "Zari / border / pallu" : y.type === "filament" ? "Ground / body" : "Ground / texture"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ color: T.muted, fontSize: 10, marginTop: 12, lineHeight: 1.8 }}>
            Prices are approximate Surat market rates (2024). Actual prices vary by supplier, quality grade, and order quantity.
          </div>

          {/* Real NedGraphics yarn records (Jacquard 16 yarn database) */}
          <div style={{ ...card, marginTop: 16 }}>
            <div style={h2s}>NedGraphics Yarn Database</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["Yarn", "Material", "Plies", "Twist (t/10cm)", "Sense", "Count", "Space Dye"].map((h) => (
                      <th key={h} style={{ color: T.textDim, textAlign: "left", padding: "10px 12px", fontWeight: 400, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NED_YARNS.map((y) => (
                    <tr key={y.name} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "10px 12px", color: T.text, fontSize: 12, fontWeight: 600 }}>{y.name}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{y.material}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{y.plies}</td>
                      <td style={{ padding: "10px 12px", color: T.gold, fontSize: 12 }}>{y.twist}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{y.twistSense}-twist</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{y.count.toLocaleString()}</td>
                      <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{y.spaceDye}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 12, lineHeight: 1.8 }}>
              Fields (twist sense S/Z, plies, count, space-dye) match the NedGraphics Jacquard 16 yarn record schema.
            </div>
          </div>

          {/* Material optical/physical constants (drives realistic simulation) */}
          <div style={{ ...card, marginTop: 16 }}>
            <div style={h2s}>Material Reflectance & Body</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["Material", "Sheen (spec.)", "Body (diffuse)", "Woven size", "Loose size", "Twisted", "Heat-set"].map((h) => (
                      <th key={h} style={{ color: T.textDim, textAlign: "left", padding: "10px 12px", fontWeight: 400, fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NED_MATERIALS.map((m) => (
                    <tr key={m.name} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "10px 12px", color: T.text, fontSize: 12, fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: "10px 12px", color: T.gold, fontSize: 12 }}>{m.specular}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 12 }}>{m.diffuse}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{m.sizeCompressed}</td>
                      <td style={{ padding: "10px 12px", color: T.textDim, fontSize: 11 }}>{m.sizeUncompressed}</td>
                      <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{m.twisted ? "yes" : "no"}</td>
                      <td style={{ padding: "10px 12px", color: T.muted, fontSize: 11 }}>{m.heatSet ? "yes" : "no"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 12, lineHeight: 1.8 }}>
              From NedGraphics Materials.xml — specular sheen, diffuse body, and compression factors used by the fabric simulator.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
