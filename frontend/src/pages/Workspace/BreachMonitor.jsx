// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Breach Monitor (Page)
// Real breach data from HaveIBeenPwned API.
// Exact breach names, dates, exposed data types. No approximations.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

const BACKEND = "http://127.0.0.1:8000";

// ── Data type icons ───────────────────────────────────────────────────────────
const DATA_TYPE_ICONS = {
    "Email addresses": { icon: "📧", color: "amber" },
    "Passwords": { icon: "🔑", color: "red" },
    "Usernames": { icon: "👤", color: "blue" },
    "Phone numbers": { icon: "📞", color: "purple" },
    "Physical addresses": { icon: "📍", color: "orange" },
    "IP addresses": { icon: "🌐", color: "teal" },
    "Names": { icon: "🪪", color: "blue" },
    "Dates of birth": { icon: "🎂", color: "pink" },
    "Credit cards": { icon: "💳", color: "red" },
    "Social media profiles": { icon: "📱", color: "purple" },
    "Geographic locations": { icon: "🗺️", color: "green" },
    "Government issued IDs": { icon: "🪪", color: "red" },
    "Financial data": { icon: "💰", color: "red" },
    "Health & fitness": { icon: "🏃", color: "green" },
    "Security questions": { icon: "❓", color: "amber" },
    "Auth tokens": { icon: "🔐", color: "red" },
};

function getDataTypeConfig(type) {
    return DATA_TYPE_ICONS[type] ?? { icon: "📄", color: "muted" };
}

// ── Severity based on breach data types ──────────────────────────────────────
function getBreachSeverity(dataClasses = []) {
    if (dataClasses.some(d => ["Passwords", "Credit cards", "Financial data", "Government issued IDs", "Auth tokens"].includes(d))) {
        return { level: "CRITICAL", color: "red", label: "Critical" };
    }
    if (dataClasses.some(d => ["Phone numbers", "Physical addresses", "Dates of birth"].includes(d))) {
        return { level: "HIGH", color: "orange", label: "High" };
    }
    if (dataClasses.some(d => ["Email addresses", "Usernames", "Names"].includes(d))) {
        return { level: "MEDIUM", color: "amber", label: "Medium" };
    }
    return { level: "LOW", color: "blue", label: "Low" };
}

