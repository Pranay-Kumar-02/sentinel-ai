// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useTheme hook
// The ONE hook every component imports for theme data.
// Re-exports from ThemeContext with a clean API.
//
// Usage:
//   const { colors, gradients, effects, verdicts } = useTheme()
//   const { setTheme, themeId, themes } = useTheme()
// ─────────────────────────────────────────────────────────────────────────────

import { useThemeContext, getVerdictStyle } from "../context/ThemeContext";

/**
 * Primary theme hook — use this in every component.
 *
 * Returns a flat, convenient object so components never need to
 * reach into nested theme properties manually.
 */
export function useTheme() {
    const ctx = useThemeContext();

    return {
        // ── Identity ───────────────────────────────────────────
        theme: ctx.theme,
        themeId: ctx.themeId,
        themes: ctx.themes,
        isLight: ctx.isLight,
        isTransitioning: ctx.isTransitioning,

        // ── Actions ────────────────────────────────────────────
        setTheme: ctx.setTheme,
        nextTheme: ctx.nextTheme,
        prevTheme: ctx.prevTheme,

        // ── Color Maps ─────────────────────────────────────────
        colors: ctx.colors,
        gradients: ctx.gradients,
        glows: ctx.glows,
        verdicts: ctx.verdicts,

        // ── Feature Configs ────────────────────────────────────
        particles: ctx.particles,
        grid: ctx.grid,
        radar: ctx.radar,
        effects: ctx.effects,
        cursor: ctx.cursor,
        nav: ctx.nav,
        fonts: ctx.fonts,

        // ── Special Effect Flags ───────────────────────────────
        hasMatrixRain: ctx.hasMatrixRain,
        hasAurora: ctx.hasAurora,
        hasEmergency: ctx.hasEmergency,

        // ── Verdict Style Helper ───────────────────────────────
        // Usage: getVerdict("CRITICAL") → { color, glow, bg, border }
        getVerdict: (verdict) => getVerdictStyle(ctx.verdicts, verdict),

        // ── Quick color accessors (most-used, no destructuring needed)
        accent: ctx.colors.accent,
        accentGlow: ctx.colors.accentGlow,
        accentSoft: ctx.colors.accentSoft,
        bg: ctx.colors.bg,
        bgCard: ctx.colors.bgCard,
        bgSurface: ctx.colors.bgSurface,
        bgGlass: ctx.colors.bgGlass,
        border: ctx.colors.border,
        borderHover: ctx.colors.borderHover,
        borderGlow: ctx.colors.borderGlow,
        text: ctx.colors.text,
        textSub: ctx.colors.textSub,
        textMuted: ctx.colors.textMuted,
        green: ctx.colors.green,
        greenGlow: ctx.colors.greenGlow,
        red: ctx.colors.red,
        redGlow: ctx.colors.redGlow,
        amber: ctx.colors.amber,
        amberGlow: ctx.colors.amberGlow,
        purple: ctx.colors.purple,
        purpleGlow: ctx.colors.purpleGlow,
        blue: ctx.colors.blue,
        blueGlow: ctx.colors.blueGlow,
        teal: ctx.colors.teal,
        tealGlow: ctx.colors.tealGlow,
        pink: ctx.colors.pink,
        pinkGlow: ctx.colors.pinkGlow,
    };
}

export default useTheme;