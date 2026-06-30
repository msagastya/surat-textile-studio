import { useState, useEffect } from "react";
import { T, btn, card, h2s, lbl, inp, sel } from "../styles/theme.js";
import { cloudDb } from "../utils/cloudDb.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

// ── localStorage fallback ─────────────────────────────────────────────────────
const STORAGE_KEY = "surat_design_library_v1";
function localLoad()  { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } }
function localSave(e) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(e)); } catch {} }

// ── Thumbnail generator ────────────────────────────────────────────────────────
function makeThumbnail(grid, gridW, gridH, palette, size = 96) {
  const cv = document.createElement("canvas");
  cv.width = size; cv.height = size;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#07050a";
  ctx.fillRect(0, 0, size, size);
  const cw = size / gridW, ch = size / gridH;
  for (let r = 0; r < gridH; r++)
    for (let c = 0; c < gridW; c++) {
      const ci = grid[r * gridW + c];
      if (ci > 0 && palette[ci - 1]) {
        ctx.fillStyle = palette[ci - 1].hex;
        ctx.fillRect(c * cw, r * ch, Math.ceil(cw), Math.ceil(ch));
      }
    }
  return cv.toDataURL("image/png");
}

// ── Status badge ──────────────────────────────────────────────────────────────
function CloudBadge({ status }) {
  const MAP = {
    synced:  { color: T.emerald, label: "Cloud Synced" },
    syncing: { color: T.gold,    label: "Syncing…" },
    local:   { color: T.violet,  label: "Local Only" },
    error:   { color: T.red,     label: "Cloud Error" },
    off:     { color: T.muted,   label: "Local Storage" },
  };
  const { color, label } = MAP[status] || MAP.off;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      <span style={{ color, fontSize: 10, letterSpacing: "1px" }}>{label}</span>
    </div>
  );
}

