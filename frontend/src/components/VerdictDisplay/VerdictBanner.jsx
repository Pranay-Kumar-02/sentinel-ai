// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — VerdictBanner
// Cinematic verdict reveal. The most impactful element in the scan result.
// Blurs in from nothing, confidence fills, risk orb appears.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { normalizeVerdict } from "../../utils/riskCalculator";
import { verdictSentence, formatRiskScore } from "../../utils/formatters";
import ThreatOrb from "./ThreatOrb";
import ConfidenceRing from "./ConfidenceRing";
import { Bar } from "../Common/Tooltip";

const VERDICT_META = {
    SAFE: { label: "SAFE", icon: "✅", desc: "No threats detected." },
    SUSPICIOUS: { label: "SUSPICIOUS", icon: "⚠️", desc: "Suspicious patterns found." },
    DANGEROUS: { label: "DANGEROUS", icon: "🚨", desc: "Malicious content confirmed." },
    CRITICAL: { label: "CRITICAL", icon: "💀", desc: "Critical threat — take action immediately." },
    UNKNOWN: { label: "UNKNOWN", icon: "❓", desc: "Unable to determine threat level." },
};

export default function VerdictBanner({ result, riskScore = null, style = {} }) {
    const { colors, verdicts } = useTheme();

    if (!result) return null;

    const rawVerdict = result.master_verdict ?? result.verdict ?? result.llm_analysis?.verdict ?? "UNKNOWN";
    const level = normalizeVerdict(rawVerdict);
    const meta = VERDICT_META[level] ?? VERDICT_META.UNKNOWN;
    const verdictStyle = verdicts[level] ?? verdicts.UNKNOWN;
    const confidence = result.llm_analysis?.confidence ?? result.confidence ?? 0;
    const score = riskScore?.total ?? 0;

    // Key facts — 3 bullets
    const keyFacts = result.llm_analysis?.key_indicators
        ?? result.llm_analysis?.red_flags
        ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20, mass: 1.2 }}
            style={{
                background: verdictStyle.bg,
                border: `1px solid ${verdictStyle.border}`,
                borderRadius: 20,
                padding: "28px 32px",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 0 60px ${verdictStyle.glow}`,
                ...style,
            }}
        >
            {/* Background radial glow */}
            <div style={{
                position: "absolute",
                top: "-50%",
                right: "-20%",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${verdictStyle.glow} 0%, transparent 70%)`,
                opacity: 0.3,
                pointerEvents: "none",
            }} />

            <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
                {/* Left — verdict label + details */}
                <div style={{ flex: 1, minWidth: 200 }}>
                    {/* Label */}
                    <motion.div
                        initial={{ opacity: 0, letterSpacing: "0.3em", y: 10 }}
                        animate={{ opacity: 1, letterSpacing: "0.08em", y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "clamp(1.8rem, 5vw, 3rem)",
                            fontWeight: 900,
                            color: verdictStyle.color,
                            lineHeight: 1,
                            marginBottom: 8,
                            textShadow: `0 0 40px ${verdictStyle.glow}`,
                        }}
                    >
                        {meta.icon} {meta.label}
                    </motion.div>

                    {/* Sentence */}
                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.95rem",
                            color: colors.textSub,
                            margin: "0 0 16px",
                            lineHeight: 1.6,
                        }}
                    >
                        {verdictSentence(rawVerdict)}
                    </motion.p>

                    {/* Risk score bar */}
                    {score > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{ marginBottom: 16 }}
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 6,
                            }}>
                                <span style={{
                                    fontSize: "0.72rem",
                                    color: colors.textMuted,
                                    fontFamily: "var(--font-mono)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                }}>
                                    Risk Score
                                </span>
                                <span style={{
                                    fontSize: "0.72rem",
                                    color: verdictStyle.color,
                                    fontFamily: "var(--font-accent)",
                                    fontWeight: 700,
                                }}>
                                    {formatRiskScore(score)}
                                </span>
                            </div>
                            <div style={{
                                height: 6,
                                borderRadius: 999,
                                background: colors.bgSurface,
                                overflow: "hidden",
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.5 }}
                                    style={{
                                        height: "100%",
                                        borderRadius: 999,
                                        background: verdictStyle.color,
                                        boxShadow: `0 0 8px ${verdictStyle.glow}`,
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Key facts */}
                    {keyFacts.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {keyFacts.slice(0, 3).map((fact, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.12, duration: 0.35 }}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 8,
                                        fontSize: "0.78rem",
                                        color: colors.textSub,
                                        fontFamily: "var(--font-body)",
                                    }}
                                >
                                    <span style={{ color: verdictStyle.color, flexShrink: 0, marginTop: 1 }}>▸</span>
                                    {fact}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right — orb + confidence */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        flexShrink: 0,
                    }}
                >
                    <ThreatOrb verdict={rawVerdict} size={110} />
                    <ConfidenceRing confidence={confidence} size={80} />
                </motion.div>
            </div>
        </motion.div>
    );
}