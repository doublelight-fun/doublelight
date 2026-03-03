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
import AIRiskPanel from "./components/AIRiskPanel";

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
    if (!wallet) { setShowWalletPicker(true); return; }
    setProcessing(true);
    const delay = tab === "swap" ? 2200 : 2800;
    setTimeout(() => {
      setProcessing(false);
      if (tab === "shield") setShielded(true);
      if (tab === "unshield") setShielded(false);
    }, delay);
  };

  const actionLabel = processing
    ? "Processing..."
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
        background: "#040907",
        color: "#e6fff5",
        fontFamily: "Manrope, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cardGlow {
          0%,100% { box-shadow: 0 0 40px rgba(0,229,160,0.05), 0 0 80px rgba(0,229,160,0.02), 0 24px 64px rgba(0,0,0,0.5) }
          50% { box-shadow: 0 0 60px rgba(0,229,160,0.08), 0 0 120px rgba(0,229,160,0.03), 0 24px 64px rgba(0,0,0,0.5) }
        }
        @keyframes toastIn { from { transform: translateX(-50%) translateY(-20px); opacity: 0 } to { transform: translateX(-50%) translateY(0); opacity: 1 } }
        @keyframes btnPulse {
          0%,100% { box-shadow: 0 4px 20px rgba(0,229,160,0.15) }
          50% { box-shadow: 0 4px 30px rgba(0,229,160,0.25) }
        }
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
        ::-webkit-scrollbar { width: 4px }
        ::-webkit-scrollbar-thumb { background: rgba(0,229,160,0.15); border-radius: 4px }
        input::placeholder { color: #1e4a38 }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none }

        @media (max-width: 540px) {
          .dl-card { width: 94vw !important; padding: 18px !important }
          .dl-header { padding: 12px 16px !important }
          .dl-header-brand { font-size: 17px !important }
          .dl-tabs { overflow-x: auto; gap: 0 !important }
          .dl-tabs button { padding: 8px 18px !important; font-size: 12px !important }
          .dl-main { padding-top: 28px !important }
          .dl-footer-links { gap: 12px !important }
          .dl-footer-links a { font-size: 10px !important }
        }

        @media (max-width: 380px) {
          .dl-card { padding: 14px !important }
          .dl-header-right > div { display: none }
          .dl-header-right > div:last-child { display: flex }
        }
      `}</style>

      <NeuralMesh />

      {/* Ambient radials */}
      <div style={{ position: "fixed", top: "-35%", left: "50%", transform: "translateX(-50%)", width: "1000px", height: "1000px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-40%", right: "-10%", width: "700px", height: "700px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,179,125,0.02) 0%, transparent 55%)", pointerEvents: "none" }} />

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
        className="dl-main"
        style={{
          position: "relative", zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: "44px", paddingBottom: "60px",
          animation: "slideUp .5s ease",
        }}
      >
        {/* Tabs */}
        <div
          className="dl-tabs"
          style={{
            display: "inline-flex", background: "rgba(0,229,160,0.025)",
            border: "1px solid rgba(0,229,160,0.06)",
            borderRadius: "16px", padding: "3px", marginBottom: "24px",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "9px 26px", borderRadius: "13px", border: "none",
                background: tab === t ? "rgba(0,229,160,0.1)" : "transparent",
                color: tab === t ? "#00E5A0" : "#2a5c47",
                fontFamily: "Outfit", fontWeight: 600, fontSize: "13px",
                cursor: "pointer", transition: "all .2s",
                textTransform: "capitalize", whiteSpace: "nowrap",
              }}
            >
              {t === "swap" ? "Swap" : t === "shield" ? "Shield" : "Unshield"}
            </button>
          ))}
        </div>

        {/* ==================== CARD ==================== */}
        <div
          className="dl-card"
          style={{
            width: "480px",
            background: "linear-gradient(165deg, rgba(6,13,9,0.98), rgba(10,24,16,0.96), rgba(6,13,9,0.98))",
            border: "1px solid rgba(0,229,160,0.06)",
            borderRadius: "24px",
            padding: "24px",
            backdropFilter: "blur(20px)",
            animation: "cardGlow 6s ease infinite",
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

              {/* Swap direction */}
              <div style={{ display: "flex", justifyContent: "center", margin: "-10px 0", position: "relative", zIndex: 2 }}>
                <button
                  onClick={swapDirection}
                  style={{
                    width: "38px", height: "38px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #071a12, #0f2e20)",
                    border: "1px solid rgba(0,229,160,0.12)",
                    color: "#00E5A0", fontSize: "14px", cursor: "pointer",
                    transition: "all .3s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotate(180deg)";
                    e.currentTarget.style.borderColor = "rgba(0,229,160,0.3)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,229,160,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotate(0)";
                    e.currentTarget.style.borderColor = "rgba(0,229,160,0.12)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
                  </svg>
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
              <AIRiskPanel fromToken={fromTokenLive} toToken={toTokenLive} amount={fromAmt} />
            </>
          ) : (
            <>
              {/* Shield / Unshield info */}
              <div
                style={{
                  textAlign: "center", marginBottom: "18px", padding: "22px 20px",
                  background: tab === "shield" ? "rgba(0,229,160,0.02)" : "rgba(255,200,50,0.02)",
                  borderRadius: "18px",
                  border: `1px solid ${tab === "shield" ? "rgba(0,229,160,0.06)" : "rgba(255,200,50,0.06)"}`,
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill={tab === "shield" ? "#00E5A0" : "#FFD54F"} opacity="0.7">
                    {tab === "shield"
                      ? <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
                      : <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    }
                  </svg>
                </div>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "17px", color: "#e6fff5", marginBottom: "5px" }}>
                  {tab === "shield" ? "Shield Tokens" : "Unshield Tokens"}
                </div>
                <div style={{ fontSize: "12px", color: "#2a5c47", lineHeight: 1.6, maxWidth: "300px", margin: "0 auto", fontFamily: "Manrope" }}>
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
                  <div style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500, marginBottom: "6px", fontFamily: "Manrope" }}>
                    Recipient Address
                  </div>
                  <input
                    placeholder="rai1..."
                    style={{
                      width: "100%", background: "rgba(0,229,160,0.02)",
                      border: "1px solid rgba(0,229,160,0.06)", borderRadius: "14px",
                      padding: "14px 16px", color: "#e6fff5", fontSize: "13px",
                      fontFamily: "JetBrains Mono", outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.2)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.06)")}
                  />
                  <div style={{ fontSize: "11px", color: "#2a5c47", marginTop: "6px", fontStyle: "italic", fontFamily: "Manrope" }}>
                    Use a fresh wallet for maximum privacy
                  </div>
                </div>
              )}

              {shieldAmt && (
                <div
                  style={{
                    marginTop: "14px", padding: "14px 16px",
                    background: "rgba(0,229,160,0.015)", borderRadius: "14px",
                    border: "1px solid rgba(0,229,160,0.05)",
                  }}
                >
                  <InfoRow label="Privacy Fee" value="0.25%" />
                  <InfoRow label="Gas (RAI)" value="~0.001 RAI" />
                </div>
              )}
            </>
          )}

          {/* ACTION BUTTON */}
          <button
            onClick={execAction}
            disabled={processing}
            style={{
              width: "100%", marginTop: "18px", padding: "16px",
              borderRadius: "16px", border: "none",
              background: processing
                ? "rgba(0,229,160,0.04)"
                : !wallet
                ? "linear-gradient(135deg, #00E5A0, #00B37D)"
                : "linear-gradient(135deg, #00E5A0, #00C48E)",
              color: processing ? "#2a5c47" : "#050b08",
              fontFamily: "Outfit", fontWeight: 700, fontSize: "15px",
              cursor: processing ? "not-allowed" : "pointer",
              transition: "all .25s", letterSpacing: "0.3px",
              animation: !processing && wallet ? "btnPulse 3s ease infinite" : "none",
              boxShadow: !processing ? "0 4px 20px rgba(0,229,160,0.15)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!processing) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,229,160,0.25)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,229,160,0.15)";
            }}
          >
            {processing && (
              <div style={{ width: "16px", height: "16px", border: "2px solid rgba(0,229,160,0.2)", borderTop: "2px solid #00E5A0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            )}
            {actionLabel}
          </button>
        </div>

        {/* Powered by badge */}
        <div style={{
          marginTop: "20px", display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 14px", borderRadius: "10px",
          background: "rgba(0,229,160,0.02)", border: "1px solid rgba(0,229,160,0.04)",
        }}>
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#00E5A0", boxShadow: "0 0 4px #00E5A0" }} />
          <span style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "JetBrains Mono", letterSpacing: "0.5px" }}>
            Powered by Republic AI Compute Layer
          </span>
        </div>

        {/* Footer links */}
        <div className="dl-footer-links" style={{ marginTop: "20px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
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
        <div style={{ marginTop: "8px", fontSize: "10px", color: "#0f2219", fontFamily: "JetBrains Mono", textAlign: "center" }}>
          doublelight.fun · v0.1.0-testnet
        </div>
      </main>

      {showWalletPicker && (
        <WalletPicker
          onClose={() => setShowWalletPicker(false)}
          onKeplr={connectKeplr}
          onEVM={connectEVM}
        />
      )}

      <TokenModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, target: null })}
        onSelect={handleSelect}
        tokens={tokens}
      />
    </div>
  );
}