export default function DesignLibraryTab({
  grid, gridW, gridH, palette, setGrid, setGridW, setGridH, setPalette,
  designName, setDesignName, fabricType, zariType,
}) {
  const [library, setLibrary]     = useState(localLoad);
  const [search, setSearch]       = useState("");
  const [sortBy, setSortBy]       = useState("date");
  const [filterTag, setFilterTag] = useState("");
  const [saveTag, setSaveTag]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [confirm, setConfirm]     = useState(null);
  const [cloudStatus, setCloudStatus] = useState(cloudDb.isConfigured() ? "local" : "off");
  const [cloudMsg, setCloudMsg]   = useState("");
  const { isMobile } = useBreakpoint();

  const useCloud = cloudDb.isConfigured();

  // ── On mount: pull cloud list ────────────────────────────────────────────────
  useEffect(() => {
    if (!useCloud) return;
    setCloudStatus("syncing");
    cloudDb.list()
      .then((designs) => {
        // Merge cloud into local (cloud wins on id collision)
        setLibrary((prev) => {
          const map = new Map(prev.map((d) => [d.id, d]));
          designs.forEach((d) => map.set(d.id, { ...map.get(d.id), ...d }));
          const merged = [...map.values()].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
          localSave(merged);
          return merged;
        });
        setCloudStatus("synced");
      })
      .catch((err) => {
        setCloudStatus("error");
        setCloudMsg(err.message);
      });
  }, [useCloud]);

  const allTags = [...new Set(library.flatMap((e) => e.tags || []))].sort();

  const filtered = library
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.name.toLowerCase().includes(q) || (e.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchTag = !filterTag || (e.tags || []).includes(filterTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === "date")   return new Date(b.savedAt) - new Date(a.savedAt);
      if (sortBy === "name")   return a.name.localeCompare(b.name);
      if (sortBy === "colors") return (b.paletteCount || 0) - (a.paletteCount || 0);
      return 0;
    });

  // ── Save ──────────────────────────────────────────────────────────────────────
  const saveDesign = async () => {
    if (!grid || !palette.length) { alert("No design to save — extract colors and paint the canvas first."); return; }
    setSaving(true);
    const thumb = makeThumbnail(grid, gridW, gridH, palette);
    const entry = {
      id:           Date.now().toString(36),
      name:         designName || "Untitled",
      savedAt:      new Date().toISOString(),
      fabricType, zariType,
      gridW, gridH,
      grid:         Array.from(grid),
      palette:      palette.map((c) => ({ ...c })),
      tags:         saveTag.split(",").map((t) => t.trim()).filter(Boolean),
      paletteCount: palette.length,
      filledCells:  grid.filter(Boolean).length,
      thumbnail:    thumb,
    };

    // Save locally first (instant feedback)
    const next = [entry, ...library];
    setLibrary(next);
    localSave(next);
    setSaveTag("");

    // Then sync to cloud
    if (useCloud) {
      setCloudStatus("syncing");
      try {
        await cloudDb.save(entry);
        setCloudStatus("synced");
      } catch (err) {
        setCloudStatus("error");
        setCloudMsg("Saved locally. Cloud error: " + err.message);
      }
    }
    setSaving(false);
  };

  // ── Load ──────────────────────────────────────────────────────────────────────
  const loadDesign = async (entry) => {
    let design = entry;

    // If from cloud list (no grid yet), fetch full data
    if (useCloud && (!entry.grid || entry.grid.length === 0)) {
      setLoading(true);
      try {
        design = await cloudDb.load(entry.id);
      } catch (err) {
        alert("Could not load from cloud: " + err.message);
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    const w = design.gridW || 32, h = design.gridH || 32;
    setGridW(w); setGridH(h);
    setGrid(Array.from(design.grid));
    setPalette(design.palette || []);
    setDesignName(design.name);
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const deleteDesign = async (id) => {
    const next = library.filter((e) => e.id !== id);
    setLibrary(next);
    localSave(next);
    setConfirm(null);
    if (useCloud) {
      try { await cloudDb.delete(id); } catch {}
    }
  };

  const duplicateDesign = (entry) => {
    const dup = { ...entry, id: Date.now().toString(36), name: entry.name + " (copy)", savedAt: new Date().toISOString() };
    const next = [dup, ...library];
    setLibrary(next); localSave(next);
    if (useCloud) cloudDb.save(dup).catch(() => {});
  };

  const exportToFile = (entry) => {
    const blob = new Blob([JSON.stringify(entry, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = (entry.name || "design").replace(/\s+/g, "_") + ".studio.json";
    a.click(); URL.revokeObjectURL(url);
  };

  const importFromFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const entry = JSON.parse(ev.target.result);
        if (!entry.grid || !entry.palette) throw new Error("Invalid design file");
        const fresh = { ...entry, id: Date.now().toString(36), savedAt: new Date().toISOString() };
        const next = [fresh, ...library];
        setLibrary(next); localSave(next);
        if (useCloud) cloudDb.save(fresh).catch(() => {});
      } catch (err) {
        alert("Could not import: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const storageUsed = (() => {
    try { return (( localStorage.getItem(STORAGE_KEY) || "").length * 2 / 1024 / 1024).toFixed(2); }
    catch { return "?"; }
  })();

  return (
    <div>
      {/* Header */}
      <div className="tab-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ ...h2s, color: T.teal, borderLeftColor: T.teal }}>Design Library</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            {library.length} designs · {storageUsed} MB local
          </div>
        </div>
        <div className="tab-header-actions" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <CloudBadge status={cloudStatus} />
          <label style={{ ...btn("ghost"), height: 32, padding: "0 12px", fontSize: 11, cursor: "pointer" }}>
            Import File
            <input type="file" accept=".json" onChange={importFromFile} style={{ display: "none" }} />
          </label>
          <button onClick={saveDesign} disabled={saving} style={{ ...btn("teal"), height: 36, padding: "0 20px" }}>
            {saving ? "Saving…" : "Save Current Design"}
          </button>
        </div>
      </div>

      {/* Cloud error banner */}
      {cloudMsg && (
        <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}55`, borderRadius: 10, padding: "10px 16px", fontSize: 11, color: T.redBr, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          {cloudMsg}
          <button onClick={() => setCloudMsg("")} style={{ background: "none", border: "none", color: T.redBr, cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* Cloud setup banner (if not configured) */}
      {!useCloud && (
        <div style={{ ...card, marginBottom: 16, background: `linear-gradient(135deg, ${T.panel} 0%, ${T.tealFaint} 100%)`, border: `1px solid ${T.tealDim}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 28 }}>☁️</div>
            <div>
              <div style={{ color: T.teal, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>Enable Cloud Database (Google Sheets)</div>
              <div style={{ color: T.textDim, fontSize: 11, lineHeight: 1.8 }}>
                1. Deploy <code style={{ color: T.gold }}>database/Code.gs</code> as a Google Apps Script Web App<br />
                2. Add <code style={{ color: T.gold }}>VITE_GAS_URL=https://script.google.com/macros/s/YOUR_ID/exec</code> to your <code style={{ color: T.gold }}>.env.local</code><br />
                3. Add the same key to Vercel environment variables<br />
                Designs will sync across all devices automatically.
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 16 }}>
        {/* Sidebar */}
        <div style={{ width: isMobile ? "100%" : 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card}>
            <div style={h2s}>Save Settings</div>
            <label style={lbl}>Tags (comma separated)</label>
            <input value={saveTag} onChange={(e) => setSaveTag(e.target.value)} placeholder="floral, zari, red…" style={inp} />
          </div>

          <div style={card}>
            <div style={h2s}>Filter & Sort</div>
            <label style={lbl}>Search</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or tag…" style={{ ...inp, marginBottom: 12 }} />
            <label style={lbl}>Filter by Tag</label>
            <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} style={{ ...sel, marginBottom: 12 }}>
              <option value="">All tags</option>
              {allTags.map((t) => <option key={t}>{t}</option>)}
            </select>
            <label style={lbl}>Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={sel}>
              <option value="date">Date (newest first)</option>
              <option value="name">Name (A–Z)</option>
              <option value="colors">Color count</option>
            </select>
          </div>

          <div style={{ ...card, fontSize: 11, color: T.textDim, lineHeight: 2.2 }}>
            <div style={h2s}>Storage</div>
            {[
              ["Designs",    library.length,  T.teal],
              ["Local",      storageUsed + " MB", T.gold],
              ["Tags",       allTags.length,  T.violet],
              ["Cloud",      useCloud ? "Connected" : "Not set", useCloud ? T.emerald : T.muted],
            ].map(([k, v, col]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{k}</span><span style={{ color: col, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
            <div style={{ height: 5, background: T.raise, borderRadius: 3, marginTop: 10, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, parseFloat(storageUsed) / 5 * 100)}%`, height: "100%", background: T.teal, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 3 }}>~5MB localStorage limit</div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          {loading && (
            <div style={{ ...card, textAlign: "center", padding: 40 }}>
              <div style={{ color: T.teal, fontSize: 13 }}>Loading design from cloud…</div>
            </div>
          )}

          {!loading && filtered.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2 }}>📚</div>
              <div style={{ color: T.textDim, fontSize: 16, fontFamily: "var(--font-serif)", marginBottom: 8 }}>
                {library.length === 0 ? "No designs saved yet" : "No results"}
              </div>
              <div style={{ color: T.muted, fontSize: 12 }}>
                {library.length === 0 ? "Paint on the Canvas tab then click Save." : "Try a different search or tag."}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {filtered.map((entry) => (
                <DesignCard
                  key={entry.id}
                  entry={entry}
                  onLoad={() => loadDesign(entry)}
                  onDelete={() => setConfirm(entry.id)}
                  onDuplicate={() => duplicateDesign(entry)}
                  onExport={() => exportToFile(entry)}
                  isConfirming={confirm === entry.id}
                  onCancelConfirm={() => setConfirm(null)}
                  onConfirmDelete={() => deleteDesign(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ ...card, width: "min(320px, calc(100vw - 32px))", textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🗑️</div>
            <div style={{ color: T.text, fontSize: 15, marginBottom: 8 }}>Delete this design?</div>
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 24 }}>Removed from local + cloud.</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => setConfirm(null)} style={{ ...btn("ghost"), width: 100 }}>Cancel</button>
              <button onClick={() => deleteDesign(confirm)} style={{ ...btn("red"), width: 100 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DesignCard({ entry, onLoad, onDelete, onDuplicate, onExport }) {
  const [hover, setHover] = useState(false);
  const date = new Date(entry.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
  const coverPct = entry.filledCells && (entry.gridW * entry.gridH)
    ? Math.round(entry.filledCells / (entry.gridW * entry.gridH) * 100) : 0;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${hover ? T.tealDim : T.border}`,
        background: T.surf,
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hover ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${T.tealDim}` : "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {entry.thumbnail ? (
        <img src={entry.thumbnail} alt={entry.name}
          style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", imageRendering: "pixelated", background: "#07050a" }} />
      ) : (
        <div style={{ width: "100%", aspectRatio: "1/1", background: "#0e0b10", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 40, opacity: 0.2 }}>🧵</span>
        </div>
      )}

      {/* Color strip */}
      <div style={{ display: "flex", height: 5 }}>
        {(entry.palette || []).slice(0, 12).map((c, i) => <div key={i} style={{ flex: c.percentage || 1, background: c.hex }} />)}
      </div>

      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ color: T.text, fontWeight: 600, fontSize: 12, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.name}
        </div>
        <div style={{ color: T.muted, fontSize: 9, marginBottom: 6 }}>
          {date} · {entry.gridW}×{entry.gridH} · {entry.paletteCount || 0} colors · {coverPct}%
        </div>
        {(entry.tags || []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {entry.tags.map((t) => (
              <span key={t} style={{ fontSize: 9, color: T.teal, border: `1px solid ${T.tealDim}`, borderRadius: 4, padding: "1px 6px" }}>{t}</span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onLoad}      style={{ ...btn("teal"),  flex: 2, height: 28, fontSize: 10, padding: 0 }}>Load</button>
          <button onClick={onDuplicate} title="Duplicate" style={{ ...btn("ghost"), width: 28, height: 28, padding: 0, fontSize: 13 }}>⎘</button>
          <button onClick={onExport}    title="Export JSON" style={{ ...btn("ghost"), width: 28, height: 28, padding: 0, fontSize: 13 }}>↓</button>
          <button onClick={onDelete}    title="Delete" style={{ ...btn("red"), width: 28, height: 28, padding: 0, fontSize: 13 }}>✕</button>
        </div>
      </div>
    </div>
  );
}
