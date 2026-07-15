// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — SmartCursor (v3 — clean rewrite)
//
// Why the rewrite: the previous version used two Framer Motion springs
// sharing one raw motion value, wrapped in nested anchor/flex divs, with
// `animate={{}}` objects rebuilt every render. That's a lot of moving parts,
// and something in that chain was occasionally desyncing (random position
// jumps not reproducible on demand).
//
// This version removes Framer Motion from the position pipeline entirely:
//   - ONE rAF loop owns position. It lerps toward the real mouse coordinate
//     and writes `transform` directly to two DOM refs. No React re-render
//     is involved in moving the cursor — so React scheduling, Framer's
//     internal spring state, and animate-prop diffing can't be the cause
//     of a position glitch anymore, because none of them touch position.
//   - Ring rotation + threat pulse are CSS @keyframes on a CHILD element
//     that has no position responsibility at all — so a rotating transform
//     can never conflict with a position transform on the same node.
//   - Colors/border/size are plain CSS transitions driven by React state,
//     which only re-renders when cursorState actually changes (rare) —
//     not on every mouse move.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { useTheme } from "../../hooks/useTheme";

// Fixed layout size for the visual ring/dot — NEVER changes via JS. Size
// differences between states are done with CSS `scale`, which doesn't
// affect layout/box size, so there's nothing for a percentage-based
// transform to recompute against. This is what makes position math stable
// regardless of what state the cursor is in.
const RING_BASE = 40;
const DOT_BASE = 8;

// Response speed — higher = tighter/faster tracking. These are now used as
// exponential-decay rates (per second), not fixed per-frame fractions, so
// the cursor tracks identically on a 60Hz and a 144Hz display instead of
// feeling laggier on lower refresh rates.
const SPEED_OUTER = 22; // ring: quick with a touch of smoothing
const SPEED_INNER = 40; // dot: essentially glued to the real pointer

function getStateConfig(state, accent, colors) {
    switch (state) {
        case CURSOR_STATES.INTERACTIVE:
            return { scale: 1, border: `1.5px dashed ${accent}`, radius: "50%", rotate: true, opacity: 1, dotScale: 0.4, dotBg: accent, dotShadow: `0 0 10px ${accent}`, color: accent };
        case CURSOR_STATES.THREAT:
        case CURSOR_STATES.DANGER:
            return { scale: 0.95, border: `1.5px solid ${colors.red}`, radius: "4px", rotate: false, opacity: 1, dotScale: 0.9, dotBg: colors.red, dotShadow: `0 0 14px ${colors.redGlow}`, color: colors.red, pulse: true };
        case CURSOR_STATES.AI:
            return { scale: 1, border: `1.5px solid ${colors.purple}`, radius: "50%", rotate: true, opacity: 1, dotScale: 0.75, dotBg: colors.purple, dotShadow: `0 0 12px ${colors.purpleGlow}`, color: colors.purple };
        case CURSOR_STATES.SAFE:
            return { scale: 0.9, border: `1.5px solid ${colors.green}`, radius: "50%", rotate: false, opacity: 1, dotScale: 0.6, dotBg: colors.green, dotShadow: `0 0 12px ${colors.greenGlow}`, color: colors.green };
        case CURSOR_STATES.LOADING:
            return { scale: 0.9, border: `1.5px dashed ${colors.amber}`, radius: "50%", rotate: true, opacity: 0.9, dotScale: 0.5, dotBg: colors.amber, dotShadow: `0 0 8px ${colors.amberGlow}`, color: colors.amber };
        case CURSOR_STATES.TEXT:
            return { scale: 0.05, border: "none", radius: "50%", rotate: false, opacity: 0, dotScale: 2.75, dotBg: "transparent", dotShadow: "none", color: accent, textCursor: true };
        default:
            return { scale: 0.65, border: `1px solid ${accent}`, radius: "50%", rotate: false, opacity: 0.65, dotScale: 0.6, dotBg: accent, dotShadow: `0 0 8px ${accent}`, color: accent };
    }
}

