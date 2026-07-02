// Real, working export formats for Jacquard and shaft-loom CAD software.
//
// REPLACED (were fake text files NedGraphics/loom controllers would reject):
//   JC5 — NedGraphics proprietary binary, no public spec. BMP is the correct input path.
//   EP  — Bonas proprietary binary, no public spec. Indexed PNG is the correct path.
//
// IMPLEMENTED (open specs, actually work):
//   Design PNG — indexed 24-bit PNG (color cartoon) → ArahWeave / Textronic import
//   Loom BMP   — 1-bit Windows BMP (hook control)  → Stäubli JC5/JC6 native import
//   WIF v1.1   — Weaving Information File           → ArahWeave, WeavePoint, ScotWeave, DigiBunai
//   JSON / CSV — always were fine

// ── Download helpers ─────────────────────────────────────────────────────────

export function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function downloadBinary(bytes, filename, mime) {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Design Cartoon PNG ────────────────────────────────────────────────────────
// 24-bit PNG where width=gridW hooks, height=gridH picks, 1 pixel per hook/pick.
// Each unique color = one yarn. ArahWeave and Textronic read this as a "Jacquard
// cartoon" and let you assign a weave structure to each color zone.
// Workflow: Import into ArahWeave → Jacquard menu → assign weaves → export to JC5/EP.
export function buildDesignPNG({ grid, gridW, gridH, palette }) {
  if (!grid || !gridW || !gridH) return null;

  const canvas = document.createElement("canvas");
  canvas.width = gridW;
  canvas.height = gridH;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, gridW, gridH);

  const img = ctx.getImageData(0, 0, gridW, gridH);
  const px  = img.data;

  for (let r = 0; r < gridH; r++) {
    for (let c = 0; c < gridW; c++) {
      const ci = grid[r * gridW + c];
      if (ci > 0 && palette[ci - 1]) {
        const hex = palette[ci - 1].hex;
        const base = (r * gridW + c) * 4;
        px[base]     = parseInt(hex.slice(1, 3), 16);
        px[base + 1] = parseInt(hex.slice(3, 5), 16);
        px[base + 2] = parseInt(hex.slice(5, 7), 16);
        px[base + 3] = 255;
      }
    }
  }

  ctx.putImageData(img, 0, 0);
  const b64 = canvas.toDataURL("image/png").split(",")[1];
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// ── Loom Card BMP (1-bit Windows BMP) ────────────────────────────────────────
// Standard Windows BMP, 1-bit color depth.
//   width  = weaveMatrix columns (hooks per repeat)
//   height = weaveMatrix rows (picks per repeat)
//   white pixel (bit=1) = hook UP (warp shows / interlacing)
//   black pixel (bit=0) = hook DOWN (weft shows)
//
// Stäubli JC5 and JC6 controllers accept 1-bit BMP via their "Import Design" function
// (confirmed in JC5 instruction manual). Transfer via USB pen drive.
// The controller converts BMP to its internal format on import.
export function buildLoomBMP({ weaveMatrix }) {
  const matrix = weaveMatrix;
  if (!matrix?.length || !matrix[0]?.length) return null;

  const height    = matrix.length;
  const width     = matrix[0].length;
  const rowStride = Math.ceil(width / 32) * 4;   // DWORD-aligned bytes per row
  const pxOffset  = 14 + 40 + 8;                 // fileheader + infoheader + 2-color table
  const pxBytes   = rowStride * height;
  const fileSize  = pxOffset + pxBytes;

  const buf  = new Uint8Array(fileSize);
  const view = new DataView(buf.buffer);

  // BITMAPFILEHEADER (14 bytes)
  buf[0] = 0x42; buf[1] = 0x4D;             // 'BM'
  view.setUint32(2,  fileSize,   true);
  view.setUint16(6,  0,          true);      // reserved
  view.setUint16(8,  0,          true);
  view.setUint32(10, pxOffset,   true);      // pixel data offset

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40,       true);        // header size
  view.setInt32( 18, width,    true);
  view.setInt32( 22, height,   true);        // positive = bottom-up row order
  view.setUint16(26, 1,        true);        // color planes
  view.setUint16(28, 1,        true);        // bits per pixel
  view.setUint32(30, 0,        true);        // BI_RGB (no compression)
  view.setUint32(34, pxBytes,  true);
  view.setInt32( 38, 3937,     true);        // ~100 DPI
  view.setInt32( 42, 3937,     true);
  view.setUint32(46, 2,        true);        // 2 colors in table
  view.setUint32(50, 0,        true);

  // Color table: index 0 = black (hook down), index 1 = white (hook up)
  buf[54] = 0x00; buf[55] = 0x00; buf[56] = 0x00; buf[57] = 0x00; // RGBQUAD black
  buf[58] = 0xFF; buf[59] = 0xFF; buf[60] = 0xFF; buf[61] = 0x00; // RGBQUAD white

  // Pixel data — BMP stores rows bottom-to-top; MSB = leftmost pixel
  for (let row = 0; row < height; row++) {
    const matRow   = matrix[height - 1 - row]; // flip vertically
    const rowStart = pxOffset + row * rowStride;
    for (let col = 0; col < width; col++) {
      if (matRow[col]) {
        buf[rowStart + Math.floor(col / 8)] |= (1 << (7 - (col % 8)));
      }
    }
  }

  return buf;
}

