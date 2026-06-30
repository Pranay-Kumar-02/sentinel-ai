// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Learn (Page)
// Phishing simulation quizzes + security awareness modules.
// "Sentinel Learn" from the project roadmap (Phase 8).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useLocalStorage, STORAGE_KEYS } from "../../hooks/useLocalStorage";
import { SectionHead } from "../../components/Common/Tooltip";
import { Badge } from "../../components/Common/Badge";
import Counter from "../../components/Common/Counter";

// ── Quiz data — "Can you spot the fake?" ──────────────────────────────────────

const QUIZ_QUESTIONS = [
    {
        id: 1,
        scenario: "message",
        from: "+91 98XXX-XXXXX",
        content: "Dear Customer, your SBI account will be BLOCKED in 24 hours due to KYC expiry. Update immediately: sbi-kyc-verify.tk/update",
        isPhishing: true,
        explanation: "Banks never send urgent KYC links via SMS with shortened/suspicious domains. The .tk domain and urgency language are classic red flags.",
        redFlags: ["Suspicious .tk domain", "Urgency pressure tactic", "Generic greeting", "Unofficial channel"],
    },
    {
        id: 2,
        scenario: "email",
        from: "notifications@github.com",
        content: "Your pull request #4521 has been merged into main by reviewer @octocat. View changes on GitHub.",
        isPhishing: false,
        explanation: "This is a legitimate GitHub notification — official domain, no urgency, no credential requests, matches expected notification patterns.",
        redFlags: [],
    },
    {
        id: 3,
        scenario: "message",
        from: "Unknown",
        content: "Congratulations! You've won ₹25,00,000 in the Amazon Lucky Draw! Claim now by sharing your bank details and OTP: amazon-prize.tk",
        isPhishing: true,
        explanation: "Classic lottery scam. Legitimate companies never ask for OTP or bank details to 'release winnings' you never entered to win.",
        redFlags: ["Unsolicited prize", "Requests OTP/bank details", "Fake domain", "Too good to be true"],
    },
    {
        id: 4,
        scenario: "email",
        from: "security@accounts.google.com",
        content: "New sign-in to your Google Account from a Windows device. If this wasn't you, secure your account immediately.",
        isPhishing: false,
        explanation: "Legitimate Google security alert — official domain, factual tone, no embedded credential-harvesting links in the preview.",
        redFlags: [],
    },
    {
        id: 5,
        scenario: "message",
        from: "+1 555-0199",
        content: "This is IRS Officer Williams. You have a pending tax violation. Pay $499 in Amazon gift cards immediately or face arrest.",
        isPhishing: true,
        explanation: "Government agencies never demand gift cards as payment, and never threaten immediate arrest via phone/SMS. Classic impersonation scam.",
        redFlags: ["Gift card payment demand", "Arrest threat", "Government impersonation", "Pressure tactics"],
    },
];

// ── Learning modules ───────────────────────────────────────────────────────────

const MODULES = [
    { id: "phishing", icon: "🪝", title: "Phishing Detection", desc: "Spot fake emails, links, and lures before you click.", lessons: 8, color: "amber" },
    { id: "smishing", icon: "📱", title: "SMS & Smishing", desc: "India-specific SMS scams: UPI, KYC, lottery fraud.", lessons: 6, color: "red" },
    { id: "vishing", icon: "📞", title: "Voice Phishing", desc: "Recognize fake bank calls and impersonation scams.", lessons: 5, color: "orange" },
    { id: "bec", icon: "💼", title: "Business Email Compromise", desc: "Protect your organization from CEO fraud and BEC.", lessons: 7, color: "purple" },
    { id: "deepfakes", icon: "🎭", title: "Deepfakes & AI Scams", desc: "Identify AI-generated voice and video manipulation.", lessons: 4, color: "blue" },
    { id: "passwords", icon: "🔑", title: "Password & Credential Hygiene", desc: "Build unbreakable password habits.", lessons: 5, color: "green" },
];

// ── Quiz component ────────────────────────────────────────────────────────────

