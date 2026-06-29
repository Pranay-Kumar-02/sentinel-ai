// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — EngineCard
// Shows status of a single analysis engine with animated entrance
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const STATUS_CONFIG = {
    complete: { color: "green", icon: "✓", label: "Complete" },
    running: { color: "accent", icon: "⟳", label: "Running" },
    pending: { color: "textMuted", icon: "○", label: "Pending" },
    error: { color: "red", icon: "✕", label: "Error" },
    skipped: { color: "textDim", icon: "—", label: "Skipped" },
};

export default function EngineCard({ name, icon, status = "complete", value = null, index = 0 }) {
    const { colors } = useTheme();
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.complete;
    const color = colors[cfg.color] ?? colors.accent;
    const softColor = colors[cfg.color + "Soft"] ?? colors.accentSoft;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20,
            }}
            style={{
                padding: "12px",
                background: colors.bgSurface,
                border: `1px solid ${status === "complete" ? color + "25" : colors.border}`,
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Status glow top border */}
            {status === "complete" && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    opacity: 0.6,
                }} />
            )}

            {/* Running animation */}
            {status === "running" && (
                <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    }}
                />
            )}

            {/* Top row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color,
                    background: softColor,
                    border: `1px solid ${color}25`,
                    padding: "1px 5px",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                }}>
                    {status === "running" ? (
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                            style={{ display: "inline-block" }}
                        >
                            ⟳
                        </motion.span>
                    ) : cfg.icon}
                    {cfg.label}
                </span>
            </div>

            {/* Engine name */}
            <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: status === "skipped" || status === "pending" ? colors.textMuted : colors.text,
                lineHeight: 1.3,
            }}>
                {name}
            </div>

            {/* Value */}
            {value !== null && (
                <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    color: color,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}>
                    {typeof value === "boolean"
                        ? (value ? "Detected" : "Clean")
                        : String(value)}
                </div>
            )}
        </motion.div>
    );
}