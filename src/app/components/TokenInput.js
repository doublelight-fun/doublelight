"use client";

export default function TokenInput({ label, token, amount, onChange, onTokenClick, readOnly, dimmed }) {
  return (
    <div
      style={{
        background: "rgba(0,229,160,0.025)",
        border: "1px solid rgba(0,229,160,0.05)",
        borderRadius: "18px",
        padding: "18px",
        marginBottom: "4px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "JetBrains Mono" }}>
          Bal: {token.balance || "0.00"}
        </span>
      </div>

      <button
        onClick={onTokenClick}
        style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "8px 14px", background: "rgba(0,229,160,0.05)",
          border: "1px solid rgba(0,229,160,0.1)", borderRadius: "12px",
          color: "#e6fff5", fontFamily: "Outfit", fontWeight: 600,
          fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
          transition: "all .15s", marginBottom: "12px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.05)")}
      >
        <span
          style={{
            width: "26px", height: "26px", borderRadius: "50%",
            background: token.color + "18", border: "1px solid " + token.color + "33",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px",
          }}
        >
          {token.icon}
        </span>
        {token.symbol}
        <span style={{ fontSize: "10px", color: "#2a5c47" }}>▾</span>
      </button>

      <input
        type="text"
        placeholder="0.0"
        value={amount}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        style={{
          width: "100%", background: "transparent", border: "none", outline: "none",
          color: dimmed ? "#4a8a70" : "#e6fff5",
          fontSize: "28px", fontFamily: "Outfit", fontWeight: 700,
        }}
      />
    </div>
  );
}
