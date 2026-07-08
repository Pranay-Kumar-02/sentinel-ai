import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import CopilotOrb from "./CopilotOrb";
import CopilotPanel from "./CopilotPanel";
import { useKeyboard } from "../../hooks/useKeyboard";

export default function AICopilot({ isOpen: externalOpen, onToggle, onClose, currentPath, scanResult, emailResult, forensicsResult }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const toggle = onToggle ?? (() => setInternalOpen(o => !o));
    const close = onClose ?? (() => setInternalOpen(false));

    useKeyboard({ "ctrl+shift+a": toggle });
    useKeyboard({ "esc": () => { if (isOpen) close(); } });

    return (
        <div style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 5000,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
            pointerEvents: "none",
        }}>
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

            <div style={{ pointerEvents: "auto" }}>
                <CopilotOrb isOpen={isOpen} onClick={toggle} />
            </div>
        </div>
    );
}