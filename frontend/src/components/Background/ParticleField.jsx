// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ParticleField
// Layer 4: 200 particles with cursor attraction, connection lines,
// explosion (threat) and implosion (safe) modes
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useParticles } from "../../hooks/useParticles";
import { useMousePosition } from "../../hooks/useMousePosition";
import { useParticlesEnabled } from "../../hooks/useLocalStorage";

export default function ParticleField({ mode = "idle" }) {
    const { particles, isLight } = useTheme();
    const canvasRef = useRef(null);
    const { x, y } = useMousePosition();
    const [enabled] = useParticlesEnabled();

    useParticles(canvasRef, {
        config: particles,
        mousePos: { x, y },
        enabled,
        isLight,
        mode,
    });

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                willChange: "transform",
            }}
        />
    );
}