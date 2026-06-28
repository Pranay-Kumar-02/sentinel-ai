// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Counter
// Animated number counter. Counts up from 0 (or from value)
// on mount or when value changes. Spring physics feel.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export default function Counter({
    value = 0,
    from = 0,
    duration = 2,
    decimals = 0,
    prefix = "",
    suffix = "",
    color = null,
    fontSize = "2rem",
    fontFamily = "var(--font-accent)",
    fontWeight = 700,
    triggerOnView = true,   // only start when element is visible
    style = {},
}) {
    const { colors } = useTheme();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [display, setDisplay] = useState(triggerOnView ? from : value);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const hasRun = useRef(false);

    const shouldStart = triggerOnView ? isInView : true;

    useEffect(() => {
        if (!shouldStart || hasRun.current) return;
        hasRun.current = true;

        const startVal = from;
        const endVal = value;
        const totalMs = duration * 1000;

        function easeOut(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        startRef.current = performance.now();

        function tick(now) {
            const elapsed = now - startRef.current;
            const progress = Math.min(elapsed / totalMs, 1);
            const eased = easeOut(progress);
            const current = startVal + (endVal - startVal) * eased;

            setDisplay(parseFloat(current.toFixed(decimals)));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                setDisplay(endVal);
            }
        }

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [shouldStart, value, from, duration, decimals]);

    const displayText = decimals > 0
        ? display.toFixed(decimals)
        : Math.round(display).toLocaleString();

    return (
        <motion.span
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={shouldStart ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
                fontFamily,
                fontSize,
                fontWeight,
                color: color ?? colors.accent,
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1,
                display: "inline-block",
                ...style,
            }}
        >
            {prefix}{displayText}{suffix}
        </motion.span>
    );
}