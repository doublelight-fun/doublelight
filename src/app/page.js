"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// REPUBLIC AI NETWORK CONFIG
// ============================================================
const REPUBLIC_CHAIN = {
  chainId: "raitestnet_77701-1",
  chainName: "Republic AI Testnet",
  rpc: "https://rpc.republicai.io",
  rest: "https://rest.republicai.io",
  evmRpc: "https://evm-rpc.republicai.io",
  grpc: "grpc.republicai.io:443",
  pointsPortal: "https://points.republicai.io",
  bip44: { coinType: 60 },
  bech32Config: {
    bech32PrefixAccAddr: "rai",
    bech32PrefixAccPub: "raipub",
    bech32PrefixValAddr: "raivaloper",
    bech32PrefixValPub: "raivaloperpub",
    bech32PrefixConsAddr: "raivalcons",
    bech32PrefixConsPub: "raivalconspub",
  },
  currencies: [
    { coinDenom: "RAI", coinMinimalDenom: "arai", coinDecimals: 18 },
  ],
  feeCurrencies: [
    { coinDenom: "RAI", coinMinimalDenom: "arai", coinDecimals: 18 },
  ],
  stakeCurrency: {
    coinDenom: "RAI",
    coinMinimalDenom: "arai",
    coinDecimals: 18,
  },
};

// ============================================================
// TOKEN LIST (Republic AI Testnet)
// ============================================================
const TOKENS = [
  { symbol: "RAI", name: "Republic AI", icon: "◆", balance: "0.00", color: "#00E5A0", decimals: 18 },
  { symbol: "WRAI", name: "Wrapped RAI", icon: "◇", balance: "0.00", color: "#00C489", decimals: 18 },
  { symbol: "USDC", name: "USD Coin", icon: "◎", balance: "0.00", color: "#2775CA", decimals: 6 },
  { symbol: "USDT", name: "Tether", icon: "₮", balance: "0.00", color: "#50AF95", decimals: 6 },
  { symbol: "WETH", name: "Wrapped ETH", icon: "⟠", balance: "0.00", color: "#627EEA", decimals: 18 },
  { symbol: "WBTC", name: "Wrapped BTC", icon: "₿", balance: "0.00", color: "#F7931A", decimals: 8 },
];

const TABS = ["swap", "shield", "unshield"];

// ============================================================
// ANIMATED BACKGROUND — Neural mesh
// ============================================================
function NeuralMesh() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let nodes = [];
    const NODE_COUNT = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 229, 160, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        const glow = 0.3 + Math.sin(n.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 160, ${glow})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
  );
}

