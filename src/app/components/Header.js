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
    ? wallet.address.startsWith("0x") ? evmToRai(wallet.address) : wallet.address
    : "";
  const evmAddr = wallet
    ? wallet.address.startsWith("0x") ? wallet.address : raiToEvm(wallet.address)
    : "";

  return (
    <header
      className="dl-header"
      style={{
        position: "sticky", top: 0, zIndex: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 32px",
        borderBottom: "1px solid rgba(0,229,160,0.05)",
        background: "rgba(4,9,7,0.9)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #00E5A0, #00B37D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", fontWeight: 900, color: "#050b08", fontFamily: "Outfit",
            boxShadow: "0 2px 16px rgba(0,229,160,0.3), 0 0 4px rgba(0,229,160,0.15)",
          }}
        >
          DL
        </div>
        <div>
          <div
            className="dl-header-brand"
            style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "19px", letterSpacing: "-0.5px", lineHeight: 1.2 }}
          >
            double<span style={{ color: "#00E5A0" }}>light</span>
          </div>
          <div
            style={{
              fontSize: "9px", color: "#2a5c47", fontWeight: 600,
              letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "JetBrains Mono",
            }}
          >
            AI Privacy DEX
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Testnet indicator */}
        <div
          style={{
            padding: "4px 10px", borderRadius: "8px",
            background: "rgba(255,213,79,0.06)",
            border: "1px solid rgba(255,213,79,0.12)",
            fontSize: "9px", fontFamily: "JetBrains Mono", fontWeight: 700,
            color: "#FFD54F", letterSpacing: "0.8px",
          }}
        >
          TESTNET
        </div>

        {/* Network badge */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 12px", borderRadius: "10px",
            background: wallet ? "rgba(0,229,160,0.05)" : "rgba(255,80,80,0.05)",
            border: `1px solid ${wallet ? "rgba(0,229,160,0.12)" : "rgba(255,80,80,0.12)"}`,
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
          {wallet ? "Republic AI" : "Disconnected"}
        </div>

        {shielded && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "6px 10px", borderRadius: "10px",
              background: "rgba(0,229,160,0.05)",
              border: "1px solid rgba(0,229,160,0.1)",
              fontSize: "10px", fontFamily: "JetBrains Mono", fontWeight: 600,
              color: "#00E5A0",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#00E5A0"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
            Shielded
          </div>
        )}

        {/* Connect button / wallet */}
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
                ? "rgba(0,229,160,0.06)"
                : "linear-gradient(135deg, #00E5A0, #00B37D)",
              border: wallet ? "1px solid rgba(0,229,160,0.12)" : "none",
              borderRadius: "12px", padding: wallet ? "8px 16px" : "10px 20px",
              color: wallet ? "#00E5A0" : "#050b08",
              fontFamily: "Outfit", fontWeight: 700, fontSize: "13px",
              cursor: "pointer", transition: "all .2s",
              boxShadow: wallet ? "none" : "0 2px 16px rgba(0,229,160,0.2)",
            }}
          >
            {wallet ? (
              <>
                <div
                  style={{
                    width: "7px", height: "7px", borderRadius: "50%",
                    background: "#00E5A0", boxShadow: "0 0 6px #00E5A0",
                  }}
                />
                {shortenAddress(wallet.address)}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="#00E5A0" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
                  <circle cx="18" cy="16" r="1"/>
                </svg>
                Connect
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
                width: "320px",
                background: "linear-gradient(160deg,#060d09,#0a1810)",
                border: "1px solid rgba(0,229,160,0.08)",
                borderRadius: "18px", padding: "18px", zIndex: 50,
                boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,229,160,0.03)",
                animation: "fadeIn .15s ease",
              }}
            >
              <div style={{ fontSize: "12px", fontFamily: "Outfit", fontWeight: 700, color: "#e6fff5", marginBottom: "14px" }}>
                Wallet Info
              </div>

              {/* Cosmos address */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", padding: "8px 10px", background: "rgba(0,229,160,0.02)", borderRadius: "10px" }}>
                <span style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "JetBrains Mono", fontWeight: 600 }}>COSMOS</span>
                <span style={{ fontSize: "11px", color: "#5a9a80", fontFamily: "JetBrains Mono" }}>
                  {shortenAddress(cosmosAddr)}
                </span>
              </div>

              {/* EVM address */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", padding: "8px 10px", background: "rgba(0,229,160,0.02)", borderRadius: "10px" }}>
                <span style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "JetBrains Mono", fontWeight: 600 }}>EVM</span>
                <span style={{ fontSize: "11px", color: "#5a9a80", fontFamily: "JetBrains Mono" }}>
                  {shortenAddress(evmAddr)}
                </span>
              </div>

              <button
                onClick={disconnect}
                style={{
                  width: "100%", padding: "11px",
                  background: "rgba(255,80,80,0.06)",
                  border: "1px solid rgba(255,80,80,0.12)",
                  borderRadius: "12px", color: "#ff5050",
                  fontFamily: "Outfit", fontWeight: 600, fontSize: "13px",
                  cursor: "pointer", transition: "all .2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,80,80,0.12)"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,80,80,0.06)"; e.currentTarget.style.borderColor = "rgba(255,80,80,0.12)"; }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
