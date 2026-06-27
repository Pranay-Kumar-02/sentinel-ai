export const aurora = {
    id: "aurora",
    name: "Aurora",
    icon: "🌌",

    // ── Core Backgrounds ─────────────────────────────────────
    bg: "#010812",
    bgMid: "#020c1a",
    bgSurface: "#031022",
    bgGlass: "rgba(2,12,26,0.8)",
    bgCard: "rgba(3,16,34,0.86)",
    bgInput: "#020a16",

    // ── Borders ───────────────────────────────────────────────
    border: "rgba(139,92,246,0.08)",
    borderHover: "rgba(139,92,246,0.28)",
    borderGlow: "rgba(139,92,246,0.55)",
    borderCard: "rgba(139,92,246,0.1)",

    // ── Accent Colors — shift in animation, base is violet ────
    accent: "#8b5cf6",
    accentGlow: "rgba(139,92,246,0.35)",
    accentSoft: "rgba(139,92,246,0.07)",
    accentPrimary: "#7c3aed",

    // ── Full aurora spectrum ───────────────────────────────────
    auroraSpectrum: [
        "#00d4ff",  // cyan
        "#8b5cf6",  // violet
        "#ec4899",  // pink
        "#00ff88",  // green
        "#f59e0b",  // amber
        "#38bdf8",  // sky
    ],

    // ── Semantic Colors ───────────────────────────────────────
    purple: "#a78bfa",
    purpleGlow: "rgba(167,139,250,0.3)",
    purpleSoft: "rgba(167,139,250,0.07)",

    green: "#00ff88",
    greenGlow: "rgba(0,255,136,0.3)",
    greenSoft: "rgba(0,255,136,0.08)",

    red: "#ff0033",
    redGlow: "rgba(255,0,51,0.35)",
    redSoft: "rgba(255,0,51,0.08)",

    orange: "#ff4444",
    orangeGlow: "rgba(255,68,68,0.3)",
    orangeSoft: "rgba(255,68,68,0.08)",

    amber: "#f59e0b",
    amberGlow: "rgba(245,158,11,0.3)",
    amberSoft: "rgba(245,158,11,0.08)",

    blue: "#38bdf8",
    blueGlow: "rgba(56,189,248,0.3)",
    blueSoft: "rgba(56,189,248,0.08)",

    pink: "#ec4899",
    pinkGlow: "rgba(236,72,153,0.3)",
    pinkSoft: "rgba(236,72,153,0.08)",

    teal: "#14b8a6",
    tealGlow: "rgba(20,184,166,0.3)",
    tealSoft: "rgba(20,184,166,0.08)",

    // ── Text ──────────────────────────────────────────────────
    text: "#f0f0ff",
    textSub: "#9988cc",
    textMuted: "#44335c",
    textDim: "#1a1030",

    // ── Gradients ─────────────────────────────────────────────
    gradientPrimary: "linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #ec4899 100%)",
    gradientAccent: "linear-gradient(135deg, #38bdf8 0%, #8b5cf6 33%, #ec4899 66%, #00ff88 100%)",
    gradientDanger: "linear-gradient(135deg, #ff0033 0%, #ff4444 100%)",
    gradientSafe: "linear-gradient(135deg, #00ff88 0%, #14b8a6 100%)",
    gradientWarning: "linear-gradient(135deg, #f59e0b 0%, #ff8c00 100%)",
    gradientGlass: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 50%, rgba(0,212,255,0.05) 100%)",
    gradientHero: "radial-gradient(ellipse at 20% 20%, rgba(0,212,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(236,72,153,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(0,255,136,0.06) 0%, transparent 60%)",
    gradientCard: "linear-gradient(135deg, rgba(139,92,246,0.04) 0%, rgba(236,72,153,0.04) 100%)",
    gradientOrb1: "radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%)",
    gradientOrb2: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
    gradientOrb3: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)",
    gradientOrb4: "radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)",

    // ── Aurora Borealis Top-of-Screen Effect ──────────────────
    auroraColors: [
        "rgba(0,212,255,0.12)",
        "rgba(139,92,246,0.15)",
        "rgba(236,72,153,0.1)",
        "rgba(0,255,136,0.08)",
        "rgba(56,189,248,0.1)",
    ],
    auroraHeight: "35vh",
    auroraSpeed: "8s",

    // ── Particles ─────────────────────────────────────────────
    particleColors: ["#00d4ff", "#8b5cf6", "#ec4899", "#00ff88", "#38bdf8", "#f59e0b"],
    particleCount: 190,
    particleMaxSize: 2.2,
    particleSpeed: 0.3,
    particleConnect: 85,
    particleAttract: 155,

    // ── Grid ──────────────────────────────────────────────────
    gridColor: "rgba(139,92,246,0.05)",
    gridPulse: "rgba(139,92,246,0.4)",
    gridSize: 58,
    gridHueShift: true,

    // ── Radar ─────────────────────────────────────────────────
    radarColor: "rgba(139,92,246,0.15)",
    radarTrail: "rgba(139,92,246,0.04)",
    radarDot: "#8b5cf6",

    // ── Glow ──────────────────────────────────────────────────
    glowPrimary: "0 0 40px rgba(139,92,246,0.25), 0 0 80px rgba(0,212,255,0.08), 0 0 120px rgba(236,72,153,0.05)",
    glowCard: "0 0 30px rgba(139,92,246,0.1), inset 0 0 30px rgba(139,92,246,0.03)",
    glowDanger: "0 0 40px rgba(255,0,51,0.3), 0 0 80px rgba(255,0,51,0.1)",
    glowSafe: "0 0 40px rgba(0,255,136,0.25), 0 0 80px rgba(0,255,136,0.08)",

    // ── Cursor ────────────────────────────────────────────────
    cursorColor: "#8b5cf6",
    cursorGlow: "rgba(139,92,246,0.45)",
    cursorRainbow: true,

    // ── Fonts ─────────────────────────────────────────────────
    fontDisplay: "'Space Grotesk', 'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    fontAccent: "'Orbitron', 'Space Grotesk', sans-serif",

    // ── Backdrop ──────────────────────────────────────────────
    backdropBlur: "blur(26px)",
    navBg: "rgba(1,8,18,0.91)",
    sidebarBg: "rgba(1,8,18,0.96)",

    // ── Light Rays ────────────────────────────────────────────
    rayColor: "rgba(139,92,246,0.03)",

    // ── Special Effects ───────────────────────────────────────
    matrixRain: false,
    emergencyPulse: false,
    scanlineOpacity: 0.01,

    // ── Verdict Colors ────────────────────────────────────────
    verdicts: {
        SAFE: { color: "#00ff88", glow: "rgba(0,255,136,0.35)", bg: "rgba(0,255,136,0.06)", border: "rgba(0,255,136,0.25)" },
        SUSPICIOUS: { color: "#f59e0b", glow: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.25)" },
        DANGEROUS: { color: "#ff4444", glow: "rgba(255,68,68,0.38)", bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.3)" },
        CRITICAL: { color: "#ff0033", glow: "rgba(255,0,51,0.52)", bg: "rgba(255,0,51,0.08)", border: "rgba(255,0,51,0.48)" },
        UNKNOWN: { color: "#44335c", glow: "rgba(68,51,92,0.2)", bg: "rgba(68,51,92,0.06)", border: "rgba(68,51,92,0.2)" },
    },
};