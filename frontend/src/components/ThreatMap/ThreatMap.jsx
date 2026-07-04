// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatMap (v3 — VISUAL OVERHAUL)
// v2 was functionally correct but visually flat — thin plain arcs, no glow,
// no ambient motion. v3 adds real visual depth using safe, reliable techniques
// (no WebGL post-processing/shader passes — those have a documented history
// of breaking across three.js versions, so genuine bloom is left as an
// optional future step rather than risked here):
//   - Dual-layer arcs: a soft wide translucent "glow" arc drawn behind a
//     crisp bright "core" arc for each threat — fakes a glow without touching
//     shaders.
//   - Comet-style dash timing (short dash, fast animate) so arcs read as a
//     quick shooting streak instead of a slow dashed line.
//   - Persistent ambient beacon rings at every active threat location, not
//     just on arc arrival — makes the globe feel alive even between polls.
//   - A permanent glowing halo at Sentinel Command (India) marking it as
//     the fixed "home base" all arcs fly toward.
//   - Camera framed on the Asia/India region by default instead of open
//     ocean, with slightly faster auto-rotate for more energy.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useMemo } from "react";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import { countryFlag } from "../../utils/formatters";

// Every detected threat arcs toward this point — India, since Sentinel AI
// is built as India's AI-native CTI platform. Purely visual/narrative;
// no real infrastructure location is implied or exposed.
const SENTINEL_HQ = { lat: 20.5937, lng: 78.9629 };

const SEVERITY_COLOR = {
    CRITICAL: "#ff3b5c",
    HIGH: "#ff8c3b",
    MEDIUM: "#ffc23b",
    LOW: "#3b9bff",
};

const SEVERITY_RGB = {
    CRITICAL: "255,59,92",
    HIGH: "255,140,59",
    MEDIUM: "255,194,59",
    LOW: "59,155,255",
};

const SEVERITY_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

