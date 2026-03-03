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
