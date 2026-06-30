// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — HeroSection
// Full-viewport cinematic hero. The IntelGlobe IS the identity.
// No scanner. No textarea. Platform introduction only.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import IntelGlobe from "../../components/IntelGlobe/IntelGlobe";
import GlitchText from "../../components/Common/GlitchText";
import Counter from "../../components/Common/Counter";

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
            <motion.div
                variants={heroContainer}
                initial="hidden"
                animate="visible"
                style={{
                    maxWidth: 1280,
                    margin: "0 auto",
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1.1fr 0.9fr",
                    gap: 48,
                    alignItems: "center",
                }}
                className="hero-grid"
            >
                {/* ── Left: Identity & Copy ─────────────────────── */}
                <div>
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
                                background: gradients.accent,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
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

                {/* ── Right: Intelligence Globe ─────────────────── */}
                <motion.div
                    variants={heroItem}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <IntelGlobe size={460} />
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