export default function ThreatMap({ height = 480, maxNodes = 40 }) {
    const { colors } = useTheme();
    const { feed } = useThreatFeed({ maxItems: maxNodes, intervalMs: 20000 });

    const containerRef = useRef(null);
    const globeEl = useRef(null);
    const seenArcIdsRef = useRef(new Set());

    const [width, setWidth] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [landingRings, setLandingRings] = useState([]);

    // ── Responsive sizing — react-globe.gl needs explicit pixel width ──────
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) setWidth(entry.contentRect.width);
        });
        observer.observe(el);
        setWidth(el.clientWidth);
        return () => observer.disconnect();
    }, []);

    // ── Auto-rotate + initial camera framed on Asia/India ───────────────
    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.enableZoom = true;
        globeEl.current.pointOfView({ lat: 14, lng: 60, altitude: 1.9 }, 0);
    }, []);

    // ── Real threats with valid coordinates → globe points ──────────────
    const points = useMemo(() => {
        return feed
            .filter((t) => typeof t.lat === "number" && typeof t.lon === "number")
            .map((t) => ({
                ...t,
                lat: t.lat,
                lng: t.lon,
                size: 0.4 + (SEVERITY_ORDER[t.severity] ?? 0) * 0.25,
                color: SEVERITY_COLOR[t.severity] ?? SEVERITY_COLOR.LOW,
            }));
    }, [feed]);

    // ── Arcs — dual layer per threat: glow (wide, soft) + core (thin, bright) ──
    const arcs = useMemo(() => {
        const glow = points.map((t) => {
            const rgb = SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW;
            return {
                id: `${t.id}-glow`,
                startLat: t.lat,
                startLng: t.lng,
                endLat: SENTINEL_HQ.lat,
                endLng: SENTINEL_HQ.lng,
                color: `rgba(${rgb},0.28)`,
                stroke: t.severity === "CRITICAL" ? 1.8 : 1.2,
                dashLength: 0.4,
                dashGap: 1.6,
                dashTime: 1600,
            };
        });
        const core = points.map((t) => {
            const rgb = SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW;
            return {
                id: String(t.id),
                startLat: t.lat,
                startLng: t.lng,
                endLat: SENTINEL_HQ.lat,
                endLng: SENTINEL_HQ.lng,
                color: `rgb(${rgb})`,
                severity: t.severity,
                stroke: t.severity === "CRITICAL" ? 0.6 : 0.4,
                // Short dash + fast animate time = quick shooting-comet streak
                // instead of a slow, gentle dashed flow.
                dashLength: 0.16,
                dashGap: 2.4,
                dashTime: 1300,
            };
        });
        return [...glow, ...core];
    }, [points]);

    // ── Fire a landing pulse at HQ for each genuinely new arc ────────────
    useEffect(() => {
        const coreArcs = arcs.filter((a) => !a.id.endsWith("-glow"));
        const fresh = coreArcs.filter((a) => !seenArcIdsRef.current.has(a.id));
        if (fresh.length === 0) return;
        fresh.forEach((a) => seenArcIdsRef.current.add(a.id));

        const newRings = fresh.map((a) => ({
            id: `${a.id}-landing`,
            lat: SENTINEL_HQ.lat,
            lng: SENTINEL_HQ.lng,
            rgb: SEVERITY_RGB[a.severity] ?? SEVERITY_RGB.LOW,
            maxR: 7,
            speed: 4.5,
            repeatPeriod: 900,
            altitude: 0.015,
        }));
        setLandingRings((prev) => [...prev, ...newRings]);

        const timer = setTimeout(() => {
            setLandingRings((prev) => prev.filter((r) => !newRings.some((n) => n.id === r.id)));
        }, 2400);
        return () => clearTimeout(timer);
    }, [arcs]);

    // ── Persistent ambient beacon at every active threat + HQ halo ───────
    const rings = useMemo(() => {
        const beacons = points.map((t) => ({
            id: `beacon-${t.id}`,
            lat: t.lat,
            lng: t.lng,
            rgb: SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW,
            maxR: 2.4,
            speed: 1.1,
            repeatPeriod: 2400,
            altitude: 0.006,
        }));

        const hqHalo = {
            id: "hq-halo",
            lat: SENTINEL_HQ.lat,
            lng: SENTINEL_HQ.lng,
            rgb: "0,229,255",
            maxR: 4.5,
            speed: 1.6,
            repeatPeriod: 2600,
            altitude: 0.008,
        };

        return [...beacons, hqHalo, ...landingRings];
    }, [points, landingRings]);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
                position: "relative",
                width: "100%",
                height,
                background: "#020409",
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                overflow: "hidden",
            }}
        >
            {width > 0 && (
                <Globe
                    ref={globeEl}
                    width={width}
                    height={height}
                    backgroundColor="rgba(0,0,0,0)"
                    globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
                    bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
                    showAtmosphere
                    atmosphereColor={colors.accent}
                    atmosphereAltitude={0.26}
                    // Points — real threats at real coordinates
                    pointsData={points}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor="color"
                    pointAltitude={0.018}
                    pointRadius="size"
                    onPointHover={setHovered}
                    // Arcs — dual-layer glow + comet-style core
                    arcsData={arcs}
                    arcColor="color"
                    arcAltitude={0.28}
                    arcStroke="stroke"
                    arcDashLength="dashLength"
                    arcDashGap="dashGap"
                    arcDashInitialGap={() => Math.random() * 2}
                    arcDashAnimateTime="dashTime"
                    arcsTransitionDuration={0}
                    // Rings — persistent ambient beacons + landing pulses
                    ringsData={rings}
                    ringColor={(r) => (t) => `rgba(${r.rgb},${1 - t})`}
                    ringMaxRadius={(r) => r.maxR}
                    ringPropagationSpeed={(r) => r.speed}
                    ringRepeatPeriod={(r) => r.repeatPeriod}
                    ringAltitude={(r) => r.altitude}
                    // Sentinel Command label
                    labelsData={[{ lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng, text: "SENTINEL COMMAND" }]}
                    labelText="text"
                    labelSize={1.15}
                    labelColor={() => colors.accent}
                    labelDotRadius={0.45}
                    labelAltitude={0.018}
                />
            )}

            {/* Hover tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        style={{
                            position: "absolute",
                            top: 14,
                            left: 14,
                            background: colors.bgGlass,
                            backdropFilter: "blur(16px)",
                            border: `1px solid ${(SEVERITY_COLOR[hovered.severity] ?? colors.accent)}40`,
                            borderRadius: 10,
                            padding: "10px 14px",
                            maxWidth: 260,
                            pointerEvents: "none",
                            zIndex: 5,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span>{countryFlag(hovered.country)}</span>
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.8rem", color: colors.text }}>
                                {hovered.type}
                            </span>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: SEVERITY_COLOR[hovered.severity] ?? colors.accent }}>
                            {hovered.ioc}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: colors.textMuted, marginTop: 3 }}>
                            {hovered.confidence}% confidence · {hovered.source}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {points.length === 0 && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.textDim,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    pointerEvents: "none",
                }}>
                    Awaiting threats...
                </div>
            )}

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
                    { label: "Critical", color: SEVERITY_COLOR.CRITICAL },
                    { label: "High", color: SEVERITY_COLOR.HIGH },
                    { label: "Medium", color: SEVERITY_COLOR.MEDIUM },
                    { label: "Low", color: SEVERITY_COLOR.LOW },
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
                    {points.length} active zones · live
                </span>
            </div>
        </motion.div>
    );
}