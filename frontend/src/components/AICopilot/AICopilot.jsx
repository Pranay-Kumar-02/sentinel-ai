import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import CopilotOrb from "./CopilotOrb";
import CopilotPanel from "./CopilotPanel";
import { useKeyboard } from "../../hooks/useKeyboard";

export default function AICopilot({ scanResult, emailResult, forensicsResult }) {
    const [isOpen, setIsOpen] = useState(false);
    const { accent, purple } = useTheme();

    // Keyboard shortcut Ctrl+Shift+A
    useKeyboard({
        "ctrl+shift+a": () => setIsOpen((o) => !o),
    });

    // Close on Escape
    useKeyboard({
        "esc": () => { if (isOpen) setIsOpen(false); },
    });

    return (
        <div
            style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                zIndex: 5000,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 12,
                pointerEvents: "none",
            }}
        >
            {/* Panel */}
            <div style={{ pointerEvents: "auto" }}>
                <AnimatePresence>
                    {isOpen && (
                        <CopilotPanel
                            isOpen={isOpen}
                            scanResult={scanResult}
                            emailResult={emailResult}
                            forensicsResult={forensicsResult}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Orb */}
            <div style={{ pointerEvents: "auto" }}>
                <CopilotOrb
                    isOpen={isOpen}
                    onClick={() => setIsOpen((o) => !o)}
                />
            </div>

            {/* Keyboard hint */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="text-[9px] font-mono text-center"
                        style={{
                            color: "rgba(255,255,255,0.2)",
                            pointerEvents: "none",
                            letterSpacing: "0.1em",
                        }}
                    >
                        Ctrl+Shift+A
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}