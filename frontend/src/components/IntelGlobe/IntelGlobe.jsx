// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — IntelGlobe
// The identity of Sentinel AI. Rotating SVG globe with threat pulses,
// connection arcs between countries, and live threat nodes.
// Canvas-based for 60fps performance.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

// ── Globe math helpers ────────────────────────────────────────────────────────

function latLonToXY(lat, lon, rotation, cx, cy, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + rotation) * (Math.PI / 180);
    const x = cx + r * Math.sin(phi) * Math.cos(theta);
    const y = cy + r * Math.cos(phi);
    const z = Math.sin(phi) * Math.sin(theta); // depth
    return { x, y, z };
}

// ── Threat hotspots ───────────────────────────────────────────────────────────

const HOTSPOTS = [
    { lat: 28.6, lon: 77.2, label: "New Delhi", threat: "HIGH" },
    { lat: 19.0, lon: 72.8, label: "Mumbai", threat: "CRITICAL" },
    { lat: 51.5, lon: -0.1, label: "London", threat: "MEDIUM" },
    { lat: 40.7, lon: -74.0, label: "New York", threat: "HIGH" },
    { lat: 35.7, lon: 139.7, label: "Tokyo", threat: "MEDIUM" },
    { lat: 31.2, lon: 121.5, label: "Shanghai", threat: "HIGH" },
    { lat: 55.8, lon: 37.6, label: "Moscow", threat: "CRITICAL" },
    { lat: 48.8, lon: 2.3, label: "Paris", threat: "LOW" },
    { lat: -23.5, lon: -46.6, label: "São Paulo", threat: "MEDIUM" },
    { lat: 6.5, lon: 3.4, label: "Lagos", threat: "HIGH" },
    { lat: 37.5, lon: 127.0, label: "Seoul", threat: "MEDIUM" },
    { lat: 13.1, lon: 80.3, label: "Chennai", threat: "HIGH" },
];

const THREAT_COLORS = {
    CRITICAL: "#ff0033",
    HIGH: "#ff4444",
    MEDIUM: "#ffb800",
    LOW: "#3b82f6",
};

// ── Dot pattern for globe surface ─────────────────────────────────────────────

function generateGlobeDots(count = 300) {
    const dots = [];
    for (let i = 0; i < count; i++) {
        // Fibonacci sphere distribution
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const lat = 90 - (phi * 180 / Math.PI);
        const lon = (theta * 180 / Math.PI) % 360 - 180;
        dots.push({ lat, lon });
    }
    return dots;
}

const GLOBE_DOTS = generateGlobeDots(400);

// ── Component ─────────────────────────────────────────────────────────────────

