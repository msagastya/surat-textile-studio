Swatch from surat-textile-studio. Use via `window.SuratTextileStudio.Swatch` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### GoldSwatch

```jsx
() => (
  <div style={{ background: "#080706", padding: 12, display: "inline-flex" }}>
    <Swatch c={gold} i={0} onEdit={() => {}} />
  </div>
)
```

### PaletteRow

```jsx
() => (
  <div style={{ background: "#080706", padding: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
    {[gold, deep, cream, red, blue].map((c, i) => (
      <Swatch key={i} c={c} i={i} onEdit={() => {}} />
    ))}
  </div>
)
```

### BridalPalette

```jsx
() => (
  <div style={{ background: "#080706", padding: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
    {[
      { hex: "#8b2a2a", rgb: [139, 42, 42], percentage: 32, yarnName: "Bridal Red" },
      { hex: "#c8a84b", rgb: [200, 168, 75], percentage: 28, yarnName: "Real Zari" },
      { hex: "#f0e6d0", rgb: [240, 230, 208], percentage: 20, yarnName: "Ivory Silk" },
      { hex: "#2a6b3a", rgb: [42, 107, 58], percentage: 12, yarnName: "Emerald" },
      { hex: "#080706", rgb: [8, 7, 6], percentage: 8, yarnName: "Black Ground" },
    ].map((c, i) => (
      <Swatch key={i} c={c} i={i} onEdit={() => {}} />
    ))}
  </div>
)
```
