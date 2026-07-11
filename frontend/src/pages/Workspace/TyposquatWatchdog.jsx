// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Typosquat Watchdog (Page)
// 100% free. No API key. Pure algorithmic + DNS.
// Generates 200+ permutations, checks which are registered via DNS.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

const BACKEND = "http://127.0.0.1:8000";

const RISK_CONFIG = {
    CRITICAL: { color: "red", icon: "🚨", label: "Critical Risk", desc: "10+ lookalike domains registered — active impersonation risk" },
    HIGH: { color: "orange", icon: "⚠️", label: "High Risk", desc: "Multiple lookalike domains registered" },
    MEDIUM: { color: "amber", icon: "⚡", label: "Medium Risk", desc: "Some lookalike domains found" },
    SAFE: { color: "green", icon: "✅", label: "Clean", desc: "No lookalike domains found" },
};

function DomainRow({ item, index, colors }) {
    const isLive = item.live === true;
    const color = isLive ? colors.red : colors.amber;
    const soft = isLive ? colors.redSoft : colors.amberSoft;

    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03, duration: 0.25 }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                background: index % 2 === 0 ? "transparent" : `${colors.bgSurface}50`,
                borderBottom: `1px solid ${colors.border}`,
            }}
        >
            {/* Risk dot */}
            <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: color, boxShadow: `0 0 6px ${color}`,
                flexShrink: 0,
            }} />

            {/* Domain */}
            <span style={{
                fontFamily: "var(--font-mono)", fontSize: "0.82rem",
                color: colors.text, flex: 1,
            }}>
                {item.domain}
            </span>

            {/* Status */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{
                    fontFamily: "var(--font-accent)", fontSize: "0.6rem",
                    fontWeight: 700, letterSpacing: "0.06em",
                    color, background: soft,
                    border: `1px solid ${color}30`,
                    padding: "2px 8px", borderRadius: 4,
                }}>
                    {item.live === true ? "LIVE SITE" : item.live === false ? "REGISTERED" : "REGISTERED"}
                </span>
                <span style={{
                    fontFamily: "var(--font-accent)", fontSize: "0.6rem",
                    fontWeight: 700, color: color,
                    background: soft, border: `1px solid ${color}30`,
                    padding: "2px 8px", borderRadius: 4,
                }}>
                    {item.risk}
                </span>
            </div>
        </motion.div>
    );
}

