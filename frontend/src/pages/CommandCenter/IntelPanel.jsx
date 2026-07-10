// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — IntelPanel (v3 — INTEGRATED, NOT TWO BOXES SIDE BY SIDE)
// ThreatMap and LiveFeed are still completely unchanged internally — proven,
// working components. The structural change: ThreatMap now spans the full
// section width as a dramatic backdrop, and LiveFeed floats on top of it as
// a glass panel, overlapping rather than sitting in an equal adjacent box.
// This reads as one integrated scene instead of two separate widgets placed
// next to each other.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import ThreatMap from "../../components/ThreatMap/ThreatMap";
import LiveFeed from "../../components/ThreatFeed/LiveFeed";
import { SectionHead } from "../../components/Common/Tooltip";

export default function IntelPanel() {
    const { colors } = useTheme();
    const { stats } = useThreatFeed({ maxItems: 30, intervalMs: 20000 });

    const hasCritical = stats.critical > 0;
    const glowColor = hasCritical ? colors.red : colors.accent;

    return (
        <section style={{ padding: "60px 48px", position: "relative" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <SectionHead
                    label="Live Intelligence"
                    title="Global Threat Activity"
                    sub="Real-time visualization of active cyber threats detected across our intelligence network."
                />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    animate={{
                        boxShadow: hasCritical
                            ? [`0 0 0px ${glowColor}00`, `0 0 40px ${glowColor}35`, `0 0 0px ${glowColor}00`]
                            : `0 0 0px ${glowColor}00`,
                    }}
                    style={{
                        position: "relative",
                        marginTop: 32,
                        borderRadius: 22,
                        border: `1px solid ${hasCritical ? glowColor + "50" : colors.border}`,
                        overflow: "hidden",
                        transition: "border-color 0.6s ease",
                    }}
                >
                    {/* Full-width backdrop — the globe IS the scene, not a boxed widget */}
                    <ThreatMap height={560} />

                    {/* LiveFeed floats on top as a glass panel, overlapping the map */}
                    <div
                        className="live-feed-float"
                        style={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            width: 380,
                            maxWidth: "calc(100% - 40px)",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                            borderRadius: 16,
                            overflow: "hidden",
                        }}
                    >
                        <LiveFeed maxHeight={440} maxItems={16} compact />
                    </div>
                </motion.div>

                {hasCritical && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            marginTop: 12, display: "flex", alignItems: "center", gap: 8,
                            fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.red,
                        }}
                    >
                        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>●</motion.span>
                        {stats.critical} CRITICAL THREAT{stats.critical !== 1 ? "S" : ""} ACTIVE RIGHT NOW
                    </motion.div>
                )}
            </div>

            <style>{`
                @media (max-width: 820px) {
                    .live-feed-float {
                        position: static !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin-top: 16px;
                    }
                }
            `}</style>
        </section>
    );
}