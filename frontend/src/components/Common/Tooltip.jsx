// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Tooltip, Modal, SectionHead, RadarPulse, Bar
// Remaining Common utility components
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useTheme } from "../../hooks/useTheme";
import { useEscape } from "../../hooks/useKeyboard";

// ── Tooltip ───────────────────────────────────────────────────────────────────

export function Tooltip({
    children,
    content,
    placement = "top",   // top | bottom | left | right
    delay = 300,
    style = {},
}) {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);

    function show() {
        timerRef.current = setTimeout(() => setVisible(true), delay);
    }
    function hide() {
        clearTimeout(timerRef.current);
        setVisible(false);
    }

    const placements = {
        top: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
        bottom: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
        left: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
        right: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
    };

    const motionMap = {
        top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
        bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
        left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
        right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
    };

    const m = motionMap[placement] ?? motionMap.top;

    return (
        <div
            style={{ position: "relative", display: "inline-flex", ...style }}
            onMouseEnter={show}
            onMouseLeave={hide}
        >
            {children}
            <AnimatePresence>
                {visible && content && (
                    <motion.div
                        initial={m.initial}
                        animate={m.animate}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            zIndex: 9000,
                            background: colors.bgCard,
                            backdropFilter: "blur(16px)",
                            border: `1px solid ${colors.border}`,
                            borderRadius: 8,
                            padding: "6px 10px",
                            fontSize: "0.72rem",
                            fontFamily: "var(--font-body)",
                            color: colors.text,
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
                            ...placements[placement],
                        }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({
    open,
    onClose,
    title = null,
    children,
    width = 520,
    closable = true,
    style = {},
}) {
    const { colors } = useTheme();
    useEscape(onClose, open && closable);

    // Prevent body scroll
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closable ? onClose : undefined}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9000,
                            background: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(4px)",
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 32, filter: "blur(8px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.94, y: 16, filter: "blur(4px)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 9001,
                            width: Math.min(width, window.innerWidth - 32),
                            maxHeight: "88vh",
                            overflowY: "auto",
                            background: colors.bgCard,
                            backdropFilter: "var(--backdrop-blur)",
                            border: `1px solid ${colors.border}`,
                            borderRadius: 20,
                            boxShadow: `0 0 80px ${colors.accentSoft}, 0 32px 80px rgba(0,0,0,0.5)`,
                            ...style,
                        }}
                    >
                        {/* Header */}
                        {(title || closable) && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "18px 24px",
                                borderBottom: `1px solid ${colors.border}`,
                            }}>
                                {title && (
                                    <span style={{
                                        fontFamily: "var(--font-display)",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: colors.text,
                                    }}>
                                        {title}
                                    </span>
                                )}
                                {closable && (
                                    <motion.button
                                        onClick={onClose}
                                        whileHover={{ scale: 1.1, background: colors.bgSurface }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 7,
                                            border: `1px solid ${colors.border}`,
                                            background: "transparent",
                                            color: colors.textMuted,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.8rem",
                                            marginLeft: "auto",
                                            transition: "background 0.15s ease",
                                        }}
                                    >
                                        ✕
                                    </motion.button>
                                )}
                            </div>
                        )}
                        {/* Body */}
                        <div style={{ padding: "24px" }}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

// ── SectionHead ───────────────────────────────────────────────────────────────

export function SectionHead({
    label,
    title,
    sub = null,
    accent = true,
    center = false,
    style = {},
}) {
    const { colors, gradients } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
                textAlign: center ? "center" : "left",
                ...style,
            }}
        >
            {/* Label */}
            {label && (
                <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    background: colors.accentSoft,
                    border: `1px solid ${colors.borderHover}`,
                    borderRadius: 999,
                    fontSize: "0.68rem",
                    fontFamily: "var(--font-accent)",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: colors.accent,
                    marginBottom: 16,
                }}>
                    <span style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: colors.accent,
                        display: "inline-block",
                    }} />
                    {label}
                </div>
            )}

            {/* Title */}
            <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                color: colors.text,
                margin: 0,
                marginBottom: sub ? 12 : 0,
            }}>
                {title}
            </h2>

            {/* Accent line */}
            {accent && (
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    style={{
                        height: 2,
                        width: 48,
                        background: gradients.primary,
                        borderRadius: 999,
                        marginTop: 12,
                        marginBottom: sub ? 12 : 0,
                        originX: center ? 0.5 : 0,
                        margin: center ? "12px auto" : "12px 0",
                    }}
                />
            )}

            {/* Sub */}
            {sub && (
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                    color: colors.textSub,
                    lineHeight: 1.7,
                    margin: 0,
                    maxWidth: 560,
                    marginLeft: center ? "auto" : 0,
                    marginRight: center ? "auto" : 0,
                }}>
                    {sub}
                </p>
            )}
        </motion.div>
    );
}

// ── RadarPulse ────────────────────────────────────────────────────────────────

export function RadarPulse({
    size = 48,
    color = null,
    rings = 3,
    speed = 2,
    style = {},
}) {
    const { colors } = useTheme();
    const c = color ?? colors.accent;

    return (
        <div style={{
            position: "relative",
            width: size,
            height: size,
            flexShrink: 0,
            ...style,
        }}>
            {/* Center dot */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: size * 0.2,
                height: size * 0.2,
                borderRadius: "50%",
                background: c,
                boxShadow: `0 0 ${size * 0.15}px ${c}`,
                zIndex: 2,
            }} />

            {/* Expanding rings */}
            {Array.from({ length: rings }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                        scale: [0, 1],
                        opacity: [0.8, 0],
                    }}
                    transition={{
                        duration: speed,
                        ease: "easeOut",
                        repeat: Infinity,
                        delay: i * (speed / rings),
                    }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        border: `1px solid ${c}`,
                    }}
                />
            ))}
        </div>
    );
}

// ── Bar ───────────────────────────────────────────────────────────────────────

export function Bar({
    value = 0,     // 0–100
    max = 100,
    color = null,
    height = 6,
    radius = 999,
    animated = true,
    label = null,
    showValue = false,
    style = {},
}) {
    const { colors, gradients } = useTheme();
    const pct = Math.min(100, (value / max) * 100);
    const bColor = color ?? "var(--gradient-primary)";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
            {(label || showValue) && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    {label && (
                        <span style={{
                            fontSize: "0.75rem",
                            color: colors.textSub,
                            fontFamily: "var(--font-body)",
                        }}>
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span style={{
                            fontSize: "0.72rem",
                            color: colors.textMuted,
                            fontFamily: "var(--font-mono)",
                        }}>
                            {Math.round(pct)}%
                        </span>
                    )}
                </div>
            )}

            {/* Track */}
            <div style={{
                height,
                borderRadius: radius,
                background: colors.bgSurface,
                overflow: "hidden",
                position: "relative",
            }}>
                {/* Fill */}
                <motion.div
                    initial={animated ? { width: "0%" } : false}
                    animate={{ width: `${pct}%` }}
                    transition={animated
                        ? { duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }
                        : { duration: 0 }
                    }
                    style={{
                        height: "100%",
                        borderRadius: radius,
                        background: bColor,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Shimmer on fill */}
                    <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                        }}
                    />
                </motion.div>

                {/* Glow tip */}
                <motion.div
                    animate={{ left: `${pct}%` }}
                    transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                    style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: height * 1.8,
                        height: height * 1.8,
                        borderRadius: "50%",
                        background: colors.accent,
                        boxShadow: `0 0 ${height * 3}px ${colors.accentGlow}`,
                        opacity: pct > 0 ? 1 : 0,
                    }}
                />
            </div>
        </div>
    );
}