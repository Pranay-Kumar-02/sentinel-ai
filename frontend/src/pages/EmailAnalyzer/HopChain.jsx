// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — HopChain
// Visualizes the email's path across mail servers, hop by hop.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function HopChain({ hops = [] }) {
    const { colors } = useTheme();

    if (!hops || hops.length === 0) {
        return (
            <div style={{
                padding: "24px",
                textAlign: "center",
                color: colors.textDim,
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
            }}>
                No mail server hop data available
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {hops.map((hop, i) => {
                const isLast = i === hops.length - 1;
                const isFirst = i === 0;
                const suspicious = hop.suspicious ?? false;

                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        style={{ display: "flex", gap: 14 }}
                    >
                        {/* Timeline marker */}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flexShrink: 0,
                        }}>
                            <motion.div
                                animate={suspicious ? {
                                    boxShadow: [
                                        `0 0 0 0 ${colors.redSoft}`,
                                        `0 0 0 6px ${colors.redSoft}`,
                                        `0 0 0 0 ${colors.redSoft}`,
                                    ],
                                } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    background: suspicious ? colors.redSoft : (isFirst ? colors.accentSoft : colors.bgSurface),
                                    border: `1.5px solid ${suspicious ? colors.red : (isFirst ? colors.accent : colors.border)}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.7rem",
                                    flexShrink: 0,
                                }}
                            >
                                {isFirst ? "📤" : isLast ? "📥" : "📡"}
                            </motion.div>
                            {!isLast && (
                                <div style={{
                                    width: 2,
                                    flex: 1,
                                    minHeight: 30,
                                    background: `linear-gradient(180deg, ${colors.border}, ${colors.border})`,
                                }} />
                            )}
                        </div>

                        {/* Hop details */}
                        <div style={{ flex: 1, paddingBottom: isLast ? 0 : 18 }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 4,
                            }}>
                                <span style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.8rem",
                                    color: suspicious ? colors.red : colors.text,
                                    fontWeight: 600,
                                }}>
                                    {hop.server ?? hop.host ?? `Hop ${i + 1}`}
                                </span>
                                {suspicious && (
                                    <span style={{
                                        fontSize: "0.6rem",
                                        color: colors.red,
                                        background: colors.redSoft,
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                        fontFamily: "var(--font-accent)",
                                        fontWeight: 700,
                                    }}>
                                        ⚠ SUSPICIOUS
                                    </span>
                                )}
                            </div>
                            <div style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.7rem",
                                color: colors.textMuted,
                            }}>
                                {hop.ip && `IP: ${hop.ip}`}
                                {hop.timestamp && ` · ${hop.timestamp}`}
                                {hop.country && ` · ${hop.country}`}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}