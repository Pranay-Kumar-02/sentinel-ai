// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — CopilotOrb
// The floating trigger button for AI Copilot.
// Premium glassmorphism orb with pulse rings, glow, and state animations.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function CopilotOrb({ isOpen, onClick }) {
    const { colors } = useTheme();
    const [hovered, setHovered] = useState(false);
    const [pulse, setPulse] = useState(false);

    // Pulse every 8s to draw attention when closed
    useEffect(() => {
        if (isOpen) return;
        const interval = setInterval(() => {
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);
        }, 8000);
        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileTap={{ scale: 0.92 }}
            style={{
                position: "relative",
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isOpen
                    ? `linear-gradient(135deg, ${colors.purple} 0%, ${colors.accent} 100%)`
                    : `linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)`,
                boxShadow: isOpen
                    ? `0 0 0 1px ${colors.purple}60, 0 8px 32px ${colors.purple}60, 0 0 60px ${colors.purple}30`
                    : hovered
                        ? `0 0 0 1px ${colors.purple}40, 0 8px 32px ${colors.purple}50, 0 0 40px ${colors.purple}25`
                        : `0 0 0 1px ${colors.purple}30, 0 4px 20px ${colors.purple}40`,
                transition: "box-shadow 0.3s ease, background 0.3s ease",
                zIndex: 2,
            }}
        >
            {/* Pulse rings when attention needed */}
            {(pulse || hovered) && !isOpen && (
                <>
                    {[1, 2].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            transition={{ duration: 1.5, delay: i * 0.3, ease: "easeOut" }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50%",
                                border: `1px solid ${colors.purple}`,
                                pointerEvents: "none",
                            }}
                        />
                    ))}
                </>
            )}

            {/* Rotating ring when open */}
            {isOpen && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    style={{
                        position: "absolute",
                        inset: -3,
                        borderRadius: "50%",
                        border: `1.5px dashed ${colors.purple}60`,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Icon */}
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: "#fff", fontSize: "1.1rem", lineHeight: 1 }}
                    >
                        ✕
                    </motion.div>
                ) : (
                    <motion.div
                        key="open"
                        initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                        transition={{ duration: 0.2 }}
                        style={{ fontSize: "1.4rem", lineHeight: 1 }}
                    >
                        🤖
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 8, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 8, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "absolute",
                            right: "calc(100% + 12px)",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: colors.bgCard,
                            backdropFilter: "blur(20px)",
                            border: `1px solid ${colors.purple}40`,
                            borderRadius: 10,
                            padding: "8px 14px",
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
                        }}
                    >
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", fontWeight: 600, color: colors.text, marginBottom: 2 }}>
                            AI Copilot
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: colors.textMuted }}>
                            Ctrl+Shift+A
                        </div>
                        {/* Arrow */}
                        <div style={{
                            position: "absolute",
                            right: -5,
                            top: "50%",
                            transform: "translateY(-50%) rotate(45deg)",
                            width: 8,
                            height: 8,
                            background: colors.bgCard,
                            border: `1px solid ${colors.purple}40`,
                            borderLeft: "none",
                            borderBottom: "none",
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}