function PhishingQuiz({ colors }) {
    const { setCursor, resetCursor } = useCursor();
    const [current, setCurrent] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [userAnswer, setUserAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useLocalStorage(STORAGE_KEYS.NOTIFICATIONS + "_quiz_streak", 0);
    const [finished, setFinished] = useState(false);

    const question = QUIZ_QUESTIONS[current];

    function handleAnswer(answer) {
        if (answered) return;
        setUserAnswer(answer);
        setAnswered(true);

        const correct = answer === question.isPhishing;
        if (correct) {
            setScore((s) => s + 1);
            setStreak((s) => s + 1);
        } else {
            setStreak(0);
        }
    }

    function handleNext() {
        if (current < QUIZ_QUESTIONS.length - 1) {
            setCurrent((c) => c + 1);
            setAnswered(false);
            setUserAnswer(null);
        } else {
            setFinished(true);
        }
    }

    function handleRestart() {
        setCurrent(0);
        setAnswered(false);
        setUserAnswer(null);
        setScore(0);
        setFinished(false);
    }

    if (finished) {
        const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: "40px 32px",
                    textAlign: "center",
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    style={{ fontSize: "3rem", marginBottom: 16 }}
                >
                    {pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "📚"}
                </motion.div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: colors.text, margin: "0 0 8px" }}>
                    {pct >= 80 ? "Excellent Work!" : pct >= 50 ? "Good Effort!" : "Keep Learning!"}
                </h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: colors.textSub, margin: "0 0 24px" }}>
                    You scored {score} out of {QUIZ_QUESTIONS.length} ({pct}%)
                </p>
                <Counter value={pct} suffix="%" fontSize="2.4rem" color={pct >= 80 ? colors.green : pct >= 50 ? colors.amber : colors.red} />
                <div style={{ marginTop: 28 }}>
                    <motion.button
                        onClick={handleRestart}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "RETRY")}
                        onMouseLeave={resetCursor}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                            padding: "12px 28px",
                            background: "var(--gradient-primary)",
                            border: "none",
                            borderRadius: 12,
                            color: "#fff",
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                        }}
                    >
                        Try Again
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            padding: "28px",
        }}>
            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.textMuted }}>
                    Question {current + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                    {QUIZ_QUESTIONS.map((_, i) => (
                        <div key={i} style={{
                            width: 20,
                            height: 3,
                            borderRadius: 999,
                            background: i <= current ? colors.accent : colors.bgSurface,
                            transition: "background 0.3s ease",
                        }} />
                    ))}
                </div>
                {streak > 0 && (
                    <Badge variant="amber" size="xs" icon="🔥">{streak} streak</Badge>
                )}
            </div>

            {/* Scenario */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 12,
                    }}>
                        <span style={{ fontSize: "1.1rem" }}>{question.scenario === "email" ? "📧" : "💬"}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.textMuted }}>
                            From: {question.from}
                        </span>
                    </div>

                    <div style={{
                        padding: "16px 18px",
                        background: colors.bgSurface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 12,
                        fontFamily: "var(--font-body)",
                        fontSize: "0.88rem",
                        color: colors.text,
                        lineHeight: 1.6,
                        marginBottom: 20,
                    }}>
                        {question.content}
                    </div>

                    {/* Answer buttons */}
                    {!answered ? (
                        <div style={{ display: "flex", gap: 12 }}>
                            <motion.button
                                onClick={() => handleAnswer(true)}
                                onMouseEnter={() => setCursor(CURSOR_STATES.THREAT, "PHISHING")}
                                onMouseLeave={resetCursor}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    flex: 1, padding: "14px",
                                    background: colors.redSoft, border: `1px solid ${colors.red}40`,
                                    borderRadius: 12, color: colors.red, fontFamily: "var(--font-body)",
                                    fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
                                }}
                            >
                                🚨 Phishing
                            </motion.button>
                            <motion.button
                                onClick={() => handleAnswer(false)}
                                onMouseEnter={() => setCursor(CURSOR_STATES.SAFE, "LEGITIMATE")}
                                onMouseLeave={resetCursor}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    flex: 1, padding: "14px",
                                    background: colors.greenSoft, border: `1px solid ${colors.green}40`,
                                    borderRadius: 12, color: colors.green, fontFamily: "var(--font-body)",
                                    fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
                                }}
                            >
                                ✅ Legitimate
                            </motion.button>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Result banner */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "12px 16px",
                                background: userAnswer === question.isPhishing ? colors.greenSoft : colors.redSoft,
                                border: `1px solid ${(userAnswer === question.isPhishing ? colors.green : colors.red)}30`,
                                borderRadius: 10,
                                marginBottom: 14,
                            }}>
                                <span style={{ fontSize: "1.1rem" }}>
                                    {userAnswer === question.isPhishing ? "✅" : "❌"}
                                </span>
                                <span style={{
                                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.84rem",
                                    color: userAnswer === question.isPhishing ? colors.green : colors.red,
                                }}>
                                    {userAnswer === question.isPhishing ? "Correct!" : "Not quite —"} This was {question.isPhishing ? "a phishing attempt" : "legitimate"}.
                                </span>
                            </div>

                            {/* Explanation */}
                            <p style={{
                                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                                color: colors.textSub, lineHeight: 1.6, margin: "0 0 14px",
                            }}>
                                {question.explanation}
                            </p>

                            {/* Red flags */}
                            {question.redFlags.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                                    {question.redFlags.map((flag) => (
                                        <Badge key={flag} variant="red" size="xs">{flag}</Badge>
                                    ))}
                                </div>
                            )}

                            <motion.button
                                onClick={handleNext}
                                onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "NEXT")}
                                onMouseLeave={resetCursor}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    width: "100%",
                                    padding: "13px",
                                    background: "var(--gradient-primary)",
                                    border: "none",
                                    borderRadius: 12,
                                    color: "#fff",
                                    fontFamily: "var(--font-accent)",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                    cursor: "pointer",
                                }}
                            >
                                {current < QUIZ_QUESTIONS.length - 1 ? "Next Question →" : "See Results"}
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// ── Module card ────────────────────────────────────────────────────────────────

