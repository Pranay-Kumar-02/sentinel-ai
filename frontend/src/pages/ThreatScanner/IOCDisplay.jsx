// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — IOCDisplay
// Dedicated IOC (Indicators of Compromise) display panel.
// Groups by type, typewriter reveal, click-to-copy, color-coded.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { copyToClipboard, extractUrls, extractEmails, extractPhones } from "../../utils/helpers";
import { formatUrl, formatIocType } from "../../utils/formatters";

const TYPE_CONFIG = {
    url: { icon: "🔗", colorKey: "red" },
    domain: { icon: "🌐", colorKey: "blue" },
    email: { icon: "📧", colorKey: "amber" },
    phone: { icon: "📞", colorKey: "purple" },
    ip: { icon: "📍", colorKey: "teal" },
    hash: { icon: "#️⃣", colorKey: "pink" },
};

function IOCRow({ ioc, type, index, colors }) {
    const [copied, setCopied] = useState(false);
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.url;
    const color = colors[cfg.colorKey] ?? colors.accent;
    const soft = colors[cfg.colorKey + "Soft"] ?? colors.accentSoft;

    async function handleCopy() {
        await copyToClipboard(ioc);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            onClick={handleCopy}
            whileHover={{ x: 3 }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: soft,
                border: `1px solid ${color}25`,
                borderRadius: 8,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>{cfg.icon}</span>
            <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                color,
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>
                {formatUrl(ioc, 50)}
            </span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={copied ? "copied" : "copy"}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    style={{
                        fontSize: "0.62rem",
                        color: copied ? colors.green : colors.textMuted,
                        fontFamily: "var(--font-mono)",
                        flexShrink: 0,
                    }}
                >
                    {copied ? "✓ Copied" : "Copy"}
                </motion.span>
            </AnimatePresence>
        </motion.div>
    );
}

export default function IOCDisplay({ result }) {
    const { colors } = useTheme();

    if (!result) return null;

    const llm = result.llm_analysis ?? result;

    // Gather from structured fields first, fall back to text extraction
    const rawText = typeof result.input === "string" ? result.input : "";
    const urls = llm.extracted_urls ?? extractUrls(rawText);
    const emails = llm.extracted_emails ?? extractEmails(rawText);
    const phones = llm.extracted_phones ?? extractPhones(rawText);
    const ips = llm.extracted_ips ?? [];
    const domains = llm.extracted_domains ?? [];

    const groups = [
        { type: "url", items: urls },
        { type: "domain", items: domains },
        { type: "email", items: emails },
        { type: "phone", items: phones },
        { type: "ip", items: ips },
    ].filter((g) => g.items.length > 0);

    const total = groups.reduce((sum, g) => sum + g.items.length, 0);

    if (total === 0) {
        return (
            <div style={{
                padding: "24px",
                textAlign: "center",
                color: colors.textDim,
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
            }}>
                No indicators of compromise extracted
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {groups.map((group) => (
                <div key={group.type}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 8,
                    }}>
                        <span style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.65rem",
                            color: colors.textMuted,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}>
                            {formatIocType(group.type)}s
                        </span>
                        <span style={{
                            fontSize: "0.6rem",
                            color: colors.textDim,
                            fontFamily: "var(--font-mono)",
                            background: colors.bgSurface,
                            padding: "1px 6px",
                            borderRadius: 4,
                        }}>
                            {group.items.length}
                        </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {group.items.map((item, i) => (
                            <IOCRow
                                key={i}
                                ioc={typeof item === "string" ? item : item.value ?? String(item)}
                                type={group.type}
                                index={i}
                                colors={colors}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}