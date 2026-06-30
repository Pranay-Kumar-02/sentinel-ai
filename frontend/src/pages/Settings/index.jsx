// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Settings (Page)
// Platform configuration: theme, preferences, backend status, about info.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import {
    useParticlesEnabled, useGridVisible, useAnalystMode,
    useReducedMotionPref, useScanHistory,
} from "../../hooks/useLocalStorage";
import ThemeSwitcher from "../../components/TopBar/ThemeSwitcher";
import { SectionHead } from "../../components/Common/Tooltip";
import { Badge } from "../../components/Common/Badge";
import { api } from "../../utils/api";

function ToggleRow({ label, desc, value, onChange, colors }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0",
            borderBottom: `1px solid ${colors.border}`,
        }}>
            <div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.86rem", fontWeight: 600, color: colors.text, marginBottom: 3 }}>
                    {label}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", color: colors.textMuted }}>
                    {desc}
                </div>
            </div>

            <motion.button
                onClick={() => onChange(!value)}
                whileTap={{ scale: 0.94 }}
                style={{
                    width: 44,
                    height: 24,
                    borderRadius: 999,
                    background: value ? colors.accent : colors.bgSurface,
                    border: `1px solid ${value ? colors.accent : colors.border}`,
                    position: "relative",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.2s ease",
                }}
            >
                <motion.div
                    animate={{ x: value ? 21 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                        position: "absolute",
                        top: 2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                />
            </motion.button>
        </div>
    );
}

export default function Settings() {
    const { colors, themeId, themes } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [particlesOn, toggleParticles] = useParticlesEnabled();
    const [gridOn, toggleGrid] = useGridVisible();
    const [analystMode, toggleAnalyst] = useAnalystMode();
    const [reducedMotion, toggleReduced] = useReducedMotionPref();
    const { history, clearHistory } = useScanHistory();

    const [backendStatus, setBackendStatus] = useState(null);
    const [checking, setChecking] = useState(false);

    async function checkBackend() {
        setChecking(true);
        const alive = await api.isBackendAlive();
        setBackendStatus(alive);
        setChecking(false);
    }

    useEffect(() => { checkBackend(); }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                padding: "88px 32px 60px",
                maxWidth: 840,
                margin: "0 auto",
                minHeight: "100vh",
            }}
        >
            <SectionHead
                label="Configuration"
                title="Settings"
                sub="Customize your Sentinel AI experience — themes, preferences, and platform status."
            />

            {/* Theme Section */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    padding: 24,
                    marginTop: 32,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: "1rem" }}>🎨</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.text }}>
                        Theme
                    </span>
                </div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: colors.textMuted, margin: "0 0 18px" }}>
                    Choose from 8 complete environments. Press <code style={{ background: colors.bgSurface, padding: "1px 6px", borderRadius: 4, fontFamily: "var(--font-mono)" }}>Ctrl+Shift+T</code> to cycle themes anytime.
                </p>
                <ThemeSwitcher />
            </motion.section>

            {/* Preferences Section */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    padding: 24,
                    marginTop: 16,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                    <span style={{ fontSize: "1rem" }}>⚙️</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.text }}>
                        Preferences
                    </span>
                </div>

                <ToggleRow
                    label="Particle Effects"
                    desc="Animated cursor-reactive particle field in the background"
                    value={particlesOn}
                    onChange={toggleParticles}
                    colors={colors}
                />
                <ToggleRow
                    label="Hex Grid"
                    desc="Neural hex grid overlay with pulse animations"
                    value={gridOn}
                    onChange={toggleGrid}
                    colors={colors}
                />
                <ToggleRow
                    label="Analyst Mode"
                    desc="Show deep technical detail instead of plain-English summaries"
                    value={analystMode}
                    onChange={toggleAnalyst}
                    colors={colors}
                />
                <ToggleRow
                    label="Reduce Motion"
                    desc="Minimize animations across the platform for accessibility"
                    value={reducedMotion}
                    onChange={toggleReduced}
                    colors={colors}
                />
            </motion.section>

            {/* Platform Status Section */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    padding: 24,
                    marginTop: 16,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "1rem" }}>📡</span>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.text }}>
                            Platform Status
                        </span>
                    </div>
                    <motion.button
                        onClick={checkBackend}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "REFRESH")}
                        onMouseLeave={resetCursor}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: "5px 12px",
                            background: colors.bgSurface,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            color: colors.textSub,
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {checking ? "Checking..." : "↻ Refresh"}
                    </motion.button>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 16px",
                    background: backendStatus ? colors.greenSoft : colors.redSoft,
                    border: `1px solid ${backendStatus ? colors.green : colors.red}30`,
                    borderRadius: 10,
                }}>
                    <div style={{ position: "relative" }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: backendStatus ? colors.green : colors.red,
                        }} />
                        {backendStatus && (
                            <motion.div
                                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ position: "absolute", inset: 0, borderRadius: "50%", background: colors.green }}
                            />
                        )}
                    </div>
                    <div>
                        <div style={{
                            fontFamily: "var(--font-body)", fontSize: "0.84rem", fontWeight: 600,
                            color: backendStatus ? colors.green : colors.red,
                        }}>
                            {backendStatus === null ? "Checking connection..." : backendStatus ? "Backend Connected" : "Backend Offline"}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: colors.textMuted }}>
                            http://127.0.0.1:8000
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Data Section */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    padding: 24,
                    marginTop: 16,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: "1rem" }}>🗄️</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.text }}>
                        Local Data
                    </span>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                }}>
                    <div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.84rem", color: colors.text }}>
                            Scan History
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: colors.textMuted }}>
                            {history.length} saved scans
                        </div>
                    </div>
                    <motion.button
                        onClick={clearHistory}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                            padding: "7px 14px",
                            background: colors.redSoft,
                            border: `1px solid ${colors.red}30`,
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            color: colors.red,
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                        }}
                    >
                        Clear History
                    </motion.button>
                </div>
            </motion.section>

            {/* Version footer */}
            <div style={{
                textAlign: "center",
                marginTop: 32,
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                color: colors.textDim,
            }}>
                Sentinel AI v2.0.0 — Built by Pranay Kumar Vonamala
            </div>
        </motion.div>
    );
}