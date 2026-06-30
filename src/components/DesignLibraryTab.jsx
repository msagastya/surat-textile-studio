import { useState, useEffect, useRef } from "react";
import { T, btn, card, h2s, lbl, inp, sel } from "../styles/theme.js";

const STORAGE_KEY = "surat_design_library_v1";

function loadLibrary() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLibrary(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    alert("Storage full — remove old designs to free space.");
  }
}

// Render a tiny thumbnail of grid onto a canvas, return data URL
function makeThumbnail(grid, gridW, gridH, palette, size = 80) {
  const cv = document.createElement("canvas");
  cv.width = size; cv.height = size;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#1a1208";
  ctx.fillRect(0, 0, size, size);
  const cellW = size / gridW, cellH = size / gridH;
  for (let r = 0; r < gridH; r++) {
    for (let c = 0; c < gridW; c++) {
      const ci = grid[r * gridW + c];
      if (ci > 0 && palette[ci - 1]) {
        ctx.fillStyle = palette[ci - 1].hex;
        ctx.fillRect(c * cellW, r * cellH, Math.ceil(cellW), Math.ceil(cellH));
      }
    }
  }
  return cv.toDataURL("image/png");
}

export default function DesignLibraryTab({
  grid, gridW, gridH, palette, setGrid, setGridW, setGridH, setPalette,
  designName, setDesignName, fabricType, zariType,
}) {
  const [library, setLibrary] = useState(loadLibrary);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [filterTag, setFilterTag] = useState("");
  const [saveTag, setSaveTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const allTags = [...new Set(library.flatMap((e) => e.tags || []))].sort();

  const filtered = library
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.name.toLowerCase().includes(q) || (e.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchTag = !filterTag || (e.tags || []).includes(filterTag);
      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.savedAt) - new Date(a.savedAt);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "colors") return (b.paletteCount || 0) - (a.paletteCount || 0);
      return 0;
    });

  const saveDesign = () => {
    if (!grid || !palette.length) { alert("No design to save — extract colors and paint the canvas first."); return; }
    setSaving(true);
    setTimeout(() => {
      const thumb = makeThumbnail(grid, gridW, gridH, palette);
      const entry = {
        id: Date.now().toString(36),
        name: designName || "Untitled",
        savedAt: new Date().toISOString(),
        fabricType, zariType,
        gridW, gridH,
        grid: Array.from(grid),
        palette: palette.map((c) => ({ ...c })),
        tags: saveTag.split(",").map((t) => t.trim()).filter(Boolean),
        paletteCount: palette.length,
        filledCells: grid.filter(Boolean).length,
        thumbnail: thumb,
      };
      const next = [entry, ...library];
      setLibrary(next);
      saveLibrary(next);
      setSaveTag("");
      setSaving(false);
    }, 60);
  };

  const loadDesign = (entry) => {
    const w = entry.gridW || 32, h = entry.gridH || 32;
    setGridW(w); setGridH(h);
    setGrid(Array.from(entry.grid));
    setPalette(entry.palette || []);
    setDesignName(entry.name);
  };

  const deleteDesign = (id) => {
    const next = library.filter((e) => e.id !== id);
    setLibrary(next);
    saveLibrary(next);
    setConfirm(null);
  };

  const duplicateDesign = (entry) => {
    const dup = { ...entry, id: Date.now().toString(36), name: entry.name + " (copy)", savedAt: new Date().toISOString() };
    const next = [dup, ...library];
    setLibrary(next);
    saveLibrary(next);
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
        setLibrary(next);
        saveLibrary(next);
      } catch (err) {
        alert("Could not import: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const storageUsed = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "";
      return (raw.length * 2 / 1024 / 1024).toFixed(2);
    } catch { return "?"; }
  })();

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={h2s}>Design Library</div>
          <div style={{ color: T.textDim, fontSize: 22, fontWeight: 700, fontFamily: "var(--font-serif)", marginTop: -4 }}>
            {library.length} designs saved · {storageUsed} MB used
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ ...btn("ghost"), height: 32, padding: "0 12px", fontSize: 11, cursor: "pointer" }}>
            Import File
            <input type="file" accept=".json" onChange={importFromFile} style={{ display: "none" }} />
          </label>
          <button onClick={saveDesign} disabled={saving} style={{ ...btn("gold"), height: 36, padding: "0 20px" }}>
            {saving ? "Saving…" : "Save Current Design"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {/* Sidebar */}
        <div style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Save options */}
          <div style={card}>
            <div style={h2s}>Save Settings</div>
            <label style={lbl}>Tags (comma separated)</label>
            <input
              value={saveTag}
              onChange={(e) => setSaveTag(e.target.value)}
              placeholder="floral, zari, red…"
              style={{ ...inp, marginBottom: 0 }}
            />
          </div>

          {/* Filter */}
          <div style={card}>
            <div style={h2s}>Filter & Sort</div>
            <label style={lbl}>Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or tag…"
              style={{ ...inp, marginBottom: 12 }}
            />
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

          {/* Stats */}
          <div style={{ ...card, fontSize: 11, color: T.textDim, lineHeight: 2.2 }}>
            <div style={h2s}>Storage</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Designs</span><span style={{ color: T.gold }}>{library.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Used</span><span style={{ color: T.gold }}>{storageUsed} MB</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tags</span><span style={{ color: T.gold }}>{allTags.length}</span>
            </div>
            <div style={{ height: 6, background: T.raise, borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, parseFloat(storageUsed) / 5 * 100)}%`, height: "100%", background: T.goldDim, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>~5MB localStorage limit</div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 56, marginBottom: 16, opacity: 0.2 }}>📚</div>
              <div style={{ color: T.textDim, fontSize: 16, fontFamily: "var(--font-serif)", marginBottom: 8 }}>
                {library.length === 0 ? "No designs saved yet" : "No results matching your search"}
              </div>
              <div style={{ color: T.muted, fontSize: 12 }}>
                {library.length === 0
                  ? "Design something in the Canvas tab then click \"Save Current Design\" above."
                  : "Try a different search or tag filter."}
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

      {/* Confirm delete modal */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ ...card, width: 320, textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🗑️</div>
            <div style={{ color: T.text, fontSize: 15, marginBottom: 8 }}>Delete this design?</div>
            <div style={{ color: T.muted, fontSize: 11, marginBottom: 24 }}>This cannot be undone.</div>
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

function DesignCard({ entry, onLoad, onDelete, onDuplicate, onExport, isConfirming, onCancelConfirm, onConfirmDelete }) {
  const [hover, setHover] = useState(false);
  const date = new Date(entry.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
  const coverPct = entry.filledCells && (entry.gridW * entry.gridH)
    ? Math.round(entry.filledCells / (entry.gridW * entry.gridH) * 100)
    : 0;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 14, overflow: "hidden",
        border: `1px solid ${hover ? T.goldDim : T.border}`,
        background: T.surf,
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hover ? `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${T.goldDim}` : "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* Thumbnail */}
      {entry.thumbnail ? (
        <img
          src={entry.thumbnail} alt={entry.name}
          style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block", imageRendering: "pixelated", background: "#0a0806" }}
        />
      ) : (
        <div style={{ width: "100%", aspectRatio: "1/1", background: "#0a0806", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 40, opacity: 0.2 }}>🧵</span>
        </div>
      )}

      {/* Color strip */}
      <div style={{ display: "flex", height: 5 }}>
        {(entry.palette || []).slice(0, 12).map((c, i) => (
          <div key={i} style={{ flex: c.percentage || 1, background: c.hex }} />
        ))}
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
              <span key={t} style={{ fontSize: 9, color: T.gold, border: `1px solid ${T.goldDim}`, borderRadius: 4, padding: "1px 6px" }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onLoad} style={{ ...btn("gold"), flex: 2, height: 28, fontSize: 10, padding: 0 }}>Load</button>
          <button onClick={onDuplicate} title="Duplicate" style={{ ...btn("ghost"), width: 28, height: 28, padding: 0, fontSize: 13 }}>⎘</button>
          <button onClick={onExport} title="Export JSON" style={{ ...btn("ghost"), width: 28, height: 28, padding: 0, fontSize: 13 }}>↓</button>
          <button onClick={onDelete} title="Delete" style={{ ...btn("red"), width: 28, height: 28, padding: 0, fontSize: 13 }}>✕</button>
        </div>
      </div>
    </div>
  );
}
