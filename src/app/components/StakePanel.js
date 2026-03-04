"use client";
import { useState } from "react";

const POOLS = [
  {
    id: "miner-alpha",
    name: "Miner Pool Alpha",
    desc: "GPU cluster scaling — A100 fleet expansion",
    apy: "24.5",
    totalStaked: "45,200",
    miners: 12,
    capacity: "78",
    risk: "LOW",
    riskColor: "#00E5A0",
  },
  {
    id: "miner-beta",
    name: "Miner Pool Beta",
    desc: "Inference node deployment — low-latency serving",
    apy: "31.2",
    totalStaked: "28,900",
    miners: 8,
    capacity: "62",
    risk: "MEDIUM",
    riskColor: "#FFD54F",
  },
  {
    id: "miner-gamma",
    name: "Miner Pool Gamma",
    desc: "Training cluster — large model fine-tuning",
    apy: "42.8",
    totalStaked: "12,100",
    miners: 4,
    capacity: "35",
    risk: "HIGH",
    riskColor: "#FF8A50",
  },
];

function PoolCard({ pool, selected, onClick }) {
  const isActive = selected === pool.id;
  return (
    <button
      onClick={() => onClick(pool.id)}
      style={{
        width: "100%", textAlign: "left", padding: "14px 16px",
        background: isActive ? "rgba(0,229,160,0.06)" : "rgba(0,229,160,0.015)",
        border: `1px solid ${isActive ? "rgba(0,229,160,0.2)" : "rgba(0,229,160,0.06)"}`,
        borderRadius: "16px", cursor: "pointer", transition: "all .2s",
        marginBottom: "8px", color: "#e6fff5",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.borderColor = "rgba(0,229,160,0.12)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.borderColor = "rgba(0,229,160,0.06)";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "14px" }}>{pool.name}</div>
        <span
          style={{
            fontSize: "10px", fontFamily: "JetBrains Mono", fontWeight: 700,
            padding: "3px 8px", borderRadius: "6px",
            background: pool.riskColor + "15", color: pool.riskColor,
            border: `1px solid ${pool.riskColor}30`,
          }}
        >
          {pool.risk}
        </span>
      </div>

      <div style={{ fontSize: "11px", color: "#2a5c47", marginBottom: "10px", fontFamily: "Manrope", lineHeight: 1.4 }}>
        {pool.desc}
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "2px" }}>APY</div>
          <div style={{ fontSize: "16px", fontFamily: "Outfit", fontWeight: 700, color: "#00E5A0" }}>{pool.apy}%</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "2px" }}>Staked</div>
          <div style={{ fontSize: "13px", fontFamily: "JetBrains Mono", fontWeight: 500, color: "#5a9a80" }}>{pool.totalStaked} RAI</div>
        </div>
        <div>
          <div style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "2px" }}>Miners</div>
          <div style={{ fontSize: "13px", fontFamily: "JetBrains Mono", fontWeight: 500, color: "#5a9a80" }}>{pool.miners}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <div style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "2px" }}>Capacity</div>
          {/* Mini progress bar */}
          <div style={{ width: "60px", height: "6px", borderRadius: "3px", background: "rgba(0,229,160,0.08)", overflow: "hidden" }}>
            <div style={{ width: pool.capacity + "%", height: "100%", borderRadius: "3px", background: parseInt(pool.capacity) > 70 ? "#FFD54F" : "#00E5A0", transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: "10px", color: "#4a8a70", fontFamily: "JetBrains Mono", marginTop: "2px" }}>{pool.capacity}%</div>
        </div>
      </div>
    </button>
  );
}

export default function StakePanel({ wallet, onConnect }) {
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [staking, setStaking] = useState(false);

  const selectedPool = POOLS.find((p) => p.id === selected);

  const handleStake = () => {
    if (!wallet) { onConnect(); return; }
    if (!selected || !amount) return;
    setStaking(true);
    setTimeout(() => setStaking(false), 2500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "17px", color: "#e6fff5" }}>
            Miner Staking Pools
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "Manrope", lineHeight: 1.5, maxWidth: "340px", margin: "0 auto" }}>
          Stake RAI to fund compute miners on Republic AI. Earn yield from compute fees generated by the network.
        </div>
      </div>

      {/* AI Allocation badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 12px", borderRadius: "10px", marginBottom: "12px",
        background: "rgba(0,229,160,0.02)", border: "1px solid rgba(0,229,160,0.05)",
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20h6v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z" />
        </svg>
        <span style={{ fontSize: "10px", color: "#4a8a70", fontFamily: "JetBrains Mono" }}>
          AI-optimized allocation — risk scored by DL-Risk-v0.1
        </span>
      </div>

      {/* Pool list */}
      {POOLS.map((pool) => (
        <PoolCard key={pool.id} pool={pool} selected={selected} onClick={setSelected} />
      ))}

      {/* Stake input */}
      {selected && (
        <div style={{ marginTop: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500, fontFamily: "Manrope" }}>Stake Amount</span>
            <span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "JetBrains Mono" }}>
              Est. return: <span style={{ color: "#00E5A0" }}>
                {amount ? (parseFloat(amount) * parseFloat(selectedPool.apy) / 100).toFixed(2) : "0.00"} RAI/yr
              </span>
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(0,229,160,0.025)", border: "1px solid rgba(0,229,160,0.08)",
            borderRadius: "14px", padding: "12px 16px",
          }}>
            <input
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#e6fff5", fontSize: "24px", fontFamily: "Outfit", fontWeight: 700,
              }}
            />
            <span style={{ fontSize: "14px", fontFamily: "Outfit", fontWeight: 700, color: "#00E5A0" }}>RAI</span>
          </div>
        </div>
      )}

      {/* Stake button */}
      <button
        onClick={handleStake}
        disabled={staking}
        style={{
          width: "100%", marginTop: "16px", padding: "16px",
          borderRadius: "16px", border: "none",
          background: staking
            ? "rgba(0,229,160,0.04)"
            : !wallet
            ? "linear-gradient(135deg, #00E5A0, #00B37D)"
            : !selected
            ? "rgba(0,229,160,0.06)"
            : "linear-gradient(135deg, #00E5A0, #00C48E)",
          color: staking ? "#2a5c47" : (!wallet || selected) ? "#050b08" : "#2a5c47",
          fontFamily: "Outfit", fontWeight: 700, fontSize: "15px",
          cursor: staking || (!wallet && false) ? "not-allowed" : "pointer",
          transition: "all .25s",
          boxShadow: selected && !staking ? "0 4px 20px rgba(0,229,160,0.15)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        {staking && (
          <div style={{ width: "16px", height: "16px", border: "2px solid rgba(0,229,160,0.2)", borderTop: "2px solid #00E5A0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        )}
        {staking ? "Staking..." : !wallet ? "Connect Wallet" : !selected ? "Select a Pool" : `Stake RAI in ${selectedPool.name}`}
      </button>

      {/* Simulated notice */}
      <div style={{
        marginTop: "10px", padding: "8px 12px", borderRadius: "8px",
        background: "rgba(255,213,79,0.03)", border: "1px solid rgba(255,213,79,0.06)",
        fontSize: "10px", color: "#8a7a3a", fontFamily: "JetBrains Mono", textAlign: "center",
      }}>
        Simulated pools — pending mainnet launch
      </div>
    </div>
  );
}
