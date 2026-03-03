"use client";

function WalletOption({ label, description, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "14px",
        width: "100%", padding: "16px 20px",
        background: "rgba(0,229,160,0.02)",
        border: "1px solid rgba(0,229,160,0.08)",
        borderRadius: "16px", cursor: "pointer",
        marginBottom: "10px", color: "#e6fff5",
        transition: "all .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0,229,160,0.08)";
        e.currentTarget.style.borderColor = "rgba(0,229,160,0.2)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(0,229,160,0.02)";
        e.currentTarget.style.borderColor = "rgba(0,229,160,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: "42px", height: "42px", borderRadius: "12px",
          background: "linear-gradient(135deg, rgba(0,229,160,0.12), rgba(0,179,125,0.06))",
          border: "1px solid rgba(0,229,160,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px", fontWeight: 800, color: "#00E5A0", fontFamily: "Outfit",
          flexShrink: 0,
        }}
      >
        {label.includes("Keplr") ? "K" : "E"}
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>
          {label}
        </div>
        <div style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "Manrope" }}>
          {description}
        </div>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto", flexShrink: 0 }}>
        <path d="M9 18l6-6-6-6" stroke="#2a5c47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export default function WalletPicker({ onClose, onKeplr, onEVM }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg,#060d09,#0a1810,#060d09)",
          border: "1px solid rgba(0,229,160,0.08)",
          borderRadius: "24px", padding: "28px",
          width: "420px", maxWidth: "92vw",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,229,160,0.04)",
          animation: "slideUp .3s ease",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontFamily: "Outfit", fontSize: "20px", fontWeight: 700, color: "#e6fff5", marginBottom: "6px" }}>
            Connect Wallet
          </div>
          <div style={{ fontSize: "13px", color: "#2a5c47", fontFamily: "Manrope" }}>
            Choose how to connect to Republic AI
          </div>
        </div>

        <WalletOption
          label="Keplr Wallet"
          description="Cosmos native — rai1... address"
          onClick={() => { onClose(); onKeplr(); }}
        />
        <WalletOption
          label="EVM Wallet"
          description="MetaMask, Rabby, WalletConnect"
          onClick={() => { onClose(); onEVM(); }}
        />

        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "12px", marginTop: "4px",
            background: "transparent", border: "none",
            color: "#2a5c47", fontFamily: "Outfit", fontWeight: 500,
            fontSize: "13px", cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
