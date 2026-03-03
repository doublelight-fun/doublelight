#!/bin/bash
# DoubleLight Refactor — Clean Architecture
# Copas semua isi file ini ke terminal VPS
# Pastikan lo udah di root project: cd ~/doublelight

# ============================================================
# 1. Create directory structure
# ============================================================
mkdir -p src/app/utils
mkdir -p src/app/hooks
mkdir -p src/app/components

# ============================================================
# 2. src/app/utils/bech32.js — Address converter
# ============================================================
cat << 'BECH32EOF' > src/app/utils/bech32.js
const ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

function bech32Polymod(values) {
  let chk = 1;
  for (let i = 0; i < values.length; i++) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ values[i];
    if (b & 1) chk ^= 0x3b6a57b2;
    if (b & 2) chk ^= 0x26508e6d;
    if (b & 4) chk ^= 0x1ea119fa;
    if (b & 8) chk ^= 0x3d4233dd;
    if (b & 16) chk ^= 0x2a1462b3;
  }
  return chk;
}

function bech32Encode(prefix, data) {
  // Convert 8-bit bytes to 5-bit groups
  const converted = [];
  let acc = 0, bits = 0;
  for (let i = 0; i < data.length; i++) {
    acc = (acc << 8) | data[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      converted.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) converted.push((acc << (5 - bits)) & 31);

  // Expand HRP for checksum
  const expand = [];
  for (let i = 0; i < prefix.length; i++) expand.push(prefix.charCodeAt(i) >> 5);
  expand.push(0);
  for (let i = 0; i < prefix.length; i++) expand.push(prefix.charCodeAt(i) & 31);

  const all = expand.concat(converted).concat([0, 0, 0, 0, 0, 0]);
  const polymod = bech32Polymod(all) ^ 1;
  const checksum = [];
  for (let i = 0; i < 6; i++) checksum.push((polymod >> (5 * (5 - i))) & 31);

  const result = converted.concat(checksum);
  let out = prefix + "1";
  for (let i = 0; i < result.length; i++) out += ALPHABET[result[i]];
  return out;
}

export function evmToRai(evmAddr) {
  if (!evmAddr || !evmAddr.startsWith("0x")) return "";
  const hex = evmAddr.slice(2);
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bech32Encode("rai", bytes);
}

export function raiToEvm(raiAddr) {
  if (!raiAddr || !raiAddr.startsWith("rai1")) return "";
  const data = raiAddr.slice(4);
  const values = [];
  for (let i = 0; i < data.length - 6; i++) {
    values.push(ALPHABET.indexOf(data[i]));
  }
  const bytes = [];
  let acc = 0, bits = 0;
  for (let i = 0; i < values.length; i++) {
    acc = (acc << 5) | values[i];
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((acc >> bits) & 255);
    }
  }
  return "0x" + bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function shortenAddress(addr) {
  if (!addr) return "";
  if (addr.startsWith("0x")) return addr.slice(0, 6) + "..." + addr.slice(-4);
  return addr.slice(0, 10) + "..." + addr.slice(-6);
}
BECH32EOF

# ============================================================
# 3. src/app/utils/constants.js — Chain config & tokens
# ============================================================
cat << 'CONSTEOF' > src/app/utils/constants.js
// Republic AI Network configuration
export const REPUBLIC_CHAIN = {
  chainId: "raitestnet_77701-1",
  chainName: "Republic AI Testnet",
  rpc: "https://rpc.republicai.io",
  rest: "https://rest.republicai.io",
  evmRpc: "https://evm-rpc.republicai.io",
  grpc: "grpc.republicai.io:443",
  evmChainIdHex: "0x12F85",
  pointsPortal: "https://points.republicai.io/?ref=071B43",
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

// Default token list
export const DEFAULT_TOKENS = [
  { symbol: "RAI",  name: "Republic AI",  icon: "\u25C6", color: "#00E5A0", decimals: 18 },
  { symbol: "WRAI", name: "Wrapped RAI",  icon: "\u25C7", color: "#00C489", decimals: 18 },
  { symbol: "USDC", name: "USD Coin",     icon: "\u25CE", color: "#2775CA", decimals: 6 },
  { symbol: "USDT", name: "Tether",       icon: "\u20AE", color: "#50AF95", decimals: 6 },
  { symbol: "WETH", name: "Wrapped ETH",  icon: "\u27E0", color: "#627EEA", decimals: 18 },
  { symbol: "WBTC", name: "Wrapped BTC",  icon: "\u20BF", color: "#F7931A", decimals: 8 },
];

export const TABS = ["swap", "shield", "unshield"];

export const FOOTER_LINKS = [
  ["Republic AI Network", "https://republicai.io"],
  ["Points Portal", "https://points.republicai.io/?ref=071B43"],
  ["Docs", "https://docs.republicai.io"],
  ["Keplr Wallet", "https://www.keplr.app"],
];
CONSTEOF

# ============================================================
# 4. src/app/hooks/useWallet.js — All wallet logic
# ============================================================
cat << 'WALLETEOF' > src/app/hooks/useWallet.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { REPUBLIC_CHAIN } from "../utils/constants";

export function useWallet() {
  const { open: openAppKit } = useAppKit();
  const { address: appKitAddress, isConnected: appKitConnected } = useAppKitAccount();
  const { disconnect: appKitDisconnect } = useDisconnect();

  const [wallet, setWallet] = useState(null);
  const [raiBalance, setRaiBalance] = useState("0.00");
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [toast, setToast] = useState(null);

  const walletMenuRef = useRef(null);

  // Toast helper
  const showToast = useCallback((type, msg, duration = 3000) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), duration);
  }, []);

  // Fetch RAI balance via Cosmos REST
  const fetchCosmosBalance = useCallback(async (addr) => {
    try {
      const res = await fetch(
        REPUBLIC_CHAIN.rest + "/cosmos/bank/v1beta1/balances/" + addr
      );
      const data = await res.json();
      const raiBal = data.balances?.find((b) => b.denom === "arai");
      if (raiBal) {
        return (parseFloat(raiBal.amount) / 1e18).toFixed(4);
      }
    } catch (e) {
      console.log("Cosmos balance fetch error:", e);
    }
    return "0.00";
  }, []);

  // Fetch RAI balance via EVM RPC
  const fetchEvmBalance = useCallback(async (addr) => {
    try {
      const res = await fetch(REPUBLIC_CHAIN.evmRpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [addr, "latest"],
          id: 1,
        }),
      });
      const data = await res.json();
      return (parseInt(data.result, 16) / 1e18).toFixed(4);
    } catch (e) {
      console.log("EVM balance fetch error:", e);
    }
    return "0.00";
  }, []);

  // Switch EVM wallet to Republic AI chain
  const switchToRepublicChain = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: REPUBLIC_CHAIN.evmChainIdHex }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: REPUBLIC_CHAIN.evmChainIdHex,
              chainName: REPUBLIC_CHAIN.chainName,
              nativeCurrency: { name: "RAI", symbol: "RAI", decimals: 18 },
              rpcUrls: [REPUBLIC_CHAIN.evmRpc],
            },
          ],
        });
      }
    }
  }, []);

  // Connect via Keplr (Cosmos native)
  const connectKeplr = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!window.keplr) {
      showToast("error", "Keplr wallet not found. Please install the Keplr extension.", 4000);
      window.open("https://www.keplr.app/download", "_blank");
      return;
    }
    try {
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
      const signer = window.keplr.getOfflineSigner(REPUBLIC_CHAIN.chainId);
      const accounts = await signer.getAccounts();

      if (accounts?.length > 0) {
        const addr = accounts[0].address;
        setWallet({ address: addr, type: "keplr" });
        const bal = await fetchCosmosBalance(addr);
        setRaiBalance(bal);
        showToast("success", "Connected to Republic AI Testnet");
      }
    } catch (err) {
      console.error("Keplr connect error:", err);
      showToast("error", "Failed to connect. Check Keplr and try again.", 4000);
    }
  }, [fetchCosmosBalance, showToast]);

  // Connect via EVM (Reown AppKit)
  const connectEVM = useCallback(() => {
    openAppKit();
  }, [openAppKit]);

  // Watch AppKit connection state
  useEffect(() => {
    if (appKitConnected && appKitAddress) {
      setWallet({ address: appKitAddress, type: "evm" });

      (async () => {
        await switchToRepublicChain();
        const bal = await fetchEvmBalance(appKitAddress);
        setRaiBalance(bal);
      })();

      showToast("success", "Connected via EVM Wallet");
    }
  }, [appKitConnected, appKitAddress, switchToRepublicChain, fetchEvmBalance, showToast]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (appKitConnected) appKitDisconnect();
    setWallet(null);
    setRaiBalance("0.00");
    setShowWalletMenu(false);
    showToast("info", "Wallet disconnected", 2500);
  }, [appKitConnected, appKitDisconnect, showToast]);

  // Close wallet menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (walletMenuRef.current && !walletMenuRef.current.contains(e.target)) {
        setShowWalletMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    wallet,
    raiBalance,
    toast,
    showWalletMenu,
    setShowWalletMenu,
    showWalletPicker,
    setShowWalletPicker,
    walletMenuRef,
    connectKeplr,
    connectEVM,
    disconnect,
  };
}
WALLETEOF

