"use client";
import { useState, useEffect, useMemo } from "react";

// ============================================================
// AI Risk Analysis Engine (simulated on-chain inference)
// This will be replaced with real Republic AI compute layer
// inference calls when SDK is available
// ============================================================
function analyzeSwapRisk({ fromToken, toToken, amount, liquidity }) {
  if (!amount || parseFloat(amount) <= 0) return null;

  const amt = parseFloat(amount);

  // Simulated liquidity pools (replace with real on-chain data)
  const pools = {
    "RAI-USDC": { depth: 125000, vol24h: 45000, volatility: 0.12 },
    "RAI-USDT": { depth: 98000, vol24h: 32000, volatility: 0.11 },
    "RAI-WETH": { depth: 67000, vol24h: 28000, volatility: 0.18 },
    "RAI-WBTC": { depth: 42000, vol24h: 15000, volatility: 0.22 },
    "RAI-WRAI": { depth: 200000, vol24h: 80000, volatility: 0.02 },
  };

  const pairKey =
    pools[`${fromToken}-${toToken}`] ? `${fromToken}-${toToken}` :
    pools[`${toToken}-${fromToken}`] ? `${toToken}-${fromToken}` :
    "RAI-USDC";

  const pool = pools[pairKey] || pools["RAI-USDC"];

  // --- Slippage model ---
  // Simplified constant-product AMM slippage: slippage ≈ amount / (liquidity_depth + amount)
  const amtUsd = fromToken === "RAI" ? amt * 2.45 : amt;
  const slippagePct = (amtUsd / (pool.depth + amtUsd)) * 100;

  // --- Price impact ---
  const priceImpact = (amtUsd / pool.depth) * 100;

  // --- Volatility risk ---
  // Higher volatility = higher chance of price movement during tx
  const volRisk = pool.volatility * 100;

  // --- Liquidity score ---
  // How much of the pool this trade consumes
  const liquidityUsage = (amtUsd / pool.depth) * 100;

  // --- Composite risk score (0-100) ---
  const riskScore = Math.min(100, Math.round(
    slippagePct * 15 +          // slippage weight
    priceImpact * 10 +          // price impact weight
    volRisk * 2 +               // volatility weight
    liquidityUsage * 3 +        // liquidity depth weight
    (amtUsd > pool.depth * 0.1 ? 20 : 0)  // large trade penalty
  ));

  // --- Confidence ---
  // Higher liquidity & volume = more data = higher confidence
  const dataQuality = Math.min(100, Math.round(
    (pool.vol24h / 10000) * 30 +
    (pool.depth / 50000) * 40 +
    30 // base confidence
  ));

  // --- Risk level ---
  const level =
    riskScore < 20 ? "low" :
    riskScore < 50 ? "medium" :
    riskScore < 75 ? "high" : "critical";

  // --- Recommendation ---
  const recommendations = {
    low: "Trade conditions are favorable. Proceed with confidence.",
    medium: "Moderate risk detected. Consider reducing trade size or setting tighter slippage.",
    high: "High risk — significant slippage expected. Split into smaller trades recommended.",
    critical: "Extreme risk. Trade size exceeds safe pool capacity. Strongly recommend splitting.",
  };

  // --- Factors ---
  const factors = [];

  if (slippagePct < 0.5) {
    factors.push({ label: "Slippage", value: `${slippagePct.toFixed(3)}%`, status: "good" });
  } else if (slippagePct < 2) {
    factors.push({ label: "Slippage", value: `${slippagePct.toFixed(3)}%`, status: "warn" });
  } else {
    factors.push({ label: "Slippage", value: `${slippagePct.toFixed(3)}%`, status: "bad" });
  }

  if (priceImpact < 1) {
    factors.push({ label: "Price Impact", value: `${priceImpact.toFixed(3)}%`, status: "good" });
  } else if (priceImpact < 5) {
    factors.push({ label: "Price Impact", value: `${priceImpact.toFixed(3)}%`, status: "warn" });
  } else {
    factors.push({ label: "Price Impact", value: `${priceImpact.toFixed(3)}%`, status: "bad" });
  }

  factors.push({
    label: "Volatility (24h)",
    value: `${volRisk.toFixed(1)}%`,
    status: volRisk < 10 ? "good" : volRisk < 20 ? "warn" : "bad",
  });

  factors.push({
    label: "Pool Depth",
    value: `$${pool.depth.toLocaleString()}`,
    status: liquidityUsage < 5 ? "good" : liquidityUsage < 20 ? "warn" : "bad",
  });

  factors.push({
    label: "24h Volume",
    value: `$${pool.vol24h.toLocaleString()}`,
    status: pool.vol24h > 30000 ? "good" : pool.vol24h > 10000 ? "warn" : "bad",
  });

  return {
    riskScore,
    level,
    slippagePct,
    priceImpact,
    confidence: Math.min(dataQuality, 95),
    recommendation: recommendations[level],
    factors,
    modelVersion: "DL-Risk-v0.1",
    inferenceNote: "Simulated — pending Republic AI compute layer integration",
  };
}

