// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — LiveFeed
// Full threat feed panel. Header with live stats, severity filters,
// scrollable animated list of ThreatItems.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import ThreatItem from "./ThreatItem";

const FILTERS = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function LiveFeed({
    maxHeight = 480,
    maxItems = 30,
    compact = false,
    showHeader = true,
    style = {},
}) {
    const { colors } = useTheme();
    const [filter, setFilter] = useState("ALL");

    const { feed, stats, isLive, isPaused, pause, resume, clearFeed } = useThreatFeed({
        maxItems,
        intervalMs: 3200,
    });

    const filtered = filter === "ALL"
        ? feed
        : feed.filter((f) => f.severity === filter);

    const filterColors = {
        ALL: colors.accent,
        CRITICAL: colors.red,
        HIGH: colors.orange,
        MEDIUM: colors.amber,
        LOW: colors.blue,
    };

    return (
        <div
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                ...style,
            }}
        >
            {/* Header */}
            {showHeader && (
                <div style={{
                    padding: "14px 18px",
                    borderBottom: `1px solid ${colors.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Live indicator */}
                        <div style={{ position: "relative" }}>
                            <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: isLive && !isPaused ? colors.green : colors.textMuted,
                            }} />
                            {isLive && !isPaused && (
                                <motion.div
                                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        background: colors.green,
                                    }}
                                />
                            )}
                        </div>

                        <span style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            color: colors.text,
                        }}>
                            Live Threat Feed
                        </span>

                        {/* Stats pills */}
                        <div style={{ display: "flex", gap: 6 }}>
                            {[
                                { label: "CRIT", value: stats.critical, color: colors.red },
                                { label: "HIGH", value: stats.high, color: colors.orange },
                            ].map((s) => (
                                <span
                                    key={s.label}
                                    style={{
                                        fontSize: "0.6rem",
                                        fontFamily: "var(--font-accent)",
                                        color: s.color,
                                        background: `${s.color}15`,
                                        border: `1px solid ${s.color}30`,
                                        padding: "1px 6px",
                                        borderRadius: 4,
                                        fontWeight: 700,
                                    }}
                                >
                                    {s.value} {s.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", gap: 6 }}>
                        <motion.button
                            onClick={isPaused ? resume : pause}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: "4px 10px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                color: colors.textSub,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {isPaused ? "▶ Resume" : "⏸ Pause"}
                        </motion.button>

                        <motion.button
                            onClick={clearFeed}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: "4px 10px",
                                background: "transparent",
                                border: `1px solid ${colors.border}`,
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                color: colors.textMuted,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            Clear
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Severity filters */}
            <div style={{
                display: "flex",
                gap: 4,
                padding: "10px 14px",
                borderBottom: `1px solid ${colors.border}`,
                flexShrink: 0,
                overflowX: "auto",
                scrollbarWidth: "none",
            }}>
                {FILTERS.map((f) => (
                    <motion.button
                        key={f}
                        onClick={() => setFilter(f)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: `1px solid ${filter === f ? filterColors[f] + "50" : colors.border}`,
                            background: filter === f ? `${filterColors[f]}15` : "transparent",
                            cursor: "pointer",
                            fontSize: "0.68rem",
                            fontFamily: "var(--font-accent)",
                            fontWeight: 600,
                            color: filter === f ? filterColors[f] : colors.textMuted,
                            letterSpacing: "0.06em",
                            whiteSpace: "nowrap",
                            transition: "all 0.15s ease",
                        }}
                    >
                        {f}
                        {f !== "ALL" && (
                            <span style={{ marginLeft: 4, opacity: 0.7 }}>
                                {stats[f.toLowerCase()] ?? 0}
                            </span>
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Feed list */}
            <div style={{
                overflowY: "auto",
                maxHeight,
                flex: 1,
                scrollbarWidth: "none",
            }}>
                {filtered.length === 0 ? (
                    <div style={{
                        padding: "40px 20px",
                        textAlign: "center",
                        color: colors.textDim,
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                    }}>
                        {isPaused ? "Feed paused" : "Awaiting threats..."}
                    </div>
                ) : (
                    <AnimatePresence initial={false} mode="popLayout">
                        {filtered.map((item) => (
                            <ThreatItem
                                key={item.id}
                                item={item}
                                compact={compact}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer */}
            <div style={{
                padding: "8px 16px",
                borderTop: `1px solid ${colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
            }}>
                <span style={{
                    fontSize: "0.65rem",
                    color: colors.textMuted,
                    fontFamily: "var(--font-mono)",
                }}>
                    {stats.total} total threats detected
                </span>
                <motion.div
                    animate={{ opacity: isLive && !isPaused ? [1, 0.4, 1] : 0.4 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                        fontSize: "0.6rem",
                        color: isLive && !isPaused ? colors.green : colors.textMuted,
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {isLive && !isPaused ? "● STREAMING" : "○ PAUSED"}
                </motion.div>
            </div>
        </div>
    );
}