// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Intelligence (Page)
// Live global threat intelligence — full ThreatMap, LiveFeed, ThreatTicker,
// and trending campaign analytics. The "Live India Threat Intelligence Feed"
// module from the project roadmap (Phase 9).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import { SectionHead } from "../../components/Common/Tooltip";
import { Badge } from "../../components/Common/Badge";
import Counter from "../../components/Common/Counter";
import ThreatMap from "../../components/ThreatMap/ThreatMap";
import LiveFeed from "../../components/ThreatFeed/LiveFeed";
import ThreatTicker from "../../components/ThreatFeed/ThreatTicker";
import { countryFlag, formatCountry } from "../../utils/formatters";
import { groupBy, sortBy } from "../../utils/helpers";

// ── Trending campaign card ────────────────────────────────────────────────────

function CampaignCard({ type, count, severity, index, colors }) {
    const severityColors = {
        CRITICAL: colors.red,
        HIGH: colors.orange,
        MEDIUM: colors.amber,
        LOW: colors.blue,
    };
    const color = severityColors[severity] ?? colors.accent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 14,
                padding: "16px 18px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <div style={{
                position: "absolute",
                top: 0, left: 0, bottom: 0,
                width: 3,
                background: color,
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: colors.text,
                }}>
                    {type}
                </span>
                <Badge
                    variant={severity === "CRITICAL" ? "red" : severity === "HIGH" ? "amber" : "blue"}
                    size="xs"
                >
                    {severity}
                </Badge>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color,
                }}>
                    {count}
                </span>
                <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.68rem",
                    color: colors.textMuted,
                }}>
                    incidents today
                </span>
            </div>
        </motion.div>
    );
}

// ── Top targeted sector row ───────────────────────────────────────────────────

function SectorBar({ sector, pct, index, colors }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.06 }}
            style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}
        >
            <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                color: colors.textSub,
                width: 90,
                flexShrink: 0,
            }}>
                {sector}
            </span>
            <div style={{ flex: 1, height: 6, background: colors.bgSurface, borderRadius: 999, overflow: "hidden" }}>
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1], delay: index * 0.06 + 0.2 }}
                    style={{
                        height: "100%",
                        background: "var(--gradient-primary)",
                        borderRadius: 999,
                    }}
                />
            </div>
            <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                color: colors.accent,
                width: 36,
                textAlign: "right",
                flexShrink: 0,
            }}>
                {pct}%
            </span>
        </motion.div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Intelligence() {
    const { colors } = useTheme();
    const { feed, stats } = useThreatFeed({ maxItems: 60, intervalMs: 3000 });

    // Derive trending campaign types from live feed
    const campaigns = useMemo(() => {
        const grouped = groupBy(feed, "type");
        const list = Object.entries(grouped).map(([type, items]) => {
            const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
            const maxSeverity = items.reduce(
                (max, i) => (order[i.severity] > order[max] ? i.severity : max),
                "LOW"
            );
            return { type, count: items.length, severity: maxSeverity };
        });
        return sortBy(list, "count", "desc").slice(0, 6);
    }, [feed]);

    // Derive top targeted sectors
    const sectors = useMemo(() => {
        const grouped = groupBy(feed, "sector");
        const total = feed.length || 1;
        const list = Object.entries(grouped).map(([sector, items]) => ({
            sector,
            pct: Math.round((items.length / total) * 100),
        }));
        return sortBy(list, "pct", "desc").slice(0, 5);
    }, [feed]);

    // Derive top countries
    const topCountries = useMemo(() => {
        const grouped = groupBy(feed, "country");
        const list = Object.entries(grouped).map(([country, items]) => ({
            country,
            count: items.length,
        }));
        return sortBy(list, "count", "desc").slice(0, 6);
    }, [feed]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Ticker right below topbar */}
            <div style={{ marginTop: 64 }}>
                <ThreatTicker height={36} />
            </div>

            <div style={{
                padding: "32px 32px 60px",
                maxWidth: 1400,
                margin: "0 auto",
            }}>
                <SectionHead
                    label="Live Intelligence"
                    title="Global Threat Feed"
                    sub="Real-time intelligence aggregated from OSINT feeds, community reports, and honeypots across our network."
                />

                {/* Top stats */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 16,
                    margin: "32px 0",
                }}>
                    {[
                        { value: stats.total, label: "Total Detected", color: colors.accent },
                        { value: stats.critical, label: "Critical", color: colors.red },
                        { value: stats.high, label: "High", color: colors.orange },
                        { value: stats.medium, label: "Medium", color: colors.amber },
                    ].map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            style={{
                                background: colors.bgCard,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 14,
                                padding: "16px 18px",
                                textAlign: "center",
                            }}
                        >
                            <Counter value={s.value} fontSize="1.7rem" color={s.color} duration={1.2} />
                            <div style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.65rem",
                                color: colors.textMuted,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginTop: 6,
                            }}>
                                {s.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Map + Live feed */}
                <div
                    className="intel-page-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.4fr 1fr",
                        gap: 20,
                        marginBottom: 32,
                    }}
                >
                    <ThreatMap height={460} maxNodes={20} />
                    <LiveFeed maxHeight={460} maxItems={40} />
                </div>

                {/* Trending campaigns + sectors */}
                <div
                    className="intel-page-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1.3fr 1fr",
                        gap: 20,
                    }}
                >
                    {/* Trending campaigns */}
                    <div>
                        <h3 style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1rem",
                            fontWeight: 700,
                            color: colors.text,
                            margin: "0 0 14px",
                        }}>
                            Trending Attack Types
                        </h3>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: 12,
                        }}>
                            {campaigns.map((c, i) => (
                                <CampaignCard key={c.type} {...c} index={i} colors={colors} />
                            ))}
                        </div>
                    </div>

                    {/* Sectors + countries */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Top targeted sectors */}
                        <div style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 14,
                            padding: 18,
                        }}>
                            <h3 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                color: colors.text,
                                margin: "0 0 14px",
                            }}>
                                Top Targeted Sectors
                            </h3>
                            {sectors.length > 0 ? sectors.map((s, i) => (
                                <SectorBar key={s.sector} {...s} index={i} colors={colors} />
                            )) : (
                                <div style={{ fontSize: "0.75rem", color: colors.textDim, fontFamily: "var(--font-mono)" }}>
                                    Gathering data...
                                </div>
                            )}
                        </div>

                        {/* Top origin countries */}
                        <div style={{
                            background: colors.bgCard,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 14,
                            padding: 18,
                        }}>
                            <h3 style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                color: colors.text,
                                margin: "0 0 14px",
                            }}>
                                Threat Origin Countries
                            </h3>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {topCountries.map((c, i) => (
                                    <motion.div
                                        key={c.country}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "6px 12px",
                                            background: colors.bgSurface,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 999,
                                        }}
                                    >
                                        <span style={{ fontSize: "0.9rem" }}>{countryFlag(c.country)}</span>
                                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.text }}>
                                            {formatCountry(c.country)}
                                        </span>
                                        <span style={{
                                            fontFamily: "var(--font-accent)",
                                            fontSize: "0.68rem",
                                            color: colors.accent,
                                            background: colors.accentSoft,
                                            padding: "1px 6px",
                                            borderRadius: 999,
                                        }}>
                                            {c.count}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .intel-page-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </motion.div>
    );
}