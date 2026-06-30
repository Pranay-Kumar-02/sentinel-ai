// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — UploadZone
// Drag-and-drop upload zone for Forensics Lab. Multi-file-type aware.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";
import { formatFileSize, fileExtension } from "../../utils/helpers";

const FILE_TYPES = [
    { id: "screenshot", icon: "📸", label: "Screenshot", accept: "image/*", desc: "OCR text extraction" },
    { id: "qr", icon: "📱", label: "QR Code", accept: "image/*", desc: "Decode & analyze URL" },
    { id: "pdf", icon: "📄", label: "PDF", accept: ".pdf", desc: "Links & metadata" },
];

export default function UploadZone({ onFileSelect, isLoading = false, selectedFile = null }) {
    const { colors, gradients } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [forensicsType, setForensicsType] = useState("screenshot");
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const activeType = FILE_TYPES.find((t) => t.id === forensicsType);

    function handleFile(file) {
        if (!file) return;
        onFileSelect?.(file, forensicsType);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Type selector */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
            }}>
                {FILE_TYPES.map((t) => (
                    <motion.button
                        key={t.id}
                        onClick={() => setForensicsType(t.id)}
                        onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, t.label.toUpperCase())}
                        onMouseLeave={resetCursor}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            padding: "16px 10px",
                            background: forensicsType === t.id ? colors.tealSoft ?? colors.accentSoft : colors.bgSurface,
                            border: `1px solid ${forensicsType === t.id ? colors.teal + "50" : colors.border}`,
                            borderRadius: 12,
                            cursor: "pointer",
                            boxShadow: forensicsType === t.id ? `0 0 16px ${colors.tealGlow}` : "none",
                        }}
                    >
                        <span style={{ fontSize: "1.4rem" }}>{t.icon}</span>
                        <span style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: forensicsType === t.id ? colors.teal : colors.textSub,
                            fontFamily: "var(--font-body)",
                        }}>
                            {t.label}
                        </span>
                        <span style={{
                            fontSize: "0.6rem",
                            color: colors.textMuted,
                            fontFamily: "var(--font-mono)",
                            textAlign: "center",
                        }}>
                            {t.desc}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* Drop zone */}
            <motion.div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                animate={{
                    borderColor: dragOver ? colors.teal : (selectedFile ? colors.green : colors.border),
                    scale: dragOver ? 1.01 : 1,
                }}
                style={{
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    border: "2px dashed",
                    borderRadius: 18,
                    background: dragOver ? colors.tealSoft ?? colors.accentSoft : colors.bgSurface,
                    cursor: "pointer",
                    padding: 32,
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept={activeType?.accept}
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />

                <AnimatePresence mode="wait">
                    {selectedFile ? (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ textAlign: "center" }}
                        >
                            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
                            <div style={{ fontSize: "0.95rem", color: colors.text, fontFamily: "var(--font-body)", fontWeight: 600, marginBottom: 4 }}>
                                {selectedFile.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                                {formatFileSize(selectedFile.size)} · {fileExtension(selectedFile.name).toUpperCase()}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: "center" }}
                        >
                            <motion.div
                                animate={dragOver ? { y: -8, scale: 1.15 } : { y: [0, -6, 0] }}
                                transition={dragOver
                                    ? { type: "spring", stiffness: 400 }
                                    : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
                                }
                                style={{ fontSize: "2.8rem", marginBottom: 12 }}
                            >
                                {activeType?.icon}
                            </motion.div>
                            <div style={{ fontSize: "0.92rem", color: colors.text, fontFamily: "var(--font-body)", fontWeight: 600, marginBottom: 6 }}>
                                Drop {activeType?.label.toLowerCase()} here
                            </div>
                            <div style={{ fontSize: "0.75rem", color: colors.textMuted, fontFamily: "var(--font-mono)" }}>
                                or click to browse files
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}