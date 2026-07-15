// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — SmartCursor
// FIX APPLIED: outer ring / inner dot no longer use `translateX: "-50%"` on the
// same element whose width/height are animating. That caused the "-50%" offset
// to recalculate every frame against the live (spring-animating) size, which is
// what caused the jump/lag/drift you saw. Now each cursor piece is a fixed-size
// zero-footprint ANCHOR (only ever moved by x/y spring), with the visual box
// centered inside it via flexbox — so resizing never moves the anchor point.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useTheme } from "../../hooks/useTheme";

// ── State visual configs ──────────────────────────────────────────────────────
function getStateConfig(state, accent, colors) {
    switch (state) {
        case CURSOR_STATES.INTERACTIVE:
            return {
                outerSize: 40,
                outerBorder: `1.5px dashed ${accent}`,
                outerRadius: "50%",
                outerRotate: true,
                outerOpacity: 1,
                innerSize: 3,
                innerBg: accent,
                innerShadow: `0 0 10px ${accent}`,
                color: accent,
            };
        case CURSOR_STATES.THREAT:
        case CURSOR_STATES.DANGER:
            return {
                outerSize: 38,
                outerBorder: `1.5px solid ${colors.red}`,
                outerRadius: "4px",
                outerRotate: false,
                outerOpacity: 1,
                innerSize: 7,
                innerBg: colors.red,
                innerShadow: `0 0 14px ${colors.redGlow}`,
                color: colors.red,
                pulse: true,
            };
        case CURSOR_STATES.AI:
            return {
                outerSize: 40,
                outerBorder: `1.5px solid ${colors.purple}`,
                outerRadius: "50%",
                outerRotate: true,
                outerOpacity: 1,
                innerSize: 6,
                innerBg: colors.purple,
                innerShadow: `0 0 12px ${colors.purpleGlow}`,
                color: colors.purple,
            };
        case CURSOR_STATES.SAFE:
            return {
                outerSize: 36,
                outerBorder: `1.5px solid ${colors.green}`,
                outerRadius: "50%",
                outerRotate: false,
                outerOpacity: 1,
                innerSize: 5,
                innerBg: colors.green,
                innerShadow: `0 0 12px ${colors.greenGlow}`,
                color: colors.green,
            };
        case CURSOR_STATES.LOADING:
            return {
                outerSize: 36,
                outerBorder: `1.5px dashed ${colors.amber}`,
                outerRadius: "50%",
                outerRotate: true,
                outerOpacity: 0.9,
                innerSize: 4,
                innerBg: colors.amber,
                innerShadow: `0 0 8px ${colors.amberGlow}`,
                color: colors.amber,
            };
        case CURSOR_STATES.TEXT:
            return {
                outerSize: 2,
                outerBorder: "none",
                outerRadius: "50%",
                outerRotate: false,
                outerOpacity: 0,
                innerSize: 22,
                innerBg: "transparent",
                innerShadow: "none",
                color: accent,
                textCursor: true,
            };
        default:
            return {
                outerSize: 26,
                outerBorder: `1px solid ${accent}`,
                outerRadius: "50%",
                outerRotate: false,
                outerOpacity: 0.65,
                innerSize: 5,
                innerBg: accent,
                innerShadow: `0 0 8px ${accent}`,
                color: accent,
            };
    }
}

// Anchor slot is sized to fit the largest possible ring (40px) so the flex
// centering never clips it.
const ANCHOR_SIZE = 48;

// ── Singleton guard ─────────────────────────────────────────────────────────
// If <SmartCursor /> ever gets mounted twice (e.g. once in App.jsx and again
// inside a Layout/DashboardShell), each instance runs its own independent
// spring off its own mouse listeners. One tracks correctly, the other lags
// behind or freezes near its mount position — which is exactly the "ring in
// one place, dot somewhere else" bug in the screenshot. This flag makes any
// second instance render nothing instead of fighting the first for the
// pointer.
let SMART_CURSOR_ACTIVE = false;

