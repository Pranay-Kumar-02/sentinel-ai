// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — StatsRow (v3 — INSTRUMENT STRIP + GSAP SCROLL SCRUB)
// Structural change: four separate floating cards become ONE continuous
// horizontal instrument strip, segmented by thin dividers — reads as a
// single hardware panel, not a grid of dashboard widgets.
//
// Also introduces GSAP's ScrollTrigger with `scrub` — the power-line accent
// along the top of the strip now fills in precisely tied to scroll position
// as you pass through this section, not just a fixed-duration animation on
// viewport-enter. This is real, verifiable DOM/CSS animation (width/scaleX),
// same safe category as everything else already working — GSAP is just the
// more precise tool for scroll-linked timelines specifically.
//
// Requires: npm install gsap
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "../../hooks/useTheme";
import Counter from "../../components/Common/Counter";
import { SectionHead } from "../../components/Common/Tooltip";
import api from "../../utils/api";

gsap.registerPlugin(ScrollTrigger);

const ENGINES = [
    { label: "LLM Engine", detail: "OpenRouter · GPT-4o" },
    { label: "OSINT Engine", detail: "20+ sources active" },
    { label: "Threat Feed", detail: "URLhaus · live" },
    { label: "Forensics Lab", detail: "OCR · QR · PDF ready" },
];

export default function StatsRow() {
    const { colors } = useTheme();
    const [backendOnline, setBackendOnline] = useState(null);
    const stripRef = useRef(null);
    const powerLineRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        api.health()
            .then(() => { if (mounted) setBackendOnline(true); })
            .catch(() => { if (mounted) setBackendOnline(false); });
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (!stripRef.current || !powerLineRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                powerLineRef.current,
                { scaleX: 0 },
                {
                    scaleX: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: stripRef.current,
                        start: "top 85%",
                        end: "bottom 60%",
                        scrub: 0.6,
                    },
                }
            );
        }, stripRef);

        return () => ctx.revert();
    }, []);

    const statusColor = backendOnline === null ? colors.amber : backendOnline ? colors.green : colors.red;
    const statusLabel = backendOnline === null ? "Checking" : backendOnline ? "Online" : "Offline";

    return (
        <section style={{ padding: "60px 48px", position: "relative" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <SectionHead
                    label="System Status"
                    title="Mission Overview"
                    sub="Real-time platform health, verified against the live backend — not a static claim."
                />

                {/* Instrument strip — one continuous panel, not separate cards */}
                <div
                    ref={stripRef}
                    style={{
                        position: "relative",
                        marginTop: 36,
                        background: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 16,
                        overflow: "hidden",
                    }}
                    className="instrument-strip"
                >
                    <div
                        ref={powerLineRef}
                        style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: 2,
                            background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`,
                            transformOrigin: "left", opacity: 0.7,
                        }}
                    />

                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {ENGINES.map((item, i) => (
                            <div
                                key={item.label}
                                style={{
                                    flex: "1 1 220px",
                                    padding: "18px 20px",
                                    borderRight: i < ENGINES.length - 1 ? `1px solid ${colors.border}` : "none",
                                    position: "relative",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <div style={{ position: "relative" }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                                        {backendOnline && (
                                            <motion.div
                                                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                                                style={{ position: "absolute", inset: 0, borderRadius: "50%", background: statusColor }}
                                            />
                                        )}
                                    </div>
                                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, color: colors.text }}>
                                        {item.label}
                                    </span>
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted, marginBottom: 4 }}>
                                    {item.detail}
                                </div>
                                <div style={{
                                    fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700,
                                    color: statusColor, letterSpacing: "0.05em",
                                }}>
                                    {statusLabel.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Big metrics */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 24, marginTop: 40, paddingTop: 40, borderTop: `1px solid ${colors.border}`,
                }}>
                    {[
                        { value: 8, suffix: "", label: "Themes Available", color: colors.purple },
                        { value: 10, suffix: "+", label: "Analysis Engines", color: colors.accent },
                        { value: 0, suffix: "₹", label: "Cost To You", color: colors.green },
                        { value: 24, suffix: "/7", label: "Always Online", color: colors.amber },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, type: "spring", stiffness: 280, damping: 22 }}
                            style={{ textAlign: "center" }}
                        >
                            <Counter value={stat.value} suffix={stat.suffix} fontSize="2.2rem" color={stat.color} duration={1.8} />
                            <div style={{
                                fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: colors.textMuted,
                                marginTop: 6, textTransform: "uppercase", letterSpacing: "0.06em",
                            }}>
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style>{`
                @media (max-width: 640px) {
                    .instrument-strip > div { flex-direction: column; }
                    .instrument-strip > div > div { border-right: none !important; border-bottom: 1px solid ${colors.border}; }
                }
            `}</style>
        </section>
    );
}