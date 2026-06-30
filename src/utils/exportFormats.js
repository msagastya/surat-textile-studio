// Generates the four export formats used by the Surat textile market.

export function buildJC5(s) {
  return [
    "[JC5_HEADER]",
    `DESIGN_NAME=${s.designName}`,
    `VERSION=5.0`,
    `FABRIC=${s.fabricType}`,
    `MARKET=${s.targetMarket || "Surat"}`,
    `ZARI=${s.zariType || "No Zari"}`,
    `WIDTH_EPI=${s.epi || 72}`,
    `HEIGHT_PPI=${s.ppi || 64}`,
    `GSM=${s.gsm || "120-250"}`,
    `DENIER=${s.denier || "150D"}`,
    `REPEAT_W=${s.repeatW || 80}`,
    `REPEAT_H=${s.repeatH || 80}`,
    `DATE=${new Date().toISOString()}`,
    `COLORS=${s.palette.length}`,
    "",
    "[COLOR_TABLE]",
    ...s.palette.map(
      (c, i) =>
        `C${String(i).padStart(3, "0")}=${c.rgb.join(",")},${
          c.yarnName || `YARN_${i + 1}`
        },${c.weaveType || "plain"},${c.percentage?.toFixed(2) || "0"}%`
    ),
    "",
    "[WEAVE_STRUCTURE]",
    ...s.weaveMatrix.map((row, i) => `ROW${i}=${row.join(",")}`),
    "",
    "[YARN_USAGE_KG_PER_100M]",
    ...s.palette.map((c, i) => `YARN${i}=${((c.percentage || 0) * 0.0085).toFixed(4)}`),
    "",
    "[END_JC5]",
  ].join("\n");
}

export function buildEP(s) {
  return [
    `% EP Electronic Pattern — Surat Textile Studio`,
    `% Design: ${s.designName} | Fabric: ${s.fabricType} | Zari: ${s.zariType || "No Zari"}`,
    `% EPI: ${s.epi} | PPI: ${s.ppi} | GSM: ${s.gsm} | Denier: ${s.denier}`,
    `% Target Market: ${s.targetMarket || "Surat"} | Date: ${new Date().toISOString()}`,
    "%%BeginSetup",
    `/FabricType (${s.fabricType}) def`,
    `/ColorCount ${s.palette.length} def`,
    `/RepeatWidth ${s.repeatW || 80} def`,
    `/RepeatHeight ${s.repeatH || 80} def`,
    `/EPI ${s.epi} def`,
    `/PPI ${s.ppi} def`,
    `/Zari (${s.zariType || "None"}) def`,
    "%%EndSetup",
    "%%BeginColorTable",
    ...s.palette.map((c, i) => {
      const [r, g, b] = c.rgb;
      return `/Color${i} { ${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(
        b / 255
      ).toFixed(3)} setrgbcolor } def % ${c.yarnName || `Yarn ${i + 1}`} ${
        c.percentage?.toFixed(1)
      }%`;
    }),
    "%%EndColorTable",
    "%%BeginWeaveData",
    ...s.weaveMatrix.slice(0, 8).map((row, i) => `/WeaveRow${i} [${row.join(" ")}] def`),
    "%%EndWeaveData",
    "%%EOF",
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
