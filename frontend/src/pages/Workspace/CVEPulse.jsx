// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — CVE Pulse (Page)
// Real vulnerability intelligence from NIST NVD API.
// 100% free. No API key. Exact CVE IDs, CVSS scores, severity.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

const BACKEND = "http://127.0.0.1:8000";

const SEVERITY_CONFIG = {
    CRITICAL: { color: "red", bg: "redSoft", icon: "💀", order: 0 },
    HIGH: { color: "orange", bg: "orangeSoft", icon: "🔴", order: 1 },
    MEDIUM: { color: "amber", bg: "amberSoft", icon: "🟡", order: 2 },
    LOW: { color: "blue", bg: "blueSoft", icon: "🔵", order: 3 },
    NONE: { color: "textMuted", bg: "bgSurface", icon: "⚪", order: 4 },
};

const POPULAR_SEARCHES = [
    "Chrome", "Windows", "Apache", "WordPress", "OpenSSL",
    "Android", "iOS", "Linux kernel", "nginx", "PHP",
];

const DAY_FILTERS = [
    { label: "Last 7 days", value: 7 },
    { label: "Last 30 days", value: 30 },
    { label: "Last 90 days", value: 90 },
    { label: "All time", value: 0 },
];

const SEVERITY_FILTERS = [
    { label: "All", value: null },
    { label: "Critical", value: "CRITICAL" },
    { label: "High", value: "HIGH" },
    { label: "Medium", value: "MEDIUM" },
    { label: "Low", value: "LOW" },
];

