// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — IntelGlobe (v5 — FULL REBUILD: GLOWING SPHERE + PARTICLE NETWORK)
//
// The core problem in every prior version: particles only existed on land, so
// oceans were pure flat black (the library's default globe body showing
// through) — that's what made it read as "a black ball with a neon ring"
// instead of "one glowing planet," no matter how good the particle lighting
// got. This version fixes the actual cause:
//
//   1. A SECOND custom shader builds a full glowing gradient sphere — real
//      directional lighting computed across the ENTIRE surface (oceans
//      included), not just at particle positions. This is the base "glowing
//      planet" layer, replacing the library's default flat black globe
//      entirely (showGlobe is disabled).
//   2. The particle network (real point-in-polygon sampled continent shapes)
//      sits ON TOP of that base glow as an accent layer — bright cyan on
//      ambient regions, warm red where a real threat is currently active.
//   3. A fresnel-style rim light on both layers, recomputed every frame from
//      the live camera angle, gives the glowing limb-edge look.
//   4. Real threats still drive shooting-star arcs flying toward a custom
//      Sentinel Command beacon — the "attack rays" that replace the generic
//      floating satellites in the reference aesthetic.
//   5. Starfield background + real bloom complete the look.
//
// Both custom shader objects are grouped into a single Three.js Object3D and
// injected via react-globe.gl's customLayerData/customThreeObject — the
// documented, correct way to inject genuinely custom WebGL content into the
// scene rather than relying on the library's generic built-in layers.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useThreatFeed } from "../../hooks/useThreatFeed";
import { countryFlag } from "../../utils/formatters";

// ── Constants ──────────────────────────────────────────────────────────────────

const COUNTRIES_GEOJSON_URL =
    "https://cdn.jsdelivr.net/gh/vasturiano/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson";

const SENTINEL_HQ = { lat: 20.5937, lng: 78.9629 };

const SEVERITY_COLOR = { CRITICAL: "#ff3b5c", HIGH: "#ff8c3b", MEDIUM: "#ffc23b", LOW: "#3b9bff" };
const SEVERITY_RGB = { CRITICAL: "255,59,92", HIGH: "255,140,59", MEDIUM: "255,194,59", LOW: "59,155,255" };
const SEVERITY_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

// Particle network colors — normalized 0-1 RGB floats (required for direct GPU buffer writes)
const AMBIENT_RGB = [0.24, 0.82, 1.0];   // bright cyan network, ambient regions
const ACTIVE_RGB = [1.0, 0.32, 0.38];    // warm red network, active-threat regions

// Shared light direction — used by BOTH the base sphere and particle shaders,
// so lighting reads consistently across the whole scene. Fixed in the
// globe's own local space: since react-globe.gl's auto-rotate orbits the
// CAMERA around a stationary globe (not the globe's own transform), a light
// fixed in local space stays physically correct as the camera moves — the
// same hemisphere stays lit, exactly like walking around a sunlit ball.
const LIGHT_DIR_GLSL = "vec3(0.5, 0.62, 0.72)";

const CAMERA_WAYPOINTS = [
    { lat: 16, lng: 65, altitude: 1.35 },
    { lat: 22, lng: 90, altitude: 1.4 },
    { lat: 10, lng: 45, altitude: 1.38 },
];

const REST_ALTITUDE = 0.014;     // particle network resting height above the base sphere
const SPHERE_ALTITUDE = 0.004;   // base glow sphere's own radius reference point
const DROP_ALTITUDE = 0.55;      // rain-down starting height above rest
const CANDIDATE_COUNT = 150000;  // sphere lattice density before land-filtering
const BATCH_SIZE = 6000;         // candidates processed per animation frame (avoids load jank)

// ── Geometry helpers — real point-in-polygon sampling ─────────────────────────

/** Even point distribution across a sphere — used as sampling candidates. */
function fibonacciSphere(count) {
    const pts = [];
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const lat = 90 - (phi * 180) / Math.PI;
        let lng = ((theta * 180) / Math.PI) % 360;
        if (lng > 180) lng -= 360;
        pts.push([lng, lat]);
    }
    return pts;
}

