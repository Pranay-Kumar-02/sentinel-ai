// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — VirusTotalCard
// VirusTotal scan results: detection ratio, engine bars, flagged engines list
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { formatVirusTotalResult } from "../../utils/formatters";

export default function VirusTotalCard({ vt = null }) {
    const { colors } = useTheme();

    if (!vt) return null;

    const positives = vt.positives ?? vt.malicious ?? 0;
    const total = vt.total ?? vt.total_engines ?? 0;
    const pct = total > 0 ? (positives / total) * 100 : 0;
    const isSafe = positives === 0;

    const statusColor = positives === 0 ? colors.green
        : pct < 20 ? colors.amber
            : pct < 50 ? colors.orange
                : colors.red;

    const statusGlow = positives === 0 ? colors.greenGlow
        : pct < 20 ? colors.amberGlow
            : pct < 50 ? colors.orangeGlow
                : colors.redGlow;

    // Engine results if available
    const scans = vt.scans ?? vt.results ?? {};
    const engines = Object.entries(scans).slice(0, 12);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: colors.bgSurface,
            }}>
                <span style={{ fontSize: "1rem" }}>🦠</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: colors.text,
                    flex: 1,
                }}>
                    VirusTotal — {total} Engines
                </span>
                <span style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: statusColor,
                    textShadow: `0 0 8px ${statusGlow}`,
                }}>
                    {positives}/{total}
                </span>
            </div>

            <div style={{ padding: "16px" }}>
                {/* Detection ratio visual */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 16,
                }}>
                    {/* Big number */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "2.5rem",
                            fontWeight: 900,
                            color: statusColor,
                            lineHeight: 1,
                            textShadow: `0 0 20px ${statusGlow}`,
                            flexShrink: 0,
                            minWidth: 60,
                            textAlign: "center",
                        }}
                    >
                        {positives}
                    </motion.div>

                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 6, fontSize: "0.72rem", color: colors.textSub, fontFamily: "var(--font-body)" }}>
                            {isSafe ? "No engines detected threats" : `${positives} of ${total} engines flagged`}
                        </div>

                        {/* Progress bar */}
                        <div style={{
                            height: 8,
                            background: colors.bgSurface,
                            borderRadius: 999,
                            overflow: "hidden",
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                                style={{
                                    height: "100%",
                                    borderRadius: 999,
                                    background: isSafe ? colors.green : statusColor,
                                    boxShadow: `0 0 6px ${statusGlow}`,
                                    minWidth: isSafe ? "100%" : undefined,
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 4, fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                            {formatVirusTotalResult(vt)}
                        </div>
                    </div>
                </div>

                {/* Engine results */}
                {engines.length > 0 && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: 4,
                        maxHeight: 160,
                        overflowY: "auto",
                        scrollbarWidth: "none",
                    }}>
                        {engines.map(([engine, result], i) => {
                            const detected = result.detected ?? result.result !== null;
                            return (
                                <motion.div
                                    key={engine}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                        padding: "4px 8px",
                                        borderRadius: 5,
                                        background: detected ? colors.redSoft : "transparent",
                                        border: `1px solid ${detected ? colors.red + "30" : colors.border}`,
                                    }}
                                >
                                    <span style={{ fontSize: "0.55rem", color: detected ? colors.red : colors.green }}>
                                        {detected ? "●" : "○"}
                                    </span>
                                    <span style={{
                                        fontSize: "0.65rem",
                                        color: detected ? colors.red : colors.textMuted,
                                        fontFamily: "var(--font-mono)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {engine}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}