# ============================================================
# 5. src/app/components/NeuralMesh.js — Animated background
# ============================================================
cat << 'MESHEOF' > src/app/components/NeuralMesh.js
"use client";
import { useRef, useEffect } from "react";

const NODE_COUNT = 50;
const CONNECT_DIST = 180;

export default function NeuralMesh() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(0, 229, 160, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw & update nodes
      for (const n of nodes) {
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
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}
MESHEOF

# ============================================================
# 6. src/app/components/Toast.js
# ============================================================
cat << 'TOASTEOF' > src/app/components/Toast.js
"use client";

export default function Toast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const color = isError ? "#ff5050" : "#00E5A0";
  const bg = isError ? "rgba(255,80,80,0.12)" : "rgba(0,229,160,0.12)";
  const border = isError ? "rgba(255,80,80,0.3)" : "rgba(0,229,160,0.3)";
  const icon = toast.type === "success" ? "\u2713" : isError ? "\u2717" : "\u2139";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "14px",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        zIndex: 200,
        animation: "toastIn .3s ease",
        backdropFilter: "blur(12px)",
        fontFamily: "Outfit",
        fontWeight: 600,
        fontSize: "14px",
        color,
      }}
    >
      {icon} {toast.msg}
    </div>
  );
}
TOASTEOF