// ============================================================
// Risk level colors & labels
// ============================================================
const RISK_CONFIG = {
  low:      { color: "#00E5A0", bg: "rgba(0,229,160,0.08)", label: "LOW RISK",      icon: "✓" },
  medium:   { color: "#FFD54F", bg: "rgba(255,213,79,0.08)", label: "MEDIUM RISK",   icon: "⚠" },
  high:     { color: "#FF8A50", bg: "rgba(255,138,80,0.08)", label: "HIGH RISK",     icon: "⚡" },
  critical: { color: "#FF5050", bg: "rgba(255,80,80,0.08)",  label: "CRITICAL RISK", icon: "✗" },
};

const STATUS_COLORS = {
  good: "#00E5A0",
  warn: "#FFD54F",
  bad:  "#FF5050",
};

// ============================================================
// Animated risk score ring
// ============================================================
function RiskRing({ score, level }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = RISK_CONFIG[level];

  useEffect(() => {
    let frame;
    let current = 0;
    const step = () => {
      current += Math.max(1, (score - current) * 0.08);
      if (current >= score - 0.5) {
        setAnimatedScore(score);
        return;
      }
      setAnimatedScore(Math.round(current));
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div style={{ position: "relative", width: "96px", height: "96px", flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        {/* Background ring */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6"
        />
        {/* Score ring */}
        <circle
          cx="48" cy="48" r={radius}
          fill="none" stroke={config.color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            transition: "stroke-dashoffset 0.3s ease",
            filter: `drop-shadow(0 0 6px ${config.color}40)`,
          }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono", fontWeight: 700,
            fontSize: "22px", color: config.color, lineHeight: 1,
          }}
        >
          {animatedScore}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono", fontSize: "8px",
            color: "#2a5c47", letterSpacing: "1px", marginTop: "2px",
          }}
        >
          /100
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Confidence bar
// ============================================================
function ConfidenceBar({ confidence }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
      <span style={{ fontSize: "11px", color: "#2a5c47", fontFamily: "JetBrains Mono", minWidth: "78px" }}>
        Confidence
      </span>
      <div
        style={{
          flex: 1, height: "4px", borderRadius: "2px",
          background: "rgba(255,255,255,0.04)", overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${confidence}%`, height: "100%", borderRadius: "2px",
            background: confidence > 70 ? "#00E5A0" : confidence > 40 ? "#FFD54F" : "#FF5050",
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "11px", fontFamily: "JetBrains Mono", fontWeight: 600,
          color: confidence > 70 ? "#00E5A0" : confidence > 40 ? "#FFD54F" : "#FF5050",
          minWidth: "32px", textAlign: "right",
        }}
      >
        {confidence}%
      </span>
    </div>
  );
}

// ============================================================
// Factor row
// ============================================================
function FactorRow({ label, value, status }) {
  return (
    <div
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <div
          style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: STATUS_COLORS[status],
            boxShadow: `0 0 4px ${STATUS_COLORS[status]}60`,
          }}
        />
        <span style={{ fontSize: "12px", color: "#4a8a70", fontFamily: "Manrope" }}>
          {label}
        </span>
      </div>
      <span
        style={{
          fontSize: "12px", fontFamily: "JetBrains Mono", fontWeight: 600,
          color: STATUS_COLORS[status],
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================
// Main AI Risk Panel
// ============================================================
export default function AIRiskPanel({ fromToken, toToken, amount }) {
  const [expanded, setExpanded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const analysis = useMemo(
    () => analyzeSwapRisk({ fromToken: fromToken.symbol, toToken: toToken.symbol, amount }),
    [fromToken.symbol, toToken.symbol, amount]
  );

  // Re-trigger animation when inputs change
  useEffect(() => {
    if (!analysis) {
      setShowResult(false);
      return;
    }
    setAnalyzing(true);
    setShowResult(false);
    const timer = setTimeout(() => {
      setAnalyzing(false);
      setShowResult(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [fromToken.symbol, toToken.symbol, amount]);

  if (!amount || parseFloat(amount) <= 0) return null;

  const config = analysis ? RISK_CONFIG[analysis.level] : RISK_CONFIG.low;

  return (
    <div
      style={{
        marginTop: "14px",
        background: "rgba(0,229,160,0.015)",
        border: `1px solid ${showResult ? config.color + "20" : "rgba(0,229,160,0.06)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header bar */}
      <div
        onClick={() => analysis && setExpanded((prev) => !prev)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          cursor: analysis ? "pointer" : "default",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* AI icon */}
          <div
            style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,179,125,0.1))",
              border: "1px solid rgba(0,229,160,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20h6v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8z"/>
              <path d="M10 20v1a2 2 0 1 0 4 0v-1"/>
              <path d="M9 10h1.5v2H9z"/>
              <path d="M13.5 10H15v2h-1.5z"/>
            </svg>
          </div>
          <div>
            <div
              style={{
                fontFamily: "Outfit", fontWeight: 700, fontSize: "13px",
                color: "#e6fff5", letterSpacing: "0.2px",
              }}
            >
              AI Risk Analysis
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono", fontSize: "9px",
                color: "#2a5c47", letterSpacing: "0.5px",
              }}
            >
              POWERED BY REPUBLIC AI
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {analyzing && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 10px", borderRadius: "8px",
                background: "rgba(0,229,160,0.06)",
              }}
            >
              <div
                style={{
                  width: "12px", height: "12px", border: "2px solid rgba(0,229,160,0.3)",
                  borderTop: "2px solid #00E5A0", borderRadius: "50%",
                  animation: "aiSpin 0.8s linear infinite",
                }}
              />
              <span style={{ fontSize: "11px", color: "#00E5A0", fontFamily: "JetBrains Mono" }}>
                Analyzing...
              </span>
            </div>
          )}

          {showResult && analysis && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 10px", borderRadius: "8px",
                background: config.bg,
                border: `1px solid ${config.color}25`,
              }}
            >
              <span style={{ fontSize: "12px" }}>{config.icon}</span>
              <span
                style={{
                  fontSize: "11px", fontFamily: "JetBrains Mono",
                  fontWeight: 700, color: config.color, letterSpacing: "0.5px",
                }}
              >
                {config.label}
              </span>
            </div>
          )}

          {analysis && (
            <span
              style={{
                fontSize: "14px", color: "#2a5c47",
                transform: expanded ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s",
              }}
            >
              ▾
            </span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && showResult && analysis && (
        <div style={{ padding: "0 16px 16px", animation: "fadeIn 0.3s ease" }}>
          <div style={{ borderTop: "1px solid rgba(0,229,160,0.06)", paddingTop: "14px" }}>
            {/* Score ring + recommendation */}
            <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "16px" }}>
              <RiskRing score={analysis.riskScore} level={analysis.level} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px", color: "#e6fff5", fontFamily: "Manrope",
                    lineHeight: 1.5, marginBottom: "8px",
                  }}
                >
                  {analysis.recommendation}
                </div>
                <ConfidenceBar confidence={analysis.confidence} />
              </div>
            </div>

            {/* Risk factors */}
            <div
              style={{
                background: "rgba(0,0,0,0.15)", borderRadius: "12px",
                padding: "10px 14px", marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "10px", color: "#2a5c47", fontFamily: "JetBrains Mono",
                  letterSpacing: "1px", marginBottom: "6px", fontWeight: 600,
                }}
              >
                RISK FACTORS
              </div>
              {analysis.factors.map((f) => (
                <FactorRow key={f.label} label={f.label} value={f.value} status={f.status} />
              ))}
            </div>

            {/* Model info */}
            <div
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 0 0",
                borderTop: "1px solid rgba(0,229,160,0.04)",
              }}
            >
              <span style={{ fontSize: "9px", color: "#1e4a38", fontFamily: "JetBrains Mono" }}>
                Model: {analysis.modelVersion}
              </span>
              <span style={{ fontSize: "9px", color: "#1e4a38", fontFamily: "JetBrains Mono", fontStyle: "italic" }}>
                {analysis.inferenceNote}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spinner animation */}
      <style>{`
        @keyframes aiSpin {
          0% { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }
      `}</style>
    </div>
  );
}
