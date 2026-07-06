// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — CommandPalette
// Ctrl+K command palette. Every tool, every page, every action accessible
// in under 2 keystrokes. Like Linear + Vercel + Raycast — but for cyber intel.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useTheme } from "../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../context/CursorContext";

// ── All searchable commands ───────────────────────────────────────────────────
const ALL_COMMANDS = [
    // Navigation
    { id: "home", label: "Command Center", icon: "⚡", category: "Navigate", path: "/", shortcut: "G H", desc: "Live intelligence dashboard" },
    { id: "scanner", label: "Threat Scanner", icon: "🔍", category: "Navigate", path: "/scanner", shortcut: "G S", desc: "AI-powered threat analysis" },
    { id: "forensics", label: "Forensics Lab", icon: "🔬", category: "Navigate", path: "/forensics", shortcut: "G F", desc: "File & visual intelligence" },
    { id: "email", label: "Email Analyzer", icon: "📧", category: "Navigate", path: "/email", shortcut: "G E", desc: "Header & authentication forensics" },
    { id: "osint", label: "OSINT Recon", icon: "🌐", category: "Navigate", path: "/osint", shortcut: "G O", desc: "Open source intelligence" },
    { id: "intel", label: "Live Intelligence", icon: "📡", category: "Navigate", path: "/intelligence", shortcut: null, desc: "Global threat feed" },
    { id: "history", label: "Scan History", icon: "📋", category: "Navigate", path: "/history", shortcut: "G H", desc: "Past investigations" },
    { id: "workspace", label: "Workspace", icon: "🚀", category: "Navigate", path: "/workspace", shortcut: "G W", desc: "All tools & modules" },
    { id: "settings", label: "Settings", icon: "⚙️", category: "Navigate", path: "/settings", shortcut: null, desc: "Platform configuration" },
    { id: "about", label: "About Sentinel AI", icon: "ℹ️", category: "Navigate", path: "/about", shortcut: null, desc: "Platform information" },

    // Tools
    { id: "breach", label: "Breach Monitor", icon: "🔓", category: "Tools", path: "/workspace/breach", shortcut: null, desc: "Check email breach history (HIBP)" },
    { id: "cve", label: "CVE Pulse", icon: "🛡️", category: "Tools", path: "/workspace/cve", shortcut: null, desc: "Live vulnerability intelligence (NIST)" },
    { id: "typosquat", label: "Typosquat Watchdog", icon: "👁️", category: "Tools", path: "/workspace/typosquat", shortcut: null, desc: "Domain impersonation detection" },
    { id: "qr", label: "QR Safe Scanner", icon: "📱", category: "Tools", path: "/workspace/qr", shortcut: null, desc: "Decode & analyze QR codes safely" },
    { id: "score", label: "Sentinel Score", icon: "📊", category: "Tools", path: "/workspace/score", shortcut: null, desc: "Your digital security score" },

    // Actions
    { id: "new-scan", label: "New Threat Scan", icon: "➕", category: "Actions", path: "/scanner", shortcut: "Ctrl K", desc: "Start a new investigation" },
    { id: "theme", label: "Switch Theme", icon: "🎨", category: "Actions", action: "theme", shortcut: "Ctrl T", desc: "Change platform theme" },
    { id: "copilot", label: "Open AI Copilot", icon: "🤖", category: "Actions", action: "copilot", shortcut: "Ctrl A", desc: "Ask the AI anything" },
];

const CATEGORIES = ["Navigate", "Tools", "Actions"];

