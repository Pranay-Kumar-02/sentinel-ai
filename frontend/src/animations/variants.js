// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Animation Variants
// All Framer Motion variants used across the platform
// Import what you need: import { fadeUp, staggerContainer } from '@/animations/variants'
// ─────────────────────────────────────────────────────────────────────────────

// ── Fade Variants ─────────────────────────────────────────────────────────────

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
};

export const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: 12, transition: { duration: 0.25, ease: "easeIn" } },
};

export const fadeDown = {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" } },
};

export const fadeLeft = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -12, transition: { duration: 0.2, ease: "easeIn" } },
};

export const fadeRight = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: 12, transition: { duration: 0.2, ease: "easeIn" } },
};

// ── Scale Variants ────────────────────────────────────────────────────────────

export const scaleIn = {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } },
    exit: { opacity: 0, scale: 0.94, transition: { duration: 0.2, ease: "easeIn" } },
};

export const scaleInSpring = {
    hidden: { opacity: 0, scale: 0.7 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 22, mass: 0.8 },
    },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.18 } },
};

export const scalePop = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 500, damping: 20, mass: 0.6 },
    },
    exit: { opacity: 0, scale: 0.75, transition: { duration: 0.15 } },
};

// ── Stagger Containers ────────────────────────────────────────────────────────

export const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.04,
            staggerDirection: -1,
        },
    },
};

export const staggerContainerFast = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05,
        },
    },
};

export const staggerContainerSlow = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.14,
            delayChildren: 0.2,
        },
    },
};

// ── Hero Section ──────────────────────────────────────────────────────────────

export const heroContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
            delayChildren: 0.3,
        },
    },
};

export const heroItem = {
    hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

export const heroMetric = {
    hidden: { opacity: 0, scale: 0.8, y: 16 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 280, damping: 20 },
    },
};

// ── Card Variants ─────────────────────────────────────────────────────────────

export const cardReveal = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.2 } },
};

export const cardHover = {
    rest: { scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    hover: { scale: 1.02, y: -4, transition: { type: "spring", stiffness: 400, damping: 22 } },
    tap: { scale: 0.98, y: 0, transition: { duration: 0.1 } },
};

export const cardTilt = {
    rest: { rotateX: 0, rotateY: 0, z: 0 },
    hover: {
        z: 20,
        transition: { type: "spring", stiffness: 300, damping: 20 },
    },
};

// ── Module Cards ──────────────────────────────────────────────────────────────

export const moduleCardContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
};

export const moduleCard = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 260, damping: 22 },
    },
};

// ── Sidebar & Navigation ──────────────────────────────────────────────────────

export const sidebarVariants = {
    open: {
        width: 240,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    closed: {
        width: 64,
        transition: { type: "spring", stiffness: 300, damping: 30 },
    },
};

export const navItemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    }),
};

export const navLabelVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
    closed: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

// ── Verdict Reveal — Cinematic Investigation ──────────────────────────────────

export const verdictReveal = {
    hidden: { opacity: 0, scale: 0.6, filter: "blur(20px)" },
    visible: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 200, damping: 18, mass: 1.2 },
    },
};

export const verdictLabel = {
    hidden: { opacity: 0, letterSpacing: "0.3em", y: 10 },
    visible: {
        opacity: 1,
        letterSpacing: "0.08em",
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

export const evidenceReveal = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
};

// ── Attack Chain ──────────────────────────────────────────────────────────────

export const chainContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
};

export const chainNode = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 18 },
    },
};

export const chainLine = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
        scaleX: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
    },
};

// ── IOC Tags ──────────────────────────────────────────────────────────────────

export const iocTag = {
    hidden: { opacity: 0, scale: 0.7, y: 8 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 20 },
    },
};

export const iocContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

// ── Terminal Log Lines ─────────────────────────────────────────────────────────

export const terminalLine = {
    hidden: { opacity: 0, x: -12, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        transition: { duration: 0.25, ease: "easeOut" },
    },
};

export const terminalContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

