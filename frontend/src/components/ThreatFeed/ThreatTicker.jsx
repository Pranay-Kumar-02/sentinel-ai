// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatTicker
// Horizontal auto-scrolling ticker of live threat items.
// Like a news ticker but for cyber threats.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import { truncate, countryFlag } from "../../utils/helpers";

const SEVERITY_COLORS = {
    CRITICAL: "red",
    HIGH: "orange",
    MEDIUM: "amber",
    LOW: "blue",
};

export default function ThreatTicker({ height = 36 }) {
    const { colors } = useTheme();
    const { feed } = useThreatFeed({ maxItems: 20, intervalMs: 4000 });

    const items = feed.length > 0 ? [...feed, ...feed] : []; // duplicate for seamless loop

    if (items.length === 0) return null;

    return (
        <div style={{
            height,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            borderTop: `1px solid ${colors.border}`,
            borderBottom: `1px solid ${colors.border}`,
            background: colors.bgMid,
            position: "relative",
        }}>
            {/* Left fade */}
            <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 60,
                background: `linear-gradient(90deg, ${colors.bgMid}, transparent)`,
                zIndex: 2,
                pointerEvents: "none",
            }} />

            {/* Label */}
            <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                background: colors.bgSurface,
                borderRight: `1px solid ${colors.border}`,
                zIndex: 3,
                gap: 6,
                flexShrink: 0,
            }}>
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: colors.red,
                        boxShadow: `0 0 6px ${colors.redGlow}`,
                    }}
                />
                <span style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    color: colors.red,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                }}>
                    LIVE
                </span>
            </div>

            {/* Scrolling content */}
            <div style={{ overflow: "hidden", flex: 1, paddingLeft: 80 }}>
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: feed.length * 4,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 32,
                        whiteSpace: "nowrap",
                    }}
                >
                    {items.map((item, i) => {
                        const colorKey = SEVERITY_COLORS[item.severity] ?? "blue";
                        const color = colors[colorKey];
                        return (
                            <div
                                key={`${item.id}-${i}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    flexShrink: 0,
                                }}
                            >
                                <div style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: color,
                                    boxShadow: `0 0 4px ${color}`,
                                    flexShrink: 0,
                                }} />
                                <span style={{
                                    fontSize: "0.7rem",
                                    fontFamily: "var(--font-mono)",
                                    color: colors.textSub,
                                }}>
                                    {countryFlag(item.country)}
                                </span>
                                <span style={{
                                    fontSize: "0.7rem",
                                    fontFamily: "var(--font-body)",
                                    fontWeight: 500,
                                    color: colors.text,
                                }}>
                                    {item.type}
                                </span>
                                <span style={{
                                    fontSize: "0.68rem",
                                    fontFamily: "var(--font-mono)",
                                    color,
                                }}>
                                    {truncate(item.domain, 28)}
                                </span>
                                <span style={{
                                    fontSize: "0.6rem",
                                    color: colors.textDim,
                                    fontFamily: "var(--font-mono)",
                                }}>
                                    /{item.mitre}
                                </span>

                                {/* Separator */}
                                <span style={{ color: colors.textDim, marginLeft: 8 }}>◆</span>
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Right fade */}
            <div style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: 60,
                background: `linear-gradient(270deg, ${colors.bgMid}, transparent)`,
                zIndex: 2,
                pointerEvents: "none",
            }} />
        </div>
    );
}