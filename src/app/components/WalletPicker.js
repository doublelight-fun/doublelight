"use client";

const btnBase = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  width: "100%",
  padding: "18px 24px",
  background: "rgba(0,229,160,0.04)",
  border: "1px solid rgba(0,229,160,0.12)",
  borderRadius: "16px",
  cursor: "pointer",
  marginBottom: "12px",
  color: "#e6fff5",
  fontFamily: "Outfit",
  fontWeight: 700,
  fontSize: "16px",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  transition: "all .2s",
};

function hoverOn(e) {
  e.currentTarget.style.background = "rgba(0,229,160,0.1)";
  e.currentTarget.style.borderColor = "rgba(0,229,160,0.3)";
}
function hoverOff(e) {
  e.currentTarget.style.background = "rgba(0,229,160,0.04)";
  e.currentTarget.style.borderColor = "rgba(0,229,160,0.12)";
}

export default function WalletPicker({ onClose, onKeplr, onEVM }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg,#080f0c,#0c1a14,#080f0c)",
          border: "1px solid rgba(0,229,160,0.1)",
          borderRadius: "24px",
          padding: "32px",
          width: "420px",
          maxWidth: "92vw",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontFamily: "Outfit", fontSize: "20px", fontWeight: 700, color: "#e6fff5", marginBottom: "8px" }}>
            Connect Wallet
          </div>
          <div style={{ fontSize: "13px", color: "#2a5c47" }}>
            Choose how to connect to Republic AI
          </div>
        </div>

        <button
          onClick={() => { onClose(); onKeplr(); }}
          style={btnBase}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          Continue with Keplr
        </button>

        <button
          onClick={() => { onClose(); onEVM(); }}
          style={btnBase}
          onMouseEnter={hoverOn}
          onMouseLeave={hoverOff}
        >
          Continue with EVM Wallet
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "12px", background: "transparent",
            border: "none", color: "#2a5c47", fontFamily: "Outfit",
            fontWeight: 500, fontSize: "13px", cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
