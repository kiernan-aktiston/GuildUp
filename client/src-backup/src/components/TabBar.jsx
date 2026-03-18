import { C, TABS } from '../constants';

export default function TabBar({ active, onSwitch }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, display: "flex", zIndex: 100,
      borderTop: `1px solid ${C.cardBorder}`, background: "#000",
    }}>
      {TABS.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onSwitch(t.key)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: isActive ? "rgba(240, 178, 50, 0.1)" : "transparent",
            border: "none", borderBottomStyle: "solid", borderBottomWidth: 2,
            borderBottomColor: isActive ? C.gold : "transparent",
            cursor: "pointer",
            padding: "8px 0 env(safe-area-inset-bottom, 8px)",
            transition: "all 0.25s ease",
          }}>
            <img src={t.icon} alt={t.label} style={{
              width: 26, height: 26, objectFit: "contain",
              imageRendering: "pixelated",
              opacity: isActive ? 1 : 0.4,
              filter: isActive ? "brightness(1.2)" : "grayscale(70%) brightness(0.7)",
              transition: "all 0.25s ease",
            }} />
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: 0.5,
              color: isActive ? C.gold : "#ffffff55",
              textTransform: "uppercase",
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