// ── WIF v1.1 ─────────────────────────────────────────────────────────────────
// Spec: https://www.wif-format.org/ (finalized April 1997)
// Compatible with: ArahWeave, WeavePoint, ScotWeave, Fiberworks PCW, iWeaveIt,
//                  SwiftWeave, DigiBunai, AdaCAD, handweaving.net drafts.
//
// Color values are 16-bit (0–65535), not 8-bit (WIF spec §COLOR TABLE).
// For Jacquard (no threading editor): uses [LIFTPLAN] — each pick lists raised hooks.
// For shaft looms (threading present): uses [THREADING]+[TIEUP]+[TREADLING].
export function buildWIF(s) {
  const palette   = s.palette    || [];
  const threading = s.threading  || [];
  const tieup     = s.tieup      || [];
  const treadling = s.treadling  || [];
  const matrix    = s.weaveMatrix || [];

  const numShafts   = s.numShafts   || matrix.length    || 4;
  const numTreadles = s.numTreadles  || matrix[0]?.length || 4;
  const numEnds     = threading.length || s.gridW || s.repeatW || 80;
  const numPicks    = treadling.length || s.gridH || s.repeatH || 80;

  // Use Jacquard liftplan when no explicit shaft threading has been set up
  const jacquard = !threading.length && !treadling.length && matrix.length > 0;

  const L = []; // output lines

  // [WIF]
  L.push("[WIF]");
  L.push("Version=1.1");
  L.push(`Date=${new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}`);
  L.push("Developers=Surat Textile Studio");
  L.push("Source Program=Surat Textile Studio");
  L.push("Source Version=2.0");

  // [CONTENTS]
  L.push("", "[CONTENTS]");
  L.push("Color Palette=true");
  L.push("Color Table=true");
  L.push("Text=true");
  L.push("Weaving=true");
  L.push("Warp=true");
  L.push("Weft=true");
  if (jacquard) L.push("Liftplan=true");
  else {
    L.push("Threading=true");
    L.push("Tieup=true");
    L.push("Treadling=true");
  }
  if (palette.length) {
    L.push("Warp Colors=true");
    L.push("Weft Colors=true");
  }

  // [TEXT]
  L.push("", "[TEXT]");
  L.push(`Title=${s.designName || "Untitled"}`);
  L.push("Author=Surat Textile Studio");
  L.push(`Notes=${s.fabricType || ""} | Zari: ${s.zariType || "None"} | Market: ${s.targetMarket || "Surat"} | EPI:${s.epi || 72} PPI:${s.ppi || 64} GSM:${s.gsm || 120}`);

  // [WEAVING]
  L.push("", "[WEAVING]");
  L.push(`Shafts=${jacquard ? numEnds : numShafts}`);
  L.push(`Treadles=${jacquard ? numPicks : numTreadles}`);
  L.push("Rising Shed=true");

  // [WARP]
  L.push("", "[WARP]");
  L.push(`Threads=${numEnds}`);
  L.push("Units=Sett");
  L.push(`Sett=${s.epi || 72}`);
  L.push("Color=1");

  // [WEFT]
  L.push("", "[WEFT]");
  L.push(`Threads=${numPicks}`);
  L.push("Units=PPI");
  L.push(`Sett=${s.ppi || 64}`);
  L.push(`Color=${Math.min(palette.length, 2) || 1}`);

  // [COLOR PALETTE]
  L.push("", "[COLOR PALETTE]");
  L.push(`Entries=${palette.length || 2}`);
  L.push("Form=RGB");
  L.push("Unit=Range");
  L.push("Range=65535");           // WIF spec: 16-bit per channel

  // [COLOR TABLE] — values 0–65535 (multiply 0–255 by 257)
  L.push("", "[COLOR TABLE]");
  if (palette.length) {
    palette.forEach((c, i) => {
      const [r, g, b] = c.rgb || [0, 0, 0];
      L.push(`${i + 1}=${Math.round(r * 257)},${Math.round(g * 257)},${Math.round(b * 257)}`);
    });
  } else {
    L.push("1=0,0,0");
    L.push("2=65535,65535,65535");
  }

  if (jacquard) {
    // [LIFTPLAN] — each pick: comma-separated 1-indexed hook numbers that are raised
    L.push("", "[LIFTPLAN]");
    matrix.forEach((row, pick) => {
      const raised = row.map((v, h) => v ? h + 1 : null).filter(Boolean).join(",");
      if (raised) L.push(`${pick + 1}=${raised}`);
    });
  } else {
    // [THREADING] — each warp end → shaft (1-indexed)
    L.push("", "[THREADING]");
    threading.forEach((shaft, end) => L.push(`${end + 1}=${shaft + 1}`));

    // [TIEUP] — each treadle → comma-separated shafts it raises (WIF spec §TIEUP)
    L.push("", "[TIEUP]");
    for (let t = 0; t < numTreadles; t++) {
      const shafts = tieup
        .map((row, shaft) => row[t] ? shaft + 1 : null)
        .filter(Boolean).join(",");
      if (shafts) L.push(`${t + 1}=${shafts}`);
    }

    // [TREADLING] — each pick → treadle (1-indexed)
    L.push("", "[TREADLING]");
    treadling.forEach((tr, pick) => L.push(`${pick + 1}=${tr + 1}`));
  }

  // [WARP COLORS] / [WEFT COLORS]
  if (palette.length) {
    L.push("", "[WARP COLORS]");
    for (let i = 1; i <= numEnds; i++)
      L.push(`${i}=${((i - 1) % palette.length) + 1}`);
    L.push("", "[WEFT COLORS]");
    for (let i = 1; i <= numPicks; i++)
      L.push(`${i}=${Math.min(palette.length, 2)}`);
  }

  return L.join("\n");
}

