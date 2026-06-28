// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Badge, Chip, Divider
// Small atomic components used throughout the platform
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

// ── Badge ─────────────────────────────────────────────────────────────────────

export function Badge({
    children,
    variant = "accent",  // accent | green | red | amber | purple | blue | teal | muted
    size = "sm",      // xs | sm | md
    pulse = false,
    glow = false,
    icon = null,
    style = {},
}) {
    const { colors } = useTheme();

    const variants = {
        accent: { color: colors.accent, bg: colors.accentSoft, border: colors.borderHover },
        green: { color: colors.green, bg: colors.greenSoft, border: colors.green + "30" },
        red: { color: colors.red, bg: colors.redSoft, border: colors.red + "30" },
        amber: { color: colors.amber, bg: colors.amberSoft, border: colors.amber + "30" },
        purple: { color: colors.purple, bg: colors.purpleSoft, border: colors.purple + "30" },
        blue: { color: colors.blue, bg: colors.blueSoft, border: colors.blue + "30" },
        teal: { color: colors.teal, bg: colors.tealSoft, border: colors.teal + "30" },
        pink: { color: colors.pink, bg: colors.pinkSoft, border: colors.pink + "30" },
        muted: { color: colors.textMuted, bg: colors.bgSurface, border: colors.border },
    };

    const sizes = {
        xs: { fontSize: "0.6rem", padding: "1px 6px", borderRadius: 4, gap: 3 },
        sm: { fontSize: "0.68rem", padding: "2px 8px", borderRadius: 5, gap: 4 },
        md: { fontSize: "0.75rem", padding: "4px 10px", borderRadius: 6, gap: 5 },
    };

    const v = variants[variant] ?? variants.accent;
    const s = sizes[size] ?? sizes.sm;

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ scale: pulse ? [1, 1.08, 1] : 1, opacity: 1 }}
            transition={pulse
                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: s.gap,
                padding: s.padding,
                fontSize: s.fontSize,
                fontFamily: "var(--font-accent)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: v.color,
                background: v.bg,
                border: `1px solid ${v.border}`,
                borderRadius: s.borderRadius,
                whiteSpace: "nowrap",
                boxShadow: glow ? `0 0 10px ${v.color}40` : "none",
                ...style,
            }}
        >
            {icon && <span style={{ fontSize: "0.9em" }}>{icon}</span>}
            {children}
        </motion.span>
    );
}

// ── Chip ──────────────────────────────────────────────────────────────────────

export function Chip({
    children,
    active = false,
    onClick,
    color = null,
    icon = null,
    onRemove = null,
    style = {},
}) {
    const { colors } = useTheme();
    const c = color ?? colors.accent;

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                color: active ? c : colors.textSub,
                background: active ? `${c}18` : colors.bgSurface,
                border: `1px solid ${active ? c + "40" : colors.border}`,
                borderRadius: 999,
                cursor: onClick ? "pointer" : "default",
                transition: "all 0.18s ease",
                ...style,
            }}
        >
            {icon && <span style={{ fontSize: "0.85em" }}>{icon}</span>}
            {children}
            {onRemove && (
                <span
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    style={{
                        marginLeft: 2,
                        fontSize: "0.7em",
                        color: colors.textMuted,
                        cursor: "pointer",
                        lineHeight: 1,
                    }}
                >
                    ✕
                </span>
            )}
        </motion.button>
    );
}

// ── Divider ───────────────────────────────────────────────────────────────────

export function Divider({
    label = null,
    vertical = false,
    style = {},
    thickness = 1,
}) {
    const { colors } = useTheme();

    if (vertical) {
        return (
            <div style={{
                width: thickness,
                alignSelf: "stretch",
                background: `linear-gradient(180deg, transparent, ${colors.border}, transparent)`,
                flexShrink: 0,
                ...style,
            }} />
        );
    }

    if (label) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                ...style,
            }}>
                <div style={{ flex: 1, height: thickness, background: `linear-gradient(90deg, transparent, ${colors.border})` }} />
                <span style={{
                    fontSize: "0.65rem",
                    fontFamily: "var(--font-accent)",
                    color: colors.textDim,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                }}>
                    {label}
                </span>
                <div style={{ flex: 1, height: thickness, background: `linear-gradient(90deg, ${colors.border}, transparent)` }} />
            </div>
        );
    }

    return (
        <div style={{
            height: thickness,
            background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)`,
            border: "none",
            ...style,
        }} />
    );
}