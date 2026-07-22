// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useAnalysis hook
// Manages the full threat scan lifecycle:
//   input → loading → terminal log → result → history
//
// Usage:
//   const { analyze, result, isLoading, logs, reset } = useAnalysis()
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import { useScanHistory } from "./useLocalStorage";

// ── API base ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ── Scan types ────────────────────────────────────────────────────────────────

export const SCAN_TYPES = {
    MESSAGE: "message",
    URL: "url",
    EMAIL: "email",
    SCREENSHOT: "screenshot",
    QR: "qr",
    PDF: "pdf",
    DOMAIN: "domain",
};

// ── Analysis states ───────────────────────────────────────────────────────────

export const ANALYSIS_STATE = {
    IDLE: "idle",
    LOADING: "loading",
    SUCCESS: "success",
    ERROR: "error",
};

// ── Terminal log helpers ──────────────────────────────────────────────────────

function makeLog(text, type = "info") {
    return {
        id: Math.random().toString(36).slice(2),
        text,
        type,       // "info" | "success" | "warn" | "error" | "data"
        timestamp: new Date().toISOString(),
    };
}

// ── Log sequences per scan type ───────────────────────────────────────────────

const LOG_SEQUENCES = {
    [SCAN_TYPES.MESSAGE]: [
        { text: "Initializing Sentinel AI engine...", type: "info", delay: 0 },
        { text: "Extracting URLs, emails, phone numbers...", type: "info", delay: 400 },
        { text: "Scanning for urgency language patterns...", type: "info", delay: 800 },
        { text: "Checking brand impersonation signatures...", type: "info", delay: 1200 },
        { text: "Routing to LLM reasoning engine...", type: "info", delay: 1600 },
        { text: "Mapping to MITRE ATT&CK framework...", type: "info", delay: 2200 },
        { text: "Running OSINT correlation...", type: "info", delay: 2800 },
        { text: "Generating threat verdict...", type: "info", delay: 3400 },
    ],
    [SCAN_TYPES.URL]: [
        { text: "Initializing OSINT engine...", type: "info", delay: 0 },
        { text: "Querying VirusTotal (70+ AV engines)...", type: "info", delay: 300 },
        { text: "Checking Google Safe Browsing...", type: "info", delay: 700 },
        { text: "Resolving IP geolocation...", type: "info", delay: 1100 },
        { text: "Running WHOIS/RDAP lookup...", type: "info", delay: 1500 },
        { text: "Detecting typosquatting patterns...", type: "info", delay: 1900 },
        { text: "Calculating domain age risk...", type: "info", delay: 2300 },
        { text: "Correlating LLM + OSINT signals...", type: "info", delay: 2800 },
        { text: "Generating master verdict...", type: "info", delay: 3300 },
    ],
    [SCAN_TYPES.EMAIL]: [
        { text: "Parsing email headers...", type: "info", delay: 0 },
        { text: "Tracing mail server hop chain...", type: "info", delay: 400 },
        { text: "Validating SPF record...", type: "info", delay: 800 },
        { text: "Checking DKIM signature...", type: "info", delay: 1100 },
        { text: "Verifying DMARC policy...", type: "info", delay: 1400 },
        { text: "Scanning for BEC patterns...", type: "info", delay: 1800 },
        { text: "Checking reply-to mismatch...", type: "info", delay: 2200 },
        { text: "Geolocating originating mail server...", type: "info", delay: 2600 },
        { text: "Running LLM body analysis...", type: "info", delay: 3000 },
    ],
    [SCAN_TYPES.SCREENSHOT]: [
        { text: "Loading Tesseract OCR engine...", type: "info", delay: 0 },
        { text: "Extracting text from screenshot...", type: "info", delay: 600 },
        { text: "Identifying URLs and contact info...", type: "info", delay: 1200 },
        { text: "Analyzing visual brand impersonation...", type: "info", delay: 1800 },
        { text: "Routing extracted content to LLM...", type: "info", delay: 2400 },
        { text: "Running OSINT on detected URLs...", type: "info", delay: 3000 },
        { text: "Generating forensics report...", type: "info", delay: 3600 },
    ],
    [SCAN_TYPES.PDF]: [
        { text: "Opening PDF with PyMuPDF...", type: "info", delay: 0 },
        { text: "Extracting text content...", type: "info", delay: 400 },
        { text: "Scanning embedded hyperlinks...", type: "info", delay: 800 },
        { text: "Checking metadata and author info...", type: "info", delay: 1200 },
        { text: "Detecting JavaScript payloads...", type: "info", delay: 1600 },
        { text: "Running LLM content analysis...", type: "info", delay: 2100 },
        { text: "Correlating OSINT on found URLs...", type: "info", delay: 2700 },
        { text: "Generating PDF intelligence report...", type: "info", delay: 3200 },
    ],
    [SCAN_TYPES.QR]: [
        { text: "Decoding QR code with pyzbar...", type: "info", delay: 0 },
        { text: "Extracting destination URL...", type: "info", delay: 500 },
        { text: "Checking for URL shorteners...", type: "info", delay: 900 },
        { text: "Running full OSINT scan on URL...", type: "info", delay: 1300 },
        { text: "Querying VirusTotal...", type: "info", delay: 1800 },
        { text: "Generating QR threat verdict...", type: "info", delay: 2400 },
    ],
};

