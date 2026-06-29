// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ChainNode
// Single node in the attack kill chain visualization
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const STAGE_CONFIG = {
    reconnaissance: { icon: "🔭", color: "blue", label: "Recon" },
    weaponization: { icon: "⚙️", color: "purple", label: "Weaponize" },
    delivery: { icon: "📨", color: "amber", label: "Delivery" },
    exploitation: { icon: "💥", color: "orange", label: "Exploit" },
    installation: { icon: "📦", color: "red", label: "Install" },
    "command-control": { icon: "📡", color: "red", label: "C2" },
    "actions-objectives": { icon: "🎯", color: "red", label: "Actions" },
    phishing: { icon: "🪝", color: "amber", label: "Phishing" },
    social: { icon: "👤", color: "purple", label: "Social Eng" },
    credential: { icon: "🔑", color: "orange", label: "Credential" },
    malware: { icon: "🦠", color: "red", label: "Malware" },
    exfiltration: { icon: "📤", color: "red", label: "Exfiltration" },
};

function getConfig(stage = "") {
    const key = stage.toLowerCase().replace(/[\s_]+/g, "-");
    return STAGE_CONFIG[key] ?? { icon: "⚡", color: "accent", label: stage };
}

export default function ChainNode({ stage, description, index, active = true }) {
    const { colors } = useTheme();
    const cfg = getConfig(stage);
    const color = colors[cfg.color] ?? colors.accent;
    const softColor = colors[cfg.color + "Soft"] ?? colors.accentSoft;
    const glowColor = colors[cfg.color + "Glow"] ?? colors.accentGlow;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
                delay: index * 0.15,
                type: "spring",
                stiffness: 300,
                damping: 18,
            }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: active ? 1 : 0.4,
                position: "relative",
            }}
        >
            {/* Step number */}
            <div style={{
                position: "absolute",
                top: -8,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--font-accent)",
                fontSize: "0.55rem",
                color: colors.textDim,
                fontWeight: 700,
            }}>
                {String(index + 1).padStart(2, "0")}
            </div>

            {/* Icon circle */}
            <motion.div
                animate={active ? {
                    boxShadow: [
                        `0 0 0 0 ${glowColor}`,
                        `0 0 0 6px ${glowColor}30`,
                        `0 0 0 0 ${glowColor}`,
                    ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: softColor,
                    border: `1.5px solid ${color}50`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    marginTop: 12,
                    boxShadow: active ? `0 0 16px ${glowColor}` : "none",
                }}
            >
                {cfg.icon}
            </motion.div>

            {/* Label */}
            <div style={{
                fontFamily: "var(--font-accent)",
                fontSize: "0.6rem",
                fontWeight: 700,
                color,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textAlign: "center",
                whiteSpace: "nowrap",
            }}>
                {cfg.label}
            </div>

            {/* Description */}
            {description && (
                <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.62rem",
                    color: colors.textMuted,
                    textAlign: "center",
                    maxWidth: 80,
                    lineHeight: 1.4,
                }}>
                    {description}
                </div>
            )}
        </motion.div>
    );
}