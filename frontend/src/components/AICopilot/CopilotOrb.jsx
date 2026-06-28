import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Sparkles, X } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { springs, loops } from "../../animations/spring";

export default function CopilotOrb({ isOpen, onClick }) {
    const { accent, accentGlow, purple, purpleGlow, bgCard, border } = useTheme();
    const [hovered, setHovered] = useState(false);

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            transition={springs.bouncy}
            className="relative flex items-center justify-center"
            style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${purple} 0%, ${accent} 100%)`,
                boxShadow: hovered
                    ? `0 0 40px ${purpleGlow}, 0 0 80px ${accentGlow}, 0 8px 32px rgba(0,0,0,0.4)`
                    : `0 0 24px ${purpleGlow}, 0 4px 20px rgba(0,0,0,0.3)`,
                border: `1px solid rgba(255,255,255,0.15)`,
                cursor: "pointer",
            }}
            aria-label="Toggle AI Copilot"
        >
            {/* Pulse rings */}
            {!isOpen && (
                <>
                    {[1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                inset: -i * 10,
                                border: `1px solid ${purple}`,
                                opacity: 0,
                            }}
                            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                delay: i * 0.7,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </>
            )}

            {/* Rotating ring */}
            <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                    inset: -3,
                    border: `1px dashed rgba(255,255,255,0.2)`,
                    borderRadius: "50%",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Icon */}
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="close"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={springs.snappy}
                    >
                        <X size={20} color="white" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="ai"
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -90 }}
                        transition={springs.snappy}
                        className="relative"
                    >
                        <Cpu size={20} color="white" />
                        {/* Sparkle dot */}
                        <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                            style={{ background: accent }}
                            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover label */}
            <AnimatePresence>
                {hovered && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 8, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 8, scale: 0.9 }}
                        transition={springs.crisp}
                        className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold pointer-events-none"
                        style={{
                            background: bgCard,
                            border: `1px solid ${border}`,
                            color: "white",
                            backdropFilter: "blur(12px)",
                            boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                        }}
                    >
                        AI Copilot
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}