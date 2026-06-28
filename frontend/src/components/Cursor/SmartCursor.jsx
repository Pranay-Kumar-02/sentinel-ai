// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — SmartCursor
// Context-aware custom cursor with 7 visual states.
// Outer ring has spring lag. Inner dot snaps instantly.
// Auto-hides on touch devices.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useTheme } from "../../hooks/useTheme";
import { isTouchDevice } from "../../utils/helpers";

// ── State configs ─────────────────────────────────────────────────────────────

function getStateStyle(state, accent, colors) {
    switch (state) {
        case CURSOR_STATES.INTERACTIVE:
            return {
                outerSize: 40,
                outerOpacity: 1,
                outerBorder: `1.5px dashed ${accent}`,
                outerRadius: "50%",
                outerRotate: true,
                innerSize: 2,
                innerBg: accent,
                innerShadow: `0 0 8px ${accent}`,
                color: accent,
            };
        case CURSOR_STATES.THREAT:
        case CURSOR_STATES.DANGER:
            return {
                outerSize: 36,
                outerOpacity: 1,
                outerBorder: `1.5px solid ${colors.red}`,
                outerRadius: "4px",
                outerRotate: false,
                innerSize: 6,
                innerBg: colors.red,
                innerShadow: `0 0 12px ${colors.redGlow}`,
                color: colors.red,
                pulse: true,
            };
        case CURSOR_STATES.AI:
            return {
                outerSize: 38,
                outerOpacity: 1,
                outerBorder: `1.5px solid ${colors.purple}`,
                outerRadius: "50%",
                outerRotate: true,
                innerSize: 5,
                innerBg: colors.purple,
                innerShadow: `0 0 12px ${colors.purpleGlow}`,
                color: colors.purple,
            };
        case CURSOR_STATES.SAFE:
            return {
                outerSize: 36,
                outerOpacity: 1,
                outerBorder: `1.5px solid ${colors.green}`,
                outerRadius: "50%",
                outerRotate: false,
                innerSize: 4,
                innerBg: colors.green,
                innerShadow: `0 0 12px ${colors.greenGlow}`,
                color: colors.green,
            };
        case CURSOR_STATES.LOADING:
            return {
                outerSize: 36,
                outerOpacity: 0.8,
                outerBorder: `1.5px dashed ${colors.amber}`,
                outerRadius: "50%",
                outerRotate: true,
                innerSize: 3,
                innerBg: colors.amber,
                innerShadow: `0 0 8px ${colors.amberGlow}`,
                color: colors.amber,
            };
        case CURSOR_STATES.TEXT:
            return {
                outerSize: 2,
                outerOpacity: 0,
                outerBorder: "none",
                outerRadius: "50%",
                outerRotate: false,
                innerSize: 20,
                innerBg: "transparent",
                innerShadow: "none",
                color: accent,
                textCursor: true,
            };
        default:
            return {
                outerSize: 24,
                outerOpacity: 0.6,
                outerBorder: `1px solid ${accent}`,
                outerRadius: "50%",
                outerRotate: false,
                innerSize: 4,
                innerBg: accent,
                innerShadow: `0 0 8px ${accent}`,
                color: accent,
            };
    }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SmartCursor() {
    const { cursorState, cursorLabel } = useCursor();
    const { accent, colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const isTouch = useRef(isTouchDevice());

    // Raw mouse position
    const mouseX = useMotionValue(-999);
    const mouseY = useMotionValue(-999);

    // Outer ring — spring lag
    const outerX = useSpring(mouseX, { stiffness: 180, damping: 20, mass: 0.5 });
    const outerY = useSpring(mouseY, { stiffness: 180, damping: 20, mass: 0.5 });

    // Inner dot — near-instant
    const innerX = useSpring(mouseX, { stiffness: 800, damping: 40, mass: 0.3 });
    const innerY = useSpring(mouseY, { stiffness: 800, damping: 40, mass: 0.3 });

    useEffect(() => {
        if (isTouch.current) return;

        function onMove(e) {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!visible) setVisible(true);
        }
        function onLeave() { setVisible(false); }
        function onEnter() { setVisible(true); }

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseleave", onLeave, { passive: true });
        window.addEventListener("mouseenter", onEnter, { passive: true });

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseleave", onLeave);
            window.removeEventListener("mouseenter", onEnter);
        };
    }, [mouseX, mouseY, visible]);

    if (isTouch.current) return null;

    const s = getStateStyle(cursorState, accent, colors);

    return (
        <>
            {/* Outer ring */}
            <motion.div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    x: outerX,
                    y: outerY,
                    translateX: "-50%",
                    translateY: "-50%",
                    width: s.outerSize,
                    height: s.outerSize,
                    border: s.outerBorder,
                    borderRadius: s.outerRadius,
                    opacity: visible ? s.outerOpacity : 0,
                    pointerEvents: "none",
                    zIndex: 99999,
                    willChange: "transform",
                    mixBlendMode: "normal",
                }}
                animate={{
                    width: s.outerSize,
                    height: s.outerSize,
                    borderRadius: s.outerRadius,
                    rotate: s.outerRotate ? [0, 360] : 0,
                }}
                transition={{
                    width: { type: "spring", stiffness: 400, damping: 28 },
                    height: { type: "spring", stiffness: 400, damping: 28 },
                    borderRadius: { duration: 0.2 },
                    rotate: s.outerRotate
                        ? { duration: 2, ease: "linear", repeat: Infinity }
                        : { duration: 0.2 },
                }}
            />

            {/* Inner dot */}
            <motion.div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    x: innerX,
                    y: innerY,
                    translateX: "-50%",
                    translateY: "-50%",
                    width: s.innerSize,
                    height: s.innerSize,
                    background: s.innerBg,
                    borderRadius: s.textCursor ? "2px" : "50%",
                    boxShadow: s.innerShadow,
                    opacity: visible ? 1 : 0,
                    pointerEvents: "none",
                    zIndex: 99999,
                    willChange: "transform",
                }}
                animate={{
                    width: s.innerSize,
                    height: s.innerSize,
                    scale: s.pulse ? [1, 1.5, 1] : 1,
                    boxShadow: s.innerShadow,
                }}
                transition={{
                    width: { type: "spring", stiffness: 600, damping: 30 },
                    height: { type: "spring", stiffness: 600, damping: 30 },
                    scale: s.pulse
                        ? { duration: 0.6, ease: "easeInOut", repeat: Infinity }
                        : { duration: 0.15 },
                }}
            />

            {/* Context label */}
            {cursorLabel && visible && (
                <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15 }}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        x: outerX,
                        y: outerY,
                        translateX: "8px",
                        translateY: "16px",
                        pointerEvents: "none",
                        zIndex: 99999,
                        fontSize: "0.6rem",
                        fontFamily: "var(--font-accent)",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: s.color,
                        background: "var(--bg-glass)",
                        backdropFilter: "blur(8px)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        border: `1px solid ${s.color}40`,
                        whiteSpace: "nowrap",
                    }}
                >
                    {cursorLabel}
                </motion.div>
            )}
        </>
    );
}