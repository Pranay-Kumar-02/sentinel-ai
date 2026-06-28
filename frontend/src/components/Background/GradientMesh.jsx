// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — GradientMesh
// Layer 1: 4 large color orbs drifting on bezier paths
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function GradientMesh() {
    const { gradients } = useTheme();

    const orbs = [
        {
            bg: gradients.orb1,
            style: { top: "-20%", left: "-15%" },
            animate: {
                x: [0, 80, -40, 120, 0],
                y: [0, 60, 100, -60, 0],
                scale: [1, 1.08, 0.95, 1.05, 1],
            },
            duration: 28,
        },
        {
            bg: gradients.orb2,
            style: { top: "20%", right: "-20%" },
            animate: {
                x: [0, -100, 60, -80, 0],
                y: [0, 80, -80, 120, 0],
                scale: [1, 1.06, 0.97, 1.04, 1],
            },
            duration: 34,
        },
        {
            bg: gradients.orb3,
            style: { bottom: "-15%", left: "25%" },
            animate: {
                x: [0, 60, -80, 40, 0],
                y: [0, -90, 40, -60, 0],
                scale: [1, 1.1, 0.93, 1.06, 1],
            },
            duration: 22,
        },
        {
            bg: gradients.orb4,
            style: { bottom: "10%", right: "5%" },
            animate: {
                x: [0, -60, 80, -40, 0],
                y: [0, -70, 60, -80, 0],
                scale: [1, 1.07, 0.96, 1.04, 1],
            },
            duration: 30,
        },
    ];

    return (
        <div
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                overflow: "hidden",
                pointerEvents: "none",
            }}
        >
            {orbs.map((orb, i) => (
                <motion.div
                    key={i}
                    animate={orb.animate}
                    transition={{
                        duration: orb.duration,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                    style={{
                        position: "absolute",
                        width: 800,
                        height: 800,
                        borderRadius: "50%",
                        background: orb.bg,
                        filter: "blur(180px)",
                        opacity: 0.045,
                        willChange: "transform",
                        ...orb.style,
                    }}
                />
            ))}
        </div>
    );
}