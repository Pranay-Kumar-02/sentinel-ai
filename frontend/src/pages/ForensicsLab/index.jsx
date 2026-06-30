// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — ForensicsLab (Page)
// File upload analysis: screenshots, QR codes, PDFs.
// Split workspace matching ThreatScanner pattern.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useAnalysis } from "../../hooks/useAnalysis";
import UploadZone from "./UploadZone";
import ExtractionReport from "./ExtractionReport";

export default function ForensicsLab() {
    const { colors } = useTheme();
    const { analyze, result, state, isLoading, logs, error, reset } = useAnalysis();
    const [selectedFile, setSelectedFile] = useState(null);

    function handleFileSelect(file, type) {
        setSelectedFile(file);
        analyze(file, type);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                padding: "88px 32px 40px",
                maxWidth: 1400,
                margin: "0 auto",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: colors.text,
                    margin: "0 0 6px",
                    letterSpacing: "-0.02em",
                }}>
                    Forensics Lab
                </h1>
                <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.88rem",
                    color: colors.textSub,
                    margin: 0,
                }}>
                    Visual intelligence extraction — screenshots, QR codes, and PDF documents.
                </p>
            </div>

            {/* Split workspace */}
            <div
                className="forensics-split"
                style={{
                    display: "grid",
                    gridTemplateColumns: "380px 1fr",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                <div style={{
                    position: "sticky",
                    top: 88,
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 18,
                    padding: 20,
                }}>
                    <UploadZone
                        onFileSelect={handleFileSelect}
                        isLoading={isLoading}
                        selectedFile={selectedFile}
                    />
                </div>

                <div style={{ minHeight: "calc(100vh - 128px)" }}>
                    <ExtractionReport
                        state={state}
                        result={result}
                        logs={logs}
                        error={error}
                    />
                </div>
            </div>

            <style>{`
                @media (max-width: 968px) {
                    .forensics-split { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </motion.div>
    );
}