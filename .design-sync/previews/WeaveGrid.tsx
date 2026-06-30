import { WeaveGrid } from "surat-textile-studio";

const plain = [
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
];

const twill = [
  [1, 1, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 0, 0, 1, 1, 0],
  [0, 0, 1, 1, 0, 0, 1, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
];

const jacquard = [
  [1, 0, 1, 1, 0, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 1],
  [1, 1, 0, 1, 0, 0, 1, 1],
  [0, 1, 0, 0, 1, 1, 1, 0],
  [1, 0, 1, 1, 0, 1, 0, 1],
  [1, 1, 0, 0, 1, 0, 1, 1],
];

export const PlainWeave = () => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <div style={{ color: "#6e6456", fontSize: 10, fontFamily: "monospace", marginBottom: 6 }}>PLAIN WEAVE</div>
    <WeaveGrid matrix={plain} cellSize={16} />
  </div>
);

export const TwillWeave = () => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <div style={{ color: "#6e6456", fontSize: 10, fontFamily: "monospace", marginBottom: 6 }}>TWILL 2/2</div>
    <WeaveGrid matrix={twill} cellSize={16} />
  </div>
);

export const JacquardDraft = () => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <div style={{ color: "#6e6456", fontSize: 10, fontFamily: "monospace", marginBottom: 6 }}>JACQUARD DRAFT</div>
    <WeaveGrid matrix={jacquard} cellSize={14} />
  </div>
);

export const SmallCell = () => (
  <div style={{ background: "#080706", padding: 16, display: "inline-block" }}>
    <WeaveGrid matrix={jacquard} cellSize={8} />
  </div>
);
