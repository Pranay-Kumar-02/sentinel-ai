// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — EasyCheck ("Explain It Simply" mode)
//
// A completely separate, minimal page for someone who is NOT technical —
// built for the person ThreatScanner was never designed for: a parent,
// grandparent, or anyone who just wants one honest answer to "is this safe?"
//
// REAL DATA ONLY — reuses the exact same useAnalysis() hook and
// calculateRiskScore()/normalizeVerdict() logic as ThreatScanner. This page
// does not talk to any different backend or invent its own verdict — it's
// the same real /fullscan → /analyze pipeline, translated into plain
// language. The technical explanation is still there, just tucked behind
// an optional "Show technical details" toggle instead of forced up front.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useAnalysis, SCAN_TYPES } from "../../hooks/useAnalysis";
import {
    normalizeVerdict,
    calculateRiskScore,
    confidenceLabel,
} from "../../utils/riskCalculator";

// ─────────────────────────────────────────────────────────────────────────────
// Plain-language translation layer. Built from the SAME structured
// components calculateRiskScore() already produces — not a separate guess.
// Each reason only appears if its underlying real signal actually fired.
// ─────────────────────────────────────────────────────────────────────────────
function plainReasons(score) {
    const c = score.components ?? {};
    const reasons = [];
    if (c.urgency >= 10) reasons.push("It's trying to rush you into acting fast");
    if (c.brand >= 10) reasons.push("It's pretending to be a company or bank you trust");
    if (c.virusTotal > 0) reasons.push("Security scanners have flagged this as dangerous before");
    if (c.safeBrowsing > 0) reasons.push("Google's safety database has flagged this");
    if (c.typosquatting > 0) reasons.push("This web address is a fake copy of a real one");
    if (c.domainAge >= 5) reasons.push("This website was only just created recently");
    if (c.infrastructure > 0) reasons.push("It's hiding where it's really coming from");
    if (c.urls > 0 && reasons.length < 2) reasons.push("It contains links you shouldn't click");
    return reasons;
}

const VERDICT_COPY = {
    SAFE: {
        headline: "This looks safe",
        sub: "We didn't find any warning signs.",
        colorKey: "green",
        actions: ["Still, never share your OTP, password, or bank PIN with anyone who messages or calls you."],
    },
    SUSPICIOUS: {
        headline: "Be careful with this",
        sub: "A few things about it don't look right.",
        colorKey: "amber",
        actions: [
            "Don't click any links in it yet.",
            "Ask a family member to look at it with you.",
            "If it claims to be your bank, call the number on your actual bank card — not any number in the message.",
        ],
    },
    DANGEROUS: {
        headline: "This looks dangerous",
        sub: "Several real warning signs showed up.",
        colorKey: "red",
        actions: [
            "Do not click any links in it.",
            "Do not share your OTP, password, or bank details.",
            "Delete the message, or block whoever sent it.",
        ],
    },
    CRITICAL: {
        headline: "This is dangerous — act now",
        sub: "This matches known scam patterns closely.",
        colorKey: "red",
        actions: [
            "Do not click anything in it.",
            "Do not share any personal or banking information.",
            "Delete it and block the sender right away.",
        ],
    },
    UNKNOWN: {
        headline: "We're not fully sure",
        sub: "We couldn't get a clear read on this one.",
        colorKey: "textMuted",
        actions: ["To be safe, check with a family member or contact the company directly using a number you already know is real."],
    },
};

// ── Simple icon set (no emoji — deliberate, calmer, drawn shapes) ────────────
function VerdictIcon({ colorKey, colors }) {
    const color = colors[colorKey] ?? colors.textMuted;
    if (colorKey === "green") {
        return (
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="33" stroke={color} strokeWidth="4" />
                <motion.path
                    d="M22 37 L31 46 L50 26"
                    stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                />
            </svg>
        );
    }
    if (colorKey === "amber") {
        return (
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <motion.path
                    d="M36 8 L67 62 L5 62 Z" stroke={color} strokeWidth="4" strokeLinejoin="round" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }}
                />
                <line x1="36" y1="30" x2="36" y2="44" stroke={color} strokeWidth="4" strokeLinecap="round" />
                <circle cx="36" cy="52" r="2.5" fill={color} />
            </svg>
        );
    }
    // red / critical / unknown fallback — stop-octagon
    return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <motion.path
                d="M24 6 H48 L66 24 V48 L48 66 H24 L6 48 V24 Z"
                stroke={color} strokeWidth="4" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }}
            />
            <line x1="26" y1="26" x2="46" y2="46" stroke={color} strokeWidth="4" strokeLinecap="round" />
            <line x1="46" y1="26" x2="26" y2="46" stroke={color} strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

