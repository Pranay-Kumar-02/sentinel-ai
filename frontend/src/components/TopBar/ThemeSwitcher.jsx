// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThemeSwitcher
// Animated theme pill switcher with ripple transition effect
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeSwitcher } from "../../context/ThemeContext";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

// Swatch color per theme id
const SWATCHES = {
    cyber: "#00d4ff",
    midnight: "#a855f7",
    matrix: "#00ff41",
    emergency: "#ff4444",
    arctic: "#67e8f9",
    aurora: "#8b5cf6",
    enterprise: "#3b82f6",
    phantom: "#6366f1",
};

export default function ThemeSwitcher({ compact = false }) {
    const { themeId, themes, setTheme, isTransitioning } = useThemeSwitcher();
    const { colors } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [expanded, setExpanded] = useState(false);

    // Compact mode — just show current + expand on click
    if (compact) {
        return (
            <div style={{ position: "relative" }}>
                <motion.button
                    onClick={() => setExpanded((v) => !v)}
                    onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "THEME")}
                    onMouseLeave={resetCursor}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 12px",
                        background: colors.bgSurface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        color: colors.textSub,
                        fontSize: "0.78rem",
                        fontFamily: "var(--font-body)",
                        transition: "border-color 0.2s ease",
                    }}
                >
                    <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: SWATCHES[themeId] ?? colors.accent,
                        boxShadow: `0 0 6px ${SWATCHES[themeId] ?? colors.accent}`,
                        flexShrink: 0,
                    }} />
                    <span>{themes.find((t) => t.id === themeId)?.name ?? "Theme"}</span>
                    <motion.span
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: "0.6rem", color: colors.textMuted }}
                    >
                        ▼
                    </motion.span>
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                            style={{
                                position: "absolute",
                                top: "calc(100% + 8px)",
                                right: 0,
                                background: colors.bgCard,
                                backdropFilter: "var(--backdrop-blur)",
                                border: `1px solid ${colors.border}`,
                                borderRadius: 12,
                                padding: 8,
                                minWidth: 180,
                                zIndex: 1000,
                                boxShadow: `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px ${colors.border}`,
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            {themes.map((t) => (
                                <ThemePill
                                    key={t.id}
                                    theme={t}
                                    isActive={themeId === t.id}
                                    swatch={SWATCHES[t.id]}
                                    colors={colors}
                                    onSelect={() => {
                                        setTheme(t.id);
                                        setExpanded(false);
                                    }}
                                    fullWidth
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Backdrop to close */}
                {expanded && (
                    <div
                        onClick={() => setExpanded(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 999,
                        }}
                    />
                )}
            </div>
        );
    }

    // Full mode — all pills visible
    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
        }}>
            {themes.map((t) => (
                <ThemePill
                    key={t.id}
                    theme={t}
                    isActive={themeId === t.id}
                    swatch={SWATCHES[t.id]}
                    colors={colors}
                    onSelect={() => setTheme(t.id)}
                    disabled={isTransitioning}
                />
            ))}
        </div>
    );
}

// ── Theme Pill ────────────────────────────────────────────────────────────────

function ThemePill({ theme, isActive, swatch, colors, onSelect, fullWidth = false, disabled = false }) {
    const { setCursor, resetCursor } = useCursor();

    return (
        <motion.button
            onClick={disabled ? undefined : onSelect}
            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, theme.name.toUpperCase())}
            onMouseLeave={resetCursor}
            whileHover={{ scale: fullWidth ? 1.01 : 1.04, y: fullWidth ? 0 : -1 }}
            whileTap={{ scale: 0.97 }}
            layout
            style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: fullWidth ? "9px 12px" : "5px 12px",
                background: isActive ? `${swatch}18` : "transparent",
                border: `1px solid ${isActive ? swatch + "50" : colors.border}`,
                borderRadius: fullWidth ? 8 : 999,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                width: fullWidth ? "100%" : "auto",
                transition: "background 0.2s ease, border-color 0.2s ease",
            }}
        >
            {/* Color swatch dot */}
            <motion.div
                animate={{
                    boxShadow: isActive ? `0 0 8px ${swatch}` : "none",
                }}
                style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: swatch,
                    flexShrink: 0,
                    transition: "box-shadow 0.2s ease",
                }}
            />

            {/* Icon + name */}
            <span style={{ fontSize: "0.78rem" }}>{theme.icon}</span>
            <span style={{
                fontSize: "0.78rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? swatch : colors.textSub,
                fontFamily: "var(--font-body)",
                whiteSpace: "nowrap",
                transition: "color 0.2s ease",
            }}>
                {theme.name}
            </span>

            {/* Active checkmark */}
            {isActive && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                        marginLeft: "auto",
                        fontSize: "0.7rem",
                        color: swatch,
                    }}
                >
                    ✓
                </motion.span>
            )}
        </motion.button>
    );
}