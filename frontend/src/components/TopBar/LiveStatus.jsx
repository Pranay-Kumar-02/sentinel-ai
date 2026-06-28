// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — LiveStatus
// Live threat counters, engine status, and scan rate in the top bar
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

function AnimatedCounter({ value, color }) {
    const [display, setDisplay] = useState(value);
    const prevRef = useRef(value);

    useEffect(() => {
        const from = prevRef.current;
        const to = value;
        if (from === to) return;

        const diff = to - from;
        const steps = Math.min(Math.abs(diff), 20);
        const stepSize = diff / steps;
        let current = from;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            current += stepSize;
            setDisplay(Math.round(current));
            if (step >= steps) {
                setDisplay(to);
                clearInterval(interval);
            }
        }, 40);

        prevRef.current = to;
        return () => clearInterval(interval);
    }, [value]);

    return (
        <motion.span
            key={display}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
                fontFamily: "var(--font-accent)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color,
            }}
        >
            {display.toLocaleString()}
        </motion.span>
    );
}

export default function LiveStatus() {
    const { colors } = useTheme();

    const [stats, setStats] = useState({
        scansToday: 0,
        threatsLive: 0,
        criticalNow: 0,
        scanRate: 0,
    });

    // Simulate live incrementing counters
    useEffect(() => {
        // Seed realistic values
        setStats({
            scansToday: Math.floor(Math.random() * 3000) + 8000,
            threatsLive: Math.floor(Math.random() * 80) + 120,
            criticalNow: Math.floor(Math.random() * 8) + 2,
            scanRate: Math.floor(Math.random() * 5) + 12,
        });

        const interval = setInterval(() => {
            setStats((prev) => ({
                scansToday: prev.scansToday + Math.floor(Math.random() * 3),
                threatsLive: Math.max(80, prev.threatsLive + Math.floor(Math.random() * 3) - 1),
                criticalNow: Math.max(1, Math.min(15, prev.criticalNow + (Math.random() > 0.7 ? 1 : -1))),
                scanRate: Math.max(8, Math.min(25, prev.scanRate + Math.floor(Math.random() * 3) - 1)),
            }));
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const metrics = [
        {
            label: "Scans Today",
            value: stats.scansToday,
            color: colors.accent,
            icon: "🔍",
        },
        {
            label: "Live Threats",
            value: stats.threatsLive,
            color: colors.amber,
            icon: "⚠️",
        },
        {
            label: "Critical",
            value: stats.criticalNow,
            color: colors.red,
            icon: "🔴",
            pulse: true,
        },
        {
            label: "Scans/min",
            value: stats.scanRate,
            color: colors.green,
            icon: "⚡",
        },
    ];

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
        }}>
            {metrics.map((m, i) => (
                <div key={m.label} style={{ display: "flex", alignItems: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "5px 12px",
                            borderRadius: 8,
                            background: "transparent",
                            position: "relative",
                        }}
                    >
                        {/* Pulse dot for critical */}
                        {m.pulse && (
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: m.color,
                                }} />
                                <motion.div
                                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                    transition={{ duration: 1.2, repeat: Infinity }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        background: m.color,
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <AnimatedCounter value={m.value} color={m.color} />
                            <span style={{
                                fontSize: "0.58rem",
                                color: colors.textMuted,
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                lineHeight: 1,
                            }}>
                                {m.label}
                            </span>
                        </div>
                    </div>

                    {/* Divider between metrics */}
                    {i < metrics.length - 1 && (
                        <div style={{
                            width: 1,
                            height: 24,
                            background: colors.border,
                            flexShrink: 0,
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}