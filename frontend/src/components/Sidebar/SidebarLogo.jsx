// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — SidebarLogo
// Animated logo with glitch effect and collapse state
// ─────────────────────────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

export default function SidebarLogo({ collapsed = false, onClick }) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    return (
        <motion.div
            onClick={onClick}
            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "HOME")}
            onMouseLeave={resetCursor}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "0 8px" : "0 4px",
                cursor: "pointer",
                userSelect: "none",
                justifyContent: collapsed ? "center" : "flex-start",
            }}
        >
            {/* Shield icon */}
            <motion.div
                animate={{ rotate: [0, -2, 2, 0] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: gradients.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 0 20px ${colors.accentGlow}, 0 0 40px ${colors.accentSoft}`,
                    fontSize: "1.1rem",
                }}
            >
                🛡️
            </motion.div>

            {/* Text — hides when collapsed */}
            <AnimatePresence>
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10, width: 0 }}
                        animate={{ opacity: 1, x: 0, width: "auto" }}
                        exit={{ opacity: 0, x: -10, width: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                        <div style={{
                            fontFamily: "var(--font-accent)",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: gradients.accent,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            lineHeight: 1.1,
                        }}>
                            Sentinel
                        </div>
                        <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6rem",
                            color: colors.textMuted,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            marginTop: 1,
                        }}>
                            AI · CTI Platform
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}