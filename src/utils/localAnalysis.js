// Local rule-based analysis engine — zero API calls
// Combines geminiData (vision) + fabric specs + palette for full professional report

const PRICE = {
  "Banarasi Silk": { Budget:[800,1200],  "Mid-range":[1200,2500], Premium:[2500,5000],  Luxury:[5000,15000] },
  "Pure Silk":     { Budget:[600,1000],  "Mid-range":[1000,2000], Premium:[2000,4500],  Luxury:[4500,12000] },
  "Jacquard":      { Budget:[300,600],   "Mid-range":[600,1200],  Premium:[1200,2500],  Luxury:[2500,6000]  },
  "Georgette":     { Budget:[120,250],   "Mid-range":[250,450],   Premium:[450,800],    Luxury:[800,1800]   },
  "Chiffon":       { Budget:[100,200],   "Mid-range":[200,380],   Premium:[380,700],    Luxury:[700,1500]   },
  "Crepe":         { Budget:[150,280],   "Mid-range":[280,500],   Premium:[500,950],    Luxury:[950,2000]   },
  "Satin":         { Budget:[200,380],   "Mid-range":[380,700],   Premium:[700,1400],   Luxury:[1400,3500]  },
  "Velvet":        { Budget:[300,550],   "Mid-range":[550,1000],  Premium:[1000,2200],  Luxury:[2200,5000]  },
  "Art Silk":      { Budget:[80,180],    "Mid-range":[180,350],   Premium:[350,650],    Luxury:[650,1200]   },
  "Organza":       { Budget:[150,300],   "Mid-range":[300,600],   Premium:[600,1200],   Luxury:[1200,2800]  },
  "Cotton":        { Budget:[60,150],    "Mid-range":[150,300],   Premium:[300,600],    Luxury:[600,1200]   },
  "Tussar Silk":   { Budget:[400,800],   "Mid-range":[800,1600],  Premium:[1600,3500],  Luxury:[3500,8000]  },
  "Linen":         { Budget:[120,250],   "Mid-range":[250,500],   Premium:[500,1000],   Luxury:[1000,2500]  },
  default:         { Budget:[100,250],   "Mid-range":[250,500],   Premium:[500,1000],   Luxury:[1000,2500]  },
};

const ZARI_ADD = { "Real Zari":800, "Tested Zari":200, "Imitation Zari":80, "Tissue":150, None:0 };

const LOOM = {
  "Banarasi Silk": { loom:"Pit Loom / Jacquard",          hooks:"400–800",   shafts:"N/A",  rpm:"30–60"   },
  "Jacquard":      { loom:"Electronic Jacquard",           hooks:"1200–2400", shafts:"N/A",  rpm:"60–120"  },
  "Pure Silk":     { loom:"Power Loom / Pit Loom",         hooks:"—",         shafts:"4–8",  rpm:"60–120"  },
  "Georgette":     { loom:"Rapier Loom",                   hooks:"—",         shafts:"4–6",  rpm:"200–350" },
  "Chiffon":       { loom:"Air-jet / Rapier Loom",         hooks:"—",         shafts:"4",    rpm:"250–400" },
  "Crepe":         { loom:"Rapier / Water-jet",            hooks:"—",         shafts:"4–6",  rpm:"200–300" },
  "Satin":         { loom:"Rapier Loom",                   hooks:"—",         shafts:"5–8",  rpm:"150–250" },
  "Velvet":        { loom:"Velvet Loom (double-cloth)",    hooks:"—",         shafts:"6–8",  rpm:"40–80"   },
  "Art Silk":      { loom:"Rapier / Dobby Loom",           hooks:"—",         shafts:"4–12", rpm:"120–220" },
  "Organza":       { loom:"Rapier Loom",                   hooks:"—",         shafts:"4",    rpm:"180–280" },
  "Tussar Silk":   { loom:"Handloom / Power Loom",         hooks:"—",         shafts:"4–8",  rpm:"40–100"  },
  "Linen":         { loom:"Rapier Loom",                   hooks:"—",         shafts:"4–6",  rpm:"100–200" },
  default:         { loom:"Rapier Loom",                   hooks:"—",         shafts:"4–8",  rpm:"120–220" },
};

