// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — MatrixRain
// Matrix theme special effect: classic falling character rain
// Only renders when theme.matrixRain === true
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useTheme } from "../../hooks/useTheme";

const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>{}[]|/\\";

export default function MatrixRain() {
    const { hasMatrixRain, effects } = useTheme();
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!hasMatrixRain) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const FONT_SIZE = 14;
        const color = effects.matrixColor ?? "#00ff41";
        const opacity = effects.matrixOpacity ?? 0.06;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        let cols = Math.floor(canvas.width / FONT_SIZE);
        let drops = Array(cols).fill(1);

        function draw() {
            // Semi-transparent black trail
            ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = color;
            ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
            ctx.globalAlpha = opacity * 15; // compensate for opacity set on canvas

            cols = Math.floor(canvas.width / FONT_SIZE);
            if (drops.length !== cols) {
                drops = Array(cols).fill(1);
            }

            for (let i = 0; i < drops.length; i++) {
                const char = CHARS[Math.floor(Math.random() * CHARS.length)];
                ctx.fillText(char, i * FONT_SIZE, drops[i] * FONT_SIZE);

                if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            ctx.globalAlpha = 1;
            rafRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [hasMatrixRain, effects.matrixColor, effects.matrixOpacity]);

    if (!hasMatrixRain) return null;

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                pointerEvents: "none",
                opacity: effects.matrixOpacity ?? 0.06,
            }}
        />
    );
}