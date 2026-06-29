// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — EngineGrid
// Grid showing status of all 10 Sentinel AI analysis engines
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import EngineCard from "./EngineCard";

function getEngineStatus(result, engineId) {
    if (!result) return "pending";
    const llm = result.llm_analysis ?? result;
    const osint = result.osint_results ?? result.osint ?? {};

    switch (engineId) {
        case "llm": return llm.verdict ? "complete" : "pending";
        case "urgency": return llm.urgency_score !== undefined ? "complete" : "pending";
        case "impersonation": return llm.brand_impersonation !== undefined ? "complete" : "pending";
        case "ioc": return (llm.extracted_urls?.length > 0) ? "complete" : "pending";
        case "mitre": return llm.mitre_techniques?.length > 0 ? "complete" : "pending";
        case "virustotal": return osint.virustotal ? "complete" : result ? "skipped" : "pending";
        case "safebrowsing": return osint.safe_browsing ? "complete" : result ? "skipped" : "pending";
        case "geo": return osint.geolocation ? "complete" : result ? "skipped" : "pending";
        case "whois": return osint.whois ? "complete" : result ? "skipped" : "pending";
        case "typo": return osint.typosquatting ? "complete" : result ? "skipped" : "pending";
        default: return "pending";
    }
}

function getEngineValue(result, engineId) {
    if (!result) return null;
    const llm = result.llm_analysis ?? result;
    const osint = result.osint_results ?? result.osint ?? {};

    switch (engineId) {
        case "llm": return llm.verdict ?? null;
        case "urgency": return llm.urgency_score !== undefined ? `${llm.urgency_score}/100` : null;
        case "impersonation": return llm.brand_impersonation ? "Detected" : null;
        case "ioc": return llm.extracted_urls?.length ? `${llm.extracted_urls.length} URLs found` : null;
        case "mitre": return llm.mitre_techniques?.length ? llm.mitre_techniques[0] : null;
        case "virustotal": return osint.virustotal ? `${osint.virustotal.positives ?? 0} detections` : null;
        case "safebrowsing": return osint.safe_browsing?.is_safe === false ? "Flagged" : osint.safe_browsing ? "Clean" : null;
        case "geo": return osint.geolocation?.country ?? null;
        case "whois": return osint.whois?.registrar ?? null;
        case "typo": return osint.typosquatting?.detected ? "Detected" : osint.typosquatting ? "Clean" : null;
        default: return null;
    }
}

const ENGINES = [
    { id: "llm", name: "LLM Reasoning", icon: "🤖" },
    { id: "urgency", name: "Urgency Detector", icon: "⚡" },
    { id: "impersonation", name: "Brand Impersonation", icon: "🎭" },
    { id: "ioc", name: "IOC Extractor", icon: "🔗" },
    { id: "mitre", name: "MITRE ATT&CK", icon: "🛡️" },
    { id: "virustotal", name: "VirusTotal", icon: "🦠" },
    { id: "safebrowsing", name: "Safe Browsing", icon: "🔒" },
    { id: "geo", name: "IP Geolocation", icon: "📍" },
    { id: "whois", name: "WHOIS Lookup", icon: "🌐" },
    { id: "typo", name: "Typosquatting", icon: "🔤" },
];

export default function EngineGrid({ result, isLoading = false }) {
    const { colors } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: "18px",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
            }}>
                <span style={{ fontSize: "1rem" }}>⚙️</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: colors.text,
                }}>
                    Engine Results
                </span>
                <span style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: colors.textMuted,
                }}>
                    {ENGINES.filter((e) => getEngineStatus(result, e.id) === "complete").length}/{ENGINES.length} complete
                </span>
            </div>

            {/* Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 8,
            }}>
                {ENGINES.map((engine, i) => (
                    <EngineCard
                        key={engine.id}
                        name={engine.name}
                        icon={engine.icon}
                        status={isLoading
                            ? (i < 3 ? "running" : "pending")
                            : getEngineStatus(result, engine.id)
                        }
                        value={getEngineValue(result, engine.id)}
                        index={i}
                    />
                ))}
            </div>
        </motion.div>
    );
}