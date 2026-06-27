// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThemeContext
// Global theme state. Wraps entire app.
// Usage: const { theme, themeId, setTheme, themes } = useThemeContext()
// ─────────────────────────────────────────────────────────────────────────────

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";

import {
    THEMES,
    THEME_MAP,
    DEFAULT_THEME,
    getTheme,
    applyThemeToDom,
    getSavedThemeId,
    saveThemeId,
} from "../themes/index";

// ── Context ───────────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }) {
    // Resolve saved theme on first render — no flash
    const [themeId, setThemeIdState] = useState(() => getSavedThemeId());
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [prevThemeId, setPrevThemeId] = useState(null);
    const transitionTimerRef = useRef(null);

    // Derived — always in sync with themeId
    const theme = useMemo(() => getTheme(themeId), [themeId]);

    // ── Apply to DOM on mount + every theme change ─────────────
    useEffect(() => {
        applyThemeToDom(theme);
    }, [theme]);

    // ── Keyboard shortcut: cycle themes with Ctrl+Shift+T ──────
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.ctrlKey && e.shiftKey && e.key === "T") {
                e.preventDefault();
                const idx = THEMES.findIndex((t) => t.id === themeId);
                const nextIdx = (idx + 1) % THEMES.length;
                switchTheme(THEMES[nextIdx].id);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [themeId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Cleanup on unmount ──────────────────────────────────────
    useEffect(() => {
        return () => {
            if (transitionTimerRef.current) {
                clearTimeout(transitionTimerRef.current);
            }
        };
    }, []);

    // ── Switch Theme ────────────────────────────────────────────
    const switchTheme = useCallback(
        (newId) => {
            if (newId === themeId) return;
            if (!THEME_MAP[newId]) return;

            setPrevThemeId(themeId);
            setIsTransitioning(true);

            // Small delay lets the ripple overlay render first
            transitionTimerRef.current = setTimeout(() => {
                setThemeIdState(newId);
                saveThemeId(newId);

                // End transition after CSS vars have propagated
                transitionTimerRef.current = setTimeout(() => {
                    setIsTransitioning(false);
                    setPrevThemeId(null);
                }, 400);
            }, 60);
        },
        [themeId]
    );

    // ── Cycle to next theme ─────────────────────────────────────
    const nextTheme = useCallback(() => {
        const idx = THEMES.findIndex((t) => t.id === themeId);
        const nextIdx = (idx + 1) % THEMES.length;
        switchTheme(THEMES[nextIdx].id);
    }, [themeId, switchTheme]);

    // ── Cycle to previous theme ─────────────────────────────────
    const prevTheme = useCallback(() => {
        const idx = THEMES.findIndex((t) => t.id === themeId);
        const prevIdx = (idx - 1 + THEMES.length) % THEMES.length;
        switchTheme(THEMES[prevIdx].id);
    }, [themeId, switchTheme]);

    // ── Convenience getters ─────────────────────────────────────
    const isLight = theme.isLight ?? false;
    const hasMatrixRain = theme.matrixRain ?? false;
    const hasAurora = Array.isArray(theme.auroraColors) && theme.auroraColors.length > 0;
    const hasEmergency = theme.emergencyPulse ?? false;

    // ── Context value (memoized to prevent unnecessary re-renders)
    const value = useMemo(
        () => ({
            // State
            theme,
            themeId,
            themes: THEMES,
            themeMap: THEME_MAP,
            isTransitioning,
            prevThemeId,

            // Actions
            setTheme: switchTheme,
            nextTheme,
            prevTheme,

            // Convenience flags
            isLight,
            hasMatrixRain,
            hasAurora,
            hasEmergency,

            // Direct color accessors — components can destructure these
            // instead of doing theme.accent every time
            colors: {
                bg: theme.bg,
                bgMid: theme.bgMid,
                bgSurface: theme.bgSurface,
                bgGlass: theme.bgGlass,
                bgCard: theme.bgCard,
                bgInput: theme.bgInput,

                border: theme.border,
                borderHover: theme.borderHover,
                borderGlow: theme.borderGlow,
                borderCard: theme.borderCard,

                accent: theme.accent,
                accentGlow: theme.accentGlow,
                accentSoft: theme.accentSoft,
                accentPrimary: theme.accentPrimary,

                purple: theme.purple,
                purpleGlow: theme.purpleGlow,
                purpleSoft: theme.purpleSoft,

                green: theme.green,
                greenGlow: theme.greenGlow,
                greenSoft: theme.greenSoft,

                red: theme.red,
                redGlow: theme.redGlow,
                redSoft: theme.redSoft,

                orange: theme.orange,
                orangeGlow: theme.orangeGlow,
                orangeSoft: theme.orangeSoft,

                amber: theme.amber,
                amberGlow: theme.amberGlow,
                amberSoft: theme.amberSoft,

                blue: theme.blue,
                blueGlow: theme.blueGlow,
                blueSoft: theme.blueSoft,

                pink: theme.pink,
                pinkGlow: theme.pinkGlow,
                pinkSoft: theme.pinkSoft,

                teal: theme.teal,
                tealGlow: theme.tealGlow,
                tealSoft: theme.tealSoft,

                text: theme.text,
                textSub: theme.textSub,
                textMuted: theme.textMuted,
                textDim: theme.textDim,
            },

            // Gradient accessors
            gradients: {
                primary: theme.gradientPrimary,
                accent: theme.gradientAccent,
                danger: theme.gradientDanger,
                safe: theme.gradientSafe,
                warning: theme.gradientWarning,
                glass: theme.gradientGlass,
                hero: theme.gradientHero,
                card: theme.gradientCard,
                orb1: theme.gradientOrb1,
                orb2: theme.gradientOrb2,
                orb3: theme.gradientOrb3,
                orb4: theme.gradientOrb4,
            },

            // Glow accessors
            glows: {
                primary: theme.glowPrimary,
                card: theme.glowCard,
                danger: theme.glowDanger,
                safe: theme.glowSafe,
            },

            // Particle config for background layers
            particles: {
                colors: theme.particleColors,
                count: theme.particleCount,
                maxSize: theme.particleMaxSize,
                speed: theme.particleSpeed,
                connect: theme.particleConnect,
                attract: theme.particleAttract,
            },

            // Grid config
            grid: {
                color: theme.gridColor,
                pulse: theme.gridPulse,
                size: theme.gridSize,
            },

            // Radar config
            radar: {
                color: theme.radarColor,
                trail: theme.radarTrail,
                dot: theme.radarDot,
            },

            // Verdict colors
            verdicts: theme.verdicts,

            // Font config
            fonts: {
                display: theme.fontDisplay,
                body: theme.fontBody,
                mono: theme.fontMono,
                accent: theme.fontAccent,
            },

            // Special effects
            effects: {
                matrixRain: theme.matrixRain ?? false,
                matrixColor: theme.matrixRainColor ?? "#00ff41",
                matrixOpacity: theme.matrixRainOpacity ?? 0.06,
                auroraColors: theme.auroraColors ?? null,
                auroraHeight: theme.auroraHeight ?? "35vh",
                auroraSpeed: theme.auroraSpeed ?? "8s",
                emergencyPulse: theme.emergencyPulse ?? false,
                emergencyColor: theme.emergencyPulseColor ?? "rgba(255,0,51,0.08)",
                scanlineOpacity: theme.scanlineOpacity ?? 0.015,
                rayColor: theme.rayColor ?? "rgba(0,212,255,0.03)",
                frostEffect: theme.frostEffect ?? false,
                cursorRainbow: theme.cursorRainbow ?? false,
            },

            // Cursor config
            cursor: {
                color: theme.cursorColor,
                glow: theme.cursorGlow,
            },

            // Nav/sidebar bg
            nav: {
                bg: theme.navBg,
                sidebar: theme.sidebarBg,
                blur: theme.backdropBlur,
            },
        }),
        [
            theme,
            themeId,
            isTransitioning,
            prevThemeId,
            switchTheme,
            nextTheme,
            prevTheme,
            isLight,
            hasMatrixRain,
            hasAurora,
            hasEmergency,
        ]
    );

    return (
        <ThemeContext.Provider value={value}>
            {/* Theme transition ripple overlay */}
            {isTransitioning && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 99998,
                        background: theme.bg,
                        opacity: 0,
                        pointerEvents: "none",
                        animation: "themeFlash 0.45s ease forwards",
                    }}
                />
            )}
            {children}
        </ThemeContext.Provider>
    );
}

