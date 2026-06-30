// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — OsintRecon (Page)
// Dedicated domain/URL OSINT investigation workspace.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useAnalysis, SCAN_TYPES } from "../../hooks/useAnalysis";
import { isUrl } from "../../utils/helpers";
import TerminalLog from "../../components/Common/TerminalLog";
import DomainReport from "./DomainReport";

const RECENT_PLACEHOLDER = [
    "paypa1-secure.net",
    "hdfc-alert.xyz",
    "amazon-prize.tk",
];

export default function OsintRecon() {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const { analyze, result, state, isLoading, logs, error, cancelScan } = useAnalysis();
    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");

    function handleSubmit() {
        if (!query.trim() || isLoading) return;
        setSubmittedQuery(query.trim());
        analyze(query.trim(), SCAN_TYPES.DOMAIN);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleSubmit();
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                padding: "88px 32px 60px",
                maxWidth: 1100,
                margin: "0 auto",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 28, textAlign: "center" }}>
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 14px",
                    background: colors.blueSoft ?? colors.accentSoft,
                    border: `1px solid ${colors.blue}30`,
                    borderRadius: 999,
                    fontSize: "0.68rem",
                    fontFamily: "var(--font-accent)",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: colors.blue,
                    marginBottom: 16,
                }}>
                    🌐 OSINT Reconnaissance
                </div>

                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    fontWeight: 800,
                    color: colors.text,
                    margin: "0 0 10px",
                    letterSpacing: "-0.02em",
                }}>
                    Domain Deep Dive
                </h1>
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.92rem",
                    color: colors.textSub,
                    margin: "0 auto",
                    maxWidth: 480,
                    lineHeight: 1.6,
                }}>
                    Full domain intelligence: VirusTotal, WHOIS, IP geolocation, Safe Browsing, and typosquatting detection.
                </p>
            </div>

            {/* Search bar */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 16,
                }}
            >
                <div style={{
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                }}>
                    <span style={{
                        position: "absolute",
                        left: 16,
                        fontSize: "1rem",
                        color: colors.textMuted,
                        pointerEvents: "none",
                    }}>
                        🔍
                    </span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter a domain, URL, or IP address..."
                        style={{
                            width: "100%",
                            padding: "16px 16px 16px 46px",
                            background: colors.bgInput,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 14,
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.92rem",
                            outline: "none",
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = colors.borderHover;
                            e.target.style.boxShadow = `0 0 0 3px ${colors.accentSoft}`;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = colors.border;
                            e.target.style.boxShadow = "none";
                        }}
                    />
                </div>

                <motion.button
                    onClick={isLoading ? cancelScan : handleSubmit}
                    onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, isLoading ? "CANCEL" : "INVESTIGATE")}
                    onMouseLeave={resetCursor}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={!query.trim() && !isLoading}
                    style={{
                        padding: "0 28px",
                        background: isLoading ? colors.bgSurface : (query.trim() ? gradients.primary : colors.bgSurface),
                        border: isLoading ? `1px solid ${colors.red}50` : "none",
                        borderRadius: 14,
                        color: isLoading ? colors.red : (query.trim() ? "#fff" : colors.textMuted),
                        fontFamily: "var(--font-accent)",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        cursor: (query.trim() || isLoading) ? "pointer" : "not-allowed",
                        boxShadow: query.trim() && !isLoading ? `0 8px 24px ${colors.accentGlow}` : "none",
                        whiteSpace: "nowrap",
                    }}
                >
                    {isLoading ? "Cancel" : "Investigate"}
                </motion.button>
            </motion.div>

            {/* Quick examples (idle only) */}
            {state === "idle" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 40,
                    }}
                >
                    <span style={{ fontSize: "0.7rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                        Try:
                    </span>
                    {RECENT_PLACEHOLDER.map((ex) => (
                        <button
                            key={ex}
                            onClick={() => { setQuery(ex); }}
                            style={{
                                padding: "3px 10px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 999,
                                fontSize: "0.7rem",
                                color: colors.textSub,
                                fontFamily: "var(--font-mono)",
                                cursor: "pointer",
                            }}
                        >
                            {ex}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
                {state === "loading" && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <TerminalLog logs={logs} maxHeight={300} title="OSINT ENGINE" />
                    </motion.div>
                )}

                {state === "error" && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            textAlign: "center", padding: "60px 20px",
                        }}
                    >
                        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.red, marginBottom: 8 }}>
                            Investigation Failed
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: colors.textMuted }}>
                            {error ?? "Unable to investigate this target."}
                        </div>
                    </motion.div>
                )}

                {state === "success" && result && (
                    <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <DomainReport result={result} query={submittedQuery} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}