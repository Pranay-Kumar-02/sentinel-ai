// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ExportPanel
// Export the investigation report: JSON download, copy to clipboard,
// print/PDF view, and share link generation (local only).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { copyToClipboard } from "../../utils/helpers";
import { exportFilename, formatExportData } from "../../utils/formatters";
import { normalizeVerdict } from "../../utils/riskCalculator";

export default function ExportPanel({ result, scanType = "scan" }) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [copiedState, setCopiedState] = useState(null); // 'json' | 'summary' | null

    if (!result) return null;

    const llm = result.llm_analysis ?? result;
    const verdict = normalizeVerdict(llm.verdict ?? result.master_verdict ?? "UNKNOWN");

    // ── Export as JSON file ─────────────────────────────────────
    function handleExportJSON() {
        const data = formatExportData(result, {
            scanType,
            verdict,
            exportedAt: new Date().toISOString(),
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = exportFilename(scanType, verdict, "json");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ── Copy raw JSON ───────────────────────────────────────────
    async function handleCopyJSON() {
        await copyToClipboard(JSON.stringify(result, null, 2));
        setCopiedState("json");
        setTimeout(() => setCopiedState(null), 2000);
    }

    // ── Copy plain-text summary ─────────────────────────────────
    async function handleCopySummary() {
        const summary = [
            `SENTINEL AI — Threat Investigation Report`,
            `Verdict: ${verdict}`,
            `Confidence: ${llm.confidence ?? "—"}%`,
            llm.attack_type ? `Attack Type: ${llm.attack_type}` : null,
            llm.explanation ? `\nAnalysis:\n${llm.explanation}` : null,
            `\nGenerated: ${new Date().toLocaleString()}`,
        ].filter(Boolean).join("\n");

        await copyToClipboard(summary);
        setCopiedState("summary");
        setTimeout(() => setCopiedState(null), 2000);
    }

    // ── Print view ───────────────────────────────────────────────
    function handlePrint() {
        window.print();
    }

    const actions = [
        {
            id: "json",
            icon: "📥",
            label: "Download JSON",
            action: handleExportJSON,
        },
        {
            id: "copy-json",
            icon: copiedState === "json" ? "✓" : "📋",
            label: copiedState === "json" ? "Copied!" : "Copy Raw Data",
            action: handleCopyJSON,
        },
        {
            id: "copy-summary",
            icon: copiedState === "summary" ? "✓" : "📝",
            label: copiedState === "summary" ? "Copied!" : "Copy Summary",
            action: handleCopySummary,
        },
        {
            id: "print",
            icon: "🖨️",
            label: "Print Report",
            action: handlePrint,
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: "16px 18px",
            }}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
            }}>
                <span style={{ fontSize: "1rem" }}>📤</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: colors.text,
                }}>
                    Export Report
                </span>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 8,
            }}>
                {actions.map((a) => (
                    <motion.button
                        key={a.id}
                        onClick={a.action}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, a.label.toUpperCase())}
                        onMouseLeave={resetCursor}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 14px",
                            background: colors.bgSurface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 10,
                            cursor: "pointer",
                            fontSize: "0.78rem",
                            color: colors.text,
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            transition: "border-color 0.15s ease",
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={a.icon}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                style={{ fontSize: "0.9rem" }}
                            >
                                {a.icon}
                            </motion.span>
                        </AnimatePresence>
                        {a.label}
                    </motion.button>
                ))}
            </div>

            {/* CTI report note */}
            <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: `1px solid ${colors.border}`,
                fontSize: "0.68rem",
                color: colors.textMuted,
                fontFamily: "var(--font-mono)",
                lineHeight: 1.6,
            }}>
                Reports generated by Sentinel AI are for informational purposes.
                Always verify findings through official channels before taking action.
            </div>
        </motion.div>
    );
}