# ============================================================
# 7. src/app/components/TokenModal.js
# ============================================================
cat << 'TMODALEOF' > src/app/components/TokenModal.js
"use client";
import { useState } from "react";

export default function TokenModal({ isOpen, onClose, onSelect, tokens }) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filtered = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.name.toLowerCase().includes(query.toLowerCase())
  );

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
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, #080f0c, #0c1a14, #080f0c)",
          border: "1px solid rgba(0,229,160,0.1)",
          borderRadius: "24px",
          padding: "24px",
          width: "400px",
          maxWidth: "92vw",
          maxHeight: "480px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontFamily: "Outfit", fontSize: "17px", fontWeight: 700, color: "#e6fff5" }}>
            Select Token
          </span>
          <button
            onClick={onClose}
            style={{
              width: "32px", height: "32px", borderRadius: "10px",
              background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.12)",
              color: "#00E5A0", cursor: "pointer", fontSize: "14px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <input
          placeholder="Search token..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            background: "rgba(0,229,160,0.04)",
            border: "1px solid rgba(0,229,160,0.1)",
            borderRadius: "14px",
            padding: "12px 16px",
            color: "#e6fff5",
            fontSize: "14px",
            fontFamily: "Manrope",
            outline: "none",
            marginBottom: "12px",
          }}
        />

        {/* Token list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.map((t) => (
            <button
              key={t.symbol}
              onClick={() => { onSelect(t); onClose(); }}
              style={{
                display: "flex", alignItems: "center", width: "100%",
                padding: "12px 14px", background: "transparent", border: "none",
                borderRadius: "14px", cursor: "pointer", transition: "background .15s",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,229,160,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div
                style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: `${t.color}18`, border: `1px solid ${t.color}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", marginRight: "12px", flexShrink: 0,
                }}
              >
                {t.icon}
              </div>
              <div style={{ textAlign: "left", flex: 1 }}>
                <div style={{ color: "#e6fff5", fontWeight: 600, fontSize: "14px", fontFamily: "Outfit" }}>
                  {t.symbol}
                </div>
                <div style={{ color: "#4a8a70", fontSize: "12px", fontFamily: "Manrope" }}>
                  {t.name}
                </div>
              </div>
              <div style={{ color: "#4a8a70", fontSize: "13px", fontFamily: "JetBrains Mono" }}>
                {t.balance || "0.00"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
TMODALEOF

# ============================================================
# 8. src/app/components/WalletPicker.js
# ============================================================
cat << 'WPEOF' > src/app/components/WalletPicker.js
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
WPEOF

# ============================================================
# 9. src/app/components/TokenInput.js
# ============================================================
cat << 'TIEOF' > src/app/components/TokenInput.js
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
TIEOF

# ============================================================
# 10. src/app/components/SwapInfo.js
# ============================================================
cat << 'SIEOF' > src/app/components/SwapInfo.js
"use client";

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
      <span style={{ fontSize: "12px", color: "#2a5c47" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>{value}</span>
    </div>
  );
}

export default function SwapInfo({ from, to, shielded }) {
  const rate = from.symbol === "RAI" ? "2.45" : "0.408";

  return (
    <div
      style={{
        marginTop: "14px",
        padding: "12px 16px",
        background: "rgba(0,229,160,0.02)",
        borderRadius: "12px",
        border: "1px solid rgba(0,229,160,0.04)",
      }}
    >
      <InfoRow label="Rate" value={`1 ${from.symbol} \u2248 ${rate} ${to.symbol}`} />
      <InfoRow label="Slippage" value="0.5%" />
      <InfoRow label="Gas Fee" value="~0.001 RAI" />
      <InfoRow label="Network" value="Republic AI Testnet" />
      {shielded && (
        <div
          style={{
            display: "flex", justifyContent: "space-between",
            marginTop: "6px", paddingTop: "6px",
            borderTop: "1px solid rgba(0,229,160,0.06)",
          }}
        >
          <span style={{ fontSize: "12px", color: "#00E5A0", fontWeight: 600 }}>
            🛡 Privacy Mode
          </span>
          <span style={{ fontSize: "12px", color: "#00E5A0", fontFamily: "JetBrains Mono" }}>
            Active
          </span>
        </div>
      )}
    </div>
  );
}

export { InfoRow };
SIEOF

# ============================================================
# 11. src/app/components/Header.js — Top nav bar
# ============================================================
cat << 'HEADEREOF' > src/app/components/Header.js
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
HEADEREOF

# ============================================================
# 12. src/app/page.js — Clean orchestrator
# ============================================================
cat << 'PAGEEOF' > src/app/page.js
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
PAGEEOF

# ============================================================
# 13. src/app/providers.js — Clean (no changes needed)
# ============================================================
cat << 'PROVEOF' > src/app/providers.js
"use client";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

const republicAI = {
  id: 77701,
  name: "Republic AI Testnet",
  nativeCurrency: { name: "RAI", symbol: "RAI", decimals: 18 },
  rpcUrls: { default: { http: ["https://evm-rpc.republicai.io"] } },
};

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

createAppKit({
  adapters: [new EthersAdapter()],
  projectId,
  networks: [republicAI],
  defaultNetwork: republicAI,
  metadata: {
    name: "DoubleLight",
    description: "Privacy DEX on Republic AI",
    url: "https://doublelight.fun",
    icons: ["https://doublelight.fun/favicon.ico"],
  },
  themeMode: "dark",
  features: { analytics: false, socials: false, email: false },
  chainImages: {},
  enableWalletConnect: true,
  allowUnsupportedChain: false,
});

export function Web3Provider({ children }) {
  return <>{children}</>;
}
PROVEOF

# ============================================================
# 14. src/app/layout.js — Clean
# ============================================================
cat << 'LAYOUTEOF' > src/app/layout.js
import { Web3Provider } from "./providers";

export const metadata = {
  title: "DoubleLight — Private Swap on Republic AI",
  description:
    "Privacy-first decentralized token swap on Republic AI Network. Shield, swap, and unshield with zero-knowledge privacy.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
LAYOUTEOF

echo ""
echo "✅ Refactor done! File structure:"
echo ""
find src/app -name "*.js" | sort | head -20
echo ""
echo "Next: npx next build"
