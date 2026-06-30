// Gemini Vision API — used ONLY for image scanning (one call per image)
// Everything else (pricing, yarn, loom, market) is local rule-based

const KEY = import.meta.env.VITE_GEMINI_KEY || "";
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const geminiConfigured = () => !!KEY;

function prepareImage(imgEl, maxPx = 800) {
  const cv = document.createElement("canvas");
  const scale = Math.min(maxPx / imgEl.naturalWidth, maxPx / imgEl.naturalHeight, 1);
  cv.width = Math.round(imgEl.naturalWidth * scale);
  cv.height = Math.round(imgEl.naturalHeight * scale);
  cv.getContext("2d").drawImage(imgEl, 0, 0, cv.width, cv.height);
  return cv.toDataURL("image/jpeg", 0.82).split(",")[1];
}

export async function scanTextileImage(imgEl) {
  if (!KEY) throw new Error("VITE_GEMINI_KEY not configured");

  const base64 = prepareImage(imgEl);
  const prompt = `You are a senior textile expert from Surat, India. Analyze this fabric image precisely.
Return ONLY valid JSON (no markdown, no extra text):
{
  "fabricType": "exact fabric — one of: Banarasi Silk|Pure Silk|Art Silk|Georgette|Chiffon|Crepe|Satin|Velvet|Organza|Jacquard|Cotton|Tussar Silk|Linen|Unknown",
  "weaveType": "one of: Jacquard|Plain Weave|2/2 Twill|Satin Weave|Basket Weave|Unknown",
  "pattern": "specific pattern e.g. Floral Jaal|Geometric|Paisley|Buta Buti|Stripes|Border-Pallu|Abstract|Solid",
  "texture": "one of: Smooth & Lustrous|Rough|Silky|Matte|Sheer|Heavy|Lightweight",
  "zariType": "one of: Real Zari|Tested Zari|Imitation Zari|Tissue|None",
  "finish": "e.g. High Gloss|Matte|Semi-Gloss|Shimmery|Embossed",
  "dominantColors": [{"hex":"#xxxxxx","name":"shade name","pct":30}],
  "suggestedColorCount": 12,
  "marketTier": "one of: Budget|Mid-range|Premium|Luxury",
  "suggestedUse": "e.g. Saree|Dress Material|Dupatta|Furnishing|Lehenga|Kurta",
  "qualityScore": 82,
  "confidence": 0.87,
  "notes": "1-2 sentence expert observation about construction, finish, and market potential"
}
dominantColors: up to 6 colors by visual dominance, pct values must sum to ~100.`;

  const res = await fetch(`${ENDPOINT}?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: prompt },
        { inline_data: { mime_type: "image/jpeg", data: base64 } },
      ]}],
      generationConfig: { temperature: 0.05, maxOutputTokens: 700, topP: 0.85 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini ${res.status}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = raw.replace(/```json\n?|```\n?/g, "").trim();
  return JSON.parse(clean);
}
