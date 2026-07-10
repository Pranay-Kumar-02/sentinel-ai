// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ModuleCards (v3 — ASYMMETRIC BENTO GRID)
// Genuine structural change this time, not just refined logic on the same
// grid: Scanner and Live Intelligence (your two flagship modules) now span
// double-width as featured tiles, everything else sits in standard tiles.
// This is the exact "bento grid" pattern used by Linear, Vercel, and Raycast
// for feature showcases — pure CSS Grid, no new dependency needed for this
// one, fully verifiable, zero rendering risk.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import ModuleCard from "./ModuleCard";

const MODULES = [
    {
        id: "scanner", icon: "🔍", name: "Threat Scanner",
        description: "AI-powered analysis of messages, URLs, emails, and suspicious content. Full LLM reasoning with MITRE ATT&CK mapping.",
        status: "active", color: null,
        stats: [{ value: "10+", label: "Engines" }, { value: "MITRE", label: "Mapped" }],
        activity: "Last scan: 2 minutes ago", path: "/scanner", size: "large",
    },
    {
        id: "forensics", icon: "🔬", name: "Forensics Lab",
        description: "Upload screenshots, QR codes, PDFs, and documents for visual intelligence extraction and deep content analysis.",
        status: "active", color: "#14b8a6",
        stats: [{ value: "4", label: "File Types" }, { value: "OCR", label: "Powered" }],
        activity: "QR decode ready", path: "/forensics", size: "standard",
    },
    {
        id: "osint", icon: "🌐", name: "OSINT Recon",
        description: "Deep domain intelligence: VirusTotal, WHOIS, IP geolocation, Safe Browsing, typosquatting detection across 20+ sources.",
        status: "active", color: "#3b82f6",
        stats: [{ value: "20+", label: "Sources" }, { value: "500", label: "Scans/day" }],
        activity: "VirusTotal: 500 scans/day", path: "/osint", size: "standard",
    },
    {
        id: "intelligence", icon: "📡", name: "Live Intelligence",
        description: "Real-time threat feed from global IOC sources. Trending campaigns, active threat actors, and live attack patterns.",
        status: "active", color: "#ec4899",
        stats: [{ value: "LIVE", label: "Feed" }, { value: "IOC", label: "Database" }],
        activity: "Feed streaming", path: "/intelligence", size: "large",
    },
    {
        id: "email", icon: "📧", name: "Email Analyzer",
        description: "Raw email header forensics: SPF, DKIM, DMARC validation, hop chain tracing, BEC detection, display-name spoofing.",
        status: "active", color: "#8b5cf6",
        stats: [{ value: "SPF", label: "DKIM DMARC" }, { value: "BEC", label: "Detection" }],
        activity: "Header parser ready", path: "/email", size: "standard",
    },
    {
        id: "copilot", icon: "🤖", name: "AI Copilot",
        description: "Persistent AI assistant that explains threats in plain language, guides investigations, and answers security questions.",
        status: "active", color: "#7c3aed",
        stats: [{ value: "GPT", label: "Powered" }, { value: "24/7", label: "Available" }],
        activity: "Copilot ready", path: null, size: "standard",
    },
    {
        id: "learn", icon: "🎓", name: "Security Training",
        description: "Interactive phishing simulations, threat awareness challenges, and daily security briefings.",
        status: "soon", color: "#f59e0b",
        stats: [{ value: "10+", label: "Modules" }], activity: null, path: "/learn", size: "standard",
    },
    {
        id: "community", icon: "🌍", name: "Community Intel",
        description: "Crowd-sourced threat database. Every scan contributes to a shared IOC network.",
        status: "soon", color: "#00ff88",
        stats: [{ value: "∞", label: "Community" }], activity: null, path: null, size: "standard",
    },
];

export default function ModuleCards({ onNavigate, onOpenCopilot }) {
    const { colors } = useTheme();

    function handleClick(module) {
        if (module.id === "copilot") { onOpenCopilot?.(); return; }
        if (module.path) onNavigate?.(module.path);
    }

    return (
        <div style={{ position: "relative" }}>
            <div style={{
                position: "absolute", inset: "-20px -20px auto -20px", height: 200,
                backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
                backgroundSize: "48px 48px", opacity: 0.15,
                maskImage: "linear-gradient(to bottom, black, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
                pointerEvents: "none", zIndex: 0,
            }} />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 28, position: "relative", zIndex: 1 }}
            >
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 12px", background: colors.accentSoft,
                    border: `1px solid ${colors.borderHover}`, borderRadius: 999,
                    fontSize: "0.68rem", fontFamily: "var(--font-accent)", fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: colors.accent, marginBottom: 14,
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.accent, display: "inline-block" }} />
                    Intelligence Platform
                </div>
                <h2 style={{
                    fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    fontWeight: 800, letterSpacing: "-0.02em", color: colors.text, margin: "0 0 10px",
                }}>
                    Your Cyber Arsenal
                </h2>
                <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.95rem", color: colors.textSub,
                    margin: 0, maxWidth: 500, lineHeight: 1.6,
                }}>
                    Every module is a specialized intelligence engine. Together they form a complete CTI platform.
                </p>
            </motion.div>

            {/* Bento grid — large tiles (Scanner, Live Intelligence) span double-width */}
            <div
                className="bento-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gridAutoRows: "auto",
                    gridAutoFlow: "dense",
                    gap: 18,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {MODULES.map((module, i) => (
                    <div
                        key={module.id}
                        className={module.size === "large" ? "bento-large" : "bento-standard"}
                        style={{ gridColumn: module.size === "large" ? "span 2" : "span 2" }}
                    >
                        <ModuleCard {...module} index={i} onClick={() => handleClick(module)} />
                    </div>
                ))}
            </div>

            <style>{`
                @media (min-width: 1100px) {
                    .bento-grid { grid-template-columns: repeat(4, 1fr); }
                    .bento-large { grid-column: span 2 !important; }
                    .bento-standard { grid-column: span 1 !important; }
                }
                @media (max-width: 1099px) and (min-width: 640px) {
                    .bento-grid { grid-template-columns: repeat(2, 1fr); }
                    .bento-large { grid-column: span 2 !important; }
                    .bento-standard { grid-column: span 1 !important; }
                }
                @media (max-width: 639px) {
                    .bento-grid { grid-template-columns: 1fr; }
                    .bento-large, .bento-standard { grid-column: span 1 !important; }
                }
            `}</style>
        </div>
    );
}