// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — HeroSection (v3 — RESTRAINT, NOT MAXIMALISM)
// Direction: Stripe's craft-in-the-details philosophy over a maximalist
// centerpiece. The globe is no longer the whole show — it's one precise
// instrument in a glass panel. What actually carries the "premium" feeling
// here: a real animated gradient mesh (not a static background), a genuine
// system-status readout using a real backend health check (not decorative
// theater), and careful Framer Motion choreography — the same techniques
// already used successfully elsewhere in this app, just applied with more
// intention in the one place that matters most.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import IntelGlobe from "../../components/IntelGlobe/IntelGlobe";
import GlitchText from "../../components/Common/GlitchText";
import Counter from "../../components/Common/Counter";
import api from "../../utils/api";

const heroContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const heroItem = {
    hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
    visible: {
        opacity: 1, y: 0, filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
};

// ── Real system status readout — genuine backend check, not decoration ──────
function SystemStatusReadout() {
    const { colors } = useTheme();
    const [lines, setLines] = useState([]);

    useEffect(() => {
        let mounted = true;
        const steps = [
            "LOADING INTELLIGENCE ENGINES",
            "SYNCING THREAT FEED",
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (!mounted) return;
            if (i < steps.length) {
                setLines((prev) => [...prev, { text: steps[i], ok: null }]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 260);

        api.health()
            .then(() => {
                if (mounted) setLines((prev) => [...prev, { text: "SENTINEL CORE", ok: true }]);
            })
            .catch(() => {
                if (mounted) setLines((prev) => [...prev, { text: "SENTINEL CORE", ok: false }]);
            });

        return () => { mounted = false; clearInterval(interval); };
    }, []);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            marginBottom: 18,
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.06em",
            minHeight: 54,
        }}>
            <AnimatePresence>
                {lines.map((line, i) => (
                    <motion.div
                        key={line.text}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: "flex", alignItems: "center", gap: 8, color: colors.textMuted }}
                    >
                        <span style={{ color: colors.textDim }}>{`>`}</span>
                        <span>{line.text}</span>
                        {line.ok !== null && (
                            <span style={{
                                color: line.ok ? colors.green : colors.red,
                                fontWeight: 700,
                            }}>
                                {line.ok ? "ONLINE" : "OFFLINE"}
                            </span>
                        )}
                        {line.ok === null && (
                            <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                style={{ color: colors.accent }}
                            >
                                ···
                            </motion.span>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default function HeroSection({ onNavigate }) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    return (
        <section style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            position: "relative",
            padding: "100px 48px 60px",
            overflow: "hidden",
        }}>
            {/* ── Animated gradient mesh — the actual source of "premium" here,
                 not a giant centerpiece object. Subtle, slow, always moving. ── */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <motion.div
                    animate={{
                        x: [0, 60, -30, 0],
                        y: [0, -40, 30, 0],
                        scale: [1, 1.15, 1.05, 1],
                    }}
                    transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute", top: "-10%", left: "5%",
                        width: 520, height: 520, borderRadius: "50%",
                        background: colors.accent, opacity: 0.12, filter: "blur(120px)",
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -50, 40, 0],
                        y: [0, 40, -20, 0],
                        scale: [1, 1.1, 0.95, 1],
                    }}
                    transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute", bottom: "-15%", right: "10%",
                        width: 620, height: 620, borderRadius: "50%",
                        background: colors.purple ?? colors.accent, opacity: 0.1, filter: "blur(140px)",
                    }}
                />
                {/* Thin technical grid — restrained, not busy */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                    opacity: 0.25,
                    maskImage: "radial-gradient(ellipse at 30% 50%, black 0%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse at 30% 50%, black 0%, transparent 70%)",
                }} />
            </div>

            <motion.div
                variants={heroContainer}
                initial="hidden"
                animate="visible"
                style={{
                    maxWidth: 1280,
                    margin: "0 auto",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1.15fr 0.85fr",
                    gap: 56,
                    alignItems: "center",
                    position: "relative",
                    zIndex: 1,
                }}
                className="hero-grid"
            >
                {/* ── Left: Identity & Copy ─────────────────────── */}
                <div>
                    <motion.div variants={heroItem}>
                        <SystemStatusReadout />
                    </motion.div>

                    {/* Eyebrow badge */}
                    <motion.div variants={heroItem} style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 16px",
                        background: colors.accentSoft,
                        border: `1px solid ${colors.borderHover}`,
                        borderRadius: 999,
                        marginBottom: 28,
                    }}>
                        <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: colors.green,
                                boxShadow: `0 0 8px ${colors.greenGlow}`,
                            }}
                        />
                        <span style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: colors.accent,
                        }}>
                            India's First AI-Native CTI Platform
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.div variants={heroItem} style={{ marginBottom: 24 }}>
                        <h1 style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                            fontWeight: 900,
                            lineHeight: 1.05,
                            letterSpacing: "-0.03em",
                            margin: 0,
                            color: colors.text,
                        }}>
                            Cyber Threat
                            <br />
                            <span style={{
                                display: "inline-block",
                                background: "var(--gradient-accent)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                color: "transparent",
                                paddingRight: "0.05em",
                            }}>
                                Intelligence,
                            </span>
                            <br />
                            <GlitchText
                                gradient={false}
                                color={colors.text}
                                glow={false}
                                glitchInterval={5000}
                                style={{ display: "inline" }}
                            >
                                Reimagined.
                            </GlitchText>
                        </h1>
                    </motion.div>

                    {/* Subtext */}
                    <motion.p variants={heroItem} style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
                        color: colors.textSub,
                        lineHeight: 1.7,
                        maxWidth: 520,
                        margin: "0 0 36px",
                    }}>
                        Sentinel AI fuses LLM reasoning, OSINT automation, and MITRE ATT&CK
                        intelligence into one platform — built for analysts, students, and
                        organizations who refuse to pay enterprise prices for protection.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={heroItem} style={{
                        display: "flex",
                        gap: 14,
                        flexWrap: "wrap",
                        marginBottom: 56,
                    }}>
                        <motion.button
                            onClick={() => onNavigate?.("/scanner")}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "ENTER")}
                            onMouseLeave={resetCursor}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                padding: "16px 36px",
                                background: gradients.primary,
                                border: "none",
                                borderRadius: 14,
                                color: "#fff",
                                fontFamily: "var(--font-accent)",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                cursor: "pointer",
                                boxShadow: `0 8px 32px ${colors.accentGlow}`,
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            <motion.div
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 3, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
                                style={{
                                    position: "absolute", inset: 0,
                                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                                }}
                            />
                            Enter Platform
                        </motion.button>

                        <motion.button
                            onClick={() => onNavigate?.("/about")}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "LEARN")}
                            onMouseLeave={resetCursor}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                padding: "16px 32px",
                                background: "transparent",
                                border: `1px solid ${colors.borderHover}`,
                                borderRadius: 14,
                                color: colors.text,
                                fontFamily: "var(--font-body)",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            How It Works
                        </motion.button>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div variants={heroItem} style={{
                        display: "flex",
                        gap: 36,
                        flexWrap: "wrap",
                    }}>
                        {[
                            { value: 10, suffix: "+", label: "Intelligence Engines" },
                            { value: 20, suffix: "+", label: "Free OSINT APIs" },
                            { value: 100, suffix: "%", label: "Free Forever" },
                        ].map((stat, i) => (
                            <div key={i}>
                                <Counter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    fontSize="1.6rem"
                                    color={colors.accent}
                                    duration={1.6}
                                />
                                <div style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.68rem",
                                    color: colors.textMuted,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    marginTop: 4,
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── Right: Globe framed as a precise instrument panel ────── */}
                <motion.div variants={heroItem} style={{ position: "relative" }}>
                    <div style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        maxWidth: 420,
                        margin: "0 auto",
                        borderRadius: 20,
                        overflow: "hidden",
                        background: colors.bgSurface,
                        border: `1px solid ${colors.border}`,
                        boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
                    }}>
                        <IntelGlobe maxThreats={10} />

                        {/* Panel label — instrument, not decoration */}
                        <div style={{
                            position: "absolute",
                            top: 14, left: 14,
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "4px 10px",
                            background: colors.bgGlass,
                            backdropFilter: "blur(12px)",
                            border: `1px solid ${colors.border}`,
                            borderRadius: 999,
                            zIndex: 2,
                        }}>
                            <motion.div
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                style={{ width: 5, height: 5, borderRadius: "50%", background: colors.green }}
                            />
                            <span style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.58rem",
                                color: colors.textSub,
                                letterSpacing: "0.08em",
                            }}>
                                GLOBAL THREAT INSTRUMENT
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                style={{
                    position: "absolute",
                    bottom: 28,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    zIndex: 1,
                }}
            >
                <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: colors.textMuted,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                }}>
                    Scroll to Explore
                </span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: 20,
                        height: 32,
                        borderRadius: 12,
                        border: `1.5px solid ${colors.border}`,
                        display: "flex",
                        justifyContent: "center",
                        paddingTop: 6,
                    }}
                >
                    <motion.div
                        animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            width: 4, height: 4, borderRadius: "50%",
                            background: colors.accent,
                        }}
                    />
                </motion.div>
            </motion.div>

            <style>{`
                @media (max-width: 968px) {
                    .hero-grid {
                        grid-template-columns: 1fr !important;
                        text-align: center;
                    }
                }
            `}</style>
        </section>
    );
}