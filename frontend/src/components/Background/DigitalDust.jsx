// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — DigitalDust
// Layer 8: 300 tiny 0.5px dots flowing in noise patterns — depth parallax
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";

// Simple Perlin-like noise using sine waves
function noise(x, y, t) {
    return (
        Math.sin(x * 0.01 + t * 0.3) *
        Math.cos(y * 0.012 + t * 0.2) +
        Math.sin(x * 0.007 - y * 0.008 + t * 0.15)
    ) * 0.5;
}

export default function DigitalDust() {
    const { colors, isLight } = useTheme();
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        // Reduced count for performance — 3 layers at 100 each
        const COUNT = window.innerWidth < 768 ? 60 : 220;
        const LAYERS = 3;

        const dots = Array.from({ length: COUNT }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 0.3 + Math.random() * 0.4,
            layer: i % LAYERS,         // 0 = slow/far, 2 = fast/near
            offset: Math.random() * 1000,
        }));

        const speeds = [0.15, 0.3, 0.6];
        const alphas = [0.15, 0.25, 0.4];
        let t = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            t += 0.005;

            for (const dot of dots) {
                const spd = speeds[dot.layer];
                const alpha = alphas[dot.layer];

                // Flow field direction from noise
                const angle = noise(dot.x, dot.y, t + dot.offset) * Math.PI * 2;
                dot.x += Math.cos(angle) * spd;
                dot.y += Math.sin(angle) * spd;

                // Wrap
                if (dot.x < 0) dot.x = canvas.width;
                if (dot.x > canvas.width) dot.x = 0;
                if (dot.y < 0) dot.y = canvas.height;
                if (dot.y > canvas.height) dot.y = 0;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fillStyle = colors.accent;
                ctx.globalAlpha = alpha * (isLight ? 0.4 : 1);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            rafRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [colors.accent, isLight]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 8,
                pointerEvents: "none",
                willChange: "transform",
            }}
        />
    );
}