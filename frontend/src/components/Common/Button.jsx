// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Button
// Universal button with variants: primary, ghost, danger, safe, outline, glass
// Glow effects, loading state, icon support, cursor integration
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

export default function Button({
    children,
    variant = "primary",  // primary | ghost | danger | safe | outline | glass | accent
    size = "md",       // sm | md | lg | xl
    loading = false,
    disabled = false,
    icon = null,
    iconRight = null,
    onClick,
    fullWidth = false,
    glow = true,
    label = "",         // cursor label
    style = {},
    type = "button",
    className = "",
}) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    const sizes = {
        sm: { padding: "6px 14px", fontSize: "0.78rem", borderRadius: 8, gap: 5, iconSize: "0.8rem" },
        md: { padding: "10px 20px", fontSize: "0.85rem", borderRadius: 10, gap: 7, iconSize: "0.9rem" },
        lg: { padding: "13px 28px", fontSize: "0.92rem", borderRadius: 12, gap: 8, iconSize: "1rem" },
        xl: { padding: "16px 40px", fontSize: "1rem", borderRadius: 14, gap: 10, iconSize: "1.1rem" },
    };

    const variants = {
        primary: {
            background: gradients.primary,
            color: "#fff",
            border: "none",
            shadow: glow ? `0 4px 20px ${colors.accentGlow}, 0 1px 3px rgba(0,0,0,0.3)` : "none",
            hoverShadow: glow ? `0 8px 32px ${colors.accentGlow}` : "none",
        },
        ghost: {
            background: colors.accentSoft,
            color: colors.accent,
            border: `1px solid ${colors.border}`,
            shadow: "none",
            hoverShadow: glow ? `0 0 20px ${colors.accentSoft}` : "none",
        },
        danger: {
            background: gradients.danger,
            color: "#fff",
            border: "none",
            shadow: glow ? `0 4px 20px ${colors.redGlow}` : "none",
            hoverShadow: glow ? `0 8px 32px ${colors.redGlow}` : "none",
        },
        safe: {
            background: gradients.safe,
            color: colors.bg,
            border: "none",
            shadow: glow ? `0 4px 20px ${colors.greenGlow}` : "none",
            hoverShadow: glow ? `0 8px 32px ${colors.greenGlow}` : "none",
        },
        outline: {
            background: "transparent",
            color: colors.accent,
            border: `1px solid ${colors.borderHover}`,
            shadow: "none",
            hoverShadow: glow ? `0 0 16px ${colors.accentSoft}` : "none",
        },
        glass: {
            background: colors.bgGlass,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            shadow: "none",
            hoverShadow: "none",
        },
        accent: {
            background: colors.accent,
            color: colors.bg,
            border: "none",
            shadow: glow ? `0 4px 20px ${colors.accentGlow}` : "none",
            hoverShadow: glow ? `0 8px 28px ${colors.accentGlow}` : "none",
        },
    };

    const v = variants[variant] ?? variants.primary;
    const s = sizes[size] ?? sizes.md;
    const isDisabled = disabled || loading;

    return (
        <motion.button
            type={type}
            onClick={isDisabled ? undefined : onClick}
            onMouseEnter={() => !isDisabled && setCursor(CURSOR_STATES.INTERACTIVE, label || "")}
            onMouseLeave={resetCursor}
            whileHover={isDisabled ? {} : { scale: 1.02, y: -2, boxShadow: v.hoverShadow }}
            whileTap={isDisabled ? {} : { scale: 0.97 }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: s.gap,
                padding: s.padding,
                fontSize: s.fontSize,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                letterSpacing: "0.02em",
                borderRadius: s.borderRadius,
                background: v.background,
                color: v.color,
                border: v.border,
                boxShadow: v.shadow,
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.5 : 1,
                width: fullWidth ? "100%" : "auto",
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
                transition: "opacity 0.2s ease",
                ...style,
            }}
        >
            {/* Shine sweep on primary */}
            {(variant === "primary" || variant === "danger" || variant === "safe") && (
                <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 2 }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Loading spinner */}
            {loading && (
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                    style={{ fontSize: s.iconSize, display: "flex" }}
                >
                    ⟳
                </motion.span>
            )}

            {/* Left icon */}
            {icon && !loading && (
                <span style={{ fontSize: s.iconSize, display: "flex", alignItems: "center" }}>
                    {icon}
                </span>
            )}

            {children}

            {/* Right icon */}
            {iconRight && !loading && (
                <span style={{ fontSize: s.iconSize, display: "flex", alignItems: "center" }}>
                    {iconRight}
                </span>
            )}
        </motion.button>
    );
}