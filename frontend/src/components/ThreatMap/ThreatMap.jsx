// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatMap (v4 — STARFIELD + CINEMATIC + REAL BLOOM)
// v3 added fake glow via duplicate arcs. v4 goes further:
//   - Real starfield background (official three-globe asset) instead of flat
//     black void — the single biggest "this looks like a toy" fix.
//   - Slow cinematic camera drift — periodically eases to a nearby vantage
//     point instead of pure mechanical rotation, feels intentional/directed.
//   - GENUINE bloom lighting (UnrealBloomPass) — makes city lights, arcs, and
//     points actually glow via real post-processing, not a CSS trick. This
//     is wrapped in try/catch and only added once: if it fails to compile on
//     a given GPU/three.js combination, it fails silently and you keep the
//     fully working non-bloom globe instead of a broken page. Since bloom now
//     provides real glow, the old fake dual-arc trick is dropped — one arc
//     per threat, cleaner and lets bloom do the glowing.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useMemo } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
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

// Cinematic camera waypoints — the globe eases between these every few
// seconds instead of only spinning mechanically on one axis.
const CAMERA_WAYPOINTS = [
    { lat: 14, lng: 60, altitude: 1.7 },
    { lat: 28, lng: 90, altitude: 1.85 },
    { lat: 5, lng: 30, altitude: 1.75 },
    { lat: 20, lng: 110, altitude: 1.8 },
];

export default function ThreatMap({ height = 480, maxNodes = 40 }) {
    const { colors } = useTheme();
    const { feed } = useThreatFeed({ maxItems: maxNodes, intervalMs: 20000 });

    const containerRef = useRef(null);
    const globeEl = useRef(null);
    const seenArcIdsRef = useRef(new Set());
    const bloomAddedRef = useRef(false);

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

    // ── Auto-rotate (base) + cinematic drift between waypoints ───────────
    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.enableZoom = true;

        globeEl.current.pointOfView(CAMERA_WAYPOINTS[0], 0);

        let i = 0;
        const drift = setInterval(() => {
            i = (i + 1) % CAMERA_WAYPOINTS.length;
            globeEl.current?.pointOfView(CAMERA_WAYPOINTS[i], 3200);
        }, 9000);

        return () => clearInterval(drift);
    }, []);

    // ── Genuine bloom — defensive: silently skipped if it fails to compile ──
    useEffect(() => {
        if (!globeEl.current || width === 0 || bloomAddedRef.current) return;
        try {
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(width, height),
                0.85,  // strength
                0.45,  // radius
                0.15   // threshold — only genuinely bright pixels (lights, arcs, points) bloom
            );
            globeEl.current.postProcessingComposer().addPass(bloomPass);
            bloomAddedRef.current = true;
        } catch (err) {
            // Known to be version-sensitive across three.js releases — if it
            // fails, the globe still renders perfectly without bloom.
            console.warn("[Sentinel] Bloom post-processing unavailable in this environment:", err);
        }
    }, [width, height]);

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

    // ── Arcs — one bright comet-style arc per threat (bloom supplies the glow) ──
    const arcs = useMemo(() => {
        return points.map((t) => {
            const rgb = SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW;
            return {
                id: String(t.id),
                startLat: t.lat,
                startLng: t.lng,
                endLat: SENTINEL_HQ.lat,
                endLng: SENTINEL_HQ.lng,
                color: `rgb(${rgb})`,
                severity: t.severity,
                stroke: t.severity === "CRITICAL" ? 0.65 : 0.42,
                dashLength: 0.16,
                dashGap: 2.4,
                dashTime: 1300,
            };
        });
    }, [points]);

    // ── Fire a landing pulse at HQ for each genuinely new arc ────────────
    useEffect(() => {
        const fresh = arcs.filter((a) => !seenArcIdsRef.current.has(a.id));
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
                background: "#000003",
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
                    backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
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
                    // Arcs — comet-style, bloom supplies the glow
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