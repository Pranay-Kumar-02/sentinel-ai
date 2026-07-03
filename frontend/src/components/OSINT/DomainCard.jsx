// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — DomainCard
// Shows WHOIS + domain age + registrar intel
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { formatDomainAge, formatRegistrar } from "../../utils/formatters";
import { formatDate } from "../../utils/helpers";
import { Badge } from "../Common/Badge";

export default function DomainCard({ whois = {}, domain = "" }) {
    const { colors } = useTheme();

    const age = whois.domain_age_days ?? null;
    const isNew = age !== null && age < 30;
    const isSusp = age !== null && age < 90;

    const rows = [
        { label: "Domain", value: domain || whois.domain || "—" },
        { label: "Registrar", value: formatRegistrar(whois.registrar) },
        { label: "Created", value: formatDate(whois.creation_date) },
        { label: "Expires", value: formatDate(whois.expiration_date) },
        { label: "Updated", value: formatDate(whois.updated_date) },
        { label: "Country", value: whois.country || "—" },
        {
            label: "Name Servers", value: Array.isArray(whois.name_servers)
                ? whois.name_servers.slice(0, 2).join(", ")
                : (whois.name_servers || "—")
        },
    ].filter((r) => r.value && r.value !== "—");

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: colors.bgSurface,
            }}>
                <span style={{ fontSize: "1rem" }}>🌐</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: colors.text,
                    flex: 1,
                }}>
                    WHOIS Intelligence
                </span>
                {age !== null && (
                    <Badge variant={isNew ? "red" : isSusp ? "amber" : "green"} size="xs">
                        {formatDomainAge(age)}
                    </Badge>
                )}
            </div>

            {/* Rows */}
            <div style={{ padding: "8px 0" }}>
                {rows.map(({ label, value }, i) => (
                    <div
                        key={label}
                        style={{
                            display: "flex",
                            gap: 12,
                            padding: "7px 16px",
                            background: i % 2 === 0 ? "transparent" : `${colors.bgSurface}50`,
                            alignItems: "flex-start",
                        }}
                    >
                        <span style={{
                            fontSize: "0.68rem",
                            fontFamily: "var(--font-accent)",
                            color: colors.textMuted,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            minWidth: 90,
                            flexShrink: 0,
                            paddingTop: 1,
                        }}>
                            {label}
                        </span>
                        <span style={{
                            fontSize: "0.78rem",
                            fontFamily: "var(--font-mono)",
                            color: colors.text,
                            wordBreak: "break-all",
                        }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Warning for new domains */}
            {isNew && (
                <div style={{
                    padding: "8px 16px",
                    background: colors.redSoft,
                    borderTop: `1px solid ${colors.red}30`,
                    fontSize: "0.72rem",
                    color: colors.red,
                    fontFamily: "var(--font-mono)",
                    display: "flex",
                    gap: 6,
                }}>
                    <span>⚠</span>
                    <span>Domain registered less than 30 days ago — high-risk indicator</span>
                </div>
            )}
        </motion.div>
    );
}