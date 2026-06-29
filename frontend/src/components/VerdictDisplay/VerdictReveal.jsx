// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — VerdictReveal
// The complete investigation story. Orchestrates the 10-step reveal:
// Verdict → Summary → Attack Chain → IOCs → Engines → OSINT →
// AI Reasoning → MITRE → Recommendations → Export
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { calculateRiskScore, normalizeVerdict } from "../../utils/riskCalculator";
import {
    formatUrl, formatDomainAge, formatVirusTotalResult,
    formatSafeBrowsing, formatMitreTechnique, formatAttackType,
    exportFilename, formatExportData,
} from "../../utils/formatters";
import { copyToClipboard } from "../../utils/helpers";
import VerdictBanner from "./VerdictBanner";
import ConfidenceRing from "./ConfidenceRing";
import { Badge } from "../Common/Badge";

// ── IOC Tag ───────────────────────────────────────────────────────────────────

function IOCTag({ value, type, colors }) {
    const typeColors = {
        url: { color: colors.red, bg: colors.redSoft },
        email: { color: colors.amber, bg: colors.amberSoft },
        phone: { color: colors.purple, bg: colors.purpleSoft },
        domain: { color: colors.blue, bg: colors.blueSoft },
        ip: { color: colors.teal, bg: colors.tealSoft },
    };
    const tc = typeColors[type] ?? { color: colors.accent, bg: colors.accentSoft };

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.7, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.04, boxShadow: `0 0 10px ${tc.color}50` }}
            onClick={() => copyToClipboard(value)}
            title="Click to copy"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 5,
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: tc.color,
                background: tc.bg,
                border: `1px solid ${tc.color}30`,
                cursor: "pointer",
                userSelect: "all",
            }}
        >
            {type.toUpperCase()} · {formatUrl(value, 40)}
        </motion.span>
    );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon, children, delay = 0, colors }) {
    const [open, setOpen] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                overflow: "hidden",
            }}
        >
            <button
                onClick={() => setOpen((v) => !v)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 18px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderBottom: open ? `1px solid ${colors.border}` : "none",
                }}
            >
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: colors.text,
                    flex: 1,
                    textAlign: "left",
                }}>
                    {title}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: "0.7rem", color: colors.textMuted }}
                >
                    ▼
                </motion.span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{ padding: "16px 18px" }}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function VerdictReveal({ result }) {
    const { colors } = useTheme();
    const [copied, setCopied] = useState(false);

    if (!result) return null;

    const riskScore = calculateRiskScore(result);
    const llm = result.llm_analysis ?? result;
    const osint = result.osint_results ?? result.osint ?? {};
    const verdict = normalizeVerdict(llm.verdict ?? result.master_verdict ?? "UNKNOWN");

    // IOCs
    const urls = (llm.extracted_urls ?? []).map((u) => ({ value: u, type: "url" }));
    const emails = (llm.extracted_emails ?? []).map((e) => ({ value: e, type: "email" }));
    const phones = (llm.extracted_phones ?? []).map((p) => ({ value: p, type: "phone" }));
    const iocs = [...urls, ...emails, ...phones];

    // MITRE techniques
    const mitreTechniques = llm.mitre_techniques ?? llm.attack_techniques ?? [];

    // Recommendations
    const recommendations = llm.recommendations ?? llm.actions ?? [];

    // Export
    async function handleExport(format = "json") {
        const data = JSON.stringify(formatExportData(result, { verdict, timestamp: new Date().toISOString() }), null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = exportFilename("scan", verdict, format);
        a.click();
        URL.revokeObjectURL(url);
    }

    async function handleCopy() {
        await copyToClipboard(JSON.stringify(result, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Step 1 — Verdict Banner */}
            <VerdictBanner result={result} riskScore={riskScore} />

            {/* Step 3 — IOCs */}
            {iocs.length > 0 && (
                <Section title="Extracted Intelligence" icon="🔍" delay={0.15} colors={colors}>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                        style={{ display: "flex", flexWrap: "wrap", gap: 7 }}
                    >
                        {iocs.map((ioc, i) => (
                            <IOCTag key={i} value={ioc.value} type={ioc.type} colors={colors} />
                        ))}
                    </motion.div>
                </Section>
            )}

            {/* Step 6 — OSINT */}
            {Object.keys(osint).length > 0 && (
                <Section title="OSINT Deep Dive" icon="🌐" delay={0.2} colors={colors}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                        {[
                            { label: "VirusTotal", value: formatVirusTotalResult(osint.virustotal) },
                            { label: "Safe Browsing", value: formatSafeBrowsing(osint.safe_browsing) },
                            { label: "Domain Age", value: formatDomainAge(osint.whois?.domain_age_days) },
                            { label: "Registrar", value: osint.whois?.registrar ?? "—" },
                            { label: "Country", value: osint.geolocation?.country ?? "—" },
                            { label: "ISP", value: osint.geolocation?.isp ?? "—" },
                            { label: "Risk Score", value: `${osint.risk_score ?? 0}/100` },
                            { label: "Typosquatting", value: osint.typosquatting?.detected ? "⚠️ Detected" : "✓ Clean" },
                        ].filter((r) => r.value && r.value !== "—").map(({ label, value }) => (
                            <div key={label} style={{
                                padding: "10px 12px",
                                background: colors.bgSurface,
                                borderRadius: 8,
                                border: `1px solid ${colors.border}`,
                            }}>
                                <div style={{ fontSize: "0.6rem", color: colors.textMuted, fontFamily: "var(--font-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                                    {label}
                                </div>
                                <div style={{ fontSize: "0.78rem", color: colors.text, fontFamily: "var(--font-mono)" }}>
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Risk flags */}
                    {osint.risk_flags?.length > 0 && (
                        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {osint.risk_flags.map((flag, i) => (
                                <Badge key={i} variant="red" size="xs">{flag}</Badge>
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {/* Step 7 — AI Reasoning */}
            {llm.explanation && (
                <Section title="AI Reasoning" icon="🤖" delay={0.25} colors={colors}>
                    <div style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        color: colors.textSub,
                        lineHeight: 1.8,
                        borderLeft: `3px solid ${colors.purple}`,
                        paddingLeft: 14,
                    }}>
                        {llm.explanation}
                    </div>
                    {llm.attack_type && (
                        <div style={{ marginTop: 12 }}>
                            <Badge variant="purple" icon="⚡">{formatAttackType(llm.attack_type)}</Badge>
                        </div>
                    )}
                </Section>
            )}

            {/* Step 8 — MITRE ATT&CK */}
            {mitreTechniques.length > 0 && (
                <Section title="MITRE ATT&CK® Mapping" icon="🛡️" delay={0.3} colors={colors}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {mitreTechniques.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    padding: "6px 10px",
                                    background: colors.bgSurface,
                                    border: `1px solid ${colors.orange}40`,
                                    borderRadius: 6,
                                    fontSize: "0.72rem",
                                    fontFamily: "var(--font-mono)",
                                    color: colors.orange,
                                }}
                            >
                                {formatMitreTechnique(typeof t === "string" ? t : t.id ?? t.technique ?? String(t))}
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Step 9 — Recommendations */}
            {recommendations.length > 0 && (
                <Section title="Recommended Actions" icon="📋" delay={0.35} colors={colors}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {recommendations.map((rec, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                    padding: "10px 12px",
                                    background: colors.bgSurface,
                                    borderRadius: 8,
                                    border: `1px solid ${colors.border}`,
                                }}
                            >
                                <span style={{
                                    fontFamily: "var(--font-accent)",
                                    fontSize: "0.65rem",
                                    color: colors.accent,
                                    background: colors.accentSoft,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    marginTop: 1,
                                }}>
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span style={{
                                    fontSize: "0.82rem",
                                    color: colors.text,
                                    fontFamily: "var(--font-body)",
                                    lineHeight: 1.5,
                                }}>
                                    {rec}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Step 10 — Export */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    padding: "16px",
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.82rem",
                    color: colors.textSub,
                }}>
                    Export investigation report
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                    {[
                        { label: "📥 JSON", action: () => handleExport("json") },
                        { label: copied ? "✓ Copied" : "📋 Copy", action: handleCopy },
                    ].map(({ label, action }) => (
                        <motion.button
                            key={label}
                            onClick={action}
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                padding: "7px 14px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 8,
                                cursor: "pointer",
                                fontSize: "0.78rem",
                                color: colors.text,
                                fontFamily: "var(--font-body)",
                                fontWeight: 500,
                                transition: "all 0.15s ease",
                            }}
                        >
                            {label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}