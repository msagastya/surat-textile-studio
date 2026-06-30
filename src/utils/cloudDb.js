// ── Google Sheets cloud database via Apps Script Web App ─────────────────────
// Set VITE_GAS_URL in .env.local (local) or Vercel env vars (production)
// Format: https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

const GAS_URL = import.meta.env.VITE_GAS_URL || "";

function isConfigured() {
  return !!GAS_URL && !GAS_URL.includes("PASTE");
}

async function gasGet(params) {
  if (!isConfigured()) throw new Error("Cloud DB not configured");
  const url = new URL(GAS_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Cloud DB error");
  return data;
}

async function gasPost(body) {
  if (!isConfigured()) throw new Error("Cloud DB not configured");
  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // GAS requires text/plain for CORS
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Cloud DB error");
  return data;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const cloudDb = {
  isConfigured,

  /** List all designs (no grid data — fast) */
  async list() {
    const { designs } = await gasGet({ action: "list" });
    return designs;
  },

  /** Load a single design including full grid data */
  async load(id) {
    const { design } = await gasGet({ action: "load", id });
    return design;
  },

  /** Save or update a design — id is optional (creates new if omitted) */
  async save(design) {
    const { id } = await gasPost({ action: "save", design });
    return id;
  },

  /** Delete a design by id */
  async delete(id) {
    await gasPost({ action: "delete", id });
  },

  /** Ping to verify the web app is reachable */
  async ping() {
    return gasGet({ action: "ping" });
  },
};
