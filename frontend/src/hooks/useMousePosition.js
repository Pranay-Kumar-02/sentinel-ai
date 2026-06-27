// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useMousePosition hook
// Tracks global cursor position, velocity, idle state, and element-relative
// coordinates. Powers the custom cursor and particle attraction system.
//
// Usage:
//   const { x, y, vx, vy, isIdle, isMoving } = useMousePosition()
//   const { x, y } = useMousePosition({ elementRef: myRef }) // relative to element
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types / Defaults ──────────────────────────────────────────────────────────

const DEFAULT_STATE = {
    // Absolute viewport position
    x: -999,
    y: -999,

    // Previous position
    prevX: -999,
    prevY: -999,

    // Velocity (px per frame)
    vx: 0,
    vy: 0,

    // Speed magnitude
    speed: 0,

    // Normalized position (0–1 across viewport)
    nx: 0,
    ny: 0,

    // Position relative to a tracked element
    relX: 0,
    relY: 0,

    // Tilt angles for 3D card effect (-1 to 1)
    tiltX: 0,
    tiltY: 0,

    // State flags
    isIdle: true,
    isMoving: false,
    isInWindow: false,
};

// ── Main Hook ─────────────────────────────────────────────────────────────────

/**
 * @param {object}  [options]
 * @param {React.RefObject} [options.elementRef]  - track position relative to this element
 * @param {number}  [options.idleTimeout=3000]    - ms before cursor considered idle
 * @param {boolean} [options.trackVelocity=true]  - compute vx/vy/speed
 * @param {boolean} [options.smooth=false]        - lerp position for smooth tracking
 * @param {number}  [options.smoothFactor=0.15]   - lerp alpha (0 = no move, 1 = instant)
 * @param {boolean} [options.disabled=false]      - kill all tracking
 */
