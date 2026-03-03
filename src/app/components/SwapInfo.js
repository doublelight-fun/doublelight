"use client";

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "Manrope" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "#5a9a80", fontFamily: "JetBrains Mono", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function SwapInfo({ from, to, shielded }) {
  const rate = from.symbol === "RAI" ? "2.45" : "0.408";

  return (
    <div
      style={{
        marginTop: "14px",
        padding: "14px 16px",
        background: "rgba(0,229,160,0.015)",
        borderRadius: "14px",
        border: "1px solid rgba(0,229,160,0.05)",
      }}
    >
      <InfoRow label="Rate" value={`1 ${from.symbol} \u2248 ${rate} ${to.symbol}`} />
      <InfoRow label="Slippage" value="0.5%" />
      <InfoRow label="Gas Fee" value="~0.001 RAI" />
      <InfoRow label="Network" value="Republic AI Testnet" />
      {shielded && (
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            marginTop: "8px", paddingTop: "8px",
            borderTop: "1px solid rgba(0,229,160,0.06)",
          }}
        >
          <span style={{ fontSize: "12px", color: "#00E5A0", fontWeight: 600, fontFamily: "Outfit" }}>
            Privacy Mode
          </span>
          <span style={{ fontSize: "12px", color: "#00E5A0", fontFamily: "JetBrains Mono", fontWeight: 600 }}>
            Active
          </span>
        </div>
      )}
    </div>
  );
}

export { InfoRow };
