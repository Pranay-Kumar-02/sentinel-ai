// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ScanInput
// Left panel of the scanner workspace. Investigation type selector + input.
// "Choose investigation type first, then show relevant input."
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { SCAN_TYPES } from "../../hooks/useAnalysis";
import { isUrl, isEmail, fileScanType, formatFileSize } from "../../utils/helpers";

const SCAN_TYPE_CONFIG = [
    { id: SCAN_TYPES.MESSAGE, icon: "💬", label: "Message", desc: "SMS, WhatsApp, chat" },
    { id: SCAN_TYPES.URL, icon: "🔗", label: "URL / Link", desc: "Website, redirect" },
    { id: SCAN_TYPES.EMAIL, icon: "📧", label: "Email", desc: "Raw headers + body" },
    { id: SCAN_TYPES.SCREENSHOT, icon: "📸", label: "Screenshot", desc: "Image with text" },
    { id: SCAN_TYPES.QR, icon: "📱", label: "QR Code", desc: "Decode & analyze" },
    { id: SCAN_TYPES.PDF, icon: "📄", label: "PDF", desc: "Document scan" },
];

export default function ScanInput({
    scanType,
    onScanTypeChange,
    onSubmit,
    isLoading = false,
    onCancel,
}) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const isFileType = [SCAN_TYPES.SCREENSHOT, SCAN_TYPES.PDF, SCAN_TYPES.QR].includes(scanType);

    function handleSubmit() {
        if (isLoading) return;
        if (isFileType && file) {
            onSubmit?.(file, scanType);
        } else if (!isFileType && text.trim()) {
            onSubmit?.(text.trim(), scanType);
        }
    }

    function handleFileSelect(f) {
        if (!f) return;
        setFile(f);
        // Auto-detect scan type from file
        const detected = fileScanType(f.name);
        if (detected !== scanType) onScanTypeChange(detected);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFileSelect(f);
    }

    const canSubmit = isFileType ? !!file : text.trim().length > 0;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            height: "100%",
        }}>
            {/* Investigation type selector */}
            <div>
                <div style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: "0.68rem",
                    color: colors.textMuted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                }}>
                    Investigation Type
                </div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                }}>
                    {SCAN_TYPE_CONFIG.map((t) => (
                        <motion.button
                            key={t.id}
                            onClick={() => onScanTypeChange(t.id)}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, t.label.toUpperCase())}
                            onMouseLeave={resetCursor}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                padding: "14px 8px",
                                background: scanType === t.id ? colors.accentSoft : colors.bgSurface,
                                border: `1px solid ${scanType === t.id ? colors.accent + "50" : colors.border}`,
                                borderRadius: 10,
                                cursor: "pointer",
                                boxShadow: scanType === t.id ? `0 0 16px ${colors.accentSoft}` : "none",
                                transition: "all 0.18s ease",
                            }}
                        >
                            <span style={{ fontSize: "1.2rem" }}>{t.icon}</span>
                            <span style={{
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                color: scanType === t.id ? colors.accent : colors.textSub,
                                fontFamily: "var(--font-body)",
                                textAlign: "center",
                            }}>
                                {t.label}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Input area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                <div style={{
                    fontFamily: "var(--font-accent)",
                    fontSize: "0.68rem",
                    color: colors.textMuted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                }}>
                    {isFileType ? "Upload Evidence" : "Investigation Input"}
                </div>

                <AnimatePresence mode="wait">
                    {isFileType ? (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                                border: `2px dashed ${dragOver ? colors.accent : colors.border}`,
                                borderRadius: 14,
                                background: dragOver ? colors.accentSoft : colors.bgSurface,
                                cursor: "pointer",
                                minHeight: 200,
                                transition: "all 0.2s ease",
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                accept={scanType === SCAN_TYPES.PDF ? ".pdf" : "image/*"}
                                onChange={(e) => handleFileSelect(e.target.files?.[0])}
                            />
                            <motion.div
                                animate={dragOver ? { y: -8, scale: 1.1 } : { y: 0, scale: 1 }}
                                style={{ fontSize: "2.2rem" }}
                            >
                                {file ? "✅" : "📤"}
                            </motion.div>
                            {file ? (
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "0.85rem", color: colors.text, fontFamily: "var(--font-body)", fontWeight: 600 }}>
                                        {file.name}
                                    </div>
                                    <div style={{ fontSize: "0.7rem", color: colors.textMuted, fontFamily: "var(--font-mono)", marginTop: 4 }}>
                                        {formatFileSize(file.size)}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "0.85rem", color: colors.textSub, fontFamily: "var(--font-body)" }}>
                                        Drop file or click to browse
                                    </div>
                                    <div style={{ fontSize: "0.68rem", color: colors.textMuted, fontFamily: "var(--font-mono)", marginTop: 4 }}>
                                        {scanType === SCAN_TYPES.PDF ? "PDF files" : "PNG, JPG, WEBP"}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ flex: 1, display: "flex" }}
                        >
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder={
                                    scanType === SCAN_TYPES.EMAIL
                                        ? "Paste raw email headers + body..."
                                        : scanType === SCAN_TYPES.URL
                                            ? "Paste the URL to investigate..."
                                            : "Paste the suspicious message, SMS, or content..."
                                }
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    minHeight: 180,
                                    background: colors.bgInput,
                                    color: colors.text,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: 12,
                                    padding: 16,
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.85rem",
                                    resize: "none",
                                    outline: "none",
                                    lineHeight: 1.6,
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = colors.borderHover;
                                    e.target.style.boxShadow = `0 0 0 3px ${colors.accentSoft}`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = colors.border;
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Submit button */}
            <motion.button
                onClick={isLoading ? onCancel : handleSubmit}
                onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, isLoading ? "CANCEL" : "SCAN")}
                onMouseLeave={resetCursor}
                whileHover={canSubmit || isLoading ? { scale: 1.02, y: -1 } : {}}
                whileTap={canSubmit || isLoading ? { scale: 0.98 } : {}}
                disabled={!canSubmit && !isLoading}
                style={{
                    padding: "14px 24px",
                    background: isLoading ? colors.bgSurface : (canSubmit ? gradients.primary : colors.bgSurface),
                    border: isLoading ? `1px solid ${colors.red}50` : "none",
                    borderRadius: 12,
                    color: isLoading ? colors.red : (canSubmit ? "#fff" : colors.textMuted),
                    fontFamily: "var(--font-accent)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: (canSubmit || isLoading) ? "pointer" : "not-allowed",
                    boxShadow: canSubmit && !isLoading ? `0 8px 24px ${colors.accentGlow}` : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                {isLoading ? (
                    <>⏹ Cancel Scan</>
                ) : (
                    <>🔍 Run Investigation</>
                )}
            </motion.button>
        </div>
    );
}