function ModuleCard({ module, index, colors }) {
    const { setCursor, resetCursor } = useCursor();
    const color = colors[module.color] ?? colors.accent;
    const soft = colors[module.color + "Soft"] ?? colors.accentSoft;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 22 }}
            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "SOON")}
            onMouseLeave={resetCursor}
            whileHover={{ y: -3 }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                padding: 20,
                cursor: "pointer",
                opacity: 0.85,
            }}
        >
            <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: soft, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.3rem", marginBottom: 14,
            }}>
                {module.icon}
            </div>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", fontWeight: 700, color: colors.text, margin: "0 0 6px" }}>
                {module.title}
            </h4>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: colors.textSub, lineHeight: 1.5, margin: "0 0 14px" }}>
                {module.desc}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.textMuted }}>
                    {module.lessons} lessons
                </span>
                <Badge variant="muted" size="xs">Coming Soon</Badge>
            </div>
        </motion.div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Learn() {
    const { colors } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                padding: "100px 32px 60px",
                maxWidth: 1100,
                margin: "0 auto",
                minHeight: "100vh",
            }}
        >
            <SectionHead
                label="Security Awareness"
                title="Sentinel Learn"
                sub="Sharpen your instincts. Spot real-world phishing attempts before they spot you."
                center
            />

            {/* Quiz */}
            <div style={{ maxWidth: 560, margin: "40px auto 60px" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <Badge variant="amber" icon="🎯">Can You Spot The Fake?</Badge>
                </div>
                <PhishingQuiz colors={colors} />
            </div>

            {/* Learning modules */}
            <div style={{ marginBottom: 24, textAlign: "center" }}>
                <h2 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    color: colors.text,
                    margin: "0 0 8px",
                }}>
                    Learning Modules
                </h2>
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: colors.textMuted,
                    margin: 0,
                }}>
                    Structured courses launching soon — built on real attack patterns.
                </p>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 16,
            }}>
                {MODULES.map((m, i) => (
                    <ModuleCard key={m.id} module={m} index={i} colors={colors} />
                ))}
            </div>
        </motion.div>
    );
}