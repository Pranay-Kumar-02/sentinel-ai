// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — OSINTResults
// Master OSINT panel. Renders all sub-cards from a fullscan result.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import DomainCard from "./DomainCard";
import VirusTotalCard from "./VirusTotalCard";
import GeoCard from "./GeoCard";
import WhoisCard from "./WhoisCard";
import { Badge } from "../Common/Badge";

export default function OSINTResults({ osint = {}, domain = "" }) {
    const { colors } = useTheme();

    if (!osint || Object.keys(osint).length === 0) {
        return (
            <div style={{
                padding: "32px",
                textAlign: "center",
                color: colors.textDim,
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
            }}>
                No OSINT data available for this scan
            </div>
        );
    }

    const riskScore = osint.risk_score ?? 0;
    const riskFlags = osint.risk_flags ?? [];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Risk summary bar */}
            {riskScore > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: "12px 16px",
                        background: colors.bgSurface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: riskScore >= 70 ? colors.red
                                : riskScore >= 40 ? colors.amber
                                    : colors.green,
                        }}>
                            {riskScore}
                        </span>
                        <div>
                            <div style={{ fontSize: "0.68rem", color: colors.textMuted, fontFamily: "var(--font-accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                OSINT Risk Score
                            </div>
                            <div style={{ fontSize: "0.62rem", color: colors.textDim, fontFamily: "var(--font-mono)" }}>
                                out of 100
                            </div>
                        </div>
                    </div>

                    {riskFlags.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginLeft: "auto" }}>
                            {riskFlags.slice(0, 4).map((flag, i) => (
                                <Badge key={i} variant="red" size="xs">{flag}</Badge>
                            ))}
                            {riskFlags.length > 4 && (
                                <Badge variant="muted" size="xs">+{riskFlags.length - 4} more</Badge>
                            )}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Sub-cards grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 14,
            }}>
                <DomainCard
                    whois={osint.whois ?? {}}
                    domain={domain}
                />
                <VirusTotalCard
                    vt={osint.virustotal ?? osint.virus_total ?? null}
                />
                <GeoCard
                    geo={osint.geolocation ?? osint.ip_info ?? {}}
                />
                <WhoisCard
                    whois={osint.whois ?? {}}
                    typosquatting={osint.typosquatting ?? null}
                />
            </div>
        </div>
    );
}