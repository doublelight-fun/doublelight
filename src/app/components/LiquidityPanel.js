"use client";
import { useState } from "react";
import { TokenIcon } from "./TokenInput";
import { DEFAULT_TOKENS, TOKEN_ADDRESSES, AMM_ADDRESS, AMM_ABI, ERC20_ABI } from "../utils/constants";

const SWAPPABLE = DEFAULT_TOKENS.filter((t) => t.address);
const POOLS = [
  { a: "WRAI", b: "USDC" }, { a: "WRAI", b: "USDT" },
  { a: "WRAI", b: "WETH" }, { a: "WRAI", b: "WBTC" },
  { a: "USDC", b: "USDT" },
];

export default function LiquidityPanel({ wallet, onConnect, getProvider, onSuccess, tokenBalances }) {
  const [mode, setMode] = useState("add");
  const [tokenA, setTokenA] = useState(SWAPPABLE[0]);
  const [tokenB, setTokenB] = useState(SWAPPABLE[2]);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [lpAmount, setLpAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [lpInfo, setLpInfo] = useState(null);

  // Fetch pool info + user LP balance
  const fetchPoolInfo = async (tA, tB) => {
    if (!wallet?.address || !tA.address || !tB.address) return;
    try {
      const { ethers } = await import("ethers");
      const provider = new ethers.JsonRpcProvider("https://evm-rpc.republicai.io");
      const amm = new ethers.Contract(AMM_ADDRESS, AMM_ABI, provider);
      const [res0, res1, totalLP, exists] = await amm.getPoolInfo(tA.address, tB.address);
      const userLP = await amm.getUserLP(tA.address, tB.address, wallet.address);
      // AMM sorts tokens by address: lower address = tokenA
      const aIsFirst = tA.address.toLowerCase() < tB.address.toLowerCase();
      const resA = aIsFirst ? res0 : res1;
      const resB = aIsFirst ? res1 : res0;
      setLpInfo({
        reserveA: ethers.formatUnits(resA, tA.decimals),
        reserveB: ethers.formatUnits(resB, tB.decimals),
        totalLP: ethers.formatUnits(totalLP, 18),
        userLP: ethers.formatUnits(userLP, 18),
        exists,
      });
    } catch { setLpInfo(null); }
  };

  const handleAddLiquidity = async () => {
    if (!wallet) { onConnect(); return; }
    if (!amountA || !amountB) return;
    setProcessing(true); setError(null); setResult(null);
    try {
      const { ethers } = await import("ethers");
      const provider = getProvider();
      const signer = await provider.getSigner();
      const amtA = ethers.parseUnits(amountA, tokenA.decimals);
      const amtB = ethers.parseUnits(amountB, tokenB.decimals);
      const cA = new ethers.Contract(tokenA.address, ERC20_ABI, signer);
      const cB = new ethers.Contract(tokenB.address, ERC20_ABI, signer);
      let tx = await cA.approve(AMM_ADDRESS, amtA, { gasLimit: 200000 }); await tx.wait();
      tx = await cB.approve(AMM_ADDRESS, amtB, { gasLimit: 200000 }); await tx.wait();
      const amm = new ethers.Contract(AMM_ADDRESS, AMM_ABI, signer);
      tx = await amm.addLiquidity(tokenA.address, tokenB.address, amtA, amtB, { gasLimit: 500000 });
      const receipt = await tx.wait();
      setResult({ type: "add", tokenA: tokenA.symbol, tokenB: tokenB.symbol, amountA, amountB, txHash: receipt.hash });
      setAmountA(""); setAmountB("");
      if (onSuccess) onSuccess();
      fetchPoolInfo(tokenA, tokenB);
    } catch (err) { setError(err.reason || err.message || "Transaction failed"); }
    setProcessing(false);
  };

  const handleRemoveLiquidity = async () => {
    if (!wallet) { onConnect(); return; }
    if (!lpAmount) return;
    setProcessing(true); setError(null); setResult(null);
    try {
      const { ethers } = await import("ethers");
      const provider = getProvider();
      const signer = await provider.getSigner();
      const amm = new ethers.Contract(AMM_ADDRESS, AMM_ABI, signer);
      const lp = ethers.parseUnits(lpAmount, 18);
      const tx = await amm.removeLiquidity(tokenA.address, tokenB.address, lp, { gasLimit: 500000 });
      const receipt = await tx.wait();
      setResult({ type: "remove", tokenA: tokenA.symbol, tokenB: tokenB.symbol, lpAmount, txHash: receipt.hash });
      setLpAmount("");
      if (onSuccess) onSuccess();
      fetchPoolInfo(tokenA, tokenB);
    } catch (err) { setError(err.reason || err.message || "Transaction failed"); }
    setProcessing(false);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20" /></svg>
          <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "17px", color: "#e6fff5" }}>Liquidity Pools</span>
        </div>
        <div style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "Manrope", lineHeight: 1.5, maxWidth: "340px", margin: "0 auto" }}>
          Provide liquidity to earn 0.3% fees on every swap.
        </div>
      </div>

      <div style={{ display: "flex", background: "rgba(0,229,160,0.02)", borderRadius: "12px", padding: "3px", marginBottom: "16px", border: "1px solid rgba(0,229,160,0.05)" }}>
        {["add", "remove"].map((m) => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setError(null); }}
            style={{ flex: 1, padding: "8px", borderRadius: "10px", border: "none", background: mode === m ? "rgba(0,229,160,0.1)" : "transparent", color: mode === m ? "#00E5A0" : "#2a5c47", fontFamily: "Outfit", fontWeight: 600, fontSize: "12px", cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {m === "add" ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>}
            {m === "add" ? "Add Liquidity" : "Remove Liquidity"}
          </button>
        ))}
      </div>

      <div style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500, marginBottom: "6px", fontFamily: "Manrope" }}>Select Pool</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
        {POOLS.map((pool) => {
          const isActive = tokenA.symbol === pool.a && tokenB.symbol === pool.b;
          return (
            <button key={`${pool.a}-${pool.b}`}
              onClick={() => { const a = SWAPPABLE.find((t) => t.symbol === pool.a); const b = SWAPPABLE.find((t) => t.symbol === pool.b); setTokenA(a); setTokenB(b); setResult(null); setError(null); fetchPoolInfo(a, b); }}
              style={{ padding: "6px 12px", borderRadius: "10px", background: isActive ? "rgba(0,229,160,0.1)" : "rgba(0,229,160,0.02)", border: `1px solid ${isActive ? "rgba(0,229,160,0.2)" : "rgba(0,229,160,0.06)"}`, color: isActive ? "#00E5A0" : "#4a8a70", fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all .15s" }}>
              {pool.a}/{pool.b}
            </button>
          );
        })}
      </div>

      {lpInfo && lpInfo.exists && (
        <div style={{ padding: "10px 14px", borderRadius: "12px", marginBottom: "10px", background: "rgba(0,229,160,0.02)", border: "1px solid rgba(0,229,160,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope" }}>Pool Reserves</span>
            <span style={{ fontSize: "10px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>{parseFloat(lpInfo.reserveA).toFixed(2)} {tokenA.symbol} / {parseFloat(lpInfo.reserveB).toFixed(2)} {tokenB.symbol}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope" }}>Your LP Tokens</span>
            <span style={{ fontSize: "10px", color: "#00E5A0", fontFamily: "JetBrains Mono", fontWeight: 700 }}>{parseFloat(lpInfo.userLP).toFixed(6)}</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px", borderRadius: "14px", marginBottom: "14px", background: "rgba(0,229,160,0.02)", border: "1px solid rgba(0,229,160,0.06)" }}>
        <TokenIcon symbol={tokenA.symbol} color={tokenA.color} size={28} />
        <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "14px", color: "#e6fff5" }}>{tokenA.symbol}</span>
        <span style={{ color: "#2a5c47", fontSize: "14px" }}>/</span>
        <TokenIcon symbol={tokenB.symbol} color={tokenB.color} size={28} />
        <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "14px", color: "#e6fff5" }}>{tokenB.symbol}</span>
        <span style={{ marginLeft: "auto", fontSize: "9px", fontFamily: "JetBrains Mono", padding: "3px 8px", borderRadius: "6px", background: "rgba(0,229,160,0.08)", color: "#00E5A0" }}>0.3% FEE</span>
      </div>

      {mode === "add" ? (
        <>
          <div style={{ marginBottom: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "Manrope" }}>{tokenA.symbol} Amount</span><span style={{ fontSize: "11px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>Bal: {tokenBalances?.[tokenA.symbol] ? parseFloat(tokenBalances[tokenA.symbol]).toFixed(4) : "0.00"}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,229,160,0.025)", border: "1px solid rgba(0,229,160,0.08)", borderRadius: "14px", padding: "12px 16px" }}>
              <input type="text" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e6fff5", fontSize: "22px", fontFamily: "Outfit", fontWeight: 700 }} />
              <span style={{ fontSize: "13px", fontFamily: "Outfit", fontWeight: 700, color: tokenA.color }}>{tokenA.symbol}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2a5c47" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}><span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "Manrope" }}>{tokenB.symbol} Amount</span><span style={{ fontSize: "11px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>Bal: {tokenBalances?.[tokenB.symbol] ? parseFloat(tokenBalances[tokenB.symbol]).toFixed(4) : "0.00"}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,229,160,0.025)", border: "1px solid rgba(0,229,160,0.08)", borderRadius: "14px", padding: "12px 16px" }}>
              <input type="text" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e6fff5", fontSize: "22px", fontFamily: "Outfit", fontWeight: 700 }} />
              <span style={{ fontSize: "13px", fontFamily: "Outfit", fontWeight: 700, color: tokenB.color }}>{tokenB.symbol}</span>
            </div>
          </div>
        </>
      ) : (
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "Manrope" }}>LP Tokens to Remove</span>
            {lpInfo && <span onClick={() => setLpAmount(lpInfo.userLP)} style={{ fontSize: "11px", color: "#00E5A0", fontFamily: "JetBrains Mono", cursor: "pointer" }}>Max: {parseFloat(lpInfo.userLP).toFixed(6)}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,229,160,0.025)", border: "1px solid rgba(0,229,160,0.08)", borderRadius: "14px", padding: "12px 16px" }}>
            <input type="text" placeholder="0.0" value={lpAmount} onChange={(e) => setLpAmount(e.target.value)}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e6fff5", fontSize: "22px", fontFamily: "Outfit", fontWeight: 700 }} />
            <span style={{ fontSize: "13px", fontFamily: "Outfit", fontWeight: 700, color: "#00E5A0" }}>LP</span>
          </div>
        </div>
      )}

      {result && (
        <div style={{ padding: "12px 14px", borderRadius: "12px", marginBottom: "12px", background: "rgba(0,229,160,0.04)", border: "1px solid rgba(0,229,160,0.1)" }}>
          <div style={{ fontSize: "12px", fontFamily: "Outfit", fontWeight: 700, color: "#00E5A0", marginBottom: "6px" }}>{result.type === "add" ? "Liquidity Added" : "Liquidity Removed"}</div>
          <div style={{ fontSize: "11px", fontFamily: "JetBrains Mono", color: "#5a9a80", lineHeight: 1.6 }}>
            {result.type === "add" ? `${result.amountA} ${result.tokenA} + ${result.amountB} ${result.tokenB}` : `${result.lpAmount} LP tokens burned`}
          </div>
          <div style={{ fontSize: "10px", fontFamily: "JetBrains Mono", color: "#2a5c47", marginTop: "4px" }}>tx: {result.txHash?.slice(0, 10)}...{result.txHash?.slice(-8)}</div>
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: "12px", marginBottom: "12px", background: "rgba(255,80,80,0.04)", border: "1px solid rgba(255,80,80,0.1)", fontSize: "11px", fontFamily: "JetBrains Mono", color: "#ff6b6b" }}>{error}</div>
      )}

      <button onClick={mode === "add" ? handleAddLiquidity : handleRemoveLiquidity} disabled={processing}
        style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "none", background: processing ? "rgba(0,229,160,0.04)" : !wallet ? "linear-gradient(135deg, #00E5A0, #00B37D)" : "linear-gradient(135deg, #00E5A0, #00C48E)", color: processing ? "#2a5c47" : "#050b08", fontFamily: "Outfit", fontWeight: 700, fontSize: "15px", cursor: processing ? "not-allowed" : "pointer", transition: "all .25s", boxShadow: !processing ? "0 4px 20px rgba(0,229,160,0.15)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        {processing && <div style={{ width: "16px", height: "16px", border: "2px solid rgba(0,229,160,0.2)", borderTop: "2px solid #00E5A0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
        {processing ? "Processing..." : !wallet ? "Connect Wallet" : mode === "add" ? `Add ${tokenA.symbol}/${tokenB.symbol} Liquidity` : `Remove ${tokenA.symbol}/${tokenB.symbol} Liquidity`}
      </button>
    </div>
  );
}
