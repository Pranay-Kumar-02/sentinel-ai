// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Black Nebula Theme
// Pitch-black deep space / aerospace intelligence aesthetic
// Authentic near-black void, silver/cold-white interface accents,
// muted violet atmospheric haze, 80% reduced glow, calm cinematic feel.
// ─────────────────────────────────────────────────────────────────────────────

export const nebula = {
    id: "nebula",
    name: "Black Nebula",
    icon: "🌌",

    // ── Core Backgrounds (Near-black deep space & graphite surfaces) ──
    bg: "#020409",                // Primary: near-black, not pure #000000
    bgMid: "#050912",             // Secondary: slightly lifted blue-black
    bgSurface: "#080D16",         // Tertiary: graphite / charcoal
    bgGlass: "rgba(8, 13, 22, 0.78)",
    bgCard: "rgba(12, 18, 28, 0.88)",
    bgInput: "#050912",

    // ── Borders (Extremely soft borders, subtle glass edges) ──────
    border: "rgba(255, 255, 255, 0.06)",
    borderHover: "rgba(56, 189, 248, 0.18)",
    borderGlow: "rgba(56, 189, 248, 0.10)",
    borderCard: "rgba(255, 255, 255, 0.07)",

    // ── Primary UI Accent (Restrained Cool Electric Blue) ─────────
    accent: "#38bdf8",            // Restrained cool electric blue
    accentGlow: "rgba(56, 189, 248, 0.08)", // Minimal glow, high refinement
    accentSoft: "rgba(56, 189, 248, 0.05)",
    accentPrimary: "#0284c7",     // Deep steel-blue anchor

    // ── Secondary Atmospheric Accent (Subtle Violet / Indigo) ─────
    purple: "#818cf8",            // Subtle violet / indigo
    purpleGlow: "rgba(129, 140, 248, 0.09)",
    purpleSoft: "rgba(129, 140, 248, 0.04)",

    // ── Semantic Colors (Muted, Non-Neon) ─────────────────────────
    green: "#2e9e75",             // Muted emerald safe
    greenGlow: "rgba(46, 158, 117, 0.10)",
    greenSoft: "rgba(46, 158, 117, 0.04)",

    // Muted crimson danger
    red: "#c84545",
    redGlow: "rgba(200, 69, 69, 0.12)",
    redSoft: "rgba(200, 69, 69, 0.04)",

    orange: "#b86a34",
    orangeGlow: "rgba(184, 106, 52, 0.10)",
    orangeSoft: "rgba(184, 106, 52, 0.04)",

    amber: "#c48b28",             // Muted amber warning
    amberGlow: "rgba(196, 139, 40, 0.10)",
    amberSoft: "rgba(196, 139, 40, 0.04)",

    blue: "#38bdf8",              // Cool electric blue
    blueGlow: "rgba(56, 189, 248, 0.08)",
    blueSoft: "rgba(56, 189, 248, 0.04)",

    pink: "#7a5472",
    pinkGlow: "rgba(122, 84, 114, 0.08)",
    pinkSoft: "rgba(122, 84, 114, 0.04)",

    teal: "#3d6e6f",
    tealGlow: "rgba(61, 110, 111, 0.08)",
    tealSoft: "rgba(61, 110, 111, 0.04)",

    // ── Typography (Monochrome Silver & Slate Gray) ───────────────
    text: "#f8fafc",              // High contrast crisp white
    textSub: "#cbd5e1",           // Soft light gray
    textMuted: "#79828e",         // Neutral slate metadata
    textDim: "#3b424c",           // Dark graphite

    // ── Gradients (Subtle Blue-Black & Deep Space Haze) ──────────
    gradientPrimary: "linear-gradient(135deg, #0b1528 0%, #1e1b4b 100%)",
    gradientAccent: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    gradientDanger: "linear-gradient(135deg, #c84545 0%, #9e3232 100%)",
    gradientSafe: "linear-gradient(135deg, #2e9e75 0%, #217354 100%)",
    gradientWarning: "linear-gradient(135deg, #c48b28 0%, #996919 100%)",
    gradientGlass: "linear-gradient(135deg, rgba(56, 189, 248, 0.02) 0%, rgba(129, 140, 248, 0.015) 100%)",
    gradientHero: "radial-gradient(ellipse at 50% 15%, rgba(56, 189, 248, 0.04) 0%, transparent 60%)",
    gradientCard: "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(2, 4, 9, 0.70) 100%)",
    gradientOrb1: "radial-gradient(circle, rgba(56, 189, 248, 0.025) 0%, transparent 70%)",
    gradientOrb2: "radial-gradient(circle, rgba(129, 140, 248, 0.02) 0%, transparent 70%)",
    gradientOrb3: "none",
    gradientOrb4: "none",

    // ── Deep Space Nebula Atmospheric Layers ──────────────────
    hasNebula: true,
    nebulaColors: [
        "rgba(56, 189, 248, 0.025)",  // Restrained cool electric blue haze
        "rgba(129, 140, 248, 0.025)", // Subtle violet / indigo dust
        "rgba(255, 255, 255, 0.012)", // Faint starlight dust
    ],

    // ── Particles (Sparse stars, calm distant drift) ───────────
    particleColors: ["#ffffff", "#e2e8f0", "#94a3b8", "rgba(56, 189, 248, 0.6)"],
    particleCount: 22,            // Very sparse, pinpoint stars
    particleMaxSize: 1.0,         // Tiny pinpoints
    particleSpeed: 0.03,          // Ultra-slow calm drift
    particleConnect: 0,           // No lines between stars
    particleAttract: 0,           // No mouse attraction

    // ── Grid (Barely perceptible spatial coordinate mesh) ─────
    gridColor: "rgba(255, 255, 255, 0.012)",
    gridPulse: "transparent",
    gridSize: 84,

    // ── Radar (Minimal orbital coordinate line) ───────────────
    radarColor: "transparent",
    radarTrail: "transparent",
    radarDot: "#38bdf8",

    // ── Restrained Glow (70-80% global reduction) ─────────────
    glowPrimary: "0 0 16px rgba(56, 189, 248, 0.08)",
    glowCard: "0 4px 20px rgba(2, 4, 9, 0.70)",
    glowDanger: "0 0 16px rgba(200, 69, 69, 0.15)",
    glowSafe: "0 0 16px rgba(46, 158, 117, 0.15)",

    // ── Cursor ────────────────────────────────────────────────
    cursorColor: "#38bdf8",
    cursorGlow: "rgba(56, 189, 248, 0.14)",

    // ── Fonts ─────────────────────────────────────────────────
    fontDisplay: "'Inter', system-ui, sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    fontAccent: "'Inter', system-ui, sans-serif",

    // ── Backdrop & Navigation Surfaces (Near-black deep space) ─
    backdropBlur: "blur(20px)",
    navBg: "rgba(5, 9, 18, 0.92)",
    sidebarBg: "rgba(2, 4, 9, 0.96)",

    // ── Light Rays ────────────────────────────────────────────
    rayColor: "transparent",

    // ── Special Effects ───────────────────────────────────────
    matrixRain: false,
    emergencyPulse: false,
    scanlineOpacity: 0,

    // ── Verdict Colors ────────────────────────────────────────
    verdicts: {
        SAFE: { color: "#2e9e75", glow: "rgba(46, 158, 117, 0.12)", bg: "rgba(46, 158, 117, 0.06)", border: "rgba(46, 158, 117, 0.18)" },
        SUSPICIOUS: { color: "#c48b28", glow: "rgba(196, 139, 40, 0.12)", bg: "rgba(196, 139, 40, 0.06)", border: "rgba(196, 139, 40, 0.18)" },
        DANGEROUS: { color: "#c84545", glow: "rgba(200, 69, 69, 0.15)", bg: "rgba(200, 69, 69, 0.07)", border: "rgba(200, 69, 69, 0.20)" },
        CRITICAL: { color: "#c84545", glow: "rgba(200, 69, 69, 0.20)", bg: "rgba(200, 69, 69, 0.10)", border: "rgba(200, 69, 69, 0.25)" },
        UNKNOWN: { color: "#6b7280", glow: "none", bg: "rgba(107, 114, 128, 0.06)", border: "rgba(107, 114, 128, 0.15)" },
    },
};
