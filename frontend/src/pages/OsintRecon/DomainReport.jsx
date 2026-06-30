// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — DomainReport
// Comprehensive domain investigation report. Reuses OSINT sub-cards
// plus a risk summary header specific to the standalone OSINT page.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import OSINTResults from "../../components/OSINT/OSINTResults";
import ConfidenceRing from "../../components/VerdictDisplay/ConfidenceRing";
import { Badge } from "../../components/Common/Badge";
import { scoreToColor } from "../../utils/colorUtils";
import { extractDomain } from "../../utils/helpers";

export default function DomainReport({ result, query }) {
    const { colors } = useTheme();

    if (!result) return null;

    const riskScore = result.risk_score ?? 0;
    const domain = extractDomain(query ?? "");
    const riskFlags = result.risk_flags ?? [];
    const riskColor = scoreToColor(riskScore);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header summary */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{
                        fontFamily: "var(--font-accent)",
                        fontSize: "0.65rem",
                        color: colors.textMuted,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                    }}>
                        Investigation Target
                    </div>
                    <div style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: colors.text,
                        wordBreak: "break-all",
                        marginBottom: 12,
                    }}>
                        {domain || query}
                    </div>

                    {riskFlags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {riskFlags.map((flag, i) => (
                                <Badge key={i} variant="red" size="xs">{flag}</Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Risk score gauge */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ position: "relative" }}>
                        <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
                            <circle cx={50} cy={50} r={42} fill="none" stroke={colors.bgSurface} strokeWidth={8} />
                            <motion.circle
                                cx={50} cy={50} r={42} fill="none"
                                stroke={riskColor}
                                strokeWidth={8}
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 42}
                                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - riskScore / 100) }}
                                transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                                style={{ filter: `drop-shadow(0 0 6px ${riskColor})` }}
                            />
                        </svg>
                        <div style={{
                            position: "absolute", inset: 0,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                        }}>
                            <span style={{ fontFamily: "var(--font-accent)", fontSize: "1.3rem", fontWeight: 800, color: riskColor }}>
                                {riskScore}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", color: colors.textMuted }}>
                                /100
                            </span>
                        </div>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.textMuted }}>
                        Risk Score
                    </span>
                </div>
            </motion.div>

            {/* Full OSINT panel */}
            <OSINTResults osint={result} domain={domain} />
        </div>
    );
}