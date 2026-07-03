// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Gauge
// Circular SVG gauge for confidence scores and risk levels.
// Spring-animated fill, color-coded by value, glow effect.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "../../hooks/useTheme";
import { scoreToColor } from "../../utils/riskCalculator";

export default function Gauge({
    value = 0,      // 0–100
    size = 120,
    thickness = 8,
    label = null,
    sublabel = null,
    color = null,   // override auto color
    showValue = true,
    animDelay = 0,
    style = {},
}) {
    const { colors } = useTheme();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        if (isInView && !animated) {
            const t = setTimeout(() => setAnimated(true), animDelay * 1000);
            return () => clearTimeout(t);
        }
    }, [isInView, animated, animDelay]);

    const radius = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;
    // Start from top (−90°), fill 270° arc (¾ of circle)
    const arcLength = circumference * 0.75;
    const fillLength = animated ? (value / 100) * arcLength : 0;
    const dashOffset = arcLength - fillLength;

    const gaugeColor = color ?? scoreToColor(value);

    // Glow color from value
    const glowMap = {
        "var(--red)": colors.redGlow,
        "var(--orange)": colors.orangeGlow,
        "var(--amber)": colors.amberGlow,
        "var(--green)": colors.greenGlow,
    };
    const glowColor = glowMap[gaugeColor] ?? colors.accentGlow;

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
                <svg
                    width={size}
                    height={size}
                    style={{ transform: "rotate(135deg)" }}
                >
                    {/* Track */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        stroke={colors.bgSurface}
                        strokeWidth={thickness}
                        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                        strokeLinecap="round"
                    />

                    {/* Fill */}
                    <motion.circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        stroke={gaugeColor}
                        strokeWidth={thickness}
                        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: arcLength }}
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{
                            duration: 1.4,
                            ease: [0.34, 1.56, 0.64, 1],
                            delay: animDelay,
                        }}
                        style={{
                            filter: `drop-shadow(0 0 6px ${glowColor})`,
                        }}
                    />
                </svg>

                {/* Center content */}
                {showValue && (
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}>
                        <motion.span
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={animated ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: animDelay + 0.4, type: "spring", stiffness: 300, damping: 20 }}
                            style={{
                                fontFamily: "var(--font-accent)",
                                fontSize: size > 100 ? "1.4rem" : "1rem",
                                fontWeight: 700,
                                color: gaugeColor,
                                lineHeight: 1,
                            }}
                        >
                            {value}
                        </motion.span>
                        <span style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.55rem",
                            color: colors.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}>
                            /100
                        </span>
                    </div>
                )}
            </div>

            {/* Labels */}
            {label && (
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: gaugeColor,
                    }}>
                        {label}
                    </div>
                    {sublabel && (
                        <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: colors.textMuted,
                            marginTop: 2,
                        }}>
                            {sublabel}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}