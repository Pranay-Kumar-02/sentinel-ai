// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ModuleCards
// Grid of all platform modules for the Command Center homepage.
// NOT a list of buttons — each card feels like a full application.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import ModuleCard from "./ModuleCard";

const MODULES = [
    {
        id: "scanner",
        icon: "🔍",
        name: "Threat Scanner",
        description: "AI-powered analysis of messages, URLs, emails, and suspicious content. Full LLM reasoning with MITRE ATT&CK mapping.",
        status: "active",
        color: null, // uses accent
        stats: [{ value: "10+", label: "Engines" }, { value: "MITRE", label: "Mapped" }],
        activity: "Last scan: 2 minutes ago",
        path: "/scanner",
    },
    {
        id: "forensics",
        icon: "🔬",
        name: "Forensics Lab",
        description: "Upload screenshots, QR codes, PDFs, and documents for visual intelligence extraction and deep content analysis.",
        status: "active",
        color: "#14b8a6",
        stats: [{ value: "4", label: "File Types" }, { value: "OCR", label: "Powered" }],
        activity: "QR decode ready",
        path: "/forensics",
    },
    {
        id: "osint",
        icon: "🌐",
        name: "OSINT Recon",
        description: "Deep domain intelligence: VirusTotal, WHOIS, IP geolocation, Safe Browsing, typosquatting detection across 20+ sources.",
        status: "active",
        color: "#3b82f6",
        stats: [{ value: "20+", label: "Sources" }, { value: "500", label: "Scans/day" }],
        activity: "VirusTotal: 500 scans/day",
        path: "/osint",
    },
    {
        id: "email",
        icon: "📧",
        name: "Email Analyzer",
        description: "Raw email header forensics: SPF, DKIM, DMARC validation, hop chain tracing, BEC detection, display-name spoofing.",
        status: "active",
        color: "#8b5cf6",
        stats: [{ value: "SPF", label: "DKIM DMARC" }, { value: "BEC", label: "Detection" }],
        activity: "Header parser ready",
        path: "/email",
    },
    {
        id: "intelligence",
        icon: "📡",
        name: "Live Intelligence",
        description: "Real-time threat feed from global IOC sources. Trending campaigns, active threat actors, and live attack patterns.",
        status: "active",
        color: "#ec4899",
        stats: [{ value: "LIVE", label: "Feed" }, { value: "IOC", label: "Database" }],
        activity: "Feed streaming",
        path: "/intelligence",
    },
    {
        id: "copilot",
        icon: "🤖",
        name: "AI Copilot",
        description: "Persistent AI assistant that explains threats in plain language, guides investigations, and answers security questions.",
        status: "active",
        color: "#7c3aed",
        stats: [{ value: "GPT", label: "Powered" }, { value: "24/7", label: "Available" }],
        activity: "Copilot ready",
        path: null, // opens copilot panel
    },
    {
        id: "learn",
        icon: "🎓",
        name: "Security Training",
        description: "Interactive phishing simulations, threat awareness challenges, and daily security briefings. Learn by doing.",
        status: "soon",
        color: "#f59e0b",
        stats: [{ value: "10+", label: "Modules" }],
        activity: null,
        path: "/learn",
    },
    {
        id: "community",
        icon: "🌍",
        name: "Community Intel",
        description: "Crowd-sourced threat database. Every scan contributes to a shared IOC network — community-powered threat scoring.",
        status: "soon",
        color: "#00ff88",
        stats: [{ value: "∞", label: "Community" }],
        activity: null,
        path: null,
    },
];

export default function ModuleCards({ onNavigate, onOpenCopilot }) {
    const { colors } = useTheme();

    function handleClick(module) {
        if (module.id === "copilot") {
            onOpenCopilot?.();
            return;
        }
        if (module.path) {
            onNavigate?.(module.path);
        }
    }

    return (
        <div>
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 28 }}
            >
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    background: colors.accentSoft,
                    border: `1px solid ${colors.borderHover}`,
                    borderRadius: 999,
                    fontSize: "0.68rem",
                    fontFamily: "var(--font-accent)",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: colors.accent,
                    marginBottom: 14,
                }}>
                    <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: colors.accent,
                        display: "inline-block",
                    }} />
                    Intelligence Platform
                </div>

                <h2 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: colors.text,
                    margin: "0 0 10px",
                }}>
                    Your Cyber Arsenal
                </h2>
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    color: colors.textSub,
                    margin: 0,
                    maxWidth: 500,
                    lineHeight: 1.6,
                }}>
                    Every module is a specialized intelligence engine. Together they form a complete CTI platform.
                </p>
            </motion.div>

            {/* Module grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 18,
            }}>
                {MODULES.map((module, i) => (
                    <ModuleCard
                        key={module.id}
                        {...module}
                        index={i}
                        onClick={() => handleClick(module)}
                    />
                ))}
            </div>
        </div>
    );
}