"use client";
import { useState } from "react";
import { TokenIcon } from "./TokenInput";

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
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, #060d09, #0a1810, #060d09)",
          border: "1px solid rgba(0,229,160,0.1)",
          borderRadius: "24px", padding: "24px",
          width: "420px", maxWidth: "92vw", maxHeight: "500px",
          display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,229,160,0.04)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontFamily: "Outfit", fontSize: "18px", fontWeight: 700, color: "#e6fff5" }}>
            Select Token
          </span>
          <button
            onClick={onClose}
            style={{
              width: "34px", height: "34px", borderRadius: "10px",
              background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.1)",
              color: "#4a8a70", cursor: "pointer", fontSize: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#00E5A0"; e.currentTarget.style.borderColor = "rgba(0,229,160,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#4a8a70"; e.currentTarget.style.borderColor = "rgba(0,229,160,0.1)"; }}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <input
          placeholder="Search by name or symbol..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            background: "rgba(0,229,160,0.03)",
            border: "1px solid rgba(0,229,160,0.08)",
            borderRadius: "14px", padding: "13px 16px",
            color: "#e6fff5", fontSize: "14px", fontFamily: "Manrope",
            outline: "none", marginBottom: "14px",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.25)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(0,229,160,0.08)")}
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
              <TokenIcon symbol={t.symbol} color={t.color} size={38} />
              <div style={{ textAlign: "left", flex: 1, marginLeft: "12px" }}>
                <div style={{ color: "#e6fff5", fontWeight: 700, fontSize: "14px", fontFamily: "Outfit" }}>
                  {t.symbol}
                </div>
                <div style={{ color: "#2a5c47", fontSize: "12px", fontFamily: "Manrope" }}>
                  {t.name}
                </div>
              </div>
              <div style={{ color: "#4a8a70", fontSize: "13px", fontFamily: "JetBrains Mono", fontWeight: 500 }}>
                {t.balance || "0.00"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