export default function SmartCursor() {
    const { accent, colors } = useTheme();
    const { cursorState, cursorLabel } = useCursor();

    const [visible, setVisible] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [isPrimary, setIsPrimary] = useState(false);

    useEffect(() => {
        if (SMART_CURSOR_ACTIVE) {
            // eslint-disable-next-line no-console
            console.warn(
                "[SmartCursor] Duplicate mount detected — a second <SmartCursor /> " +
                "is already rendered elsewhere in the tree. Skipping this instance. " +
                "Find and remove the second <SmartCursor /> usage."
            );
            return;
        }
        SMART_CURSOR_ACTIVE = true;
        setIsPrimary(true);
        return () => { SMART_CURSOR_ACTIVE = false; };
    }, []);

    const rawX = useMotionValue(-999);
    const rawY = useMotionValue(-999);

    // Outer ring anchor — spring lag for smoothness
    const outerX = useSpring(rawX, { stiffness: 200, damping: 22, mass: 0.4 });
    const outerY = useSpring(rawY, { stiffness: 200, damping: 22, mass: 0.4 });

    // Inner dot anchor — near instant
    const innerX = useSpring(rawX, { stiffness: 1000, damping: 50, mass: 0.1 });
    const innerY = useSpring(rawY, { stiffness: 1000, damping: 50, mass: 0.1 });

    useEffect(() => {
        if (window.matchMedia("(hover: none)").matches) return;

        let lastMove = { x: -999, y: -999, t: 0 };

        function onMove(e) {
            const now = performance.now();
            const dx = Math.abs(e.clientX - lastMove.x);
            const dy = Math.abs(e.clientY - lastMove.y);
            const dt = now - lastMove.t;

            // DEBUG INSTRUMENTATION — catches the random-jump bug in the act.
            // A real mouse can't move >150px in <50ms at normal DPI/polling
            // rates. If this fires, something OTHER than natural mouse motion
            // is feeding a bad coordinate into this handler (e.g. an iframe,
            // a modal with its own coordinate space, or a stray event from a
            // different element). Remove this block once the cause is found.
            if (dt > 0 && dt < 50 && (dx > 150 || dy > 150) && lastMove.t !== 0) {
                // eslint-disable-next-line no-console
                console.warn(
                    "[SmartCursor] JUMP DETECTED:",
                    `from (${lastMove.x}, ${lastMove.y}) to (${e.clientX}, ${e.clientY})`,
                    `in ${dt.toFixed(1)}ms`,
                    "\ntarget element:", e.target,
                    "\nisTrusted:", e.isTrusted,
                );
                console.trace("[SmartCursor] jump stack trace");
            }

            lastMove = { x: e.clientX, y: e.clientY, t: now };
            rawX.set(e.clientX);
            rawY.set(e.clientY);
            if (!visible) setVisible(true);
        }
        function onLeave() { setVisible(false); }
        function onEnter() { setVisible(true); }
        function onDown() {
            setClicked(true);
            setTimeout(() => setClicked(false), 150);
        }

        // document — not window — so it keeps tracking inside portals/overlays
        document.addEventListener("mousemove", onMove, { passive: true });
        document.addEventListener("mouseleave", onLeave, { passive: true });
        document.addEventListener("mouseenter", onEnter, { passive: true });
        document.addEventListener("mousedown", onDown, { passive: true });

        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseenter", onEnter);
            document.removeEventListener("mousedown", onDown);
        };
    }, [rawX, rawY, visible]);

    const { setCursor, resetCursor } = useCursor();

    // Inject cursor:none once, globally — fully suppresses the native OS
    // cursor everywhere (including overlays/portals) instead of relying on
    // per-element CSS that can get missed and cause a "double cursor" feel.
    useEffect(() => {
        if (document.getElementById("sentinel-cursor-hide")) return;
        const style = document.createElement("style");
        style.id = "sentinel-cursor-hide";
        style.textContent = `* { cursor: none !important; }`;
        document.head.appendChild(style);
        return () => style.remove();
    }, []);

    useEffect(() => {
        function onOver(e) {
            const el = e.target;
            const tag = el.tagName?.toLowerCase();
            const role = el.getAttribute?.("role");
            // NOTE: removed window.getComputedStyle(el) check — it forces a
            // synchronous style recalc on EVERY mouseover across the page,
            // which was the main source of the lag/stutter. Tag + role +
            // explicit onclick covers the real-world cases without the cost.
            const isClickable =
                tag === "button" || tag === "a" || tag === "input" ||
                tag === "textarea" || tag === "select" || tag === "label" ||
                role === "button" || role === "link" ||
                el.onclick != null ||
                el.dataset?.cursor === "pointer";

            if (isClickable && cursorState === CURSOR_STATES.DEFAULT) {
                setCursor(CURSOR_STATES.INTERACTIVE);
            }
        }
        function onOut(e) {
            const tag = e.target.tagName?.toLowerCase();
            const isClickable = tag === "button" || tag === "a" || tag === "input";
            if (isClickable && cursorState === CURSOR_STATES.INTERACTIVE) {
                resetCursor();
            }
        }
        document.addEventListener("mouseover", onOver, { passive: true });
        document.addEventListener("mouseout", onOut, { passive: true });
        return () => {
            document.removeEventListener("mouseover", onOver);
            document.removeEventListener("mouseout", onOut);
        };
    }, [cursorState, setCursor, resetCursor]);

    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
        return null;
    }

    // Duplicate mount — another SmartCursor is already active. Render nothing.
    if (!isPrimary) return null;

    const cfg = getStateConfig(cursorState, accent, colors);

    return (
        <>
            {/* ── Outer ring: fixed-size anchor, ring centered inside via flex ── */}
            <motion.div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    x: outerX,
                    y: outerY,
                    marginLeft: -ANCHOR_SIZE / 2,
                    marginTop: -ANCHOR_SIZE / 2,
                    width: ANCHOR_SIZE,
                    height: ANCHOR_SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 2147483647,
                    willChange: "transform",
                }}
            >
                <motion.div
                    animate={{
                        width: clicked ? cfg.outerSize * 0.85 : cfg.outerSize,
                        height: clicked ? cfg.outerSize * 0.85 : cfg.outerSize,
                        border: cfg.outerBorder,
                        borderRadius: cfg.outerRadius,
                        opacity: visible ? cfg.outerOpacity : 0,
                        rotate: cfg.outerRotate ? [0, 360] : 0,
                    }}
                    transition={{
                        width: { type: "spring", stiffness: 400, damping: 28 },
                        height: { type: "spring", stiffness: 400, damping: 28 },
                        border: { duration: 0.2 },
                        borderRadius: { duration: 0.2 },
                        opacity: { duration: 0.2 },
                        rotate: cfg.outerRotate
                            ? { duration: 2.5, ease: "linear", repeat: Infinity }
                            : { duration: 0.2 },
                    }}
                />
            </motion.div>

            {/* ── Inner dot: same fixed-anchor pattern ── */}
            <motion.div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    x: innerX,
                    y: innerY,
                    marginLeft: -ANCHOR_SIZE / 2,
                    marginTop: -ANCHOR_SIZE / 2,
                    width: ANCHOR_SIZE,
                    height: ANCHOR_SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 2147483647,
                    willChange: "transform",
                }}
            >
                <motion.div
                    animate={{
                        width: clicked ? cfg.innerSize * 1.5 : cfg.innerSize,
                        height: clicked ? cfg.innerSize * 1.5 : cfg.innerSize,
                        background: cfg.innerBg,
                        borderRadius: cfg.textCursor ? "2px" : "50%",
                        boxShadow: cfg.innerShadow,
                        opacity: visible ? 1 : 0,
                        scale: cfg.pulse ? [1, 1.5, 1] : 1,
                    }}
                    transition={{
                        width: { type: "spring", stiffness: 800, damping: 35 },
                        height: { type: "spring", stiffness: 800, damping: 35 },
                        background: { duration: 0.15 },
                        borderRadius: { duration: 0.15 },
                        opacity: { duration: 0.15 },
                        scale: cfg.pulse
                            ? { duration: 0.6, ease: "easeInOut", repeat: Infinity }
                            : { duration: 0.15 },
                    }}
                />
            </motion.div>

            {/* ── Context label ── */}
            <AnimatePresence>
                {cursorLabel && visible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 2 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            x: outerX,
                            y: outerY,
                            translateX: "10px",
                            translateY: "14px",
                            pointerEvents: "none",
                            zIndex: 2147483647,
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.58rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: cfg.color,
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(8px)",
                            padding: "2px 7px",
                            borderRadius: 4,
                            border: `1px solid ${cfg.color}40`,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {cursorLabel}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}