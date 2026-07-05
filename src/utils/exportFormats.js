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

/**
 * Indexed 8-bit BMP export — the reliable interop path into NedGraphics.
 *
 * Jacquard 16 / Texcelle 16 import palette-indexed bitmaps (their own texture and
 * graph-paper libraries are BMPs), so a correctly-formed 8-bit BMP with the design's
 * palette is the format a real seat opens without any reverse-engineered container.
 *
 * Pixel source, in priority order:
 *   1. the painted design grid (`grid`, 1-indexed into palette, 0 = ground)
 *   2. the weave matrix (2 colors: warp up / weft up)
 *   3. a palette stripe fallback, so an export always produces something.
 *
 * Returns a Uint8Array (binary). Palette index 0 is the ground; 1..N are palette colors.
 */
export function buildIndexedBMP(s) {
  let w, h, pixelAt, table;

  const pal = (s.palette || []).map((c) => c.rgb || [0, 0, 0]);

  if (s.grid?.length && s.gridW > 0 && s.gridH > 0) {
    w = s.gridW; h = s.gridH;
    table = [[247, 244, 240], ...pal];                 // 0 = ground (warm off-white)
    pixelAt = (x, y) => s.grid[y * w + x] || 0;         // grid already 1-indexed
  } else if (s.weaveMatrix?.length && s.weaveMatrix[0]?.length) {
    const m = s.weaveMatrix;
    w = m[0].length; h = m.length;
    const warp = pal[0] || [30, 24, 46];
    const weft = pal[1] || [220, 214, 205];
    table = [weft, warp];                               // 0 = weft up, 1 = warp up
    pixelAt = (x, y) => (m[y][x] ? 1 : 0);
  } else {
    const n = Math.max(1, pal.length);
    w = n * 16; h = 64;
    table = [[247, 244, 240], ...pal];
    pixelAt = (x) => Math.min(n, Math.floor(x / 16) + 1);
  }

  // 256-entry BGRA color table (BMP palettes are fixed at 2^bpp entries for 8-bit).
  const palette = new Uint8Array(256 * 4);
  for (let i = 0; i < 256; i++) {
    const [r, g, b] = table[i] || [0, 0, 0];
    palette[i * 4 + 0] = b; palette[i * 4 + 1] = g; palette[i * 4 + 2] = r; palette[i * 4 + 3] = 0;
  }

  const rowSize = (w + 3) & ~3;                         // rows padded to 4 bytes
  const pixelBytes = rowSize * h;
  const offset = 14 + 40 + 256 * 4;                     // headers + palette
  const fileSize = offset + pixelBytes;

  const buf = new Uint8Array(fileSize);
  const dv = new DataView(buf.buffer);
  // BITMAPFILEHEADER
  buf[0] = 0x42; buf[1] = 0x4d;                         // 'BM'
  dv.setUint32(2, fileSize, true);
  dv.setUint32(10, offset, true);
  // BITMAPINFOHEADER
  dv.setUint32(14, 40, true);
  dv.setInt32(18, w, true);
  dv.setInt32(22, h, true);                             // positive = bottom-up rows
  dv.setUint16(26, 1, true);                            // planes
  dv.setUint16(28, 8, true);                            // bits per pixel
  dv.setUint32(30, 0, true);                            // BI_RGB (uncompressed)
  dv.setUint32(34, pixelBytes, true);
  dv.setInt32(38, 2835, true);                          // ~72 DPI x
  dv.setInt32(42, 2835, true);                          // ~72 DPI y
  dv.setUint32(46, 256, true);                          // colors used
  dv.setUint32(50, 0, true);                            // all important
  buf.set(palette, 54);
  // Pixel data, bottom-up
  for (let y = 0; y < h; y++) {
    const dst = offset + (h - 1 - y) * rowSize;
    for (let x = 0; x < w; x++) buf[dst + x] = pixelAt(x, y) & 0xff;
  }
  return buf;
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
