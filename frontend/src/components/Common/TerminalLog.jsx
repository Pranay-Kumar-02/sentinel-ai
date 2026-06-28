// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — TerminalLog
// Live scrolling terminal log. Animates each line in.
// Used during scan analysis to show processing steps.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const LOG_COLORS = {
    info: null,       // uses textSub
    success: "green",
    warn: "amber",
    error: "red",
    data: "blue",
    ai: "purple",
};

export default function TerminalLog({
    logs = [],      // [{ id, text, type, timestamp }]
    maxHeight = 280,
    showHeader = true,
    title = "SENTINEL ENGINE",
    style = {},
}) {
    const { colors } = useTheme();
    const bodyRef = useRef(null);

    // Auto-scroll to bottom on new logs
    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [logs]);

    function getLineColor(type) {
        const key = LOG_COLORS[type];
        if (!key) return colors.textSub;
        return colors[key] ?? colors.textSub;
    }

    return (
        <div
            style={{
                background: "rgba(0,0,0,0.55)",
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                overflow: "hidden",
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                ...style,
            }}
        >
            {/* Header */}
            {showHeader && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderBottom: `1px solid ${colors.border}`,
                    background: colors.bgSurface,
                }}>
                    {/* Traffic lights */}
                    <div style={{ display: "flex", gap: 5 }}>
                        {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, i) => (
                            <div key={i} style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: c,
                            }} />
                        ))}
                    </div>
                    <span style={{
                        color: colors.textMuted,
                        fontSize: "0.68rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginLeft: 4,
                    }}>
                        {title}
                    </span>
                    {/* Live dot */}
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                        <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: logs.length > 0 ? colors.green : colors.textMuted,
                            }}
                        />
                        <span style={{ color: colors.textMuted, fontSize: "0.62rem" }}>
                            {logs.length > 0 ? "ACTIVE" : "IDLE"}
                        </span>
                    </div>
                </div>
            )}

            {/* Log body */}
            <div
                ref={bodyRef}
                style={{
                    padding: "14px 16px",
                    maxHeight,
                    overflowY: "auto",
                    lineHeight: 1.7,
                    scrollbarWidth: "none",
                }}
            >
                {logs.length === 0 ? (
                    <div style={{ color: colors.textDim, fontStyle: "italic" }}>
                        Awaiting input...
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -8, filter: "blur(4px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "flex-start",
                                    marginBottom: 2,
                                }}
                            >
                                {/* Prompt */}
                                <span style={{ color: colors.accent, flexShrink: 0, userSelect: "none" }}>
                                    ›
                                </span>
                                {/* Text */}
                                <span style={{ color: getLineColor(log.type), flex: 1 }}>
                                    {log.text}
                                    {/* Typewriter cursor on last item */}
                                    {log === logs[logs.length - 1] && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "steps(1)" }}
                                            style={{ color: colors.accent, marginLeft: 2 }}
                                        >
                                            ▊
                                        </motion.span>
                                    )}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}