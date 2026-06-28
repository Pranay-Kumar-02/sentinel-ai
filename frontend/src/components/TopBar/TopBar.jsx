// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — TopBar
// Main top navigation bar. Fixed position, glass background.
// Contains: page title, live status metrics, theme switcher, actions.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import LiveStatus from "./LiveStatus";
import ThemeSwitcher from "./ThemeSwitcher";

const PAGE_META = {
    "/": { title: "Command Center", icon: "⚡", sub: "Live Intelligence Dashboard" },
    "/scanner": { title: "Threat Scanner", icon: "🔍", sub: "AI-Powered Analysis Engine" },
    "/forensics": { title: "Forensics Lab", icon: "🔬", sub: "File & Visual Intelligence" },
    "/osint": { title: "OSINT Recon", icon: "🌐", sub: "Open Source Intelligence" },
    "/email": { title: "Email Analyzer", icon: "📧", sub: "Header & Authentication Forensics" },
    "/intelligence": { title: "Intelligence", icon: "📡", sub: "Live Threat Feed" },
    "/history": { title: "Scan History", icon: "📋", sub: "Past Investigations" },
    "/settings": { title: "Settings", icon: "⚙️", sub: "Platform Configuration" },
    "/about": { title: "About", icon: "ℹ️", sub: "Sentinel AI" },
};

export default function TopBar({ activePath = "/", sidebarOpen = true, onNavigate }) {
    const { colors, nav, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [notifOpen, setNotifOpen] = useState(false);

    const meta = PAGE_META[activePath] ?? PAGE_META["/"];

    return (
        <motion.header
            style={{
                position: "fixed",
                top: 0,
                left: sidebarOpen ? 240 : 64,
                right: 0,
                height: 64,
                zIndex: 400,
                background: nav.bg,
                backdropFilter: nav.blur,
                WebkitBackdropFilter: nav.blur,
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                padding: "0 20px 0 24px",
                gap: 16,
                transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            {/* ── Page title ───────────────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activePath}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}
                >
                    <span style={{ fontSize: "1.1rem" }}>{meta.icon}</span>
                    <div>
                        <div style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: colors.text,
                            lineHeight: 1.1,
                            letterSpacing: "-0.01em",
                        }}>
                            {meta.title}
                        </div>
                        <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.62rem",
                            color: colors.textMuted,
                            lineHeight: 1,
                        }}>
                            {meta.sub}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ── Divider ──────────────────────────────────────── */}
            <div style={{ width: 1, height: 28, background: colors.border, flexShrink: 0 }} />

            {/* ── Live status metrics ──────────────────────────── */}
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <LiveStatus />
            </div>

            {/* ── Right side actions ───────────────────────────── */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
            }}>
                {/* Theme switcher */}
                <ThemeSwitcher compact />

                {/* Divider */}
                <div style={{ width: 1, height: 24, background: colors.border }} />

                {/* New scan CTA */}
                <motion.button
                    onClick={() => onNavigate?.("/scanner")}
                    onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "SCAN")}
                    onMouseLeave={resetCursor}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 16px",
                        background: gradients.primary,
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        fontFamily: "var(--font-body)",
                        letterSpacing: "0.02em",
                        boxShadow: `0 4px 16px ${colors.accentGlow}`,
                        whiteSpace: "nowrap",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Shine effect */}
                    <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 2 }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                            pointerEvents: "none",
                        }}
                    />
                    <span>🔍</span>
                    <span>New Scan</span>
                </motion.button>

                {/* Notifications */}
                <div style={{ position: "relative" }}>
                    <motion.button
                        onClick={() => setNotifOpen((v) => !v)}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "ALERTS")}
                        onMouseLeave={resetCursor}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.93 }}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 9,
                            background: colors.bgSurface,
                            border: `1px solid ${colors.border}`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.95rem",
                            position: "relative",
                        }}
                    >
                        🔔
                        {/* Unread dot */}
                        <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: colors.red,
                                boxShadow: `0 0 6px ${colors.redGlow}`,
                                border: `1.5px solid ${colors.bgSurface}`,
                            }}
                        />
                    </motion.button>

                    {/* Notification dropdown */}
                    <AnimatePresence>
                        {notifOpen && (
                            <>
                                <div
                                    onClick={() => setNotifOpen(false)}
                                    style={{ position: "fixed", inset: 0, zIndex: 998 }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                    style={{
                                        position: "absolute",
                                        top: "calc(100% + 8px)",
                                        right: 0,
                                        width: 300,
                                        background: colors.bgCard,
                                        backdropFilter: "var(--backdrop-blur)",
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 12,
                                        zIndex: 999,
                                        overflow: "hidden",
                                        boxShadow: `0 16px 48px rgba(0,0,0,0.4)`,
                                    }}
                                >
                                    <div style={{
                                        padding: "12px 16px",
                                        borderBottom: `1px solid ${colors.border}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}>
                                        <span style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                            color: colors.text,
                                        }}>
                                            Threat Alerts
                                        </span>
                                        <span style={{
                                            fontSize: "0.65rem",
                                            color: colors.accent,
                                            fontFamily: "var(--font-mono)",
                                            cursor: "pointer",
                                        }}>
                                            Mark all read
                                        </span>
                                    </div>

                                    {/* Sample notifications */}
                                    {[
                                        { icon: "🔴", text: "Critical threat detected in recent scan", time: "2m ago", color: colors.red },
                                        { icon: "⚠️", text: "New phishing campaign targeting Indian banks", time: "15m ago", color: colors.amber },
                                        { icon: "📡", text: "OSINT engine updated: 3 new sources", time: "1h ago", color: colors.accent },
                                    ].map((n, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            style={{
                                                padding: "10px 16px",
                                                borderBottom: i < 2 ? `1px solid ${colors.border}` : "none",
                                                display: "flex",
                                                gap: 10,
                                                cursor: "pointer",
                                                transition: "background 0.15s ease",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = colors.accentSoft}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <span style={{ fontSize: "0.9rem", flexShrink: 0, marginTop: 1 }}>{n.icon}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: "0.78rem",
                                                    color: colors.text,
                                                    lineHeight: 1.4,
                                                    fontFamily: "var(--font-body)",
                                                }}>
                                                    {n.text}
                                                </div>
                                                <div style={{
                                                    fontSize: "0.65rem",
                                                    color: colors.textMuted,
                                                    marginTop: 3,
                                                    fontFamily: "var(--font-mono)",
                                                }}>
                                                    {n.time}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
}