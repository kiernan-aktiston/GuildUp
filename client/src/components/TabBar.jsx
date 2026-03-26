import { C, TABS } from '../constants';

export default function TabBar({ active, onSwitch }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, display: "flex", zIndex: 100,
      borderTop: `1px solid ${C.border}`,
      background: C.bg,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {TABS.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onSwitch(t.key)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, background: "transparent", border: "none", cursor: "pointer",
            padding: "10px 0 8px",
          }}>
            <img src={t.icon} alt={t.label} style={{
              width: 22, height: 22, objectFit: "contain",
              opacity: isActive ? 1 : 0.35,
              filter: isActive
                ? "brightness(1.3) sepia(1) hue-rotate(10deg) saturate(2)"
                : "grayscale(100%) brightness(0.6)",
              transition: "all 0.2s ease",
            }} />
            <span style={{
              fontSize: 10, fontWeight: isActive ? 600 : 400,
              letterSpacing: 0.8,
              color: isActive ? C.gold : C.textDim,
              textTransform: "uppercase",
              transition: "color 0.2s ease",
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}