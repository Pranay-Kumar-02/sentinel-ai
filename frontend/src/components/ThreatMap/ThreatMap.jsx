// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatMap (v5 — ALL-IN)
// Adds, on top of v4's starfield/cinematic-camera/bloom:
//   1. Shooting-star arcs — each threat now renders as a paired bright "head"
//      + softer "tail" arc, phase-locked via a shared gapPhase so they travel
//      together as one comet instead of two independent dashed lines.
//   2. Glowing country borders — real world country geometry (official
//      three-globe/globe.gl dataset), subtle everywhere, brighter/highlighted
//      for countries with an ACTUAL active threat right now (data-driven, not
//      decorative).
//   3. Custom-branded Sentinel Command beacon — replaces the plain built-in
//      text label with a real styled HTML marker matching the app's glass/
//      glow aesthetic, via htmlElementsData.
//   4. Cinematic vignette — radial-gradient overlay darkening the edges to
//      focus attention on the globe, pure CSS, zero rendering risk.
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

// Official globe.gl example dataset — world country boundaries (Natural Earth 110m)
const COUNTRIES_GEOJSON_URL =
    "https://cdn.jsdelivr.net/gh/vasturiano/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson";

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
    const [countries, setCountries] = useState({ features: [] });

    // ── Load real world country borders once (decorative fetch — fails silently) ──
    useEffect(() => {
        fetch(COUNTRIES_GEOJSON_URL)
            .then((res) => res.json())
            .then((data) => setCountries(data))
            .catch(() => {
                // Borders are an enhancement, not core functionality —
                // if the CDN fetch fails, the globe still works fine without them.
                console.warn("[Sentinel] Country border data failed to load — continuing without it.");
            });
    }, []);

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
                0.55,  // strength — accents, doesn't wash out
                0.3,   // radius
                0.32   // threshold — only genuine hotspots bloom, not the whole atmosphere shell
            );
            globeEl.current.postProcessingComposer().addPass(bloomPass);
            bloomAddedRef.current = true;
        } catch (err) {
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

    // ── Countries currently hosting an active real threat ────────────────
    const activeCountrySet = useMemo(
        () => new Set(points.map((p) => p.country).filter(Boolean)),
        [points]
    );

    // ── Arcs — shooting-star pairs: bright "head" + soft "tail" per threat ──
    const arcs = useMemo(() => {
        const list = [];
        for (const t of points) {
            const rgb = SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW;
            const gapPhase = Math.random() * 2; // shared so head+tail move as one unit
            const strokeBase = t.severity === "CRITICAL" ? 0.55 : 0.35;
            const base = {
                startLat: t.lat,
                startLng: t.lng,
                endLat: SENTINEL_HQ.lat,
                endLng: SENTINEL_HQ.lng,
                severity: t.severity,
                dashGap: 2.3,
                dashTime: 1300,
                gapPhase,
            };
            list.push({
                ...base,
                id: String(t.id),
                color: `rgba(${rgb},0.5)`,
                stroke: strokeBase,
                dashLength: 0.22,
            });
            list.push({
                ...base,
                id: `${t.id}-head`,
                color: `rgb(${rgb})`,
                stroke: strokeBase * 1.6,
                dashLength: 0.035, // short — reads as a bright traveling point
            });
        }
        return list;
    }, [points]);

    // ── Fire a landing pulse at HQ for each genuinely new threat ─────────
    useEffect(() => {
        const tails = arcs.filter((a) => !a.id.endsWith("-head"));
        const fresh = tails.filter((a) => !seenArcIdsRef.current.has(a.id));
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
                    atmosphereAltitude={0.13}
                    // Country borders — subtle everywhere, glowing where a real threat is active
                    polygonsData={countries.features?.filter((f) => f.properties.ISO_A2 !== "AQ") ?? []}
                    polygonAltitude={0.006}
                    polygonCapColor={(f) =>
                        activeCountrySet.has(f.properties.ISO_A2) ? "rgba(255,90,90,0.12)" : "rgba(0,0,0,0)"
                    }
                    polygonSideColor={() => "rgba(0,0,0,0)"}
                    polygonStrokeColor={(f) =>
                        activeCountrySet.has(f.properties.ISO_A2)
                            ? "rgba(255,130,130,0.85)"
                            : "rgba(110,190,255,0.18)"
                    }
                    polygonsTransitionDuration={400}
                    // Points — real threats at real coordinates
                    pointsData={points}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor="color"
                    pointAltitude={0.018}
                    pointRadius="size"
                    onPointHover={setHovered}
                    // Arcs — shooting-star head + tail pairs
                    arcsData={arcs}
                    arcColor="color"
                    arcAltitude={0.28}
                    arcStroke="stroke"
                    arcDashLength="dashLength"
                    arcDashGap="dashGap"
                    arcDashInitialGap="gapPhase"
                    arcDashAnimateTime="dashTime"
                    arcsTransitionDuration={0}
                    // Rings — persistent ambient beacons + landing pulses
                    ringsData={rings}
                    ringColor={(r) => (t) => `rgba(${r.rgb},${1 - t})`}
                    ringMaxRadius={(r) => r.maxR}
                    ringPropagationSpeed={(r) => r.speed}
                    ringRepeatPeriod={(r) => r.repeatPeriod}
                    ringAltitude={(r) => r.altitude}
                    // Custom-branded Sentinel Command beacon (replaces plain text label)
                    htmlElementsData={[{ lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng }]}
                    htmlLat="lat"
                    htmlLng="lng"
                    htmlAltitude={0.02}
                    htmlElement={() => {
                        const el = document.createElement("div");
                        el.style.pointerEvents = "none";
                        el.style.transform = "translate(-50%, -100%)";
                        el.innerHTML = `
                            <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
                                <div style="
                                    width:9px;height:9px;border-radius:50%;
                                    background:#00e5ff;
                                    box-shadow:0 0 10px 3px rgba(0,229,255,0.9), 0 0 26px 9px rgba(0,229,255,0.35);
                                "></div>
                                <div style="
                                    font-family:var(--font-accent, monospace);
                                    font-size:10px;
                                    font-weight:700;
                                    letter-spacing:0.12em;
                                    color:#7fefff;
                                    text-shadow:0 0 8px rgba(0,229,255,0.8);
                                    white-space:nowrap;
                                    background:rgba(2,4,9,0.6);
                                    padding:3px 9px;
                                    border:1px solid rgba(0,229,255,0.35);
                                    border-radius:6px;
                                    backdrop-filter:blur(6px);
                                ">SENTINEL COMMAND</div>
                            </div>
                        `;
                        return el;
                    }}
                />
            )}

            {/* Cinematic vignette — darkens edges, focuses attention on the globe */}
            <div style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,3,0.6) 100%)",
                zIndex: 2,
            }} />

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
                    zIndex: 3,
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
                zIndex: 4,
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
                zIndex: 4,
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