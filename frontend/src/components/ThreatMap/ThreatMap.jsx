// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatMap
// Flat world map (simplified SVG outline) with live threat markers.
// Used in the Intelligence page and dashboard panels.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import ThreatNode from "./ThreatNode";

// Approximate lat/lon → percentage position on equirectangular map
function geoToPercent(lat, lon) {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
}

// Country code → approximate centroid lat/lon
const COUNTRY_COORDS = {
    IN: { lat: 20.6, lon: 78.9 },
    US: { lat: 39.8, lon: -98.6 },
    NG: { lat: 9.1, lon: 8.7 },
    RU: { lat: 61.5, lon: 105.3 },
    CN: { lat: 35.9, lon: 104.2 },
    PK: { lat: 30.4, lon: 69.3 },
    BD: { lat: 23.7, lon: 90.4 },
    GH: { lat: 7.9, lon: -1.0 },
    UA: { lat: 48.4, lon: 31.2 },
    RO: { lat: 45.9, lon: 24.9 },
    BR: { lat: -14.2, lon: -51.9 },
    DE: { lat: 51.2, lon: 10.4 },
    GB: { lat: 55.4, lon: -3.4 },
};

export default function ThreatMap({ height = 360, maxNodes = 14 }) {
    const { colors } = useTheme();
    const { feed } = useThreatFeed({ maxItems: maxNodes, intervalMs: 3500 });

    // Group feed by country for node aggregation
    const grouped = {};
    for (const item of feed) {
        const key = item.country;
        if (!grouped[key]) {
            grouped[key] = { ...item, count: 0, maxSeverity: "LOW" };
        }
        grouped[key].count += 1;
        const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
        if (order[item.severity] > order[grouped[key].maxSeverity]) {
            grouped[key].maxSeverity = item.severity;
        }
    }

    const nodes = Object.values(grouped).slice(0, maxNodes).map((g, i) => {
        const coords = COUNTRY_COORDS[g.country] ?? { lat: 0, lon: 0 };
        const pos = geoToPercent(coords.lat, coords.lon);
        return { ...pos, severity: g.maxSeverity, label: g.type, country: g.country, count: g.count, delay: i * 0.1 };
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
                position: "relative",
                width: "100%",
                height,
                background: colors.bgSurface,
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                overflow: "hidden",
            }}
        >
            {/* World map background — simplified dotted continents via CSS */}
            <svg
                viewBox="0 0 1000 500"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.12,
                }}
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Simplified world continents as dot grid */}
                <defs>
                    <pattern id="worldDots" width="14" height="14" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill={colors.accent} />
                    </pattern>
                </defs>
                {/* Rough continent silhouettes using paths (simplified) */}
                <g fill="url(#worldDots)" stroke="none">
                    {/* North America */}
                    <path d="M 100 100 Q 180 80 220 120 L 240 180 Q 200 220 150 210 L 100 180 Z" />
                    {/* South America */}
                    <path d="M 230 250 Q 260 240 270 290 L 260 380 Q 230 390 220 340 Z" />
                    {/* Europe */}
                    <path d="M 480 100 Q 540 90 560 130 L 540 160 Q 500 165 480 140 Z" />
                    {/* Africa */}
                    <path d="M 480 180 Q 540 170 560 230 L 540 340 Q 490 360 470 280 Z" />
                    {/* Asia */}
                    <path d="M 580 80 Q 750 60 820 130 L 800 220 Q 650 240 580 180 Z" />
                    {/* India subcontinent */}
                    <path d="M 650 200 Q 690 195 700 240 L 680 280 Q 650 270 645 230 Z" />
                    {/* Australia */}
                    <path d="M 780 320 Q 850 310 870 350 L 850 380 Q 800 385 780 355 Z" />
                </g>
            </svg>

            {/* Grid overlay */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
                opacity: 0.3,
            }} />

            {/* Threat nodes */}
            {nodes.map((node, i) => (
                <ThreatNode key={`${node.country}-${i}`} {...node} />
            ))}

            {/* Legend */}
            <div style={{
                position: "absolute",
                bottom: 12,
                left: 12,
                display: "flex",
                gap: 10,
                padding: "6px 12px",
                background: colors.bgGlass,
                backdropFilter: "blur(12px)",
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
            }}>
                {[
                    { label: "Critical", color: colors.red },
                    { label: "High", color: colors.orange },
                    { label: "Medium", color: colors.amber },
                    { label: "Low", color: colors.blue },
                ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color }} />
                        <span style={{ fontSize: "0.6rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                            {l.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Active count */}
            <div style={{
                position: "absolute",
                top: 12,
                right: 12,
                padding: "5px 12px",
                background: colors.bgGlass,
                backdropFilter: "blur(12px)",
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                gap: 6,
            }}>
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: colors.green }}
                />
                <span style={{ fontSize: "0.65rem", color: colors.textSub, fontFamily: "var(--font-mono)" }}>
                    {nodes.length} active zones
                </span>
            </div>
        </motion.div>
    );
}