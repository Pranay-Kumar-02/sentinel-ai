// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Workspace (Page)
// The "App Launcher" for all precision tools. Like CrowdStrike's module hub.
// Each tool is a card you launch. Clean, professional, no "More" button.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

const TOOLS = [
    {
        id: "breach",
        icon: "🔓",
        name: "Breach Monitor",
        tagline: "Have I Been Pwned?",
        desc: "Check any email against 13 billion leaked credentials. Real breach data from HaveIBeenPwned — exact breach names, dates, and what was exposed.",
        color: "#ff4444",
        status: "live",
        source: "HIBP API",
        path: "/breach",
    },
    {
        id: "cve",
        icon: "🛡️",
        name: "CVE Pulse",
        tagline: "Live Vulnerability Intelligence",
        desc: "Real-time CVE feed from NIST National Vulnerability Database. Search any software, get exact CVE IDs, CVSS scores, and patch status.",
        color: "#ff8c00",
        status: "live",
        source: "NIST NVD API",
        path: "/cve",
    },
    {
        id: "typosquat",
        icon: "👁️",
        name: "Typosquat Watchdog",
        tagline: "Domain Impersonation Detection",
        desc: "Enter your domain — we generate 200+ permutations and check which ones are registered. Catches brand impersonation before it catches your users.",
        color: "#ffb800",
        status: "live",
        source: "DNS + WHOIS",
        path: "/typosquat",
    },
    {
        id: "qr",
        icon: "📱",
        name: "QR Safe Scanner",
        tagline: "Decode Before You Scan",
        desc: "Upload any QR code image. We decode the URL and run it through VirusTotal + Google Safe Browsing before you ever visit it. Zero risk.",
        color: "#14b8a6",
        status: "live",
        source: "VirusTotal + Safe Browsing",
        path: "/qrscanner",
    },
    {
        id: "score",
        icon: "📊",
        name: "Sentinel Score",
        tagline: "Your Digital Security Score",
        desc: "A real score built from real data — breach exposure, domain monitoring, scan history. Updated weekly. Know exactly where you stand.",
        color: "#8b5cf6",
        status: "live",
        source: "HIBP + Scan History",
        path: "/score",
    },
    {
        id: "darkweb",
        icon: "🕵️",
        name: "Dark Web Monitor",
        tagline: "Underground Intelligence",
        desc: "Monitor paste sites, breach dumps, and underground forums for mentions of your email, domain, or brand. Real-time alerting.",
        color: "#6366f1",
        status: "soon",
        source: "Multiple feeds",
        path: null,
    },
    {
        id: "attack-surface",
        icon: "🗺️",
        name: "Attack Surface Map",
        tagline: "Discover Your Exposure",
        desc: "Enumerate subdomains, open ports, SSL certs, and running services for any domain. Know what attackers see before they do.",
        color: "#3b82f6",
        status: "soon",
        source: "Shodan + Amass",
        path: null,
    },
    {
        id: "email-guardian",
        icon: "📬",
        name: "Email Guardian",
        tagline: "Inbox Protection",
        desc: "Connect Gmail or Outlook. Sentinel silently scans every incoming email and flags suspicious ones. No manual pasting needed.",
        color: "#ec4899",
        status: "soon",
        source: "Gmail / Outlook API",
        path: null,
    },
];

