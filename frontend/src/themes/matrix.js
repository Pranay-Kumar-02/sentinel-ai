export const matrix = {
    id: "matrix",
    name: "Matrix",
    icon: "🟩",

    // ── Core Backgrounds ─────────────────────────────────────
    bg: "#000800",
    bgMid: "#000d00",
    bgSurface: "#001200",
    bgGlass: "rgba(0,13,0,0.82)",
    bgCard: "rgba(0,18,0,0.88)",
    bgInput: "#000a00",

    // ── Borders ───────────────────────────────────────────────
    border: "rgba(0,255,65,0.07)",
    borderHover: "rgba(0,255,65,0.28)",
    borderGlow: "rgba(0,255,65,0.55)",
    borderCard: "rgba(0,255,65,0.1)",

    // ── Accent Colors ─────────────────────────────────────────
    accent: "#00ff41",
    accentGlow: "rgba(0,255,65,0.35)",
    accentSoft: "rgba(0,255,65,0.07)",
    accentPrimary: "#00cc33",

    // ── Semantic Colors ───────────────────────────────────────
    purple: "#39ff14",
    purpleGlow: "rgba(57,255,20,0.3)",
    purpleSoft: "rgba(57,255,20,0.07)",

    green: "#00ff41",
    greenGlow: "rgba(0,255,65,0.4)",
    greenSoft: "rgba(0,255,65,0.08)",

    red: "#ff0033",
    redGlow: "rgba(255,0,51,0.4)",
    redSoft: "rgba(255,0,51,0.08)",

    orange: "#ff4444",
    orangeGlow: "rgba(255,68,68,0.3)",
    orangeSoft: "rgba(255,68,68,0.08)",

    amber: "#aaff00",
    amberGlow: "rgba(170,255,0,0.3)",
    amberSoft: "rgba(170,255,0,0.08)",

    blue: "#00ff88",
    blueGlow: "rgba(0,255,136,0.3)",
    blueSoft: "rgba(0,255,136,0.08)",

    pink: "#00ffcc",
    pinkGlow: "rgba(0,255,204,0.3)",
    pinkSoft: "rgba(0,255,204,0.08)",

    teal: "#00e676",
    tealGlow: "rgba(0,230,118,0.3)",
    tealSoft: "rgba(0,230,118,0.08)",

    // ── Text ──────────────────────────────────────────────────
    text: "#ccffcc",
    textSub: "#44aa44",
    textMuted: "#1a5c1a",
    textDim: "#0a2e0a",

    // ── Gradients ─────────────────────────────────────────────
    gradientPrimary: "linear-gradient(135deg, #00ff41 0%, #00cc33 100%)",
    gradientAccent: "linear-gradient(135deg, #39ff14 0%, #00ff41 50%, #00cc33 100%)",
    gradientDanger: "linear-gradient(135deg, #ff0033 0%, #ff4444 100%)",
    gradientSafe: "linear-gradient(135deg, #00ff41 0%, #00e676 100%)",
    gradientWarning: "linear-gradient(135deg, #aaff00 0%, #00ff41 100%)",
    gradientGlass: "linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(0,204,51,0.04) 100%)",
    gradientHero: "radial-gradient(ellipse at 30% 40%, rgba(0,255,65,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(0,204,51,0.08) 0%, transparent 60%)",
    gradientCard: "linear-gradient(135deg, rgba(0,255,65,0.03) 0%, rgba(0,204,51,0.03) 100%)",
    gradientOrb1: "radial-gradient(circle, rgba(0,255,65,0.15) 0%, transparent 70%)",
    gradientOrb2: "radial-gradient(circle, rgba(0,204,51,0.12) 0%, transparent 70%)",
    gradientOrb3: "radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)",
    gradientOrb4: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)",

    // ── Particles ─────────────────────────────────────────────
    particleColors: ["#00ff41", "#39ff14", "#00cc33", "#00ff88", "#ccffcc"],
    particleCount: 200,
    particleMaxSize: 1.8,
    particleSpeed: 0.6,
    particleConnect: 70,
    particleAttract: 130,

    // ── Grid ──────────────────────────────────────────────────
    gridColor: "rgba(0,255,65,0.08)",
    gridPulse: "rgba(0,255,65,0.5)",
    gridSize: 50,

    // ── Radar ─────────────────────────────────────────────────
    radarColor: "rgba(0,255,65,0.2)",
    radarTrail: "rgba(0,255,65,0.05)",
    radarDot: "#00ff41",

    // ── Glow ──────────────────────────────────────────────────
    glowPrimary: "0 0 40px rgba(0,255,65,0.25), 0 0 80px rgba(0,255,65,0.08)",
    glowCard: "0 0 30px rgba(0,255,65,0.1), inset 0 0 30px rgba(0,255,65,0.03)",
    glowDanger: "0 0 40px rgba(255,0,51,0.35), 0 0 80px rgba(255,0,51,0.12)",
    glowSafe: "0 0 40px rgba(0,255,65,0.4), 0 0 80px rgba(0,255,65,0.12)",

    // ── Cursor ────────────────────────────────────────────────
    cursorColor: "#00ff41",
    cursorGlow: "rgba(0,255,65,0.5)",

    // ── Fonts ─────────────────────────────────────────────────
    fontDisplay: "'Space Grotesk', 'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    fontAccent: "'Orbitron', 'Space Grotesk', sans-serif",

    // ── Backdrop ──────────────────────────────────────────────
    backdropBlur: "blur(20px)",
    navBg: "rgba(0,8,0,0.93)",
    sidebarBg: "rgba(0,8,0,0.97)",

    // ── Light Rays ────────────────────────────────────────────
    rayColor: "rgba(0,255,65,0.04)",

    // ── Special Effects ───────────────────────────────────────
    matrixRain: true,
    matrixRainColor: "#00ff41",
    matrixRainOpacity: 0.06,
    auroraColors: null,
    emergencyPulse: false,
    scanlineOpacity: 0.025,

    // ── Verdict Colors ────────────────────────────────────────
    verdicts: {
        SAFE: { color: "#00ff41", glow: "rgba(0,255,65,0.4)", bg: "rgba(0,255,65,0.07)", border: "rgba(0,255,65,0.3)" },
        SUSPICIOUS: { color: "#aaff00", glow: "rgba(170,255,0,0.35)", bg: "rgba(170,255,0,0.06)", border: "rgba(170,255,0,0.28)" },
        DANGEROUS: { color: "#ff4444", glow: "rgba(255,68,68,0.4)", bg: "rgba(255,68,68,0.07)", border: "rgba(255,68,68,0.3)" },
        CRITICAL: { color: "#ff0033", glow: "rgba(255,0,51,0.55)", bg: "rgba(255,0,51,0.09)", border: "rgba(255,0,51,0.5)" },
        UNKNOWN: { color: "#1a5c1a", glow: "rgba(26,92,26,0.2)", bg: "rgba(26,92,26,0.06)", border: "rgba(26,92,26,0.2)" },
    },
};