// ── OSINT Panel ───────────────────────────────────────────────────────────────

export const osintPanel = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        height: 0,
        transition: { duration: 0.3, ease: "easeIn" },
    },
};

export const osintCard = {
    hidden: { opacity: 0, y: 16 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
};

// ── AI Reasoning Typewriter ───────────────────────────────────────────────────

export const aiReasoningContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.018 },
    },
};

export const aiReasoningChar = {
    hidden: { opacity: 0, y: 4 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.12 },
    },
};

// ── Modal / Overlay ───────────────────────────────────────────────────────────

export const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalVariants = {
    hidden: { opacity: 0, scale: 0.88, y: 32, filter: "blur(8px)" },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
        opacity: 0,
        scale: 0.92,
        y: 16,
        filter: "blur(4px)",
        transition: { duration: 0.22, ease: "easeIn" },
    },
};

export const drawerVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
    exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

export const drawerLeft = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
    exit: { x: "-100%", transition: { duration: 0.25, ease: "easeIn" } },
};

// ── Toast / Notification ──────────────────────────────────────────────────────

export const toastVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 22 },
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.18, ease: "easeIn" },
    },
};

// ── Threat Feed Items ─────────────────────────────────────────────────────────

export const feedItem = {
    hidden: { opacity: 0, x: -20, height: 0 },
    visible: {
        opacity: 1,
        x: 0,
        height: "auto",
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        x: 20,
        height: 0,
        transition: { duration: 0.2, ease: "easeIn" },
    },
};

export const feedContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

// ── Progress / Loading ────────────────────────────────────────────────────────

export const progressBar = {
    hidden: { scaleX: 0, originX: 0 },
    visible: (width) => ({
        scaleX: width / 100,
        transition: { duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 },
    }),
};

export const shimmerVariants = {
    animate: {
        backgroundPosition: ["200% 0", "-200% 0"],
        transition: { duration: 2.5, ease: "linear", repeat: Infinity },
    },
};

export const spinnerVariants = {
    animate: {
        rotate: 360,
        transition: { duration: 1, ease: "linear", repeat: Infinity },
    },
};

// ── AI Copilot Orb ────────────────────────────────────────────────────────────

export const copilotOrb = {
    rest: { scale: 1 },
    hover: { scale: 1.12, transition: { type: "spring", stiffness: 400, damping: 18 } },
    tap: { scale: 0.92 },
    pulse: {
        scale: [1, 1.06, 1],
        transition: { duration: 2.5, ease: "easeInOut", repeat: Infinity },
    },
};

export const copilotPanel = {
    hidden: { opacity: 0, scale: 0.5, y: 20, transformOrigin: "bottom right" },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", stiffness: 320, damping: 24 },
    },
    exit: {
        opacity: 0,
        scale: 0.6,
        y: 10,
        transition: { duration: 0.22, ease: "easeIn" },
    },
};

// ── MITRE ATT&CK Matrix ───────────────────────────────────────────────────────

export const mitreCell = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: (i) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: i * 0.015,
            duration: 0.3,
            ease: "easeOut",
        },
    }),
    active: {
        scale: [1, 1.08, 1],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
};

export const mitreContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.01, delayChildren: 0.2 } },
};

// ── Engine Grid ───────────────────────────────────────────────────────────────

export const engineCard = {
    hidden: { opacity: 0, scale: 0.8, rotate: -6 },
    visible: (i) => ({
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            delay: i * 0.05,
            type: "spring",
            stiffness: 300,
            damping: 20,
        },
    }),
};

export const engineContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

// ── Stats / Counter ───────────────────────────────────────────────────────────

export const counterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 22, delay: 0.2 },
    },
};

export const statsRow = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
};

export const statItem = {
    hidden: { opacity: 0, y: 24, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 280, damping: 22 },
    },
};

// ── Page Transitions ──────────────────────────────────────────────────────────

