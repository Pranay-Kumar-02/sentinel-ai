// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Spring Physics Configurations
// Reusable spring configs for Framer Motion's transition prop
// Usage: transition={{ ...springs.snappy }}
// ─────────────────────────────────────────────────────────────────────────────

// ── Core Spring Presets ───────────────────────────────────────────────────────

export const springs = {

    // Instant — for state-driven repaints that should feel immediate
    instant: {
        type: "spring",
        stiffness: 2000,
        damping: 100,
        mass: 0.5,
    },

    // Snappy — button clicks, toggles, small UI feedback
    snappy: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        mass: 0.6,
    },

    // Crisp — nav items, chips, badges — fast but not harsh
    crisp: {
        type: "spring",
        stiffness: 450,
        damping: 28,
        mass: 0.7,
    },

    // Default — general purpose, most components use this
    default: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.8,
    },

    // Smooth — cards, panels, larger elements
    smooth: {
        type: "spring",
        stiffness: 220,
        damping: 22,
        mass: 1.0,
    },

    // Gentle — background elements, ambient motion
    gentle: {
        type: "spring",
        stiffness: 140,
        damping: 18,
        mass: 1.2,
    },

    // Lazy — slow drift, orbs, background layers
    lazy: {
        type: "spring",
        stiffness: 80,
        damping: 14,
        mass: 1.5,
    },

    // Bouncy — pop animations, success states, fun moments
    bouncy: {
        type: "spring",
        stiffness: 500,
        damping: 18,
        mass: 0.6,
    },

    // Overshoot — strong bounce, module card elevate on hover
    overshoot: {
        type: "spring",
        stiffness: 380,
        damping: 14,
        mass: 0.7,
    },

    // Wobbly — hero elements, logo, emphasis moments
    wobbly: {
        type: "spring",
        stiffness: 280,
        damping: 10,
        mass: 0.9,
    },

    // Heavy — large panels, drawers, modals
    heavy: {
        type: "spring",
        stiffness: 180,
        damping: 26,
        mass: 1.4,
    },

    // Sidebar — sidebar open/close
    sidebar: {
        type: "spring",
        stiffness: 320,
        damping: 32,
        mass: 1.0,
    },

    // Cursor — custom cursor lag (very low stiffness for organic feel)
    cursor: {
        type: "spring",
        stiffness: 180,
        damping: 20,
        mass: 0.5,
        restDelta: 0.001,
    },

    // Cursor inner dot — faster than outer ring
    cursorDot: {
        type: "spring",
        stiffness: 800,
        damping: 40,
        mass: 0.3,
    },

    // Card tilt — 3D perspective tilt on mouse move
    cardTilt: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 0.8,
    },

    // Verdict reveal — dramatic entrance
    verdict: {
        type: "spring",
        stiffness: 200,
        damping: 18,
        mass: 1.2,
    },

    // Copilot orb morph to panel
    copilot: {
        type: "spring",
        stiffness: 320,
        damping: 24,
        mass: 0.9,
    },

    // Globe rotation
    globe: {
        type: "spring",
        stiffness: 60,
        damping: 20,
        mass: 2.0,
    },

    // Theme switch — dramatic full-screen transition
    themeSwitch: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.7,
    },

    // Progress/confidence bar fill
    progressFill: {
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 1.0,
        restDelta: 0.001,
    },

    // Tooltip appear
    tooltip: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
    },

    // Modal enter
    modal: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.9,
    },

    // Attack chain node appear
    chainNode: {
        type: "spring",
        stiffness: 300,
        damping: 18,
        mass: 0.7,
    },

    // Scan input focus expand
    scanInput: {
        type: "spring",
        stiffness: 350,
        damping: 26,
        mass: 0.8,
    },

    // Upload zone drag feedback
    uploadDrag: {
        type: "spring",
        stiffness: 400,
        damping: 22,
        mass: 0.6,
    },

    // MITRE cell highlight
    mitreCell: {
        type: "spring",
        stiffness: 400,
        damping: 24,
        mass: 0.6,
    },

    // NavItem hover
    navItem: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
    },

    // Hero metric counter pop
    metricPop: {
        type: "spring",
        stiffness: 280,
        damping: 20,
        mass: 0.8,
    },

    // Threat feed item enter
    feedItem: {
        type: "spring",
        stiffness: 280,
        damping: 24,
        mass: 0.9,
    },
};

// ── Easing Curves ─────────────────────────────────────────────────────────────
// For non-spring transitions — use these instead of raw arrays

export const ease = {
    // Standard Material/Apple easing
    out: [0.22, 1, 0.36, 1],        // ease-out expo — most common
    in: [0.64, 0, 0.78, 0],        // ease-in expo
    inOut: [0.45, 0, 0.55, 1],        // ease-in-out sine

    // Custom Sentinel curves
    snap: [0.34, 1.56, 0.64, 1],     // slight overshoot — buttons, cards
    smooth: [0.25, 0.46, 0.45, 0.94],  // smooth decelerate
    dramatic: [0.12, 0, 0.39, 0],        // slow start, fast end — reveals
    anticipate: [0.36, 0, 0.66, -0.56],    // pull back then launch

    // Linear for continuous animations
    linear: "linear",
};

