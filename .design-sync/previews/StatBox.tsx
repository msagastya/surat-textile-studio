import { StatBox } from "surat-textile-studio";

export const EPI = () => <StatBox label="EPI" value={72} sub="ends/inch" />;

export const GSM = () => <StatBox label="GSM" value={120} sub="g/m²" />;

export const CostPerMeter = () => <StatBox label="Cost / Meter" value="₹285" sub="Georgette + Zari" />;

export const StatRow = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 8, background: "#080706" }}>
    <StatBox label="Colors" value={16} />
    <StatBox label="EPI" value={72} />
    <StatBox label="GSM" value={120} />
    <StatBox label="Denier" value={75} sub="FDY" />
  </div>
);
