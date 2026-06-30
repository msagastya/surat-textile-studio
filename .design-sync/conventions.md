# Surat Textile Studio — Design Conventions

## Aesthetic identity

A professional textile-industry tool designed for Surat's silk and synthetic fabric trade. The visual language is **dark craft**: near-black backgrounds with warm brown undertones, gold typography and accents referencing zari metallic thread, monospace lettering for a technical/workshop feel. Every screen should feel like a well-lit loom room at night — precise, purposeful, nothing ornamental.

## Token palette

| Token | Value | When to use |
|-------|-------|-------------|
| `--bg` / `T.bg` | `#080706` | Page background — the deepest layer |
| `--surface` / `T.surf` | `#100f0d` | Card/panel fills, input backgrounds |
| `--panel` / `T.panel` | `#181614` | Nested panels, secondary card level |
| `--border` / `T.border` | `#2a2620` | All dividers, card outlines |
| `--gold` / `T.gold` | `#c8a84b` | Primary accent — active states, headings, values, CTA buttons |
| `--gold-dim` / `T.goldDim` | `#6b5a24` | Subdued gold — hover backgrounds, selection, badges |
| `--cream` / `T.cream` | `#f0e6d0` | On-gold text, high-emphasis body copy |
| `--muted` / `T.muted` | `#6e6456` | Labels, sub-text, inactive tab text |
| `--text` / `T.text` | `#e4d8c4` | Default body text |
| `--text-dim` / `T.textDim` | `#9a8e7e` | Secondary/disabled text |
| `--red` / `T.red` | `#8b2a2a` | Destructive actions, bridal red accent |
| `--green` / `T.green` | `#2a6b3a` | Positive/confirm actions |
| `--blue` / `T.blue` | `#2a4a8b` | Royal blue accent, informational |

## Typography

- **Body / UI labels**: `JetBrains Mono, "SF Mono", Consolas, monospace` — 12–13 px, used for everything data-dense (stats, hex codes, labels)
- **Section headers**: Georgia serif — 15 px, gold (`T.gold`), letter-spacing 1 — used sparingly for panel titles only
- **Labels (ALL CAPS)**: 10 px monospace, muted (`T.muted`), `letter-spacing: 1`, `text-transform: uppercase`
- Never use a sans-serif typeface; this system is exclusively monospace + serif

## Component usage patterns

### `<StatBox label value sub?>`
Displays one textile metric. Always on dark `T.bg` or `T.panel` background. `value` renders large gold; `label` and `sub` render muted monospace caps. Use in a 4-column grid (`gridTemplateColumns: repeat(4,1fr)`) for the standard EPI / GSM / Denier / Cost row.

### `<Swatch c i onEdit?>`
One color entry from a palette. `c` is `{hex, rgb, percentage, yarnName}`. Renders the swatch square (the actual color fill), hex code, percentage, and yarn name in monospace. Lay out as a flex row with `gap: 8` and `flexWrap: wrap` on a `T.bg` background. The first swatch (i=0) is always the dominant color.

### `<Tab label icon? badge? active onClick>`
Navigation pill. Active tab: gold background with dark text. Inactive: transparent with muted text. `badge` (number) shows a red counter pill. `icon` is a small emoji or SVG prefix. Always render tabs in a horizontal flex row — never stack vertically.

### `<WeaveGrid matrix cellSize?>`
Technical weave draft. `matrix` is a 2D array of 0/1 — 1 = warp up (gold cell), 0 = warp down (dark cell). `cellSize` defaults to 16 px. Add a muted monospace label above the grid (`PLAIN WEAVE`, `TWILL 2/2`, `JACQUARD DRAFT`, etc.). Sits on a `T.bg` background with 16 px padding.

### `<Header designName fabricType zariType targetMarket ...setters>`
Full-width application header. Dark `T.bg` background. Left: amber-gradient logo icon + `SURAT TEXTILE STUDIO` in spaced caps + subtitle metadata row. Right: four inline form controls (text input for design name, select for fabric type, select for zari type, select for target market) — all use the `sel`/`inp` token styles.

## Layout conventions

- Page background: always `T.bg` (`#080706`) — never white, never gray
- Cards: `background: T.panel`, `border: 1px solid T.border`, `borderRadius: 8`, `padding: 16`
- Inputs and selects: `background: T.surf`, `border: 1px solid T.border`, `borderRadius: 6`, `padding: 7px 10px`, `fontSize: 12`
- Buttons: use `btn(variant)` helper — `"gold"` for primary CTA, `"red"` for destructive, `"green"` for confirm, default panel for secondary
- Spacing unit is 8 px; common values: 4 (tight), 8 (default gap), 16 (card padding), 24 (section gap)
- All forms use a stacked `label → input` pattern with an ALL-CAPS `lbl` style label

## Tone guidance for the design agent

- **Dense, not sparse**: real tools show lots of data — fill space with actual values
- **Gold = important**: reserve gold color for the thing the user most needs to see (a measurement value, an active selection, a primary action)
- **Avoid decorative elements**: no gradients on data areas, no illustration, no icon-heavy UI — this is an instrument, not a marketing page
- **Every screen is a workflow step**: Import → Palette → Recolor → Weave → Repeat → Yarn → Analysis → Market → Export — design new screens as steps in that chain
