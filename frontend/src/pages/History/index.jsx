// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — History (Page)
// Past scan investigations stored in localStorage. Filter, search, re-view.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useScanHistory } from "../../hooks/useLocalStorage";
import { formatHistoryItem } from "../../utils/formatters";
import { normalizeVerdict } from "../../utils/riskCalculator";
import { SectionHead } from "../../components/Common/Tooltip";
import { Badge } from "../../components/Common/Badge";

const VERDICT_FILTERS = ["ALL", "SAFE", "SUSPICIOUS", "DANGEROUS", "CRITICAL"];

function HistoryRow({ item, index, colors }) {
    const formatted = formatHistoryItem(item);
    const verdict = normalizeVerdict(item.verdict);

    const verdictColors = {
        SAFE: colors.green,
        SUSPICIOUS: colors.amber,
        DANGEROUS: colors.orange,
        CRITICAL: colors.red,
        UNKNOWN: colors.textMuted,
    };
    const vColor = verdictColors[verdict];

    return (
        <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16, height: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 3, background: colors.accentSoft }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: `1px solid ${colors.border}`,
                cursor: "pointer",
                transition: "background 0.15s ease",
            }}
        >
            {/* Verdict dot */}
            <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: vColor, boxShadow: `0 0 6px ${vColor}80`,
                flexShrink: 0,
            }} />

            {/* Scan type icon */}
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{formatted.scanIcon}</span>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    color: colors.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 3,
                }}>
                    {formatted.displayInput}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: "0.68rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                        {formatted.displayScan}
                    </span>
                    <span style={{ color: colors.textDim }}>·</span>
                    <span style={{ fontSize: "0.68rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                        {formatted.displayTime}
                    </span>
                </div>
            </div>

            {/* Verdict badge */}
            <Badge
                variant={
                    verdict === "SAFE" ? "green" :
                        verdict === "SUSPICIOUS" ? "amber" :
                            verdict === "DANGEROUS" ? "red" :
                                verdict === "CRITICAL" ? "red" : "muted"
                }
                size="sm"
            >
                {verdict}
            </Badge>

            {/* Risk score */}
            {item.riskScore > 0 && (
                <span style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: vColor,
                    minWidth: 32,
                    textAlign: "right",
                }}>
                    {item.riskScore}
                </span>
            )}
        </motion.div>
    );
}

export default function History() {
    const { colors } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const { history, clearHistory } = useScanHistory();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");

    const filtered = useMemo(() => {
        let result = history;

        if (filter !== "ALL") {
            result = result.filter((h) => normalizeVerdict(h.verdict) === filter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((h) =>
                (h.input ?? "").toLowerCase().includes(q)
            );
        }

        return result;
    }, [history, filter, search]);

    const filterCounts = useMemo(() => {
        const counts = { ALL: history.length };
        for (const level of ["SAFE", "SUSPICIOUS", "DANGEROUS", "CRITICAL"]) {
            counts[level] = history.filter((h) => normalizeVerdict(h.verdict) === level).length;
        }
        return counts;
    }, [history]);

    const filterColors = {
        ALL: colors.accent,
        SAFE: colors.green,
        SUSPICIOUS: colors.amber,
        DANGEROUS: colors.orange,
        CRITICAL: colors.red,
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                padding: "88px 32px 60px",
                maxWidth: 900,
                margin: "0 auto",
                minHeight: "100vh",
            }}
        >
            <SectionHead
                label="Investigation Log"
                title="Scan History"
                sub="Every investigation you've run, stored locally on this device."
            />

            {/* Search + filters */}
            <div style={{ marginTop: 28, marginBottom: 16 }}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search scan history..."
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: colors.bgInput,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 10,
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.85rem",
                        outline: "none",
                        marginBottom: 12,
                    }}
                />

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {VERDICT_FILTERS.map((f) => (
                        <motion.button
                            key={f}
                            onClick={() => setFilter(f)}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, f)}
                            onMouseLeave={resetCursor}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: `1px solid ${filter === f ? filterColors[f] + "50" : colors.border}`,
                                background: filter === f ? `${filterColors[f]}15` : "transparent",
                                cursor: "pointer",
                                fontSize: "0.74rem",
                                fontFamily: "var(--font-accent)",
                                fontWeight: 600,
                                color: filter === f ? filterColors[f] : colors.textMuted,
                                letterSpacing: "0.04em",
                            }}
                        >
                            {f} <span style={{ opacity: 0.6 }}>({filterCounts[f] ?? 0})</span>
                        </motion.button>
                    ))}

                    {history.length > 0 && (
                        <motion.button
                            onClick={clearHistory}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                marginLeft: "auto",
                                padding: "6px 14px",
                                borderRadius: 8,
                                border: `1px solid ${colors.border}`,
                                background: "transparent",
                                cursor: "pointer",
                                fontSize: "0.74rem",
                                color: colors.textMuted,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            Clear All
                        </motion.button>
                    )}
                </div>
            </div>

            {/* List */}
            <div style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                overflow: "hidden",
            }}>
                {filtered.length === 0 ? (
                    <div style={{
                        padding: "60px 20px",
                        textAlign: "center",
                        color: colors.textDim,
                    }}>
                        <div style={{ fontSize: "2rem", marginBottom: 12 }}>📭</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: colors.textMuted }}>
                            {history.length === 0
                                ? "No scans yet. Run an investigation to see it here."
                                : "No scans match your filters."}
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filtered.map((item, i) => (
                            <HistoryRow key={item.id} item={item} index={i} colors={colors} />
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}