// ── Primary hook ──────────────────────────────────────────────────────────────

/**
 * Main hook — use this in every component that needs theme data
 *
 * @returns {{
 *   theme: object,
 *   themeId: string,
 *   themes: object[],
 *   setTheme: (id: string) => void,
 *   nextTheme: () => void,
 *   prevTheme: () => void,
 *   isTransitioning: boolean,
 *   isLight: boolean,
 *   hasMatrixRain: boolean,
 *   hasAurora: boolean,
 *   hasEmergency: boolean,
 *   colors: object,
 *   gradients: object,
 *   glows: object,
 *   particles: object,
 *   grid: object,
 *   radar: object,
 *   verdicts: object,
 *   fonts: object,
 *   effects: object,
 *   cursor: object,
 *   nav: object,
 * }}
 */
export function useThemeContext() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useThemeContext must be used inside <ThemeProvider>");
    }
    return ctx;
}

// ── Convenience selector hooks ────────────────────────────────────────────────
// Use these to avoid subscribing to the full context when you only need part

/** Returns just the active theme object */
export function useTheme() {
    return useThemeContext().theme;
}

/** Returns just the colors map */
export function useColors() {
    return useThemeContext().colors;
}

/** Returns just the gradients map */
export function useGradients() {
    return useThemeContext().gradients;
}

/** Returns just the glow map */
export function useGlows() {
    return useThemeContext().glows;
}

/** Returns just the particle config */
export function useParticleConfig() {
    return useThemeContext().particles;
}

/** Returns just the verdict colors */
export function useVerdictColors() {
    return useThemeContext().verdicts;
}

/** Returns special effects flags */
export function useThemeEffects() {
    return useThemeContext().effects;
}

/** Returns { setTheme, nextTheme, prevTheme, isTransitioning } */
export function useThemeSwitcher() {
    const { setTheme, nextTheme, prevTheme, isTransitioning, themeId, themes } =
        useThemeContext();
    return { setTheme, nextTheme, prevTheme, isTransitioning, themeId, themes };
}

// ── getVerdictStyle helper ────────────────────────────────────────────────────
// Returns { color, glow, bg, border } for a given verdict string

/**
 * @param {object} verdicts - from useThemeContext().verdicts
 * @param {string} verdict  - "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "CRITICAL" | "UNKNOWN"
 */
export function getVerdictStyle(verdicts, verdict) {
    const key = (verdict ?? "UNKNOWN").toUpperCase();
    return verdicts[key] ?? verdicts["UNKNOWN"];
}

export default ThemeContext;