export default function TyposquatWatchdog() {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [checkLive, setCheckLive] = useState(false);

    async function handleCheck() {
        const d = domain.trim().toLowerCase();
        if (!d || loading) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(
                `${BACKEND}/typosquat/check?domain=${encodeURIComponent(d)}&check_live=${checkLive}`
            );
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail ?? "Check failed");
            }
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message ?? "Failed to check. Make sure backend is running.");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") handleCheck();
    }

    const riskCfg = result ? RISK_CONFIG[result.risk_level] ?? RISK_CONFIG.SAFE : null;
    const rColor = riskCfg ? colors[riskCfg.color] ?? colors.accent : colors.accent;
    const rSoft = riskCfg ? colors[riskCfg.color + "Soft"] ?? colors.accentSoft : colors.accentSoft;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "88px 32px 60px", maxWidth: 900, margin: "0 auto", minHeight: "100vh" }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 40, textAlign: "center" }}
            >
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 14px", background: colors.amberSoft,
                    border: `1px solid ${colors.amber}30`, borderRadius: 999, marginBottom: 16,
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.amber, display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.amber }}>
                        Domain Intelligence
                    </span>
                </div>

                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                    fontWeight: 900, letterSpacing: "-0.02em",
                    color: colors.text, margin: "0 0 10px",
                }}>
                    Typosquat Watchdog
                </h1>
                <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.95rem",
                    color: colors.textSub, maxWidth: 520, margin: "0 auto", lineHeight: 1.6,
                }}>
                    Enter your domain — we generate <strong style={{ color: colors.text }}>200+ permutations</strong> and check which ones are registered via DNS. Catch brand impersonation before your users do.
                </p>
            </motion.div>

            {/* Input */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: 32 }}
            >
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <span style={{
                            position: "absolute", left: 16, top: "50%",
                            transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none",
                        }}>🌐</span>
                        <input
                            type="text"
                            value={domain}
                            onChange={e => { setDomain(e.target.value); setError(null); }}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter domain (e.g. sentinel.ai, google.com)"
                            style={{
                                width: "100%", padding: "16px 16px 16px 46px",
                                background: colors.bgInput, color: colors.text,
                                border: `1px solid ${error ? colors.red + "50" : colors.border}`,
                                borderRadius: 14, fontFamily: "var(--font-mono)", fontSize: "0.92rem",
                                outline: "none", transition: "border-color 0.2s ease",
                            }}
                            onFocus={e => { e.target.style.borderColor = colors.borderHover; e.target.style.boxShadow = `0 0 0 3px ${colors.accentSoft}`; }}
                            onBlur={e => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = "none"; }}
                        />
                    </div>

                    <motion.button
                        onClick={handleCheck}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "SCAN")}
                        onMouseLeave={resetCursor}
                        whileHover={domain.trim() && !loading ? { scale: 1.03, y: -1 } : {}}
                        whileTap={domain.trim() && !loading ? { scale: 0.97 } : {}}
                        disabled={!domain.trim() || loading}
                        style={{
                            padding: "0 28px",
                            background: domain.trim() && !loading ? "var(--gradient-primary)" : colors.bgSurface,
                            border: "none", borderRadius: 14,
                            color: domain.trim() && !loading ? "#fff" : colors.textMuted,
                            fontFamily: "var(--font-accent)", fontSize: "0.8rem", fontWeight: 700,
                            letterSpacing: "0.05em", textTransform: "uppercase",
                            cursor: domain.trim() && !loading ? "pointer" : "not-allowed",
                            boxShadow: domain.trim() && !loading ? `0 8px 24px ${colors.accentGlow}` : "none",
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
                                Scanning...
                            </>
                        ) : "👁️ Scan Domain"}
                    </motion.button>
                </div>

                {/* Check live toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <motion.button
                        onClick={() => setCheckLive(v => !v)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            width: 36, height: 20, borderRadius: 999,
                            background: checkLive ? colors.accent : colors.bgSurface,
                            border: `1px solid ${checkLive ? colors.accent : colors.border}`,
                            cursor: "pointer", position: "relative", transition: "all 0.2s ease",
                        }}
                    >
                        <motion.div
                            animate={{ x: checkLive ? 17 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{
                                position: "absolute", top: 2, width: 14, height: 14,
                                borderRadius: "50%", background: "#fff",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                            }}
                        />
                    </motion.button>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: colors.textSub }}>
                        Also check if registered domains serve live websites <span style={{ color: colors.textMuted }}>(slower)</span>
                    </span>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: 10, padding: "8px 14px",
                            background: colors.redSoft, border: `1px solid ${colors.red}30`,
                            borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: colors.red,
                        }}
                    >
                        ⚠ {error}
                    </motion.div>
                )}
            </motion.div>

            {/* Loading state */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: "center", padding: "48px",
                        background: colors.bgCard, border: `1px solid ${colors.border}`,
                        borderRadius: 16,
                    }}
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                        style={{
                            width: 48, height: 48, borderRadius: "50%",
                            border: `3px solid ${colors.border}`,
                            borderTopColor: colors.accent,
                            margin: "0 auto 16px",
                        }}
                    />
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                        Scanning Domain Permutations
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: colors.textMuted }}>
                        Generating variations and resolving DNS for each one...
                    </div>
                </motion.div>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
                {result && !loading && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Summary card */}
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                padding: "24px",
                                background: colors.bgCard,
                                border: `1px solid ${rColor}30`,
                                borderRadius: 18,
                                marginBottom: 20,
                                boxShadow: `0 0 40px ${rSoft}`,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                <div style={{ fontSize: "2.5rem" }}>{riskCfg?.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontFamily: "var(--font-display)", fontSize: "1.2rem",
                                        fontWeight: 800, color: rColor, marginBottom: 4,
                                    }}>
                                        {riskCfg?.label}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: colors.textSub }}>
                                        {riskCfg?.desc}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div style={{ display: "flex", gap: 24 }}>
                                    {[
                                        { label: "Permutations Checked", value: result.total_permutations },
                                        { label: "Registered Domains", value: result.registered_count, color: result.registered_count > 0 ? rColor : colors.green },
                                    ].map(s => (
                                        <div key={s.label} style={{ textAlign: "center" }}>
                                            <div style={{
                                                fontFamily: "var(--font-accent)", fontSize: "1.8rem",
                                                fontWeight: 800, color: s.color ?? colors.accent,
                                            }}>
                                                {s.value}
                                            </div>
                                            <div style={{
                                                fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                                                color: colors.textMuted, textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                            }}>
                                                {s.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Registered domains list */}
                        {result.registered_count > 0 ? (
                            <div style={{
                                background: colors.bgCard, border: `1px solid ${colors.border}`,
                                borderRadius: 16, overflow: "hidden",
                            }}>
                                {/* Header */}
                                <div style={{
                                    padding: "14px 18px", borderBottom: `1px solid ${colors.border}`,
                                    display: "flex", alignItems: "center", gap: 10,
                                    background: colors.bgSurface,
                                }}>
                                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                                        Registered Lookalike Domains
                                    </span>
                                    <span style={{
                                        marginLeft: "auto",
                                        fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted,
                                    }}>
                                        Sorted by risk level
                                    </span>
                                </div>

                                {/* Domain rows */}
                                <div style={{ maxHeight: 480, overflowY: "auto", scrollbarWidth: "none" }}>
                                    {result.registered.map((item, i) => (
                                        <DomainRow key={item.domain} item={item} index={i} colors={colors} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center", padding: "40px",
                                background: colors.bgCard, border: `1px solid ${colors.green}30`,
                                borderRadius: 16, boxShadow: `0 0 30px ${colors.greenSoft}`,
                            }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🛡️</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.green, marginBottom: 8 }}>
                                    No Lookalike Domains Found
                                </div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: colors.textSub }}>
                                    We checked <strong style={{ color: colors.text }}>{result.total_permutations}</strong> permutations of <strong style={{ color: colors.text }}>{result.original_domain}</strong> — none are registered.
                                </div>
                            </div>
                        )}

                        {/* What to do */}
                        {result.registered_count > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{
                                    marginTop: 16, padding: "20px",
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
                                        { num: "01", text: "Register the most similar lookalike domains yourself to prevent attackers from using them." },
                                        { num: "02", text: "Set up Google Alerts for your brand name to monitor for impersonation mentions." },
                                        { num: "03", text: "File abuse reports for clearly malicious domains via ICANN or the registrar." },
                                        { num: "04", text: "Implement DMARC on your domain so spoofed emails fail authentication checks." },
                                        { num: "05", text: "Warn your users not to trust emails from similar-looking domains." },
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
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}