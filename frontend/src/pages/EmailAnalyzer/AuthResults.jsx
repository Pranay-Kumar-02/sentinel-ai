// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — AuthResults
// SPF / DKIM / DMARC validation display. The core trust signal for email forensics.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const AUTH_INFO = {
    spf: {
        name: "SPF",
        full: "Sender Policy Framework",
        desc: "Verifies the sending server is authorized to send mail for this domain.",
    },
    dkim: {
        name: "DKIM",
        full: "DomainKeys Identified Mail",
        desc: "Cryptographic signature proving the email wasn't altered in transit.",
    },
    dmarc: {
        name: "DMARC",
        full: "Domain-based Message Authentication",
        desc: "Policy telling receivers what to do when SPF/DKIM checks fail.",
    },
};

function statusConfig(status, colors) {
    const s = (status ?? "unknown").toLowerCase();
    if (s === "pass" || s === "valid" || s === true) {
        return { label: "PASS", icon: "✓", color: colors.green, bg: colors.greenSoft };
    }
    if (s === "fail" || s === "invalid" || s === false) {
        return { label: "FAIL", icon: "✕", color: colors.red, bg: colors.redSoft };
    }
    if (s === "neutral" || s === "softfail") {
        return { label: "WEAK", icon: "!", color: colors.amber, bg: colors.amberSoft };
    }
    return { label: "N/A", icon: "?", color: colors.textMuted, bg: colors.bgSurface };
}

function AuthCard({ type, status, detail, index, colors }) {
    const info = AUTH_INFO[type];
    const cfg = statusConfig(status, colors);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 280, damping: 22 }}
            style={{
                background: colors.bgSurface,
                border: `1px solid ${cfg.color}30`,
                borderRadius: 14,
                padding: 18,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Top glow line */}
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
                opacity: 0.7,
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: colors.text,
                    letterSpacing: "0.02em",
                }}>
                    {info.name}
                </span>

                <motion.div
                    animate={cfg.label === "FAIL" ? {
                        boxShadow: [
                            `0 0 0 0 ${cfg.bg}`,
                            `0 0 0 6px ${cfg.bg}`,
                            `0 0 0 0 ${cfg.bg}`,
                        ],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 10px",
                        background: cfg.bg,
                        border: `1px solid ${cfg.color}40`,
                        borderRadius: 999,
                    }}
                >
                    <span style={{ fontSize: "0.7rem", color: cfg.color, fontWeight: 700 }}>{cfg.icon}</span>
                    <span style={{
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-accent)",
                        fontWeight: 700,
                        color: cfg.color,
                        letterSpacing: "0.06em",
                    }}>
                        {cfg.label}
                    </span>
                </motion.div>
            </div>

            <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: colors.textMuted,
                marginBottom: 8,
            }}>
                {info.full}
            </div>

            <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.76rem",
                color: colors.textSub,
                lineHeight: 1.5,
            }}>
                {info.desc}
            </div>

            {detail && (
                <div style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: `1px solid ${colors.border}`,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: cfg.color,
                    wordBreak: "break-all",
                }}>
                    {detail}
                </div>
            )}
        </motion.div>
    );
}

export default function AuthResults({ auth = {} }) {
    const { colors } = useTheme();

    const results = [
        { type: "spf", status: auth.spf?.status ?? auth.spf, detail: auth.spf?.detail ?? auth.spf_record },
        { type: "dkim", status: auth.dkim?.status ?? auth.dkim, detail: auth.dkim?.detail ?? auth.dkim_record },
        { type: "dmarc", status: auth.dmarc?.status ?? auth.dmarc, detail: auth.dmarc?.detail ?? auth.dmarc_policy },
    ];

    const passCount = results.filter((r) => {
        const s = (r.status ?? "").toString().toLowerCase();
        return s === "pass" || s === "valid" || r.status === true;
    }).length;

    return (
        <div>
            {/* Overall trust score */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    padding: "12px 16px",
                    background: passCount === 3 ? colors.greenSoft : passCount === 0 ? colors.redSoft : colors.amberSoft,
                    border: `1px solid ${passCount === 3 ? colors.green : passCount === 0 ? colors.red : colors.amber}30`,
                    borderRadius: 10,
                }}
            >
                <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: passCount === 3 ? colors.green : passCount === 0 ? colors.red : colors.amber,
                }}>
                    {passCount === 3
                        ? "✓ All authentication checks passed"
                        : passCount === 0
                            ? "✕ All authentication checks failed — high spoofing risk"
                            : `⚠ ${passCount}/3 authentication checks passed`}
                </span>
                <span style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: passCount === 3 ? colors.green : passCount === 0 ? colors.red : colors.amber,
                }}>
                    {passCount}/3
                </span>
            </motion.div>

            {/* Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
            }}>
                {results.map((r, i) => (
                    <AuthCard key={r.type} {...r} index={i} colors={colors} />
                ))}
            </div>
        </div>
    );
}