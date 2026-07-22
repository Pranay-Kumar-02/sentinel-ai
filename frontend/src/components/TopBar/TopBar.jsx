// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — TopBar
// Main top navigation bar. Fixed position, glass background.
// Contains: page title, live status metrics, theme switcher, actions.
//
// FIX APPLIED: notifications were hardcoded fake sample data (a literal
// "2m ago" string that never changed, no matter when you opened the
// dropdown). Replaced with REAL notifications from two real sources:
//   1. Your own scan history (sentinel_scan_history) — critical/dangerous
//      verdicts you've actually triggered, real timestamps.
//   2. The live threat feed backend (/threat-feed/live, the real
//      URLhaus-backed feed fixed earlier) — genuine current global threats.
// Also fixed: the red "unread" dot rendered unconditionally regardless of
// whether anything was actually unread, and "Mark all read" had no
// onClick handler at all — it did nothing when clicked.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import { useBackendHealth } from "../../hooks/useBackendHealth";
import { timeAgo } from "../../utils/helpers";
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

const NOTIF_READ_KEY = "sentinel_notif_last_read";

// ── Real notifications from the user's own scan history ──────────────────────
function getScanNotifications() {
    try {
        const history = JSON.parse(localStorage.getItem("sentinel_scan_history") ?? "[]");
        return history
            .filter((h) => {
                const v = (h.verdict ?? "").toUpperCase();
                return v === "CRITICAL" || v === "DANGEROUS";
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3)
            .map((h) => {
                const v = (h.verdict ?? "").toUpperCase();
                return {
                    id: `scan-${h.timestamp}-${h.input ?? h.scanType ?? ""}`,
                    icon: v === "CRITICAL" ? "🔴" : "🟠",
                    text: `${v === "CRITICAL" ? "Critical" : "Dangerous"} threat found in your ${h.scanType ?? "scan"}`,
                    timestamp: h.timestamp,
                    colorKey: v === "CRITICAL" ? "red" : "orange",
                    source: "Your scan history",
                    linkPath: "/history",
                };
            });
    } catch {
        return [];
    }
}

function getLastReadTime() {
    return localStorage.getItem(NOTIF_READ_KEY);
}
function setLastReadNow() {
    const now = new Date().toISOString();
    localStorage.setItem(NOTIF_READ_KEY, now);
    return now;
}

export default function TopBar({ activePath = "/", sidebarOpen = true, onNavigate }) {
    const { colors, nav, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [notifOpen, setNotifOpen] = useState(false);
    const [scanNotifs, setScanNotifs] = useState(() => getScanNotifications());
    const [scanErrors, setScanErrors] = useState([]); // transient, in-memory — cleared on reload
    const [lastRead, setLastRead] = useState(() => getLastReadTime());

    // Shared with Sidebar via one underlying poller, not a separate one here.
    const { alive: backendAlive, lastChecked: backendCheckedAt } = useBackendHealth();

    // Real global threats — same live feed used elsewhere in the app.
    // Longer interval here (60s) since a notification bell doesn't need
    // the same real-time granularity as the dedicated feed pages.
    const { feed, error: feedError, isConnected: feedConnected } = useThreatFeed({ maxItems: 5, intervalMs: 60_000, pauseOnBlur: true });

    // Instant, event-driven — no polling. useAnalysis() dispatches these
    // the moment a scan actually completes (critical/dangerous verdict) or
    // fails, anywhere in the app, on any page. This replaces the earlier
    // 5-second localStorage poll entirely.
    useEffect(() => {
        function onThreatDetected() {
            setScanNotifs(getScanNotifications());
        }
        function onScanError(e) {
            setScanErrors((prev) => [
                {
                    id: `error-${e.detail.timestamp}`,
                    icon: "🔌",
                    text: `Scan failed: ${e.detail.message}`,
                    timestamp: e.detail.timestamp,
                    colorKey: "red",
                    source: "Scan error",
                    linkPath: null,
                },
                ...prev,
            ].slice(0, 3));
        }
        window.addEventListener("sentinel:threat-detected", onThreatDetected);
        window.addEventListener("sentinel:scan-error", onScanError);
        return () => {
            window.removeEventListener("sentinel:threat-detected", onThreatDetected);
            window.removeEventListener("sentinel:scan-error", onScanError);
        };
    }, []);

    const globalNotifs = useMemo(
        () =>
            feed.slice(0, 2).map((item) => ({
                id: `feed-${item.id}`,
                icon: item.severity === "CRITICAL" ? "🔴" : "⚠️",
                text: `${item.type} detected — ${item.domain ?? item.ioc ?? "unknown host"}`,
                timestamp: item.timestamp,
                colorKey: item.severity === "CRITICAL" ? "red" : "amber",
                source: "Live threat feed",
                linkPath: "/intelligence",
            })),
        [feed]
    );

    // Real system-status alerts — backend down, or the live feed itself
    // unreachable. Timestamped to when we actually last checked, not
    // fabricated.
    const systemNotifs = useMemo(() => {
        const items = [];
        if (backendAlive === false && backendCheckedAt) {
            items.push({
                id: "system-backend",
                icon: "🔌",
                text: "Backend engine is offline — scans and live data won't work until it's back",
                timestamp: new Date(backendCheckedAt).toISOString(),
                colorKey: "red",
                source: "System status",
                linkPath: null,
            });
        }
        if (!feedConnected && feedError) {
            items.push({
                id: "system-feed",
                icon: "📡",
                text: `Live threat feed unreachable: ${feedError}`,
                timestamp: new Date().toISOString(),
                colorKey: "amber",
                source: "System status",
                linkPath: "/intelligence",
            });
        }
        return items;
    }, [backendAlive, backendCheckedAt, feedConnected, feedError]);

    const allNotifs = useMemo(() => {
        return [...scanErrors, ...systemNotifs, ...scanNotifs, ...globalNotifs]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 6);
    }, [scanErrors, systemNotifs, scanNotifs, globalNotifs]);

    const unreadCount = useMemo(() => {
        if (!lastRead) return allNotifs.length;
        return allNotifs.filter((n) => new Date(n.timestamp) > new Date(lastRead)).length;
    }, [allNotifs, lastRead]);

    const handleMarkAllRead = useCallback(() => {
        setLastRead(setLastReadNow());
    }, []);

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
                        {/* Unread dot — only renders when something is ACTUALLY unread */}
                        {unreadCount > 0 && (
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
                        )}
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
                                        width: 320,
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
                                        <button
                                            onClick={handleMarkAllRead}
                                            disabled={unreadCount === 0}
                                            style={{
                                                fontSize: "0.65rem",
                                                color: unreadCount === 0 ? colors.textMuted : colors.accent,
                                                fontFamily: "var(--font-mono)",
                                                cursor: unreadCount === 0 ? "default" : "pointer",
                                                background: "none",
                                                border: "none",
                                                padding: 0,
                                            }}
                                        >
                                            Mark all read
                                        </button>
                                    </div>

                                    {allNotifs.length === 0 ? (
                                        <div style={{
                                            padding: "28px 16px",
                                            textAlign: "center",
                                            fontFamily: "var(--font-mono)",
                                            fontSize: "0.74rem",
                                            color: colors.textDim,
                                        }}>
                                            No alerts right now — nothing critical in your scans, and the live feed is quiet.
                                        </div>
                                    ) : (
                                        allNotifs.map((n, i) => {
                                            const color = colors[n.colorKey] ?? colors.accent;
                                            const isUnread = !lastRead || new Date(n.timestamp) > new Date(lastRead);
                                            return (
                                                <motion.div
                                                    key={n.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => { setNotifOpen(false); onNavigate?.(n.linkPath); }}
                                                    style={{
                                                        padding: "10px 16px",
                                                        borderBottom: i < allNotifs.length - 1 ? `1px solid ${colors.border}` : "none",
                                                        display: "flex",
                                                        gap: 10,
                                                        cursor: "pointer",
                                                        background: isUnread ? `${color}08` : "transparent",
                                                        transition: "background 0.15s ease",
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = colors.accentSoft}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = isUnread ? `${color}08` : "transparent"}
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
                                                            display: "flex",
                                                            gap: 6,
                                                        }}>
                                                            <span>{timeAgo(n.timestamp)}</span>
                                                            <span style={{ color: colors.textDim }}>·</span>
                                                            <span>{n.source}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
}