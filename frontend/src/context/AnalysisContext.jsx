// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — AnalysisContext
// Global state for all threat analysis operations: Scanner, Forensics, Email,
// OSINT. Centralizes API calls, loading states, engine telemetry, scan history,
// and risk calculations so any page/component can read or trigger an analysis.
//
// Usage:
//   const { runScan, scanResult, loading, history } = useAnalysisContext()
// ─────────────────────────────────────────────────────────────────────────────

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useMemo,
    useEffect,
} from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";
const HISTORY_KEY = "sentinel_history_v3";
const HISTORY_LIMIT = 50;

// ── Context ───────────────────────────────────────────────────────────────────

const AnalysisContext = createContext(null);

// ── Risk Calculator ────────────────────────────────────────────────────────────
// Single source of truth for risk scoring — used everywhere results are shown.
// Weights are evidence-based and intentionally capped so no single signal can
// push a SAFE result to CRITICAL on its own.

export function calculateRiskScore(data) {
    if (!data) return { total: 0, parts: [], color: null, breakdown: {} };

    let score = 0;
    const parts = [];
    const breakdown = {};

    const pre = data?.pre_analysis || data?.llm_analysis?.pre_analysis || {};
    const osintList =
        data?.osint || data?.osint_results || data?.osint_report || [];
    const extracted =
        data?.auto_extracted || data?.llm_analysis?.auto_extracted || {};
    const verdict =
        data?.master_verdict || data?.summary?.verdict || "UNKNOWN";

    // Urgency — max 20pts, scaled proportionally to its own 0-100 score
    if (pre.urgency?.urgency_score > 0) {
        const pts = Math.min(20, (pre.urgency.urgency_score / 100) * 20);
        score += pts;
        breakdown.urgency = pts;
        parts.push({ label: "Urgency Indicators", value: +pts.toFixed(1), color: "#ffb800" });
    }

    // Brand impersonation — flat 20pts, binary signal
    if (pre.impersonation?.impersonation_detected) {
        score += 20;
        breakdown.impersonation = 20;
        parts.push({ label: "Brand Impersonation", value: 20, color: "#a78bfa" });
    }

    // AI verdict severity — only contributes if model already flagged something
    const severityPts = { SAFE: 0, SUSPICIOUS: 10, DANGEROUS: 15, CRITICAL: 20, UNKNOWN: 5 };
    const vPts = severityPts[verdict] ?? 0;
    if (vPts > 0) {
        score += vPts;
        breakdown.aiSeverity = vPts;
        parts.push({ label: "AI Severity", value: vPts, color: "#ff4444" });
    }

    // Embedded links — 5pts each, capped 10pts (don't let link count alone drive verdict)
    if (extracted.urls?.length > 0) {
        const pts = Math.min(10, extracted.urls.length * 5);
        score += pts;
        breakdown.embeddedLinks = pts;
        parts.push({ label: "Embedded Links", value: pts, color: "#38bdf8" });
    }

    // OSINT signals — each engine contributes independently, capped individually
    let osintRiskMax = 0, vtPts = 0, sbPts = 0, typoPts = 0;
    if (Array.isArray(osintList)) {
        osintList.forEach((o) => {
            if ((o.risk_score || 0) > osintRiskMax) osintRiskMax = o.risk_score;
            if (o.virustotal?.malicious > 0) vtPts = 15;
            if (o.safe_browsing?.is_dangerous) sbPts = 15;
            if (o.typosquatting?.is_typosquatting) typoPts = 15;
        });
    }
    if (osintRiskMax > 0) {
        const pts = Math.min(25, (osintRiskMax / 100) * 25);
        score += pts;
        breakdown.osintRisk = pts;
        parts.push({ label: "OSINT Domain Risk", value: +pts.toFixed(1), color: "#00d4ff" });
    }
    if (vtPts) { score += vtPts; breakdown.virusTotal = vtPts; parts.push({ label: "VirusTotal Detection", value: vtPts, color: "#ff4444" }); }
    if (sbPts) { score += sbPts; breakdown.safeBrowsing = sbPts; parts.push({ label: "Safe Browsing Flag", value: sbPts, color: "#ff0033" }); }
    if (typoPts) { score += typoPts; breakdown.typosquatting = typoPts; parts.push({ label: "Typosquatting", value: typoPts, color: "#a78bfa" }); }

    const total = Math.min(100, Math.round(score));

    // Color banding — must agree with VERDICT thresholds used elsewhere in the app
    const color =
        total >= 80 ? "#ff0033" :
            total >= 60 ? "#ff4444" :
                total >= 30 ? "#ffb800" : "#00ff88";

    return { total, parts, color, breakdown };
}

