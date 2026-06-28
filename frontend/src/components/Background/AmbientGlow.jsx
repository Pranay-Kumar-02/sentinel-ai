// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — AmbientGlow
// Layer 10: atmospheric edge glow + corner vignettes
// Changes color based on active verdict
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function AmbientGlow({ verdictLevel = null }) {
    const { colors, effects } = useTheme();

    // Base glow uses accent; override with verdict color when scanning
    const glowColor = verdictLevel
        ? {
            SAFE: colors.greenSoft ?? "rgba(0,255,136,0.06)",
            SUSPICIOUS: colors.amberSoft ?? "rgba(255,184,0,0.06)",
            DANGEROUS: colors.orangeSoft ?? "rgba(255,68,68,0.06)",
            CRITICAL: colors.redSoft ?? "rgba(255,0,51,0.08)",
        }[verdictLevel] ?? colors.accentSoft
        : colors.accentSoft;

    const glowColor2 = verdictLevel ? "transparent" : colors.purpleSoft;

    return (
        <>
            {/* Main edge atmospheric glow */}
            <motion.div
                aria-hidden="true"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    pointerEvents: "none",
                    background: `
                        radial-gradient(ellipse at top left,     ${glowColor}  0%, transparent 50%),
                        radial-gradient(ellipse at bottom right, ${glowColor2} 0%, transparent 50%)
                    `,
                    transition: "background 0.6s ease",
                }}
            />

            {/* Emergency pulsing edge — emergency theme only */}
            {effects.emergencyPulse && (
                <motion.div
                    aria-hidden="true"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        pointerEvents: "none",
                        background: `radial-gradient(ellipse at center, transparent 60%, ${effects.emergencyColor} 100%)`,
                    }}
                />
            )}
        </>
    );
}