// ── Breach Card ───────────────────────────────────────────────────────────────
function BreachCard({ breach, index, colors }) {
    const [expanded, setExpanded] = useState(false);
    const severity = getBreachSeverity(breach.DataClasses ?? []);
    const color = colors[severity.color] ?? colors.accent;
    const softColor = colors[severity.color + "Soft"] ?? colors.accentSoft;
    const date = breach.BreachDate ? new Date(breach.BreachDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "Unknown";
    const pwnCount = breach.PwnCount ? breach.PwnCount.toLocaleString() : "Unknown";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => setExpanded(e => !e)}
            style={{
                background: colors.bgCard,
                border: `1px solid ${expanded ? color + "40" : colors.border}`,
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                boxShadow: expanded ? `0 0 24px ${color}10` : "none",
            }}
        >
            {/* Top severity bar */}
            <div style={{
                height: 3,
                background: `linear-gradient(90deg, ${color}, ${color}60)`,
            }} />

            <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Logo placeholder */}
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: softColor,
                        border: `1px solid ${color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.2rem", flexShrink: 0,
                    }}>
                        {breach.LogoPath
                            ? <img src={breach.LogoPath} alt={breach.Name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "contain" }} onError={e => e.target.style.display = "none"} />
                            : "🔓"
                        }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                            <span style={{
                                fontFamily: "var(--font-display)", fontSize: "0.92rem",
                                fontWeight: 700, color: colors.text,
                            }}>
                                {breach.Title ?? breach.Name}
                            </span>
                            <span style={{
                                fontFamily: "var(--font-accent)", fontSize: "0.58rem",
                                fontWeight: 700, color,
                                background: softColor,
                                border: `1px solid ${color}30`,
                                padding: "1px 7px", borderRadius: 4,
                                letterSpacing: "0.06em",
                            }}>
                                {severity.label}
                            </span>
                            {breach.IsSensitive && (
                                <span style={{
                                    fontFamily: "var(--font-accent)", fontSize: "0.58rem",
                                    color: colors.red,
                                    background: colors.redSoft,
                                    border: `1px solid ${colors.red}30`,
                                    padding: "1px 7px", borderRadius: 4,
                                }}>
                                    SENSITIVE
                                </span>
                            )}
                        </div>
                        <div style={{
                            display: "flex", gap: 14, alignItems: "center",
                            fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted,
                        }}>
                            <span>📅 {date}</span>
                            <span>👥 {pwnCount} accounts</span>
                            <span>{breach.DataClasses?.length ?? 0} data types</span>
                        </div>
                    </div>

                    <motion.div
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: colors.textMuted, fontSize: "0.75rem", flexShrink: 0 }}
                    >
                        ▼
                    </motion.div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: "hidden" }}
                        >
                            <div style={{ paddingTop: 14, marginTop: 14, borderTop: `1px solid ${colors.border}` }}>
                                {/* Description */}
                                {breach.Description && (
                                    <p style={{
                                        fontFamily: "var(--font-body)", fontSize: "0.8rem",
                                        color: colors.textSub, lineHeight: 1.6,
                                        margin: "0 0 14px",
                                    }}
                                        dangerouslySetInnerHTML={{
                                            __html: breach.Description.replace(/<[^>]*>/g, "").slice(0, 300) + "..."
                                        }}
                                    />
                                )}

                                {/* Exposed data types */}
                                <div style={{ marginBottom: 4, fontFamily: "var(--font-accent)", fontSize: "0.62rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                                    Exposed Data
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {(breach.DataClasses ?? []).map((type) => {
                                        const cfg = getDataTypeConfig(type);
                                        const tc = colors[cfg.color] ?? colors.accent;
                                        const ts = colors[cfg.color + "Soft"] ?? colors.accentSoft;
                                        return (
                                            <span key={type} style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                padding: "3px 9px",
                                                background: ts, border: `1px solid ${tc}25`,
                                                borderRadius: 5,
                                                fontFamily: "var(--font-body)", fontSize: "0.72rem",
                                                color: tc,
                                            }}>
                                                <span style={{ fontSize: "0.75rem" }}>{cfg.icon}</span>
                                                {type}
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Action */}
                                <div style={{
                                    marginTop: 12, padding: "10px 12px",
                                    background: colors.redSoft,
                                    border: `1px solid ${colors.red}20`,
                                    borderRadius: 8,
                                    fontFamily: "var(--font-body)", fontSize: "0.76rem",
                                    color: colors.red, lineHeight: 1.5,
                                }}>
                                    ⚠️ <strong>Action required:</strong> If you used the same password elsewhere, change it immediately. Enable 2FA on all accounts using this email.
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BreachMonitor() {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);  // null | { breaches: [], pastebreaches: [] }
    const [error, setError] = useState(null);
    const [checked, setChecked] = useState(false);
    const inputRef = useRef(null);

    async function handleCheck() {
        const em = email.trim().toLowerCase();
        if (!em || loading) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setChecked(false);

        try {
            const res = await fetch(`${BACKEND}/breach/check?email=${encodeURIComponent(em)}`);
            if (!res.ok) {
                if (res.status === 404) {
                    setResult({ breaches: [], pastes: [] });
                    setChecked(true);
                    return;
                }
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }
            const data = await res.json();
            setResult(data);
            setChecked(true);
        } catch (err) {
            setError(err.message ?? "Failed to check. Make sure your backend is running.");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleCheck();
    }

    const breaches = result?.breaches ?? [];
    const criticalCount = breaches.filter(b => getBreachSeverity(b.DataClasses).level === "CRITICAL").length;
    const totalAccounts = breaches.reduce((sum, b) => sum + (b.PwnCount ?? 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "88px 32px 60px", maxWidth: 860, margin: "0 auto", minHeight: "100vh" }}
        >
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40, textAlign: "center" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 14px", background: colors.redSoft,
                    border: `1px solid ${colors.red}30`, borderRadius: 999, marginBottom: 16,
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.red, display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.red }}>
                        Breach Intelligence
                    </span>
                </div>

                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                    fontWeight: 900, letterSpacing: "-0.02em",
                    color: colors.text, margin: "0 0 10px",
                }}>
                    Breach Monitor
                </h1>
                <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.95rem",
                    color: colors.textSub, maxWidth: 480, margin: "0 auto",
                    lineHeight: 1.6,
                }}>
                    Check any email against <strong style={{ color: colors.text }}>13+ billion leaked credentials</strong> from real data breaches. Powered by HaveIBeenPwned.
                </p>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: 32 }}
            >
                <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <span style={{
                            position: "absolute", left: 16, top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: "1rem", pointerEvents: "none",
                        }}>
                            📧
                        </span>
                        <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(null); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter email address to check..."
                            style={{
                                width: "100%",
                                padding: "16px 16px 16px 46px",
                                background: colors.bgInput,
                                color: colors.text,
                                border: `1px solid ${error ? colors.red + "50" : colors.border}`,
                                borderRadius: 14,
                                fontFamily: "var(--font-mono)", fontSize: "0.92rem",
                                outline: "none",
                                transition: "border-color 0.2s ease",
                            }}
                            onFocus={e => { e.target.style.borderColor = colors.borderHover; e.target.style.boxShadow = `0 0 0 3px ${colors.accentSoft}`; }}
                            onBlur={e => { e.target.style.borderColor = error ? colors.red + "50" : colors.border; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    <motion.button
                        onClick={handleCheck}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "CHECK")}
                        onMouseLeave={resetCursor}
                        whileHover={email.trim() && !loading ? { scale: 1.03, y: -1 } : {}}
                        whileTap={email.trim() && !loading ? { scale: 0.97 } : {}}
                        disabled={!email.trim() || loading}
                        style={{
                            padding: "0 28px",
                            background: email.trim() && !loading ? gradients.danger ?? `linear-gradient(135deg, #ff0033, #ff4444)` : colors.bgSurface,
                            border: "none", borderRadius: 14,
                            color: email.trim() && !loading ? "#fff" : colors.textMuted,
                            fontFamily: "var(--font-accent)", fontSize: "0.8rem", fontWeight: 700,
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            cursor: email.trim() && !loading ? "pointer" : "not-allowed",
                            boxShadow: email.trim() && !loading ? `0 8px 24px ${colors.redGlow}` : "none",
                            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8,
                            transition: "all 0.2s ease",
                        }}
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                                    style={{
                                        width: 16, height: 16, borderRadius: "50%",
                                        border: "2px solid rgba(255,255,255,0.3)",
                                        borderTopColor: "#fff",
                                    }}
                                />
                                Checking...
                            </>
                        ) : "🔍 Check Now"}
                    </motion.button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: 8, padding: "8px 14px",
                            background: colors.redSoft, border: `1px solid ${colors.red}30`,
                            borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                            color: colors.red,
                        }}
                    >
                        ⚠ {error}
                    </motion.div>
                )}

                <div style={{
                    marginTop: 10, textAlign: "center",
                    fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                    color: colors.textDim,
                }}>
                    🔒 Your email is never stored or logged. Checked securely via HaveIBeenPwned.
                </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {checked && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {breaches.length === 0 ? (
                            /* Clean result */
                            <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                style={{
                                    textAlign: "center", padding: "48px 32px",
                                    background: colors.bgCard,
                                    border: `1px solid ${colors.green}30`,
                                    borderRadius: 20,
                                    boxShadow: `0 0 40px ${colors.greenSoft}`,
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                                    style={{ fontSize: "3.5rem", marginBottom: 16 }}
                                >
                                    ✅
                                </motion.div>
                                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 800, color: colors.green, margin: "0 0 10px" }}>
                                    No Breaches Found
                                </h2>
                                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: colors.textSub, margin: "0 0 20px", lineHeight: 1.6 }}>
                                    <strong style={{ color: colors.text }}>{email}</strong> was not found in any known data breaches. Your email appears clean.
                                </p>
                                <div style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "8px 16px",
                                    background: colors.greenSoft, border: `1px solid ${colors.green}30`,
                                    borderRadius: 999, fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.green,
                                }}>
                                    💡 Check again periodically — new breaches are discovered regularly
                                </div>
                            </motion.div>
                        ) : (
                            /* Breach results */
                            <div>
                                {/* Summary bar */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                        gap: 12, marginBottom: 24,
                                        padding: "20px",
                                        background: colors.bgCard,
                                        border: `1px solid ${colors.red}30`,
                                        borderRadius: 16,
                                        boxShadow: `0 0 40px ${colors.redSoft}`,
                                    }}
                                >
                                    {[
                                        { label: "Breaches Found", value: breaches.length, color: colors.red, icon: "🔓" },
                                        { label: "Critical Severity", value: criticalCount, color: colors.red, icon: "⚠️" },
                                        { label: "Accounts Exposed", value: totalAccounts > 0 ? (totalAccounts / 1000000).toFixed(1) + "M" : "—", color: colors.orange, icon: "👥" },
                                        { label: "Oldest Breach", value: breaches.length > 0 ? new Date(Math.min(...breaches.map(b => new Date(b.BreachDate ?? "2099")))).getFullYear() : "—", color: colors.amber, icon: "📅" },
                                    ].map((s, i) => (
                                        <motion.div
                                            key={s.label}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            style={{ textAlign: "center" }}
                                        >
                                            <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{s.icon}</div>
                                            <div style={{ fontFamily: "var(--font-accent)", fontSize: "1.4rem", fontWeight: 800, color: s.color }}>
                                                {s.value}
                                            </div>
                                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                                {s.label}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Warning */}
                                <div style={{
                                    padding: "12px 16px", marginBottom: 20,
                                    background: colors.redSoft, border: `1px solid ${colors.red}25`,
                                    borderRadius: 10,
                                    fontFamily: "var(--font-body)", fontSize: "0.82rem",
                                    color: colors.red, lineHeight: 1.5,
                                }}>
                                    🚨 <strong>{email}</strong> was found in <strong>{breaches.length} data breach{breaches.length > 1 ? "es" : ""}</strong>. Review each breach below and take action immediately.
                                </div>

                                {/* Breach cards */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {breaches
                                        .sort((a, b) => {
                                            const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                                            return order[getBreachSeverity(a.DataClasses).level] - order[getBreachSeverity(b.DataClasses).level];
                                        })
                                        .map((breach, i) => (
                                            <BreachCard key={breach.Name} breach={breach} index={i} colors={colors} />
                                        ))
                                    }
                                </div>

                                {/* Recommendations */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    style={{
                                        marginTop: 24, padding: "20px",
                                        background: colors.bgCard,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 16,
                                    }}
                                >
                                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: colors.text, margin: "0 0 14px" }}>
                                        🛡️ Recommended Actions
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        {[
                                            { num: "01", text: "Change passwords for all accounts using this email, especially if you reuse passwords." },
                                            { num: "02", text: "Enable two-factor authentication (2FA) on every important account." },
                                            { num: "03", text: "Use a password manager to generate unique passwords for every site." },
                                            { num: "04", text: "Monitor your accounts for suspicious login activity over the next 30 days." },
                                            { num: "05", text: "Consider using a different email alias for less important services." },
                                        ].map(({ num, text }) => (
                                            <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                                <span style={{
                                                    fontFamily: "var(--font-accent)", fontSize: "0.65rem",
                                                    color: colors.accent, background: colors.accentSoft,
                                                    padding: "2px 7px", borderRadius: 4, fontWeight: 700,
                                                    flexShrink: 0, marginTop: 1,
                                                }}>
                                                    {num}
                                                </span>
                                                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: colors.textSub, lineHeight: 1.5 }}>
                                                    {text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}