// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — RadarSweep
// Layer 6: 360° radar sweep every 8 seconds with random blip detections
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function RadarSweep() {
    const { radar, colors } = useTheme();
    const [blips, setBlips] = useState([]);
    const sweepCount = useRef(0);

    // Spawn a random blip on each radar sweep
    useEffect(() => {
        const interval = setInterval(() => {
            sweepCount.current += 1;
            // Every sweep has a 60% chance of a detection
            if (Math.random() > 0.4) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.random() * 45 + 5; // % of container
                setBlips((prev) => [
                    ...prev.slice(-6),
                    {
                        id: Math.random().toString(36).slice(2),
                        x: 50 + r * Math.cos(angle),
                        y: 50 + r * Math.sin(angle),
                    },
                ]);
            }
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 6,
                pointerEvents: "none",
                overflow: "hidden",
            }}
        >
            {/* Radar circle */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "min(100vw, 100vh)",
                    height: "min(100vw, 100vh)",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    border: `1px solid rgba(${colors.accent}, 0.03)`,
                    overflow: "hidden",
                }}
            >
                {/* Sweep cone */}
                <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "50%",
                        height: "50%",
                        transformOrigin: "0% 100%",
                        background: `conic-gradient(
                            from 0deg,
                            transparent 0deg,
                            ${radar.trail} 60deg,
                            ${radar.color} 90deg,
                            transparent 91deg
                        )`,
                        willChange: "transform",
                    }}
                />

                {/* Radar rings */}
                {[25, 50, 75, 100].map((pct) => (
                    <div
                        key={pct}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            width: `${pct}%`,
                            height: `${pct}%`,
                            transform: "translate(-50%, -50%)",
                            borderRadius: "50%",
                            border: `0.5px solid ${radar.color}`,
                            opacity: 0.3,
                        }}
                    />
                ))}

                {/* Cross-hair lines */}
                <div style={{ position: "absolute", inset: 0 }}>
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: 1,
                        background: radar.color,
                        opacity: 0.15,
                    }} />
                    <div style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: radar.color,
                        opacity: 0.15,
                    }} />
                </div>
            </div>

            {/* Blip detections */}
            <AnimatePresence>
                {blips.map((blip) => (
                    <motion.div
                        key={blip.id}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: [0, 2.5], opacity: [1, 0] }}
                        exit={{}}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        onAnimationComplete={() =>
                            setBlips((prev) => prev.filter((b) => b.id !== blip.id))
                        }
                        style={{
                            position: "absolute",
                            left: `${blip.x}%`,
                            top: `${blip.y}%`,
                            width: 8,
                            height: 8,
                            marginLeft: -4,
                            marginTop: -4,
                            borderRadius: "50%",
                            background: radar.dot,
                            boxShadow: `0 0 8px ${radar.dot}`,
                            pointerEvents: "none",
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}