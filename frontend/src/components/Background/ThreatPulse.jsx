// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ThreatPulse
// Layer 5: circular shockwaves emanating from random points every 4s
// Color matches current threat level
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function ThreatPulse({ verdictColor = null }) {
    const { colors } = useTheme();
    const [waves, setWaves] = useState([]);

    const pulseColor = verdictColor ?? colors.accent;

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Math.random().toString(36).slice(2);
            const x = Math.random() * 100; // percent
            const y = Math.random() * 100;
            setWaves((prev) => [...prev.slice(-4), { id, x, y }]);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
                pointerEvents: "none",
                overflow: "hidden",
            }}
        >
            <AnimatePresence>
                {waves.map((wave) => (
                    <motion.div
                        key={wave.id}
                        initial={{ scale: 0, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 0 }}
                        exit={{}}
                        transition={{ duration: 4, ease: "easeOut" }}
                        onAnimationComplete={() => {
                            setWaves((prev) => prev.filter((w) => w.id !== wave.id));
                        }}
                        style={{
                            position: "absolute",
                            left: `${wave.x}%`,
                            top: `${wave.y}%`,
                            width: 400,
                            height: 400,
                            marginLeft: -200,
                            marginTop: -200,
                            borderRadius: "50%",
                            border: `1px solid ${pulseColor}`,
                            pointerEvents: "none",
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}