export const pageTransition = {
    hidden: { opacity: 0, filter: "blur(4px)", scale: 0.99 },
    visible: {
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        filter: "blur(4px)",
        scale: 0.98,
        transition: { duration: 0.25, ease: "easeIn" },
    },
};

export const slideInPage = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.25, ease: "easeIn" },
    },
};

// ── Badge / Chip ──────────────────────────────────────────────────────────────

export const badgeAppear = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 500, damping: 22 },
    },
    exit: { opacity: 0, scale: 0.7, transition: { duration: 0.15 } },
};

// ── Upload Zone ───────────────────────────────────────────────────────────────

export const uploadZone = {
    idle: { scale: 1, borderColor: "var(--border)" },
    dragover: { scale: 1.02, borderColor: "var(--accent)", transition: { type: "spring", stiffness: 400 } },
    success: { scale: 1, borderColor: "var(--green)" },
    error: { scale: 1, borderColor: "var(--red)", x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } },
};

export const uploadIcon = {
    idle: { y: 0, opacity: 1 },
    dragover: { y: -8, opacity: 0.8, transition: { type: "spring", stiffness: 400, damping: 18 } },
};

// ── Scanning Animation ────────────────────────────────────────────────────────

export const scanPulse = {
    animate: {
        scale: [1, 1.4, 1],
        opacity: [0.8, 0, 0.8],
        transition: { duration: 1.8, ease: "easeInOut", repeat: Infinity },
    },
};

export const scanLine = {
    animate: {
        y: ["-100%", "100%"],
        transition: { duration: 2, ease: "linear", repeat: Infinity },
    },
};

export const radarBlip = {
    hidden: { scale: 0, opacity: 1 },
    visible: {
        scale: [0, 2.5],
        opacity: [1, 0],
        transition: { duration: 1.2, ease: "easeOut" },
    },
};

// ── Glitch ────────────────────────────────────────────────────────────────────

export const glitchVariants = {
    rest: { x: 0, skewX: 0 },
    glitch: {
        x: [0, -2, 2, -1, 1, 0],
        skewX: [0, -1, 1, 0],
        transition: { duration: 0.3, ease: "linear" },
    },
};

// ── Tooltip ───────────────────────────────────────────────────────────────────

export const tooltipVariants = {
    hidden: { opacity: 0, y: 4, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
    exit: { opacity: 0, y: 2, scale: 0.97, transition: { duration: 0.12 } },
};

// ── Accordion ─────────────────────────────────────────────────────────────────

export const accordionContent = {
    hidden: { height: 0, opacity: 0, overflow: "hidden" },
    visible: {
        height: "auto",
        opacity: 1,
        transition: { height: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2, delay: 0.1 } },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: { height: { duration: 0.28, ease: "easeIn" }, opacity: { duration: 0.15 } },
    },
};

export const accordionChevron = {
    closed: { rotate: 0 },
    open: { rotate: 180, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

// ── Theme Switch ──────────────────────────────────────────────────────────────

export const themeSwitchOverlay = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
        opacity: [0, 0.6, 0],
        scale: [0, 4],
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

// ── IntelGlobe ────────────────────────────────────────────────────────────────

export const globeContainer = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(12px)" },
    visible: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
    },
};

// ── Section Headers ───────────────────────────────────────────────────────────

export const sectionHead = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
};

export const sectionHeadLine = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
        scaleX: 1,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
    },
};

// ── Collapse / Expand ─────────────────────────────────────────────────────────

export const collapseVariants = {
    open: { height: "auto", opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    closed: { height: 0, opacity: 0, transition: { duration: 0.28, ease: "easeIn" } },
};

// ── Particle Burst (click feedback) ──────────────────────────────────────────

export const particleBurst = {
    hidden: { scale: 0, opacity: 1 },
    visible: (i) => ({
        scale: [0, 1.5],
        opacity: [1, 0],
        x: Math.cos((i / 6) * Math.PI * 2) * 30,
        y: Math.sin((i / 6) * Math.PI * 2) * 30,
        transition: { duration: 0.4, ease: "easeOut" },
    }),
};