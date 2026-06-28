// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — NavItem
// Individual navigation item for sidebar.
// Active state, hover glow, badge support, collapse animation.
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

export default function NavItem({
    icon,
    label,
    badge = null,
    isActive = false,
    collapsed = false,
    onClick,
    soon = false,
    danger = false,
    custom = 0,
}) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    const accentColor = danger ? colors.red : colors.accent;
    const accentGlow = danger ? colors.redGlow : colors.accentGlow;
    const accentSoft = danger ? colors.redSoft : colors.accentSoft;

    return (
        <motion.button
            onClick={soon ? undefined : onClick}
            onMouseEnter={() =>
                setCursor(
                    danger ? CURSOR_STATES.DANGER : CURSOR_STATES.INTERACTIVE,
                    label.toUpperCase()
                )
            }
            onMouseLeave={resetCursor}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                delay: custom * 0.05,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ x: collapsed ? 0 : 3 }}
            whileTap={{ scale: 0.97 }}
            title={collapsed ? label : undefined}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? accentSoft : "transparent",
                border: `1px solid ${isActive ? accentColor + "30" : "transparent"}`,
                borderRadius: 10,
                cursor: soon ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "background 0.2s ease, border-color 0.2s ease",
                opacity: soon ? 0.45 : 1,
            }}
        >
            {/* Active indicator bar */}
            {isActive && (
                <motion.div
                    layoutId="nav-active-bar"
                    style={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        borderRadius: "0 2px 2px 0",
                        background: gradients.primary,
                        boxShadow: `0 0 8px ${accentGlow}`,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            )}

            {/* Hover shimmer */}
            <motion.div
                initial={{ x: "-100%", opacity: 0 }}
                whileHover={{ x: "100%", opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(105deg, transparent 40%, ${accentSoft} 50%, transparent 60%)`,
                    pointerEvents: "none",
                }}
            />

            {/* Icon */}
            <motion.span
                animate={{ color: isActive ? accentColor : colors.textMuted }}
                transition={{ duration: 0.2 }}
                style={{
                    fontSize: "1.05rem",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    filter: isActive ? `drop-shadow(0 0 6px ${accentGlow})` : "none",
                    transition: "filter 0.2s ease",
                }}
            >
                {icon}
            </motion.span>

            {/* Label + badge */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -8, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: -8, width: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flex: 1,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span style={{
                            fontSize: "0.84rem",
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? accentColor : colors.textSub,
                            fontFamily: "var(--font-body)",
                            transition: "color 0.2s ease",
                        }}>
                            {label}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {soon && (
                                <span style={{
                                    fontSize: "0.6rem",
                                    fontFamily: "var(--font-accent)",
                                    color: colors.textMuted,
                                    background: colors.bgSurface,
                                    border: `1px solid ${colors.border}`,
                                    padding: "1px 5px",
                                    borderRadius: 4,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                }}>
                                    Soon
                                </span>
                            )}
                            {badge !== null && !soon && (
                                <motion.span
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    style={{
                                        fontSize: "0.65rem",
                                        fontFamily: "var(--font-accent)",
                                        fontWeight: 700,
                                        color: colors.bg,
                                        background: accentColor,
                                        padding: "1px 6px",
                                        borderRadius: 999,
                                        minWidth: 18,
                                        textAlign: "center",
                                        boxShadow: `0 0 8px ${accentGlow}`,
                                    }}
                                >
                                    {badge}
                                </motion.span>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed badge dot */}
            {collapsed && badge !== null && (
                <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: accentColor,
                        boxShadow: `0 0 6px ${accentGlow}`,
                    }}
                />
            )}
        </motion.button>
    );
}