export default function IntelGlobe({ size = 420 }) {
    const { colors } = useTheme();
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const rotRef = useRef(0);
    const [activeNode, setActiveNode] = useState(null);
    const [tooltip, setTooltip] = useState(null);

    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.38;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        function draw() {
            ctx.clearRect(0, 0, size, size);
            const rot = rotRef.current;

            // ── Outer glow ring ─────────────────────────────────
            const grad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.2);
            grad.addColorStop(0, `${colors.accent}00`);
            grad.addColorStop(0.7, `${colors.accent}08`);
            grad.addColorStop(1, `${colors.accent}00`);
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // ── Atmosphere ──────────────────────────────────────
            const atmo = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.05);
            atmo.addColorStop(0, `${colors.accent}00`);
            atmo.addColorStop(0.5, `${colors.accent}12`);
            atmo.addColorStop(1, `${colors.accent}00`);
            ctx.beginPath();
            ctx.arc(cx, cy, r * 1.04, 0, Math.PI * 2);
            ctx.fillStyle = atmo;
            ctx.fill();

            // ── Globe base circle ───────────────────────────────
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fillStyle = `${colors.bgMid}cc`;
            ctx.fill();
            ctx.strokeStyle = `${colors.accent}20`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // ── Latitude lines ──────────────────────────────────
            for (let lat = -60; lat <= 60; lat += 30) {
                const phi = (90 - lat) * (Math.PI / 180);
                const latR = r * Math.sin(phi);
                const latY = cy + r * Math.cos(phi);
                ctx.beginPath();
                ctx.ellipse(cx, latY, latR, latR * 0.15, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `${colors.accent}08`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // ── Longitude lines ─────────────────────────────────
            for (let lon = 0; lon < 180; lon += 30) {
                const angle = ((lon + rot) % 360) * (Math.PI / 180);
                ctx.beginPath();
                ctx.ellipse(cx, cy, r * Math.abs(Math.cos(angle)), r, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `${colors.accent}06`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // ── Surface dots ────────────────────────────────────
            for (const dot of GLOBE_DOTS) {
                const { x, y, z } = latLonToXY(dot.lat, dot.lon, rot, cx, cy, r);
                if (z < 0) continue; // back-face culling
                const alpha = 0.1 + z * 0.25;
                ctx.beginPath();
                ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `${colors.accent}`;
                ctx.globalAlpha = alpha;
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // ── Connection arcs between hotspots ────────────────
            const visible = HOTSPOTS.map((h) => ({
                ...h,
                ...latLonToXY(h.lat, h.lon, rot, cx, cy, r),
            })).filter((h) => h.z > -0.1);

            // Draw arcs between first 3 visible pairs
            for (let i = 0; i < Math.min(visible.length - 1, 3); i++) {
                const a = visible[i];
                const b = visible[i + 1];
                if (a.z < 0 || b.z < 0) continue;

                const midX = (a.x + b.x) / 2;
                const midY = (a.y + b.y) / 2 - 40;
                const alpha = Math.min(a.z, b.z) * 0.4;

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.quadraticCurveTo(midX, midY, b.x, b.y);
                ctx.strokeStyle = THREAT_COLORS[a.threat] ?? colors.accent;
                ctx.globalAlpha = alpha * 0.5;
                ctx.lineWidth = 0.8;
                ctx.setLineDash([4, 6]);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.globalAlpha = 1;
            }

            // ── Hotspot nodes ────────────────────────────────────
            for (const h of visible) {
                if (h.z < 0) continue;
                const tColor = THREAT_COLORS[h.threat] ?? colors.accent;
                const alpha = 0.4 + h.z * 0.6;
                const dotR = 3 + h.z * 3;

                // Pulse ring
                const pulse = (Date.now() % 2000) / 2000;
                ctx.beginPath();
                ctx.arc(h.x, h.y, dotR + pulse * 10, 0, Math.PI * 2);
                ctx.strokeStyle = tColor;
                ctx.globalAlpha = alpha * (1 - pulse) * 0.5;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.globalAlpha = 1;

                // Core dot
                ctx.beginPath();
                ctx.arc(h.x, h.y, dotR, 0, Math.PI * 2);
                ctx.fillStyle = tColor;
                ctx.globalAlpha = alpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // ── Rotate ──────────────────────────────────────────
            rotRef.current = (rotRef.current + 0.12) % 360;
            rafRef.current = requestAnimationFrame(draw);
        }

        draw();
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [colors, size, cx, cy, r]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{
                position: "relative",
                width: size,
                height: size,
                flexShrink: 0,
            }}
        >
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{
                    borderRadius: "50%",
                    display: "block",
                }}
            />

            {/* Live indicator */}
            <div style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                background: colors.bgGlass,
                backdropFilter: "blur(12px)",
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
            }}>
                <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: colors.green,
                        boxShadow: `0 0 5px ${colors.greenGlow}`,
                    }}
                />
                <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: colors.textSub,
                    letterSpacing: "0.08em",
                }}>
                    {HOTSPOTS.length} ACTIVE THREAT ZONES
                </span>
            </div>
        </motion.div>
    );
}