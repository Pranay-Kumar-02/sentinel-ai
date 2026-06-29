// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatOrb
// Animated orb showing threat level with pulsing glow rings.
// Changes color and animation based on verdict.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { normalizeVerdict } from "../../utils/riskCalculator";

const ORB_CONFIG = {
    SAFE: {
        color: null, // uses green
        key: "green",
        rings: 2,
        speed: 3,
        icon: "✓",
        pulseScale: [1, 1.06, 1],
    },
    SUSPICIOUS: {
        key: "amber",
        rings: 3,
        speed: 2,
        icon: "⚠",
        pulseScale: [1, 1.1, 1],
    },
    DANGEROUS: {
        key: "orange",
        rings: 3,
        speed: 1.5,
        icon: "⚡",
        pulseScale: [1, 1.12, 1],
    },
    CRITICAL: {
        key: "red",
        rings: 4,
        speed: 0.8,
        icon: "☠",
        pulseScale: [1, 1.18, 1],
    },
    UNKNOWN: {
        key: "textMuted",
        rings: 1,
        speed: 4,
        icon: "?",
        pulseScale: [1, 1.03, 1],
    },
};

export default function ThreatOrb({
    verdict = "UNKNOWN",
    size = 100,
    style = {},
}) {
    const { colors } = useTheme();
    const level = normalizeVerdict(verdict);
    const cfg = ORB_CONFIG[level] ?? ORB_CONFIG.UNKNOWN;
    const color = colors[cfg.key];
    const glowColor = colors[cfg.key + "Glow"] ?? colors.accentGlow;

    return (
        <div style={{
            position: "relative",
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            ...style,
        }}>
            {/* Expanding pulse rings */}
            {Array.from({ length: cfg.rings }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: [0.6, 1.6],
                        opacity: [0.6, 0],
                    }}
                    transition={{
                        duration: cfg.speed,
                        ease: "easeOut",
                        repeat: Infinity,
                        delay: i * (cfg.speed / cfg.rings),
                    }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: `1px solid ${color}`,
                        pointerEvents: "none",
                    }}
                />
            ))}

            {/* Core orb */}
            <motion.div
                animate={{
                    scale: cfg.pulseScale,
                    boxShadow: [
                        `0 0 ${size * 0.2}px ${glowColor}, inset 0 0 ${size * 0.1}px ${glowColor}`,
                        `0 0 ${size * 0.4}px ${glowColor}, inset 0 0 ${size * 0.2}px ${glowColor}`,
                        `0 0 ${size * 0.2}px ${glowColor}, inset 0 0 ${size * 0.1}px ${glowColor}`,
                    ],
                }}
                transition={{
                    duration: cfg.speed,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                style={{
                    width: size * 0.55,
                    height: size * 0.55,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}55)`,
                    border: `1px solid ${color}80`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: size * 0.22,
                    position: "relative",
                    zIndex: 2,
                }}
            >
                {cfg.icon}
            </motion.div>
        </div>
    );
}