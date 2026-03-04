"use client";
import { useState } from "react";

const MODELS = [
  {
    id: "llm-7b",
    name: "Republic LLM 7B",
    type: "Text Generation",
    costPerReq: "0.002",
    latency: "~120ms",
    status: "live",
    requests24h: "12.4K",
    accuracy: "92.1",
  },
  {
    id: "risk-v1",
    name: "DL-Risk-v0.1",
    type: "Swap Risk Analysis",
    costPerReq: "0.001",
    latency: "~80ms",
    status: "live",
    requests24h: "8.2K",
    accuracy: "94.6",
  },
  {
    id: "price-pred",
    name: "PriceSeer-v1",
    type: "Price Prediction",
    costPerReq: "0.003",
    latency: "~200ms",
    status: "coming",
    requests24h: "—",
    accuracy: "—",
  },
  {
    id: "fraud-detect",
    name: "GuardNet-v1",
    type: "Fraud Detection",
    costPerReq: "0.002",
    latency: "~150ms",
    status: "coming",
    requests24h: "—",
    accuracy: "—",
  },
];

function ModelCard({ model, selected, onClick }) {
  const isActive = selected === model.id;
  const isLive = model.status === "live";

  return (
    <button
      onClick={() => isLive && onClick(model.id)}
      style={{
        width: "100%", textAlign: "left", padding: "14px 16px",
        background: isActive ? "rgba(0,229,160,0.06)" : "rgba(0,229,160,0.015)",
        border: `1px solid ${isActive ? "rgba(0,229,160,0.2)" : "rgba(0,229,160,0.06)"}`,
        borderRadius: "16px", cursor: isLive ? "pointer" : "default", transition: "all .2s",
        marginBottom: "8px", color: "#e6fff5",
        opacity: isLive ? 1 : 0.5,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: "linear-gradient(135deg, rgba(0,229,160,0.15), rgba(0,179,125,0.08))",
            border: "1px solid rgba(0,229,160,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6M9 12h6M9 15h4" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "13px" }}>{model.name}</div>
            <div style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "Manrope" }}>{model.type}</div>
          </div>
        </div>
        <span
          style={{
            fontSize: "9px", fontFamily: "JetBrains Mono", fontWeight: 700,
            padding: "3px 8px", borderRadius: "6px",
            background: isLive ? "rgba(0,229,160,0.1)" : "rgba(255,213,79,0.08)",
            color: isLive ? "#00E5A0" : "#FFD54F",
            border: `1px solid ${isLive ? "rgba(0,229,160,0.2)" : "rgba(255,213,79,0.15)"}`,
            letterSpacing: "0.5px",
          }}
        >
          {isLive ? "LIVE" : "SOON"}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
        <div>
          <div style={{ fontSize: "9px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "1px" }}>Cost</div>
          <div style={{ fontSize: "12px", fontFamily: "JetBrains Mono", fontWeight: 500, color: "#5a9a80" }}>{model.costPerReq} RAI</div>
        </div>
        <div>
          <div style={{ fontSize: "9px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "1px" }}>Latency</div>
          <div style={{ fontSize: "12px", fontFamily: "JetBrains Mono", fontWeight: 500, color: "#5a9a80" }}>{model.latency}</div>
        </div>
        <div>
          <div style={{ fontSize: "9px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "1px" }}>24h Reqs</div>
          <div style={{ fontSize: "12px", fontFamily: "JetBrains Mono", fontWeight: 500, color: "#5a9a80" }}>{model.requests24h}</div>
        </div>
        {model.accuracy !== "—" && (
          <div>
            <div style={{ fontSize: "9px", color: "#2a5c47", fontFamily: "Manrope", marginBottom: "1px" }}>Accuracy</div>
            <div style={{ fontSize: "12px", fontFamily: "JetBrains Mono", fontWeight: 500, color: "#00E5A0" }}>{model.accuracy}%</div>
          </div>
        )}
      </div>
    </button>
  );
}

export default function ComputePanel({ wallet, onConnect }) {
  const [selected, setSelected] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const selectedModel = MODELS.find((m) => m.id === selected);

  const handleRun = () => {
    if (!wallet) { onConnect(); return; }
    if (!selected || !prompt) return;
    setRunning(true);
    setResult(null);

    // Simulated inference result
    setTimeout(() => {
      setRunning(false);
      if (selected === "risk-v1") {
        setResult({
          output: `Risk Score: 34/100 (LOW)\nSlippage: 0.8% | Impact: 0.3%\nRecommendation: Safe to proceed\nConfidence: 96.2%`,
          cost: "0.001",
          latency: "84ms",
          txHash: "0x7a3f...e2d1",
        });
      } else {
        setResult({
          output: `Republic AI Network enables verifiable compute for DeFi applications. The network processes inference workloads with cryptographic proofs, ensuring transparent and trustless AI operations across the ecosystem.`,
          cost: "0.002",
          latency: "118ms",
          txHash: "0x9b2c...f4a8",
        });
      }
    }, 1800);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h4" />
          </svg>
          <span style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "17px", color: "#e6fff5" }}>
            AI Compute Marketplace
          </span>
        </div>
        <div style={{ fontSize: "12px", color: "#2a5c47", fontFamily: "Manrope", lineHeight: 1.5, maxWidth: "340px", margin: "0 auto" }}>
          Run AI inference on Republic AI compute nodes. Pay per request with RAI. Results are verifiable on-chain.
        </div>
      </div>

      {/* Model list */}
      {MODELS.map((model) => (
        <ModelCard key={model.id} model={model} selected={selected} onClick={setSelected} />
      ))}

      {/* Prompt input */}
      {selected && (
        <div style={{ marginTop: "12px" }}>
          <div style={{ fontSize: "12px", color: "#2a5c47", fontWeight: 500, marginBottom: "6px", fontFamily: "Manrope" }}>
            {selected === "risk-v1" ? "Token Pair (e.g. RAI/USDC)" : "Prompt"}
          </div>
          <textarea
            placeholder={selected === "risk-v1" ? "RAI/USDC 100 RAI" : "Enter your prompt..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            style={{
              width: "100%", background: "rgba(0,229,160,0.025)",
              border: "1px solid rgba(0,229,160,0.08)", borderRadius: "14px",
              padding: "12px 16px", color: "#e6fff5", fontSize: "13px",
              fontFamily: "JetBrains Mono", outline: "none", resize: "vertical",
              transition: "border-color 0.2s", lineHeight: 1.5,
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.2)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.08)")}
          />
          <div style={{ fontSize: "10px", color: "#2a5c47", fontFamily: "JetBrains Mono", marginTop: "4px" }}>
            Cost: <span style={{ color: "#00E5A0" }}>{selectedModel.costPerReq} RAI</span> per request
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{
          marginTop: "12px", padding: "14px 16px",
          background: "rgba(0,229,160,0.02)", borderRadius: "14px",
          border: "1px solid rgba(0,229,160,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontFamily: "Outfit", fontWeight: 700, color: "#00E5A0" }}>Inference Result</span>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ fontSize: "10px", fontFamily: "JetBrains Mono", color: "#4a8a70" }}>{result.latency}</span>
              <span style={{ fontSize: "10px", fontFamily: "JetBrains Mono", color: "#4a8a70" }}>-{result.cost} RAI</span>
            </div>
          </div>
          <pre style={{
            fontSize: "12px", fontFamily: "JetBrains Mono", color: "#b0e8d0",
            lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0,
          }}>
            {result.output}
          </pre>
          <div style={{
            marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(0,229,160,0.06)",
            fontSize: "10px", fontFamily: "JetBrains Mono", color: "#2a5c47",
          }}>
            tx: {result.txHash} (verifiable on Republic AI Explorer)
          </div>
        </div>
      )}

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={running}
        style={{
          width: "100%", marginTop: "14px", padding: "16px",
          borderRadius: "16px", border: "none",
          background: running
            ? "rgba(0,229,160,0.04)"
            : !wallet
            ? "linear-gradient(135deg, #00E5A0, #00B37D)"
            : !selected
            ? "rgba(0,229,160,0.06)"
            : "linear-gradient(135deg, #00E5A0, #00C48E)",
          color: running ? "#2a5c47" : (!wallet || selected) ? "#050b08" : "#2a5c47",
          fontFamily: "Outfit", fontWeight: 700, fontSize: "15px",
          cursor: running ? "not-allowed" : "pointer",
          transition: "all .25s",
          boxShadow: selected && !running ? "0 4px 20px rgba(0,229,160,0.15)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        {running && (
          <div style={{ width: "16px", height: "16px", border: "2px solid rgba(0,229,160,0.2)", borderTop: "2px solid #00E5A0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        )}
        {running ? "Running inference..." : !wallet ? "Connect Wallet" : !selected ? "Select a Model" : `Run ${selectedModel.name}`}
      </button>

      {/* Notice */}
      <div style={{
        marginTop: "10px", padding: "8px 12px", borderRadius: "8px",
        background: "rgba(255,213,79,0.03)", border: "1px solid rgba(255,213,79,0.06)",
        fontSize: "10px", color: "#8a7a3a", fontFamily: "JetBrains Mono", textAlign: "center",
      }}>
        Simulated inference — pending Hyperscale compute integration
      </div>
    </div>
  );
}
