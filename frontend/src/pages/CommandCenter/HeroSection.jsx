// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — HeroSection (v4 — NO GLOBE, DESIGNER REBUILD)
// The globe is fully removed. This version leans entirely on reliable,
// verifiable techniques — CSS, SVG, 2D canvas, Framer Motion — deliberately
// avoiding custom WebGL/shader work, which was the actual repeat point of
// failure across prior versions, not "3D" or "effects" in general.
//
// What's new:
//   - Film grain (SVG feTurbulence overlay) — the texture that makes flat
//     dark UI feel like a premium film, not a flat screenshot.
//   - Constellation particle field (2D canvas) — drifting points that
//     connect with thin lines when near each other. Classic, reliable,
//     nothing exotic.
//   - Self-drawing SVG circuit lines — animate in once on load via Framer
//     Motion's native pathLength support, visually "wiring" the page
//     together.
//   - Magnetic CTA buttons — pull toward the cursor within a radius, spring
//     back on leave.
//   - Hover chromatic-aberration glitch on the CTAs — a brief RGB-split
//     flicker, tasteful, not neon-cheap.
//   - A real Live Intelligence Readout panel replacing the globe's old
//     slot — genuine ticking numbers and real recent threats from the same
//     proven useThreatFeed hook already validated elsewhere in this app.
//     Not decoration — it's the actual live feed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import GlitchText from "../../components/Common/GlitchText";
import Counter from "../../components/Common/Counter";
import { countryFlag } from "../../utils/formatters";
import { timeAgo, truncate } from "../../utils/helpers";
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

const SEVERITY_COLOR_KEY = { CRITICAL: "red", HIGH: "orange", MEDIUM: "amber", LOW: "blue" };

// ── Film grain — SVG noise texture, extremely low cost, huge "premium film" payoff ──
function FilmGrain() {
    return (
        <svg
            aria-hidden="true"
            style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.045, zIndex: 3,
            }}
        >
            <filter id="sentinelGrain">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#sentinelGrain)" />
        </svg>
    );
}

// ── Constellation particle field — plain 2D canvas, no WebGL ─────────────────
function ConstellationField({ accent }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let particles = [];
        let width = 0, height = 0;
        let rafId;

        function resize() {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            const count = Math.max(30, Math.min(70, Math.floor((width * height) / 18000)));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
            }));
        }

        function tick() {
            ctx.clearRect(0, 0, width, height);

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            }

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                ctx.beginPath();
                ctx.arc(a.x, a.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = accent;
                ctx.globalAlpha = 0.55;
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = accent;
                        ctx.globalAlpha = 0.14 * (1 - dist / 120);
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
            rafId = requestAnimationFrame(tick);
        }

        resize();
        tick();
        window.addEventListener("resize", resize);
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", resize);
        };
    }, [accent]);

    return (
        <canvas
            ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
    );
}

// ── Self-drawing circuit lines — Framer Motion's native pathLength ───────────
function CircuitLines({ accent }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 1280 800"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, opacity: 0.35 }}
        >
            <motion.path
                d="M 0 140 L 180 140 L 210 170 L 210 340"
                stroke={accent} strokeWidth="1" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: 0.5, ease: "easeInOut" }}
            />
            <motion.path
                d="M 0 620 L 140 620 L 160 600 L 340 600"
                stroke={accent} strokeWidth="1" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.8, ease: "easeInOut" }}
            />
            <motion.path
                d="M 1280 220 L 1080 220 L 1055 245 L 900 245"
                stroke={accent} strokeWidth="1" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.65, ease: "easeInOut" }}
            />
        </svg>
    );
}

