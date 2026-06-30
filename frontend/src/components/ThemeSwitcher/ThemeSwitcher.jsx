import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronDown, Check } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { springs, ease } from "../../animations/spring";

export default function ThemeSwitcher({ compact = false }) {
    const {
        themeId, themes, setTheme, accent, bgCard, border,
        text, textSub, textMuted, theme,
    } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <motion.button
                onClick={() => setOpen((o) => !o)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={springs.crisp}
                className="flex items-center gap-2 rounded-xl transition-all"
                style={{
                    padding: compact ? "6px 10px" : "8px 14px",
                    background: bgCard,
                    border: `1px solid ${open ? accent + "40" : border}`,
                    boxShadow: open ? `0 0 20px ${accent}20` : "none",
                }}
            >
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={springs.snappy}
                >
                    <Layers size={13} style={{ color: accent }} />
                </motion.div>
                {!compact && (
                    <>
                        <span className="text-xs font-mono font-bold" style={{ color: text }}>
                            {theme.name}
                        </span>
                        <span className="text-sm">{theme.icon}</span>
                    </>
                )}
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={springs.snappy}
                >
                    <ChevronDown size={11} style={{ color: textMuted }} />
                </motion.div>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={springs.default}
                        className="absolute right-0 top-full mt-2 z-50 overflow-hidden"
                        style={{
                            width: 280,
                            background: "#0a0f1e",
                            border: `1px solid ${border}`,
                            borderRadius: 16,
                            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                            backdropFilter: "blur(24px)",
                        }}
                    >
                        {/* Header */}
                        <div
                            className="px-4 py-3 border-b flex items-center justify-between"
                            style={{ borderColor: border }}
                        >
                            <span
                                className="text-[10px] font-mono uppercase tracking-widest font-bold"
                                style={{ color: textMuted }}
                            >
                                Select Theme
                            </span>
                            <span
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                                style={{ background: accent + "15", color: accent }}
                            >
                                Ctrl+Shift+T
                            </span>
                        </div>

                        {/* Theme grid */}
                        <div className="p-2 grid grid-cols-2 gap-1.5">
                            {themes.map((t, i) => {
                                const isActive = themeId === t.id;
                                return (
                                    <motion.button
                                        key={t.id}
                                        onClick={() => { setTheme(t.id); setOpen(false); }}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ ...springs.crisp, delay: i * 0.025 }}
                                        whileHover={{ scale: 1.03, y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex flex-col items-start gap-1.5 p-2.5 rounded-xl text-left transition-all relative overflow-hidden"
                                        style={{
                                            background: isActive ? t.accentSoft : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${isActive ? t.accent + "40" : "rgba(255,255,255,0.05)"}`,
                                        }}
                                    >
                                        {/* Mini gradient preview */}
                                        <div
                                            className="w-full h-6 rounded-lg flex items-center justify-between px-2"
                                            style={{
                                                background: t.gradientPrimary,
                                            }}
                                        >
                                            <span className="text-sm leading-none">{t.icon}</span>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={springs.bouncy}
                                                >
                                                    <Check size={12} color="white" strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </div>
                                        <span
                                            className="text-[10px] font-bold font-mono"
                                            style={{ color: isActive ? t.accent : textSub }}
                                        >
                                            {t.name}
                                        </span>

                                        {/* Active glow border */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="theme-active-glow"
                                                className="absolute inset-0 rounded-xl pointer-events-none"
                                                style={{
                                                    boxShadow: `inset 0 0 0 1.5px ${t.accent}, 0 0 16px ${t.accent}30`,
                                                }}
                                                transition={springs.default}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Footer hint */}
                        <div
                            className="px-4 py-2.5 border-t"
                            style={{ borderColor: border }}
                        >
                            <p className="text-[9px] font-mono leading-relaxed" style={{ color: textMuted }}>
                                Themes change colors, particles, glow, and special effects across the entire platform.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}