/** Standard ray-casting point-in-ring test (lng/lat treated as planar x/y). */
function pointInRing(lng, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        const intersect =
            yi > lat !== yj > lat &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

/** Precompute bbox + normalized polygon list once per country feature. */
function prepareFeature(feature) {
    const geom = feature.geometry;
    let polygons = [];
    if (geom?.type === "Polygon") polygons = [geom.coordinates];
    else if (geom?.type === "MultiPolygon") polygons = geom.coordinates;

    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    for (const poly of polygons) {
        for (const ring of poly) {
            for (const [lng, lat] of ring) {
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
            }
        }
    }
    return { iso: feature.properties?.ISO_A2 ?? null, minLng, maxLng, minLat, maxLat, polygons };
}

/** Point-in-country test using bbox pre-filter, then full ray-cast with holes. */
function pointInFeature(lng, lat, f) {
    if (lng < f.minLng || lng > f.maxLng || lat < f.minLat || lat > f.maxLat) return false;
    for (const poly of f.polygons) {
        const [outer, ...holes] = poly;
        if (pointInRing(lng, lat, outer)) {
            let inHole = false;
            for (const hole of holes) {
                if (pointInRing(lng, lat, hole)) { inHole = true; break; }
            }
            if (!inHole) return true;
        }
    }
    return false;
}

// ── Shader: base glowing gradient sphere (the "no black void" fix) ────────────
// Real per-fragment directional lighting across the ENTIRE surface — oceans
// included — is what makes this read as one cohesive glowing planet instead
// of a black ball with a ring around it.

const SPHERE_VERTEX_SHADER = `
    varying vec3 vNormalObject;
    varying vec3 vNormalView;

    void main() {
        // Sphere: object-space normal is simply the normalized position.
        vNormalObject = normalize(position);
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const SPHERE_FRAGMENT_SHADER = `
    varying vec3 vNormalObject;
    varying vec3 vNormalView;

    void main() {
        vec3 lightDir = normalize(${LIGHT_DIR_GLSL});
        float diffuse = max(dot(vNormalObject, lightDir), 0.0);

        // Deep indigo shadow side → bright cyan-blue lit side. This gradient
        // is what gives the "one glowing orb" gestalt, not a hard rim ring.
        vec3 shadowColor = vec3(0.05, 0.045, 0.15);
        vec3 litColor = vec3(0.16, 0.5, 0.86);
        vec3 baseColor = mix(shadowColor, litColor, diffuse);

        // Fresnel-style rim glow, recomputed every frame from the live
        // camera angle (view-space normal's Z component).
        float facing = clamp(vNormalView.z, 0.0, 1.0);
        float rim = pow(1.0 - facing, 2.4);
        vec3 rimColor = vec3(0.4, 0.85, 1.0) * rim * 0.9;

        gl_FragColor = vec4(baseColor + rimColor, 1.0);
    }
`;

// ── Shader: particle network (real continent shapes, "attack ray" partner layer) ──

const PARTICLE_VERTEX_SHADER = `
    attribute vec3 aStartPos;
    attribute float aDelay;
    attribute float aSize;
    attribute vec3 aColor;
    uniform float uTime;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
        float t = clamp((uTime - aDelay) / 0.9, 0.0, 1.0);
        float eased = 1.0 - pow(1.0 - t, 3.0);
        vec3 pos = mix(aStartPos, position, eased);

        vec3 normalDir = normalize(position);
        vec3 lightDir = normalize(${LIGHT_DIR_GLSL});
        float diffuse = max(dot(normalDir, lightDir), 0.0);
        float shade = 0.3 + diffuse * 0.8;

        vec3 viewNormal = normalize(mat3(modelViewMatrix) * normalDir);
        float rim = pow(1.0 - clamp(viewNormal.z, 0.0, 1.0), 2.2);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float twinkle = 0.88 + 0.12 * sin(uTime * 1.6 + aDelay * 12.0);
        gl_PointSize = aSize * twinkle * (300.0 / -mvPosition.z);

        vec3 rimColor = vec3(0.6, 0.9, 1.0) * rim * 0.55;
        vColor = aColor * shade + rimColor;
        vAlpha = clamp((0.25 + eased * 0.75) * (shade * 0.8 + rim * 0.4 + 0.2), 0.0, 1.0);
    }
`;

const PARTICLE_FRAGMENT_SHADER = `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
    }
