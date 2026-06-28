// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — LightRays
// Layer 7: 3 volumetric light shafts slowly oscillating ±5°
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const RAYS = [
    { left: "20%", duration: 12, rotateRange: [-3, 3], opacityRange: [0.6, 1] },
    { left: "50%", duration: 15, rotateRange: [5, -5], opacityRange: [0.4, 0.8] },
    { left: "80%", duration: 10, rotateRange: [-4, 4], opacityRange: [0.5, 0.9] },
];

export default function LightRays() {
    const { effects } = useTheme();
    const rayColor = effects.rayColor;

    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 7,
                pointerEvents: "none",
                overflow: "hidden",
            }}
        >
            {RAYS.map((ray, i) => (
                <motion.div
                    key={i}
                    animate={{
                        rotate: ray.rotateRange,
                        opacity: ray.opacityRange,
                    }}
                    transition={{
                        duration: ray.duration,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                    style={{
                        position: "absolute",
                        top: "-10%",
                        left: ray.left,
                        width: 2,
                        height: "120%",
                        background: `linear-gradient(180deg, ${rayColor} 0%, transparent 100%)`,
                        transformOrigin: "top center",
                        filter: "blur(12px)",
                        willChange: "transform, opacity",
                    }}
                />
            ))}
        </div>
    );
}