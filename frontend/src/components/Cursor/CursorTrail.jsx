// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — CursorTrail
// 5 ghost rings trail behind the cursor with decreasing opacity.
// Smear/streak effect on fast mouse movement.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { isTouchDevice } from "../../utils/helpers";

const TRAIL_LENGTH = 5;
const TRAIL_DELAY = 40; // ms between each ghost

export default function CursorTrail() {
    const { accent, colors } = useTheme();
    const [trail, setTrail] = useState(
        Array(TRAIL_LENGTH).fill({ x: -999, y: -999 })
    );
    const posHistory = useRef([]);
    const rafRef = useRef(null);
    const isTouch = useRef(isTouchDevice());

    useEffect(() => {
        if (isTouch.current) return;

        function onMove(e) {
            posHistory.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });
            // Keep last 200ms of history
            const cutoff = Date.now() - 200;
            posHistory.current = posHistory.current.filter((p) => p.t > cutoff);
        }

        window.addEventListener("mousemove", onMove, { passive: true });

        function updateTrail() {
            const history = posHistory.current;
            if (history.length > 0) {
                const now = Date.now();
                const newTrail = Array(TRAIL_LENGTH).fill(null).map((_, i) => {
                    const targetTime = now - (i + 1) * TRAIL_DELAY;
                    // Find closest historical position to target time
                    let closest = history[history.length - 1];
                    for (const pos of history) {
                        if (Math.abs(pos.t - targetTime) < Math.abs(closest.t - targetTime)) {
                            closest = pos;
                        }
                    }
                    return closest ?? { x: -999, y: -999 };
                });
                setTrail(newTrail);
            }
            rafRef.current = requestAnimationFrame(updateTrail);
        }

        rafRef.current = requestAnimationFrame(updateTrail);

        return () => {
            window.removeEventListener("mousemove", onMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    if (isTouch.current) return null;

    return (
        <>
            {trail.map((pos, i) => {
                const opacity = ((TRAIL_LENGTH - i) / TRAIL_LENGTH) * 0.18;
                const size = 24 - i * 3;

                return (
                    <div
                        key={i}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            transform: `translate(${pos.x - size / 2}px, ${pos.y - size / 2}px)`,
                            width: size,
                            height: size,
                            borderRadius: "50%",
                            border: `1px solid ${accent}`,
                            opacity,
                            pointerEvents: "none",
                            zIndex: 99998,
                            willChange: "transform",
                            transition: "border-color 0.3s ease",
                        }}
                    />
                );
            })}
        </>
    );
}