// ── JSON ──────────────────────────────────────────────────────────────────────
export function buildJSON(s) {
  return JSON.stringify({
    format:  "SuratTextileStudio_v2",
    created: new Date().toISOString(),
    design: {
      name:         s.designName,
      fabricType:   s.fabricType,
      zariType:     s.zariType,
      targetMarket: s.targetMarket,
      dimensions:   s.imageDimensions,
      technical: {
        EPI: s.epi, PPI: s.ppi, GSM: s.gsm, denier: s.denier,
        repeatW: s.repeatW, repeatH: s.repeatH, weaveType: s.weaveName,
      },
      palette: s.palette.map((c, i) => ({
        index: i, hex: c.hex, rgb: c.rgb,
        yarnName: c.yarnName || `Yarn ${i + 1}`,
        usage:    c.percentage,
        weaveType: c.weaveType,
      })),
      weaveMatrix:      s.weaveMatrix,
      aiAnalysis:       s.aiAnalysis,
      costEstimate:     s.costEstimate,
      marketSuggestion: s.marketSuggestion,
    },
  }, null, 2);
}

// ── CSV ───────────────────────────────────────────────────────────────────────
export function buildCSV(s) {
  const rows = [["#", "Hex", "R", "G", "B", "Yarn Name", "Usage%", "Weave", "g/m²", "Market Segment"]];
  s.palette.forEach((c, i) =>
    rows.push([
      i + 1, c.hex, ...(c.rgb || [0, 0, 0]),
      c.yarnName || `Yarn ${i + 1}`,
      c.percentage?.toFixed(1) || "0",
      c.weaveType || "plain",
      ((c.percentage || 0) * 0.85).toFixed(1),
      s.targetMarket || "Surat",
    ])
  );
  return rows.map((r) => r.join(",")).join("\n");
}
