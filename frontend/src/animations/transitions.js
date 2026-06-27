// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Transition Configurations
// Page transitions, route animations, and component-level transition presets
// Usage: import { pageTransitions, routeTransition } from '@/animations/transitions'
// ─────────────────────────────────────────────────────────────────────────────

import { springs, ease, duration, delay } from "./spring";

// ── Route / Page Transitions ──────────────────────────────────────────────────
// Used with AnimatePresence + motion.div wrapping each page

export const routeTransition = {
    // Default — fade + subtle blur + scale
    default: {
        initial: { opacity: 0, filter: "blur(4px)", scale: 0.99 },
        animate: { opacity: 1, filter: "blur(0px)", scale: 1 },
        exit: { opacity: 0, filter: "blur(4px)", scale: 0.98 },
        transition: {
            duration: duration.normal,
            ease: ease.out,
        },
    },

    // Slide from right — forward navigation
    slideForward: {
        initial: { opacity: 0, x: 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
        transition: { ...springs.smooth },
    },

    // Slide from left — back navigation
    slideBack: {
        initial: { opacity: 0, x: -40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 24 },
        transition: { ...springs.smooth },
    },

    // Fade only — subtle, professional
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: duration.normal, ease: ease.out },
    },

    // Rise — content rises from below
    rise: {
        initial: { opacity: 0, y: 32, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: { opacity: 0, y: -16 },
        transition: { ...springs.default },
    },

    // Cinematic — dramatic reveal for Command Center
    cinematic: {
        initial: { opacity: 0, scale: 0.96, filter: "blur(12px)" },
        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, scale: 1.02, filter: "blur(4px)" },
        transition: {
            duration: duration.slow,
            ease: ease.out,
            delay: delay.page,
        },
    },
};

// ── Per-Page Transition Map ───────────────────────────────────────────────────
// Map each route to its preferred transition style

export const pageTransitionMap = {
    "/": routeTransition.cinematic,
    "/command": routeTransition.cinematic,
    "/scanner": routeTransition.slideForward,
    "/forensics": routeTransition.slideForward,
    "/osint": routeTransition.slideForward,
    "/intelligence": routeTransition.rise,
    "/email": routeTransition.slideForward,
    "/history": routeTransition.fade,
    "/learn": routeTransition.rise,
    "/settings": routeTransition.fade,
    "/about": routeTransition.fade,
};

/**
 * Get the right transition for a given route path
 * Falls back to default if path not in map
 */
export function getPageTransition(path = "/") {
    return pageTransitionMap[path] ?? routeTransition.default;
}

// ── Component-Level Transitions ───────────────────────────────────────────────
// Used directly in the `transition` prop of motion elements

export const transitions = {

    // ── Instant ────────────────────────────────────────────────
    instant: {
        duration: 0,
    },

    // ── Fast snappy — buttons, toggles, icon swaps ─────────────
    snappy: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        mass: 0.6,
    },

    // ── Default — most components ──────────────────────────────
    default: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.8,
    },

    // ── Smooth — cards, panels ─────────────────────────────────
    smooth: {
        type: "spring",
        stiffness: 220,
        damping: 22,
        mass: 1.0,
    },

    // ── Gentle — background, ambient ───────────────────────────
    gentle: {
        duration: duration.slow,
        ease: ease.inOut,
    },

    // ── Spring bounce — success states, pop moments ────────────
    bounce: {
        type: "spring",
        stiffness: 500,
        damping: 18,
        mass: 0.6,
    },

    // ── Overshoot — card elevate hover ─────────────────────────
    overshoot: {
        type: "spring",
        stiffness: 380,
        damping: 14,
        mass: 0.7,
    },

    // ── Cursor outer ring ──────────────────────────────────────
    cursor: {
        type: "spring",
        stiffness: 180,
        damping: 20,
        mass: 0.5,
        restDelta: 0.001,
    },

    // ── Cursor inner dot ───────────────────────────────────────
    cursorDot: {
        type: "spring",
        stiffness: 800,
        damping: 40,
        mass: 0.3,
    },

    // ── Sidebar expand/collapse ────────────────────────────────
    sidebar: {
        type: "spring",
        stiffness: 320,
        damping: 32,
        mass: 1.0,
    },

    // ── Modal enter ────────────────────────────────────────────
    modal: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 0.9,
    },

    // ── Verdict cinematic reveal ───────────────────────────────
    verdict: {
        type: "spring",
        stiffness: 200,
        damping: 18,
        mass: 1.2,
    },

    // ── Progress bar fill ──────────────────────────────────────
    progress: {
        type: "spring",
        stiffness: 120,
        damping: 20,
        mass: 1.0,
        restDelta: 0.001,
    },

    // ── Card 3D tilt ───────────────────────────────────────────
    tilt: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 0.8,
    },

    // ── Tooltip ────────────────────────────────────────────────
    tooltip: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
    },

    // ── Accordion open/close ───────────────────────────────────
    accordion: {
        duration: duration.normal,
        ease: ease.out,
    },

    // ── Theme pill select ──────────────────────────────────────
    themePill: {
        type: "spring",
        stiffness: 450,
        damping: 28,
        mass: 0.6,
    },

    // ── Copilot orb → panel morph ──────────────────────────────
    copilot: {
        type: "spring",
        stiffness: 320,
        damping: 24,
        mass: 0.9,
    },

    // ── Upload zone drag ───────────────────────────────────────
    upload: {
        type: "spring",
        stiffness: 400,
        damping: 22,
        mass: 0.6,
    },

    // ── Hero metrics counter ───────────────────────────────────
    metric: {
        type: "spring",
        stiffness: 280,
        damping: 20,
        mass: 0.8,
    },

    // ── Chain node appear ──────────────────────────────────────
    chainNode: {
        type: "spring",
        stiffness: 300,
        damping: 18,
        mass: 0.7,
    },

    // ── Feed item enter ────────────────────────────────────────
    feedItem: {
        type: "spring",
        stiffness: 280,
        damping: 24,
        mass: 0.9,
    },

    // ── Color/theme change ─────────────────────────────────────
    colorChange: {
        duration: duration.slow,
        ease: ease.inOut,
    },

    // ── Scan line sweep ────────────────────────────────────────
    scanSweep: {
        duration: duration.dramatic,
        ease: "linear",
        repeat: Infinity,
    },
};