// ── Main Hook ─────────────────────────────────────────────────────────────────

/**
 * @returns {{
 *   analyze:        (input: string|File, scanType: string, opts?: object) => Promise<void>
 *   result:         object|null
 *   state:          'idle'|'loading'|'success'|'error'
 *   isLoading:      boolean
 *   isSuccess:      boolean
 *   isError:        boolean
 *   error:          string|null
 *   logs:           object[]
 *   progress:       number   0–100
 *   scanType:       string
 *   input:          string
 *   reset:          () => void
 *   cancelScan:     () => void
 * }}
 */
export function useAnalysis() {
    const [state, setState] = useState(ANALYSIS_STATE.IDLE);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const [scanType, setScanType] = useState(SCAN_TYPES.MESSAGE);
    const [input, setInput] = useState("");

    const abortRef = useRef(null);
    const logTimersRef = useRef([]);

    const { addScan } = useScanHistory();

    // ── Clear scheduled log timers ──────────────────────────────
    const clearLogTimers = useCallback(() => {
        logTimersRef.current.forEach(clearTimeout);
        logTimersRef.current = [];
    }, []);

    // ── Schedule terminal log sequence ──────────────────────────
    const scheduleLogs = useCallback((type) => {
        const sequence = LOG_SEQUENCES[type] ?? LOG_SEQUENCES[SCAN_TYPES.MESSAGE];
        clearLogTimers();

        sequence.forEach(({ text, type: logType, delay }) => {
            const t = setTimeout(() => {
                setLogs((prev) => [...prev, makeLog(text, logType)]);
                // Progress advances through log steps
                setProgress(Math.round(((delay + 500) / 4000) * 85));
            }, delay);
            logTimersRef.current.push(t);
        });
    }, [clearLogTimers]);

    // ── Add a single log line ───────────────────────────────────
    const addLog = useCallback((text, type = "info") => {
        setLogs((prev) => [...prev, makeLog(text, type)]);
    }, []);

    // ── Main analyze function ───────────────────────────────────
    const analyze = useCallback(
        async (inputData, type = SCAN_TYPES.MESSAGE, opts = {}) => {
            const { runOsint = true } = opts;

            // Cancel any in-flight request
            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            setScanType(type);
            setInput(typeof inputData === "string" ? inputData : inputData?.name ?? "");
            setState(ANALYSIS_STATE.LOADING);
            setResult(null);
            setError(null);
            setLogs([]);
            setProgress(0);

            // Start terminal log sequence
            scheduleLogs(type);

            try {
                let data;

                // ── File-based scans ────────────────────────────
                if (type === SCAN_TYPES.SCREENSHOT || type === SCAN_TYPES.PDF || type === SCAN_TYPES.QR) {
                    const form = new FormData();
                    form.append("file", inputData);
                    form.append("scan_type", type);

                    const res = await fetch(`${API_BASE}/forensics/upload`, {
                        method: "POST",
                        body: form,
                        signal: abortRef.current.signal,
                    });

                    if (!res.ok) throw new Error(`Server error: ${res.status}`);
                    data = await res.json();

                } else if (type === SCAN_TYPES.EMAIL) {
                    // ── Email header analysis ───────────────────
                    const res = await fetch(`${API_BASE}/analyze/email`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ raw_email: inputData }),
                        signal: abortRef.current.signal,
                    });

                    if (!res.ok) throw new Error(`Server error: ${res.status}`);
                    data = await res.json();

                } else if (type === SCAN_TYPES.DOMAIN || type === SCAN_TYPES.URL) {
                    // ── OSINT-only scan ─────────────────────────
                    const res = await fetch(`${API_BASE}/osint`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: inputData }),
                        signal: abortRef.current.signal,
                    });

                    if (!res.ok) throw new Error(`Server error: ${res.status}`);
                    data = await res.json();

                } else {
                    // ── Full scan: LLM + OSINT ──────────────────
                    const res = await fetch(`${API_BASE}/fullscan`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: inputData, run_osint: runOsint }),
                        signal: abortRef.current.signal,
                    });

                    if (!res.ok) {
                        // Fallback to /analyze only
                        const fallback = await fetch(`${API_BASE}/analyze`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: inputData }),
                            signal: abortRef.current.signal,
                        });
                        if (!fallback.ok) throw new Error(`Server error: ${fallback.status}`);
                        data = await fallback.json();
                    } else {
                        data = await res.json();
                    }
                }

                // ── Success ─────────────────────────────────────
                clearLogTimers();
                setProgress(100);

                const verdict = data?.master_verdict ?? data?.verdict ?? data?.llm_analysis?.verdict ?? "UNKNOWN";
                addLog(`Analysis complete — Verdict: ${verdict}`, "success");
                addLog(`Confidence: ${data?.llm_analysis?.confidence ?? data?.confidence ?? "—"}%`, "data");

                setResult(data);
                setState(ANALYSIS_STATE.SUCCESS);

                // Save to history
                addScan({
                    input: typeof inputData === "string" ? inputData.slice(0, 120) : inputData?.name,
                    scanType: type,
                    verdict,
                    confidence: data?.llm_analysis?.confidence ?? data?.confidence ?? 0,
                    riskScore: data?.risk_score ?? 0,
                });

                // Instant real-time signal for the notification bell — fires
                // the moment a critical/dangerous verdict actually happens,
                // instead of TopBar having to poll localStorage to discover
                // it happened. TopBar (or anything else) can listen for this.
                const v = verdict.toUpperCase();
                if (v === "CRITICAL" || v === "DANGEROUS") {
                    window.dispatchEvent(new CustomEvent("sentinel:threat-detected", {
                        detail: {
                            verdict: v,
                            scanType: type,
                            timestamp: new Date().toISOString(),
                        },
                    }));
                }

            } catch (err) {
                if (err.name === "AbortError") return; // cancelled — silent

                clearLogTimers();
                const msg = err.message ?? "Analysis failed. Check if the backend is running.";
                addLog(msg, "error");
                setError(msg);
                setState(ANALYSIS_STATE.ERROR);
                setProgress(0);

                // Instant real-time signal for a genuine scan failure —
                // distinct from a threat being found: this means the scan
                // itself couldn't complete (backend down, network error,
                // bad response), which the user should know about too.
                window.dispatchEvent(new CustomEvent("sentinel:scan-error", {
                    detail: { message: msg, scanType: type, timestamp: new Date().toISOString() },
                }));
            }
        },
        [scheduleLogs, clearLogTimers, addLog, addScan]
    );

    // ── Cancel in-flight scan ───────────────────────────────────
    const cancelScan = useCallback(() => {
        if (abortRef.current) abortRef.current.abort();
        clearLogTimers();
        setState(ANALYSIS_STATE.IDLE);
        setProgress(0);
        addLog("Scan cancelled by user.", "warn");
    }, [clearLogTimers, addLog]);

    // ── Reset everything ────────────────────────────────────────
    const reset = useCallback(() => {
        if (abortRef.current) abortRef.current.abort();
        clearLogTimers();
        setState(ANALYSIS_STATE.IDLE);
        setResult(null);
        setError(null);
        setLogs([]);
        setProgress(0);
        setInput("");
    }, [clearLogTimers]);

    return {
        // Core
        analyze,
        result,
        state,
        isLoading: state === ANALYSIS_STATE.LOADING,
        isSuccess: state === ANALYSIS_STATE.SUCCESS,
        isError: state === ANALYSIS_STATE.ERROR,
        isIdle: state === ANALYSIS_STATE.IDLE,
        error,

        // Terminal
        logs,
        progress,

        // Scan meta
        scanType,
        setScanType,
        input,

        // Controls
        reset,
        cancelScan,
        addLog,
    };
}

export default useAnalysis;