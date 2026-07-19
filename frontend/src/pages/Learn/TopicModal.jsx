// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — TopicModal
// Shows lesson content at the CURRENTLY SELECTED tier depth, with a quiz
// filtered to that tier's difficulty ceiling. Tier can be switched mid-
// lesson without losing your place.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TIERS, questionsForTier, markTopicComplete } from "./learnContent";

export default function TopicModal({ topic, tier, onTierChange, colors, onClose, onNavigate, onComplete }) {
    const [phase, setPhase] = useState("read");
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const quiz = useMemo(() => questionsForTier(topic.quiz, tier), [topic, tier]);
    const tierMeta = TIERS.find((t) => t.id === tier);
    const isNewbie = tier === "newbie";

    function selectAnswer(qIndex, optIndex) {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
    }

    const score = quiz.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const allAnswered = quiz.every((_, i) => answers[i] !== undefined);

    function submitQuiz() {
        setSubmitted(true);
        markTopicComplete(topic.id, tier, score, quiz.length);
        onComplete?.();
        setTimeout(() => setPhase("results"), 400);
    }

    function resetForNewTier(newTier) {
        onTierChange(newTier);
        setPhase("read");
        setAnswers({});
        setSubmitted(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 5000,
                background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: 640, maxHeight: "85vh", overflowY: "auto",
                    background: colors.bgCard, border: `1px solid ${colors.border}`,
                    borderRadius: 20, padding: 28,
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: "1.8rem" }}>{topic.icon}</span>
                        <div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, color: colors.text }}>
                                {topic.title}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: colors.textMuted, padding: 4 }}>✕</button>
                </div>

                {/* Tier switcher — change depth without leaving the lesson */}
                <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
                    {TIERS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => resetForNewTier(t.id)}
                            style={{
                                padding: "6px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700,
                                fontFamily: "var(--font-accent)", cursor: "pointer",
                                border: `1.5px solid ${tier === t.id ? colors.accent : colors.border}`,
                                background: tier === t.id ? colors.accentSoft : "transparent",
                                color: tier === t.id ? colors.accent : colors.textMuted,
                            }}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ── Reading phase ────────────────────────────────── */}
                    {phase === "read" && (
                        <motion.div key={"read-" + tier} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {isNewbie ? (
                                <div style={{ marginBottom: 26 }}>
                                    <div style={{
                                        background: colors.accentSoft, border: `1px solid ${colors.accent}30`,
                                        borderRadius: 14, padding: 18, marginBottom: 14, fontFamily: "var(--font-body)",
                                        fontSize: "0.95rem", color: colors.text, lineHeight: 1.7, fontStyle: "italic",
                                    }}>
                                        {topic.content.newbie.hook}
                                    </div>
                                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: colors.textSub, lineHeight: 1.7, marginBottom: 14 }}>
                                        {topic.content.newbie.body}
                                    </p>
                                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", background: colors.greenSoft, border: `1px solid ${colors.green}30`, borderRadius: 10 }}>
                                        <span style={{ color: colors.green }}>→</span>
                                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: colors.text, fontWeight: 600 }}>
                                            {topic.content.newbie.action}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 26 }}>
                                    {topic.content[tier].sections.map((s, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                                            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", fontWeight: 700, color: colors.accent, marginBottom: 6 }}>
                                                {s.heading}
                                            </div>
                                            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", color: colors.textSub, lineHeight: 1.7 }}>
                                                {s.body}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                            <motion.button
                                onClick={() => setPhase("quiz")}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                style={{
                                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                                    background: colors.accent, color: colors.bg,
                                    fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
                                }}
                            >
                                Take the Quiz ({quiz.length} question{quiz.length !== 1 ? "s" : ""})
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── Quiz phase ───────────────────────────────────── */}
                    {phase === "quiz" && (
                        <motion.div key={"quiz-" + tier} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 22 }}>
                                {quiz.map((q, qi) => (
                                    <div key={qi}>
                                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                                            {qi + 1}. {q.question}
                                        </div>
                                        {isNewbie && q.hint && !submitted && (
                                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.textMuted, marginBottom: 8, fontStyle: "italic" }}>
                                                💡 {q.hint}
                                            </div>
                                        )}
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                                            {q.options.map((opt, oi) => {
                                                const isSelected = answers[qi] === oi;
                                                const isCorrect = oi === q.correctIndex;
                                                let bg = colors.bgSurface, border = colors.border;
                                                if (submitted) {
                                                    if (isCorrect) { bg = colors.greenSoft; border = colors.green; }
                                                    else if (isSelected && !isCorrect) { bg = colors.redSoft; border = colors.red; }
                                                } else if (isSelected) { bg = colors.accentSoft; border = colors.accent; }
                                                return (
                                                    <button
                                                        key={oi}
                                                        onClick={() => selectAnswer(qi, oi)}
                                                        disabled={submitted}
                                                        style={{
                                                            textAlign: "left", padding: "10px 14px", borderRadius: 10,
                                                            border: `1.5px solid ${border}`, background: bg,
                                                            color: colors.text, fontFamily: "var(--font-body)", fontSize: "0.86rem",
                                                            cursor: submitted ? "default" : "pointer",
                                                        }}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {submitted && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.textMuted, marginTop: 8, lineHeight: 1.5 }}>
                                                {q.explain}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!submitted ? (
                                <motion.button
                                    onClick={submitQuiz}
                                    disabled={!allAnswered}
                                    whileHover={{ scale: allAnswered ? 1.02 : 1 }}
                                    style={{
                                        width: "100%", padding: "14px", borderRadius: 12, border: "none",
                                        background: allAnswered ? colors.accent : colors.bgSurface,
                                        color: allAnswered ? colors.bg : colors.textMuted,
                                        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem",
                                        cursor: allAnswered ? "pointer" : "not-allowed",
                                    }}
                                >
                                    Check My Answers
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={() => setPhase("results")}
                                    whileHover={{ scale: 1.02 }}
                                    style={{
                                        width: "100%", padding: "14px", borderRadius: 12, border: "none",
                                        background: colors.accent, color: colors.bg,
                                        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
                                    }}
                                >
                                    Continue →
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {/* ── Results phase ────────────────────────────────── */}
                    {phase === "results" && (
                        <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: "2.4rem", marginBottom: 10 }}>
                                {score === quiz.length ? "🏆" : score > 0 ? "👍" : "📘"}
                            </div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800, color: colors.text, marginBottom: 6 }}>
                                {score} / {quiz.length} correct
                            </div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: colors.textMuted, marginBottom: 24 }}>
                                {tierMeta.label} level — nice work.
                            </div>

                            {topic.tool && (
                                <div style={{ background: colors.accentSoft, border: `1px solid ${colors.accent}30`, borderRadius: 14, padding: "18px", marginBottom: 16 }}>
                                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: colors.textSub, marginBottom: 12 }}>
                                        Ready to see this in action?
                                    </div>
                                    <motion.button
                                        onClick={() => { onClose(); onNavigate?.(topic.tool.path); }}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        style={{
                                            width: "100%", padding: "12px", borderRadius: 10, border: "none",
                                            background: colors.accent, color: colors.bg,
                                            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer",
                                        }}
                                    >
                                        Try {topic.tool.name} →
                                    </motion.button>
                                </div>
                            )}

                            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: colors.textMuted, textDecoration: "underline" }}>
                                Back to Learn
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}