`;

// ── Component ──────────────────────────────────────────────────────────────────

export default function IntelGlobe() {
    const { colors } = useTheme();
    const { feed } = useThreatFeed({ maxItems: 18, intervalMs: 20000 });

    const containerRef = useRef(null);
    const globeEl = useRef(null);
    const bloomAddedRef = useRef(false);
    const seenArcIdsRef = useRef(new Set());

    // Custom Three.js scene refs
    const sceneGroupRef = useRef(null);   // returned to customThreeObject (holds sphere + points)
    const pointsMeshRef = useRef(null);   // the particle Points object specifically, for uTime/color updates
    const particleCountriesRef = useRef([]); // ISO_A2 per particle, parallel array
    const clockRef = useRef(0);

    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [hovered, setHovered] = useState(null);
    const [landingRings, setLandingRings] = useState([]);
    const [countries, setCountries] = useState({ features: [] });
    const [sceneLayerData, setSceneLayerData] = useState([]);

    // ── Responsive sizing — fills whatever container it's given ──────────
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

    // ── Load real country geometry once ──────────────────────────────────
    useEffect(() => {
        fetch(COUNTRIES_GEOJSON_URL)
            .then((res) => res.json())
            .then((data) => setCountries(data))
            .catch(() => {
                console.warn("[Sentinel] Country geometry failed to load — globe will render without the particle network.");
            });
    }, []);

    // ── Camera: gentle auto-rotate + slow cinematic drift, zoom disabled ─
    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.28;
        controls.enableRotate = true;
        // Disabled deliberately — this globe sits inline on a scrolling page.
        // Scroll-to-zoom would hijack page scrolling. Drag-to-rotate and
        // click-to-focus stay fully interactive.
        controls.enableZoom = false;

        globeEl.current.pointOfView(CAMERA_WAYPOINTS[0], 0);

        let i = 0;
        const drift = setInterval(() => {
            i = (i + 1) % CAMERA_WAYPOINTS.length;
            globeEl.current?.pointOfView(CAMERA_WAYPOINTS[i], 4500);
        }, 13000);

        return () => clearInterval(drift);
    }, []);

    // ── Genuine bloom — tuned higher-threshold since the base sphere is now
    //    always bright; defensive: silently skipped if it fails to compile ──
    useEffect(() => {
        if (!globeEl.current || width === 0 || height === 0 || bloomAddedRef.current) return;
        try {
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(width, height),
                0.6,   // strength
                0.35,  // radius
                0.38   // threshold — high enough that only the lit hemisphere / rim / particles bloom
            );
            globeEl.current.postProcessingComposer().addPass(bloomPass);
            bloomAddedRef.current = true;
        } catch (err) {
            console.warn("[Sentinel] Bloom post-processing unavailable in this environment:", err);
        }
    }, [width, height]);

    // ── Build the glowing sphere + particle network — once, chunked across frames ──
    useEffect(() => {
        if (!globeEl.current || countries.features.length === 0 || sceneGroupRef.current) return;

        // Derive the exact globe radius the library uses internally, rather
        // than guessing a constant — avoids any scale-mismatch risk.
        const surfaceSample = globeEl.current.getCoords(0, 0, SPHERE_ALTITUDE);
        const sphereRadius = Math.sqrt(
            surfaceSample.x ** 2 + surfaceSample.y ** 2 + surfaceSample.z ** 2
        );

        const preparedFeatures = countries.features.map(prepareFeature);
        const candidates = fibonacciSphere(CANDIDATE_COUNT);

        const positions = [];
        const startPositions = [];
        const sizes = [];
        const delays = [];
        const colorsArr = [];
        const particleCountries = [];

        let cursor = 0;
        let rafId;

        function processBatch() {
            const end = Math.min(cursor + BATCH_SIZE, candidates.length);
            for (let idx = cursor; idx < end; idx++) {
                const [lng, lat] = candidates[idx];
                let matched = null;
                for (const f of preparedFeatures) {
                    if (pointInFeature(lng, lat, f)) { matched = f; break; }
                }
                if (!matched) continue;

                const rest = globeEl.current.getCoords(lat, lng, REST_ALTITUDE);
                const start = globeEl.current.getCoords(lat, lng, REST_ALTITUDE + DROP_ALTITUDE);

                positions.push(rest.x, rest.y, rest.z);
                startPositions.push(start.x, start.y, start.z);
                sizes.push(1.0 + Math.random() * 1.1);
                delays.push(Math.random() * 1.4);
                colorsArr.push(...AMBIENT_RGB);
                particleCountries.push(matched.iso);
            }
            cursor = end;

            if (cursor < candidates.length) {
                rafId = requestAnimationFrame(processBatch);
            } else {
                finalize();
            }
        }

        function finalize() {
            particleCountriesRef.current = particleCountries;

            // ── Base glowing gradient sphere — the "no black void" layer ──
            const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
            const sphereMaterial = new THREE.ShaderMaterial({
                vertexShader: SPHERE_VERTEX_SHADER,
                fragmentShader: SPHERE_FRAGMENT_SHADER,
            });
            const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

            // ── Particle network — real continent shapes ─────────────────
            const particleGeometry = new THREE.BufferGeometry();
            particleGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
            particleGeometry.setAttribute("aStartPos", new THREE.Float32BufferAttribute(startPositions, 3));
            particleGeometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
            particleGeometry.setAttribute("aDelay", new THREE.Float32BufferAttribute(delays, 1));
            particleGeometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colorsArr, 3));

            const particleMaterial = new THREE.ShaderMaterial({
                uniforms: { uTime: { value: 0 } },
                vertexShader: PARTICLE_VERTEX_SHADER,
                fragmentShader: PARTICLE_FRAGMENT_SHADER,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            });

            const pointsMesh = new THREE.Points(particleGeometry, particleMaterial);
            pointsMeshRef.current = pointsMesh;

            // ── Combine into one group for the custom layer ───────────────
            const group = new THREE.Group();
            group.add(sphereMesh);
            group.add(pointsMesh);
            sceneGroupRef.current = group;

            // Triggers customThreeObject to run exactly once with this sentinel data.
            setSceneLayerData([{ id: "intel-globe-scene" }]);
        }

        rafId = requestAnimationFrame(processBatch);
        return () => cancelAnimationFrame(rafId);
    }, [countries]);

    // ── Drive the particle shader clock (drop-in animation + ongoing twinkle) ──
    useEffect(() => {
        let rafId;
        let last = performance.now();
        function tick(now) {
            const dt = (now - last) / 1000;
            last = now;
            clockRef.current += dt;
            if (pointsMeshRef.current) {
                pointsMeshRef.current.material.uniforms.uTime.value = clockRef.current;
            }
            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
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

    const activeCountrySet = useMemo(
        () => new Set(points.map((p) => p.country).filter(Boolean)),
        [points]
    );

    // ── Recolor the particle network in-place whenever active-threat countries change ──
    useEffect(() => {
        const ps = pointsMeshRef.current;
        if (!ps) return;
        const colorAttr = ps.geometry.attributes.aColor;
        const countriesArr = particleCountriesRef.current;
        for (let i = 0; i < countriesArr.length; i++) {
            const active = countriesArr[i] && activeCountrySet.has(countriesArr[i]);
            const rgb = active ? ACTIVE_RGB : AMBIENT_RGB;
            colorAttr.array[i * 3] = rgb[0];
            colorAttr.array[i * 3 + 1] = rgb[1];
            colorAttr.array[i * 3 + 2] = rgb[2];
        }
        colorAttr.needsUpdate = true;
    }, [activeCountrySet]);

    // ── Arcs — the "attack ray" signature: bright head + soft tail per real threat ──
    const arcs = useMemo(() => {
        const list = [];
        for (const t of points) {
            const rgb = SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW;
            const gapPhase = Math.random() * 2;
            const strokeBase = t.severity === "CRITICAL" ? 0.55 : 0.35;
            const base = {
                startLat: t.lat, startLng: t.lng,
                endLat: SENTINEL_HQ.lat, endLng: SENTINEL_HQ.lng,
                severity: t.severity, dashGap: 2.3, dashTime: 1300, gapPhase,
            };
            list.push({ ...base, id: String(t.id), color: `rgba(${rgb},0.5)`, stroke: strokeBase, dashLength: 0.22 });
            list.push({ ...base, id: `${t.id}-head`, color: `rgb(${rgb})`, stroke: strokeBase * 1.6, dashLength: 0.035 });
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
            maxR: 6, speed: 4.5, repeatPeriod: 900, altitude: 0.02,
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
            id: `beacon-${t.id}`, lat: t.lat, lng: t.lng,
            rgb: SEVERITY_RGB[t.severity] ?? SEVERITY_RGB.LOW,
            maxR: 2.2, speed: 1.1, repeatPeriod: 2400, altitude: 0.016,
        }));
        const hqHalo = {
            id: "hq-halo", lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng,
            rgb: "0,229,255", maxR: 4, speed: 1.6, repeatPeriod: 2600, altitude: 0.018,
        };
        return [...beacons, hqHalo, ...landingRings];
    }, [points, landingRings]);

    const buildSceneObject = useCallback(() => sceneGroupRef.current, []);

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%" }}>
            {width > 0 && height > 0 && (
                <Globe
                    ref={globeEl}
                    width={width}
                    height={height}
                    backgroundColor="rgba(0,0,0,0)"
                    backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
                    // The default flat-black globe is disabled entirely — our
                    // own glowing gradient sphere (in the custom layer below)
                    // replaces it, which is the actual fix for the "black
                    // void" problem.
                    showGlobe={false}
                    showAtmosphere
                    atmosphereColor={colors.accent}
                    atmosphereAltitude={0.12}
                    // Custom scene: glowing sphere + particle network, one group
                    customLayerData={sceneLayerData}
                    customThreeObject={buildSceneObject}
                    customThreeObjectUpdate={() => { }}
                    // Points — real threats at real coordinates
                    pointsData={points}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor="color"
                    pointAltitude={0.03}
                    pointRadius="size"
                    onPointHover={setHovered}
                    onPointClick={(p) => {
                        globeEl.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.15 }, 1200);
                    }}
                    // Arcs — the "attack ray" signature layer
                    arcsData={arcs}
                    arcColor="color"
                    arcAltitude={0.26}
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
                    // Custom-branded Sentinel Command beacon
                    htmlElementsData={[{ lat: SENTINEL_HQ.lat, lng: SENTINEL_HQ.lng }]}
                    htmlLat="lat"
                    htmlLng="lng"
                    htmlAltitude={0.032}
                    htmlElement={() => {
                        const el = document.createElement("div");
                        el.style.pointerEvents = "none";
                        el.style.transform = "translate(-50%, -100%)";
                        el.innerHTML = `
                            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                                <div style="
                                    width:7px;height:7px;border-radius:50%;
                                    background:#00e5ff;
                                    box-shadow:0 0 8px 2px rgba(0,229,255,0.9), 0 0 18px 6px rgba(0,229,255,0.35);
                                "></div>
                                <div style="
                                    font-family:var(--font-accent, monospace);
                                    font-size:8px;
                                    font-weight:700;
                                    letter-spacing:0.1em;
                                    color:#7fefff;
                                    text-shadow:0 0 6px rgba(0,229,255,0.8);
                                    white-space:nowrap;
                                    background:rgba(2,4,9,0.6);
                                    padding:2px 7px;
                                    border:1px solid rgba(0,229,255,0.35);
                                    border-radius:5px;
                                    backdrop-filter:blur(6px);
                                ">SENTINEL COMMAND</div>
                            </div>
                        `;
                        return el;
                    }}
                />
            )}

            {/* Soft edge fade — blends into the page background, no hard frame */}
            <div style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `radial-gradient(ellipse at center, transparent 58%, ${colors.bg} 100%)`,
            }} />

            {/* Hovered threat tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        style={{
                            position: "absolute", top: 20, left: 20,
                            background: colors.bgGlass,
                            backdropFilter: "blur(16px)",
                            border: `1px solid ${(SEVERITY_COLOR[hovered.severity] ?? colors.accent)}40`,
                            borderRadius: 10,
                            padding: "8px 12px",
                            maxWidth: 220,
                            pointerEvents: "none",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span>{countryFlag(hovered.country)}</span>
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.72rem", color: colors.text }}>
                                {hovered.type}
                            </span>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: SEVERITY_COLOR[hovered.severity] ?? colors.accent }}>
                            {hovered.ioc}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live indicator — real count */}
            <div style={{
                position: "absolute", bottom: 24, right: 24,
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 14px",
                background: colors.bgGlass,
                backdropFilter: "blur(12px)",
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
            }}>
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: colors.green, boxShadow: `0 0 5px ${colors.greenGlow}` }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: colors.textSub, letterSpacing: "0.08em" }}>
                    {points.length} ACTIVE THREAT ZONES
                </span>
            </div>
        </div>
    );
}