const YARN = {
  "Georgette":     { warp:"75D/72F FDY",          weft:"75D/72F DTY (crepe twist 2000 TPM)", type:"Polyester FDY+DTY" },
  "Chiffon":       { warp:"75D/72F FDY",          weft:"75D/36F FDY (low twist)",            type:"Polyester FDY"     },
  "Crepe":         { warp:"75D/72F DTY",          weft:"150D/144F DTY (high twist 3000 TPM)",type:"Polyester DTY"     },
  "Satin":         { warp:"75D/72F FDY (bright)", weft:"100D/144F FDY (bright)",             type:"Poly FDY Bright"   },
  "Jacquard":      { warp:"75D FDY",              weft:"75D FDY + Tested/Real Zari",         type:"FDY + Zari"        },
  "Banarasi Silk": { warp:"20/22D Mulberry Silk", weft:"20/22D Silk + Real Zari",            type:"Mulberry Silk + Real Zari" },
  "Pure Silk":     { warp:"20/22D Mulberry Silk", weft:"20/22D Mulberry Silk",               type:"100% Mulberry Silk"},
  "Art Silk":      { warp:"75D FDY",              weft:"100D Viscose DTY",                   type:"Viscose/Poly FDY"  },
  "Velvet":        { warp:"75D FDY (ground)",     weft:"75D DTY (pile cut)",                 type:"FDY+DTY pile"      },
  "Organza":       { warp:"20D Silk / 30D Poly",  weft:"20D Silk / 30D Poly",               type:"Fine Silk / Poly"  },
  "Tussar Silk":   { warp:"28/30D Tussar Silk",   weft:"28/30D Tussar Silk",                 type:"Wild Tussar Silk"  },
  "Linen":         { warp:"16–32 Ne Linen",       weft:"16–32 Ne Linen",                     type:"100% Linen"        },
  default:         { warp:"75D/72F FDY",          weft:"75D/72F DTY",                        type:"Polyester FDY+DTY" },
};

const CATALOG = {
  "Banarasi Silk": ["Bridal Saree", "Festive Wear", "Luxury Export"],
  "Pure Silk":     ["Premium Saree", "Bridal Trousseau", "Corporate Gift"],
  "Jacquard":      ["Party Wear", "Designer Saree", "Dress Material"],
  "Georgette":     ["Daily Wear Saree", "Party Wear", "Dress Material"],
  "Chiffon":       ["Summer Collection", "Casual Saree", "Dupatta"],
  "Crepe":         ["Office Wear", "Casual Dress", "Trouser Material"],
  "Satin":         ["Evening Wear", "Occasion Wear", "Blouse Piece"],
  "Velvet":        ["Winter Collection", "Bridal Lehenga", "Furnishing"],
  "Art Silk":      ["Value Saree", "Festival Wear", "Daily Use"],
  "Organza":       ["Bridal Dupatta", "Designer Saree", "Occasion Wear"],
  "Tussar Silk":   ["Handloom Collection", "Ethnic Wear", "Kurti Material"],
  "Linen":         ["Summer Kurta", "Office Wear", "Export Market"],
  default:         ["General Catalog", "Mixed Collection", "Local Market"],
};

const MARKETS = {
  Budget:      ["Ring Road Wholesale, Surat", "Ahmedabad Cloth Market", "Mumbai Mangaldas Market"],
  "Mid-range": ["Sahara Darwaja, Surat", "Delhi Chandni Chowk", "Bangalore Commercial Street"],
  Premium:     ["Varachha Premium Zone, Surat", "Mumbai Fashion Street", "Delhi Select Citywalk"],
  Luxury:      ["Mumbai Linking Road", "Delhi Dilli Haat", "Boutique Export"],
};

const YARN_RATE = { // ₹ per kg
  "Banarasi Silk":3800, "Pure Silk":3600, "Tussar Silk":2800,
  "Jacquard":520, "Georgette":480, "Chiffon":460, "Crepe":490, "Satin":500,
  "Velvet":800, "Art Silk":300, "Organza":420, "Linen":380, default:490,
};

export function buildLocalAnalysis({ fabricType, zariType, palette, epi, ppi, gsm, repeatW, repeatH, geminiData, targetMarket, colorCount }) {
  const ft    = geminiData?.fabricType || fabricType;
  const zt    = geminiData?.zariType   || zariType;
  const tier  = geminiData?.marketTier || "Mid-range";
  const qs    = geminiData?.qualityScore || 72;
  const conf  = geminiData?.confidence   || 0;

  const priceTable = PRICE[ft] || PRICE.default;
  const priceRange = priceTable[tier] || priceTable["Mid-range"];
  const zariBump   = ZARI_ADD[zt] || 0;
  const priceMin   = priceRange[0] + zariBump;
  const priceMax   = priceRange[1] + zariBump;

  const yarnRate = YARN_RATE[ft] || YARN_RATE.default;
  const yarnKg   = (gsm / 1000) * 1.15;
  const yarnCost = Math.round(yarnKg * yarnRate);
  const weaveCost = epi > 120 ? 90 : epi > 80 ? 55 : 32;
  const zariCost  = Math.round(zariBump * 0.35);
  const finCost   = Math.round(gsm * 0.09);
  const totalCost = yarnCost + weaveCost + zariCost + finCost;
  const margin    = Math.round((((priceMin + priceMax) / 2) - totalCost) / ((priceMin + priceMax) / 2) * 100);

  return {
    ft, zt, tier, qs, conf,
    priceMin, priceMax,
    yarnCost, weaveCost, zariCost, finCost, totalCost, margin,
    loom:     LOOM[ft]    || LOOM.default,
    yarn:     YARN[ft]    || YARN.default,
    catalog:  CATALOG[ft] || CATALOG.default,
    markets:  MARKETS[tier] || MARKETS["Mid-range"],
    rating:   Math.min(10, Math.round(qs / 10)),
    repeatSummary: repeatW && repeatH ? `${repeatW} × ${repeatH} px` : "—",
    colorsSummary: palette.length ? `${palette.length} yarns extracted` : `${colorCount} target yarns`,
  };
}
