"use client";

export default function Toast({ toast }) {
  if (!toast) return null;

  const isError = toast.type === "error";
  const isWarn = toast.type === "warn";
  const color = isError ? "#ff5050" : isWarn ? "#FFD54F" : "#00E5A0";
  const bg = isError ? "rgba(255,80,80,0.12)" : isWarn ? "rgba(255,213,79,0.10)" : "rgba(0,229,160,0.12)";
  const border = isError ? "rgba(255,80,80,0.3)" : isWarn ? "rgba(255,213,79,0.25)" : "rgba(0,229,160,0.3)";
  const icon = toast.type === "success" ? "\u2713" : isError ? "\u2717" : isWarn ? "\u26A0" : "\u2139";

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
