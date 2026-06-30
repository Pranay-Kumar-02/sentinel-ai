// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — About (Page)
// Platform story, mission, technology, and founder credit.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { SectionHead } from "../../components/Common/Tooltip";
import Counter from "../../components/Common/Counter";

const TECH_STACK = [
    { category: "Frontend", items: ["React", "Vite", "Framer Motion", "Zustand"] },
    { category: "Backend", items: ["FastAPI", "Python 3.12", "Uvicorn", "httpx"] },
    { category: "AI / LLM", items: ["OpenRouter API", "GPT-4o", "Prompt Engineering"] },
    { category: "OSINT", items: ["VirusTotal", "WHOIS/RDAP", "Safe Browsing", "ip-api.com"] },
];

const PRINCIPLES = [
    { icon: "🆓", title: "Free Forever", desc: "100% open source. Zero cost to run or use, forever." },
    { icon: "🧠", title: "Explainable AI", desc: "Every verdict comes with full reasoning — never a black box." },
    { icon: "🇮🇳", title: "India-Specific", desc: "Built to understand UPI scams, TRAI fraud, and local threats." },
    { icon: "🌍", title: "For Everyone", desc: "No setup, no expertise required. Plain English results." },
];

export default function About({ onNavigate }) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                padding: "100px 32px 80px",
                maxWidth: 900,
                margin: "0 auto",
                minHeight: "100vh",
            }}
        >
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", marginBottom: 56 }}
            >
                <motion.div
                    animate={{
                        boxShadow: [
                            `0 0 20px ${colors.accentGlow}`,
                            `0 0 40px ${colors.accentGlow}`,
                            `0 0 20px ${colors.accentGlow}`,
                        ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: gradients.primary,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.8rem", margin: "0 auto 20px",
                    }}
                >
                    🛡️
                </motion.div>

                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    color: colors.text,
                    margin: "0 0 14px",
                }}>
                    India's CrowdStrike — <span style={{
                        background: gradients.accent,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>For Everyone.</span>
                </h1>

                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "1rem",
                    color: colors.textSub,
                    maxWidth: 560,
                    margin: "0 auto",
                    lineHeight: 1.7,
                }}>
                    Sentinel AI is an open-source, AI-native Cyber Threat Intelligence platform built to
                    democratize enterprise-grade cybersecurity for individuals, students, and small businesses
                    — completely free.
                </p>
            </motion.div>

            {/* Stats strip */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: 24,
                    padding: "28px",
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    marginBottom: 56,
                }}
            >
                {[
                    { value: 10, suffix: "+", label: "Engines" },
                    { value: 20, suffix: "+", label: "Free APIs" },
                    { value: 0, prefix: "₹", label: "Cost" },
                    { value: 100, suffix: "%", label: "Open Source" },
                ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                        <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} fontSize="1.8rem" color={colors.accent} />
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Principles */}
            <SectionHead label="Philosophy" title="Why Sentinel AI Exists" />
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 28,
                marginBottom: 56,
            }}>
                {PRINCIPLES.map((p, i) => (
                    <motion.div
                        key={p.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 14,
                            padding: 20,
                        }}
                    >
                        <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>{p.icon}</div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", fontWeight: 700, color: colors.text, marginBottom: 6 }}>
                            {p.title}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: colors.textSub, lineHeight: 1.6 }}>
                            {p.desc}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tech stack */}
            <SectionHead label="Under The Hood" title="Technology Stack" />
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginTop: 28,
                marginBottom: 56,
            }}>
                {TECH_STACK.map((cat, i) => (
                    <motion.div
                        key={cat.category}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                            background: colors.bgSurface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 12,
                            padding: 16,
                        }}
                    >
                        <div style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.65rem",
                            color: colors.accent,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 10,
                        }}>
                            {cat.category}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {cat.items.map((item) => (
                                <div key={item} style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.78rem",
                                    color: colors.textSub,
                                }}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Founder credit */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                    textAlign: "center",
                    padding: "32px",
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                }}
            >
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: gradients.primary,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", margin: "0 auto 14px",
                    color: "#fff", fontFamily: "var(--font-accent)", fontWeight: 700,
                }}>
                    PV
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                    Pranay Kumar Vonamala
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: colors.textMuted, marginBottom: 16 }}>
                    B.Tech CSE — VIT Vellore · Creator & Architect
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {["GitHub", "Email"].map((link) => (
                        <motion.span
                            key={link}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, link.toUpperCase())}
                            onMouseLeave={resetCursor}
                            whileHover={{ scale: 1.05 }}
                            style={{
                                padding: "6px 16px",
                                background: colors.accentSoft,
                                border: `1px solid ${colors.borderHover}`,
                                borderRadius: 999,
                                fontSize: "0.78rem",
                                color: colors.accent,
                                fontFamily: "var(--font-body)",
                                cursor: "pointer",
                            }}
                        >
                            {link}
                        </motion.span>
                    ))}
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{ textAlign: "center", marginTop: 40 }}
            >
                <motion.button
                    onClick={() => onNavigate?.("/scanner")}
                    onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "ENTER")}
                    onMouseLeave={resetCursor}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        padding: "14px 36px",
                        background: gradients.primary,
                        border: "none",
                        borderRadius: 14,
                        color: "#fff",
                        fontFamily: "var(--font-accent)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        boxShadow: `0 8px 32px ${colors.accentGlow}`,
                    }}
                >
                    Start Investigating →
                </motion.button>
            </motion.div>
        </motion.div>
    );
}