// Generates the export formats used by the Surat textile market.

/**
 * JC5 — NedGraphics/Stäubli electronic-jacquard card export.
 *
 * Structure reverse-engineered from NGJC5DLL20.dll + NGCard.dll (Jacquard 16):
 *   • a zoned text header (BEGIN_ZONE … END_ZONE) carrying the TYPE / DESIGN / FORMAT zones,
 *     plus the CCard geometry — X size (ends/warp), Y size (picks/weft), E size (extension hooks);
 *   • a bit-plane card body: one row per pick, MSB-first, one lift bit per warp end.
 *
 * This is a documented, human-readable rendering of that layout (not the binary .crd the loom
 * controller ingests). It faithfully mirrors the real zone/geometry/bit-plane model so it can be
 * converted to a controller card, rather than the invented INI the app previously emitted.
 */
export function buildJC5(s) {
  const matrix = s.weaveMatrix?.length ? s.weaveMatrix : [[0]];
  const ySize = matrix.length;                 // picks
  const xSize = matrix[0]?.length || 0;        // ends
  const eSize = s.palette?.length || 1;        // extension hooks ≈ color/selection count

  // Pack each pick row into MSB-first hex bytes (1 = warp up / lifted).
  const packRow = (row) => {
    let out = "";
    for (let i = 0; i < row.length; i += 8) {
      let byte = 0;
      for (let b = 0; b < 8; b++) {
        if (row[i + b]) byte |= 1 << (7 - b);
      }
      out += byte.toString(16).padStart(2, "0").toUpperCase();
    }
    return out;
  };

  return [
    "BEGIN_ZONE",
    "    TYPE_ZONE     DESIGN",
    "    DESIGN_ZONE",
    `        DESIGN_NAME   ${s.designName}`,
    `        FABRIC        ${s.fabricType}`,
    `        MARKET        ${s.targetMarket || "Surat"}`,
    `        ZARI          ${s.zariType || "No Zari"}`,
    `        DATE          ${new Date().toISOString()}`,
    "    FORMAT_ZONE",
    "        CONTROLLER    STAUBLI_JC5",
    `        X_SIZE        ${xSize}`,   // warp ends
    `        Y_SIZE        ${ySize}`,   // weft picks
    `        E_SIZE        ${eSize}`,   // extension hooks
    `        EPI           ${s.epi || 72}`,
    `        PPI           ${s.ppi || 64}`,
    `        REPEAT        ${s.repeatW || xSize} x ${s.repeatH || ySize}`,
    "    COLOR_ZONE",
    ...s.palette.map(
      (c, i) =>
        `        COLOR ${String(i).padStart(3, "0")}  RGB ${c.rgb.join(" ")}  ${
          c.yarnName || `YARN_${i + 1}`
        }  ${c.percentage?.toFixed(1) || "0"}%`
    ),
    "END_ZONE",
    "",
    "BEGIN_CARD",
    ...matrix.map((row) => packRow(row)),
    "END_CARD",
  ].join("\n");
}

export function buildJSON(s) {
  return JSON.stringify(
    {
      format: "SuratTextileStudio_v2",
      created: new Date().toISOString(),
      design: {
        name: s.designName,
        fabricType: s.fabricType,
        zariType: s.zariType,
        targetMarket: s.targetMarket,
        dimensions: s.imageDimensions,
        technical: {
          EPI: s.epi,
          PPI: s.ppi,
          GSM: s.gsm,
          denier: s.denier,
          repeatW: s.repeatW,
          repeatH: s.repeatH,
          weaveType: s.weaveName,
        },
        palette: s.palette.map((c, i) => ({
          index: i,
          hex: c.hex,
          rgb: c.rgb,
          yarnName: c.yarnName || `Yarn ${i + 1}`,
          usage: c.percentage,
          weaveType: c.weaveType,
        })),
        weaveMatrix: s.weaveMatrix,
        aiAnalysis: s.aiAnalysis,
        costEstimate: s.costEstimate,
        marketSuggestion: s.marketSuggestion,
      },
    },
    null,
    2
  );
}

