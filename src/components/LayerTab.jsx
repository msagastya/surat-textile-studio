import { useState } from "react";
import { T, btn, card, h2s, inp, lbl } from "../styles/theme.js";

const LAYER_DEFS = [
  { id: "ground",  name: "Ground (Tana)",   desc: "Base fabric structure — the foundation weave",          color: "#3a6b46" },
  { id: "body",    name: "Body (Bana)",      desc: "Main pattern layer — zari, buta, or motif fill",       color: "#c8a84b" },
  { id: "border",  name: "Border (Kinari)",  desc: "Selvedge border — width 3–12 cm typical in Surat",    color: "#7a6530" },
  { id: "pallu",   name: "Pallu / Anchal",   desc: "End panel — heavily embellished, sets the design tone", color: "#b04a4a" },
];

const WEAVE_OPTIONS = ["plain", "twill", "satin", "jacquard", "dobby", "velvet", "brocade", "lampas"];

function LayerCard({ layer, config, onUpdate, active, onToggleActive }) {
  const bg = active ? "rgba(" + hexToRgbStr(layer.color) + ",0.08)" : T.panel;
  const bc = active ? layer.color : T.border;

  return (
    <div style={{
      ...card,
      borderColor: bc,
      background: bg,
      marginBottom: 14,
      transition: "all 0.18s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: active ? layer.color : T.border, flexShrink: 0 }} />
          <div>
            <div style={{ color: active ? layer.color : T.text, fontWeight: 700, fontSize: 13 }}>{layer.name}</div>
            <div style={{ color: T.muted, fontSize: 10, marginTop: 2 }}>{layer.desc}</div>
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <span style={{ color: T.muted, fontSize: 10 }}>{active ? "ON" : "OFF"}</span>
          <div
            onClick={onToggleActive}
            style={{
              width: 38, height: 20, borderRadius: 10,
              background: active ? layer.color : T.border,
              cursor: "pointer", position: "relative",
              transition: "background 0.2s",
            }}
          >
            <div style={{
              width: 14, height: 14, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 3,
              left: active ? 21 : 3,
              transition: "left 0.2s",
            }} />
          </div>
        </label>
      </div>

      {active && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          <div>
            <label style={lbl}>Weave Structure</label>
            <select value={config.weave} onChange={(e) => onUpdate({ weave: e.target.value })}
              style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: "var(--font-mono)", fontSize: 11, padding: "8px 10px", width: "100%", outline: "none" }}>
              {WEAVE_OPTIONS.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Thread Count (EPI)</label>
            <input type="number" value={config.epi} onChange={(e) => onUpdate({ epi: +e.target.value })}
              style={{ ...inp }} />
          </div>
          <div>
            <label style={lbl}>Width (cm)</label>
            <input type="number" value={config.width} onChange={(e) => onUpdate({ width: +e.target.value })}
              style={{ ...inp }} />
          </div>
          <div>
            <label style={lbl}>Zari Type</label>
            <select value={config.zari} onChange={(e) => onUpdate({ zari: e.target.value })}
              style={{ background: T.surf, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontFamily: "var(--font-mono)", fontSize: 11, padding: "8px 10px", width: "100%", outline: "none" }}>
              {["None", "Tested Zari", "Banaras Zari", "Real Gold", "Silver", "Cut Zari"].map((z) => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Notes</label>
            <input value={config.notes} onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Design notes for this layer..."
              style={{ ...inp }} />
          </div>
          <div>
            <label style={lbl}>Yarn Color Slot</label>
            <input value={config.colorSlot} onChange={(e) => onUpdate({ colorSlot: e.target.value })}
              placeholder="e.g. Yarn 1, Yarn 3"
              style={{ ...inp }} />
          </div>
        </div>
      )}
    </div>
  );
}

function hexToRgbStr(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

const DEFAULT_CONFIG = { weave: "jacquard", epi: 120, width: 44, zari: "Tested Zari", notes: "", colorSlot: "" };

export default function LayerTab({ palette, fabricType }) {
  const [layers, setLayers] = useState({
    ground: { active: true, ...DEFAULT_CONFIG, weave: "plain", epi: 72, zari: "None" },
    body:   { active: true, ...DEFAULT_CONFIG },
    border: { active: true, ...DEFAULT_CONFIG, weave: "brocade", width: 8, epi: 120 },
    pallu:  { active: true, ...DEFAULT_CONFIG, weave: "lampas", width: 60, zari: "Real Gold" },
  });
  const [designOrder, setDesignOrder] = useState(["pallu", "border", "body", "ground"]);
  const [totalWidth, setTotalWidth] = useState(110);

  const updateLayer = (id, patch) => {
    setLayers((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const activeLayers = LAYER_DEFS.filter((l) => layers[l.id]?.active);
  const usedWidth = activeLayers.reduce((sum, l) => sum + (layers[l.id]?.width || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={h2s}>Layer Management</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            Ground · Body · Border · Pallu
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: T.muted }}>
            Total width: <span style={{ color: usedWidth > totalWidth ? T.redBr : T.gold, fontWeight: 700 }}>{usedWidth}</span>
            <span style={{ color: T.muted }}> / {totalWidth} cm</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        {/* Layer cards */}
        <div>
          {LAYER_DEFS.map((layer) => (
            <LayerCard
              key={layer.id}
              layer={layer}
              config={layers[layer.id]}
              active={layers[layer.id]?.active}
              onToggleActive={() => updateLayer(layer.id, { active: !layers[layer.id]?.active })}
              onUpdate={(patch) => updateLayer(layer.id, patch)}
            />
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={card}>
            <div style={h2s}>Fabric Layout</div>

            {/* Visual strip showing layer widths */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Total fabric width (cm)</label>
              <input type="number" value={totalWidth} onChange={(e) => setTotalWidth(+e.target.value)} style={{ ...inp, marginBottom: 12 }} />
              <div style={{ height: 36, display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}` }}>
                {LAYER_DEFS.filter((l) => layers[l.id]?.active).map((layer) => {
                  const w = layers[layer.id]?.width || 0;
                  const pct = totalWidth > 0 ? (w / totalWidth * 100) : 0;
                  return (
                    <div key={layer.id}
                      title={`${layer.name}: ${w} cm`}
                      style={{
                        width: `${pct}%`, minWidth: pct > 0 ? 2 : 0,
                        background: layer.color, opacity: 0.8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden",
                      }}>
                      {pct > 8 && <span style={{ fontSize: 8, color: "rgba(0,0,0,0.7)", fontWeight: 700 }}>{w}cm</span>}
                    </div>
                  );
                })}
                {usedWidth < totalWidth && (
                  <div style={{ flex: 1, background: T.surf, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 8, color: T.muted }}>{totalWidth - usedWidth}cm free</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ fontSize: 11, lineHeight: 2, color: T.textDim }}>
              {LAYER_DEFS.map((layer) => {
                const cfg = layers[layer.id];
                if (!cfg?.active) return null;
                return (
                  <div key={layer.id} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.border}`, paddingBottom: 4, marginBottom: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: layer.color, display: "inline-block" }} />
                      {layer.name.split(" ")[0]}
                    </span>
                    <span style={{ color: T.text }}>{cfg.width} cm · {cfg.weave}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={card}>
            <div style={h2s}>Layer Guide</div>
            <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.9 }}>
              <div style={{ marginBottom: 8 }}><strong style={{ color: T.text }}>Ground (Tana)</strong> — Base structure. Usually plain weave in georgette, crepe, or organza.</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: T.text }}>Body (Bana)</strong> — Main decorative area. Jacquard or dobby weave with butas, jaal, or stripe.</div>
              <div style={{ marginBottom: 8 }}><strong style={{ color: T.text }}>Border (Kinari)</strong> — Selvedge decoration, 3–15 cm wide. Often brocade with zari.</div>
              <div><strong style={{ color: T.text }}>Pallu</strong> — End panel, 60–90 cm. The most elaborate layer, defines the sari's value.</div>
            </div>
          </div>

          {palette.length > 0 && (
            <div style={card}>
              <div style={h2s}>Palette × Layers</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {palette.slice(0, 12).map((c, i) => (
                  <div key={i} title={c.yarnName || `Yarn ${i+1}`}
                    style={{ width: 28, height: 28, background: c.hex, borderRadius: 6, border: `1px solid ${T.border}` }}
                  />
                ))}
              </div>
              <div style={{ color: T.muted, fontSize: 9, marginTop: 8 }}>
                Assign palette colors to layers via "Yarn Color Slot" above
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
