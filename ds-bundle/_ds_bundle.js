/* @ds-bundle: {"namespace":"SuratTextileStudio","components":[{"name":"Header","sourcePath":"components/general/Header/Header.jsx"},{"name":"StatBox","sourcePath":"components/general/StatBox/StatBox.jsx"},{"name":"Swatch","sourcePath":"components/general/Swatch/Swatch.jsx"},{"name":"Tab","sourcePath":"components/general/Tab/Tab.jsx"},{"name":"WeaveGrid","sourcePath":"components/general/WeaveGrid/WeaveGrid.jsx"}],"sourceHashes":{"components/general/Header/Header.jsx":"2dde18d49a01","components/general/Header/Header.d.ts":"cc630e4b2262","components/general/Header/Header.prompt.md":"398aa9babc17","components/general/StatBox/StatBox.jsx":"feae3a37f711","components/general/StatBox/StatBox.d.ts":"99cd624ac8a7","components/general/StatBox/StatBox.prompt.md":"7245255748dd","components/general/Swatch/Swatch.jsx":"1b3006e965b2","components/general/Swatch/Swatch.d.ts":"09d84f191188","components/general/Swatch/Swatch.prompt.md":"1ef6914b442c","components/general/Tab/Tab.jsx":"0299d05577fc","components/general/Tab/Tab.d.ts":"ae8195777188","components/general/Tab/Tab.prompt.md":"a3dce6293b6a","components/general/WeaveGrid/WeaveGrid.jsx":"bc87d2372c36","components/general/WeaveGrid/WeaveGrid.d.ts":"8355918c2687","components/general/WeaveGrid/WeaveGrid.prompt.md":"95344a049338"},"inlinedExternals":[],"builtBy":"cc-design-sync"} */
var SuratTextileStudio = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.jsx
  var index_exports = {};
  __export(index_exports, {
    Header: () => Header,
    StatBox: () => StatBox,
    Swatch: () => Swatch,
    T: () => T,
    Tab: () => Tab,
    WeaveGrid: () => WeaveGrid,
    btn: () => btn,
    card: () => card,
    h2s: () => h2s,
    inp: () => inp,
    lbl: () => lbl,
    sel: () => sel
  });

  // src/styles/theme.js
  var T = {
    bg: "#080706",
    surf: "#100f0d",
    panel: "#181614",
    border: "#2a2620",
    gold: "#c8a84b",
    goldDim: "#6b5a24",
    cream: "#f0e6d0",
    muted: "#6e6456",
    red: "#8b2a2a",
    green: "#2a6b3a",
    blue: "#2a4a8b",
    text: "#e4d8c4",
    textDim: "#9a8e7e"
  };
  var btn = (variant = "gold", disabled = false) => ({
    background: variant === "gold" ? T.gold : variant === "red" ? T.red : variant === "green" ? T.green : variant === "blue" ? T.blue : T.panel,
    color: variant === "gold" ? T.bg : T.text,
    border: `1px solid ${variant === "gold" ? T.gold : variant === "red" ? T.red : variant === "green" ? T.green : variant === "blue" ? T.blue : T.border}`,
    padding: "8px 16px",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fontWeight: 700,
    opacity: disabled ? 0.45 : 1,
    transition: "opacity 0.15s, transform 0.1s"
  });
  var inp = {
    background: T.surf,
    border: `1px solid ${T.border}`,
    color: T.text,
    padding: "7px 10px",
    borderRadius: 6,
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    width: "100%",
    boxSizing: "border-box"
  };
  var sel = { ...inp, cursor: "pointer" };
  var lbl = {
    color: T.muted,
    fontSize: 10,
    fontFamily: "var(--font-mono)",
    letterSpacing: 1,
    textTransform: "uppercase",
    display: "block",
    marginBottom: 4
  };
  var card = {
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: 16
  };
  var h2s = {
    color: T.gold,
    fontFamily: "var(--font-serif)",
    fontSize: 15,
    margin: "0 0 14px 0",
    letterSpacing: 1
  };

  // src/components/Swatch.jsx
  function Swatch({ c, i, onEdit }) {
    const [r, g, b] = c.rgb;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: () => onEdit(i),
        style: {
          background: c.hex,
          borderRadius: 6,
          padding: "8px 6px",
          cursor: "pointer",
          border: `2px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          minWidth: 68,
          transition: "transform 0.15s"
        },
        onMouseEnter: (e) => e.currentTarget.style.transform = "scale(1.08)",
        onMouseLeave: (e) => e.currentTarget.style.transform = "scale(1)"
      },
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, fontFamily: "var(--font-mono)", color: luma > 128 ? "#000" : "#fff", fontWeight: 700 } }, c.hex.toUpperCase()),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: luma > 128 ? "#333" : "#ccc" } }, c.percentage?.toFixed(1), "%"),
      /* @__PURE__ */ React.createElement(
        "span",
        {
          style: {
            fontSize: 9,
            color: luma > 128 ? "#555" : "#aaa",
            maxWidth: 62,
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }
        },
        c.yarnName || `Yarn ${i + 1}`
      )
    );
  }

  // src/components/StatBox.jsx
  function StatBox({ label, value, sub }) {
    return /* @__PURE__ */ React.createElement("div", { style: { ...card, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: T.muted, fontSize: 10 } }, label), /* @__PURE__ */ React.createElement("div", { style: { color: T.gold, fontSize: 20, fontWeight: 700, margin: "4px 0" } }, value), sub && /* @__PURE__ */ React.createElement("div", { style: { color: T.textDim, fontSize: 10 } }, sub));
  }

  // src/components/Tab.jsx
  function Tab({ id, label, active, onClick, badge }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onClick(id),
        style: {
          padding: "9px 16px",
          border: "none",
          cursor: "pointer",
          background: "transparent",
          color: active ? T.gold : T.muted,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: active ? 700 : 400,
          borderBottom: active ? `2px solid ${T.gold}` : "2px solid transparent",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
          position: "relative"
        }
      },
      label,
      badge ? /* @__PURE__ */ React.createElement(
        "span",
        {
          style: {
            marginLeft: 5,
            background: T.red,
            color: "#fff",
            borderRadius: 10,
            padding: "1px 6px",
            fontSize: 9
          }
        },
        badge
      ) : null
    );
  }

  // src/components/WeaveGrid.jsx
  function WeaveGrid({ matrix, cellSize = 14 }) {
    if (!matrix?.length) return null;
    return /* @__PURE__ */ React.createElement("div", { style: { display: "inline-block", border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden" } }, matrix.map((row, ri) => /* @__PURE__ */ React.createElement("div", { key: ri, style: { display: "flex" } }, row.map((v, ci) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: ci,
        style: {
          width: cellSize,
          height: cellSize,
          background: v ? T.gold : T.bg,
          border: `0.5px solid ${T.border}`
        }
      }
    )))));
  }

  // src/data/suratFabrics.js
  var SURAT_FABRICS = {
    Georgette: {
      denier: "75D/100D",
      weave: "plain",
      EPI: 96,
      PPI: 88,
      GSM: "60-80",
      yarn: "Polyester FDY",
      markets: ["Ring Road", "MTM"],
      use: "Sarees, Dupattas",
      baseCost: 45
    },
    Chiffon: {
      denier: "30D/50D",
      weave: "plain",
      EPI: 80,
      PPI: 72,
      GSM: "40-60",
      yarn: "Polyester FDY",
      markets: ["Sahara Darwaja", "MTM"],
      use: "Sarees, Scarves",
      baseCost: 38
    },
    Crepe: {
      denier: "75D",
      weave: "crepe",
      EPI: 100,
      PPI: 90,
      GSM: "70-110",
      yarn: "Polyester DTY",
      markets: ["NTM", "Avadh"],
      use: "Dress material, Suits",
      baseCost: 55
    },
    Satin: {
      denier: "75D/150D",
      weave: "satin5",
      EPI: 120,
      PPI: 80,
      GSM: "80-130",
      yarn: "Polyester FDY",
      markets: ["Bombay Market"],
      use: "Sarees, Evening wear",
      baseCost: 65
    },
    Organza: {
      denier: "20D/30D",
      weave: "plain",
      EPI: 60,
      PPI: 55,
      GSM: "25-45",
      yarn: "Polyester FDY",
      markets: ["MTM", "Kohinoor"],
      use: "Dupattas, Sarees",
      baseCost: 70
    },
    Velvet: {
      denier: "150D",
      weave: "velvet",
      EPI: 64,
      PPI: 140,
      GSM: "280-400",
      yarn: "Polyester FDY + Cut pile",
      markets: ["Ring Road"],
      use: "Blouses, Lehengas",
      baseCost: 180
    },
    "Net / Tulle": {
      denier: "40D",
      weave: "net",
      EPI: 48,
      PPI: 48,
      GSM: "20-35",
      yarn: "Nylon/Polyester",
      markets: ["MTM"],
      use: "Dupattas, Lehengas",
      baseCost: 35
    },
    "Raw Silk / Art Silk": {
      denier: "100D",
      weave: "plain",
      EPI: 90,
      PPI: 80,
      GSM: "80-120",
      yarn: "Viscose/Silk",
      markets: ["Bombay Market", "Old City"],
      use: "Banarasi sarees",
      baseCost: 200
    },
    Jacquard: {
      denier: "150D/300D",
      weave: "jacquard",
      EPI: 72,
      PPI: 64,
      GSM: "120-250",
      yarn: "Polyester + Zari",
      markets: ["Ring Road", "NTM"],
      use: "Sarees, Shawls",
      baseCost: 120
    },
    "Banarasi Silk": {
      denier: "100D",
      weave: "jacquard",
      EPI: 84,
      PPI: 76,
      GSM: "180-300",
      yarn: "Pure Silk + Zari",
      markets: ["Bombay Market"],
      use: "Bridal sarees",
      baseCost: 380
    },
    "Lycra/Spandex Blend": {
      denier: "70D+40D Lycra",
      weave: "plain",
      EPI: 100,
      PPI: 96,
      GSM: "120-180",
      yarn: "Nylon+Lycra",
      markets: ["Pandesara", "Sachin"],
      use: "Leggings, Activewear",
      baseCost: 90
    },
    Dobby: {
      denier: "100D",
      weave: "dobby",
      EPI: 80,
      PPI: 72,
      GSM: "90-150",
      yarn: "Polyester DTY",
      markets: ["NTM", "Avadh"],
      use: "Sarees, Dress material",
      baseCost: 65
    },
    "Linen Blend": {
      denier: "Ne 30/1",
      weave: "plain",
      EPI: 60,
      PPI: 55,
      GSM: "130-180",
      yarn: "Linen/Cotton blend",
      markets: ["Sarvoday"],
      use: "Shirting, Dress material",
      baseCost: 85
    },
    Rayon: {
      denier: "75D/150D",
      weave: "plain",
      EPI: 80,
      PPI: 72,
      GSM: "80-130",
      yarn: "Viscose Rayon",
      markets: ["Ring Road", "NTM"],
      use: "Kurtis, Dress material",
      baseCost: 40
    }
  };
  var SURAT_MARKETS = [
    { name: "Ring Road / Sahara Darwaja", specialty: "Sarees, Dress Material, Synthetics", zone: "Central" },
    { name: "New Textile Market (NTM)", specialty: "Largest volume \u2014 Designer Sarees, Suits, Embroidery", zone: "Ring Road" },
    { name: "Millennium Textile Market (MTM)", specialty: "Premium Designer, Bridal Lehengas, Fancy Fabrics", zone: "Ring Road" },
    { name: "Bombay Market (Old & New)", specialty: "Wedding Sarees, Heavy Work, Traditional", zone: "Old City" },
    { name: "Avadh Textile Market", specialty: "Sarees, Fancy Fabric, Export Quality", zone: "Ring Road" },
    { name: "Kohinoor Textile Market", specialty: "Designer Fabric, Bridal", zone: "Ring Road" },
    { name: "Sarvoday Market", specialty: "Shirting, Suiting, Men's Fabric", zone: "Umarwada" },
    { name: "Pandesara / Sachin GIDC", specialty: "Manufacturing, Dyeing, Processing Units", zone: "Industrial" }
  ];
  var ZARI_TYPES = [
    "Real Zari (Silver+Gold)",
    "Tested Zari",
    "Fancy Zari",
    "Metallic Zari",
    "Stone Zari",
    "No Zari"
  ];

  // src/components/Header.jsx
  function Header({
    designName,
    setDesignName,
    fabricType,
    setFabricType,
    zariType,
    setZariType,
    targetMarket,
    setTargetMarket
  }) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          background: T.surf,
          borderBottom: `1px solid ${T.border}`,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 0" } }, /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            width: 36,
            height: 36,
            background: `linear-gradient(135deg, ${T.gold}, ${T.red})`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20
          }
        },
        "\u{1F9F5}"
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: T.gold, fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 700, letterSpacing: 2 } }, "SURAT TEXTILE STUDIO"), /* @__PURE__ */ React.createElement("div", { style: { color: T.muted, fontSize: 9, letterSpacing: 3 } }, "AI-POWERED \xB7 JC5 \xB7 EP \xB7 JACQUARD \xB7 DOBBY \xB7 SURAT MARKET"))),
      /* @__PURE__ */ React.createElement("div", { style: { marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", padding: "8px 0" } }, /* @__PURE__ */ React.createElement(
        "input",
        {
          value: designName,
          onChange: (e) => setDesignName(e.target.value),
          style: { ...inp, width: 180 },
          placeholder: "Design name..."
        }
      ), /* @__PURE__ */ React.createElement("select", { value: fabricType, onChange: (e) => setFabricType(e.target.value), style: { ...sel, width: 150 } }, Object.keys(SURAT_FABRICS).map((f) => /* @__PURE__ */ React.createElement("option", { key: f }, f))), /* @__PURE__ */ React.createElement("select", { value: zariType, onChange: (e) => setZariType(e.target.value), style: { ...sel, width: 160 } }, ZARI_TYPES.map((z) => /* @__PURE__ */ React.createElement("option", { key: z }, z))), /* @__PURE__ */ React.createElement("select", { value: targetMarket, onChange: (e) => setTargetMarket(e.target.value), style: { ...sel, width: 200 } }, SURAT_MARKETS.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.name }, m.name))))
    );
  }
  return __toCommonJS(index_exports);
})();
window.SuratTextileStudio=SuratTextileStudio.__dsMainNs?Object.assign({},SuratTextileStudio,SuratTextileStudio.__dsMainNs,{__dsMainNs:undefined}):SuratTextileStudio;
