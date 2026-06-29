// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatItem
// Single item in the live threat feed. Animated entrance, severity color,
// MITRE technique, IOC display, hover expand.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { timeAgo, truncate } from "../../utils/helpers";
import { countryFlag, formatSeverity, formatMitreTechnique } from "../../utils/formatters";

const SEVERITY_COLORS = {
    CRITICAL: "red",
    HIGH: "orange",
    MEDIUM: "amber",
    LOW: "blue",
};

export default function ThreatItem({ item, compact = false }) {
    const { colors } = useTheme();
    const [expanded, setExpanded] = useState(false);

    const colorKey = SEVERITY_COLORS[item.severity] ?? "blue";
    const color = colors[colorKey];
    const glowColor = colors[colorKey + "Glow"];
    const softColor = colors[colorKey + "Soft"];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -16, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 16, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => !compact && setExpanded((v) => !v)}
            style={{
                padding: compact ? "8px 14px" : "12px 16px",
                borderBottom: `1px solid ${colors.border}`,
                cursor: compact ? "default" : "pointer",
                background: item.isNew ? `${softColor}` : "transparent",
                transition: "background 0.3s ease",
                position: "relative",
                overflow: "hidden",
            }}
            onMouseEnter={(e) => {
                if (!compact) e.currentTarget.style.background = colors.accentSoft;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = item.isNew ? softColor : "transparent";
            }}
        >
            {/* New item flash */}
            {item.isNew && (
                <motion.div
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `${softColor}`,
                        pointerEvents: "none",
                    }}
                />
            )}

            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", position: "relative" }}>
                {/* Severity dot */}
                <div style={{ paddingTop: 4, flexShrink: 0 }}>
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: color,
                            boxShadow: `0 0 6px ${glowColor}`,
                        }} />
                        {item.severity === "CRITICAL" && (
                            <motion.div
                                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    borderRadius: "50%",
                                    background: color,
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        {/* Threat type */}
                        <span style={{
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: colors.text,
                            fontFamily: "var(--font-body)",
                        }}>
                            {item.type}
                        </span>

                        {/* Severity badge */}
                        <span style={{
                            fontSize: "0.58rem",
                            fontFamily: "var(--font-accent)",
                            fontWeight: 700,
                            color,
                            background: softColor,
                            border: `1px solid ${color}30`,
                            padding: "1px 5px",
                            borderRadius: 3,
                            letterSpacing: "0.06em",
                        }}>
                            {formatSeverity(item.severity)}
                        </span>

                        {/* Country flag */}
                        <span style={{ fontSize: "0.75rem" }}>{countryFlag(item.country)}</span>

                        {/* Time */}
                        <span style={{
                            marginLeft: "auto",
                            fontSize: "0.62rem",
                            color: colors.textMuted,
                            fontFamily: "var(--font-mono)",
                            flexShrink: 0,
                        }}>
                            {timeAgo(item.timestamp)}
                        </span>
                    </div>

                    {/* IOC */}
                    <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        color: color,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: compact ? 0 : 3,
                    }}>
                        {truncate(item.ioc, 45)}
                    </div>

                    {/* Compact hides details */}
                    {!compact && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{
                                fontSize: "0.65rem",
                                color: colors.textMuted,
                                fontFamily: "var(--font-mono)",
                            }}>
                                {item.sector}
                            </span>
                            <span style={{ color: colors.textDim }}>·</span>
                            <span style={{
                                fontSize: "0.65rem",
                                color: colors.purple,
                                fontFamily: "var(--font-mono)",
                            }}>
                                {formatMitreTechnique(item.mitre)}
                            </span>
                            <span style={{ color: colors.textDim }}>·</span>
                            <span style={{
                                fontSize: "0.65rem",
                                color: colors.textMuted,
                                fontFamily: "var(--font-mono)",
                            }}>
                                {item.confidence}% conf
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded details */}
            {!compact && (
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                overflow: "hidden",
                                marginTop: 10,
                                paddingTop: 10,
                                borderTop: `1px solid ${colors.border}`,
                                display: "flex",
                                gap: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            {[
                                { label: "Source", value: item.source },
                                { label: "IP", value: item.ip },
                                { label: "Domain", value: item.domain },
                                { label: "MITRE", value: item.mitre },
                                { label: "Sector", value: item.sector },
                                { label: "Confidence", value: `${item.confidence}%` },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <div style={{ fontSize: "0.6rem", color: colors.textMuted, fontFamily: "var(--font-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: "0.72rem", color: colors.text, fontFamily: "var(--font-mono)" }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </motion.div>
    );
}