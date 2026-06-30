// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatNode
// Single threat marker positioned on the world map with pulse + tooltip
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { countryFlag } from "../../utils/formatters";

const SEVERITY_COLORS = {
    CRITICAL: "red",
    HIGH: "orange",
    MEDIUM: "amber",
    LOW: "blue",
};

export default function ThreatNode({ x, y, severity = "MEDIUM", label, country, count = 1, delay = 0 }) {
    const { colors } = useTheme();
    const [hovered, setHovered] = useState(false);

    const colorKey = SEVERITY_COLORS[severity] ?? "blue";
    const color = colors[colorKey];
    const glow = colors[colorKey + "Glow"];
    const size = 4 + Math.min(count, 8);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: hovered ? 20 : 10,
            }}
        >
            {/* Pulse rings */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0.5, 2.2], opacity: [0.6, 0] }}
                transition={{
                    duration: severity === "CRITICAL" ? 1.2 : 2.2,
                    repeat: Infinity,
                    delay,
                    ease: "easeOut",
                }}
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: size * 4,
                    height: size * 4,
                    borderRadius: "50%",
                    border: `1px solid ${color}`,
                    pointerEvents: "none",
                }}
            />

            {/* Core node */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay, type: "spring", stiffness: 400, damping: 20 }}
                whileHover={{ scale: 1.4 }}
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 ${size * 2}px ${glow}`,
                    position: "relative",
                }}
            />

            {/* Tooltip on hover */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.92 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "absolute",
                            bottom: "calc(100% + 10px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: colors.bgCard,
                            backdropFilter: "blur(16px)",
                            border: `1px solid ${color}40`,
                            borderRadius: 8,
                            padding: "8px 12px",
                            whiteSpace: "nowrap",
                            boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 16px ${glow}`,
                        }}
                    >
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 2,
                        }}>
                            <span>{countryFlag(country)}</span>
                            <span style={{
                                fontFamily: "var(--font-body)",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: colors.text,
                            }}>
                                {label}
                            </span>
                        </div>
                        <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color,
                        }}>
                            {count} {severity} threat{count !== 1 ? "s" : ""}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}