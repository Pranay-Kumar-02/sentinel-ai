// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — EmailAnalyzer (Page)
// Raw email header + body forensics: hop chain, SPF/DKIM/DMARC, spoof detection.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useAnalysis, SCAN_TYPES } from "../../hooks/useAnalysis";
import TerminalLog from "../../components/Common/TerminalLog";
import VerdictReveal from "../../components/VerdictDisplay/VerdictReveal";
import HopChain from "./HopChain";
import AuthResults from "./AuthResults";
import SpoofDetector from "./SpoofDetector";

const SAMPLE_HEADER = `Received: from mail.suspicious-domain.tk (mail.suspicious-domain.tk [185.220.101.45])
\tby mx.google.com with ESMTPS id a1b2c3d4
\tfor <victim@example.com>;
\tMon, 30 Jun 2026 09:15:22 -0700
From: "HDFC Bank Security" <security@hdfc-alert.xyz>
Reply-To: collect@totally-not-a-scam.ru
To: victim@example.com
Subject: URGENT: Verify Your Account Now
Date: Mon, 30 Jun 2026 09:15:20 -0700
Authentication-Results: mx.google.com;
       spf=fail (google.com: domain of security@hdfc-alert.xyz does not designate 185.220.101.45 as permitted sender);
       dkim=none;
       dmarc=fail`;

export default function EmailAnalyzer() {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const { analyze, result, state, isLoading, logs, error, cancelScan } = useAnalysis();
    const [rawEmail, setRawEmail] = useState("");

    function handleAnalyze() {
        if (!rawEmail.trim() || isLoading) return;
        analyze(rawEmail.trim(), SCAN_TYPES.EMAIL);
    }

    function loadSample() {
        setRawEmail(SAMPLE_HEADER);
    }

    const emailData = result?.email_analysis ?? result ?? {};
    const hops = emailData.hop_chain ?? emailData.hops ?? [];
    const auth = emailData.authentication ?? emailData.auth ?? {};
    const spoofing = emailData.spoofing ?? {};

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
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: colors.text,
                    margin: "0 0 6px",
                    letterSpacing: "-0.02em",
                }}>
                    Email Analyzer
                </h1>
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.88rem",
                    color: colors.textSub,
                    margin: 0,
                }}>
                    Raw header forensics — SPF, DKIM, DMARC validation, hop chain tracing, and BEC detection.
                </p>
            </div>

            {/* Split workspace */}
            <div
                className="email-split"
                style={{
                    display: "grid",
                    gridTemplateColumns: "420px 1fr",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                {/* Left — raw email input */}
                <div style={{
                    position: "sticky",
                    top: 88,
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.68rem",
                            color: colors.textMuted,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                        }}>
                            Raw Email Source
                        </span>
                        <motion.button
                            onClick={loadSample}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "SAMPLE")}
                            onMouseLeave={resetCursor}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                fontSize: "0.65rem",
                                color: colors.purple,
                                background: colors.purpleSoft,
                                border: `1px solid ${colors.purple}30`,
                                padding: "3px 10px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            Load Sample
                        </motion.button>
                    </div>

                    <textarea
                        value={rawEmail}
                        onChange={(e) => setRawEmail(e.target.value)}
                        placeholder="Paste raw email source including headers (Received:, From:, Authentication-Results:) and body..."
                        style={{
                            minHeight: 320,
                            background: colors.bgInput,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12,
                            padding: 14,
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.76rem",
                            resize: "vertical",
                            outline: "none",
                            lineHeight: 1.6,
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

                    <div style={{ fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                        💡 Tip: In Gmail, use "Show original" to copy the raw source.
                    </div>

                    <motion.button
                        onClick={isLoading ? cancelScan : handleAnalyze}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, isLoading ? "CANCEL" : "ANALYZE")}
                        onMouseLeave={resetCursor}
                        whileHover={(rawEmail.trim() || isLoading) ? { scale: 1.02, y: -1 } : {}}
                        whileTap={(rawEmail.trim() || isLoading) ? { scale: 0.98 } : {}}
                        disabled={!rawEmail.trim() && !isLoading}
                        style={{
                            padding: "14px 24px",
                            background: isLoading ? colors.bgSurface : (rawEmail.trim() ? gradients.primary : colors.bgSurface),
                            border: isLoading ? `1px solid ${colors.red}50` : "none",
                            borderRadius: 12,
                            color: isLoading ? colors.red : (rawEmail.trim() ? "#fff" : colors.textMuted),
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            cursor: (rawEmail.trim() || isLoading) ? "pointer" : "not-allowed",
                            boxShadow: rawEmail.trim() && !isLoading ? `0 8px 24px ${colors.accentGlow}` : "none",
                        }}
                    >
                        {isLoading ? "⏹ Cancel" : "📧 Analyze Headers"}
                    </motion.button>
                </div>

                {/* Right — results */}
                <div style={{ minHeight: "calc(100vh - 128px)" }}>
                    <AnimatePresence mode="wait">
                        {state === "idle" && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    height: "100%", minHeight: 400,
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    gap: 16, textAlign: "center", padding: 40,
                                }}
                            >
                                <motion.div
                                    animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    style={{
                                        width: 80, height: 80, borderRadius: "50%",
                                        background: colors.purpleSoft, border: `1px solid ${colors.border}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "2rem",
                                    }}
                                >
                                    📧
                                </motion.div>
                                <div>
                                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                                        Awaiting Email Source
                                    </div>
                                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: colors.textMuted, maxWidth: 320, lineHeight: 1.6 }}>
                                        Paste a raw email source to trace its path, validate authentication, and detect spoofing.
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {state === "loading" && (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <TerminalLog logs={logs} maxHeight={320} title="EMAIL FORENSICS ENGINE" />
                            </motion.div>
                        )}

                        {state === "error" && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    height: "100%", minHeight: 300,
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    gap: 16, textAlign: "center", padding: 40,
                                }}
                            >
                                <div style={{ fontSize: "2.5rem" }}>⚠️</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.red }}>
                                    Analysis Failed
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: colors.textMuted, maxWidth: 340 }}>
                                    {error ?? "Unable to parse this email. Verify it includes full headers."}
                                </div>
                            </motion.div>
                        )}

                        {state === "success" && result && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ display: "flex", flexDirection: "column", gap: 16 }}
                            >
                                {/* Authentication */}
                                <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                        <span style={{ fontSize: "1rem" }}>🔐</span>
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                                            Authentication Results
                                        </span>
                                    </div>
                                    <AuthResults auth={auth} />
                                </div>

                                {/* Spoof detection */}
                                <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                        <span style={{ fontSize: "1rem" }}>🎭</span>
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                                            Spoofing Detection
                                        </span>
                                    </div>
                                    <SpoofDetector spoofing={spoofing} />
                                </div>

                                {/* Hop chain */}
                                <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                        <span style={{ fontSize: "1rem" }}>📡</span>
                                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                                            Mail Server Hop Chain
                                        </span>
                                    </div>
                                    <HopChain hops={hops} />
                                </div>

                                {/* Full verdict if LLM analysis included */}
                                {(result.master_verdict || result.llm_analysis) && (
                                    <VerdictReveal result={result} />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .email-split { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </motion.div>
    );
}