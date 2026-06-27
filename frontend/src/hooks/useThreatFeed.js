// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useThreatFeed hook
// Live threat intelligence feed with simulated IOCs, rotating real patterns,
// severity levels, and auto-pause on tab blur.
//
// Usage:
//   const { feed, isLive, pause, resume, clearFeed } = useThreatFeed()
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";

// ── Threat data pools ─────────────────────────────────────────────────────────

const THREAT_DOMAINS = [
    "paypa1-secure.net", "hdfc-alert.xyz", "sbi-kyc-update.com",
    "amazon-prize.tk", "irctc-refund.in", "aadhar-verify.live",
    "google-security-alert.co", "whatsapp-winner.net", "paytm-bonus.xyz",
    "rbi-kyc.tk", "uidai-update.live", "income-tax-refund.com",
    "netflix-verify.co", "microsoft-alert.net", "apple-id-locked.xyz",
    "bank-secure-login.tk", "trai-disconnect.live", "epfo-update.in",
];

const THREAT_IPS = [
    "185.220.101.45", "45.142.212.100", "194.165.16.77",
    "91.108.4.0", "195.178.110.42", "185.234.218.59",
    "103.75.190.11", "45.33.32.156", "172.67.132.90",
    "104.21.45.117", "185.199.110.10", "198.51.100.42",
];

const THREAT_TYPES = [
    "Phishing Campaign", "UPI Scam", "Brand Impersonation",
    "Credential Harvesting", "Malware Distribution", "BEC Attack",
    "Smishing", "Vishing", "Job Scam",
    "Investment Fraud", "Tech Support Scam", "OTP Harvesting",
    "Fake KYC Request", "Lottery Scam", "Remote Access Trojan",
    "Ransomware Dropper", "TRAI Fraud", "Aadhaar Scam",
];

