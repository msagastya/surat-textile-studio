// AI requests go through the local Express proxy (server.js) which uses
// ANTHROPIC_API_KEY from the environment — no browser-side key needed.

async function callClaude(messages, maxTokens = 1200) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Proxy error ${res.status}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

/** Resize an <img> element onto a canvas and return base64 JPEG data. */
export function imageToBase64(imgEl, maxSize = 600) {
  const canvas = document.createElement("canvas");
  const scale = Math.min(maxSize / imgEl.naturalWidth, maxSize / imgEl.naturalHeight, 1);
  canvas.width = Math.round(imgEl.naturalWidth * scale);
  canvas.height = Math.round(imgEl.naturalHeight * scale);
  canvas.getContext("2d").drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88).split(",")[1];
}

export async function runFabricAnalysis({ base64, fabricType, zariType, targetMarket, palette, epi, ppi, gsm, denier }) {
  const palDesc = palette
    .slice(0, 10)
    .map((c, i) => `${i + 1}. ${c.hex} (${c.percentage?.toFixed(1)}%)`)
    .join(", ");

  const prompt = `You are a senior textile design expert from Surat, India with 20+ years experience in the Indian saree, dress material, and fashion fabric industry.

Selected fabric type: ${fabricType} | Zari: ${zariType} | Target market: ${targetMarket}
Extracted palette (top 10): ${palDesc || "Not yet extracted"}
EPI: ${epi} | PPI: ${ppi} | GSM: ${gsm} | Denier: ${denier}

Analyze this fabric/design image and give a DETAILED SURAT-MARKET technical report:

1. FABRIC IDENTIFICATION: Exact fabric type (Georgette/Chiffon/Satin/Jacquard/Banarasi/etc), construction
2. DESIGN ANALYSIS: Pattern type (floral/geometric/paisley/bootah/jaal/border-pallu), repeat structure, body vs border
3. TECHNICAL SPECS: Recommended EPI, PPI, GSM, Denier, yarn count (if woven)
4. ZARI WORK: Type of zari detected (real/tested/fancy), zari coverage %, placement (body/border/pallu)
5. SURAT MARKET FIT: Which Surat market this will sell best in, price range (₹/meter wholesale), season fit
6. LOOM SETUP: Dobby/Jacquard, number of shafts/hooks, repeat dimensions, any special requirements
7. YARN SUGGESTIONS: Specific yarn types (FDY/DTY/Spun/Zari), denier for each zone
8. CATALOG POTENTIAL: Rating 1-10, which catalog segment (party wear/bridal/daily wear/export)
9. COST ESTIMATE: Yarn cost + weaving cost + finishing cost per meter in Indian market
10. IMPROVEMENT TIPS: 3 specific suggestions to increase the design's market value in Surat

Be specific to the Surat textile ecosystem. Use Indian textile terminology.`;

  return callClaude([
    {
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
        { type: "text", text: prompt },
      ],
    },
  ]);
}

export async function runAIRecolor({ prompt, palette, fabricType, targetMarket }) {
  const text = `You are a Surat textile colorist. The current palette has ${palette.length} colors: ${palette
    .map((c, i) => `${i + 1}:${c.hex}`)
    .join(", ")}

The designer wants: "${prompt}"

Generate a new color palette for the Surat textile market (${fabricType}, ${targetMarket}) that matches this request.
Consider Indian fashion colors: festival colors, bridal shades, daily wear, export trends.

Respond ONLY with valid JSON array, no markdown, no explanation:
[{"hex":"#RRGGBB","yarnName":"description"},...]
Exactly ${palette.length} colors.`;

  const raw = await callClaude([{ role: "user", content: text }]);
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
