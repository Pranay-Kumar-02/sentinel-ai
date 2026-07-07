// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — IntelGlobe (v6 — PROVEN TECHNIQUE, RESTRAINED SCALE)
// This drops the custom particle-shader approach entirely — it cost a lot of
// iteration without landing. Instead, this reuses the exact react-globe.gl
// technique already validated and praised on the Intelligence page's
// ThreatMap: real earth texture, real bloom, real starfield, real threat
// arcs. The difference here is scale and restraint — this renders as a
// precise, bounded instrument panel (per the Stripe-inspired direction:
// craft in the details, not a maximalist centerpiece), not a giant
// dominant hero object.
//
// Fills whatever container it's given — HeroSection frames it in a glass
// instrument panel sized deliberately smaller than before.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useMemo } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import { countryFlag } from "../../utils/formatters";

const SENTINEL_HQ = { lat: 20.5937, lng: 78.9629 };

const SEVERITY_COLOR = { CRITICAL: "#ff3b5c", HIGH: "#ff8c3b", MEDIUM: "#ffc23b", LOW: "#3b9bff" };
const SEVERITY_RGB = { CRITICAL: "255,59,92", HIGH: "255,140,59", MEDIUM: "255,194,59", LOW: "59,155,255" };
const SEVERITY_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

// A single gentle vantage point — restrained, not a sweeping cinematic drift.
// This is an instrument, not a show.
const CAMERA_VIEW = { lat: 18, lng: 72, altitude: 1.9 };

