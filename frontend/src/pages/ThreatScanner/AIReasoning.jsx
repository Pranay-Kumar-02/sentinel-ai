// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — AIReasoning
// AI explanation with typewriter reveal effect. Purple AI icon pulses
// as text appears. The "why" behind the verdict, in plain language.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { formatAttackType } from "../../utils/formatters";
import { Badge } from "../../components/Common/Badge";

export default function AIReasoning({ result, autoType = true, speed = 12 }) {
    const { colors } = useTheme();
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const indexRef = useRef(0);
    const timerRef = useRef(null);

    if (!result) return null;

    const llm = result.llm_analysis ?? result;
    const explanation = llm.explanation ?? llm.reasoning ?? "";
    const attackType = llm.attack_type ?? null;
    const indicators = llm.key_indicators ?? llm.red_flags ?? [];

    // Typewriter effect
    useEffect(() => {
        if (!explanation) return;

        if (!autoType) {
            setDisplayedText(explanation);
            setIsTyping(false);
            return;
        }

        indexRef.current = 0;
        setDisplayedText("");
        setIsTyping(true);

        function tick() {
            if (indexRef.current < explanation.length) {
                // Type in chunks of 2-3 chars for natural feel
                const chunkSize = Math.min(3, explanation.length - indexRef.current);
                indexRef.current += chunkSize;
                setDisplayedText(explanation.slice(0, indexRef.current));
                timerRef.current = setTimeout(tick, speed);
            } else {
                setIsTyping(false);
            }
        }
        timerRef.current = setTimeout(tick, speed);

        return () => clearTimeout(timerRef.current);
    }, [explanation, autoType, speed]);

    if (!explanation) {
        return (
            <div style={{
                padding: "24px",
                textAlign: "center",
                color: colors.textDim,
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
            }}>
                No AI reasoning available for this scan
            </div>
        );
    }

    return (
        <div>
            {/* AI header with pulsing icon */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
            }}>
                <motion.div
                    animate={isTyping ? {
                        scale: [1, 1.15, 1],
                        boxShadow: [
                            `0 0 0 0 ${colors.purpleSoft}`,
                            `0 0 0 8px ${colors.purpleSoft}`,
                            `0 0 0 0 ${colors.purpleSoft}`,
                        ],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: colors.purpleSoft,
                        border: `1px solid ${colors.purple}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        flexShrink: 0,
                    }}
                >
                    🤖
                </motion.div>
                <div>
                    <div style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: colors.text,
                    }}>
                        Sentinel AI Analysis
                    </div>
                    <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: isTyping ? colors.purple : colors.textMuted,
                    }}>
                        {isTyping ? "Generating reasoning..." : "Analysis complete"}
                    </div>
                </div>
            </div>

            {/* Explanation text with typewriter */}
            <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.86rem",
                color: colors.textSub,
                lineHeight: 1.8,
                borderLeft: `3px solid ${colors.purple}`,
                paddingLeft: 16,
                minHeight: 60,
            }}>
                {displayedText}
                {isTyping && (
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, ease: "steps(1)" }}
                        style={{ color: colors.purple, marginLeft: 2 }}
                    >
                        ▊
                    </motion.span>
                )}
            </div>

            {/* Attack type badge */}
            {attackType && !isTyping && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 14 }}
                >
                    <Badge variant="purple" icon="⚡">{formatAttackType(attackType)}</Badge>
                </motion.div>
            )}

            {/* Key indicators */}
            {indicators.length > 0 && !isTyping && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginTop: 16 }}
                >
                    <div style={{
                        fontFamily: "var(--font-accent)",
                        fontSize: "0.62rem",
                        color: colors.textMuted,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 8,
                    }}>
                        Key Indicators
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {indicators.map((ind, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    fontSize: "0.78rem",
                                    color: colors.textSub,
                                    fontFamily: "var(--font-body)",
                                    alignItems: "flex-start",
                                }}
                            >
                                <span style={{ color: colors.purple, flexShrink: 0 }}>◆</span>
                                {ind}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}