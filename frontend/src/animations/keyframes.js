// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Keyframes
// CSS @keyframe definitions as JS objects.
// Used with Framer Motion's `animate` prop or injected as <style> tags.
// Also exports raw CSS strings for injection into the DOM.
// ─────────────────────────────────────────────────────────────────────────────

// ── Framer Motion keyframe sequences ─────────────────────────────────────────
// Use these in motion component `animate` props for looping animations

export const keyframes = {

    // ── Pulse — gentle scale breathe ───────────────────────────
    pulse: {
        scale: [1, 1.06, 1],
        opacity: [0.8, 1, 0.8],
        transition: { duration: 2.5, ease: "easeInOut", repeat: Infinity },
    },

    // ── Fast pulse — critical alerts ────────────────────────────
    pulseFast: {
        scale: [1, 1.12, 1],
        opacity: [0.7, 1, 0.7],
        transition: { duration: 0.8, ease: "easeInOut", repeat: Infinity },
    },

    // ── Glow pulse — border/shadow breathing ───────────────────
    glowPulse: {
        opacity: [0.4, 1, 0.4],
        transition: { duration: 2, ease: "easeInOut", repeat: Infinity },
    },

    // ── Breathe — subtle scale + opacity ───────────────────────
    breathe: {
        scale: [1, 1.003, 1],
        opacity: [0.8, 1, 0.8],
        transition: { duration: 4, ease: "easeInOut", repeat: Infinity },
    },

    // ── Float — vertical drift ──────────────────────────────────
    float: {
        y: [0, -12, 0],
        transition: { duration: 4, ease: "easeInOut", repeat: Infinity },
    },

    // ── Float slow — for large elements ────────────────────────
    floatSlow: {
        y: [0, -20, 0],
        transition: { duration: 8, ease: "easeInOut", repeat: Infinity },
    },

    // ── Spin — continuous rotation ──────────────────────────────
    spin: {
        rotate: [0, 360],
        transition: { duration: 1, ease: "linear", repeat: Infinity },
    },

    // ── Spin slow — globe, ambient ──────────────────────────────
    spinSlow: {
        rotate: [0, 360],
        transition: { duration: 20, ease: "linear", repeat: Infinity },
    },

    // ── Spin reverse ───────────────────────────────────────────
    spinReverse: {
        rotate: [360, 0],
        transition: { duration: 3, ease: "linear", repeat: Infinity },
    },

    // ── Radar sweep ─────────────────────────────────────────────
    radar: {
        rotate: [0, 360],
        transition: { duration: 8, ease: "linear", repeat: Infinity },
    },

    // ── Shimmer sweep — loading states ──────────────────────────
    shimmer: {
        backgroundPosition: ["200% 0%", "-200% 0%"],
        transition: { duration: 2.5, ease: "linear", repeat: Infinity },
    },

    // ── Scanline — vertical sweep ───────────────────────────────
    scanline: {
        y: ["-100%", "100%"],
        transition: { duration: 2, ease: "linear", repeat: Infinity },
    },

    // ── Blink — cursor, status dots ────────────────────────────
    blink: {
        opacity: [1, 0, 1],
        transition: { duration: 1, ease: "steps(1)", repeat: Infinity },
    },

    // ── Ping — expanding ring for status indicators ─────────────
    ping: {
        scale: [1, 2.2],
        opacity: [0.4, 0],
        transition: { duration: 1.5, ease: "easeOut", repeat: Infinity },
    },

    // ── Wave — horizontal wave propagation ──────────────────────
    wave: {
        x: [0, 6, -4, 6, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
    },

    // ── Shake — error state ─────────────────────────────────────
    shake: {
        x: [0, -8, 8, -6, 6, -4, 4, 0],
        transition: { duration: 0.5, ease: "easeInOut" },
    },

    // ── Bounce — success feedback ───────────────────────────────
    bounce: {
        y: [0, -16, 0, -8, 0],
        scale: [1, 1.05, 1, 1.02, 1],
        transition: { duration: 0.6, ease: "easeInOut" },
    },

    // ── Glitch — text glitch effect ────────────────────────────
    glitch: {
        x: [0, -2, 3, -2, 2, 0],
        skewX: [0, -1, 1, -0.5, 0],
        opacity: [1, 0.8, 1, 0.9, 1],
        transition: { duration: 0.3, ease: "linear" },
    },

    // ── Typewriter cursor blink ─────────────────────────────────
    cursorBlink: {
        opacity: [1, 1, 0, 0],
        transition: {
            duration: 1,
            ease: "steps(1)",
            repeat: Infinity,
            times: [0, 0.5, 0.5, 1],
        },
    },

    // ── Counter tick — for live metric numbers ──────────────────
    counterTick: {
        scale: [1, 1.04, 1],
        color: ["inherit", "var(--accent)", "inherit"],
        transition: { duration: 0.3, ease: "easeOut" },
    },

    // ── Orb drift — background mesh orbs ───────────────────────
    orbDrift: {
        x: [0, 60, -40, 80, 0],
        y: [0, -40, 80, -60, 0],
        scale: [1, 1.08, 0.95, 1.05, 1],
        transition: {
            duration: 28,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
        },
    },

    // ── Particle explode — on threat detected ───────────────────
    particleExplode: {
        scale: [0, 1.5, 0],
        opacity: [1, 0.6, 0],
        transition: { duration: 0.5, ease: "easeOut" },
    },

    // ── Ripple — click feedback ─────────────────────────────────
    ripple: {
        scale: [0, 3],
        opacity: [0.5, 0],
        transition: { duration: 0.6, ease: "easeOut" },
    },

    // ── Card elevation — hover lift ─────────────────────────────
    cardLift: {
        y: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 380, damping: 18 },
    },

    // ── AI thinking — purple pulse ──────────────────────────────
    aiThink: {
        scale: [1, 1.15, 1],
        opacity: [0.6, 1, 0.6],
        boxShadow: [
            "0 0 0 0 var(--purple-soft)",
            "0 0 0 12px var(--purple-soft)",
            "0 0 0 0 var(--purple-soft)",
        ],
        transition: { duration: 1.5, ease: "easeInOut", repeat: Infinity },
    },

    // ── Critical alert — red pulse border ──────────────────────
    criticalAlert: {
        boxShadow: [
            "0 0 20px var(--red-glow)",
            "0 0 60px var(--red-glow)",
            "0 0 20px var(--red-glow)",
        ],
        transition: { duration: 1.2, ease: "easeInOut", repeat: Infinity },
    },

    // ── Safe confirm — green glow ───────────────────────────────
    safeConfirm: {
        boxShadow: [
            "0 0 0 var(--green-soft)",
            "0 0 40px var(--green-glow)",
            "0 0 0 var(--green-soft)",
        ],
        transition: { duration: 2, ease: "easeInOut", repeat: Infinity },
    },

    // ── Aurora shift — top of screen color band ─────────────────
    auroraShift: {
        x: ["-5%", "3%", "-2%", "6%"],
        scaleX: [1, 1.05, 0.98, 1.03],
        opacity: [0.7, 1, 0.8, 0.9],
        transition: {
            duration: 8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
        },
    },

    // ── Emergency pulse — full-screen red edge ──────────────────
    emergencyPulse: {
        opacity: [0.4, 1, 0.4],
        transition: { duration: 2, ease: "easeInOut", repeat: Infinity },
    },

    // ── Hex grid breathe ────────────────────────────────────────
    hexBreathe: {
        scale: [1, 1.002, 1],
        opacity: [0.8, 1, 0.8],
        transition: { duration: 8, ease: "easeInOut", repeat: Infinity },
    },

    // ── Light ray oscillate ─────────────────────────────────────
    rayOscillate: {
        rotate: [-3, 3, -3],
        opacity: [0.6, 1, 0.6],
        transition: { duration: 10, ease: "easeInOut", repeat: Infinity },
    },

    // ── Threat feed item slide in ───────────────────────────────
    feedSlideIn: {
        x: [-20, 0],
        opacity: [0, 1],
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },

    // ── Score fill — confidence/risk bar ───────────────────────
    scoreFill: {
        scaleX: [0, 1],
        transition: {
            duration: 1.2,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.3,
        },
    },

    // ── Verdict blur reveal ─────────────────────────────────────
    verdictReveal: {
        filter: ["blur(20px)", "blur(0px)"],
        scale: [0.6, 1],
        opacity: [0, 1],
        transition: { type: "spring", stiffness: 200, damping: 18, mass: 1.2 },
    },

    // ── Globe spin ──────────────────────────────────────────────
    globeSpin: {
        rotateY: [0, 360],
        transition: { duration: 30, ease: "linear", repeat: Infinity },
    },

    // ── Number count up ─────────────────────────────────────────
    countUp: (from = 0, to = 100) => ({
        innerHTML: [from, to],
        transition: { duration: 2, ease: [0.22, 1, 0.36, 1] },
    }),
};

