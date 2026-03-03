"use client";
import { useState, useMemo } from "react";
import { useWallet } from "./hooks/useWallet";
import { DEFAULT_TOKENS, TABS, FOOTER_LINKS } from "./utils/constants";
import NeuralMesh from "./components/NeuralMesh";
import Toast from "./components/Toast";
import Header from "./components/Header";
import TokenModal from "./components/TokenModal";
import WalletPicker from "./components/WalletPicker";
import TokenInput from "./components/TokenInput";
import SwapInfo from "./components/SwapInfo";
import { InfoRow } from "./components/SwapInfo";

export default function DoubleLight() {
  const {
    wallet, raiBalance, toast,
    showWalletMenu, setShowWalletMenu,
    showWalletPicker, setShowWalletPicker,
    walletMenuRef,
    connectKeplr, connectEVM, disconnect,
  } = useWallet();

  const [tab, setTab] = useState("swap");
  const [fromToken, setFromToken] = useState(DEFAULT_TOKENS[0]);
  const [toToken, setToToken] = useState(DEFAULT_TOKENS[2]);
  const [fromAmt, setFromAmt] = useState("");
  const [shieldToken, setShieldToken] = useState(DEFAULT_TOKENS[0]);
  const [shieldAmt, setShieldAmt] = useState("");
  const [modal, setModal] = useState({ open: false, target: null });
  const [processing, setProcessing] = useState(false);
  const [shielded, setShielded] = useState(false);

  // Merge live RAI balance into tokens
  const tokens = useMemo(() => {
    return DEFAULT_TOKENS.map((t) =>
      t.symbol === "RAI" ? { ...t, balance: raiBalance } : { ...t, balance: "0.00" }
    );
  }, [raiBalance]);

  // Keep selected tokens synced with live balance
  const fromTokenLive = useMemo(
    () => (fromToken.symbol === "RAI" ? { ...fromToken, balance: raiBalance } : fromToken),
    [fromToken, raiBalance]
  );
  const toTokenLive = useMemo(
    () => (toToken.symbol === "RAI" ? { ...toToken, balance: raiBalance } : toToken),
    [toToken, raiBalance]
  );
  const shieldTokenLive = useMemo(
    () => (shieldToken.symbol === "RAI" ? { ...shieldToken, balance: raiBalance } : shieldToken),
    [shieldToken, raiBalance]
  );

  // Simulated receive amount (placeholder until real AMM)
  const receiveAmt = fromAmt
    ? fromToken.symbol === "RAI"
      ? (parseFloat(fromAmt) * 2.45).toFixed(4)
      : (parseFloat(fromAmt) / 2.45).toFixed(4)
    : "";

  const handleSelect = (token) => {
    if (modal.target === "from") setFromToken(token);
    else if (modal.target === "to") setToToken(token);
    else if (modal.target === "shield") setShieldToken(token);
  };

  const swapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmt("");
  };

  const execAction = () => {
    if (!wallet) {
      setShowWalletPicker(true);
      return;
    }
    setProcessing(true);
    const delay = tab === "swap" ? 2200 : 2800;
    setTimeout(() => {
      setProcessing(false);
      if (tab === "shield") setShielded(true);
      if (tab === "unshield") setShielded(false);
    }, delay);
  };

  // Action button label
  const actionLabel = processing
    ? "\u27F3 Processing..."
    : !wallet
    ? "Connect Wallet"
    : tab === "swap"
    ? `Swap ${fromToken.symbol} \u2192 ${toToken.symbol}`
    : tab === "shield"
    ? `Shield ${shieldToken.symbol}`
    : `Unshield ${shieldToken.symbol}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050b08",
        color: "#e6fff5",
        fontFamily: "Manrope, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cardGlow { 0%,100% { box-shadow: 0 0 30px rgba(0,229,160,0.06), 0 20px 60px rgba(0,0,0,0.4) } 50% { box-shadow: 0 0 50px rgba(0,229,160,0.1), 0 20px 60px rgba(0,0,0,0.4) } }
        @keyframes toastIn { from { transform: translateX(-50%) translateY(-20px); opacity: 0 } to { transform: translateX(-50%) translateY(0); opacity: 1 } }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,160,0.15); border-radius: 4px }
        input::placeholder { color: #2a5c47 }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none }
        @media (max-width: 540px) {
          .dl-card { width: 94vw !important; padding: 20px !important }
          .dl-header { padding: 16px !important }
          .dl-header-brand { font-size: 18px !important }
          .dl-tabs { overflow-x: auto }
        }
      `}</style>

      <NeuralMesh />

      {/* Ambient radial */}
      <div
        style={{
          position: "fixed", top: "-30%", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "900px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,160,0.03) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <Toast toast={toast} />

      <Header
        wallet={wallet}
        shielded={shielded}
        showWalletMenu={showWalletMenu}
        setShowWalletMenu={setShowWalletMenu}
        setShowWalletPicker={setShowWalletPicker}
        walletMenuRef={walletMenuRef}
        disconnect={disconnect}
      />

      {/* ==================== MAIN ==================== */}
      <main
        style={{
          position: "relative", zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: "48px", paddingBottom: "60px",
          animation: "slideUp .5s ease",
        }}
      >
        {/* Tabs */}
        <div
          className="dl-tabs"
          style={{
            display: "flex", background: "rgba(0,229,160,0.03)",
            border: "1px solid rgba(0,229,160,0.07)",
            borderRadius: "16px", padding: "3px", marginBottom: "28px",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "9px 24px", borderRadius: "13px", border: "none",
                background: tab === t ? "rgba(0,229,160,0.1)" : "transparent",
                color: tab === t ? "#00E5A0" : "#2a5c47",
                fontFamily: "Outfit", fontWeight: 600, fontSize: "13px",
                cursor: "pointer", transition: "all .2s",
                textTransform: "capitalize", whiteSpace: "nowrap",
              }}
            >
              {t === "swap" ? "\u27E0 Swap" : t === "shield" ? "\uD83D\uDEE1 Shield" : "\uD83D\uDD13 Unshield"}
            </button>
          ))}
        </div>

        {/* ==================== CARD ==================== */}
        <div
          className="dl-card"
          style={{
            width: "460px",
            background: "linear-gradient(160deg, rgba(8,15,12,0.97), rgba(12,26,20,0.95))",
            border: "1px solid rgba(0,229,160,0.07)",
            borderRadius: "24px",
            padding: "24px",
            backdropFilter: "blur(16px)",
            animation: "cardGlow 5s ease infinite",
          }}
        >
          {tab === "swap" ? (
            <>
              <TokenInput
                label="You pay"
                token={fromTokenLive}
                amount={fromAmt}
                onChange={setFromAmt}
                onTokenClick={() => setModal({ open: true, target: "from" })}
              />

              {/* Swap direction button */}
              <div style={{ display: "flex", justifyContent: "center", margin: "-12px 0", position: "relative", zIndex: 2 }}>
                <button
                  onClick={swapDirection}
                  style={{
                    width: "40px", height: "40px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #0a1f16, #133026)",
                    border: "1px solid rgba(0,229,160,0.15)",
                    color: "#00E5A0", fontSize: "16px", cursor: "pointer",
                    transition: "all .3s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotate(180deg)";
                    e.currentTarget.style.borderColor = "rgba(0,229,160,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(0)";
                    e.currentTarget.style.borderColor = "rgba(0,229,160,0.15)";
                  }}
                >
                  ↕
                </button>
              </div>

              <TokenInput
                label="You receive"
                token={toTokenLive}
                amount={receiveAmt}
                onChange={() => {}}
                onTokenClick={() => setModal({ open: true, target: "to" })}
                readOnly
                dimmed
              />

              {fromAmt && <SwapInfo from={fromTokenLive} to={toTokenLive} shielded={shielded} />}
            </>
          ) : (
            <>
              {/* Shield / Unshield info */}
              <div
                style={{
                  textAlign: "center", marginBottom: "20px", padding: "20px",
                  background: tab === "shield" ? "rgba(0,229,160,0.03)" : "rgba(255,200,50,0.03)",
                  borderRadius: "18px",
                  border: `1px solid ${tab === "shield" ? "rgba(0,229,160,0.08)" : "rgba(255,200,50,0.08)"}`,
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                  {tab === "shield" ? "\uD83D\uDEE1" : "\uD83D\uDD13"}
                </div>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "17px", color: "#e6fff5", marginBottom: "5px" }}>
                  {tab === "shield" ? "Shield Tokens" : "Unshield Tokens"}
                </div>
                <div style={{ fontSize: "12px", color: "#2a5c47", lineHeight: 1.5, maxWidth: "300px", margin: "0 auto" }}>
                  {tab === "shield"
                    ? "Deposit tokens into the privacy pool. Your balance becomes untraceable on Republic AI."
                    : "Withdraw from the privacy pool to a public wallet address."}
                </div>
              </div>

              <TokenInput
                label={tab === "shield" ? "Amount to shield" : "Amount to unshield"}
                token={shieldTokenLive}
                amount={shieldAmt}
                onChange={setShieldAmt}
                onTokenClick={() => setModal({ open: true, target: "shield" })}
              />

              {tab === "unshield" && (
                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500, marginBottom: "6px" }}>
                    Recipient Address
                  </div>
                  <input
                    placeholder="rai1..."
                    style={{
                      width: "100%", background: "rgba(0,229,160,0.03)",
                      border: "1px solid rgba(0,229,160,0.07)", borderRadius: "14px",
                      padding: "14px 16px", color: "#e6fff5", fontSize: "13px",
                      fontFamily: "JetBrains Mono", outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.25)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.07)")}
                  />
                  <div style={{ fontSize: "11px", color: "#2a5c47", marginTop: "6px", fontStyle: "italic" }}>
                    ⚠ Use a fresh wallet for maximum privacy
                  </div>
                </div>
              )}

              {shieldAmt && (
                <div
                  style={{
                    marginTop: "14px", padding: "12px 16px",
                    background: "rgba(0,229,160,0.02)", borderRadius: "12px",
                    border: "1px solid rgba(0,229,160,0.04)",
                  }}
                >
                  <InfoRow label="Privacy Fee" value="0.25%" />
                  <InfoRow label="Gas (RAI)" value="~0.001 RAI" />
                </div>
              )}
            </>
          )}

          {/* Action button */}
          <button
            onClick={execAction}
            disabled={processing}
            style={{
              width: "100%", marginTop: "18px", padding: "16px",
              borderRadius: "16px", border: "none",
              background: processing
                ? "rgba(0,229,160,0.05)"
                : !wallet
                ? "linear-gradient(135deg, #00E5A0, #00B37D)"
                : "linear-gradient(135deg, #0c3325, #0f4433)",
              color: processing ? "#2a5c47" : !wallet ? "#050b08" : "#00E5A0",
              fontFamily: "Outfit", fontWeight: 700, fontSize: "15px",
              cursor: processing ? "not-allowed" : "pointer",
              transition: "all .25s", letterSpacing: "0.2px",
            }}
            onMouseEnter={(e) => {
              if (!processing) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,229,160,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {actionLabel}
          </button>
        </div>

        {/* Footer links */}
        <div style={{ marginTop: "28px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          {FOOTER_LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "11px", color: "#1e4a38", fontFamily: "JetBrains Mono", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={(e) => (e.target.style.color = "#00E5A0")}
              onMouseLeave={(e) => (e.target.style.color = "#1e4a38")}
            >
              {label}
            </a>
          ))}
        </div>
        <div style={{ marginTop: "10px", fontSize: "10px", color: "#122a20", fontFamily: "JetBrains Mono", textAlign: "center" }}>
          doublelight.fun · Built on Republic AI · Zero Knowledge Privacy
        </div>
      </main>

      {/* Wallet picker modal */}
      {showWalletPicker && (
        <WalletPicker
          onClose={() => setShowWalletPicker(false)}
          onKeplr={connectKeplr}
          onEVM={connectEVM}
        />
      )}

      {/* Token selector modal */}
      <TokenModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, target: null })}
        onSelect={handleSelect}
        tokens={tokens}
      />
    </div>
  );
}