// ── Master verdict resolution ─────────────────────────────────────────────────
// Combines an LLM verdict with OSINT verdicts — always escalates to the
// most severe signal found, never silently downgrades.

const VERDICT_RANK = { SAFE: 0, UNKNOWN: 0, SUSPICIOUS: 1, DANGEROUS: 2, CRITICAL: 3 };

export function resolveMasterVerdict(llmVerdict, osintResults = []) {
    let master = llmVerdict || "UNKNOWN";
    let masterRank = VERDICT_RANK[master] ?? 0;

    for (const o of osintResults) {
        const ov = o?.overall_verdict || "SAFE";
        const r = VERDICT_RANK[ov] ?? 0;
        if (r > masterRank) {
            master = ov;
            masterRank = r;
        }
    }
    return master;
}

// ── localStorage helpers ───────────────────────────────────────────────────────

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
    } catch {
        // storage full or blocked — fail silently, history just won't persist
    }
}

// ── Engine state defaults ─────────────────────────────────────────────────────

const IDLE_ENGINES = {
    parser: "IDLE", ioc: "IDLE", urgency: "IDLE", brand: "IDLE",
    url: "IDLE", typo: "IDLE", vt: "IDLE", safe: "IDLE",
    llm: "IDLE", mitre: "IDLE",
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function AnalysisProvider({ children }) {
    // ── Scanner state ────────────────────────────────────────────
    const [scanInput, setScanInput] = useState("");
    const [scanResult, setScanResult] = useState(null);
    const [scanLoading, setScanLoading] = useState(false);
    const [scanLogs, setScanLogs] = useState([]);
    const [engineStates, setEngineStates] = useState(IDLE_ENGINES);

    // ── Forensics state ──────────────────────────────────────────
    const [forensicsResult, setForensicsResult] = useState(null);
    const [forensicsLoading, setForensicsLoading] = useState(false);
    const [forensicsLogs, setForensicsLogs] = useState([]);

    // ── Email state ──────────────────────────────────────────────
    const [emailInput, setEmailInput] = useState("");
    const [emailResult, setEmailResult] = useState(null);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailLogs, setEmailLogs] = useState([]);

    // ── OSINT recon state ────────────────────────────────────────
    const [osintInput, setOsintInput] = useState("");
    const [osintResult, setOsintResult] = useState(null);
    const [osintLoading, setOsintLoading] = useState(false);

    // ── Shared session stats ─────────────────────────────────────
    const [history, setHistory] = useState(() => loadHistory());
    const [scanCount, setScanCount] = useState(0);
    const [threatCount, setThreatCount] = useState(0);

    // ── Abort controllers — cancel in-flight requests on new scan ──
    const scanAbortRef = useRef(null);
    const emailAbortRef = useRef(null);
    const osintAbortRef = useRef(null);

    // ── Persist history whenever it changes ─────────────────────
    useEffect(() => {
        persistHistory(history);
    }, [history]);

    // ── Log helpers ───────────────────────────────────────────────
    const pushLog = useCallback((setLogs, prefix, text, color) => {
        setLogs((prev) => [
            ...prev.slice(-30),
            { id: `${Date.now()}-${Math.random()}`, prefix, text, color },
        ]);
    }, []);

    const updateEngines = useCallback((updates) => {
        setEngineStates((prev) => ({ ...prev, ...updates }));
    }, []);

    // ── Add to history (shared by all analysis types) ────────────
    const addToHistory = useCallback((entry) => {
        setHistory((prev) => [entry, ...prev].slice(0, HISTORY_LIMIT));
        setScanCount((c) => c + 1);
        if (entry.verdict && entry.verdict !== "SAFE" && entry.verdict !== "UNKNOWN") {
            setThreatCount((c) => c + 1);
        }
    }, []);

    // ── RUN SCAN (Threat Scanner) ─────────────────────────────────
    const runScan = useCallback(async (text, accentColor = "#00d4ff") => {
        if (!text?.trim()) return null;

        if (scanAbortRef.current) scanAbortRef.current.abort();
        const controller = new AbortController();
        scanAbortRef.current = controller;

        setScanLoading(true);
        setScanResult(null);
        setScanLogs([]);
        updateEngines({ ...IDLE_ENGINES, parser: "SCANNING" });

        const steps = [
            ["INIT", "Initializing Sentinel AI engine v3.0...", accentColor],
            ["PARSE", "Parsing input — extracting indicators...", "#a78bfa"],
            ["URGENCY", "Running urgency & social engineering detection...", accentColor],
            ["BRAND", "Cross-referencing brand impersonation database...", "#ffb800"],
            ["VT", "Querying VirusTotal — 70+ antivirus engines...", "#ff4444"],
            ["WHOIS", "Running WHOIS & domain age intelligence...", "#38bdf8"],
            ["GEO", "Geolocating IP addresses...", "#38bdf8"],
            ["TYPO", "Checking typosquatting patterns...", "#a78bfa"],
            ["SAFE", "Querying Google Safe Browsing API...", "#00ff88"],
            ["LLM", "Routing to AI reasoning engine...", accentColor],
            ["MITRE", "Mapping threats to MITRE ATT&CK framework...", "#ff4444"],
            ["REPORT", "Compiling unified threat intelligence report...", "#00ff88"],
        ];

        const timers = steps.map(([p, t, c], i) =>
            setTimeout(() => {
                pushLog(setScanLogs, p, t, c);
                if (i === 1) updateEngines({ parser: "COMPLETE", ioc: "SCANNING" });
                if (i === 2) updateEngines({ ioc: "COMPLETE", urgency: "SCANNING", brand: "SCANNING" });
                if (i === 4) updateEngines({ urgency: "COMPLETE", brand: "COMPLETE", url: "SCANNING", vt: "SCANNING" });
                if (i === 7) updateEngines({ typo: "SCANNING", safe: "SCANNING" });
                if (i === 9) updateEngines({ llm: "SCANNING", mitre: "SCANNING" });
            }, i * 280)
        );

        try {
            let data;
            try {
                const res = await axios.post(
                    `${API_BASE}/fullscan`,
                    { text, run_osint: true },
                    { signal: controller.signal }
                );
                data = res.data;
            } catch (innerErr) {
                if (axios.isCancel(innerErr) || innerErr.name === "CanceledError") throw innerErr;
                // Fallback to /analyze if /fullscan unavailable
                const res = await axios.post(
                    `${API_BASE}/analyze`,
                    { text },
                    { signal: controller.signal }
                );
                data = { ...res.data, osint_results: [], master_verdict: res.data?.summary?.verdict };
            }

            const osintArr = data?.osint || data?.osint_results || [];
            const masterVerdict = resolveMasterVerdict(
                data?.summary?.verdict || data?.master_verdict,
                osintArr
            );
            data.master_verdict = masterVerdict;

            setScanResult(data);

            updateEngines({
                parser: "COMPLETE",
                ioc: "COMPLETE",
                urgency: data?.pre_analysis?.urgency ? "COMPLETE" : "LIMITED",
                brand: data?.pre_analysis?.impersonation ? "COMPLETE" : "LIMITED",
                url: osintArr.length ? "COMPLETE" : (data?.auto_extracted?.urls?.length ? "LIMITED" : "UNAVAILABLE"),
                typo: osintArr.some((o) => o.typosquatting) ? "COMPLETE" : "UNAVAILABLE",
                vt: osintArr.some((o) => o.virustotal && !o.virustotal.error) ? "COMPLETE" : "UNAVAILABLE",
                safe: osintArr.some((o) => o.safe_browsing && !o.safe_browsing.error) ? "COMPLETE" : "UNAVAILABLE",
                llm: data?.ai_analysis ? "COMPLETE" : "LIMITED",
                mitre: data?.ai_analysis?.mitre_attack ? "COMPLETE" : "LIMITED",
            });

            pushLog(setScanLogs, "DONE", `Analysis complete — Verdict: ${masterVerdict}`, masterVerdict === "SAFE" ? "#00ff88" : "#ff4444");

            const risk = calculateRiskScore(data);
            addToHistory({
                id: Date.now().toString(),
                type: "scan",
                timestamp: new Date().toISOString(),
                preview: text.substring(0, 100).replace(/\n/g, " "),
                verdict: masterVerdict,
                confidence: data?.summary?.confidence || 0,
                attackType: data?.ai_analysis?.attack_type || data?.summary?.attack_type || "N/A",
                score: risk.total,
                result: data,
            });

            return data;
        } catch (err) {
            if (axios.isCancel(err) || err.name === "CanceledError") return null;
            pushLog(setScanLogs, "ERROR", "Connection failed — is the backend running on :8000?", "#ff4444");
            updateEngines(Object.fromEntries(Object.keys(IDLE_ENGINES).map((k) => [k, "UNAVAILABLE"])));
            return null;
        } finally {
            timers.forEach(clearTimeout);
            setScanLoading(false);
        }
    }, [pushLog, updateEngines, addToHistory]);

    // ── RUN FORENSICS UPLOAD ──────────────────────────────────────
    const runForensics = useCallback(async (file) => {
        if (!file) return null;

        setForensicsLoading(true);
        setForensicsResult(null);
        setForensicsLogs([]);

        const steps = [
            ["INIT", `Loading: ${file.name}`, "#00d4ff"],
            ["EXTRACT", "Extracting text & embedded URLs...", "#a78bfa"],
            ["OCR", "Running Tesseract OCR engine...", "#00d4ff"],
            ["OSINT", "Running OSINT on extracted URLs...", "#00ff88"],
            ["LLM", "AI threat analysis on extracted content...", "#00d4ff"],
            ["REPORT", "Generating forensics threat report...", "#00ff88"],
        ];
        const timers = steps.map(([p, t, c], i) =>
            setTimeout(() => pushLog(setForensicsLogs, p, t, c), i * 400)
        );

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await axios.post(`${API_BASE}/forensics/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const data = res.data;
            const osintArr = data?.osint_results || [];
            const masterVerdict = resolveMasterVerdict(data?.master_verdict, osintArr);
            data.master_verdict = masterVerdict;

            setForensicsResult(data);
            pushLog(setForensicsLogs, "DONE", `Forensics complete — ${masterVerdict}`, masterVerdict === "SAFE" ? "#00ff88" : "#ff4444");

            const risk = calculateRiskScore(data);
            addToHistory({
                id: Date.now().toString(),
                type: "forensics",
                timestamp: new Date().toISOString(),
                preview: `📎 ${file.name}`,
                verdict: masterVerdict,
                confidence: data?.summary?.confidence || 0,
                attackType: data?.summary?.attack_type || "N/A",
                score: risk.total,
                result: data,
            });

            return data;
        } catch (err) {
            const msg = err.response?.data?.detail || "Forensics analysis failed.";
            pushLog(setForensicsLogs, "ERROR", msg, "#ff4444");
            return null;
        } finally {
            timers.forEach(clearTimeout);
            setForensicsLoading(false);
        }
    }, [pushLog, addToHistory]);

    // ── RUN EMAIL ANALYSIS ────────────────────────────────────────
    const runEmailAnalysis = useCallback(async (rawEmail) => {
        if (!rawEmail?.trim()) return null;

        if (emailAbortRef.current) emailAbortRef.current.abort();
        const controller = new AbortController();
        emailAbortRef.current = controller;

        setEmailLoading(true);
        setEmailResult(null);
        setEmailLogs([]);

        const steps = [
            ["INIT", "Parsing email headers...", "#00d4ff"],
            ["CHAIN", "Tracing mail server hop chain...", "#a78bfa"],
            ["SPF", "Checking SPF record...", "#ffb800"],
            ["DKIM", "Verifying DKIM signature...", "#ffb800"],
            ["DMARC", "Checking DMARC policy...", "#ffb800"],
            ["SPOOF", "Display name spoof detection...", "#ff4444"],
            ["GEO", "Geolocating origin IP...", "#38bdf8"],
            ["LLM", "AI threat analysis...", "#00d4ff"],
            ["REPORT", "Compiling forensics report...", "#00ff88"],
        ];
        const timers = steps.map(([p, t, c], i) =>
            setTimeout(() => pushLog(setEmailLogs, p, t, c), i * 350)
        );

        try {
            const res = await axios.post(
                `${API_BASE}/analyze/email`,
                { raw_email: rawEmail },
                { signal: controller.signal }
            );
            const data = res.data;
            const osintArr = data?.osint_results || [];
            const masterVerdict = resolveMasterVerdict(data?.master_verdict, osintArr);
            data.master_verdict = masterVerdict;

            setEmailResult(data);
            pushLog(setEmailLogs, "DONE", `Analysis complete — ${masterVerdict}`, masterVerdict === "SAFE" ? "#00ff88" : "#ff4444");

            const risk = calculateRiskScore(data);
            addToHistory({
                id: Date.now().toString(),
                type: "email",
                timestamp: new Date().toISOString(),
                preview: `✉️ ${data?.email_forensics?.parsed_headers?.subject || "Email scan"}`,
                verdict: masterVerdict,
                confidence: data?.summary?.confidence || 0,
                attackType: data?.summary?.attack_type || "N/A",
                score: risk.total,
                result: data,
            });

            return data;
        } catch (err) {
            if (axios.isCancel(err) || err.name === "CanceledError") return null;
            const msg = err.response?.data?.detail || "Email analysis failed.";
            pushLog(setEmailLogs, "ERROR", msg, "#ff4444");
            return null;
        } finally {
            timers.forEach(clearTimeout);
            setEmailLoading(false);
        }
    }, [pushLog, addToHistory]);

    // ── RUN OSINT RECON (standalone domain lookup) ────────────────
    const runOsintRecon = useCallback(async (url) => {
        if (!url?.trim()) return null;

        if (osintAbortRef.current) osintAbortRef.current.abort();
        const controller = new AbortController();
        osintAbortRef.current = controller;

        setOsintLoading(true);
        setOsintResult(null);

        try {
            const res = await axios.post(
                `${API_BASE}/osint`,
                { url: url.trim() },
                { signal: controller.signal }
            );
            setOsintResult(res.data);
            return res.data;
        } catch (err) {
            if (axios.isCancel(err) || err.name === "CanceledError") return null;
            return null;
        } finally {
            setOsintLoading(false);
        }
    }, []);

    // ── History management ─────────────────────────────────────────
    const deleteHistoryItem = useCallback((id) => {
        setHistory((prev) => prev.filter((h) => h.id !== id));
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        setScanCount(0);
        setThreatCount(0);
    }, []);

    const loadFromHistory = useCallback((entry) => {
        if (entry.type === "scan") setScanResult(entry.result);
        else if (entry.type === "forensics") setForensicsResult(entry.result);
        else if (entry.type === "email") setEmailResult(entry.result);
        return entry.type;
    }, []);

    // ── Clear individual results ────────────────────────────────────
    const clearScan = useCallback(() => {
        setScanInput("");
        setScanResult(null);
        setScanLogs([]);
        setEngineStates(IDLE_ENGINES);
    }, []);

    const clearForensics = useCallback(() => {
        setForensicsResult(null);
        setForensicsLogs([]);
    }, []);

    const clearEmail = useCallback(() => {
        setEmailInput("");
        setEmailResult(null);
        setEmailLogs([]);
    }, []);

    // ── Computed stats ────────────────────────────────────────────
    const stats = useMemo(() => {
        const threats = history.filter((h) => h.verdict !== "SAFE" && h.verdict !== "UNKNOWN");
        const critical = history.filter((h) => h.verdict === "CRITICAL");
        const avgConfidence = history.length
            ? Math.round(history.reduce((a, h) => a + (h.confidence || 0), 0) / history.length)
            : 0;
        const threatRate = history.length
            ? Math.round((threats.length / history.length) * 100)
            : 0;

        const typeMap = {};
        threats.forEach((t) => {
            const type = t.attackType || "Generic";
            typeMap[type] = (typeMap[type] || 0) + 1;
        });
        const topAttackTypes = Object.entries(typeMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([type, count]) => ({ type, count }));

        return {
            totalScans: history.length,
            threatsFound: threats.length,
            criticalCount: critical.length,
            avgConfidence,
            threatRate,
            topAttackTypes,
        };
    }, [history]);

    // ── Context value ──────────────────────────────────────────────
    const value = useMemo(() => ({
        // Scanner
        scanInput, setScanInput,
        scanResult, scanLoading, scanLogs, engineStates,
        runScan, clearScan,

        // Forensics
        forensicsResult, forensicsLoading, forensicsLogs,
        runForensics, clearForensics,

        // Email
        emailInput, setEmailInput,
        emailResult, emailLoading, emailLogs,
        runEmailAnalysis, clearEmail,

        // OSINT
        osintInput, setOsintInput,
        osintResult, osintLoading,
        runOsintRecon,

        // History
        history, addToHistory, deleteHistoryItem, clearHistory, loadFromHistory,

        // Session stats
        scanCount, threatCount, stats,

        // Utilities — exposed so any component can reuse the same logic
        calculateRiskScore, resolveMasterVerdict,
    }), [
        scanInput, scanResult, scanLoading, scanLogs, engineStates, runScan, clearScan,
        forensicsResult, forensicsLoading, forensicsLogs, runForensics, clearForensics,
        emailInput, emailResult, emailLoading, emailLogs, runEmailAnalysis, clearEmail,
        osintInput, osintResult, osintLoading, runOsintRecon,
        history, addToHistory, deleteHistoryItem, clearHistory, loadFromHistory,
        scanCount, threatCount, stats,
    ]);

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    );
}

// ── Primary hook ──────────────────────────────────────────────────────────────

export function useAnalysisContext() {
    const ctx = useContext(AnalysisContext);
    if (!ctx) {
        throw new Error("useAnalysisContext must be used inside <AnalysisProvider>");
    }
    return ctx;
}

export default AnalysisContext;