// ── Real system status readout — genuine backend check, not decoration ──────
function SystemStatusReadout() {
    const { colors } = useTheme();
    const [lines, setLines] = useState([]);

    useEffect(() => {
        let mounted = true;
        const steps = ["LOADING INTELLIGENCE ENGINES", "SYNCING THREAT FEED"];

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
            .then(() => { if (mounted) setLines((prev) => [...prev, { text: "SENTINEL CORE", ok: true }]); })
            .catch(() => { if (mounted) setLines((prev) => [...prev, { text: "SENTINEL CORE", ok: false }]); });

        return () => { mounted = false; clearInterval(interval); };
    }, []);

    return (
        <div style={{
            display: "flex", flexDirection: "column", gap: 3, marginBottom: 18,
            fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.06em", minHeight: 54,
        }}>
            <AnimatePresence>
                {lines.map((line) => (
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
                            <span style={{ color: line.ok ? colors.green : colors.red, fontWeight: 700 }}>
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

// ── Magnetic + glitch button ──────────────────────────────────────────────────
function MagneticButton({ children, onClick, onMouseEnter, onMouseLeave, style = {} }) {
    const ref = useRef(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const springX = useSpring(mx, { stiffness: 200, damping: 18, mass: 0.4 });
    const springY = useSpring(my, { stiffness: 200, damping: 18, mass: 0.4 });

    function handleMouseMove(e) {
        const rect = ref.current.getBoundingClientRect();
        mx.set((e.clientX - rect.left - rect.width / 2) * 0.35);
        my.set((e.clientY - rect.top - rect.height / 2) * 0.35);
    }
    function handleMouseLeave() {
        mx.set(0);
        my.set(0);
        onMouseLeave?.();
    }

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY, ...style }}
            whileHover={{
                scale: 1.03,
                textShadow: [
                    "0 0 0 rgba(255,0,80,0), 0 0 0 rgba(0,229,255,0)",
                    "-2px 0 0 rgba(255,0,80,0.7), 2px 0 0 rgba(0,229,255,0.7)",
                    "0 0 0 rgba(255,0,80,0), 0 0 0 rgba(0,229,255,0)",
                ],
            }}
            transition={{ textShadow: { duration: 0.45 } }}
            whileTap={{ scale: 0.97 }}
        >
            {children}
        </motion.button>
    );
}

// ── Live Intelligence Readout panel — replaces the old globe slot ────────────
// Real data, same proven useThreatFeed hook already validated on the
// Intelligence page. Not a decorative object — this is the actual live feed.
function LiveReadoutPanel() {
    const { colors } = useTheme();
    const { feed, stats } = useThreatFeed({ maxItems: 6, intervalMs: 20000 });
    const recent = feed.slice(0, 4);

    return (
        <div style={{
            position: "relative",
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: 18,
            padding: 22,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            overflow: "hidden",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green, boxShadow: `0 0 6px ${colors.greenGlow}` }}
                />
                <span style={{
                    fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: colors.textSub,
                }}>
                    Live Intelligence Readout
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                {[
                    { label: "Detected", value: stats.total, color: colors.accent },
                    { label: "Critical", value: stats.critical, color: colors.red },
                    { label: "High", value: stats.high, color: colors.orange },
                ].map((s) => (
                    <div key={s.label} style={{
                        background: colors.bgSurface, border: `1px solid ${colors.border}`,
                        borderRadius: 10, padding: "10px 8px", textAlign: "center",
                    }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: s.color }}>
                            {s.value}
                        </div>
                        <div style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: colors.textMuted,
                            textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2,
                        }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ height: 1, background: colors.border, marginBottom: 14 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 140 }}>
                <AnimatePresence initial={false}>
                    {recent.length === 0 ? (
                        <div style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textDim,
                            textAlign: "center", padding: "20px 0",
                        }}>
                            Awaiting threats...
                        </div>
                    ) : (
                        recent.map((item) => {
                            const colorKey = SEVERITY_COLOR_KEY[item.severity] ?? "blue";
                            const color = colors[colorKey] ?? colors.accent;
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                                >
                                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
                                    <span style={{ fontSize: "0.68rem" }}>{countryFlag(item.country)}</span>
                                    <span style={{
                                        fontFamily: "var(--font-body)", fontSize: "0.72rem", fontWeight: 600,
                                        color: colors.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {item.type}
                                    </span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: colors.textMuted, flexShrink: 0 }}>
                                        {timeAgo(item.timestamp)}
                                    </span>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            <div style={{
                marginTop: 16, fontFamily: "var(--font-mono)", fontSize: "0.56rem",
                color: colors.textDim, textAlign: "center", letterSpacing: "0.05em",
            }}>
                SOURCE: URLHAUS (ABUSE.CH) · UPDATED EVERY 20S
            </div>
        </div>
    );
}

export default function HeroSection({ onNavigate }) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    return (
        <section style={{
            minHeight: "100vh", display: "flex", alignItems: "center",
            position: "relative", padding: "100px 48px 60px", overflow: "hidden",
        }}>
            <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <motion.div
                    animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 1.05, 1] }}
                    transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute", top: "-10%", left: "5%", width: 520, height: 520,
                        borderRadius: "50%", background: colors.accent, opacity: 0.1, filter: "blur(120px)",
                    }}
                />
                <motion.div
                    animate={{ x: [0, -50, 40, 0], y: [0, 40, -20, 0], scale: [1, 1.1, 0.95, 1] }}
                    transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute", bottom: "-15%", right: "10%", width: 620, height: 620,
                        borderRadius: "50%", background: colors.purple ?? colors.accent, opacity: 0.08, filter: "blur(140px)",
                    }}
                />
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
                    backgroundSize: "64px 64px", opacity: 0.2,
                    maskImage: "radial-gradient(ellipse at 30% 50%, black 0%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(ellipse at 30% 50%, black 0%, transparent 70%)",
                }} />
                <ConstellationField accent={colors.accent} />
            </div>

            <CircuitLines accent={colors.accent} />
            <FilmGrain />

            <motion.div
                variants={heroContainer}
                initial="hidden"
                animate="visible"
                style={{
                    maxWidth: 1280, margin: "0 auto", width: "100%",
                    display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 56,
                    alignItems: "center", position: "relative", zIndex: 2,
                }}
                className="hero-grid"
            >
                <div>
                    <motion.div variants={heroItem}>
                        <SystemStatusReadout />
                    </motion.div>

                    <motion.div variants={heroItem} style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "6px 16px", background: colors.accentSoft,
                        border: `1px solid ${colors.borderHover}`, borderRadius: 999, marginBottom: 28,
                    }}>
                        <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ width: 6, height: 6, borderRadius: "50%", background: colors.green, boxShadow: `0 0 8px ${colors.greenGlow}` }}
                        />
                        <span style={{
                            fontFamily: "var(--font-accent)", fontSize: "0.7rem", fontWeight: 700,
                            letterSpacing: "0.12em", textTransform: "uppercase", color: colors.accent,
                        }}>
                            India's First AI-Native CTI Platform
                        </span>
                    </motion.div>

                    <motion.div variants={heroItem} style={{ marginBottom: 24 }}>
                        <h1 style={{
                            fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
                            fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", margin: 0, color: colors.text,
                        }}>
                            Cyber Threat
                            <br />
                            <span style={{
                                display: "inline-block", background: "var(--gradient-accent)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                backgroundClip: "text", color: "transparent", paddingRight: "0.05em",
                            }}>
                                Intelligence,
                            </span>
                            <br />
                            <GlitchText gradient={false} color={colors.text} glow={false} glitchInterval={5000} style={{ display: "inline" }}>
                                Reimagined.
                            </GlitchText>
                        </h1>
                    </motion.div>

                    <motion.p variants={heroItem} style={{
                        fontFamily: "var(--font-body)", fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
                        color: colors.textSub, lineHeight: 1.7, maxWidth: 520, margin: "0 0 36px",
                    }}>
                        Sentinel AI fuses LLM reasoning, OSINT automation, and MITRE ATT&CK
                        intelligence into one platform — built for analysts, students, and
                        organizations who refuse to pay enterprise prices for protection.
                    </motion.p>

                    <motion.div variants={heroItem} style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
                        <MagneticButton
                            onClick={() => onNavigate?.("/scanner")}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "ENTER")}
                            onMouseLeave={resetCursor}
                            style={{
                                padding: "16px 36px", background: gradients.primary, border: "none",
                                borderRadius: 14, color: "#fff", fontFamily: "var(--font-accent)",
                                fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em",
                                textTransform: "uppercase", cursor: "pointer",
                                boxShadow: `0 8px 32px ${colors.accentGlow}`, position: "relative", overflow: "hidden",
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
                        </MagneticButton>

                        <MagneticButton
                            onClick={() => onNavigate?.("/about")}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "LEARN")}
                            onMouseLeave={resetCursor}
                            style={{
                                padding: "16px 32px", background: "transparent",
                                border: `1px solid ${colors.borderHover}`, borderRadius: 14, color: colors.text,
                                fontFamily: "var(--font-body)", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer",
                            }}
                        >
                            How It Works
                        </MagneticButton>
                    </motion.div>

                    <motion.div variants={heroItem} style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
                        {[
                            { value: 10, suffix: "+", label: "Intelligence Engines" },
                            { value: 20, suffix: "+", label: "Free OSINT APIs" },
                            { value: 100, suffix: "%", label: "Free Forever" },
                        ].map((stat, i) => (
                            <div key={i}>
                                <Counter value={stat.value} suffix={stat.suffix} fontSize="1.6rem" color={colors.accent} duration={1.6} />
                                <div style={{
                                    fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted,
                                    textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4,
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div variants={heroItem}>
                    <LiveReadoutPanel />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                style={{
                    position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 2,
                }}
            >
                <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: colors.textMuted,
                    letterSpacing: "0.15em", textTransform: "uppercase",
                }}>
                    Scroll to Explore
                </span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: 20, height: 32, borderRadius: 12, border: `1.5px solid ${colors.border}`,
                        display: "flex", justifyContent: "center", paddingTop: 6,
                    }}
                >
                    <motion.div
                        animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        style={{ width: 4, height: 4, borderRadius: "50%", background: colors.accent }}
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