"use client";

// Token icon as styled letter (cross-platform safe, no emoji issues)
function TokenIcon({ symbol, color, size = 32 }) {
  const letter = symbol === "WRAI" ? "wR" : symbol === "WETH" ? "wE" : symbol === "WBTC" ? "wB" : symbol.charAt(0);
  return (
    <div
      style={{
        width: size + "px", height: size + "px", borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}30, ${color}15)`,
        border: `1.5px solid ${color}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4 + "px", fontWeight: 800, color: color,
        fontFamily: "Outfit", flexShrink: 0,
        boxShadow: `0 0 12px ${color}20`,
      }}
    >
      {letter}
    </div>
  );
}

export default function TokenInput({ label, token, amount, onChange, onTokenClick, readOnly, dimmed }) {
  return (
    <div
      style={{
        background: "rgba(0,229,160,0.025)",
        border: "1px solid rgba(0,229,160,0.08)",
        borderRadius: "20px",
        padding: "16px 18px",
        marginBottom: "4px",
        transition: "border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
        <span style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500, fontFamily: "Manrope" }}>{label}</span>
        <span
          style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "JetBrains Mono", cursor: "pointer" }}
          onClick={() => !readOnly && onChange(token.balance || "0")}
          title="Click to use max"
        >
          Bal: <span style={{ color: "#4a8a70" }}>{token.balance || "0.00"}</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Amount input — takes up most space */}
        <input
          type="text"
          placeholder="0.0"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          style={{
            flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none",
            color: dimmed ? "#4a8a70" : "#e6fff5",
            fontSize: "32px", fontFamily: "Outfit", fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        />

        {/* Token selector button */}
        <button
          onClick={onTokenClick}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 14px 8px 8px",
            background: "rgba(0,229,160,0.07)",
            border: "1px solid rgba(0,229,160,0.14)",
            borderRadius: "14px",
            color: "#e6fff5", fontFamily: "Outfit", fontWeight: 700,
            fontSize: "15px", cursor: "pointer", whiteSpace: "nowrap",
            transition: "all .2s", flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,229,160,0.12)";
            e.currentTarget.style.borderColor = "rgba(0,229,160,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,229,160,0.06)";
            e.currentTarget.style.borderColor = "rgba(0,229,160,0.12)";
          }}
        >
          <TokenIcon symbol={token.symbol} color={token.color} size={28} />
          {token.symbol}
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: "2px" }}>
            <path d="M1 1L5 5L9 1" stroke="#2a5c47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export { TokenIcon };