// ── CVE Card ──────────────────────────────────────────────────────────────────
function CVECard({ cve, index, colors }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = SEVERITY_CONFIG[cve.severity] ?? SEVERITY_CONFIG.NONE;
    const color = colors[cfg.color] ?? colors.accent;
    const soft = colors[cfg.bg] ?? colors.accentSoft;

    const published = cve.published
        ? new Date(cve.published).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
        : "Unknown";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => setExpanded(e => !e)}
            style={{
                background: colors.bgCard,
                border: `1px solid ${expanded ? color + "40" : colors.border}`,
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                boxShadow: expanded ? `0 0 20px ${color}10` : "none",
            }}
        >
            {/* Severity bar */}
            <div style={{ height: 3, background: color, opacity: 0.8 }} />

            <div style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* CVSS Score */}
                    <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        background: soft,
                        border: `1px solid ${color}30`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <span style={{
                            fontFamily: "var(--font-accent)", fontSize: "1rem",
                            fontWeight: 800, color, lineHeight: 1,
                        }}>
                            {cve.score > 0 ? cve.score.toFixed(1) : "N/A"}
                        </span>
                        <span style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.5rem",
                            color: colors.textMuted, letterSpacing: "0.06em",
                        }}>
                            CVSS
                        </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                            {/* CVE ID */}
                            <span style={{
                                fontFamily: "var(--font-mono)", fontSize: "0.82rem",
                                fontWeight: 700, color: colors.text,
                            }}>
                                {cve.id}
                            </span>

                            {/* Severity badge */}
                            <span style={{
                                fontFamily: "var(--font-accent)", fontSize: "0.6rem",
                                fontWeight: 700, color,
                                background: soft, border: `1px solid ${color}30`,
                                padding: "1px 8px", borderRadius: 4,
                                letterSpacing: "0.06em",
                            }}>
                                {cfg.icon} {cve.severity}
                            </span>

                            {/* Status */}
                            {cve.status && (
                                <span style={{
                                    fontFamily: "var(--font-mono)", fontSize: "0.6rem",
                                    color: colors.textMuted, background: colors.bgSurface,
                                    border: `1px solid ${colors.border}`,
                                    padding: "1px 8px", borderRadius: 4,
                                }}>
                                    {cve.status}
                                </span>
                            )}

                            <span style={{
                                marginLeft: "auto",
                                fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                                color: colors.textMuted, flexShrink: 0,
                            }}>
                                {published}
                            </span>
                        </div>

                        {/* Description */}
                        <p style={{
                            fontFamily: "var(--font-body)", fontSize: "0.8rem",
                            color: colors.textSub, lineHeight: 1.5, margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: expanded ? "none" : 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}>
                            {cve.description}
                        </p>
                    </div>

                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: colors.textMuted, fontSize: "0.75rem", flexShrink: 0, marginTop: 4 }}
                    >
                        ▼
                    </motion.div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={{ paddingTop: 14, marginTop: 14, borderTop: `1px solid ${colors.border}` }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
                                    {/* CVSS Details */}
                                    {cve.cvss?.attack_vector && (
                                        <div style={{ padding: "10px 12px", background: colors.bgSurface, border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                                            <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                                                CVSS v{cve.cvss.version} Details
                                            </div>
                                            {[
                                                { label: "Attack Vector", value: cve.cvss.attack_vector },
                                                { label: "Complexity", value: cve.cvss.attack_complexity },
                                                { label: "Privileges", value: cve.cvss.privileges },
                                                { label: "User Interaction", value: cve.cvss.user_interaction },
                                            ].filter(r => r.value).map(({ label, value }) => (
                                                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.textMuted }}>{label}</span>
                                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.text, fontWeight: 600 }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Impact */}
                                    {(cve.cvss?.confidentiality || cve.cvss?.integrity || cve.cvss?.availability) && (
                                        <div style={{ padding: "10px 12px", background: colors.bgSurface, border: `1px solid ${colors.border}`, borderRadius: 8 }}>
                                            <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                                                Impact
                                            </div>
                                            {[
                                                { label: "Confidentiality", value: cve.cvss.confidentiality },
                                                { label: "Integrity", value: cve.cvss.integrity },
                                                { label: "Availability", value: cve.cvss.availability },
                                            ].filter(r => r.value).map(({ label, value }) => (
                                                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.textMuted }}>{label}</span>
                                                    <span style={{
                                                        fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 600,
                                                        color: value === "HIGH" || value === "COMPLETE" ? colors.red : value === "LOW" || value === "PARTIAL" ? colors.amber : colors.green,
                                                    }}>
                                                        {value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* CWEs */}
                                {cve.cwes?.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginRight: 8 }}>
                                            Weakness
                                        </span>
                                        {cve.cwes.map(cwe => (
                                            <span key={cwe} style={{
                                                fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                                                color: colors.purple, background: colors.purpleSoft,
                                                border: `1px solid ${colors.purple}25`,
                                                padding: "2px 8px", borderRadius: 4, marginRight: 6,
                                            }}>
                                                {cwe}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Affected software */}
                                {cve.affected_software?.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                            Affected Software
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {cve.affected_software.slice(0, 6).map((sw, i) => (
                                                <span key={i} style={{
                                                    fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                                                    color: colors.text, background: colors.bgSurface,
                                                    border: `1px solid ${colors.border}`,
                                                    padding: "2px 8px", borderRadius: 4,
                                                }}>
                                                    {sw.vendor}/{sw.product} {sw.version !== "*" ? sw.version : ""}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* References */}
                                {cve.references?.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                            References
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                            {cve.references.slice(0, 3).map((ref, i) => (
                                                <a
                                                    key={i}
                                                    href={ref.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    style={{
                                                        fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                                                        color: colors.accent, textDecoration: "none",
                                                        overflow: "hidden", textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap", display: "block",
                                                    }}
                                                >
                                                    ↗ {ref.url}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* NVD link */}
                                <a
                                    href={cve.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: 5,
                                        padding: "6px 12px",
                                        background: colors.accentSoft, border: `1px solid ${colors.borderHover}`,
                                        borderRadius: 7, textDecoration: "none",
                                        fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                                        color: colors.accent, fontWeight: 600,
                                    }}
                                >
                                    View on NIST NVD ↗
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CVEPulse() {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [recentCVEs, setRecentCVEs] = useState(null);
    const [dayFilter, setDayFilter] = useState(90);
    const [sevFilter, setSevFilter] = useState(null);
    const [loadingRecent, setLoadingRecent] = useState(false);

    // Load recent critical CVEs on mount
    useEffect(() => {
        loadRecent();
    }, []);

    async function loadRecent() {
        setLoadingRecent(true);
        try {
            const res = await fetch(`${BACKEND}/cve/recent?days=7`);
            if (res.ok) {
                const data = await res.json();
                setRecentCVEs(data);
            }
        } catch (e) {
            // silently fail — user can still search
        } finally {
            setLoadingRecent(false);
        }
    }

    async function handleSearch(kw) {
        const q = (kw ?? keyword).trim();
        if (!q || loading) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const params = new URLSearchParams({
                keyword: q,
                days: dayFilter,
                limit: 20,
            });
            if (sevFilter) params.append("severity", sevFilter);

            const res = await fetch(`${BACKEND}/cve/search?${params}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail ?? "Search failed");
            }
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message ?? "Failed. Make sure backend is running.");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleSearch();
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "88px 32px 60px", maxWidth: 1000, margin: "0 auto", minHeight: "100vh" }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 36, textAlign: "center" }}
            >
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 14px", background: colors.orangeSoft,
                    border: `1px solid ${colors.orange}30`, borderRadius: 999, marginBottom: 16,
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.orange, display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.orange }}>
                        Vulnerability Intelligence
                    </span>
                </div>
                <h1 style={{
                    fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                    fontWeight: 900, letterSpacing: "-0.02em", color: colors.text, margin: "0 0 10px",
                }}>
                    CVE Pulse
                </h1>
                <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.95rem",
                    color: colors.textSub, maxWidth: 500, margin: "0 auto", lineHeight: 1.6,
                }}>
                    Real-time vulnerability intelligence from <strong style={{ color: colors.text }}>NIST National Vulnerability Database</strong>. Exact CVE IDs, CVSS scores, affected versions. Completely free.
                </p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: 28 }}
            >
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <span style={{
                            position: "absolute", left: 16, top: "50%",
                            transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none",
                        }}>🔍</span>
                        <input
                            type="text"
                            value={keyword}
                            onChange={e => { setKeyword(e.target.value); setError(null); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Search CVEs (e.g. chrome, wordpress, apache, openssl)..."
                            style={{
                                width: "100%", padding: "14px 14px 14px 46px",
                                background: colors.bgInput, color: colors.text,
                                border: `1px solid ${colors.border}`, borderRadius: 12,
                                fontFamily: "var(--font-mono)", fontSize: "0.9rem",
                                outline: "none", transition: "border-color 0.2s ease",
                            }}
                            onFocus={e => { e.target.style.borderColor = colors.borderHover; e.target.style.boxShadow = `0 0 0 3px ${colors.accentSoft}`; }}
                            onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = "none"; }}
                        />
                    </div>
                    <motion.button
                        onClick={() => handleSearch()}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "SEARCH")}
                        onMouseLeave={resetCursor}
                        whileHover={keyword.trim() && !loading ? { scale: 1.03, y: -1 } : {}}
                        whileTap={keyword.trim() && !loading ? { scale: 0.97 } : {}}
                        disabled={!keyword.trim() || loading}
                        style={{
                            padding: "0 24px",
                            background: keyword.trim() && !loading ? "var(--gradient-primary)" : colors.bgSurface,
                            border: "none", borderRadius: 12,
                            color: keyword.trim() && !loading ? "#fff" : colors.textMuted,
                            fontFamily: "var(--font-accent)", fontSize: "0.78rem", fontWeight: 700,
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            cursor: keyword.trim() && !loading ? "pointer" : "not-allowed",
                            boxShadow: keyword.trim() && !loading ? `0 8px 24px ${colors.accentGlow}` : "none",
                            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8,
                            transition: "all 0.2s ease",
                        }}
                    >
                        {loading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                                style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                            />
                        ) : "Search"}
                    </motion.button>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    {/* Day filter */}
                    <div style={{ display: "flex", gap: 4 }}>
                        {DAY_FILTERS.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setDayFilter(f.value)}
                                style={{
                                    padding: "4px 10px", borderRadius: 6,
                                    background: dayFilter === f.value ? colors.accentSoft : "transparent",
                                    border: `1px solid ${dayFilter === f.value ? colors.borderHover : colors.border}`,
                                    color: dayFilter === f.value ? colors.accent : colors.textMuted,
                                    fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                                    cursor: "pointer", transition: "all 0.15s ease",
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ width: 1, height: 20, background: colors.border }} />

                    {/* Severity filter */}
                    <div style={{ display: "flex", gap: 4 }}>
                        {SEVERITY_FILTERS.map(f => {
                            const cfg = f.value ? SEVERITY_CONFIG[f.value] : null;
                            const c = cfg ? colors[cfg.color] : colors.accent;
                            const isActive = sevFilter === f.value;
                            return (
                                <button
                                    key={f.label}
                                    onClick={() => setSevFilter(f.value)}
                                    style={{
                                        padding: "4px 10px", borderRadius: 6,
                                        background: isActive ? (cfg ? colors[cfg.bg] : colors.accentSoft) : "transparent",
                                        border: `1px solid ${isActive ? c + "50" : colors.border}`,
                                        color: isActive ? c : colors.textMuted,
                                        fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                                        cursor: "pointer", transition: "all 0.15s ease",
                                    }}
                                >
                                    {f.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            marginTop: 10, padding: "8px 14px",
                            background: colors.redSoft, border: `1px solid ${colors.red}30`,
                            borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: colors.red,
                        }}
                    >
                        ⚠ {error}
                    </motion.div>
                )}

                {/* Popular searches */}
                {!result && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted }}>
                            Popular:
                        </span>
                        {POPULAR_SEARCHES.map(s => (
                            <button
                                key={s}
                                onClick={() => { setKeyword(s); handleSearch(s); }}
                                style={{
                                    padding: "3px 10px", background: colors.bgSurface,
                                    border: `1px solid ${colors.border}`, borderRadius: 999,
                                    fontSize: "0.7rem", color: colors.textSub,
                                    fontFamily: "var(--font-mono)", cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                                onMouseEnter={e => { e.target.style.borderColor = colors.borderHover; e.target.style.color = colors.accent; }}
                                onMouseLeave={e => { e.target.style.borderColor = colors.border; e.target.style.color = colors.textSub; }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Recent critical CVEs — shown when no search */}
            {!result && !loading && (
                <div>
                    <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.65rem", color: colors.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ width: 6, height: 6, borderRadius: "50%", background: colors.red }} />
                        Critical & High CVEs — Last 7 Days
                    </div>

                    {loadingRecent ? (
                        <div style={{ textAlign: "center", padding: "40px", color: colors.textMuted, fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                            Loading recent vulnerabilities...
                        </div>
                    ) : recentCVEs ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[...(recentCVEs.critical ?? []), ...(recentCVEs.high ?? [])].slice(0, 10).map((cve, i) => (
                                <CVECard key={cve.id} cve={cve} index={i} colors={colors} />
                            ))}
                            {(recentCVEs.critical?.length ?? 0) + (recentCVEs.high?.length ?? 0) === 0 && (
                                <div style={{ textAlign: "center", padding: "32px", color: colors.textMuted, fontFamily: "var(--font-mono)", fontSize: "0.78rem", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 12 }}>
                                    No critical/high CVEs in the last 7 days. Search for specific software above.
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Search results */}
            {loading && (
                <div style={{ textAlign: "center", padding: "48px", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16 }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                        style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${colors.border}`, borderTopColor: colors.accent, margin: "0 auto 14px" }}
                    />
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: colors.textSub }}>
                        Searching NIST NVD database...
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {result && !loading && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Stats bar */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 16,
                            padding: "14px 18px", marginBottom: 16,
                            background: colors.bgCard, border: `1px solid ${colors.border}`,
                            borderRadius: 12, flexWrap: "wrap",
                        }}>
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: colors.text, fontWeight: 600 }}>
                                {result.showing} results for "{result.keyword}"
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: colors.textMuted }}>
                                {result.total.toLocaleString()} total in NVD
                            </span>
                            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                                {[
                                    { label: "CRIT", value: result.stats?.critical, color: colors.red },
                                    { label: "HIGH", value: result.stats?.high, color: colors.orange },
                                    { label: "MED", value: result.stats?.medium, color: colors.amber },
                                ].map(s => s.value > 0 && (
                                    <span key={s.label} style={{
                                        fontFamily: "var(--font-accent)", fontSize: "0.62rem",
                                        color: s.color, background: `${s.color}15`,
                                        border: `1px solid ${s.color}30`,
                                        padding: "2px 8px", borderRadius: 4, fontWeight: 700,
                                    }}>
                                        {s.value} {s.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {result.cves.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 14, color: colors.textMuted, fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                                No CVEs found for "{result.keyword}" with current filters. Try a different time range or remove the severity filter.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {result.cves.map((cve, i) => (
                                    <CVECard key={cve.id} cve={cve} index={i} colors={colors} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}