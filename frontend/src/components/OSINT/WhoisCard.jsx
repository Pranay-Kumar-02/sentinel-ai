// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — WhoisCard  
// Raw WHOIS data with risk indicators for suspicious patterns
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { Badge } from "../Common/Badge";

export default function WhoisCard({ whois = {}, typosquatting = null }) {
    const { colors } = useTheme();

    if (!whois || Object.keys(whois).length === 0) return null;

    const hasTypo = typosquatting?.detected ?? false;
    const similarity = typosquatting?.similarity_score ?? 0;
    const matches = typosquatting?.matches ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${hasTypo ? colors.amber + "40" : colors.border}`,
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: hasTypo ? `0 0 20px ${colors.amberSoft}` : "none",
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
                <span style={{ fontSize: "1rem" }}>🔎</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: colors.text,
                    flex: 1,
                }}>
                    Typosquatting Analysis
                </span>
                {hasTypo
                    ? <Badge variant="amber" size="xs" glow pulse>⚠ Detected</Badge>
                    : <Badge variant="green" size="xs">✓ Clean</Badge>
                }
            </div>

            <div style={{ padding: "16px" }}>
                {hasTypo ? (
                    <>
                        <div style={{
                            padding: "10px 14px",
                            background: colors.amberSoft,
                            border: `1px solid ${colors.amber}30`,
                            borderRadius: 8,
                            marginBottom: 12,
                            fontSize: "0.78rem",
                            color: colors.amber,
                            fontFamily: "var(--font-body)",
                            lineHeight: 1.5,
                        }}>
                            This domain closely resembles a legitimate brand — likely a typosquatting attempt.
                            {similarity > 0 && ` Similarity score: ${Math.round(similarity * 100)}%.`}
                        </div>

                        {matches.length > 0 && (
                            <div>
                                <div style={{
                                    fontSize: "0.65rem",
                                    fontFamily: "var(--font-accent)",
                                    color: colors.textMuted,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    marginBottom: 8,
                                }}>
                                    Matched Brands
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {matches.map((m, i) => (
                                        <span
                                            key={i}
                                            style={{
                                                padding: "3px 10px",
                                                background: colors.bgSurface,
                                                border: `1px solid ${colors.amber}30`,
                                                borderRadius: 5,
                                                fontSize: "0.72rem",
                                                fontFamily: "var(--font-mono)",
                                                color: colors.amber,
                                            }}
                                        >
                                            {typeof m === "string" ? m : m.brand ?? m.domain ?? String(m)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: "0.82rem",
                        color: colors.green,
                        fontFamily: "var(--font-body)",
                    }}>
                        <span style={{ fontSize: "1.2rem" }}>✓</span>
                        No typosquatting patterns detected. Domain appears legitimate.
                    </div>
                )}
            </div>
        </motion.div>
    );
}