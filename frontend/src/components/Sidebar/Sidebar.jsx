// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Sidebar
// Collapsible navigation sidebar with all routes, live status indicator,
// keyboard shortcut (Ctrl+B), and spring animation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useSidebarState } from "../../hooks/useLocalStorage";
import { useKeyboard } from "../../hooks/useKeyboard";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import SidebarLogo from "./SidebarLogo";
import NavItem from "./NavItem";

// ── Navigation config ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
    {
        id: "command",
        label: "Command Center",
        icon: "⚡",
        path: "/",
        group: "main",
    },
    {
        id: "scanner",
        label: "Threat Scanner",
        icon: "🔍",
        path: "/scanner",
        group: "main",
    },
    {
        id: "forensics",
        label: "Forensics Lab",
        icon: "🔬",
        path: "/forensics",
        group: "main",
    },
    {
        id: "osint",
        label: "OSINT Recon",
        icon: "🌐",
        path: "/osint",
        group: "main",
    },
    {
        id: "email",
        label: "Email Analyzer",
        icon: "📧",
        path: "/email",
        group: "main",
    },
    {
        id: "intelligence",
        label: "Intelligence",
        icon: "📡",
        path: "/intelligence",
        group: "intel",
    },
    {
        id: "history",
        label: "Scan History",
        icon: "📋",
        path: "/history",
        group: "intel",
    },
    {
        id: "learn",
        label: "Learn",
        icon: "🎓",
        path: "/learn",
        group: "intel",
        soon: true,
    },
    {
        id: "settings",
        label: "Settings",
        icon: "⚙️",
        path: "/settings",
        group: "system",
    },
    {
        id: "about",
        label: "About",
        icon: "ℹ️",
        path: "/about",
        group: "system",
    },
    {
        id: "workspace",
        label: "Workspace",
        icon: "🚀",
        path: "/workspace",
        group: "main",
    },
];

const GROUP_LABELS = {
    main: "Platform",
    intel: "Intelligence",
    system: "System",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar({ activePath = "/", onNavigate }) {
    const { colors, nav } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [isOpen, toggleOpen] = useSidebarState();
    const [backendAlive, setBackendAlive] = useState(null);

    // Ctrl+B toggles sidebar
    useKeyboard({ "ctrl+b": () => toggleOpen() });

    // Check backend health on mount
    useEffect(() => {
        async function check() {
            try {
                const res = await fetch("http://127.0.0.1:8000/health", { signal: AbortSignal.timeout(3000) });
                setBackendAlive(res.ok);
            } catch {
                setBackendAlive(false);
            }
        }
        check();
        const interval = setInterval(check, 30_000);
        return () => clearInterval(interval);
    }, []);

    const groups = ["main", "intel", "system"];

    return (
        <motion.aside
            animate={{ width: isOpen ? 240 : 64 }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 1 }}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 500,
                background: nav.sidebar,
                backdropFilter: nav.blur,
                WebkitBackdropFilter: nav.blur,
                borderRight: `1px solid ${colors.border}`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                willChange: "width",
            }}
        >
            {/* ── Logo ─────────────────────────────────────────── */}
            <div style={{
                padding: "20px 14px 16px",
                borderBottom: `1px solid ${colors.border}`,
            }}>
                <SidebarLogo
                    collapsed={!isOpen}
                    onClick={() => onNavigate?.("/")}
                />
            </div>

            {/* ── Nav groups ────────────────────────────────────── */}
            <nav style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                scrollbarWidth: "none",
            }}>
                {groups.map((group, gi) => {
                    const items = NAV_ITEMS.filter((n) => n.group === group);
                    return (
                        <div key={group}>
                            {/* Group label */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.18 }}
                                        style={{
                                            fontSize: "0.62rem",
                                            fontFamily: "var(--font-accent)",
                                            fontWeight: 600,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                            color: colors.textDim,
                                            padding: gi === 0 ? "4px 12px 6px" : "16px 12px 6px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {GROUP_LABELS[group]}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!isOpen && gi > 0 && (
                                <div style={{
                                    height: 1,
                                    background: colors.border,
                                    margin: "10px 8px",
                                }} />
                            )}

                            {/* Nav items */}
                            {items.map((item, i) => (
                                <NavItem
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={activePath === item.path}
                                    collapsed={!isOpen}
                                    soon={item.soon}
                                    custom={gi * 3 + i}
                                    onClick={() => onNavigate?.(item.path)}
                                />
                            ))}
                        </div>
                    );
                })}
            </nav>

            {/* ── Footer: backend status + collapse toggle ──────── */}
            <div style={{
                borderTop: `1px solid ${colors.border}`,
                padding: "12px 10px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}>
                {/* Backend status */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                background: colors.bgSurface,
                                borderRadius: 8,
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            {/* Status dot */}
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: backendAlive === null
                                        ? colors.amber
                                        : backendAlive
                                            ? colors.green
                                            : colors.red,
                                }} />
                                {backendAlive && (
                                    <motion.div
                                        animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
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
                            <div>
                                <div style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    color: backendAlive === null
                                        ? colors.amber
                                        : backendAlive
                                            ? colors.green
                                            : colors.red,
                                    fontFamily: "var(--font-mono)",
                                }}>
                                    {backendAlive === null ? "Checking..." : backendAlive ? "Engine Online" : "Engine Offline"}
                                </div>
                                <div style={{
                                    fontSize: "0.62rem",
                                    color: colors.textMuted,
                                    fontFamily: "var(--font-mono)",
                                }}>
                                    localhost:8000
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapse toggle */}
                <motion.button
                    onClick={() => toggleOpen()}
                    onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, isOpen ? "COLLAPSE" : "EXPAND")}
                    onMouseLeave={resetCursor}
                    whileHover={{ background: colors.accentSoft }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isOpen ? "flex-end" : "center",
                        gap: 8,
                        padding: "8px 12px",
                        background: "transparent",
                        border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        color: colors.textMuted,
                        fontSize: "0.78rem",
                        transition: "background 0.2s ease",
                        width: "100%",
                    }}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.span
                                key="open"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ fontSize: "0.75rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}
                            >
                                Ctrl+B
                            </motion.span>
                        ) : null}
                    </AnimatePresence>
                    <motion.span
                        animate={{ rotate: isOpen ? 0 : 180 }}
                        transition={{ duration: 0.3 }}
                        style={{ fontSize: "0.9rem" }}
                    >
                        ◀
                    </motion.span>
                </motion.button>
            </div>
        </motion.aside>
    );
}