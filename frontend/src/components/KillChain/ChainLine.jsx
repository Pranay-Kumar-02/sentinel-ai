// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ChainLine
// Animated connector line between kill chain nodes
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function ChainLine({ index = 0, active = true }) {
    const { colors } = useTheme();

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 20,
            opacity: active ? 1 : 0.2,
            flexShrink: 0,
        }}>
            {/* Line */}
            <div style={{
                position: "relative",
                width: 32,
                height: 2,
                background: colors.bgSurface,
                borderRadius: 999,
                overflow: "hidden",
            }}>
                <motion.div
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                        delay: index * 0.15 + 0.2,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `linear-gradient(90deg, ${colors.accent}60, ${colors.purple}60)`,
                        borderRadius: 999,
                    }}
                />
            </div>

            {/* Arrow tip */}
            <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 0.5, duration: 0.2 }}
                style={{
                    width: 0,
                    height: 0,
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    borderLeft: `6px solid ${colors.accent}60`,
                    marginLeft: -1,
                }}
            />
        </div>
    );
}