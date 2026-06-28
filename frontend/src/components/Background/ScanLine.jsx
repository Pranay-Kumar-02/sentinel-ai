// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ScanLine
// Layer 9: animated film grain texture + scanline overlay
// Gives premium cinematic texture — very subtle
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function ScanLine() {
    const { effects } = useTheme();
    const opacity = effects.scanlineOpacity ?? 0.015;

    if (opacity <= 0) return null;

    return (
        <>
            {/* Film grain — animated SVG noise filter */}
            <motion.div
                aria-hidden="true"
                animate={{
                    x: [0, "-2%", "3%", "-1%", "4%", "-3%", "2%", "-4%", "1%", "3%", "-2%"],
                    y: [0, "-3%", "1%", "4%", "-2%", "2%", "-4%", "1%", "3%", "-1%", "4%"],
                }}
                transition={{
                    duration: 0.08,
                    ease: "steps(1)",
                    repeat: Infinity,
                }}
                style={{
                    position: "absolute",
                    inset: "-50%",
                    width: "200%",
                    height: "200%",
                    zIndex: 9,
                    pointerEvents: "none",
                    opacity,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    willChange: "transform",
                }}
            />

            {/* Scanlines */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 9,
                    pointerEvents: "none",
                    opacity,
                    backgroundImage: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(0,0,0,0.03) 2px,
                        rgba(0,0,0,0.03) 4px
                    )`,
                }}
            />
        </>
    );
}