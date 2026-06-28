// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Card
// Glassmorphism card with 3D tilt on hover, animated glow border,
// shimmer sweep, and inner glow from bottom.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useElementMouse } from "../../hooks/useMousePosition";

export default function Card({
    children,
    tilt = true,        // 3D tilt on hover
    shimmer = true,        // light sweep on hover
    glow = true,        // border glow on hover
    glowColor = null,        // override glow color
    padding = "24px",
    radius = 16,
    glass = true,        // glassmorphism background
    onClick,
    style = {},
    className = "",
    animate = true,        // entrance animation
}) {
    const { colors } = useTheme();
    const cardRef = useRef(null);
    const mouse = useElementMouse(cardRef);
    const [hovered, setHovered] = useState(false);

    const gColor = glowColor ?? colors.accentGlow;

    // 3D tilt — max 10 degrees
    const tiltX = hovered && tilt ? mouse.tiltX * 10 : 0;
    const tiltY = hovered && tilt ? mouse.tiltY * 10 : 0;

    return (
        <motion.div
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={animate ? { opacity: 0, y: 20, scale: 0.97 } : false}
            whileInView={animate ? { opacity: 1, y: 0, scale: 1 } : false}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            animate={{
                rotateX: tiltX,
                rotateY: tiltY,
                scale: hovered ? 1.01 : 1,
                boxShadow: hovered && glow
                    ? `0 0 0 1px ${gColor}, 0 8px 40px ${gColor}, inset 0 0 30px rgba(0,0,0,0.1)`
                    : `0 0 0 1px ${colors.borderCard}, 0 4px 24px rgba(0,0,0,0.2)`,
            }}
            style={{
                perspective: "1000px",
                background: glass ? colors.bgCard : colors.bgSurface,
                backdropFilter: glass ? "var(--backdrop-blur)" : "none",
                WebkitBackdropFilter: glass ? "var(--backdrop-blur)" : "none",
                border: `1px solid ${hovered ? colors.borderHover : colors.borderCard}`,
                borderRadius: radius,
                padding,
                position: "relative",
                overflow: "hidden",
                cursor: onClick ? "pointer" : "default",
                willChange: "transform",
                transition: "border-color 0.2s ease",
                transformStyle: "preserve-3d",
                ...style,
            }}
        >
            {/* Shimmer sweep */}
            {shimmer && hovered && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)",
                        pointerEvents: "none",
                        zIndex: 1,
                    }}
                />
            )}

            {/* Inner glow from bottom */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background: `linear-gradient(0deg, ${gColor}08 0%, transparent 100%)`,
                    opacity: hovered ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none",
                    borderRadius: `0 0 ${radius}px ${radius}px`,
                }}
            />

            {/* Mouse-follow gradient */}
            {hovered && tilt && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(circle at ${mouse.nx * 100}% ${mouse.ny * 100}%, ${gColor}10 0%, transparent 60%)`,
                        pointerEvents: "none",
                        transition: "opacity 0.2s ease",
                        borderRadius: radius,
                    }}
                />
            )}

            {/* Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
                {children}
            </div>
        </motion.div>
    );
}