function ToolCard({ tool, index, onNavigate }) {
    const { colors } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [hovered, setHovered] = useState(false);

    const isLive = tool.status === "live";

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 22 }}
            onMouseEnter={() => {
                setHovered(true);
                if (isLive) setCursor(CURSOR_STATES.INTERACTIVE, "LAUNCH");
            }}
            onMouseLeave={() => {
                setHovered(false);
                resetCursor();
            }}
            onClick={() => isLive && tool.path && onNavigate(tool.path)}
            style={{
                background: colors.bgCard,
                border: `1px solid ${hovered && isLive ? tool.color + "50" : colors.border}`,
                borderRadius: 18,
                padding: "24px",
                cursor: isLive ? "pointer" : "not-allowed",
                opacity: isLive ? 1 : 0.55,
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s ease",
                boxShadow: hovered && isLive ? `0 0 40px ${tool.color}15, 0 8px 32px rgba(0,0,0,0.2)` : "none",
            }}
        >
            {/* Top accent line */}
            <div style={{
                position: "absolute", top: 0, left: "15%", right: "15%",
                height: 2,
                background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
                opacity: hovered && isLive ? 1 : 0.3,
                transition: "opacity 0.3s ease",
            }} />

            {/* Mouse follow glow */}
            {hovered && isLive && (
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `radial-gradient(circle at 50% 0%, ${tool.color}08 0%, transparent 70%)`,
                    borderRadius: 18,
                }} />
            )}

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <motion.div
                    animate={hovered && isLive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{
                        width: 48, height: 48, borderRadius: 13,
                        background: `${tool.color}15`,
                        border: `1px solid ${tool.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.4rem",
                        boxShadow: hovered && isLive ? `0 0 20px ${tool.color}40` : "none",
                        transition: "box-shadow 0.3s ease",
                    }}
                >
                    {tool.icon}
                </motion.div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isLive ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", background: `${tool.color}12`, border: `1px solid ${tool.color}30`, borderRadius: 999 }}>
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ width: 5, height: 5, borderRadius: "50%", background: tool.color }}
                            />
                            <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", fontWeight: 700, color: tool.color, letterSpacing: "0.06em" }}>
                                LIVE
                            </span>
                        </div>
                    ) : (
                        <div style={{ padding: "3px 10px", background: colors.bgSurface, border: `1px solid ${colors.border}`, borderRadius: 999 }}>
                            <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.06em" }}>SOON</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Name */}
            <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem", fontWeight: 700,
                color: colors.text, margin: "0 0 4px",
                letterSpacing: "-0.01em",
            }}>
                {tool.name}
            </h3>

            {/* Tagline */}
            <div style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                color: tool.color, marginBottom: 12,
            }}>
                {tool.tagline}
            </div>

            {/* Description */}
            <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.78rem",
                color: colors.textSub, lineHeight: 1.6,
                margin: "0 0 16px",
            }}>
                {tool.desc}
            </p>

            {/* Footer */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: 12, borderTop: `1px solid ${colors.border}`,
            }}>
                <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                    color: colors.textMuted,
                }}>
                    {tool.source}
                </span>
                {isLive && (
                    <motion.span
                        animate={hovered ? { x: [0, 4, 0] } : {}}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        style={{
                            fontFamily: "var(--font-body)", fontSize: "0.75rem",
                            fontWeight: 600, color: tool.color,
                            display: "flex", alignItems: "center", gap: 4,
                        }}
                    >
                        Launch →
                    </motion.span>
                )}
            </div>
        </motion.div>
    );
}

export default function Workspace({ onNavigate }) {
    const { colors } = useTheme();

    const live = TOOLS.filter(t => t.status === "live");
    const soon = TOOLS.filter(t => t.status === "soon");

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "88px 32px 60px", maxWidth: 1200, margin: "0 auto", minHeight: "100vh" }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 48 }}
            >
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 14px",
                    background: colors.accentSoft,
                    border: `1px solid ${colors.borderHover}`,
                    borderRadius: 999, marginBottom: 16,
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.accent, display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.accent }}>
                        Precision Toolkit
                    </span>
                </div>

                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                    fontWeight: 900, letterSpacing: "-0.02em",
                    color: colors.text, margin: "0 0 10px",
                }}>
                    Workspace
                </h1>

                <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.95rem",
                    color: colors.textSub, maxWidth: 520, lineHeight: 1.6, margin: 0,
                }}>
                    Specialized intelligence tools. Each one answers a specific question with real data from real sources — no approximations.
                </p>

                {/* Ctrl+K hint */}
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    marginTop: 16, padding: "6px 14px",
                    background: colors.bgSurface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted }}>
                        Tip: Press
                    </span>
                    <kbd style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                        color: colors.accent, background: colors.accentSoft,
                        border: `1px solid ${colors.borderHover}`,
                        borderRadius: 5, padding: "1px 7px",
                    }}>
                        Ctrl + K
                    </kbd>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted }}>
                        to launch any tool instantly
                    </span>
                </div>
            </motion.div>

            {/* Live tools */}
            <div style={{ marginBottom: 48 }}>
                <div style={{
                    fontFamily: "var(--font-accent)", fontSize: "0.65rem",
                    color: colors.textMuted, letterSpacing: "0.14em",
                    textTransform: "uppercase", marginBottom: 20,
                    display: "flex", alignItems: "center", gap: 10,
                }}>
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green }}
                    />
                    Live — {live.length} tools ready
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 18,
                }}>
                    {live.map((tool, i) => (
                        <ToolCard key={tool.id} tool={tool} index={i} onNavigate={onNavigate} />
                    ))}
                </div>
            </div>

            {/* Coming soon */}
            <div>
                <div style={{
                    fontFamily: "var(--font-accent)", fontSize: "0.65rem",
                    color: colors.textMuted, letterSpacing: "0.14em",
                    textTransform: "uppercase", marginBottom: 20,
                    display: "flex", alignItems: "center", gap: 10,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.textDim }} />
                    In Development — {soon.length} tools coming
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 18,
                }}>
                    {soon.map((tool, i) => (
                        <ToolCard key={tool.id} tool={tool} index={live.length + i} onNavigate={onNavigate} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}