const THREAT_COUNTRIES = [
    "IN", "NG", "RU", "CN", "BR", "PK", "BD", "GH", "UA", "RO",
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const SEVERITY_WEIGHTS = [0.3, 0.4, 0.2, 0.1]; // distribution

const MITRE_TECHNIQUES = [
    "T1566.001", "T1566.002", "T1598", "T1059",
    "T1190", "T1078", "T1110", "T1071",
    "T1055", "T1486", "T1041", "T1027",
];

const TARGET_SECTORS = [
    "Banking", "E-Commerce", "Government", "Healthcare",
    "Education", "Telecom", "Insurance", "Crypto",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function weightedSeverity() {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < SEVERITIES.length; i++) {
        cum += SEVERITY_WEIGHTS[i];
        if (r < cum) return SEVERITIES[i];
    }
    return "LOW";
}

function generateThreatItem() {
    const severity = weightedSeverity();
    const type = pick(THREAT_TYPES);
    const domain = pick(THREAT_DOMAINS);
    const ip = pick(THREAT_IPS);
    const country = pick(THREAT_COUNTRIES);
    const mitre = pick(MITRE_TECHNIQUES);
    const sector = pick(TARGET_SECTORS);

    return {
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        severity,
        type,
        domain,
        ip,
        country,
        mitre,
        sector,
        confidence: Math.floor(Math.random() * 35) + 65, // 65–100
        ioc: Math.random() > 0.5 ? domain : ip,
        iocType: Math.random() > 0.5 ? "domain" : "ip",
        description: `${type} targeting ${sector} sector via ${domain}`,
        source: pick(["OSINT Feed", "Community Report", "Honeypot", "PhishTank", "URLhaus", "AlienVault OTX"]),
        isNew: true,
    };
}

// ── Interval map per severity ─────────────────────────────────────────────────

const BASE_INTERVAL_MS = 3500;

// ── Main Hook ─────────────────────────────────────────────────────────────────

/**
 * @param {object} [options]
 * @param {number}  [options.maxItems=50]       - max feed items kept in memory
 * @param {number}  [options.intervalMs=3500]   - ms between new threat items
 * @param {boolean} [options.autoStart=true]    - start feed immediately
 * @param {boolean} [options.pauseOnBlur=true]  - pause when tab loses focus
 * @param {(item: object) => void} [options.onNewThreat] - callback on each new item
 */
export function useThreatFeed(options = {}) {
    const {
        maxItems = 50,
        intervalMs = BASE_INTERVAL_MS,
        autoStart = true,
        pauseOnBlur = true,
        onNewThreat = null,
    } = options;

    const [feed, setFeed] = useState([]);
    const [isLive, setIsLive] = useState(autoStart);
    const [isPaused, setIsPaused] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
    });

    const intervalRef = useRef(null);
    const isLiveRef = useRef(autoStart);
    const isPausedRef = useRef(false);
    const onNewThreatRef = useRef(onNewThreat);

    useEffect(() => { onNewThreatRef.current = onNewThreat; }, [onNewThreat]);

    // ── Emit one threat item ────────────────────────────────────
    const emitThreat = useCallback(() => {
        if (!isLiveRef.current || isPausedRef.current) return;

        const item = generateThreatItem();

        setFeed((prev) => {
            const next = [item, ...prev];
            return next.length > maxItems ? next.slice(0, maxItems) : next;
        });

        setStats((prev) => ({
            total: prev.total + 1,
            critical: prev.critical + (item.severity === "CRITICAL" ? 1 : 0),
            high: prev.high + (item.severity === "HIGH" ? 1 : 0),
            medium: prev.medium + (item.severity === "MEDIUM" ? 1 : 0),
            low: prev.low + (item.severity === "LOW" ? 1 : 0),
        }));

        if (onNewThreatRef.current) onNewThreatRef.current(item);

        // Mark item as not new after 3s
        setTimeout(() => {
            setFeed((prev) =>
                prev.map((f) => (f.id === item.id ? { ...f, isNew: false } : f))
            );
        }, 3000);
    }, [maxItems]);

    // ── Start interval ──────────────────────────────────────────
    const startInterval = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Stagger initial burst
        const jitter = Math.random() * 1000;
        setTimeout(() => {
            emitThreat();
            intervalRef.current = setInterval(emitThreat, intervalMs);
        }, jitter);
    }, [emitThreat, intervalMs]);

    // ── Controls ────────────────────────────────────────────────
    const start = useCallback(() => {
        isLiveRef.current = true;
        setIsLive(true);
        startInterval();
    }, [startInterval]);

    const stop = useCallback(() => {
        isLiveRef.current = false;
        setIsLive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, []);

    const pause = useCallback(() => {
        isPausedRef.current = true;
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        isPausedRef.current = false;
        setIsPaused(false);
    }, []);

    const clearFeed = useCallback(() => {
        setFeed([]);
        setStats({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
    }, []);

    // ── Filter helpers ──────────────────────────────────────────
    const getBySeverity = useCallback(
        (severity) => feed.filter((f) => f.severity === severity),
        [feed]
    );

    const getRecent = useCallback(
        (n = 10) => feed.slice(0, n),
        [feed]
    );

    // ── Auto-start ──────────────────────────────────────────────
    useEffect(() => {
        if (autoStart) startInterval();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoStart, startInterval]);

    // ── Pause on tab blur ───────────────────────────────────────
    useEffect(() => {
        if (!pauseOnBlur) return;

        function onBlur() { isPausedRef.current = true; setIsPaused(true); }
        function onFocus() { isPausedRef.current = false; setIsPaused(false); }

        window.addEventListener("blur", onBlur);
        window.addEventListener("focus", onFocus);
        return () => {
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("focus", onFocus);
        };
    }, [pauseOnBlur]);

    return {
        // Data
        feed,
        stats,

        // State
        isLive,
        isPaused,

        // Controls
        start,
        stop,
        pause,
        resume,
        clearFeed,

        // Filters
        getBySeverity,
        getRecent,
        criticalFeed: feed.filter((f) => f.severity === "CRITICAL"),
        newItems: feed.filter((f) => f.isNew),
    };
}

export default useThreatFeed;