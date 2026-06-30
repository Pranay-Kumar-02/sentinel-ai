// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ExtractionReport
// Forensics extraction results: extracted text, decoded URL, metadata,
// followed by full fullscan results if a URL was found and analyzed.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import VerdictReveal from "../../components/VerdictDisplay/VerdictReveal";
import TerminalLog from "../../components/Common/TerminalLog";
import { Badge } from "../../components/Common/Badge";

export default function ExtractionReport({ state, result, logs, error }) {
    const { colors } = useTheme();

    if (state === "idle") {
        return (
            <div style={{
                height: "100%", minHeight: 400,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, textAlign: "center", padding: 40,
            }}>
                <motion.div
                    animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: colors.tealSoft ?? colors.accentSoft,
                        border: `1px solid ${colors.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2rem",
                    }}
                >
                    🔬
                </motion.div>
                <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.text, marginBottom: 8 }}>
                        Awaiting Evidence
                    </div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: colors.textMuted, maxWidth: 320, lineHeight: 1.6 }}>
                        Upload a screenshot, QR code, or PDF to begin visual intelligence extraction.
                    </div>
                </div>
            </div>
        );
    }

    if (state === "loading") {
        return <TerminalLog logs={logs} maxHeight={320} title="FORENSICS ENGINE" />;
    }

    if (state === "error") {
        return (
            <div style={{
                height: "100%", minHeight: 300,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, textAlign: "center", padding: 40,
            }}>
                <div style={{ fontSize: "2.5rem" }}>⚠️</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: colors.red }}>
                    Extraction Failed
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: colors.textMuted, maxWidth: 340 }}>
                    {error ?? "Unable to process this file. Try a different format or check the backend connection."}
                </div>
            </div>
        );
    }

    if (state === "success" && result) {
        const extractedText = result.extracted_text ?? result.ocr_text ?? "";
        const decodedUrl = result.decoded_url ?? result.qr_url ?? null;
        const metadata = result.metadata ?? {};
        const embeddedLinks = result.embedded_links ?? result.links ?? [];

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Extraction summary */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: colors.bgCard,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 14,
                        padding: 18,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: "1rem" }}>📋</span>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                            Extraction Results
                        </span>
                        <Badge variant="teal" size="xs" style={{ marginLeft: "auto" }}>Complete</Badge>
                    </div>

                    {/* Decoded QR URL */}
                    {decodedUrl && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                Decoded URL
                            </div>
                            <div style={{
                                padding: "10px 14px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.accent}30`,
                                borderRadius: 8,
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.8rem",
                                color: colors.accent,
                                wordBreak: "break-all",
                            }}>
                                {decodedUrl}
                            </div>
                        </div>
                    )}

                    {/* Extracted text */}
                    {extractedText && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                Extracted Text (OCR)
                            </div>
                            <div style={{
                                padding: "12px 14px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 8,
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.78rem",
                                color: colors.textSub,
                                lineHeight: 1.6,
                                maxHeight: 160,
                                overflowY: "auto",
                                whiteSpace: "pre-wrap",
                            }}>
                                {extractedText}
                            </div>
                        </div>
                    )}

                    {/* Embedded links */}
                    {embeddedLinks.length > 0 && (
                        <div>
                            <div style={{ fontSize: "0.65rem", color: colors.textMuted, fontFamily: "var(--font-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                Embedded Links ({embeddedLinks.length})
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                {embeddedLinks.map((link, i) => (
                                    <div key={i} style={{
                                        padding: "6px 10px",
                                        background: colors.redSoft,
                                        border: `1px solid ${colors.red}25`,
                                        borderRadius: 6,
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.74rem",
                                        color: colors.red,
                                        wordBreak: "break-all",
                                    }}>
                                        {link}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    {Object.keys(metadata).length > 0 && (
                        <div style={{
                            marginTop: 14,
                            paddingTop: 14,
                            borderTop: `1px solid ${colors.border}`,
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                            gap: 10,
                        }}>
                            {Object.entries(metadata).map(([k, v]) => (
                                <div key={k}>
                                    <div style={{ fontSize: "0.6rem", color: colors.textMuted, fontFamily: "var(--font-accent)", textTransform: "uppercase" }}>
                                        {k.replace(/_/g, " ")}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: colors.text, fontFamily: "var(--font-mono)" }}>
                                        {String(v)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* If full threat analysis was run on extracted content */}
                {result.master_verdict && (
                    <VerdictReveal result={result} />
                )}
            </div>
        );
    }

    return null;
}