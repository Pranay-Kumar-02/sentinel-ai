// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — MitreMatrix
// MITRE ATT&CK tactic × technique matrix. Highlighted cells pulse.
// Shows the framework structure with detected techniques mapped in.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { formatMitreTechnique, formatMitreTactic } from "../../utils/formatters";

// Simplified MITRE ATT&CK tactics relevant to social engineering / phishing CTI
const TACTICS = [
    { id: "reconnaissance", label: "Recon", techniques: ["T1598", "T1589", "T1590"] },
    { id: "resource-development", label: "Resource Dev", techniques: ["T1583", "T1586", "T1588"] },
    { id: "initial-access", label: "Initial Access", techniques: ["T1566.001", "T1566.002", "T1190"] },
    { id: "execution", label: "Execution", techniques: ["T1059", "T1204"] },
    { id: "persistence", label: "Persistence", techniques: ["T1078", "T1547"] },
    { id: "credential-access", label: "Credential", techniques: ["T1110", "T1556", "T1539"] },
    { id: "collection", label: "Collection", techniques: ["T1114", "T1056"] },
    { id: "exfiltration", label: "Exfiltration", techniques: ["T1041", "T1567"] },
    { id: "impact", label: "Impact", techniques: ["T1486", "T1657"] },
];

const TECHNIQUE_NAMES = {
    "T1598": "Phishing for Information",
    "T1589": "Gather Victim Identity Info",
    "T1590": "Gather Victim Network Info",
    "T1583": "Acquire Infrastructure",
    "T1586": "Compromise Accounts",
    "T1588": "Obtain Capabilities",
    "T1566.001": "Spearphishing Attachment",
    "T1566.002": "Spearphishing Link",
    "T1190": "Exploit Public-Facing App",
    "T1059": "Command and Scripting",
    "T1204": "User Execution",
    "T1078": "Valid Accounts",
    "T1547": "Boot or Logon Autostart",
    "T1110": "Brute Force",
    "T1556": "Modify Authentication",
    "T1539": "Steal Web Session Cookie",
    "T1114": "Email Collection",
    "T1056": "Input Capture",
    "T1041": "Exfiltration Over C2",
    "T1567": "Exfiltration Over Web Service",
    "T1486": "Data Encrypted for Impact",
    "T1657": "Financial Theft",
};

export default function MitreMatrix({ detectedTechniques = [] }) {
    const { colors } = useTheme();
    const [hovered, setHovered] = useState(null);

    // Normalize detected techniques to a Set for fast lookup
    const detected = new Set(
        detectedTechniques.map((t) =>
            (typeof t === "string" ? t : t.id ?? t.technique ?? "").toUpperCase()
        )
    );

    return (
        <div>
            <div style={{
                display: "flex",
                gap: "2px",
                overflowX: "auto",
                paddingBottom: 8,
                scrollbarWidth: "none",
            }}>
                {TACTICS.map((tactic, ti) => (
                    <div key={tactic.id} style={{ minWidth: 110, flexShrink: 0 }}>
                        {/* Tactic header */}
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ti * 0.03 }}
                            style={{
                                padding: "6px 8px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: "6px 6px 0 0",
                                fontSize: "0.62rem",
                                fontFamily: "var(--font-accent)",
                                fontWeight: 700,
                                color: colors.textSub,
                                textAlign: "center",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                                marginBottom: 2,
                            }}
                        >
                            {tactic.label}
                        </motion.div>

                        {/* Technique cells */}
                        {tactic.techniques.map((tech, i) => {
                            const isActive = detected.has(tech.toUpperCase());
                            const cellIndex = ti * 3 + i;

                            return (
                                <motion.div
                                    key={tech}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: cellIndex * 0.015 }}
                                    onMouseEnter={() => setHovered(tech)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{
                                        position: "relative",
                                        padding: "8px 6px",
                                        marginBottom: 1,
                                        background: isActive ? colors.orangeSoft : colors.bgCard,
                                        border: `1px solid ${isActive ? colors.orange + "50" : colors.border}`,
                                        cursor: "pointer",
                                    }}
                                >
                                    <motion.div
                                        animate={isActive ? {
                                            boxShadow: [
                                                `0 0 0px ${colors.orangeGlow}`,
                                                `0 0 12px ${colors.orangeGlow}`,
                                                `0 0 0px ${colors.orangeGlow}`,
                                            ],
                                        } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{
                                            fontSize: "0.6rem",
                                            fontFamily: "var(--font-mono)",
                                            color: isActive ? colors.orange : colors.textMuted,
                                            fontWeight: isActive ? 700 : 400,
                                        }}
                                    >
                                        {tech}
                                    </motion.div>

                                    {/* Tooltip */}
                                    <AnimatePresence>
                                        {hovered === tech && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                style={{
                                                    position: "absolute",
                                                    bottom: "calc(100% + 6px)",
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    background: colors.bgCard,
                                                    border: `1px solid ${colors.border}`,
                                                    borderRadius: 6,
                                                    padding: "6px 10px",
                                                    fontSize: "0.65rem",
                                                    color: colors.text,
                                                    whiteSpace: "nowrap",
                                                    zIndex: 50,
                                                    fontFamily: "var(--font-body)",
                                                    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                                                }}
                                            >
                                                {TECHNIQUE_NAMES[tech] ?? tech}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
                paddingTop: 10,
                borderTop: `1px solid ${colors.border}`,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: colors.orangeSoft, border: `1px solid ${colors.orange}50`,
                    }} />
                    <span style={{ fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                        Detected ({detected.size})
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: colors.bgCard, border: `1px solid ${colors.border}`,
                    }} />
                    <span style={{ fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                        Not observed
                    </span>
                </div>
            </div>
        </div>
    );
}