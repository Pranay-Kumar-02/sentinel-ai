// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — GlitchText
// Text with periodic glitch animation. Uses CSS pseudo-elements.
// Supports gradient text, glow, and custom trigger intervals.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function GlitchText({
    children,
    as = "span",
    gradient = true,
    glow = true,
    glitchInterval = 4000,   // ms between glitch triggers
    color = null,
    fontSize = "inherit",
    fontFamily = "var(--font-display)",
    fontWeight = 700,
    style = {},
}) {
    const { colors, gradients } = useTheme();
    const [glitching, setGlitching] = useState(false);
    const Tag = motion[as] ?? motion.span;

    // Trigger glitch periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setGlitching(true);
            setTimeout(() => setGlitching(false), 400);
        }, glitchInterval);
        return () => clearInterval(interval);
    }, [glitchInterval]);

    const textColor = color ?? (gradient ? "transparent" : colors.accent);

    return (
        <Tag
            animate={glitching ? {
                x: [0, -2, 3, -2, 2, 0],
                skewX: [0, -1, 1, -0.5, 0],
                opacity: [1, 0.8, 1, 0.9, 1],
            } : { x: 0, skewX: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "linear" }}
            style={{
                position: "relative",
                display: "inline-block",
                fontFamily,
                fontSize,
                fontWeight,
                color: textColor,
                display: gradient ? "inline-block" : "inline",
                background: gradient ? "var(--gradient-accent)" : "none",
                WebkitBackgroundClip: gradient ? "text" : "unset",
                WebkitTextFillColor: gradient ? "transparent" : textColor,
                backgroundClip: gradient ? "text" : "unset",
                color: gradient ? "transparent" : textColor,
                textShadow: (!gradient && glow)
                    ? `0 0 20px ${colors.accentGlow}, 0 0 40px ${colors.accentSoft}`
                    : "none",
                ...style,
            }}
        >
            {children}

            {/* Glitch layer 1 — cyan offset */}
            {glitching && (
                <motion.span
                    animate={{
                        x: [-2, 3, -1, 2, 0],
                        opacity: [0.7, 0.5, 0.8, 0.4, 0],
                    }}
                    transition={{ duration: 0.3, ease: "linear" }}
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 2,
                        color: colors.accent,
                        background: "none",
                        WebkitTextFillColor: colors.accent,
                        clipPath: "polygon(0 0, 100% 0, 100% 40%, 0 40%)",
                        pointerEvents: "none",
                        fontFamily,
                        fontSize,
                        fontWeight,
                        whiteSpace: "nowrap",
                    }}
                >
                    {children}
                </motion.span>
            )}

            {/* Glitch layer 2 — purple offset */}
            {glitching && (
                <motion.span
                    animate={{
                        x: [2, -3, 1, -2, 0],
                        opacity: [0.5, 0.7, 0.3, 0.5, 0],
                    }}
                    transition={{ duration: 0.3, ease: "linear", delay: 0.05 }}
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: -2,
                        color: colors.purple,
                        background: "none",
                        WebkitTextFillColor: colors.purple,
                        clipPath: "polygon(0 60%, 100% 60%, 100% 100%, 0 100%)",
                        pointerEvents: "none",
                        fontFamily,
                        fontSize,
                        fontWeight,
                        whiteSpace: "nowrap",
                    }}
                >
                    {children}
                </motion.span>
            )}
        </Tag>
    );
}