StatBox from surat-textile-studio. Use via `window.SuratTextileStudio.StatBox` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### EPI

```jsx
() => <StatBox label="EPI" value={72} sub="ends/inch" />
```

### GSM

```jsx
() => <StatBox label="GSM" value={120} sub="g/m²" />
```

### CostPerMeter

```jsx
() => <StatBox label="Cost / Meter" value="₹285" sub="Georgette + Zari" />
```

### StatRow

```jsx
() => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 8, background: "#080706" }}>
    <StatBox label="Colors" value={16} />
    <StatBox label="EPI" value={72} />
    <StatBox label="GSM" value={120} />
    <StatBox label="Denier" value={75} sub="FDY" />
  </div>
)
```
