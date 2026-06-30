import { useState, useRef, useCallback } from "react";
import { useBreakpoint } from "./hooks/useBreakpoint.js";
import { T } from "./styles/theme.js";
import { SURAT_FABRICS, SURAT_MARKETS, ZARI_TYPES, ZARI_COST_BUMP } from "./data/suratFabrics.js";
import { WEAVE_PRESETS } from "./data/weavePresets.js";
import { extractPalette, detectRepeat, hexToRgb, analyzeHarmony } from "./utils/colorUtils.js";
import { buildJC5, buildEP, buildJSON, buildCSV, buildWIF, downloadFile } from "./utils/exportFormats.js";
import { imageToBase64, runFabricAnalysis, runAIRecolor as aiRecolorCall } from "./utils/aiService.js";
import { scanTextileImage } from "./utils/geminiApi.js";
import { genThreading, genTieup, genTreadling } from "./utils/weaveUtils.js";

import Header from "./components/Header.jsx";
import Tab from "./components/Tab.jsx";
import ImportTab from "./components/ImportTab.jsx";
import PaletteTab from "./components/PaletteTab.jsx";
import RecolorTab from "./components/RecolorTab.jsx";
import ColorwaysTab from "./components/ColorwaysTab.jsx";
import WeaveTab from "./components/WeaveTab.jsx";
import DrawdownTab from "./components/DrawdownTab.jsx";
import SimulateTab from "./components/SimulateTab.jsx";
import RepeatTab from "./components/RepeatTab.jsx";
import YarnTab from "./components/YarnTab.jsx";
import AnalysisTab from "./components/AnalysisTab.jsx";
import MarketTab from "./components/MarketTab.jsx";
import ExportTab from "./components/ExportTab.jsx";
import LayerTab from "./components/LayerTab.jsx";
import DesignCanvas from "./components/DesignCanvas.jsx";
import DesignLibraryTab from "./components/DesignLibraryTab.jsx";

const TABS = [
  ["import",    "Import"],
  ["palette",   "Palette"],
  ["recolor",   "Recolor"],
  ["colorways", "Colorways"],
  ["canvas",    "Canvas"],
  ["library",   "Library"],
  ["weave",     "Weave"],
  ["drawdown",  "Draw-down"],
  ["simulate",  "Simulate"],
  ["repeat",    "Repeat"],
  ["layers",    "Layers"],
  ["yarn",      "Yarn & Cost"],
  ["analysis",  "AI Analysis"],
  ["market",    "Market"],
  ["export",    "Export"],
];

// Separator positions (tab index where a separator appears before that tab)
// Groups: Color(0-3) | Design(4-5) | Weave(6-9) | Craft(10-11) | Analysis(12-13) | Export(14)
const SEPARATORS = new Set([4, 6, 10, 12, 14]);

const DEF_SHAFTS = 4;
const DEF_TREADLES = 4;
const DEF_ENDS = 16;
const DEF_PICKS = 16;

