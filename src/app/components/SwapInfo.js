"use client";

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
      <span style={{ fontSize: "12px", color: "#2a5c47" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>{value}</span>
    </div>
  );
}

export default function SwapInfo({ from, to, shielded }) {
  const rate = from.symbol === "RAI" ? "2.45" : "0.408";

  return (
    <div
      style={{
        marginTop: "14px",
        padding: "12px 16px",
        background: "rgba(0,229,160,0.02)",
        borderRadius: "12px",
        border: "1px solid rgba(0,229,160,0.04)",
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
            marginTop: "6px", paddingTop: "6px",
            borderTop: "1px solid rgba(0,229,160,0.06)",
          }}
        >
          <span style={{ fontSize: "12px", color: "#00E5A0", fontWeight: 600 }}>
            🛡 Privacy Mode
          </span>
          <span style={{ fontSize: "12px", color: "#00E5A0", fontFamily: "JetBrains Mono" }}>
            Active
          </span>
        </div>
      )}
    </div>
  );
}

export { InfoRow };