export default function IntelGlobe({ maxThreats = 10 }) {
    const { colors } = useTheme();
    const { feed } = useThreatFeed({ maxItems: maxThreats, intervalMs: 20000 });

    const containerRef = useRef(null);
    const globeEl = useRef(null);
    const bloomAddedRef = useRef(false);
    const seenArcIdsRef = useRef(new Set());

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [landingRings, setLandingRings] = useState([]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
                setHeight(entry.contentRect.height);
            }
        });
        observer.observe(el);
        setWidth(el.clientWidth);
        setHeight(el.clientHeight);
        return () => observer.disconnect();
    }, []);

    // Gentle auto-rotate only — no sweeping camera drift. Restraint, not spectacle.
    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.25;
        controls.enableRotate = true;
        controls.enableZoom = false; // avoid hijacking page scroll
        globeEl.current.pointOfView(CAMERA_VIEW, 0);
    }, []);

    useEffect(() => {
        if (!globeEl.current || width === 0 || height === 0 || bloomAddedRef.current) return;
        try {
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(width, height),
                0.55,
                0.32,
                0.3
            );
            globeEl.current.postProcessingComposer().addPass(bloomPass);
            bloomAddedRef.current = true;
        } catch (err) {
            console.warn("[Sentinel] Bloom post-processing unavailable in this environment:", err);
        }
    }, [width, height]);

    const points = useMemo(() => {
        return feed
            .filter((t) => typeof t.lat === "number" && typeof t.lon === "number")
            .map((t) => ({
                ...t,
                lat: t.lat,
                lng: t.lon,
                size: 0.35 + (SEVERITY_ORDER[t.severity] ?? 0) * 0.2,
                color: SEVERITY_COLOR[t.severity] ?? SEVERITY_COLOR.LOW,
            }));
    }, [feed]);

    const arcs = useMemo(() => {
        const list = [];
        for (const t of points) {
            const rgb = SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW;
            const gapPhase = Math.random() * 2;
            const strokeBase = t.severity === "CRITICAL" ? 0.5 : 0.3;
            const base = {
                startLat: t.lat, startLng: t.lng,
                endLat: SENTINEL_HQ.lat, endLng: SENTINEL_HQ.lng,
                severity: t.severity, dashGap: 2.3, dashTime: 1300, gapPhase,
            };
            list.push({ ...base, id: String(t.id), color: `rgba(${rgb},0.5)`, stroke: strokeBase, dashLength: 0.22 });
            list.push({ ...base, id: `${t.id}-head`, color: `rgb(${rgb})`, stroke: strokeBase * 1.6, dashLength: 0.03 });
        }
        return list;
    }, [points]);

    useEffect(() => {
        const tails = arcs.filter((a) => !a.id.endsWith("-head"));
        const fresh = tails.filter((a) => !seenArcIdsRef.current.has(a.id));
        if (fresh.length === 0) return;
        fresh.forEach((a) => seenArcIdsRef.current.add(a.id));

        const newRings = fresh.map((a) => ({
            id: `${a.id}-landing`,
            lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng,
            rgb: SEVERITY_RGB[a.severity] ?? SEVERITY_RGB.LOW,
            maxR: 5, speed: 4.2, repeatPeriod: 900, altitude: 0.015,
        }));
        setLandingRings((prev) => [...prev, ...newRings]);
        const timer = setTimeout(() => {
            setLandingRings((prev) => prev.filter((r) => !newRings.some((n) => n.id === r.id)));
        }, 2400);
        return () => clearTimeout(timer);
    }, [arcs]);

    const rings = useMemo(() => {
        const hqHalo = {
            id: "hq-halo", lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng,
            rgb: "0,229,255", maxR: 3.4, speed: 1.4, repeatPeriod: 2600, altitude: 0.016,
        };
        return [hqHalo, ...landingRings];
    }, [landingRings]);

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
            {width > 0 && height > 0 && (
                <Globe
                    ref={globeEl}
                    width={width}
                    height={height}
                    backgroundColor="rgba(0,0,0,0)"
                    backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
                    globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
                    bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
                    showAtmosphere
                    atmosphereColor={colors.accent}
                    atmosphereAltitude={0.13}
                    pointsData={points}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor="color"
                    pointAltitude={0.02}
                    pointRadius="size"
                    onPointHover={setHovered}
                    arcsData={arcs}
                    arcColor="color"
                    arcAltitude={0.24}
                    arcStroke="stroke"
                    arcDashLength="dashLength"
                    arcDashGap="dashGap"
                    arcDashInitialGap="gapPhase"
                    arcDashAnimateTime="dashTime"
                    arcsTransitionDuration={0}
                    ringsData={rings}
                    ringColor={(r) => (t) => `rgba(${r.rgb},${1 - t})`}
                    ringMaxRadius={(r) => r.maxR}
                    ringPropagationSpeed={(r) => r.speed}
                    ringRepeatPeriod={(r) => r.repeatPeriod}
                    ringAltitude={(r) => r.altitude}
                    htmlElementsData={[{ lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng }]}
                    htmlLat="lat"
                    htmlLng="lng"
                    htmlAltitude={0.022}
                    htmlElement={() => {
                        const el = document.createElement("div");
                        el.style.pointerEvents = "none";
                        el.style.transform = "translate(-50%, -100%)";
                        el.innerHTML = `
                            <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                                <div style="
                                    width:6px;height:6px;border-radius:50%;
                                    background:#00e5ff;
                                    box-shadow:0 0 6px 2px rgba(0,229,255,0.9);
                                "></div>
                                <div style="
                                    font-family:var(--font-accent, monospace);
                                    font-size:7px;
                                    font-weight:700;
                                    letter-spacing:0.1em;
                                    color:#7fefff;
                                    white-space:nowrap;
                                    background:rgba(2,4,9,0.6);
                                    padding:2px 6px;
                                    border:1px solid rgba(0,229,255,0.3);
                                    border-radius:4px;
                                ">SENTINEL COMMAND</div>
                            </div>
                        `;
                        return el;
                    }}
                />
            )}

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        style={{
                            position: "absolute", top: 14, left: 14,
                            background: colors.bgGlass,
                            backdropFilter: "blur(16px)",
                            border: `1px solid ${(SEVERITY_COLOR[hovered.severity] ?? colors.accent)}40`,
                            borderRadius: 8,
                            padding: "6px 10px",
                            maxWidth: 200,
                            pointerEvents: "none",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                            <span style={{ fontSize: "0.7rem" }}>{countryFlag(hovered.country)}</span>
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.68rem", color: colors.text }}>
                                {hovered.type}
                            </span>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: SEVERITY_COLOR[hovered.severity] ?? colors.accent }}>
                            {hovered.ioc}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}