export function buildCSV(s) {
  const rows = [
    ["#", "Hex", "R", "G", "B", "Yarn Name", "Usage%", "Weave", "g/m²", "Market Segment"],
  ];
  s.palette.forEach((c, i) =>
    rows.push([
      i + 1,
      c.hex,
      ...c.rgb,
      c.yarnName || `Yarn ${i + 1}`,
      c.percentage?.toFixed(1) || "0",
      c.weaveType || "plain",
      ((c.percentage || 0) * 0.85).toFixed(1),
      s.targetMarket || "Surat",
    ])
  );
  return rows.map((r) => r.join(",")).join("\n");
}

/**
 * WIF (Weaving Information File) v1.1 export — standard interchange for loom software.
 * Compatible with Fiberworks, WeaveIt, PixeLoom, Adagio, and most CAD systems.
 */
export function buildWIF(s) {
  const palette = s.palette || [];
  const threading = s.threading || [];
  const tieup = s.tieup || [];
  const treadling = s.treadling || [];
  const numShafts = s.numShafts || (tieup.length || 4);
  const numTreadles = s.numTreadles || (tieup[0]?.length || 4);
  const numEnds = threading.length || (s.repeatW || 80);
  const numPicks = treadling.length || (s.repeatH || 80);

  // Compute drawdown to know which cells are weft-up
  // drawdown[pick][end] = true means weft shows
  const drawdown = [];
  for (let pk = 0; pk < numPicks; pk++) {
    const row = [];
    const treadle = treadling[pk] ?? 0;
    for (let end = 0; end < numEnds; end++) {
      const shaft = threading[end] ?? 0;
      const weftUp = tieup[shaft]?.[treadle] ?? 0;
      row.push(weftUp ? 1 : 0);
    }
    drawdown.push(row);
  }

  // Color table entries for WIF (1-indexed)
  const colorLines = palette.map((c, i) => {
    const [r, g, b] = c.rgb || [0, 0, 0];
    return `${i + 1}=${r},${g},${b}`;
  });

  const warpColors = threading.map((_, i) => `${i + 1}=1`).join("\n") || "1=1";
  const weftColors = treadling.map((_, i) => `${i + 1}=${Math.min(palette.length, 2)}`).join("\n") || "1=2";

  const lines = [
    "[WIF]",
    "Version=1.1",
    "Date=" + new Date().toLocaleDateString("en-US"),
    "Developers=Surat Textile Studio (AI-Powered)",
    "Source Program=Surat Textile Studio v2",
    "Source Version=2.0",
    "",
    "[CONTENTS]",
    "Color Palette=true",
    "Warp=true",
    "Weft=true",
    "Threading=true",
    "Tieup=true",
    "Treadling=true",
    "Color Table=true",
    "Warp Colors=true",
    "Weft Colors=true",
    "",
    "[WEAVING]",
    `Rising Shed=true`,
    `Shafts=${numShafts}`,
    `Treadles=${numTreadles}`,
    "",
    "[WARP]",
    `Threads=${numEnds}`,
    `Units=Sett`,
    `Sett=${s.epi || 72}`,
    `Color=${1}`,
    "",
    "[WEFT]",
    `Threads=${numPicks}`,
    `Units=PPI`,
    `Sett=${s.ppi || 64}`,
    `Color=${Math.min(palette.length, 2)}`,
    "",
    "[COLOR PALETTE]",
    `Entries=${palette.length || 2}`,
    `Form=RGB`,
    `Unit=Range`,
    `Range=0,255`,
    "",
    "[COLOR TABLE]",
    ...(colorLines.length ? colorLines : ["1=0,0,0", "2=255,255,255"]),
    "",
    "[THREADING]",
    ...threading.map((sh, i) => `${i + 1}=${sh + 1}`),
    "",
    "[TIEUP]",
    ...tieup.map((row, shaft) =>
      row.map((v, treadle) => (v ? `${shaft + 1}=${treadle + 1}` : null)).filter(Boolean)
    ).flat(),
    "",
    "[TREADLING]",
    ...treadling.map((tr, i) => `${i + 1}=${tr + 1}`),
    "",
    "[WARP COLORS]",
    warpColors,
    "",
    "[WEFT COLORS]",
    weftColors,
    "",
    `; ${s.designName || "Surat Design"} — Fabric: ${s.fabricType || "Jacquard"}, Zari: ${s.zariType || "None"}`,
    `; Market: ${s.targetMarket || "Surat"} — Exported ${new Date().toISOString()}`,
  ];
  return lines.join("\n");
}

/** Trigger a browser download for the given text content. */
export function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
