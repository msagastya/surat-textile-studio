# Design Sync Notes

## First sync completed 2026-06-30

**Project**: Surat Textile Studio  
**URL**: https://claude.ai/design/p/006b113b-a570-4d1e-ae38-dce49f6d20c8  
**Shape**: package (no Storybook; authored previews in `.design-sync/previews/`)

### Components synced (5/5 SHIP)
- **Header** — full-width app header with logo + 4 inline form controls
- **StatBox** — single textile metric card (label / value / sub)
- **Swatch** — one palette color entry with hex, %, yarn name
- **Tab** — navigation pill; active/inactive/badge variants
- **WeaveGrid** — pixel weave draft grid from a 0/1 matrix

### Build notes
- No `dist/` — uses synth-entry `src/index.jsx` passed via `--entry` flag
- Build command must run from project root (previews resolve relative to CWD)
- `@types/react` not installed — `.d.ts` emit shows `any` for React utility types; acceptable for now
- `runtimeFontPrefixes: ["JetBrains Mono"]` — system font, no @font-face needed
- `readmeHeader: ".design-sync/conventions.md"` — conventions header stitched into README.md

### Re-sync command
```bash
(cd /Users/msagastya/Desktop/surat-textile-studio && node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules node_modules --entry src/index.jsx --out ds-bundle)
```
Then validate:
```bash
(cd /Users/msagastya/Desktop/surat-textile-studio && PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright" node .ds-sync/package-validate.mjs ds-bundle)
```
