WeaveGrid from surat-textile-studio. Use via `window.SuratTextileStudio.WeaveGrid` (bundle loaded from the root `_ds_bundle.js`).

## Examples

### PlainWeave

```jsx
() => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <div style={{ color: "#6e6456", fontSize: 10, fontFamily: "monospace", marginBottom: 6 }}>PLAIN WEAVE</div>
    <WeaveGrid matrix={plain} cellSize={16} />
  </div>
)
```

### TwillWeave

```jsx
() => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <div style={{ color: "#6e6456", fontSize: 10, fontFamily: "monospace", marginBottom: 6 }}>TWILL 2/2</div>
    <WeaveGrid matrix={twill} cellSize={16} />
  </div>
)
```

### JacquardDraft

```jsx
() => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <div style={{ color: "#6e6456", fontSize: 10, fontFamily: "monospace", marginBottom: 6 }}>JACQUARD DRAFT</div>
    <WeaveGrid matrix={jacquard} cellSize={14} />
  </div>
)
```

### SmallCell

```jsx
() => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <WeaveGrid matrix={jacquard} cellSize={8} />
  </div>
)
```
