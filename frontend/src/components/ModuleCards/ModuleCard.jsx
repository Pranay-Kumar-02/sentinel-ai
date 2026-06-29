// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ModuleCard
// Platform module card — feels like an application, not a button.
// 3D tilt, glow border, status indicator, recent activity, launch CTA.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useElementMouse } from "../../hooks/useMousePosition";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

export default function ModuleCard({
    id,
    icon,
    name,
    description,
    status = "active",   // active | beta | soon | new
    color = null,       // override accent color
    activity = null,       // recent activity string
    stats = null,       // { label, value }
    onClick,
    index = 0,
}) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const cardRef = useRef(null);
    const mouse = useElementMouse(cardRef);
    const [hovered, setHovered] = useState(false);

    const accentColor = color ?? colors.accent;
    const accentGlow = color ? `${color}50` : colors.accentGlow;
    const accentSoft = color ? `${color}12` : colors.accentSoft;

    const statusConfig = {
        active: { label: "Active", color: colors.green, dot: true },
        beta: { label: "Beta", color: colors.amber, dot: true },
        soon: { label: "Soon", color: colors.textMuted, dot: false },
        new: { label: "New", color: colors.accent, dot: true },
    };
    const sc = statusConfig[status] ?? statusConfig.active;

    // 3D tilt
    const tiltX = hovered ? mouse.tiltX * 10 : 0;
    const tiltY = hovered ? mouse.tiltY * 10 : 0;

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
                delay: index * 0.06,
                type: "spring",
                stiffness: 260,
                damping: 22,
            }}
            onClick={status !== "soon" ? onClick : undefined}
            onMouseEnter={() => {
                setHovered(true);
                setCursor(CURSOR_STATES.INTERACTIVE, "OPEN");
            }}
            onMouseLeave={() => {
                setHovered(false);
                resetCursor();
            }}
            animate={{
                rotateX: tiltX,
                rotateY: tiltY,
                scale: hovered ? 1.02 : 1,
                boxShadow: hovered
                    ? `0 0 0 1px ${accentColor}40, 0 12px 48px ${accentGlow}, inset 0 0 40px ${accentSoft}`
                    : `0 0 0 1px ${colors.borderCard}, 0 4px 20px rgba(0,0,0,0.2)`,
            }}
            style={{
                background: colors.bgCard,
                backdropFilter: "var(--backdrop-blur)",
                border: `1px solid ${hovered ? accentColor + "30" : colors.borderCard}`,
                borderRadius: 18,
                padding: "24px",
                cursor: status === "soon" ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden",
                opacity: status === "soon" ? 0.55 : 1,
                transformStyle: "preserve-3d",
                perspective: "1000px",
                willChange: "transform",
                transition: "border-color 0.2s ease",
            }}
        >
            {/* Top accent line */}
            <div style={{
                position: "absolute",
                top: 0,
                left: "20%",
                right: "20%",
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                opacity: hovered ? 1 : 0.3,
                transition: "opacity 0.3s ease",
                borderRadius: "0 0 999px 999px",
            }} />

            {/* Mouse-follow radial gradient */}
            {hovered && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at ${mouse.nx * 100}% ${mouse.ny * 100}%, ${accentSoft} 0%, transparent 60%)`,
                    pointerEvents: "none",
                    borderRadius: 18,
                }} />
            )}

            {/* Shimmer on hover */}
            {hovered && (
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.05) 50%, transparent 65%)",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
                {/* Top row: icon + status */}
                <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}>
                    {/* Icon */}
                    <motion.div
                        animate={hovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 13,
                            background: accentSoft,
                            border: `1px solid ${accentColor}25`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            boxShadow: hovered ? `0 0 20px ${accentGlow}` : "none",
                            transition: "box-shadow 0.3s ease",
                        }}
                    >
                        {icon}
                    </motion.div>

                    {/* Status badge */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "4px 9px",
                        background: `${sc.color}15`,
                        border: `1px solid ${sc.color}30`,
                        borderRadius: 999,
                    }}>
                        {sc.dot && (
                            <motion.div
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: sc.color,
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <span style={{
                            fontSize: "0.62rem",
                            fontFamily: "var(--font-accent)",
                            fontWeight: 700,
                            color: sc.color,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                        }}>
                            {sc.label}
                        </span>
                    </div>
                </div>

                {/* Name */}
                <h3 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: colors.text,
                    margin: "0 0 7px",
                    letterSpacing: "-0.01em",
                }}>
                    {name}
                </h3>

                {/* Description */}
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    color: colors.textSub,
                    lineHeight: 1.6,
                    margin: "0 0 16px",
                }}>
                    {description}
                </p>

                {/* Stats */}
                {stats && (
                    <div style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 16,
                        paddingTop: 12,
                        borderTop: `1px solid ${colors.border}`,
                    }}>
                        {(Array.isArray(stats) ? stats : [stats]).map((s, i) => (
                            <div key={i}>
                                <div style={{
                                    fontFamily: "var(--font-accent)",
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    color: accentColor,
                                }}>
                                    {s.value}
                                </div>
                                <div style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.6rem",
                                    color: colors.textMuted,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent activity */}
                {activity && (
                    <div style={{
                        fontSize: "0.7rem",
                        color: colors.textMuted,
                        fontFamily: "var(--font-mono)",
                        marginBottom: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        ↳ {activity}
                    </div>
                )}

                {/* Launch CTA */}
                <motion.div
                    animate={{
                        opacity: hovered ? 1 : 0.6,
                        x: hovered ? 0 : -4,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        color: accentColor,
                    }}
                >
                    {status === "soon" ? (
                        <span style={{ color: colors.textMuted }}>Coming Soon</span>
                    ) : (
                        <>
                            <span>Open Workspace</span>
                            <motion.span
                                animate={hovered ? { x: [0, 4, 0] } : {}}
                                transition={{ duration: 0.6, repeat: Infinity }}
                            >
                                →
                            </motion.span>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Inner bottom glow */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: `linear-gradient(0deg, ${accentSoft} 0%, transparent 100%)`,
                opacity: hovered ? 1 : 0,
                transition: "opacity 0.3s ease",
                pointerEvents: "none",
            }} />
        </motion.div>
    );
}