// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ConfidenceRing
// Animated SVG ring showing AI confidence percentage.
// Spring fill animation with glow and center label.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { confidenceLabel } from "../../utils/formatters";

export default function ConfidenceRing({
    confidence = 0,
    size = 90,
    thickness = 6,
    style = {},
}) {
    const { colors, gradients } = useTheme();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [filled, setFilled] = useState(false);

    useEffect(() => {
        if (isInView) {
            const t = setTimeout(() => setFilled(true), 200);
            return () => clearTimeout(t);
        }
    }, [isInView]);

    const radius = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;
    const fill = filled ? (confidence / 100) * circumference : 0;

    // Color based on confidence
    const ringColor =
        confidence >= 80 ? colors.green :
            confidence >= 60 ? colors.accent :
                confidence >= 40 ? colors.amber :
                    colors.red;

    const ringGlow =
        confidence >= 80 ? colors.greenGlow :
            confidence >= 60 ? colors.accentGlow :
                confidence >= 40 ? colors.amberGlow :
                    colors.redGlow;

    return (
        <div
            ref={ref}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                ...style,
            }}
        >
            <div style={{ position: "relative", width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    {/* Track */}
                    <circle
                        cx={cx} cy={cy} r={radius}
                        fill="none"
                        stroke={colors.bgSurface}
                        strokeWidth={thickness}
                    />
                    {/* Fill */}
                    <motion.circle
                        cx={cx} cy={cy} r={radius}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth={thickness}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - fill }}
                        transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                        style={{ filter: `drop-shadow(0 0 4px ${ringGlow})` }}
                    />
                </svg>

                {/* Center text */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={filled ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: size > 80 ? "1.2rem" : "0.9rem",
                            fontWeight: 700,
                            color: ringColor,
                            lineHeight: 1,
                        }}
                    >
                        {confidence}%
                    </motion.span>
                    <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.5rem",
                        color: colors.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginTop: 2,
                    }}>
                        AI Conf.
                    </span>
                </div>
            </div>

            <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: ringColor,
                letterSpacing: "0.06em",
            }}>
                {confidenceLabel(confidence)}
            </span>
        </div>
    );
}