// ============================================================
// TOKEN SELECTOR MODAL
// ============================================================
function TokenModal({ isOpen, onClose, onSelect, tokens }) {
  const [q, setQ] = useState("");
  if (!isOpen) return null;

  const list = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(q.toLowerCase()) ||
      t.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, animation: "fadeIn .2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(160deg, #080f0c, #0c1a14, #080f0c)", border: "1px solid rgba(0,229,160,0.1)", borderRadius: "24px", padding: "24px", width: "400px", maxWidth: "92vw", maxHeight: "480px", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontFamily: "Outfit", fontSize: "17px", fontWeight: 700, color: "#e6fff5" }}>Select Token</span>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.12)", color: "#00E5A0", cursor: "pointer", fontSize: "14px" }}>✕</button>
        </div>
        <input
          placeholder="Search token..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.1)", borderRadius: "14px", padding: "12px 16px", color: "#e6fff5", fontSize: "14px", fontFamily: "Manrope", outline: "none", marginBottom: "12px" }}
        />
        <div style={{ overflowY: "auto", flex: 1 }}>
          {list.map((t) => (
            <button
              key={t.symbol}
              onClick={() => { onSelect(t); onClose(); }}
              style={{ display: "flex", alignItems: "center", width: "100%", padding: "12px 14px", background: "transparent", border: "none", borderRadius: "14px", cursor: "pointer", transition: "background .15s", marginBottom: "2px" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: `${t.color}18`, border: `1px solid ${t.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginRight: "12px", flexShrink: 0 }}>{t.icon}</div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ color: "#e6fff5", fontWeight: 600, fontSize: "14px", fontFamily: "Outfit" }}>{t.symbol}</div>
                <div style={{ color: "#4a8a70", fontSize: "12px", fontFamily: "Manrope" }}>{t.name}</div>
              </div>
              <div style={{ color: "#4a8a70", fontSize: "13px", fontFamily: "JetBrains Mono" }}>{t.balance}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function DoubleLight() {
  const [tab, setTab] = useState("swap");
  const [wallet, setWallet] = useState(null); // { address, name }
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[2]);
  const [fromAmt, setFromAmt] = useState("");
  const [shieldToken, setShieldToken] = useState(TOKENS[0]);
  const [shieldAmt, setShieldAmt] = useState("");
  const [modal, setModal] = useState({ open: false, target: null });
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [shielded, setShielded] = useState(false);

  // Keplr connect
  const connectKeplr = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!window.keplr) {
      setToast({ type: "error", msg: "Keplr wallet not found. Please install the Keplr extension." });
      setTimeout(() => setToast(null), 4000);
      window.open("https://www.keplr.app/download", "_blank");
      return;
    }

    try {
      // Suggest Republic AI chain to Keplr
      try {
        await window.keplr.experimentalSuggestChain({
          chainId: REPUBLIC_CHAIN.chainId,
          chainName: REPUBLIC_CHAIN.chainName,
          rpc: REPUBLIC_CHAIN.rpc,
          rest: REPUBLIC_CHAIN.rest,
          bip44: REPUBLIC_CHAIN.bip44,
          bech32Config: REPUBLIC_CHAIN.bech32Config,
          currencies: REPUBLIC_CHAIN.currencies,
          feeCurrencies: REPUBLIC_CHAIN.feeCurrencies,
          stakeCurrency: REPUBLIC_CHAIN.stakeCurrency,
          coinType: 60,
          features: ["eth-address-gen", "eth-key-sign"],
        });
      } catch (e) {
        console.log("Chain suggestion failed, trying enable directly:", e);
      }

      await window.keplr.enable(REPUBLIC_CHAIN.chainId);
      const offlineSigner = window.keplr.getOfflineSigner(REPUBLIC_CHAIN.chainId);
      const accounts = await offlineSigner.getAccounts();

      if (accounts && accounts.length > 0) {
        const addr = accounts[0].address;
        setWallet({
          address: addr,
          name: addr.slice(0, 8) + "..." + addr.slice(-6),
        });
        setToast({ type: "success", msg: "Connected to Republic AI Testnet" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Keplr connect error:", err);
      setToast({ type: "error", msg: "Failed to connect. Check Keplr and try again." });
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  const disconnect = () => {
    setWallet(null);
    setShielded(false);
    setToast({ type: "info", msg: "Wallet disconnected" });
    setTimeout(() => setToast(null), 2500);
  };

  const openModal = (target) => setModal({ open: true, target });
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
    if (!wallet) { connectKeplr(); return; }
    setProcessing(true);
    const delay = tab === "swap" ? 2200 : 2800;
    setTimeout(() => {
      setProcessing(false);
      if (tab === "shield") setShielded(true);
      if (tab === "unshield") setShielded(false);
      setToast({
        type: "success",
        msg: tab === "swap" ? "Swap executed successfully!" : tab === "shield" ? "Tokens shielded — privacy active" : "Tokens unshielded to wallet",
      });
      setTimeout(() => setToast(null), 3500);
    }, delay);
  };

  // Simulated receive amount
  const receiveAmt = fromAmt
    ? fromToken.symbol === "RAI"
      ? (parseFloat(fromAmt) * 2.45).toFixed(4)
      : (parseFloat(fromAmt) / 2.45).toFixed(4)
    : "";

  return (
    <div style={{ minHeight: "100vh", background: "#050b08", color: "#e6fff5", fontFamily: "Manrope, sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cardGlow { 0%,100% { box-shadow: 0 0 30px rgba(0,229,160,0.06), 0 20px 60px rgba(0,0,0,0.4) } 50% { box-shadow: 0 0 50px rgba(0,229,160,0.1), 0 20px 60px rgba(0,0,0,0.4) } }
        @keyframes toastIn { from { transform: translateX(-50%) translateY(-20px); opacity: 0 } to { transform: translateX(-50%) translateY(0); opacity: 1 } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
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
      <div style={{ position: "fixed", top: "-30%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "900px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,160,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "rgba(0,229,160,0.12)" : toast.type === "error" ? "rgba(255,80,80,0.12)" : "rgba(0,229,160,0.08)",
          border: `1px solid ${toast.type === "success" ? "rgba(0,229,160,0.3)" : toast.type === "error" ? "rgba(255,80,80,0.3)" : "rgba(0,229,160,0.15)"}`,
          borderRadius: "14px", padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px",
          zIndex: 200, animation: "toastIn .3s ease", backdropFilter: "blur(12px)",
          fontFamily: "Outfit", fontWeight: 600, fontSize: "14px",
          color: toast.type === "error" ? "#ff5050" : "#00E5A0",
        }}>
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✗" : "ℹ"} {toast.msg}
        </div>
      )}

      {/* ==================== HEADER ==================== */}
      <header className="dl-header" style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 36px", borderBottom: "1px solid rgba(0,229,160,0.06)" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #00E5A0, #00B37D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 900, color: "#050b08", fontFamily: "Outfit" }}>
            DL
          </div>
          <div>
            <div className="dl-header-brand" style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>
              double<span style={{ color: "#00E5A0" }}>light</span>
            </div>
            <div style={{ fontSize: "10px", color: "#2a5c47", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>
              Private Swap · Republic AI
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Network badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "10px", background: wallet ? "rgba(0,229,160,0.06)" : "rgba(255,80,80,0.06)", border: `1px solid ${wallet ? "rgba(0,229,160,0.15)" : "rgba(255,80,80,0.15)"}`, fontSize: "11px", fontFamily: "JetBrains Mono", fontWeight: 500, color: wallet ? "#00E5A0" : "#ff5050" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: wallet ? "#00E5A0" : "#ff5050", boxShadow: wallet ? "0 0 6px #00E5A0" : "0 0 6px #ff5050" }} />
            {wallet ? "Republic AI" : "Not connected"}
          </div>

          {shielded && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "10px", background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.12)", fontSize: "11px", fontFamily: "JetBrains Mono", fontWeight: 500, color: "#00E5A0" }}>
              🛡 Shielded
            </div>
          )}

          {/* Connect / Disconnect */}
          <button
            onClick={wallet ? disconnect : connectKeplr}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: wallet ? "rgba(255,80,80,0.08)" : "linear-gradient(135deg, #00E5A0, #00B37D)",
              border: wallet ? "1px solid rgba(255,80,80,0.2)" : "none",
              borderRadius: "12px", padding: "10px 20px",
              color: wallet ? "#ff5050" : "#050b08",
              fontFamily: "Outfit", fontWeight: 700, fontSize: "13px",
              cursor: "pointer", transition: "all .2s",
            }}
          >
            {wallet ? (
              <>
                <img src="https://raw.githubusercontent.com/niccolosottile/keplr-logo/main/Keplr%20Logo%20Icon.svg" alt="" style={{ width: "16px", height: "16px" }} onError={(e) => e.target.style.display = "none"} />
                {wallet.name}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><circle cx="18" cy="16" r="1"/></svg>
                Connect Keplr
              </>
            )}
          </button>
        </div>
      </header>

      {/* ==================== MAIN ==================== */}
      <main style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "48px", paddingBottom: "60px", animation: "slideUp .5s ease" }}>

        {/* Tabs */}
        <div className="dl-tabs" style={{ display: "flex", background: "rgba(0,229,160,0.03)", border: "1px solid rgba(0,229,160,0.07)", borderRadius: "16px", padding: "3px", marginBottom: "28px" }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "9px 24px", borderRadius: "13px", border: "none",
                background: tab === t ? "rgba(0,229,160,0.1)" : "transparent",
                color: tab === t ? "#00E5A0" : "#2a5c47",
                fontFamily: "Outfit", fontWeight: 600, fontSize: "13px",
                cursor: "pointer", transition: "all .2s", textTransform: "capitalize", whiteSpace: "nowrap",
              }}
            >
              {t === "swap" ? "⟠ Swap" : t === "shield" ? "🛡 Shield" : "🔓 Unshield"}
            </button>
          ))}
        </div>

        {/* ==================== CARD ==================== */}
        <div className="dl-card" style={{
          width: "460px", background: "linear-gradient(160deg, rgba(8,15,12,0.97), rgba(12,26,20,0.95))",
          border: "1px solid rgba(0,229,160,0.07)", borderRadius: "24px", padding: "24px",
          backdropFilter: "blur(16px)", animation: "cardGlow 5s ease infinite",
        }}>

          {tab === "swap" ? (
            <>
              {/* FROM */}
              <TokenInput
                label="You pay"
                token={fromToken}
                amount={fromAmt}
                onChange={setFromAmt}
                onTokenClick={() => openModal("from")}
                readOnly={false}
              />

              {/* Swap direction */}
              <div style={{ display: "flex", justifyContent: "center", margin: "-12px 0", position: "relative", zIndex: 2 }}>
                <button
                  onClick={swapDirection}
                  style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #0a1f16, #133026)", border: "1px solid rgba(0,229,160,0.15)", color: "#00E5A0", fontSize: "16px", cursor: "pointer", transition: "all .3s", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(180deg)"; e.currentTarget.style.borderColor = "rgba(0,229,160,0.35)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "rotate(0)"; e.currentTarget.style.borderColor = "rgba(0,229,160,0.15)"; }}
                >↕</button>
              </div>

              {/* TO */}
              <TokenInput
                label="You receive"
                token={toToken}
                amount={receiveAmt}
                onChange={() => {}}
                onTokenClick={() => openModal("to")}
                readOnly={true}
                dimmed
              />

              {/* Swap info */}
              {fromAmt && <SwapInfo from={fromToken} to={toToken} shielded={shielded} />}
            </>
          ) : (
            <>
              {/* Shield/Unshield UI */}
              <div style={{ textAlign: "center", marginBottom: "20px", padding: "20px", background: tab === "shield" ? "rgba(0,229,160,0.03)" : "rgba(255,200,50,0.03)", borderRadius: "18px", border: `1px solid ${tab === "shield" ? "rgba(0,229,160,0.08)" : "rgba(255,200,50,0.08)"}` }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>{tab === "shield" ? "🛡" : "🔓"}</div>
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
                token={shieldToken}
                amount={shieldAmt}
                onChange={setShieldAmt}
                onTokenClick={() => openModal("shield")}
                readOnly={false}
              />

              {tab === "unshield" && (
                <div style={{ marginTop: "14px" }}>
                  <div style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500, marginBottom: "6px" }}>Recipient Address</div>
                  <input
                    placeholder="rai1..."
                    style={{ width: "100%", background: "rgba(0,229,160,0.03)", border: "1px solid rgba(0,229,160,0.07)", borderRadius: "14px", padding: "14px 16px", color: "#e6fff5", fontSize: "13px", fontFamily: "JetBrains Mono", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.25)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.07)")}
                  />
                  <div style={{ fontSize: "11px", color: "#2a5c47", marginTop: "6px", fontStyle: "italic" }}>⚠ Use a fresh wallet for maximum privacy</div>
                </div>
              )}

              {shieldAmt && (
                <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(0,229,160,0.02)", borderRadius: "12px", border: "1px solid rgba(0,229,160,0.04)" }}>
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
              width: "100%", marginTop: "18px", padding: "16px", borderRadius: "16px", border: "none",
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
            onMouseEnter={(e) => { if (!processing) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,229,160,0.15)"; }}}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {processing ? "⟳ Processing..." : !wallet ? "Connect Keplr Wallet" : tab === "swap" ? `Swap ${fromToken.symbol} → ${toToken.symbol}` : tab === "shield" ? `Shield ${shieldToken.symbol}` : `Unshield ${shieldToken.symbol}`}
          </button>

          {/* Wallet info when connected */}
          {wallet && (
            <div style={{ marginTop: "14px", padding: "10px 14px", background: "rgba(0,229,160,0.02)", borderRadius: "12px", border: "1px solid rgba(0,229,160,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "JetBrains Mono" }}>Wallet</span>
              <span style={{ fontSize: "11px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>{wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "28px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            ["Republic AI Network", "https://republicai.io"],
            ["Points Portal", "https://points.republicai.io"],
            ["Docs", "https://docs.republicai.io"],
            ["Keplr Wallet", "https://www.keplr.app"],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "#1e4a38", fontFamily: "JetBrains Mono", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={(e) => (e.target.style.color = "#00E5A0")}
              onMouseLeave={(e) => (e.target.style.color = "#1e4a38")}
            >{label}</a>
          ))}
        </div>
        <div style={{ marginTop: "10px", fontSize: "10px", color: "#122a20", fontFamily: "JetBrains Mono", textAlign: "center" }}>
          doublelight.fun · Built on Republic AI · Zero Knowledge Privacy
        </div>
      </main>

      <TokenModal isOpen={modal.open} onClose={() => setModal({ open: false, target: null })} onSelect={handleSelect} tokens={TOKENS} />
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================
function TokenInput({ label, token, amount, onChange, onTokenClick, readOnly, dimmed }) {
  return (
    <div style={{ background: "rgba(0,229,160,0.025)", border: "1px solid rgba(0,229,160,0.05)", borderRadius: "18px", padding: "18px", marginBottom: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "JetBrains Mono" }}>Bal: {token.balance}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input
          type="text"
          placeholder="0.0"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: dimmed ? "#4a8a70" : "#e6fff5", fontSize: "28px", fontFamily: "Outfit", fontWeight: 700 }}
        />
        <button
          onClick={onTokenClick}
          style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 14px", background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.1)", borderRadius: "12px", color: "#e6fff5", fontFamily: "Outfit", fontWeight: 600, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", transition: "all .15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.05)")}
        >
          <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: `${token.color}18`, border: `1px solid ${token.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{token.icon}</span>
          {token.symbol}
          <span style={{ fontSize: "10px", color: "#2a5c47" }}>▾</span>
        </button>
      </div>
    </div>
  );
}

function SwapInfo({ from, to, shielded }) {
  return (
    <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(0,229,160,0.02)", borderRadius: "12px", border: "1px solid rgba(0,229,160,0.04)" }}>
      <InfoRow label="Rate" value={`1 ${from.symbol} ≈ ${from.symbol === "RAI" ? "2.45" : "0.408"} ${to.symbol}`} />
      <InfoRow label="Slippage" value="0.5%" />
      <InfoRow label="Gas Fee" value="~0.001 RAI" />
      <InfoRow label="Network" value="Republic AI Testnet" />
      {shielded && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid rgba(0,229,160,0.06)" }}>
          <span style={{ fontSize: "12px", color: "#00E5A0", fontWeight: 600 }}>🛡 Privacy Mode</span>
          <span style={{ fontSize: "12px", color: "#00E5A0", fontFamily: "JetBrains Mono" }}>Active</span>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
      <span style={{ fontSize: "12px", color: "#2a5c47" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>{value}</span>
    </div>
  );
}
