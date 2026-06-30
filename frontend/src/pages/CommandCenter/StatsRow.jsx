// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — StatsRow
// "Mission Overview" section. System status, organization health,
// live platform metrics — feels like a command center status board.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import Counter from "../../components/Common/Counter";
import { SectionHead } from "../../components/Common/Tooltip";

const STATUS_ITEMS = [
    { label: "LLM Engine", status: "online", detail: "OpenRouter · GPT-4o" },
    { label: "OSINT Engine", status: "online", detail: "20+ sources active" },
    { label: "Threat Feed", status: "online", detail: "Streaming live" },
    { label: "Forensics Lab", status: "online", detail: "OCR · QR · PDF ready" },
];

export default function StatsRow() {
    const { colors } = useTheme();

    return (
        <section style={{ padding: "60px 48px", position: "relative" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <SectionHead
                    label="System Status"
                    title="Mission Overview"
                    sub="Real-time platform health and intelligence engine status, updated continuously."
                />

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: 16,
                    marginTop: 36,
                }}>
                    {STATUS_ITEMS.map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                background: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 14,
                                padding: "18px 20px",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <div style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0,
                                height: 2,
                                background: `linear-gradient(90deg, transparent, ${colors.green}, transparent)`,
                                opacity: 0.5,
                            }} />

                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <div style={{ position: "relative" }}>
                                    <div style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: colors.green,
                                    }} />
                                    <motion.div
                                        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        style={{
                                            position: "absolute", inset: 0,
                                            borderRadius: "50%", background: colors.green,
                                        }}
                                    />
                                </div>
                                <span style={{
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: colors.text,
                                }}>
                                    {item.label}
                                </span>
                            </div>

                            <div style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.72rem",
                                color: colors.textMuted,
                            }}>
                                {item.detail}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Big metrics */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 24,
                    marginTop: 40,
                    paddingTop: 40,
                    borderTop: `1px solid ${colors.border}`,
                }}>
                    {[
                        { value: 8, suffix: "", label: "Themes Available", color: colors.purple },
                        { value: 10, suffix: "+", label: "Analysis Engines", color: colors.accent },
                        { value: 0, suffix: "₹", label: "Cost To You", color: colors.green },
                        { value: 24, suffix: "/7", label: "Always Online", color: colors.amber },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 280, damping: 22 }}
                            style={{ textAlign: "center" }}
                        >
                            <Counter
                                value={stat.value}
                                suffix={stat.suffix}
                                fontSize="2.2rem"
                                color={stat.color}
                                duration={1.8}
                            />
                            <div style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.7rem",
                                color: colors.textMuted,
                                marginTop: 6,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}