export default function CommandPalette({ isOpen, onClose, onNavigate, onAction }) {
    const { colors } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Filter commands based on query
    const filtered = query.trim()
        ? ALL_COMMANDS.filter(c =>
            c.label.toLowerCase().includes(query.toLowerCase()) ||
            c.desc.toLowerCase().includes(query.toLowerCase()) ||
            c.category.toLowerCase().includes(query.toLowerCase())
        )
        : ALL_COMMANDS;

    // Group by category
    const grouped = CATEGORIES.reduce((acc, cat) => {
        const items = filtered.filter(c => c.category === cat);
        if (items.length > 0) acc[cat] = items;
        return acc;
    }, {});

    // Flat list for keyboard navigation
    const flat = Object.values(grouped).flat();

    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        setSelected(0);
    }, [query]);

    // Scroll selected item into view
    useEffect(() => {
        const el = listRef.current?.querySelector(`[data-index="${selected}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, [selected]);

    const executeCommand = useCallback((cmd) => {
        onClose();
        setQuery("");
        if (cmd.action === "theme") { onAction?.("theme"); return; }
        if (cmd.action === "copilot") { onAction?.("copilot"); return; }
        if (cmd.path) onNavigate?.(cmd.path);
    }, [onClose, onNavigate, onAction]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelected(s => Math.min(s + 1, flat.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelected(s => Math.max(s - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (flat[selected]) executeCommand(flat[selected]);
        } else if (e.key === "Escape") {
            onClose();
        }
    }, [flat, selected, executeCommand, onClose]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", inset: 0, zIndex: 99998,
                            background: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(8px)",
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -20, filter: "blur(8px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.96, y: -10, filter: "blur(4px)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        style={{
                            position: "fixed",
                            top: "12vh",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "min(640px, 90vw)",
                            maxHeight: "70vh",
                            zIndex: 99999,
                            background: colors.bgCard,
                            backdropFilter: "var(--backdrop-blur)",
                            border: `1px solid ${colors.borderHover}`,
                            borderRadius: 20,
                            boxShadow: `0 0 0 1px ${colors.accent}20, 0 32px 80px rgba(0,0,0,0.6), 0 0 80px ${colors.accentSoft}`,
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Search input */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "16px 20px",
                            borderBottom: `1px solid ${colors.border}`,
                            flexShrink: 0,
                        }}>
                            <span style={{ fontSize: "1.1rem", opacity: 0.6 }}>⌕</span>
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search commands, tools, pages..."
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    fontFamily: "var(--font-body)",
                                    fontSize: "1rem",
                                    color: colors.text,
                                    caretColor: colors.accent,
                                }}
                            />
                            <kbd style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.65rem",
                                color: colors.textMuted,
                                background: colors.bgSurface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 5,
                                padding: "2px 7px",
                            }}>
                                ESC
                            </kbd>
                        </div>

                        {/* Results */}
                        <div
                            ref={listRef}
                            style={{
                                overflowY: "auto",
                                flex: 1,
                                scrollbarWidth: "none",
                                padding: "8px 0",
                            }}
                        >
                            {flat.length === 0 ? (
                                <div style={{
                                    padding: "40px 20px",
                                    textAlign: "center",
                                    color: colors.textMuted,
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.82rem",
                                }}>
                                    No commands found for "{query}"
                                </div>
                            ) : (
                                Object.entries(grouped).map(([category, items]) => {
                                    const startIdx = flat.indexOf(items[0]);
                                    return (
                                        <div key={category}>
                                            {/* Category label */}
                                            <div style={{
                                                padding: "8px 20px 4px",
                                                fontFamily: "var(--font-accent)",
                                                fontSize: "0.6rem",
                                                color: colors.textDim,
                                                letterSpacing: "0.14em",
                                                textTransform: "uppercase",
                                                fontWeight: 700,
                                            }}>
                                                {category}
                                            </div>

                                            {items.map((cmd, i) => {
                                                const flatIdx = startIdx + i;
                                                const isSelected = flatIdx === selected;
                                                return (
                                                    <motion.div
                                                        key={cmd.id}
                                                        data-index={flatIdx}
                                                        onClick={() => executeCommand(cmd)}
                                                        onMouseEnter={() => {
                                                            setSelected(flatIdx);
                                                            setCursor(CURSOR_STATES.INTERACTIVE);
                                                        }}
                                                        onMouseLeave={resetCursor}
                                                        animate={{
                                                            background: isSelected ? colors.accentSoft : "transparent",
                                                        }}
                                                        transition={{ duration: 0.1 }}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 14,
                                                            padding: "10px 20px",
                                                            cursor: "pointer",
                                                            borderLeft: `2px solid ${isSelected ? colors.accent : "transparent"}`,
                                                        }}
                                                    >
                                                        {/* Icon */}
                                                        <div style={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: 9,
                                                            background: isSelected ? `${colors.accent}20` : colors.bgSurface,
                                                            border: `1px solid ${isSelected ? colors.accent + "40" : colors.border}`,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "0.95rem",
                                                            flexShrink: 0,
                                                            transition: "all 0.15s ease",
                                                        }}>
                                                            {cmd.icon}
                                                        </div>

                                                        {/* Text */}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{
                                                                fontFamily: "var(--font-body)",
                                                                fontSize: "0.88rem",
                                                                fontWeight: 600,
                                                                color: isSelected ? colors.text : colors.textSub,
                                                                marginBottom: 1,
                                                            }}>
                                                                {cmd.label}
                                                            </div>
                                                            <div style={{
                                                                fontFamily: "var(--font-mono)",
                                                                fontSize: "0.68rem",
                                                                color: colors.textMuted,
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                            }}>
                                                                {cmd.desc}
                                                            </div>
                                                        </div>

                                                        {/* Shortcut */}
                                                        {cmd.shortcut && (
                                                            <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                                                                {cmd.shortcut.split(" ").map((k, ki) => (
                                                                    <kbd key={ki} style={{
                                                                        fontFamily: "var(--font-mono)",
                                                                        fontSize: "0.6rem",
                                                                        color: colors.textMuted,
                                                                        background: colors.bgSurface,
                                                                        border: `1px solid ${colors.border}`,
                                                                        borderRadius: 4,
                                                                        padding: "1px 6px",
                                                                    }}>
                                                                        {k}
                                                                    </kbd>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: "10px 20px",
                            borderTop: `1px solid ${colors.border}`,
                            display: "flex",
                            gap: 16,
                            flexShrink: 0,
                        }}>
                            {[
                                { keys: ["↑", "↓"], label: "Navigate" },
                                { keys: ["↵"], label: "Open" },
                                { keys: ["Esc"], label: "Close" },
                            ].map(({ keys, label }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <div style={{ display: "flex", gap: 2 }}>
                                        {keys.map(k => (
                                            <kbd key={k} style={{
                                                fontFamily: "var(--font-mono)",
                                                fontSize: "0.6rem",
                                                color: colors.textMuted,
                                                background: colors.bgSurface,
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: 4,
                                                padding: "1px 6px",
                                            }}>
                                                {k}
                                            </kbd>
                                        ))}
                                    </div>
                                    <span style={{ fontSize: "0.65rem", color: colors.textDim, fontFamily: "var(--font-mono)" }}>
                                        {label}
                                    </span>
                                </div>
                            ))}
                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontSize: "0.65rem", color: colors.textDim, fontFamily: "var(--font-mono)" }}>
                                    {flat.length} commands
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}