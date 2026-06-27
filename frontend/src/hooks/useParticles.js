// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useParticles hook
// Canvas-based particle field with cursor attraction, connection lines,
// threat explosion/implosion reactions, and full theme sync.
//
// Usage:
//   const canvasRef = useRef(null)
//   useParticles(canvasRef, { config: particles, mousePos })
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from "react";

// ── Particle class ────────────────────────────────────────────────────────────

class Particle {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.reset();
    }

    reset() {
        const c = this.config;
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.vx = (Math.random() - 0.5) * c.speed * 2;
        this.vy = (Math.random() - 0.5) * c.speed * 2;
        this.size = Math.random() * c.maxSize + 0.3;
        this.color = c.colors[Math.floor(Math.random() * c.colors.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
        this.life = Math.random();
        // Behavior: 0=float, 1=orbit, 2=connect
        this.behavior = Math.floor(Math.random() * 3);
        this.angle = Math.random() * Math.PI * 2;
        this.orbitR = Math.random() * 80 + 40;
        this.orbitCX = Math.random() * this.canvas.width;
        this.orbitCY = Math.random() * this.canvas.height;
        this.orbitSpd = (Math.random() - 0.5) * 0.008;
    }

    update(mouseX, mouseY, mode) {
        const c = this.config;

        if (mode === "explosion") {
            // Flee from center
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            const dx = this.x - cx;
            const dy = this.y - cy;
            const d = Math.hypot(dx, dy) || 1;
            this.vx += (dx / d) * 2;
            this.vy += (dy / d) * 2;
        } else if (mode === "implosion") {
            // Spiral to center
            const cx = this.canvas.width / 2;
            const cy = this.canvas.height / 2;
            const dx = cx - this.x;
            const dy = cy - this.y;
            const d = Math.hypot(dx, dy) || 1;
            this.vx += (dx / d) * 0.5;
            this.vy += (dy / d) * 0.5;
        } else {
            // Cursor attraction
            if (mouseX > 0 && mouseY > 0) {
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const d = Math.hypot(dx, dy);
                if (d < c.attract && d > 0) {
                    const force = (c.attract - d) / c.attract;
                    this.vx += (dx / d) * force * 0.3;
                    this.vy += (dy / d) * force * 0.3;
                }
            }

            // Behavior-specific motion
            if (this.behavior === 1) {
                // Orbit
                this.angle += this.orbitSpd;
                const tx = this.orbitCX + Math.cos(this.angle) * this.orbitR;
                const ty = this.orbitCY + Math.sin(this.angle) * this.orbitR;
                this.vx += (tx - this.x) * 0.004;
                this.vy += (ty - this.y) * 0.004;
            }
        }

        // Friction
        this.vx *= 0.96;
        this.vy *= 0.96;

        // Speed cap
        const spd = Math.hypot(this.vx, this.vy);
        if (spd > 3) {
            this.vx = (this.vx / spd) * 3;
            this.vy = (this.vy / spd) * 3;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges
        if (this.x < -10) this.x = this.canvas.width + 10;
        if (this.x > this.canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.canvas.height + 10;
        if (this.y > this.canvas.height + 10) this.y = -10;

        // Gentle alpha pulse
        this.life += 0.005;
        this.alpha = 0.2 + Math.abs(Math.sin(this.life)) * 0.4;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// ── Draw connections between nearby particles ─────────────────────────────────

function drawConnections(ctx, particles, connectDist, isLight) {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.hypot(dx, dy);

            if (d < connectDist) {
                const alpha = (1 - d / connectDist) * (isLight ? 0.08 : 0.15);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = particles[i].color;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }
}

// ── Adapt particle count for device ──────────────────────────────────────────

function getAdaptiveCount(baseCount) {
    if (typeof window === "undefined") return baseCount;
    const w = window.innerWidth;
    if (w < 480) return Math.floor(baseCount * 0.15);
    if (w < 768) return Math.floor(baseCount * 0.35);
    if (w < 1024) return Math.floor(baseCount * 0.65);
    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return Math.floor(baseCount * 0.1);
    }
    return baseCount;
}

// ── Main Hook ─────────────────────────────────────────────────────────────────

/**
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {object} options
 * @param {object} options.config        - particle config from theme (colors, count, etc.)
 * @param {{ x: number, y: number }} options.mousePos - live mouse position
 * @param {boolean} [options.enabled=true]
 * @param {boolean} [options.isLight=false]
 * @param {'idle'|'explosion'|'implosion'} [options.mode='idle']
 */
export function useParticles(canvasRef, options = {}) {
    const {
        config,
        mousePos = { x: -999, y: -999 },
        enabled = true,
        isLight = false,
        mode = "idle",
    } = options;

    const particlesRef = useRef([]);
    const rafRef = useRef(null);
    const mousePosRef = useRef(mousePos);
    const modeRef = useRef(mode);
    const configRef = useRef(config);
    const enabledRef = useRef(enabled);

    // Keep refs in sync without restarting the loop
    useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { enabledRef.current = enabled; }, [enabled]);

    // ── Init / resize particles ─────────────────────────────────
    const initParticles = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !configRef.current) return;

        const count = getAdaptiveCount(configRef.current.count ?? 180);
        particlesRef.current = Array.from(
            { length: count },
            () => new Particle(canvas, configRef.current)
        );
    }, [canvasRef]);

    // ── Animation loop ──────────────────────────────────────────
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!enabledRef.current) {
            rafRef.current = requestAnimationFrame(animate);
            return;
        }

        const mp = mousePosRef.current;
        const cfg = configRef.current;

        // Update + draw each particle
        for (const p of particlesRef.current) {
            p.update(mp.x, mp.y, modeRef.current);
            p.draw(ctx);
        }

        // Draw connection lines
        if (cfg?.connect > 0) {
            drawConnections(ctx, particlesRef.current, cfg.connect, isLight);
        }

        rafRef.current = requestAnimationFrame(animate);
    }, [canvasRef, isLight]);

    // ── Setup canvas size + ResizeObserver ──────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        function setSize() {
            const parent = canvas.parentElement;
            if (!parent) return;
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
            initParticles();
        }

        setSize();

        const ro = new ResizeObserver(setSize);
        ro.observe(canvas.parentElement ?? document.body);

        return () => ro.disconnect();
    }, [canvasRef, initParticles]);

    // ── Re-init when config (theme) changes ─────────────────────
    useEffect(() => {
        initParticles();
    }, [config, initParticles]);

    // ── Start/stop animation loop ───────────────────────────────
    useEffect(() => {
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [animate]);

    // ── Intersection Observer — pause when off-screen ───────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                enabledRef.current = enabled && entry.isIntersecting;
            },
            { threshold: 0 }
        );
        io.observe(canvas);

        return () => io.disconnect();
    }, [canvasRef, enabled]);

    return { reinit: initParticles };
}

export default useParticles;