// ── AnimatePresence Mode Map ──────────────────────────────────────────────────
// Controls how exiting + entering elements interact

export const presenceMode = {
    // Default — both animate simultaneously
    sync: "sync",
    // Wait for exit to finish before entering
    wait: "wait",
    // Enter immediately, don't wait for exit
    popLayout: "popLayout",
};

// ── Shared Layout Transition ──────────────────────────────────────────────────
// Used with layoutId for shared element transitions (tabs, active indicators)

export const layoutTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.7,
};

export const layoutTransitionSlow = {
    type: "spring",
    stiffness: 200,
    damping: 24,
    mass: 1.0,
};

// ── Gesture Transition Configs ────────────────────────────────────────────────
// For whileTap, whileHover — instant feel

export const gestures = {

    // Standard button tap
    buttonTap: {
        scale: 0.96,
        transition: { type: "spring", stiffness: 600, damping: 28 },
    },

    // Card hover lift
    cardHover: {
        scale: 1.02,
        y: -4,
        transition: { type: "spring", stiffness: 380, damping: 18 },
    },

    // Card tap press
    cardTap: {
        scale: 0.98,
        transition: { type: "spring", stiffness: 600, damping: 30 },
    },

    // Nav item hover
    navHover: {
        x: 3,
        transition: { type: "spring", stiffness: 500, damping: 28 },
    },

    // Icon button
    iconHover: {
        scale: 1.12,
        rotate: 5,
        transition: { type: "spring", stiffness: 500, damping: 20 },
    },

    // Icon tap
    iconTap: {
        scale: 0.88,
        transition: { type: "spring", stiffness: 600, damping: 28 },
    },

    // Pill/chip hover
    pillHover: {
        scale: 1.04,
        y: -1,
        transition: { type: "spring", stiffness: 450, damping: 24 },
    },

    // CTA button hover
    ctaHover: {
        scale: 1.03,
        y: -3,
        transition: { type: "spring", stiffness: 350, damping: 18 },
    },

    // CTA tap
    ctaTap: {
        scale: 0.97,
        transition: { type: "spring", stiffness: 600, damping: 28 },
    },

    // Copilot orb hover
    copilotHover: {
        scale: 1.12,
        transition: { type: "spring", stiffness: 400, damping: 18 },
    },

    // Threat item hover
    threatHover: {
        x: 6,
        transition: { type: "spring", stiffness: 400, damping: 24 },
    },
};

// ── CSS Transition Strings ────────────────────────────────────────────────────
// For non-Framer-Motion elements (hover states in CSS-in-JS)

export const cssTransitions = {
    instant: "all 0s",
    fastest: "all 0.1s ease",
    fast: "all 0.15s ease",
    default: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
    smooth: "all 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
    slow: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
    color: "color 0.2s ease, background 0.2s ease, border-color 0.2s ease",
    shadow: "box-shadow 0.2s ease",
    opacity: "opacity 0.2s ease",
    transform: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
};

// ── Orchestration Helpers ─────────────────────────────────────────────────────

/**
 * Build a staggered children transition for a container
 * @param {number} staggerSecs - delay between each child
 * @param {number} delaySecs   - initial delay before first child
 */
export function staggered(staggerSecs = 0.08, delaySecs = 0.1) {
    return {
        staggerChildren: staggerSecs,
        delayChildren: delaySecs,
    };
}

/**
 * Build a delayed version of any transition
 * @param {object} transition - base transition object
 * @param {number} delaySecs  - seconds to delay
 */
export function delayed(transition, delaySecs = 0.2) {
    return { ...transition, delay: delaySecs };
}

/**
 * Build a repeated (looping) tween transition
 * @param {number} durationSecs
 * @param {string} repeatType - "loop" | "reverse" | "mirror"
 */
export function looping(durationSecs = 2, repeatType = "reverse") {
    return {
        duration: durationSecs,
        repeat: Infinity,
        repeatType,
        ease: ease.inOut,
    };
}

/**
 * Combine a spring with a delay
 * @param {object} springPreset - from springs object
 * @param {number} delaySecs
 */
export function springDelay(springPreset, delaySecs = 0) {
    return { ...springPreset, delay: delaySecs };
}