// ── Raw CSS keyframe strings ──────────────────────────────────────────────────
// Inject these into a <style> tag for CSS animations used outside Framer Motion

export const cssKeyframes = `
@keyframes sentinelPulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50%       { transform: scale(1.06); opacity: 1; }
}

@keyframes sentinelPulseFast {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50%       { transform: scale(1.12); opacity: 1; }
}

@keyframes sentinelBreathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50%       { transform: scale(1.002); opacity: 1; }
}

@keyframes sentinelFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-12px); }
}

@keyframes sentinelSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

@keyframes sentinelSpinReverse {
    from { transform: rotate(360deg); }
    to   { transform: rotate(0deg); }
}

@keyframes sentinelRadar {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

@keyframes sentinelShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes sentinelScanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}

@keyframes sentinelBlink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
}

@keyframes sentinelPing {
    0%   { transform: scale(1);   opacity: 0.4; }
    100% { transform: scale(2.2); opacity: 0; }
}

@keyframes sentinelGlitch {
    0%   { transform: translate(0); }
    20%  { transform: translate(-2px, 1px) skewX(-1deg); }
    40%  { transform: translate(3px, -1px) skewX(1deg); }
    60%  { transform: translate(-2px, 0) skewX(-0.5deg); }
    80%  { transform: translate(2px, 1px); }
    100% { transform: translate(0); }
}

@keyframes sentinelRipple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(3); opacity: 0; }
}

@keyframes sentinelOrbFloat1 {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(80px, 60px) scale(1.08); }
    66%  { transform: translate(-40px, 100px) scale(0.95); }
    100% { transform: translate(120px, -60px) scale(1.05); }
}

@keyframes sentinelOrbFloat2 {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(-100px, 80px) scale(1.06); }
    66%  { transform: translate(60px, -80px) scale(0.97); }
    100% { transform: translate(-80px, 120px) scale(1.04); }
}

@keyframes sentinelOrbFloat3 {
    0%   { transform: translate(0, 0) scale(1); }
    50%  { transform: translate(60px, -90px) scale(1.1); }
    100% { transform: translate(-80px, 40px) scale(0.93); }
}

@keyframes sentinelOrbFloat4 {
    0%   { transform: translate(0, 0) scale(1); }
    40%  { transform: translate(-60px, -70px) scale(1.07); }
    100% { transform: translate(80px, 60px) scale(0.96); }
}

@keyframes sentinelGrainShift {
    0%   { transform: translate(0, 0); }
    10%  { transform: translate(-2%, -3%); }
    20%  { transform: translate(3%, 1%); }
    30%  { transform: translate(-1%, 4%); }
    40%  { transform: translate(4%, -2%); }
    50%  { transform: translate(-3%, 2%); }
    60%  { transform: translate(2%, -4%); }
    70%  { transform: translate(-4%, 1%); }
    80%  { transform: translate(1%, 3%); }
    90%  { transform: translate(3%, -1%); }
    100% { transform: translate(-2%, 4%); }
}

@keyframes sentinelHexBreathe {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50%       { transform: scale(1.002); opacity: 1; }
}

@keyframes sentinelRayOscillate1 {
    0%, 100% { transform: rotate(-3deg); opacity: 0.6; }
    50%       { transform: rotate(3deg); opacity: 1; }
}

@keyframes sentinelRayOscillate2 {
    0%, 100% { transform: rotate(5deg); opacity: 0.4; }
    50%       { transform: rotate(-5deg); opacity: 0.8; }
}

@keyframes sentinelRayOscillate3 {
    0%, 100% { transform: rotate(-4deg); opacity: 0.5; }
    50%       { transform: rotate(4deg); opacity: 0.9; }
}

@keyframes sentinelEdgeBreath {
    0%   { opacity: 0.5; }
    100% { opacity: 1; }
}

@keyframes sentinelAuroraShift {
    0%   { transform: translateX(-5%) scaleX(1) scaleY(0.8); opacity: 0.7; }
    33%  { transform: translateX(3%) scaleX(1.05) scaleY(1); opacity: 1; }
    66%  { transform: translateX(-2%) scaleX(0.98) scaleY(0.9); opacity: 0.8; }
    100% { transform: translateX(6%) scaleX(1.03) scaleY(1.1); opacity: 0.9; }
}

@keyframes sentinelEmergencyPulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
}

@keyframes sentinelCriticalPulse {
    0%, 100% { box-shadow: 0 0 60px var(--verdict-critical-glow); }
    50%       { box-shadow: 0 0 120px var(--verdict-critical-glow), 0 0 200px rgba(255,0,51,0.1); }
}

@keyframes sentinelStatusPing {
    0%   { transform: scale(1); opacity: 0.3; }
    50%  { transform: scale(1.8); opacity: 0; }
    100% { transform: scale(1); opacity: 0; }
}

@keyframes sentinelLaunchShine {
    0%   { left: -60%; }
    100% { left: 120%; }
}

@keyframes themeFlash {
    0%   { opacity: 0; }
    30%  { opacity: 0.15; }
    100% { opacity: 0; }
}

@keyframes sentinelTermLine {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
}

@keyframes sentinelHeroFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes sentinelSkeletonShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes sentinelCopilotPulse {
    0%, 100% {
        box-shadow: 0 0 0 1px var(--purple-soft),
                    0 4px 24px var(--purple-glow),
                    0 0 60px var(--purple-soft);
    }
    50% {
        box-shadow: 0 0 0 3px var(--purple-soft),
                    0 8px 32px var(--purple-glow),
                    0 0 100px var(--purple-soft);
    }
}

@keyframes sentinelCursorRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes sentinelCursorPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50%       { transform: translate(-50%, -50%) scale(1.5); }
}

@keyframes sentinelGlitchTop {
    0%, 90%, 100% { transform: none; opacity: 0; }
    92%            { transform: translate(-2px, -2px); opacity: 1; }
    94%            { transform: translate(2px, 0); opacity: 1; }
    96%            { transform: translate(-1px, 2px); opacity: 1; }
    98%            { transform: translate(0, 0); opacity: 0; }
}

@keyframes sentinelGlitchBottom {
    0%, 90%, 100% { transform: none; opacity: 0; }
    92%            { transform: translate(2px, 2px); opacity: 1; }
    94%            { transform: translate(-2px, 0); opacity: 1; }
    96%            { transform: translate(1px, -2px); opacity: 1; }
    98%            { transform: translate(0, 0); opacity: 0; }
}

@keyframes sentinelMitrePulse {
    0%, 100% { box-shadow: 0 0 16px var(--orange-soft); }
    50%       { box-shadow: 0 0 28px var(--orange-glow); }
}

@keyframes sentinelFeedIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
}
`;

// ── Inject keyframes into DOM ─────────────────────────────────────────────────

let injected = false;

/**
 * Inject all CSS keyframes into the document <head>.
 * Call once in main.jsx before rendering.
 * Safe to call multiple times — only injects once.
 */
export function injectKeyframes() {
    if (injected || typeof document === "undefined") return;
    const style = document.createElement("style");
    style.id = "sentinel-keyframes";
    style.textContent = cssKeyframes;
    document.head.appendChild(style);
    injected = true;
}

export default keyframes;