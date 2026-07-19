// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Learn (Page) v2
// Merges the original "Spot the Fake" quiz (kept as-is, it was already
// excellent) with a new tiered lesson library — Newbie / Beginner /
// Intermediate / Experienced — across 11 topics, each escalating in depth
// rather than repeating content, each ending in a real link to the tool
// that topic maps to.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useLocalStorage, STORAGE_KEYS } from "../../hooks/useLocalStorage";
import { SectionHead } from "../../components/Common/Tooltip";
import { Badge } from "../../components/Common/Badge";
import Counter from "../../components/Common/Counter";
import { TIERS, TOPICS, getLearnProgress, getSelectedTier, setSelectedTier } from "./learnContent";
import TopicModal from "./TopicModal";

// ── Quiz data — "Can you spot the fake?" (UNCHANGED from original) ───────────

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

// ── Quiz component (UNCHANGED from original) ─────────────────────────────────

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

// ── Tier selector ──────────────────────────────────────────────────────────

function TierSelector({ tier, onChange, colors }) {
    return (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
            {TIERS.map((t) => (
                <motion.button
                    key={t.id}
                    onClick={() => onChange(t.id)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        padding: "14px 20px", borderRadius: 14, cursor: "pointer", minWidth: 130,
                        border: `2px solid ${tier === t.id ? colors.accent : colors.border}`,
                        background: tier === t.id ? colors.accentSoft : colors.bgCard,
                    }}
                >
                    <span style={{ fontSize: "1.4rem" }}>{t.icon}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.86rem", fontWeight: 800, color: tier === t.id ? colors.accent : colors.text }}>
                        {t.label}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: colors.textMuted, textAlign: "center" }}>
                        {t.desc}
                    </span>
                </motion.button>
            ))}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function Learn({ onNavigate }) {
    const { colors } = useTheme();
    const [tier, setTier] = useState(() => getSelectedTier());
    const [progress, setProgress] = useState({});
    const [activeTopic, setActiveTopic] = useState(null);

    useEffect(() => { setProgress(getLearnProgress()); }, []);

    function handleTierChange(newTier) {
        setTier(newTier);
        setSelectedTier(newTier);
    }

    const completedCount = useMemo(() => TOPICS.filter((t) => progress[t.id]?.completed).length, [progress]);
    const pct = Math.round((completedCount / TOPICS.length) * 100);

    const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
    const cardVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "100px 32px 60px", maxWidth: 1100, margin: "0 auto", minHeight: "100vh" }}
        >
            <SectionHead
                label="Security Awareness"
                title="Sentinel Learn"
                sub="Sharpen your instincts. Pick your level, and go as deep as you want on the threats you'll actually run into."
                center
            />

            {/* Tier selector */}
            <div style={{ marginTop: 32 }}>
                <TierSelector tier={tier} onChange={handleTierChange} colors={colors} />
            </div>

            {/* Progress bar */}
            <div style={{
                background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 14,
                padding: "16px 20px", marginBottom: 40, maxWidth: 560, margin: "0 auto 40px",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.84rem", fontWeight: 600, color: colors.text }}>
                        Your progress
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: colors.textMuted }}>
                        {completedCount} / {TOPICS.length} topics
                    </span>
                </div>
                <div style={{ height: 6, background: colors.bgSurface, borderRadius: 999, overflow: "hidden" }}>
                    <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{ height: "100%", background: colors.accent, boxShadow: `0 0 8px ${colors.accent}` }}
                    />
                </div>
            </div>

            {/* Quiz */}
            <div style={{ maxWidth: 560, margin: "0 auto 60px" }}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <Badge variant="amber" icon="🎯">Can You Spot The Fake?</Badge>
                </div>
                <PhishingQuiz colors={colors} />
            </div>

            {/* Topic library */}
            <div style={{ marginBottom: 24, textAlign: "center" }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: colors.text, margin: "0 0 8px" }}>
                    Topic Library
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: colors.textMuted, margin: 0 }}>
                    Each topic ends with a real tool you can try immediately.
                </p>
            </div>

            <motion.div
                variants={containerVariants} initial="hidden" animate="show"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}
            >
                {TOPICS.map((topic) => {
                    const done = progress[topic.id]?.completed;
                    return (
                        <motion.div
                            key={topic.id}
                            variants={cardVariants}
                            whileHover={{ y: -4, boxShadow: `0 10px 26px ${colors.accent}18` }}
                            onClick={() => setActiveTopic(topic)}
                            style={{
                                background: colors.bgCard, border: `1px solid ${done ? colors.green + "40" : colors.border}`,
                                borderRadius: 16, padding: "20px", cursor: "pointer", position: "relative",
                                transition: "box-shadow 0.25s ease",
                            }}
                        >
                            {done && (
                                <div style={{
                                    position: "absolute", top: 14, right: 14, width: 22, height: 22, borderRadius: "50%",
                                    background: colors.greenSoft, border: `1px solid ${colors.green}50`,
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: colors.green,
                                }}>
                                    ✓
                                </div>
                            )}
                            <div style={{ fontSize: "1.6rem", marginBottom: 12 }}>{topic.icon}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.96rem", fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                                {topic.title}
                            </div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: colors.textMuted, lineHeight: 1.5, minHeight: 40 }}>
                                {topic.summary}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            <AnimatePresence>
                {activeTopic && (
                    <TopicModal
                        topic={activeTopic}
                        tier={tier}
                        onTierChange={handleTierChange}
                        colors={colors}
                        onClose={() => setActiveTopic(null)}
                        onNavigate={onNavigate}
                        onComplete={() => setProgress(getLearnProgress())}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}