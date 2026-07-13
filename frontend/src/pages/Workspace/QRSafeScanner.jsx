// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — QR Safe Scanner (Page)
// Upload QR code → decode → scan URL → verdict.
// pyzbar decode (free) + VirusTotal (free tier).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

const BACKEND = "http://127.0.0.1:8000";

const VERDICT_CONFIG = {
    MALICIOUS: { color: "red", icon: "🚨", label: "MALICIOUS", desc: "This QR code leads to a malicious URL. Do NOT visit it." },
    SUSPICIOUS: { color: "amber", icon: "⚠️", label: "SUSPICIOUS", desc: "Suspicious patterns detected. Proceed with extreme caution." },
    CLEAN: { color: "green", icon: "✅", label: "CLEAN", desc: "No threats detected. URL appears safe." },
    UNSCANNED: { color: "blue", icon: "ℹ️", label: "UNSCANNED", desc: "URL decoded but could not be scanned. Add VirusTotal API key." },
    UNKNOWN: { color: "textMuted", icon: "❓", label: "UNKNOWN", desc: "Could not determine safety." },
};

export default function QRSafeScanner() {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    function handleFile(f) {
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            setError("Please upload an image file (PNG, JPG, WEBP)");
            return;
        }
        setFile(f);
        setError(null);
        setResult(null);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target.result);
        reader.readAsDataURL(f);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    }

    async function handleScan() {
        if (!file || loading) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${BACKEND}/qr/decode`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail ?? "Scan failed");
            }
            if (!data.success) {
                throw new Error(data.error ?? "No QR code found");
            }

            setResult(data);
        } catch (err) {
            setError(err.message ?? "Scan failed. Make sure backend is running and pyzbar is installed.");
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    }

    const overallCfg = result ? VERDICT_CONFIG[result.overall_verdict] ?? VERDICT_CONFIG.UNKNOWN : null;
    const overallColor = overallCfg ? colors[overallCfg.color] ?? colors.accent : colors.accent;
    const overallSoft = overallCfg ? colors[overallCfg.color + "Soft"] ?? colors.accentSoft : colors.accentSoft;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "88px 32px 60px", maxWidth: 860, margin: "0 auto", minHeight: "100vh" }}
        >
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40, textAlign: "center" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 14px", background: colors.tealSoft,
                    border: `1px solid ${colors.teal}30`, borderRadius: 999, marginBottom: 16,
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.teal, display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.teal }}>
                        Visual Intelligence
                    </span>
                </div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.02em", color: colors.text, margin: "0 0 10px" }}>
                    QR Safe Scanner
                </h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: colors.textSub, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
                    Upload any QR code image. We decode it and scan the URL through VirusTotal <strong style={{ color: colors.text }}>before you ever visit it.</strong> Zero risk.
                </p>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 20 }} className="qr-grid">
                {/* Upload zone */}
                <div>
                    <motion.div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !preview && fileInputRef.current?.click()}
                        animate={{
                            borderColor: dragOver ? colors.teal : preview ? colors.green : colors.border,
                            scale: dragOver ? 1.01 : 1,
                        }}
                        style={{
                            minHeight: 300,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            border: "2px dashed", borderRadius: 18,
                            background: dragOver ? colors.tealSoft : colors.bgSurface,
                            cursor: preview ? "default" : "pointer",
                            padding: 24, position: "relative", overflow: "hidden",
                            transition: "background 0.2s ease",
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={e => handleFile(e.target.files?.[0])}
                        />

                        <AnimatePresence mode="wait">
                            {preview ? (
                                <motion.div
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ textAlign: "center", width: "100%" }}
                                >
                                    <img
                                        src={preview}
                                        alt="QR Code"
                                        style={{
                                            maxWidth: "100%", maxHeight: 220,
                                            objectFit: "contain", borderRadius: 12,
                                            marginBottom: 12,
                                            border: `2px solid ${colors.border}`,
                                        }}
                                    />
                                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: colors.textSub, marginBottom: 8 }}>
                                        {file.name}
                                    </div>
                                    <motion.button
                                        onClick={(e) => { e.stopPropagation(); reset(); }}
                                        whileHover={{ scale: 1.05 }}
                                        style={{
                                            padding: "4px 12px", background: colors.bgCard,
                                            border: `1px solid ${colors.border}`, borderRadius: 6,
                                            color: colors.textMuted, fontFamily: "var(--font-mono)",
                                            fontSize: "0.7rem", cursor: "pointer",
                                        }}
                                    >
                                        ✕ Remove
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ textAlign: "center" }}
                                >
                                    <motion.div
                                        animate={dragOver ? { y: -8, scale: 1.15 } : { y: [0, -6, 0] }}
                                        transition={dragOver ? {} : { duration: 2.5, repeat: Infinity }}
                                        style={{ fontSize: "3rem", marginBottom: 14 }}
                                    >
                                        📱
                                    </motion.div>
                                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.92rem", fontWeight: 600, color: colors.text, marginBottom: 6 }}>
                                        Drop QR code image here
                                    </div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.textMuted, marginBottom: 14 }}>
                                        or click to browse — PNG, JPG, WEBP
                                    </div>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                                        {["UPI QR", "Payment QR", "Event ticket", "Suspicious link"].map(t => (
                                            <span key={t} style={{
                                                padding: "3px 10px", background: colors.bgCard,
                                                border: `1px solid ${colors.border}`, borderRadius: 999,
                                                fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.textMuted,
                                            }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Scan button */}
                    {preview && (
                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={handleScan}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "SCAN")}
                            onMouseLeave={resetCursor}
                            whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            disabled={loading}
                            style={{
                                width: "100%", marginTop: 12,
                                padding: "14px",
                                background: loading ? colors.bgSurface : "var(--gradient-primary)",
                                border: "none", borderRadius: 12,
                                color: loading ? colors.textMuted : "#fff",
                                fontFamily: "var(--font-accent)", fontSize: "0.82rem",
                                fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                                cursor: loading ? "not-allowed" : "pointer",
                                boxShadow: loading ? "none" : `0 8px 24px ${colors.accentGlow}`,
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.2s ease",
                            }}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                                        style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                                    />
                                    Decoding & Scanning...
                                </>
                            ) : "🔍 Decode & Scan QR"}
                        </motion.button>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: 10, padding: "10px 14px",
                                background: colors.redSoft, border: `1px solid ${colors.red}30`,
                                borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: colors.red,
                            }}
                        >
                            ⚠ {error}
                        </motion.div>
                    )}

                    {/* Install hint */}
                    <div style={{
                        marginTop: 12, padding: "10px 14px",
                        background: colors.bgSurface, border: `1px solid ${colors.border}`,
                        borderRadius: 8,
                    }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.textMuted, marginBottom: 4 }}>
                            📦 Required: pyzbar + Pillow
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.accent }}>
                            pip install pyzbar Pillow
                        </div>
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            style={{ display: "flex", flexDirection: "column", gap: 14 }}
                        >
                            {/* Overall verdict */}
                            <div style={{
                                padding: "20px",
                                background: colors.bgCard,
                                border: `1px solid ${overallColor}40`,
                                borderRadius: 16,
                                boxShadow: `0 0 30px ${overallSoft}`,
                                textAlign: "center",
                            }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{overallCfg?.icon}</div>
                                <div style={{ fontFamily: "var(--font-accent)", fontSize: "1.3rem", fontWeight: 900, color: overallColor, marginBottom: 6 }}>
                                    {overallCfg?.label}
                                </div>
                                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: colors.textSub, lineHeight: 1.5 }}>
                                    {overallCfg?.desc}
                                </div>
                            </div>

                            {/* Per-result details */}
                            {result.results.map((item, i) => {
                                const cfg = VERDICT_CONFIG[item.verdict] ?? VERDICT_CONFIG.UNKNOWN;
                                const color = colors[cfg.color] ?? colors.accent;
                                const soft = colors[cfg.color + "Soft"] ?? colors.accentSoft;

                                return (
                                    <div key={i} style={{
                                        background: colors.bgCard, border: `1px solid ${colors.border}`,
                                        borderRadius: 14, overflow: "hidden",
                                    }}>
                                        <div style={{ height: 3, background: color }} />
                                        <div style={{ padding: "14px 16px" }}>
                                            {/* Decoded value */}
                                            <div style={{ marginBottom: 12 }}>
                                                <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                                                    Decoded Content
                                                </div>
                                                <div style={{
                                                    fontFamily: "var(--font-mono)", fontSize: "0.8rem",
                                                    color: color, wordBreak: "break-all",
                                                    padding: "8px 10px", background: soft,
                                                    border: `1px solid ${color}25`, borderRadius: 6,
                                                }}>
                                                    {item.value}
                                                </div>
                                            </div>

                                            {/* VirusTotal results */}
                                            {item.vt?.available && (
                                                <div style={{ marginBottom: 10 }}>
                                                    <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                                        VirusTotal
                                                    </div>
                                                    <div style={{ display: "flex", gap: 10 }}>
                                                        {[
                                                            { label: "Malicious", value: item.vt.malicious, color: colors.red },
                                                            { label: "Suspicious", value: item.vt.suspicious, color: colors.amber },
                                                            { label: "Clean", value: item.vt.harmless, color: colors.green },
                                                            { label: "Total", value: item.vt.total, color: colors.textSub },
                                                        ].map(s => (
                                                            <div key={s.label} style={{ textAlign: "center", flex: 1 }}>
                                                                <div style={{ fontFamily: "var(--font-accent)", fontSize: "1rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                                                                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: colors.textMuted }}>{s.label}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Flagged engines */}
                                                    {item.vt.flagged?.length > 0 && (
                                                        <div style={{ marginTop: 10 }}>
                                                            <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                                                Flagged by
                                                            </div>
                                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                                                {item.vt.flagged.map((f, fi) => (
                                                                    <span key={fi} style={{
                                                                        fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                                                                        color: colors.red, background: colors.redSoft,
                                                                        border: `1px solid ${colors.red}25`,
                                                                        padding: "2px 7px", borderRadius: 4,
                                                                    }}>
                                                                        {f.engine}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Not scanned reason */}
                                            {item.vt && !item.vt.available && (
                                                <div style={{
                                                    padding: "8px 12px", background: colors.bgSurface,
                                                    border: `1px solid ${colors.border}`, borderRadius: 7,
                                                    fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: colors.textMuted,
                                                }}>
                                                    ℹ {item.vt.reason ?? "VirusTotal scan unavailable"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                @media (max-width: 768px) { .qr-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </motion.div>
    );
}