export function useMousePosition(options = {}) {
    const {
        elementRef = null,
        idleTimeout = 3000,
        trackVelocity = true,
        smooth = false,
        smoothFactor = 0.15,
        disabled = false,
    } = options;

    const [state, setState] = useState(DEFAULT_STATE);

    // Refs for values that don't need to trigger re-renders
    const rafRef = useRef(null);
    const idleTimerRef = useRef(null);
    const rawPos = useRef({ x: -999, y: -999 });
    const smoothPos = useRef({ x: -999, y: -999 });
    const lastPos = useRef({ x: -999, y: -999 });
    const lastTime = useRef(performance.now());

    // ── Clear idle timer ────────────────────────────────────────
    const clearIdle = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    }, []);

    // ── Start idle timer ────────────────────────────────────────
    const startIdle = useCallback(() => {
        clearIdle();
        idleTimerRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, isIdle: true, isMoving: false, vx: 0, vy: 0, speed: 0 }));
        }, idleTimeout);
    }, [clearIdle, idleTimeout]);

    // ── Smooth update loop (RAF) ────────────────────────────────
    const runSmoothLoop = useCallback(() => {
        const raw = rawPos.current;
        const cur = smoothPos.current;

        const nx = cur.x + (raw.x - cur.x) * smoothFactor;
        const ny = cur.y + (raw.y - cur.y) * smoothFactor;

        smoothPos.current = { x: nx, y: ny };

        const now = performance.now();
        const dt = Math.max(now - lastTime.current, 1);
        lastTime.current = now;

        const vx = trackVelocity ? (nx - lastPos.current.x) / dt * 16 : 0;
        const vy = trackVelocity ? (ny - lastPos.current.y) / dt * 16 : 0;
        const speed = Math.hypot(vx, vy);

        lastPos.current = { x: nx, y: ny };

        const W = window.innerWidth || 1;
        const H = window.innerHeight || 1;

        // Element-relative coords
        let relX = 0, relY = 0, tiltX = 0, tiltY = 0;
        if (elementRef?.current) {
            const rect = elementRef.current.getBoundingClientRect();
            relX = nx - rect.left;
            relY = ny - rect.top;
            tiltX = ((relY / rect.height) - 0.5) * 2;   // -1 to 1
            tiltY = ((relX / rect.width) - 0.5) * -2;  // -1 to 1
        }

        setState((prev) => ({
            ...prev,
            x: nx,
            y: ny,
            prevX: lastPos.current.x,
            prevY: lastPos.current.y,
            vx,
            vy,
            speed,
            nx: nx / W,
            ny: ny / H,
            relX,
            relY,
            tiltX,
            tiltY,
        }));

        rafRef.current = requestAnimationFrame(runSmoothLoop);
    }, [smoothFactor, trackVelocity, elementRef]);

    // ── Mouse move handler ──────────────────────────────────────
    const handleMouseMove = useCallback(
        (e) => {
            rawPos.current = { x: e.clientX, y: e.clientY };

            if (!smooth) {
                const now = performance.now();
                const dt = Math.max(now - lastTime.current, 1);
                lastTime.current = now;

                const W = window.innerWidth || 1;
                const H = window.innerHeight || 1;

                const vx = trackVelocity ? (e.clientX - lastPos.current.x) / dt * 16 : 0;
                const vy = trackVelocity ? (e.clientY - lastPos.current.y) / dt * 16 : 0;
                const speed = Math.hypot(vx, vy);

                let relX = 0, relY = 0, tiltX = 0, tiltY = 0;
                if (elementRef?.current) {
                    const rect = elementRef.current.getBoundingClientRect();
                    relX = e.clientX - rect.left;
                    relY = e.clientY - rect.top;
                    tiltX = ((relY / rect.height) - 0.5) * 2;
                    tiltY = ((relX / rect.width) - 0.5) * -2;
                }

                setState((prev) => ({
                    ...prev,
                    x: e.clientX,
                    y: e.clientY,
                    prevX: lastPos.current.x,
                    prevY: lastPos.current.y,
                    vx,
                    vy,
                    speed,
                    nx: e.clientX / W,
                    ny: e.clientY / H,
                    relX,
                    relY,
                    tiltX,
                    tiltY,
                    isIdle: false,
                    isMoving: true,
                    isInWindow: true,
                }));

                lastPos.current = { x: e.clientX, y: e.clientY };
            } else {
                setState((prev) => ({
                    ...prev,
                    isIdle: false,
                    isMoving: true,
                    isInWindow: true,
                }));
            }

            startIdle();
        },
        [smooth, trackVelocity, elementRef, startIdle]
    );

    const handleMouseLeave = useCallback(() => {
        clearIdle();
        setState((prev) => ({ ...prev, isInWindow: false, isMoving: false }));
    }, [clearIdle]);

    const handleMouseEnter = useCallback(() => {
        setState((prev) => ({ ...prev, isInWindow: true }));
    }, []);

    // ── Attach / detach listeners ───────────────────────────────
    useEffect(() => {
        if (disabled) return;

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
        window.addEventListener("mouseenter", handleMouseEnter, { passive: true });

        if (smooth) {
            rafRef.current = requestAnimationFrame(runSmoothLoop);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("mouseenter", handleMouseEnter);
            clearIdle();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [disabled, handleMouseMove, handleMouseLeave, handleMouseEnter, smooth, runSmoothLoop, clearIdle]);

    return state;
}

// ── Cursor Context State Hook ─────────────────────────────────────────────────
// Tracks what the cursor is currently hovering over for context-aware states

const CURSOR_STATES = {
    DEFAULT: "default",
    INTERACTIVE: "interactive",
    THREAT: "threat",
    AI: "ai",
    SAFE: "safe",
    DRAG: "drag",
    TEXT: "text",
    LINK: "link",
    DANGER: "danger",
    LOADING: "loading",
};

export { CURSOR_STATES };

/**
 * Tracks which UI element type the cursor is over.
 * Returns the current cursor state and a setter.
 * Used by CursorContext to drive the smart cursor appearance.
 */
export function useCursorState() {
    const [cursorState, setCursorState] = useState(CURSOR_STATES.DEFAULT);
    const [cursorLabel, setCursorLabel] = useState("");

    const setCursor = useCallback((state, label = "") => {
        setCursorState(state);
        setCursorLabel(label);
    }, []);

    const resetCursor = useCallback(() => {
        setCursorState(CURSOR_STATES.DEFAULT);
        setCursorLabel("");
    }, []);

    return {
        cursorState,
        cursorLabel,
        setCursor,
        resetCursor,
        CURSOR_STATES,
    };
}

// ── useElementMouse — position relative to a specific element ─────────────────

/**
 * Track mouse position relative to a specific DOM element.
 * Useful for card tilt, progress bar seek, canvas interactions.
 *
 * @param {React.RefObject} elementRef
 * @returns {{ x, y, nx, ny, tiltX, tiltY, isOver, isInside }}
 *   x/y = px from element top-left
 *   nx/ny = normalized 0-1
 *   tiltX/tiltY = -1 to 1 for 3D tilt
 */
export function useElementMouse(elementRef) {
    const [state, setState] = useState({
        x: 0,
        y: 0,
        nx: 0.5,
        ny: 0.5,
        tiltX: 0,
        tiltY: 0,
        isOver: false,
        isInside: false,
    });

    useEffect(() => {
        const el = elementRef?.current;
        if (!el) return;

        function onMove(e) {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const nx = Math.max(0, Math.min(1, x / rect.width));
            const ny = Math.max(0, Math.min(1, y / rect.height));
            const tiltX = (ny - 0.5) * 2;
            const tiltY = (nx - 0.5) * -2;

            setState((prev) => ({ ...prev, x, y, nx, ny, tiltX, tiltY, isInside: true }));
        }

        function onEnter() {
            setState((prev) => ({ ...prev, isOver: true, isInside: true }));
        }

        function onLeave() {
            setState({
                x: 0, y: 0, nx: 0.5, ny: 0.5,
                tiltX: 0, tiltY: 0,
                isOver: false, isInside: false,
            });
        }

        el.addEventListener("mousemove", onMove, { passive: true });
        el.addEventListener("mouseenter", onEnter, { passive: true });
        el.addEventListener("mouseleave", onLeave, { passive: true });

        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
        };
    }, [elementRef]);

    return state;
}

// ── useParallax — mouse-driven parallax offset ────────────────────────────────

/**
 * Returns x/y offsets for parallax effects driven by mouse position.
 * @param {number} strength - multiplier for effect intensity (default 0.02)
 * @returns {{ x: number, y: number }}
 */
export function useParallax(strength = 0.02) {
    const { nx, ny } = useMousePosition();

    return {
        x: (nx - 0.5) * strength * 100,
        y: (ny - 0.5) * strength * 100,
    };
}

// ── useMouseDistance — distance from a fixed point ───────────────────────────

/**
 * Returns the distance from the mouse to a fixed point.
 * Useful for particle attraction, proximity effects.
 *
 * @param {number} px - point x (default: viewport center)
 * @param {number} py - point y (default: viewport center)
 */
export function useMouseDistance(px = null, py = null) {
    const { x, y } = useMousePosition();

    const targetX = px ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 0);
    const targetY = py ?? (typeof window !== "undefined" ? window.innerHeight / 2 : 0);

    const dx = x - targetX;
    const dy = y - targetY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    return { distance, angle, dx, dy };
}

export default useMousePosition;