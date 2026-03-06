"use client";
import { useState } from "react";

function InfoRow({ label, value, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "Manrope" }}>{label}</span>
      {children || <span style={{ fontSize: "12px", color: "#5a9a80", fontFamily: "JetBrains Mono", fontWeight: 500 }}>{value}</span>}
    </div>
  );
}

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];

export default function SwapInfo({ from, to, shielded, fromAmt, receiveAmt, slippage, setSlippage }) {
  const [showSlippageMenu, setShowSlippageMenu] = useState(false);
  const [customSlippage, setCustomSlippage] = useState("");

  const rate = fromAmt && receiveAmt && parseFloat(fromAmt) > 0
    ? (parseFloat(receiveAmt) / parseFloat(fromAmt)).toFixed(6)
    : "...";

  const currentSlippage = slippage || 0.5;

  return (
    <div
      style={{
        marginTop: "14px",
        padding: "14px 16px",
        background: "rgba(0,229,160,0.025)",
        borderRadius: "14px",
        border: "1px solid rgba(0,229,160,0.07)",
      }}
    >
      <InfoRow label="Rate" value={`1 ${from.symbol} \u2248 ${rate} ${to.symbol}`} />
      <InfoRow label="Slippage">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setShowSlippageMenu(!showSlippageMenu)}
            style={{
              fontSize: "12px", color: "#00E5A0", fontFamily: "JetBrains Mono", fontWeight: 600,
              background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.15)",
              borderRadius: "8px", padding: "2px 8px", cursor: "pointer", transition: "all .15s",
            }}
          >
            {currentSlippage}%
          </button>
        </div>
      </InfoRow>

      {showSlippageMenu && (
        <div style={{
          marginTop: "8px", padding: "10px 12px", borderRadius: "10px",
          background: "rgba(0,229,160,0.03)", border: "1px solid rgba(0,229,160,0.08)",
        }}>
          <div style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "6px" }}>Set Slippage Tolerance</div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {SLIPPAGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => { setSlippage(opt); setShowSlippageMenu(false); setCustomSlippage(""); }}
                style={{
                  padding: "4px 10px", borderRadius: "8px", border: "none",
                  background: currentSlippage === opt ? "rgba(0,229,160,0.15)" : "rgba(0,229,160,0.04)",
                  color: currentSlippage === opt ? "#00E5A0" : "#4a8a70",
                  fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 600,
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                {opt}%
              </button>
            ))}
            <input
              type="text"
              placeholder="Custom"
              value={customSlippage}
              onChange={(e) => {
                setCustomSlippage(e.target.value);
                const val = parseFloat(e.target.value);
                if (val > 0 && val <= 50) setSlippage(val);
              }}
              style={{
                width: "60px", padding: "4px 8px", borderRadius: "8px",
                background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.1)",
                color: "#e6fff5", fontSize: "11px", fontFamily: "JetBrains Mono",
                outline: "none", textAlign: "center",
              }}
            />
            <span style={{ fontSize: "10px", color: "#2a5c47" }}>%</span>
          </div>
          {currentSlippage > 5 && (
            <div style={{ fontSize: "10px", color: "#FFD54F", fontFamily: "Manrope", marginTop: "6px" }}>
              High slippage — your trade may be frontrun
            </div>
          )}
        </div>
      )}

      <InfoRow label="Min. received" value={receiveAmt ? `${(parseFloat(receiveAmt) * (1 - currentSlippage / 100)).toFixed(6)} ${to.symbol}` : "..."} />
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
          <span style={{ fontSize: "12px", color: "#00E5A0", fontWeight: 600, fontFamily: "Outfit" }}>Privacy Mode</span>
          <span style={{ fontSize: "12px", color: "#00E5A0", fontFamily: "JetBrains Mono", fontWeight: 600 }}>Active</span>
        </div>
      )}
    </div>
  );
}
export { InfoRow };
