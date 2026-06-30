// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatScanner (Page)
// Split workspace: terminal input left, live investigation story right.
// Its own dedicated module — not the homepage.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useAnalysis, SCAN_TYPES } from "../../hooks/useAnalysis";
import { verdictToParticleMode, normalizeVerdict } from "../../utils/riskCalculator";
import ScanInput from "./ScanInput";
import InvestigationReport from "./InvestigationReport";

export default function ThreatScanner({ onVerdictChange }) {
    const { colors } = useTheme();
    const {
        analyze, result, state, isLoading, scanType, setScanType,
        logs, error, reset, cancelScan,
    } = useAnalysis();

    function handleSubmit(input, type) {
        analyze(input, type, { runOsint: true });
    }

    // Notify parent (App.jsx) of verdict for background reactivity
    const verdict = result
        ? normalizeVerdict(result.master_verdict ?? result.verdict ?? result.llm_analysis?.verdict ?? "UNKNOWN")
        : null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                padding: "88px 32px 40px",
                maxWidth: 1400,
                margin: "0 auto",
                minHeight: "100vh",
            }}
        >
            {/* Page header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: colors.text,
                    margin: "0 0 6px",
                    letterSpacing: "-0.02em",
                }}>
                    Threat Scanner
                </h1>
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.88rem",
                    color: colors.textSub,
                    margin: 0,
                }}>
                    AI-powered investigation engine with full OSINT correlation and MITRE ATT&CK mapping.
                </p>
            </div>

            {/* Split workspace */}
            <div
                className="scanner-split"
                style={{
                    display: "grid",
                    gridTemplateColumns: "380px 1fr",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                {/* Left — input panel (sticky) */}
                <div style={{
                    position: "sticky",
                    top: 88,
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: 20,
                    height: "calc(100vh - 128px)",
                }}>
                    <ScanInput
                        scanType={scanType}
                        onScanTypeChange={setScanType}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        onCancel={cancelScan}
                    />
                </div>

                {/* Right — investigation report */}
                <div style={{ minHeight: "calc(100vh - 128px)" }}>
                    <InvestigationReport
                        state={state}
                        result={result}
                        logs={logs}
                        error={error}
                    />
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .scanner-split {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </motion.div>
    );
}