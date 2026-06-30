# Surat Textile Studio

AI-powered textile design studio built for the Surat (Gujarat, India) Jacquard,
Banarasi, and saree market. Import a fabric photo, extract the yarn color
palette, draft a weave structure, estimate cost in ₹, and export production
files in JC5, EP, JSON, or CSV format.

## What's inside

```
surat-textile-studio/
├── index.html              # Vite entry HTML
├── package.json            # Dependencies & npm scripts
├── vite.config.js          # Vite dev server config
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx             # React root
    ├── App.jsx              # Top-level app state & layout
    ├── components/          # One file per UI piece (tabs, swatches, etc.)
    ├── data/                 # Surat fabric/market/weave reference data
    ├── utils/                # Color science, export builders, AI service
    └── styles/               # Global CSS + theme tokens
```

## Requirements

- **Node.js 18+** (check with `node -v`). If you don't have it, install from
  [nodejs.org](https://nodejs.org) or via Homebrew: `brew install node`.

## Run it on your Mac (localhost)

1. Unzip this folder and open Terminal, then `cd` into it:
   ```bash
   cd path/to/surat-textile-studio
   ```
2. Install dependencies (only needed once):
   ```bash
   npm install
   ```
3. Start the local dev server:
   ```bash
   npm run dev
   ```
4. Your browser should open automatically at **http://localhost:5173**.
   If it doesn't, open that URL manually.

To stop the server, go back to Terminal and press `Ctrl + C`.

## Enabling AI features (optional)

The **AI Analysis** and **AI Recolor** tabs call the Anthropic API directly
from your browser. Since this app runs entirely on your machine with no
backend server, you provide your own Anthropic API key:

1. Get a key at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
2. Paste it into the **API Key** box on the **Import** tab.
3. It's saved only in your browser's local storage — it never leaves your
   machine except to talk directly to Anthropic's API.

Without a key, every other feature (color extraction, weave drafting, repeat
detection, yarn costing, JC5/EP/JSON/CSV export) still works fully offline.

## Building for production / sharing

```bash
npm run build
```

This outputs a static site into `dist/` that you can host anywhere (Vercel,
Netlify, GitHub Pages, or your own server) or open directly:

```bash
npm run preview
```

## Tech stack

- React 18 + Vite 5 (fast dev server, instant hot reload)
- No external UI framework — all styling is hand-built CSS-in-JS using a
  shared theme token file (`src/styles/theme.js`)
- K-means clustering for color/yarn extraction, written from scratch in
  `src/utils/colorUtils.js`
- Export builders for JC5 (NedGraphics-compatible), EP (PostScript-style
  electronic pattern), JSON, and CSV in `src/utils/exportFormats.js`

## Surat market data

`src/data/suratFabrics.js` and `src/data/weavePresets.js` contain the
fabric/yarn/market reference tables (Georgette, Chiffon, Banarasi Silk,
Jacquard, etc. with real EPI/PPI/GSM/Denier specs and the major Surat
wholesale markets: Ring Road, New Textile Market, Millennium Textile Market,
Bombay Market, and more). Edit these files directly to add your own fabrics,
markets, or update pricing.