export default function SmartCursor() {
    const { accent, colors } = useTheme();
    const { cursorState, cursorLabel, setCursor, resetCursor } = useCursor();

    const [visible, setVisible] = useState(false);

    const ringRef = useRef(null);
    const dotRef = useRef(null);
    const labelRef = useRef(null);

    // Raw target — updated directly by the mousemove handler, no React
    // state involved, so a mouse move never triggers a re-render.
    const target = useRef({ x: -999, y: -999 });
    // Current lerped positions, owned entirely by the rAF loop.
    const ringPos = useRef({ x: -999, y: -999 });
    const dotPos = useRef({ x: -999, y: -999 });

    // ── Inject cursor:none once, globally ───────────────────────────────────
    useEffect(() => {
        if (document.getElementById("sentinel-cursor-hide")) return;
        const style = document.createElement("style");
        style.id = "sentinel-cursor-hide";
        style.textContent = `* { cursor: none !important; }`;
        document.head.appendChild(style);
        return () => style.remove();
    }, []);

    // ── Mouse tracking — writes to a ref only, never React state ───────────
    useEffect(() => {
        if (window.matchMedia("(hover: none)").matches) return;

        function onMove(e) {
            target.current.x = e.clientX;
            target.current.y = e.clientY;
            if (!visible) setVisible(true);
        }
        function onLeave() { setVisible(false); }
        function onEnter() { setVisible(true); }

        document.addEventListener("mousemove", onMove, { passive: true });
        document.addEventListener("mouseleave", onLeave, { passive: true });
        document.addEventListener("mouseenter", onEnter, { passive: true });

        return () => {
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseenter", onEnter);
        };
    }, [visible]);

    // ── The single owner of position: one rAF loop, writes transform
    //    directly to the DOM refs. This never goes through React. ─────────
    useEffect(() => {
        if (window.matchMedia("(hover: none)").matches) return;
        let raf;
        let lastTime = performance.now();

        function tick(now) {
            const dt = Math.min((now - lastTime) / 1000, 0.05); // cap to avoid huge jumps on tab-switch
            lastTime = now;

            const t = target.current;

            // Exponential smoothing (frame-rate independent): the fraction
            // covered this frame depends on actual elapsed time, not on
            // frame count. This is what "smooth AND precise" needs — a
            // fixed per-frame multiplier feels laggy on high refresh-rate
            // displays and jumpy on low ones; this feels the same on both.
            const outerT = 1 - Math.exp(-SPEED_OUTER * dt);
            const innerT = 1 - Math.exp(-SPEED_INNER * dt);

            ringPos.current.x += (t.x - ringPos.current.x) * outerT;
            ringPos.current.y += (t.y - ringPos.current.y) * outerT;
            dotPos.current.x += (t.x - dotPos.current.x) * innerT;
            dotPos.current.y += (t.y - dotPos.current.y) * innerT;

            if (ringRef.current) {
                ringRef.current.style.transform =
                    `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
            }
            if (dotRef.current) {
                dotRef.current.style.transform =
                    `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`;
            }
            if (labelRef.current) {
                labelRef.current.style.transform =
                    `translate3d(${ringPos.current.x + 10}px, ${ringPos.current.y + 14}px, 0)`;
            }

            raf = requestAnimationFrame(tick);
        }

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    // ── Hover detection (no getComputedStyle — that was the lag source) ────
    useEffect(() => {
        function onOver(e) {
            const el = e.target;
            const tag = el.tagName?.toLowerCase();
            const role = el.getAttribute?.("role");
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

    const cfg = getStateConfig(cursorState, accent, colors);

    return (
        <>
            <style>{`
                @keyframes sentinel-cursor-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes sentinel-cursor-pulse {
                    0%, 100% { transform: scale(1); }
                    50%      { transform: scale(1.5); }
                }
            `}</style>

            {/* Position anchor — the ONLY element the rAF loop touches for
                the ring. Zero-size, fixed at (0,0), moved purely by transform. */}
            <div
                ref={ringRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                    zIndex: 2147483647,
                    willChange: "transform",
                }}
            >
                {/* Visual ring — fixed layout size, resized/rotated purely
                    via CSS. Its own live size never affects the anchor's
                    position transform above, because they're separate nodes. */}
                <div
                    style={{
                        position: "absolute",
                        top: -RING_BASE / 2,
                        left: -RING_BASE / 2,
                        width: RING_BASE,
                        height: RING_BASE,
                        border: cfg.border,
                        borderRadius: cfg.radius,
                        opacity: visible ? cfg.opacity : 0,
                        transform: `scale(${cfg.scale})`,
                        transition: "border 0.2s ease, border-radius 0.2s ease, opacity 0.2s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                        animation: cfg.rotate ? "sentinel-cursor-spin 2.5s linear infinite" : "none",
                    }}
                />
            </div>

            {/* Inner dot — same anchor/visual split */}
            <div
                ref={dotRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                    zIndex: 2147483647,
                    willChange: "transform",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: -DOT_BASE / 2,
                        left: -DOT_BASE / 2,
                        width: DOT_BASE,
                        height: DOT_BASE,
                        background: cfg.dotBg,
                        borderRadius: cfg.textCursor ? "2px" : "50%",
                        boxShadow: cfg.dotShadow,
                        opacity: visible ? 1 : 0,
                        transform: `scale(${cfg.dotScale})`,
                        transition: "background 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                        animation: cfg.pulse ? "sentinel-cursor-pulse 0.6s ease-in-out infinite" : "none",
                    }}
                />
            </div>

            {/* Context label — follows the ring anchor */}
            {cursorLabel && visible && (
                <div
                    ref={labelRef}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
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
                </div>
            )}
        </>
    );
}