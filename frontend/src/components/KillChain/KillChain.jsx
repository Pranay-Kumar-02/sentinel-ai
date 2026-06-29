// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — KillChain
// Full attack kill chain visualization. Horizontal flow of nodes
// connected by animated lines. Parsed from LLM attack chain data.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import ChainNode from "./ChainNode";
import ChainLine from "./ChainLine";

// Default chain stages if LLM doesn't provide them
const DEFAULT_CHAIN = [
    { stage: "phishing", description: "Lure sent" },
    { stage: "delivery", description: "Link clicked" },
    { stage: "exploitation", description: "Page loaded" },
    { stage: "credential", description: "Data entered" },
    { stage: "exfiltration", description: "Data stolen" },
];

export default function KillChain({ result }) {
    const { colors } = useTheme();

    if (!result) return null;

    const llm = result.llm_analysis ?? result;

    // Try to get attack chain from result
    let chain = llm.attack_chain ?? llm.kill_chain ?? llm.attack_stages ?? null;

    // Normalize chain to array of { stage, description }
    if (!chain) {
        // Build from attack type if no chain
        const attackType = llm.attack_type ?? "";
        if (attackType.toLowerCase().includes("phishing")) {
            chain = DEFAULT_CHAIN;
        } else {
            chain = DEFAULT_CHAIN;
        }
    }

    if (typeof chain[0] === "string") {
        chain = chain.map((s) => ({ stage: s, description: "" }));
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: "20px 20px 16px",
                overflow: "hidden",
            }}
        >
            {/* Title */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
            }}>
                <span style={{ fontSize: "1rem" }}>⛓️</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: colors.text,
                }}>
                    Attack Chain
                </span>
                <span style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: colors.textMuted,
                    padding: "2px 8px",
                    background: colors.bgSurface,
                    borderRadius: 4,
                    border: `1px solid ${colors.border}`,
                }}>
                    {chain.length} stages
                </span>
            </div>

            {/* Chain flow */}
            <div style={{
                display: "flex",
                alignItems: "flex-start",
                overflowX: "auto",
                paddingBottom: 8,
                scrollbarWidth: "none",
                gap: 0,
            }}>
                {chain.map((node, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
                        <ChainNode
                            stage={node.stage ?? node.name ?? node.tactic ?? String(node)}
                            description={node.description ?? node.detail ?? ""}
                            index={i}
                            active
                        />
                        {i < chain.length - 1 && (
                            <ChainLine index={i} active />
                        )}
                    </div>
                ))}
            </div>

            {/* MITRE reference */}
            {llm.attack_type && (
                <div style={{
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: `1px solid ${colors.border}`,
                    fontSize: "0.72rem",
                    color: colors.textMuted,
                    fontFamily: "var(--font-mono)",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                }}>
                    <span style={{ color: colors.orange }}>ATT&CK</span>
                    <span>·</span>
                    <span>{llm.attack_type}</span>
                </div>
            )}
        </motion.div>
    );
}