// ── Duration Presets ──────────────────────────────────────────────────────────

export const duration = {
    instant: 0.08,
    fastest: 0.15,
    fast: 0.22,
    normal: 0.35,
    slow: 0.5,
    slower: 0.7,
    dramatic: 1.0,
    epic: 1.5,
};

// ── Tween Presets (for non-spring animations) ─────────────────────────────────

export const tweens = {

    // Fast snap — icon switches, small toggles
    snap: {
        type: "tween",
        duration: duration.fastest,
        ease: ease.snap,
    },

    // Standard UI transition
    default: {
        type: "tween",
        duration: duration.normal,
        ease: ease.out,
    },

    // Smooth reveal
    reveal: {
        type: "tween",
        duration: duration.slow,
        ease: ease.out,
    },

    // Cinematic entrance
    cinematic: {
        type: "tween",
        duration: duration.dramatic,
        ease: ease.out,
    },

    // Linear for progress bars, scanlines
    linear: {
        type: "tween",
        duration: duration.slow,
        ease: "linear",
    },
};

// ── Repeat / Loop Configs ─────────────────────────────────────────────────────

export const loops = {

    // Slow infinite pulse — status dots, orbs
    pulse: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2.5,
        ease: ease.inOut,
    },

    // Fast pulse — critical threat alerts
    pulseFast: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.8,
        ease: ease.inOut,
    },

    // Breathing effect — background elements
    breathe: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 4,
        ease: ease.inOut,
    },

    // Radar sweep — 8s full rotation
    radar: {
        repeat: Infinity,
        duration: 8,
        ease: "linear",
    },

    // Shimmer sweep — skeleton loaders
    shimmer: {
        repeat: Infinity,
        duration: 2.5,
        ease: "linear",
    },

    // Spin — loading spinners
    spin: {
        repeat: Infinity,
        duration: 1,
        ease: "linear",
    },

    // Slow spin — globe, ambient rotation
    spinSlow: {
        repeat: Infinity,
        duration: 20,
        ease: "linear",
    },

    // Float — particle drift
    float: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 6,
        ease: ease.inOut,
    },

    // Counter tick — live metric counters
    tick: {
        repeat: Infinity,
        duration: 0.1,
        ease: "linear",
    },
};

// ── Stagger Helpers ───────────────────────────────────────────────────────────

export const stagger = {
    xs: 0.03,
    sm: 0.05,
    default: 0.08,
    md: 0.12,
    lg: 0.18,
    xl: 0.25,
};

// ── Delay Helpers ─────────────────────────────────────────────────────────────

export const delay = {
    none: 0,
    xs: 0.05,
    sm: 0.1,
    default: 0.2,
    md: 0.3,
    lg: 0.5,
    xl: 0.8,
    page: 0.15,   // standard page entry delay
    hero: 0.3,    // hero content delay
    section: 0.1,    // section reveal delay
};

// ── Viewport Trigger Config ───────────────────────────────────────────────────
// Pass to Framer Motion's viewport prop for scroll-triggered animations

export const viewport = {
    // Trigger once when 20% of element is visible
    once: {
        once: true,
        amount: 0.2,
    },

    // Trigger every time
    always: {
        once: false,
        amount: 0.15,
    },

    // Trigger when mostly visible (images, cards)
    majority: {
        once: true,
        amount: 0.4,
    },

    // Trigger immediately on any visibility
    any: {
        once: true,
        amount: 0.05,
    },
};

// ── Composite Transition Builders ─────────────────────────────────────────────
// Helper functions that build complete transition objects

/**
 * Build a staggered spring transition for container children
 * @param {number} staggerDelay - seconds between each child
 * @param {number} initialDelay - seconds before first child starts
 * @param {object} springConfig - spring config from springs object
 */
export function buildStagger(
    staggerDelay = stagger.default,
    initialDelay = delay.default,
    springConfig = springs.default
) {
    return {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
        ...springConfig,
    };
}

/**
 * Build a delayed spring transition
 * @param {number} delaySeconds
 * @param {object} springConfig
 */
export function buildDelayed(delaySeconds = 0, springConfig = springs.default) {
    return {
        ...springConfig,
        delay: delaySeconds,
    };
}

/**
 * Build a tween with custom duration and easing
 * @param {number} durationSeconds
 * @param {Array|string} easingCurve - from ease object
 * @param {number} delaySeconds
 */
export function buildTween(
    durationSeconds = duration.normal,
    easingCurve = ease.out,
    delaySeconds = 0
) {
    return {
        type: "tween",
        duration: durationSeconds,
        ease: easingCurve,
        delay: delaySeconds,
    };
}

/**
 * Build an infinite loop transition
 * @param {number} durationSeconds
 * @param {string} repeatType - "loop" | "reverse" | "mirror"
 * @param {Array|string} easingCurve
 */
export function buildLoop(
    durationSeconds = 2,
    repeatType = "reverse",
    easingCurve = ease.inOut
) {
    return {
        type: "tween",
        duration: durationSeconds,
        ease: easingCurve,
        repeat: Infinity,
        repeatType,
    };
}