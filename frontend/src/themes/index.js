// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — THEME SYSTEM
// 8 complete themes, all following the Godmode Design System spec
// ─────────────────────────────────────────────────────────────────────────────

import { cyber } from "./cyber";
import { midnight } from "./midnight";
import { matrix } from "./matrix";
import { emergency } from "./emergency";
import { arctic } from "./arctic";
import { aurora } from "./aurora";
import { enterprise } from "./enterprise";
import { phantom } from "./phantom";

// ── Named exports (direct access) ────────────────────────────────────────────
export { cyber, midnight, matrix, emergency, arctic, aurora, enterprise, phantom };

// ── Theme Registry (ordered for UI picker) ───────────────────────────────────
export const THEMES = [
    cyber,
    midnight,
    matrix,
    emergency,
    arctic,
    aurora,
    enterprise,
    phantom,
];

// ── Theme Map (keyed by id for O(1) lookup) ───────────────────────────────────
export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t]));

// ── Default theme ─────────────────────────────────────────────────────────────
export const DEFAULT_THEME = cyber;

// ── Resolve a theme by id, with safe fallback ─────────────────────────────────
export function getTheme(id) {
    return THEME_MAP[id] ?? DEFAULT_THEME;
}

// ── Persist & retrieve theme preference ───────────────────────────────────────
const STORAGE_KEY = "sentinel_theme";

export function getSavedThemeId() {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME.id;
    } catch {
        return DEFAULT_THEME.id;
    }
}

export function saveThemeId(id) {
    try {
        localStorage.setItem(STORAGE_KEY, id);
    } catch {
        // storage blocked — silent fail
    }
}

// ── Apply theme to DOM as CSS custom properties ───────────────────────────────
// Call this whenever the active theme changes.
// Components can read vars like: var(--accent), var(--bg), etc.
export function applyThemeToDom(theme) {
    const root = document.documentElement;
    const vars = {
        // Core backgrounds
        "--bg": theme.bg,
        "--bg-mid": theme.bgMid,
        "--bg-surface": theme.bgSurface,
        "--bg-glass": theme.bgGlass,
        "--bg-card": theme.bgCard,
        "--bg-input": theme.bgInput,

        // Borders
        "--border": theme.border,
        "--border-hover": theme.borderHover,
        "--border-glow": theme.borderGlow,
        "--border-card": theme.borderCard,

        // Accent
        "--accent": theme.accent,
        "--accent-glow": theme.accentGlow,
        "--accent-soft": theme.accentSoft,
        "--accent-primary": theme.accentPrimary,

        // Semantic
        "--purple": theme.purple,
        "--purple-glow": theme.purpleGlow,
        "--purple-soft": theme.purpleSoft,

        "--green": theme.green,
        "--green-glow": theme.greenGlow,
        "--green-soft": theme.greenSoft,

        "--red": theme.red,
        "--red-glow": theme.redGlow,
        "--red-soft": theme.redSoft,

        "--orange": theme.orange,
        "--orange-glow": theme.orangeGlow,
        "--orange-soft": theme.orangeSoft,

        "--amber": theme.amber,
        "--amber-glow": theme.amberGlow,
        "--amber-soft": theme.amberSoft,

        "--blue": theme.blue,
        "--blue-glow": theme.blueGlow,
        "--blue-soft": theme.blueSoft,

        "--pink": theme.pink,
        "--pink-glow": theme.pinkGlow,
        "--pink-soft": theme.pinkSoft,

        "--teal": theme.teal,
        "--teal-glow": theme.tealGlow,
        "--teal-soft": theme.tealSoft,

        // Text
        "--text": theme.text,
        "--text-sub": theme.textSub,
        "--text-muted": theme.textMuted,
        "--text-dim": theme.textDim,

        // Gradients
        "--gradient-primary": theme.gradientPrimary,
        "--gradient-accent": theme.gradientAccent,
        "--gradient-danger": theme.gradientDanger,
        "--gradient-safe": theme.gradientSafe,
        "--gradient-warning": theme.gradientWarning,
        "--gradient-glass": theme.gradientGlass,
        "--gradient-hero": theme.gradientHero,
        "--gradient-card": theme.gradientCard,
        "--gradient-orb-1": theme.gradientOrb1,
        "--gradient-orb-2": theme.gradientOrb2,
        "--gradient-orb-3": theme.gradientOrb3,
        "--gradient-orb-4": theme.gradientOrb4,

        // Glow
        "--glow-primary": theme.glowPrimary,
        "--glow-card": theme.glowCard,
        "--glow-danger": theme.glowDanger,
        "--glow-safe": theme.glowSafe,

        // Cursor
        "--cursor-color": theme.cursorColor,
        "--cursor-glow": theme.cursorGlow,

        // Fonts
        "--font-display": theme.fontDisplay,
        "--font-body": theme.fontBody,
        "--font-mono": theme.fontMono,
        "--font-accent": theme.fontAccent,

        // Backdrop
        "--backdrop-blur": theme.backdropBlur,
        "--nav-bg": theme.navBg,
        "--sidebar-bg": theme.sidebarBg,

        // Grid
        "--grid-color": theme.gridColor,
        "--grid-pulse": theme.gridPulse,
        "--grid-size": `${theme.gridSize}px`,

        // Radar
        "--radar-color": theme.radarColor,
        "--radar-trail": theme.radarTrail,
        "--radar-dot": theme.radarDot,

        // Light rays
        "--ray-color": theme.rayColor,

        // Scanlines
        "--scanline-opacity": theme.scanlineOpacity,
    };

    // Verdict CSS vars
    for (const [level, v] of Object.entries(theme.verdicts)) {
        const key = level.toLowerCase();
        root.style.setProperty(`--verdict-${key}-color`, v.color);
        root.style.setProperty(`--verdict-${key}-glow`, v.glow);
        root.style.setProperty(`--verdict-${key}-bg`, v.bg);
        root.style.setProperty(`--verdict-${key}-border`, v.border);
    }

    for (const [prop, value] of Object.entries(vars)) {
        root.style.setProperty(prop, String(value));
    }

    // Light theme toggle for Tailwind dark-mode utilities
    if (theme.isLight) {
        root.classList.remove("dark");
        root.classList.add("light");
    } else {
        root.classList.remove("light");
        root.classList.add("dark");
    }
}

// ── Convenience: full resolve + apply ────────────────────────────────────────
export function setTheme(id) {
    const theme = getTheme(id);
    applyThemeToDom(theme);
    saveThemeId(id);
    return theme;
}

// ── Init on app boot ──────────────────────────────────────────────────────────
// Call once in main.jsx / App.jsx before first render.
export function initTheme() {
    const id = getSavedThemeId();
    return setTheme(id);
}