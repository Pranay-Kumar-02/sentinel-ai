// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — InvestigationReport
// Right panel of scanner workspace. Shows terminal log during scan,
// then VerdictReveal (full investigation story) on completion.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import TerminalLog from "../../components/Common/TerminalLog";
import VerdictReveal from "../../components/VerdictDisplay/VerdictReveal";
import EngineGrid from "../../components/EngineGrid/EngineGrid";
import KillChain from "../../components/KillChain/KillChain";
import IOCDisplay from "./IOCDisplay";
import MitreMatrix from "./MitreMatrix";
import AIReasoning from "./AIReasoning";
import ExportPanel from "./ExportPanel";

export default function InvestigationReport({
    state,       // 'idle' | 'loading' | 'success' | 'error'
    result,
    logs,
    error,
}) {
    const { colors, gradients } = useTheme();

    // ── Idle state ──────────────────────────────────────────────
    if (state === "idle") {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    textAlign: "center",
                    padding: 40,
                }}
            >
                <motion.div
                    animate={{
                        scale: [1, 1.06, 1],
                        opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: colors.accentSoft,
                        border: `1px solid ${colors.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                    }}
                >
                    🛰️
                </motion.div>
                <div>
                    <div style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: colors.text,
                        marginBottom: 8,
                    }}>
                        Awaiting Investigation
                    </div>
                    <div style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        color: colors.textMuted,
                        maxWidth: 320,
                        lineHeight: 1.6,
                    }}>
                        Choose an investigation type and submit content to begin a full
                        AI-powered threat analysis with live OSINT correlation.
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Loading state ────────────────────────────────────────────
    if (state === "loading") {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}
            >
                <TerminalLog logs={logs} maxHeight={300} title="LIVE ANALYSIS" />
                <EngineGrid result={null} isLoading />
            </motion.div>
        );
    }

    // ── Error state ──────────────────────────────────────────────
    if (state === "error") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    textAlign: "center",
                    padding: 40,
                }}
            >
                <div style={{ fontSize: "2.5rem" }}>⚠️</div>
                <div>
                    <div style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: colors.red,
                        marginBottom: 8,
                    }}>
                        Analysis Failed
                    </div>
                    <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        color: colors.textMuted,
                        maxWidth: 340,
                        lineHeight: 1.6,
                    }}>
                        {error ?? "Something went wrong. Check if the backend is running at localhost:8000."}
                    </div>
                </div>
            </motion.div>
        );
    }

    // ── Success state ────────────────────────────────────────────
    if (state === "success" && result) {
        const llm = result.llm_analysis ?? result;
        const mitreTechniques = llm.mitre_techniques ?? llm.attack_techniques ?? [];

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
                <KillChain result={result} />
                <EngineGrid result={result} />
                <VerdictReveal result={result} />

                {/* IOC Display */}
                <div style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    padding: "18px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: "1rem" }}>🔍</span>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                            Indicators of Compromise
                        </span>
                    </div>
                    <IOCDisplay result={result} />
                </div>

                {/* AI Reasoning */}
                <div style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    padding: "18px",
                }}>
                    <AIReasoning result={result} />
                </div>

                {/* MITRE Matrix */}
                {mitreTechniques.length > 0 && (
                    <div style={{
                        background: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 14,
                        padding: "18px",
                        overflow: "hidden",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                            <span style={{ fontSize: "1rem" }}>🛡️</span>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                                MITRE ATT&CK® Matrix
                            </span>
                        </div>
                        <MitreMatrix detectedTechniques={mitreTechniques} />
                    </div>
                )}

                {/* Export */}
                <ExportPanel result={result} />
            </motion.div>
        );
    }

    return null;
}