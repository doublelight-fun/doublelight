"use client";
import { evmToRai, raiToEvm, shortenAddress } from "../utils/bech32";

export default function Header({
  wallet,
  shielded,
  showWalletMenu,
  setShowWalletMenu,
  setShowWalletPicker,
  walletMenuRef,
  disconnect,
}) {
  const cosmosAddr = wallet
    ? wallet.address.startsWith("0x")
      ? evmToRai(wallet.address)
      : wallet.address
    : "";
  const evmAddr = wallet
    ? wallet.address.startsWith("0x")
      ? wallet.address
      : raiToEvm(wallet.address)
    : "";

  return (
    <header
      className="dl-header"
      style={{
        position: "relative",
        zIndex: 20,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 36px",
        borderBottom: "1px solid rgba(0,229,160,0.06)",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, #00E5A0, #00B37D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: 900, color: "#050b08", fontFamily: "Outfit",
          }}
        >
          DL
        </div>
        <div>
          <div
            className="dl-header-brand"
            style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}
          >
            double<span style={{ color: "#00E5A0" }}>light</span>
          </div>
          <div
            style={{
              fontSize: "10px", color: "#2a5c47", fontWeight: 600,
              letterSpacing: "1.5px", textTransform: "uppercase",
            }}
          >
            Private Swap · Republic AI
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Network badge */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "10px",
            background: wallet ? "rgba(0,229,160,0.06)" : "rgba(255,80,80,0.06)",
            border: `1px solid ${wallet ? "rgba(0,229,160,0.15)" : "rgba(255,80,80,0.15)"}`,
            fontSize: "11px", fontFamily: "JetBrains Mono", fontWeight: 500,
            color: wallet ? "#00E5A0" : "#ff5050",
          }}
        >
          <div
            style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: wallet ? "#00E5A0" : "#ff5050",
              boxShadow: wallet ? "0 0 6px #00E5A0" : "0 0 6px #ff5050",
            }}
          />
          {wallet ? "Republic AI" : "Not connected"}
        </div>

        {/* Shielded badge */}
        {shielded && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 12px", borderRadius: "10px",
              background: "rgba(0,229,160,0.06)",
              border: "1px solid rgba(0,229,160,0.12)",
              fontSize: "11px", fontFamily: "JetBrains Mono", fontWeight: 500,
              color: "#00E5A0",
            }}
          >
            🛡 Shielded
          </div>
        )}

        {/* Connect button / wallet info */}
        <div
          ref={walletMenuRef}
          onClick={(e) => {
            if (e.target.closest("[data-dropdown]")) return;
            wallet ? setShowWalletMenu((prev) => !prev) : setShowWalletPicker(true);
          }}
          style={{ position: "relative" }}
        >
          <div
            role="button"
            tabIndex={0}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: wallet
                ? "rgba(0,229,160,0.08)"
                : "linear-gradient(135deg, #00E5A0, #00B37D)",
              border: wallet ? "1px solid rgba(0,229,160,0.15)" : "none",
              borderRadius: "12px", padding: "10px 20px",
              color: wallet ? "#00E5A0" : "#050b08",
              fontFamily: "Outfit", fontWeight: 700, fontSize: "13px",
              cursor: "pointer", transition: "all .2s",
            }}
          >
            {wallet ? (
              <>
                <div
                  style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "#00E5A0", boxShadow: "0 0 6px #00E5A0",
                  }}
                />
                {shortenAddress(wallet.address)}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <circle cx="18" cy="16" r="1" />
                </svg>
                Connect Wallet
              </>
            )}
          </div>

          {/* Dropdown menu */}
          {showWalletMenu && wallet && (
            <div
              data-dropdown="true"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                width: "300px",
                background: "linear-gradient(160deg,#080f0c,#0c1a14)",
                border: "1px solid rgba(0,229,160,0.1)",
                borderRadius: "16px", padding: "16px", zIndex: 50,
                boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              }}
            >
              <div style={{ fontSize: "13px", fontFamily: "Outfit", fontWeight: 700, color: "#e6fff5", marginBottom: "12px" }}>
                Wallet Info
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "JetBrains Mono" }}>Cosmos</span>
                <span style={{ fontSize: "11px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>
                  {shortenAddress(cosmosAddr)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "JetBrains Mono" }}>EVM</span>
                <span style={{ fontSize: "11px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>
                  {shortenAddress(evmAddr)}
                </span>
              </div>
              <div style={{ borderTop: "1px solid rgba(0,229,160,0.06)", paddingTop: "10px" }}>
                <button
                  onClick={disconnect}
                  style={{
                    width: "100%", padding: "10px",
                    background: "rgba(255,80,80,0.08)",
                    border: "1px solid rgba(255,80,80,0.15)",
                    borderRadius: "10px", color: "#ff5050",
                    fontFamily: "Outfit", fontWeight: 600, fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
