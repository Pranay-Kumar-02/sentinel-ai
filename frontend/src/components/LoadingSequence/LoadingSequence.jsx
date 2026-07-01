// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — LoadingSequence
// Cinematic boot sequence shown once on app initial load.
// Terminal-style system initialization with progress bar.
// Calls onComplete() when finished.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const BOOT_LINES = [
    { text: "Initializing Sentinel AI core...", delay: 0 },
    { text: "Loading threat intelligence engines...", delay: 250 },
    { text: "Connecting to OSINT data sources...", delay: 500 },
    { text: "Calibrating LLM reasoning model...", delay: 800 },
    { text: "Mapping MITRE ATT&CK framework...", delay: 1100 },
    { text: "Establishing secure connection...", delay: 1400 },
    { text: "Loading theme engine...", delay: 1650 },
    { text: "System ready.", delay: 1950 },
];

export default function LoadingSequence({ onComplete, minDuration = 2400 }) {
    const { colors, gradients } = useTheme();
    const [lines, setLines] = useState([]);
    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);
    const timersRef = useRef([]);

    useEffect(() => {
        // Schedule boot lines
        BOOT_LINES.forEach((line, i) => {
            const t = setTimeout(() => {
                setLines((prev) => [...prev, line.text]);
                setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
            }, line.delay);
            timersRef.current.push(t);
        });

        // Exit after min duration
        const exitTimer = setTimeout(() => {
            setExiting(true);
            const completeTimer = setTimeout(() => onComplete?.(), 600);
            timersRef.current.push(completeTimer);
        }, minDuration);
        timersRef.current.push(exitTimer);

        return () => timersRef.current.forEach(clearTimeout);
    }, [minDuration, onComplete]);

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 100000,
                        background: colors.bg,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 32,
                    }}
                >
                    {/* Ambient glow background */}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(ellipse at center, ${colors.accentSoft} 0%, transparent 60%)`,
                        pointerEvents: "none",
                    }} />

                    {/* Logo mark */}
                    <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 16 }}
                        style={{ position: "relative", zIndex: 2 }}
                    >
                        <motion.div
                            animate={{
                                boxShadow: [
                                    `0 0 30px ${colors.accentGlow}`,
                                    `0 0 60px ${colors.accentGlow}`,
                                    `0 0 30px ${colors.accentGlow}`,
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 20,
                                background: gradients.primary,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "2.2rem",
                                margin: "0 auto",
                            }}
                        >
                            🛡️
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            style={{
                                marginTop: 16,
                                fontFamily: "var(--font-accent)",
                                fontSize: "1.3rem",
                                fontWeight: 700,
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                textAlign: "center",
                                display: "inline-block",
                                background: "var(--gradient-accent)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            Sentinel AI
                        </motion.div>
                    </motion.div>

                    {/* Boot terminal */}
                    <div style={{
                        width: "min(420px, 86vw)",
                        position: "relative",
                        zIndex: 2,
                    }}>
                        <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.72rem",
                            minHeight: 140,
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                        }}>
                            <AnimatePresence initial={false}>
                                {lines.map((line, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            display: "flex",
                                            gap: 8,
                                            color: i === lines.length - 1 ? colors.accent : colors.textMuted,
                                        }}
                                    >
                                        <span style={{ color: colors.green, flexShrink: 0 }}>
                                            {i === lines.length - 1 && lines.length < BOOT_LINES.length ? "›" : "✓"}
                                        </span>
                                        <span>{line}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Progress bar */}
                        <div style={{
                            marginTop: 20,
                            height: 3,
                            background: colors.bgSurface,
                            borderRadius: 999,
                            overflow: "hidden",
                        }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{
                                    height: "100%",
                                    background: gradients.primary,
                                    borderRadius: 999,
                                    boxShadow: `0 0 12px ${colors.accentGlow}`,
                                }}
                            />
                        </div>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 8,
                        }}>
                            <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.6rem",
                                color: colors.textMuted,
                                letterSpacing: "0.08em",
                            }}>
                                BOOTING SYSTEM
                            </span>
                            <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.6rem",
                                color: colors.accent,
                            }}>
                                {progress}%
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}