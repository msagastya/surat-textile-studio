Tab from surat-textile-studio. Use via `window.SuratTextileStudio.Tab` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### TabBar

```jsx
() => (
  <div style={{ display: "flex", background: "#100f0d", borderBottom: "1px solid #2a2620" }}>
    <Tab id="import" label="📥 Import" active={false} onClick={() => {}} />
    <Tab id="palette" label="🎨 Palette" active={true} onClick={() => {}} badge={16} />
    <Tab id="export" label="💾 Export" active={false} onClick={() => {}} />
  </div>
)
```

### ActiveTab

```jsx
() => (
  <div style={{ display: "flex", background: "#100f0d" }}>
    <Tab id="active" label="Active Tab" active={true} onClick={() => {}} />
  </div>
)
```

### InactiveTab

```jsx
() => (
  <div style={{ display: "flex", background: "#100f0d" }}>
    <Tab id="inactive" label="Inactive Tab" active={false} onClick={() => {}} />
  </div>
)
```

### WithBadge

```jsx
() => (
  <div style={{ display: "flex", background: "#100f0d" }}>
    <Tab id="badge" label="Palette" active={false} onClick={() => {}} badge={8} />
  </div>
)
```
