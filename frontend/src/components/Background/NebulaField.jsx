// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — NebulaField
// Pitch-black deep space & aerospace telemetry atmosphere for Black Nebula theme.
// "Looking into deep space through a spacecraft window"
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function NebulaField() {
    const { effects } = useTheme();
    if (!effects.hasNebula) return null;

    // Fixed sparse distant stars (tiny pinpoints, subtle twinkling)
    const fixedStars = useMemo(() => {
        return [
            { x: "12%", y: "18%", size: 1.0, opacity: 0.5, delay: 0 },
            { x: "28%", y: "12%", size: 0.8, opacity: 0.35, delay: 2 },
            { x: "44%", y: "24%", size: 1.2, opacity: 0.65, delay: 4 },
            { x: "62%", y: "15%", size: 0.7, opacity: 0.4, delay: 1 },
            { x: "85%", y: "22%", size: 1.1, opacity: 0.55, delay: 3 },
            { x: "18%", y: "65%", size: 0.9, opacity: 0.4, delay: 5 },
            { x: "32%", y: "82%", size: 1.0, opacity: 0.45, delay: 2 },
            { x: "55%", y: "74%", size: 0.8, opacity: 0.35, delay: 6 },
            { x: "78%", y: "85%", size: 1.2, opacity: 0.6, delay: 3 },
            { x: "92%", y: "60%", size: 0.7, opacity: 0.3, delay: 4 },
            // Tiny cluster (constellation knot)
            { x: "74%", y: "38%", size: 1.0, opacity: 0.5, delay: 1 },
            { x: "75.2%", y: "39.5%", size: 0.8, opacity: 0.4, delay: 2 },
            { x: "73.8%", y: "41%", size: 0.6, opacity: 0.35, delay: 3 },
        ];
    }, []);

    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                pointerEvents: "none",
                overflow: "hidden",
                background: "transparent",
            }}
        >
            {/* Deep space starlight gradient falloff — extremely subtle */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at 50% 12%, rgba(56, 189, 248, 0.03) 0%, transparent 65%)",
                }}
            />

            {/* Extremely faint distant nebula dust clouds (ultra-slow breathing) */}
            <motion.div
                animate={{
                    opacity: [0.35, 0.55, 0.35],
                    scale: [1, 1.04, 1],
                }}
                transition={{
                    duration: 60,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                style={{
                    position: "absolute",
                    top: "10%",
                    right: "15%",
                    width: "550px",
                    height: "420px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(129, 140, 248, 0.035) 0%, rgba(56, 189, 248, 0.015) 50%, transparent 75%)",
                    filter: "blur(120px)",
                    willChange: "transform, opacity",
                }}
            />

            <motion.div
                animate={{
                    opacity: [0.25, 0.45, 0.25],
                    scale: [1, 1.03, 1],
                }}
                transition={{
                    duration: 80,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: 15,
                }}
                style={{
                    position: "absolute",
                    bottom: "15%",
                    left: "8%",
                    width: "600px",
                    height: "380px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56, 189, 248, 0.025) 0%, rgba(129, 140, 248, 0.015) 50%, transparent 75%)",
                    filter: "blur(140px)",
                    willChange: "transform, opacity",
                }}
            />

            {/* Subtle twinkling fixed distant stars */}
            {fixedStars.map((star, i) => (
                <motion.div
                    key={i}
                    animate={{
                        opacity: [star.opacity * 0.6, star.opacity, star.opacity * 0.6],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 8 + (i % 5) * 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: star.delay,
                    }}
                    style={{
                        position: "absolute",
                        left: star.x,
                        top: star.y,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        borderRadius: "50%",
                        background: "#ffffff",
                        boxShadow: `0 0 2px rgba(255, 255, 255, 0.5)`,
                    }}
                />
            ))}

            {/* Aerospace orbital trajectory arcs & coordinate reticle lines */}
            <svg
                width="100%"
                height="100%"
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                }}
            >
                {/* Orbital trajectory path 1 */}
                <ellipse
                    cx="50%"
                    cy="45%"
                    rx="560"
                    ry="280"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.035)"
                    strokeWidth="0.75"
                    strokeDasharray="3 36"
                    transform="rotate(-12 700 400)"
                />

                {/* Orbital trajectory path 2 */}
                <ellipse
                    cx="52%"
                    cy="48%"
                    rx="820"
                    ry="420"
                    fill="none"
                    stroke="rgba(129, 140, 248, 0.03)"
                    strokeWidth="0.5"
                    strokeDasharray="2 48"
                    transform="rotate(8 750 450)"
                />
            </svg>

            {/* Corner reticles rendered cleanly via CSS positioning */}
            <div
                style={{
                    position: "absolute",
                    top: 84,
                    left: 24,
                    width: 14,
                    height: 14,
                    pointerEvents: "none",
                }}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="0" y1="7" x2="14" y2="7" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.75" />
                    <line x1="7" y1="0" x2="7" y2="14" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.75" />
                </svg>
            </div>
            <div
                style={{
                    position: "absolute",
                    bottom: 28,
                    right: 28,
                    width: 14,
                    height: 14,
                    pointerEvents: "none",
                }}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="0" y1="7" x2="14" y2="7" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.75" />
                    <line x1="7" y1="0" x2="7" y2="14" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="0.75" />
                </svg>
            </div>

            {/* Faint aerospace telemetry metadata stamps in background */}
            <div
                style={{
                    position: "absolute",
                    top: 76,
                    right: 28,
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.18em",
                    color: "rgba(216, 225, 234, 0.12)",
                    textTransform: "uppercase",
                    userSelect: "none",
                }}
            >
                ORBIT: GEO-SYNC // SECTOR 00-SPACE
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 24,
                    left: 28,
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.15em",
                    color: "rgba(121, 130, 142, 0.14)",
                    userSelect: "none",
                }}
            >
                RA 18h 36m 56s | DEC +38° 47' 01" | DEEP VOID
            </div>
        </div>
    );
}
