export const midnight = {
    id: "midnight",
    name: "Midnight Intel",
    icon: "🌙",

    bg: "#080008",
    bgMid: "#0d000d",
    bgSurface: "#120012",
    bgGlass: "rgba(13,0,13,0.8)",
    bgCard: "rgba(18,0,18,0.85)",
    bgInput: "#0a000a",

    border: "rgba(168,85,247,0.08)",
    borderHover: "rgba(168,85,247,0.3)",
    borderGlow: "rgba(168,85,247,0.6)",
    borderCard: "rgba(168,85,247,0.12)",

    accent: "#a855f7",
    accentGlow: "rgba(168,85,247,0.35)",
    accentSoft: "rgba(168,85,247,0.08)",
    accentPrimary: "#9333ea",

    purple: "#c084fc",
    purpleGlow: "rgba(192,132,252,0.3)",
    purpleSoft: "rgba(192,132,252,0.08)",

    green: "#00ff88",
    greenGlow: "rgba(0,255,136,0.3)",
    greenSoft: "rgba(0,255,136,0.08)",

    red: "#ff0033",
    redGlow: "rgba(255,0,51,0.35)",
    redSoft: "rgba(255,0,51,0.08)",

    orange: "#ff4444",
    orangeGlow: "rgba(255,68,68,0.3)",
    orangeSoft: "rgba(255,68,68,0.08)",

    amber: "#ffb800",
    amberGlow: "rgba(255,184,0,0.3)",
    amberSoft: "rgba(255,184,0,0.08)",

    blue: "#818cf8",
    blueGlow: "rgba(129,140,248,0.3)",
    blueSoft: "rgba(129,140,248,0.08)",

    pink: "#f472b6",
    pinkGlow: "rgba(244,114,182,0.35)",
    pinkSoft: "rgba(244,114,182,0.08)",

    teal: "#2dd4bf",
    tealGlow: "rgba(45,212,191,0.3)",
    tealSoft: "rgba(45,212,191,0.08)",

    text: "#f5f0ff",
    textSub: "#9977bb",
    textMuted: "#553366",
    textDim: "#220033",

    gradientPrimary: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
    gradientAccent: "linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #ec4899 100%)",
    gradientDanger: "linear-gradient(135deg, #ff0033 0%, #ff4444 100%)",
    gradientSafe: "linear-gradient(135deg, #00ff88 0%, #2dd4bf 100%)",
    gradientWarning: "linear-gradient(135deg, #ffb800 0%, #ff8c00 100%)",
    gradientGlass: "linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(236,72,153,0.06) 100%)",
    gradientHero: "radial-gradient(ellipse at 30% 40%, rgba(168,85,247,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(236,72,153,0.1) 0%, transparent 60%)",
    gradientCard: "linear-gradient(135deg, rgba(168,85,247,0.04) 0%, rgba(236,72,153,0.04) 100%)",
    gradientOrb1: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
    gradientOrb2: "radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)",
    gradientOrb3: "radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)",
    gradientOrb4: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)",

    particleColors: ["#a855f7", "#ec4899", "#c084fc", "#f472b6", "#818cf8"],
    particleCount: 160,
    particleMaxSize: 2,
    particleSpeed: 0.35,
    particleConnect: 90,
    particleAttract: 140,

    gridColor: "rgba(168,85,247,0.05)",
    gridPulse: "rgba(168,85,247,0.4)",
    gridSize: 55,

    radarColor: "rgba(168,85,247,0.15)",
    radarTrail: "rgba(168,85,247,0.04)",
    radarDot: "#a855f7",

    glowPrimary: "0 0 40px rgba(168,85,247,0.25), 0 0 80px rgba(168,85,247,0.08)",
    glowCard: "0 0 30px rgba(168,85,247,0.1), inset 0 0 30px rgba(168,85,247,0.03)",
    glowDanger: "0 0 40px rgba(255,0,51,0.3), 0 0 80px rgba(255,0,51,0.1)",
    glowSafe: "0 0 40px rgba(0,255,136,0.25), 0 0 80px rgba(0,255,136,0.08)",

    cursorColor: "#a855f7",
    cursorGlow: "rgba(168,85,247,0.4)",

    fontDisplay: "'Space Grotesk', 'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    fontAccent: "'Orbitron', 'Space Grotesk', sans-serif",

    backdropBlur: "blur(24px)",
    navBg: "rgba(8,0,8,0.92)",
    sidebarBg: "rgba(8,0,8,0.97)",

    rayColor: "rgba(168,85,247,0.04)",

    matrixRain: false,
    auroraColors: null,
    emergencyPulse: false,
    scanlineOpacity: 0.015,

    verdicts: {
        SAFE: { color: "#00ff88", glow: "rgba(0,255,136,0.35)", bg: "rgba(0,255,136,0.06)", border: "rgba(0,255,136,0.25)" },
        SUSPICIOUS: { color: "#ffb800", glow: "rgba(255,184,0,0.35)", bg: "rgba(255,184,0,0.06)", border: "rgba(255,184,0,0.25)" },
        DANGEROUS: { color: "#ff4444", glow: "rgba(255,68,68,0.35)", bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.3)" },
        CRITICAL: { color: "#ff0033", glow: "rgba(255,0,51,0.5)", bg: "rgba(255,0,51,0.08)", border: "rgba(255,0,51,0.5)" },
        UNKNOWN: { color: "#553366", glow: "rgba(85,51,102,0.2)", bg: "rgba(85,51,102,0.06)", border: "rgba(85,51,102,0.2)" },
    },
};