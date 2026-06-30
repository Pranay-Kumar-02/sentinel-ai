// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — SpoofDetector
// Display-name spoofing, reply-to mismatch, and BEC pattern detection
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { Badge } from "../../components/Common/Badge";

export default function SpoofDetector({ spoofing = {} }) {
    const { colors } = useTheme();

    const {
        display_name_spoofing: displaySpoof = null,
        reply_to_mismatch: replyMismatch = null,
        from_address,
        reply_to_address,
        display_name,
        bec_indicators = [],
        is_bec = false,
    } = spoofing;

    const flags = [
        displaySpoof && {
            icon: "🎭",
            title: "Display Name Spoofing",
            desc: `Display name "${display_name ?? '—'}" doesn't match the sending domain — a classic impersonation tactic.`,
        },
        replyMismatch && {
            icon: "↩️",
            title: "Reply-To Mismatch",
            desc: `Replies are silently redirected to a different address than the visible sender.`,
        },
        is_bec && {
            icon: "💼",
            title: "Business Email Compromise Pattern",
            desc: `This email matches known BEC attack patterns — likely targeting financial transactions or credentials.`,
        },
    ].filter(Boolean);

    const hasIssues = flags.length > 0;

    return (
        <div>
            {/* Status banner */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    background: hasIssues ? colors.redSoft : colors.greenSoft,
                    border: `1px solid ${hasIssues ? colors.red : colors.green}30`,
                    borderRadius: 10,
                    marginBottom: 16,
                }}
            >
                <span style={{ fontSize: "1.1rem" }}>{hasIssues ? "🚨" : "✅"}</span>
                <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: hasIssues ? colors.red : colors.green,
                }}>
                    {hasIssues
                        ? `${flags.length} spoofing indicator${flags.length > 1 ? "s" : ""} detected`
                        : "No spoofing patterns detected"}
                </span>
            </motion.div>

            {/* Address comparison */}
            {(from_address || reply_to_address) && (
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginBottom: 16,
                }}>
                    {from_address && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            background: colors.bgSurface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 8,
                        }}>
                            <span style={{ fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-accent)", textTransform: "uppercase", minWidth: 60 }}>
                                From
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: colors.text }}>
                                {display_name && <strong>{display_name} </strong>}
                                &lt;{from_address}&gt;
                            </span>
                        </div>
                    )}
                    {reply_to_address && reply_to_address !== from_address && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            background: colors.redSoft,
                            border: `1px solid ${colors.red}30`,
                            borderRadius: 8,
                        }}>
                            <span style={{ fontSize: "0.65rem", color: colors.red, fontFamily: "var(--font-accent)", textTransform: "uppercase", minWidth: 60 }}>
                                Reply-To
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: colors.red, fontWeight: 600 }}>
                                &lt;{reply_to_address}&gt; ⚠ Different from sender
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Flags */}
            {flags.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {flags.map((flag, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                display: "flex",
                                gap: 12,
                                padding: "12px 14px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.red}25`,
                                borderRadius: 10,
                            }}
                        >
                            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{flag.icon}</span>
                            <div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, color: colors.text, marginBottom: 3 }}>
                                    {flag.title}
                                </div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: colors.textSub, lineHeight: 1.5 }}>
                                    {flag.desc}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* BEC indicators list */}
            {bec_indicators.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: "0.62rem", color: colors.textMuted, fontFamily: "var(--font-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                        BEC Pattern Indicators
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {bec_indicators.map((ind, i) => (
                            <Badge key={i} variant="red" size="xs">{ind}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}