export default function App() {
  const [tab, setTab] = useState("import");
  const [image, setImage] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [palette, setPalette] = useState([]);
  const [colorCount, setColorCount] = useState(16);
  const [fabricType, setFabricType] = useState("Georgette");
  const [designName, setDesignName] = useState("Untitled Surat Design");
  const [weaveName, setWeaveName] = useState("jacquard");
  const [weaveMatrix, setWeaveMatrix] = useState(WEAVE_PRESETS.jacquard.matrix);
  const [zariType, setZariType] = useState("Tested Zari");
  const [targetMarket, setTargetMarket] = useState(SURAT_MARKETS[0].name);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [repeatW, setRepeatW] = useState(80);
  const [repeatH, setRepeatH] = useState(80);
  const [repeatCandidates, setRepeatCandidates] = useState([]);
  const [repeatMode, setRepeatMode] = useState("straight");
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [exportFmt, setExportFmt] = useState("jc5");
  const [aiColorizePrompt, setAiColorizePrompt] = useState("");
  const [aiColorizeBusy, setAiColorizeBusy] = useState(false);
  const [costEstimate, setCostEstimate] = useState(null);
  const [marketSuggestion, setMarketSuggestion] = useState("");
  const [designNotes, setDesignNotes] = useState("");

  // ── Gemini vision scan ─────────────────────────────────────────────────────
  const [geminiData, setGeminiData] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // ── Color harmony analysis ─────────────────────────────────────────────────
  const [harmonyData, setHarmonyData] = useState(null);

  // ── Colorways ──────────────────────────────────────────────────────────────
  const [colorways, setColorways] = useState([]);

  // ── Draw-down / weave draft ────────────────────────────────────────────────
  const [numShafts, setNumShafts] = useState(DEF_SHAFTS);
  const [numTreadles, setNumTreadles] = useState(DEF_TREADLES);
  const [numEnds, setNumEnds] = useState(DEF_ENDS);
  const [numPicks, setNumPicks] = useState(DEF_PICKS);
  const [loomType, setLoomType] = useState("dobby");
  const [threading, setThreading] = useState(() => genThreading(DEF_ENDS, DEF_SHAFTS, "straight"));
  const [tieup, setTieup] = useState(() => genTieup(DEF_SHAFTS, DEF_TREADLES, "twill-z"));
  const [treadling, setTreadling] = useState(() => genTreadling(DEF_PICKS, DEF_TREADLES, "straight"));

  // ── Simulation yarn assignment ─────────────────────────────────────────────
  const [warpYarnIdx, setWarpYarnIdx] = useState(0);
  const [weftYarnIdx, setWeftYarnIdx] = useState(1);

  // ── Design canvas / point paper ────────────────────────────────────────────
  const [gridW, setGridW] = useState(32);
  const [gridH, setGridH] = useState(32);
  const [grid, setGrid] = useState(() => Array(32 * 32).fill(0));
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const fab = SURAT_FABRICS[fabricType] || SURAT_FABRICS["Jacquard"];
  const epi = fab.EPI;
  const ppi = fab.PPI;
  const gsm = fab.GSM;
  const denier = fab.denier;

  const loadImage = useCallback((file) => {
    const url = URL.createObjectURL(file);
    setImage(url);
    setGeminiData(null); // clear previous scan when new image loaded
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  }, []);

  const extractColors = useCallback(() => {
    if (!imgEl) return;
    setProcessing(true);
    setTimeout(() => {
      const cv = canvasRef.current;
      const ctx = cv.getContext("2d");
      // Cap render size at 1200px for speed while keeping accuracy
      const MAX = 1200;
      const scale = Math.min(MAX / imgEl.naturalWidth, MAX / imgEl.naturalHeight, 1);
      cv.width  = Math.round(imgEl.naturalWidth  * scale);
      cv.height = Math.round(imgEl.naturalHeight * scale);
      ctx.drawImage(imgEl, 0, 0, cv.width, cv.height);
      const imageData = ctx.getImageData(0, 0, cv.width, cv.height);

      // ── k-means++ LAB extraction ──────────────────────────────────────────
      const pal = extractPalette(imageData.data, colorCount);
      setPalette(pal);
      setHarmonyData(analyzeHarmony(pal));
      setColorways([{ name: "Base Design", palette: pal.map((c) => ({ ...c })) }]);

      // ── Autocorrelation repeat detection ─────────────────────────────────
      const { repeatW: rW, repeatH: rH, candidates } = detectRepeat(
        imageData.data, cv.width, cv.height,
      );
      // Scale repeat back to original image coordinates
      const invScale = 1 / scale;
      setRepeatCandidates(candidates.map((c) => ({
        width:      Math.round(c.width  * invScale),
        height:     Math.round(c.height * invScale),
        confidence: c.confidence,
      })));
      setRepeatW(Math.round(rW * invScale));
      setRepeatH(Math.round(rH * invScale));

      // ── Cost estimate ─────────────────────────────────────────────────────
      const baseCost = fab.baseCost || 80;
      const zariBump = ZARI_COST_BUMP[zariType] || 0;
      setCostEstimate({ perMeter: baseCost + zariBump, gsm, epi, ppi, denier, yarns: colorCount, fabricType, market: targetMarket });

      setProcessing(false);
      setTab("palette");
    }, 30);
  }, [imgEl, colorCount, fabricType, zariType, targetMarket, gsm, epi, ppi, denier, fab]);

  const runAI = useCallback(async () => {
    if (!imgEl) return;
    setAiLoading(true);
    setAiAnalysis("");
    try {
      const base64 = imageToBase64(imgEl, 600);
      const text = await runFabricAnalysis({ base64, fabricType, zariType, targetMarket, palette, epi, ppi, gsm, denier });
      setAiAnalysis(text || "No analysis returned.");
      setMarketSuggestion(targetMarket);
      setTab("analysis");
    } catch (e) {
      setAiAnalysis("Error: " + e.message);
    }
    setAiLoading(false);
  }, [imgEl, fabricType, zariType, targetMarket, palette, epi, ppi, gsm, denier]);

  const scanImage = useCallback(async () => {
    if (!imgEl) return;
    setGeminiLoading(true);
    setGeminiData(null);
    try {
      const result = await scanTextileImage(imgEl);
      setGeminiData(result);
      // Auto-apply Gemini suggestions to app state
      if (result.fabricType && SURAT_FABRICS[result.fabricType]) setFabricType(result.fabricType);
      if (result.suggestedColorCount) setColorCount(result.suggestedColorCount);
      if (result.zariType && result.zariType !== "Unknown") setZariType(result.zariType);
    } catch (e) {
      console.error("[gemini]", e.message);
    }
    setGeminiLoading(false);
  }, [imgEl]);

  const runRecolor = useCallback(async () => {
    if (!aiColorizePrompt.trim() || !palette.length) return;
    setAiColorizeBusy(true);
    try {
      const newColors = await aiRecolorCall({ prompt: aiColorizePrompt, palette, fabricType, targetMarket });
      setPalette((prev) =>
        prev.map((c, i) => ({
          ...c,
          hex: newColors[i]?.hex || c.hex,
          rgb: hexToRgb(newColors[i]?.hex || c.hex),
          yarnName: newColors[i]?.yarnName || c.yarnName,
        }))
      );
    } catch (e) {
      alert("AI Recolor failed: " + e.message);
    }
    setAiColorizeBusy(false);
  }, [aiColorizePrompt, palette, fabricType, targetMarket]);

  const doExport = useCallback(() => {
    const state = {
      designName, fabricType, zariType, targetMarket, imageDimensions,
      palette, weaveMatrix, weaveName, epi, ppi, gsm, denier,
      repeatW, repeatH, aiAnalysis, costEstimate, marketSuggestion,
      threading, tieup, treadling, numShafts, numTreadles,
      grid, gridW, gridH,
    };
    if (exportFmt === "all") {
      downloadFile(buildJC5(state), `${designName}.jc5`, "text/plain");
      downloadFile(buildEP(state), `${designName}.ep`, "text/plain");
      downloadFile(buildJSON(state), `${designName}.json`, "application/json");
      downloadFile(buildCSV(state), `${designName}_palette.csv`, "text/csv");
      downloadFile(buildWIF(state), `${designName}.wif`, "text/plain");
    } else if (exportFmt === "jc5") downloadFile(buildJC5(state), `${designName}.jc5`, "text/plain");
    else if (exportFmt === "ep")  downloadFile(buildEP(state), `${designName}.ep`, "text/plain");
    else if (exportFmt === "json") downloadFile(buildJSON(state), `${designName}.json`, "application/json");
    else if (exportFmt === "wif") downloadFile(buildWIF(state), `${designName}.wif`, "text/plain");
    else downloadFile(buildCSV(state), `${designName}_palette.csv`, "text/csv");
  }, [designName, fabricType, zariType, targetMarket, imageDimensions, palette, weaveMatrix, weaveName, epi, ppi, gsm, denier, repeatW, repeatH, aiAnalysis, costEstimate, marketSuggestion, exportFmt, threading, tieup, treadling, numShafts, numTreadles, grid, gridW, gridH]);

  const { isMobile, isTablet } = useBreakpoint();

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "var(--font-mono)", fontSize: 13, display: "flex", flexDirection: "column" }}>
      <Header
        designName={designName} setDesignName={setDesignName}
        fabricType={fabricType} setFabricType={setFabricType}
        zariType={zariType} setZariType={setZariType}
        targetMarket={targetMarket} setTargetMarket={setTargetMarket}
      />

      {/* Tab bar */}
      <div className="tab-bar" style={{
        background: `linear-gradient(180deg, #120e1e 0%, ${T.surf} 100%)`,
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
        boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
      }}>
        {TABS.map(([id, label], i) => (
          <span key={id} style={{ display: "inline-flex", alignItems: "center" }}>
            {SEPARATORS.has(i) && !isMobile && (
              <span style={{ width: 1, height: 22, background: T.borderBr, margin: "0 4px", display: "inline-block", alignSelf: "center", borderRadius: 1, opacity: 0.6 }} />
            )}
            <Tab
              id={id}
              label={label}
              active={tab === id}
              onClick={setTab}
              badge={
                id === "palette" ? palette.length || null
                : id === "colorways" ? colorways.length || null
                : id === "canvas" ? (grid.filter(Boolean).length || null)
                : id === "library" ? null
                : null
              }
            />
          </span>
        ))}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="page-content">
        {tab === "import" && (
          <ImportTab
            image={image} loadImage={loadImage} imageDimensions={imageDimensions}
            fabricType={fabricType} zariType={zariType}
            colorCount={colorCount} setColorCount={setColorCount}
            fab={fab} epi={epi} ppi={ppi} gsm={gsm} denier={denier}
            processing={processing} extractColors={extractColors}
            aiLoading={aiLoading} runAI={runAI}
            palette={palette} repeatW={repeatW} repeatH={repeatH}
            geminiData={geminiData} geminiLoading={geminiLoading} scanImage={scanImage}
          />
        )}

        {tab === "palette" && (
          <PaletteTab
            palette={palette} setPalette={setPalette}
            editIdx={editIdx} setEditIdx={setEditIdx}
            image={image} processing={processing} extractColors={extractColors} setTab={setTab}
            harmonyData={harmonyData}
          />
        )}

        {tab === "recolor" && (
          <RecolorTab
            palette={palette} setEditIdx={setEditIdx}
            aiColorizePrompt={aiColorizePrompt} setAiColorizePrompt={setAiColorizePrompt}
            runAIRecolor={runRecolor} aiColorizeBusy={aiColorizeBusy} image={image}
          />
        )}

        {tab === "colorways" && (
          <ColorwaysTab
            palette={palette} setPalette={setPalette}
            colorways={colorways} setColorways={setColorways}
          />
        )}

        {tab === "canvas" && (
          <DesignCanvas
            grid={grid} setGrid={setGrid}
            gridW={gridW} setGridW={setGridW}
            gridH={gridH} setGridH={setGridH}
            palette={palette}
            activeColorIdx={activeColorIdx} setActiveColorIdx={setActiveColorIdx}
          />
        )}

        {tab === "library" && (
          <DesignLibraryTab
            grid={grid} setGrid={setGrid}
            gridW={gridW} setGridW={setGridW}
            gridH={gridH} setGridH={setGridH}
            palette={palette} setPalette={setPalette}
            designName={designName} setDesignName={setDesignName}
            fabricType={fabricType} zariType={zariType}
          />
        )}

        {tab === "weave" && (
          <WeaveTab
            weaveName={weaveName} setWeaveName={setWeaveName}
            weaveMatrix={weaveMatrix} setWeaveMatrix={setWeaveMatrix}
            fabricType={fabricType} fab={fab}
          />
        )}

        {tab === "drawdown" && (
          <DrawdownTab
            threading={threading} setThreading={setThreading}
            tieup={tieup} setTieup={setTieup}
            treadling={treadling} setTreadling={setTreadling}
            numShafts={numShafts} setNumShafts={setNumShafts}
            numTreadles={numTreadles} setNumTreadles={setNumTreadles}
            numEnds={numEnds} setNumEnds={setNumEnds}
            numPicks={numPicks} setNumPicks={setNumPicks}
            loomType={loomType} setLoomType={setLoomType}
            warpYarnIdx={warpYarnIdx} weftYarnIdx={weftYarnIdx}
            palette={palette}
          />
        )}

        {tab === "simulate" && (
          <SimulateTab
            weaveMatrix={weaveMatrix}
            palette={palette}
            warpYarnIdx={warpYarnIdx} setWarpYarnIdx={setWarpYarnIdx}
            weftYarnIdx={weftYarnIdx} setWeftYarnIdx={setWeftYarnIdx}
          />
        )}

        {tab === "repeat" && (
          <RepeatTab
            repeatW={repeatW} setRepeatW={setRepeatW}
            repeatH={repeatH} setRepeatH={setRepeatH}
            repeatCandidates={repeatCandidates}
            image={image} previewRef={previewRef}
            repeatMode={repeatMode} setRepeatMode={setRepeatMode}
            palette={palette} weaveMatrix={weaveMatrix}
          />
        )}

        {tab === "layers" && (
          <LayerTab palette={palette} fabricType={fabricType} />
        )}

        {tab === "yarn" && (
          <YarnTab
            costEstimate={costEstimate} palette={palette}
            fabricType={fabricType} zariType={zariType}
            gsm={gsm} epi={epi} ppi={ppi} denier={denier}
            fab={fab} designNotes={designNotes} setDesignNotes={setDesignNotes}
          />
        )}

        {tab === "analysis" && (
          <AnalysisTab
            geminiData={geminiData} geminiLoading={geminiLoading} scanImage={scanImage}
            image={image} fabricType={fabricType} zariType={zariType}
            palette={palette} epi={epi} ppi={ppi} gsm={gsm}
            repeatW={repeatW} repeatH={repeatH}
            targetMarket={targetMarket} colorCount={colorCount}
          />
        )}

        {tab === "market" && (
          <MarketTab targetMarket={targetMarket} setTargetMarket={setTargetMarket} />
        )}

        {tab === "export" && (
          <ExportTab
            exportFmt={exportFmt} setExportFmt={setExportFmt} doExport={doExport}
            palette={palette} designName={designName} fabricType={fabricType}
            zariType={zariType} targetMarket={targetMarket}
            epi={epi} ppi={ppi} gsm={gsm} denier={denier}
            weaveName={weaveName} repeatW={repeatW} repeatH={repeatH}
            aiAnalysis={aiAnalysis} costEstimate={costEstimate}
          />
        )}
      </div>
    </div>
  );
}
