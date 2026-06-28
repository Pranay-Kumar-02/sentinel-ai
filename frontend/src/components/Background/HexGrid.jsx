// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — HexGrid
// Layer 3: breathing hexagonal grid with random pulse paths
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function HexGrid() {
    const { grid, isLight } = useTheme();
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const pulseRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const SIZE = grid.size ?? 60;
        const H_HEX = SIZE;
        const W_HEX = SIZE * Math.sqrt(3);

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);

        function hexPoints(cx, cy, r) {
            const pts = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
            }
            return pts;
        }

        function drawHex(cx, cy, r, alpha) {
            const pts = hexPoints(cx, cy, r * 0.95);
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.strokeStyle = grid.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Spawn a pulse along a random hex path every 3-4s
        function spawnPulse() {
            const col = Math.floor(Math.random() * Math.ceil(canvas.width / W_HEX));
            const row = Math.floor(Math.random() * Math.ceil(canvas.height / H_HEX));
            pulseRef.current.push({ col, row, alpha: 1, life: 0 });
        }

        const pulseTimer = setInterval(spawnPulse, 3200);

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const cols = Math.ceil(canvas.width / W_HEX) + 2;
            const rows = Math.ceil(canvas.height / H_HEX) + 2;

            for (let row = -1; row < rows; row++) {
                for (let col = -1; col < cols; col++) {
                    const offset = col % 2 === 0 ? 0 : H_HEX / 2;
                    const cx = col * W_HEX * 0.75;
                    const cy = row * H_HEX + offset;
                    drawHex(cx, cy, SIZE / 2, 1);
                }
            }

            // Draw pulse cells
            pulseRef.current = pulseRef.current.filter((p) => p.alpha > 0);
            for (const p of pulseRef.current) {
                const offset = p.col % 2 === 0 ? 0 : H_HEX / 2;
                const cx = p.col * W_HEX * 0.75;
                const cy = p.row * H_HEX + offset;

                const pts = hexPoints(cx, cy, (SIZE / 2) * 0.95);
                ctx.beginPath();
                ctx.moveTo(pts[0][0], pts[0][1]);
                for (let i = 1; i < 6; i++) ctx.lineTo(pts[i][0], pts[i][1]);
                ctx.closePath();
                ctx.strokeStyle = grid.pulse;
                ctx.globalAlpha = p.alpha * 0.8;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Inner glow fill
                ctx.fillStyle = grid.pulse;
                ctx.globalAlpha = p.alpha * 0.04;
                ctx.fill();
                ctx.globalAlpha = 1;

                p.life += 0.025;
                p.alpha = Math.max(0, 1 - p.life);
            }

            rafRef.current = requestAnimationFrame(draw);
        }

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            clearInterval(pulseTimer);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [grid]);

    return (
        <motion.canvas
            ref={canvasRef}
            aria-hidden="true"
            animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.002, 1] }}
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
            style={{
                position: "absolute",
                inset: 0,
                zIndex: 3,
                pointerEvents: "none",
                willChange: "transform, opacity",
            }}
        />
    );
}