export default function EasyCheck() {
    const { colors } = useTheme();
    const { analyze, result, state, isLoading, error, reset } = useAnalysis();

    const [mode, setMode] = useState("text"); // "text" | "image"
    const [text, setText] = useState("");
    const [showDetails, setShowDetails] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const fileInputRef = useRef(null);

    const handleCheckText = useCallback(() => {
        if (!text.trim()) return;
        analyze(text, SCAN_TYPES.MESSAGE, { runOsint: true });
    }, [text, analyze]);

    const handleFilePicked = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) analyze(file, SCAN_TYPES.SCREENSHOT);
    }, [analyze]);

    const handleReset = useCallback(() => {
        reset();
        setText("");
        setShowDetails(false);
        window.speechSynthesis?.cancel();
        setSpeaking(false);
    }, [reset]);

    // ── Derive real verdict + real plain-language reasons ───────────────────
    const verdictRaw = result
        ? (result.master_verdict ?? result.verdict ?? result.llm_analysis?.verdict ?? "UNKNOWN")
        : null;
    const verdict = verdictRaw ? normalizeVerdict(verdictRaw) : null;
    const score = result ? calculateRiskScore(result) : null;
    const reasons = score ? plainReasons(score) : [];
    const copy = verdict ? (VERDICT_COPY[verdict] ?? VERDICT_COPY.UNKNOWN) : null;
    const llm = result ? (result.llm_analysis ?? result) : null;
    const technicalExplanation = llm?.explanation ?? llm?.reasoning ?? null;
    const confidence = llm?.confidence ?? result?.confidence ?? null;

    const handleReadAloud = useCallback(() => {
        if (!copy) return;
        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }
        const parts = [copy.headline + ".", copy.sub, ...reasons, ...copy.actions];
        const utter = new SpeechSynthesisUtterance(parts.join(". "));
        utter.rate = 0.92;
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
        setSpeaking(true);
    }, [copy, reasons, speaking]);

    const verdictColor = copy ? (colors[copy.colorKey] ?? colors.textMuted) : colors.accent;

    return (
        <div style={{ minHeight: "100vh", padding: "80px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: "100%", maxWidth: 560 }}>

                {/* ── Idle: input ────────────────────────────────────────── */}
                {state === "idle" && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ textAlign: "center", marginBottom: 36 }}>
                            <h1 style={{
                                fontFamily: "var(--font-display)", fontSize: "2.1rem", fontWeight: 800,
                                color: colors.text, margin: "0 0 12px", lineHeight: 1.25,
                            }}>
                                Is this safe?
                            </h1>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", color: colors.textSub, lineHeight: 1.6, margin: 0 }}>
                                Paste a message or upload a screenshot. We'll check it for you in plain language.
                            </p>
                        </div>

                        {/* Mode toggle */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 18, justifyContent: "center" }}>
                            {[["text", "Paste a Message"], ["image", "Upload a Screenshot"]].map(([m, label]) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    style={{
                                        padding: "12px 20px", borderRadius: 12, fontSize: "0.95rem", fontWeight: 700,
                                        fontFamily: "var(--font-body)", cursor: "pointer",
                                        border: `2px solid ${mode === m ? colors.accent : colors.border}`,
                                        background: mode === m ? colors.accentSoft : colors.bgCard,
                                        color: mode === m ? colors.accent : colors.textSub,
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {mode === "text" ? (
                            <>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Paste the message, link, or text here..."
                                    rows={7}
                                    style={{
                                        width: "100%", padding: 18, borderRadius: 16,
                                        border: `2px solid ${colors.border}`, background: colors.bgCard,
                                        color: colors.text, fontFamily: "var(--font-body)", fontSize: "1.05rem",
                                        lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box",
                                    }}
                                />
                                <motion.button
                                    onClick={handleCheckText}
                                    disabled={!text.trim()}
                                    whileHover={{ scale: text.trim() ? 1.02 : 1 }}
                                    whileTap={{ scale: text.trim() ? 0.98 : 1 }}
                                    style={{
                                        width: "100%", marginTop: 16, padding: "18px", borderRadius: 16, border: "none",
                                        background: text.trim() ? colors.accent : colors.bgSurface,
                                        color: text.trim() ? colors.bg : colors.textMuted,
                                        fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800,
                                        cursor: text.trim() ? "pointer" : "not-allowed",
                                    }}
                                >
                                    Check If This Is Safe
                                </motion.button>
                            </>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${colors.border}`, borderRadius: 16, padding: "56px 20px",
                                    textAlign: "center", cursor: "pointer", background: colors.bgCard,
                                }}
                            >
                                <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>📷</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                                    Tap to upload a screenshot
                                </div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: colors.textMuted }}>
                                    Of a message, email, or website
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFilePicked} style={{ display: "none" }} />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── Loading ────────────────────────────────────────────── */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "60px 0" }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                width: 88, height: 88, borderRadius: "50%",
                                background: colors.accentSoft, border: `2px solid ${colors.accent}40`,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.2rem",
                            }}
                        >
                            🔎
                        </motion.div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: colors.text, textAlign: "center" }}>
                            Checking this for you...
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", color: colors.textMuted, textAlign: "center" }}>
                            This takes a few seconds.
                        </div>
                    </motion.div>
                )}

                {/* ── Error ──────────────────────────────────────────────── */}
                {state === "error" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                        style={{ textAlign: "center", padding: "50px 20px" }}
                    >
                        <div style={{ fontSize: "2.2rem", marginBottom: 14 }}>⚠️</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                            We couldn't check this right now
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", color: colors.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                            Try again in a moment. If you're worried right now, it's always safe to ask someone you trust before clicking anything.
                        </div>
                        <button onClick={handleReset} style={{
                            padding: "12px 24px", borderRadius: 12, border: `2px solid ${colors.border}`,
                            background: colors.bgCard, color: colors.text, fontFamily: "var(--font-body)",
                            fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                        }}>
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* ── Success — the plain-language verdict ──────────────── */}
                {state === "success" && result && copy && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 28 }}>
                            <motion.div
                                animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.05, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    position: "relative", width: 120, height: 120, borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                                    background: `radial-gradient(circle, ${verdictColor}22 0%, transparent 70%)`,
                                }}
                            >
                                <VerdictIcon colorKey={copy.colorKey} colors={colors} />
                            </motion.div>

                            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 900, color: verdictColor, margin: "0 0 8px" }}>
                                {copy.headline}
                            </h1>
                            <p style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", color: colors.textSub, margin: 0 }}>
                                {copy.sub}
                            </p>
                        </div>

                        {/* Real reasons, plain language */}
                        {reasons.length > 0 && (
                            <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "20px", marginBottom: 16 }}>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: colors.text, marginBottom: 12 }}>
                                    Here's why:
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {reasons.map((r, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 + i * 0.12 }}
                                            style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "var(--font-body)", fontSize: "0.98rem", color: colors.textSub, lineHeight: 1.5 }}
                                        >
                                            <span style={{ color: verdictColor, flexShrink: 0, marginTop: 2 }}>●</span>
                                            {r}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* What to do */}
                        <div style={{ background: `${verdictColor}12`, border: `1px solid ${verdictColor}30`, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: colors.text, marginBottom: 12 }}>
                                What to do:
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {copy.actions.map((a, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.12 }}
                                        style={{ display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "var(--font-body)", fontSize: "0.98rem", color: colors.text, fontWeight: 600, lineHeight: 1.5 }}
                                    >
                                        <span style={{ color: verdictColor, flexShrink: 0 }}>→</span>
                                        {a}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Actions row */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                            <motion.button
                                onClick={handleReadAloud}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                style={{
                                    flex: 1, padding: "14px", borderRadius: 12, border: `2px solid ${colors.border}`,
                                    background: speaking ? colors.accentSoft : colors.bgCard,
                                    color: speaking ? colors.accent : colors.text,
                                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                                }}
                            >
                                {speaking ? "⏹ Stop Reading" : "🔊 Read This Aloud"}
                            </motion.button>
                            <motion.button
                                onClick={handleReset}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                style={{
                                    flex: 1, padding: "14px", borderRadius: 12, border: "none",
                                    background: colors.accent, color: colors.bg,
                                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                                }}
                            >
                                Check Another
                            </motion.button>
                        </div>

                        {/* Optional technical details — real data, just not forced up front */}
                        <div style={{ textAlign: "center", marginTop: 10 }}>
                            <button
                                onClick={() => setShowDetails((v) => !v)}
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: colors.textMuted,
                                    textDecoration: "underline",
                                }}
                            >
                                {showDetails ? "Hide technical details" : "Show technical details"}
                            </button>
                        </div>
                        <AnimatePresence>
                            {showDetails && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: "hidden", marginTop: 14 }}
                                >
                                    <div style={{ background: colors.bgSurface, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: colors.textMuted, lineHeight: 1.7 }}>
                                        <div>Verdict: <strong style={{ color: colors.text }}>{verdictRaw}</strong></div>
                                        {confidence != null && <div>Confidence: <strong style={{ color: colors.text }}>{confidence}%</strong> ({confidenceLabel(confidence)})</div>}
                                        {score && <div>Composite risk score: <strong style={{ color: colors.text }}>{score.total}/100</strong> ({score.riskLevel})</div>}
                                        {technicalExplanation && (
                                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${colors.border}` }}>
                                                {technicalExplanation}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}