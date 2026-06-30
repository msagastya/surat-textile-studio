import { Tab } from "surat-textile-studio";

export const TabBar = () => (
  <div style={{ display: "flex", background: "#100f0d", borderBottom: "1px solid #2a2620" }}>
    <Tab id="import" label="📥 Import" active={false} onClick={() => {}} />
    <Tab id="palette" label="🎨 Palette" active={true} onClick={() => {}} badge={16} />
    <Tab id="export" label="💾 Export" active={false} onClick={() => {}} />
  </div>
);

export const ActiveTab = () => (
  <div style={{ display: "flex", background: "#100f0d" }}>
    <Tab id="active" label="Active Tab" active={true} onClick={() => {}} />
  </div>
);

export const InactiveTab = () => (
  <div style={{ display: "flex", background: "#100f0d" }}>
    <Tab id="inactive" label="Inactive Tab" active={false} onClick={() => {}} />
  </div>
);

export const WithBadge = () => (
  <div style={{ display: "flex", background: "#100f0d" }}>
    <Tab id="badge" label="Palette" active={false} onClick={() => {}} badge={8} />
  </div>
);
