// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatMap (v2 — REAL 3D GLOBE)
// Rebuilt from a flat hand-drawn SVG into a genuine 3D rotating globe using
// react-globe.gl (Three.js/WebGL). Plots REAL threats at their real lat/lng
// coordinates (from the backend's URLhaus + geolocation pipeline) and
// animates arcs flying from each threat's origin to "Sentinel Command"
// (India) — visualizing threats being detected and reported into the
// platform in real time.
//
// Requires: npm install react-globe.gl three
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
    const [ringsData, setRingsData] = useState([]);

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

    // ── Auto-rotate + initial camera angle ──────────────────────────────
    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.45;
        controls.enableZoom = true;
        globeEl.current.pointOfView({ lat: 18, lng: 45, altitude: 2.1 }, 0);
    }, []);

    // ── Real threats with valid coordinates → globe points ──────────────
    const points = useMemo(() => {
        return feed
            .filter((t) => typeof t.lat === "number" && typeof t.lon === "number")
            .map((t) => ({
                ...t,
                lat: t.lat,
                lng: t.lon,
                size: 0.35 + (SEVERITY_ORDER[t.severity] ?? 0) * 0.22,
                color: SEVERITY_COLOR[t.severity] ?? SEVERITY_COLOR.LOW,
            }));
    }, [feed]);

    // ── Arcs: threat origin → Sentinel Command ───────────────────────────
    const arcs = useMemo(() => {
        return points.map((t) => ({
            id: t.id,
            startLat: t.lat,
            startLng: t.lng,
            endLat: SENTINEL_HQ.lat,
            endLng: SENTINEL_HQ.lng,
            color: SEVERITY_COLOR[t.severity] ?? SEVERITY_COLOR.LOW,
            severity: t.severity,
        }));
    }, [points]);

    // ── Fire a landing ring at HQ for each genuinely new arc ─────────────
    useEffect(() => {
        const fresh = arcs.filter((a) => !seenArcIdsRef.current.has(a.id));
        if (fresh.length === 0) return;
        fresh.forEach((a) => seenArcIdsRef.current.add(a.id));

        const newRings = fresh.map((a) => ({
            id: `${a.id}-ring`,
            lat: SENTINEL_HQ.lat,
            lng: SENTINEL_HQ.lng,
            rgb: SEVERITY_RGB[a.severity] ?? SEVERITY_RGB.LOW,
        }));
        setRingsData((prev) => [...prev, ...newRings]);

        const timer = setTimeout(() => {
            setRingsData((prev) => prev.filter((r) => !newRings.some((n) => n.id === r.id)));
        }, 2600);
        return () => clearTimeout(timer);
    }, [arcs]);

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
                    atmosphereAltitude={0.22}
                    // Points — real threats at real coordinates
                    pointsData={points}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor="color"
                    pointAltitude={0.012}
                    pointRadius="size"
                    onPointHover={setHovered}
                    // Arcs — threat origin flying toward Sentinel Command
                    arcsData={arcs}
                    arcColor="color"
                    arcAltitude={0.28}
                    arcStroke={(a) => (a.severity === "CRITICAL" ? 0.7 : 0.4)}
                    arcDashLength={0.4}
                    arcDashGap={2}
                    arcDashInitialGap={() => Math.random() * 2}
                    arcDashAnimateTime={2600}
                    arcsTransitionDuration={0}
                    // Rings — pulse when a threat "lands"
                    ringsData={ringsData}
                    ringColor={(r) => (t) => `rgba(${r.rgb},${1 - t})`}
                    ringMaxRadius={6}
                    ringPropagationSpeed={4}
                    ringRepeatPeriod={800}
                    // Sentinel Command label
                    labelsData={[{ lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng, text: "SENTINEL COMMAND" }]}
                    labelText="text"
                    labelSize={1.1}
                    labelColor={() => colors.accent}
                    labelDotRadius={0.4}
                    labelAltitude={0.012}
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