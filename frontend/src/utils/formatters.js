// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Formatters
// All display-layer formatting. Returns strings ready to render in UI.
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeVerdict } from "./riskCalculator";
import { truncate, stripProtocol, timeAgo, formatDate, compactNumber } from "./helpers";

// ── Risk Score ────────────────────────────────────────────────────────────────

/** Format 0–100 risk score for display */
export function formatRiskScore(score = 0) {
    return `${Math.round(score)}/100`;
}

/** Format risk score as a label */
export function riskScoreLabel(score = 0) {
    if (score >= 80) return "Critical Risk";
    if (score >= 60) return "High Risk";
    if (score >= 35) return "Medium Risk";
    if (score >= 15) return "Low Risk";
    return "Minimal Risk";
}

// ── Verdict ───────────────────────────────────────────────────────────────────

/** Format verdict for prominent display */
export function formatVerdict(verdict = "") {
    const v = normalizeVerdict(verdict);
    const map = {
        SAFE: "SAFE",
        SUSPICIOUS: "SUSPICIOUS",
        DANGEROUS: "DANGEROUS",
        CRITICAL: "CRITICAL",
        UNKNOWN: "UNKNOWN",
    };
    return map[v] ?? verdict.toUpperCase();
}

/** Verdict as a short sentence */
export function verdictSentence(verdict = "") {
    const v = normalizeVerdict(verdict);
    const map = {
        SAFE: "This content appears safe.",
        SUSPICIOUS: "This content shows suspicious patterns.",
        DANGEROUS: "This content is likely malicious.",
        CRITICAL: "This content is confirmed dangerous.",
        UNKNOWN: "Unable to determine threat level.",
    };
    return map[v] ?? "Analysis inconclusive.";
}

// ── Confidence ────────────────────────────────────────────────────────────────

/** Format confidence as percentage string */
export function formatConfidence(confidence = 0) {
    return `${Math.round(confidence)}%`;
}

/** Confidence as a label */
export function confidenceLabel(confidence = 0) {
    if (confidence >= 90) return "Very High";
    if (confidence >= 75) return "High";
    if (confidence >= 55) return "Medium";
    if (confidence >= 35) return "Low";
    return "Very Low";
}

// ── IOC Display ───────────────────────────────────────────────────────────────

/** Format a URL for display — strip protocol, truncate */
export function formatUrl(url = "", maxLen = 55) {
    return truncate(stripProtocol(url), maxLen);
}

/** Format a domain for display */
export function formatDomain(domain = "") {
    return domain.replace(/^www\./, "").toLowerCase();
}

/** Format an IP with geolocation */
export function formatIpWithGeo(ip = "", country = "", city = "") {
    if (!country && !city) return ip;
    const geo = [city, country].filter(Boolean).join(", ");
    return `${ip} (${geo})`;
}

/** Format IOC type label */
export function formatIocType(type = "") {
    const map = {
        url: "URL",
        domain: "Domain",
        email: "Email",
        phone: "Phone",
        ip: "IP Address",
        hash: "File Hash",
        btc: "BTC Address",
    };
    return map[type.toLowerCase()] ?? type.toUpperCase();
}

// ── OSINT Fields ──────────────────────────────────────────────────────────────

/** Format domain age for display */
export function formatDomainAge(days = null) {
    if (days === null || days === undefined) return "Unknown";
    if (days < 1) return "< 1 day";
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
}

/** Format VirusTotal result */
export function formatVirusTotalResult(vt = null) {
    if (!vt) return "Not scanned";
    const positives = vt.positives ?? vt.malicious ?? 0;
    const total = vt.total ?? vt.total_engines ?? 0;
    if (total === 0) return "No results";
    return `${positives}/${total} engines flagged`;
}

/** Format WHOIS registrar */
export function formatRegistrar(registrar = "") {
    if (!registrar) return "Unknown";
    return truncate(registrar, 40);
}

/** Format Safe Browsing result */
export function formatSafeBrowsing(sb = null) {
    if (!sb) return "Not checked";
    if (sb.is_safe) return "Clean";
    if (sb.flagged) return `Flagged: ${sb.threat_type ?? "Threat"}`;
    if (sb.threat_type) return `${sb.threat_type}`;
    return "No threats found";
}

// ── MITRE ATT&CK ─────────────────────────────────────────────────────────────

/** Format a MITRE technique ID */
export function formatMitreTechnique(technique = "") {
    if (!technique) return "—";
    return technique.toUpperCase().replace(/^MITRE:/i, "");
}

/** Format MITRE tactic name */
export function formatMitreTactic(tactic = "") {
    return tactic
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

// ── Scan Types ────────────────────────────────────────────────────────────────

export function formatScanType(type = "") {
    const map = {
        message: "Message / SMS",
        url: "URL / Link",
        email: "Email",
        screenshot: "Screenshot",
        qr: "QR Code",
        pdf: "PDF Document",
        domain: "Domain / IP",
        docx: "Word Document",
    };
    return map[type.toLowerCase()] ?? type;
}

export function scanTypeIcon(type = "") {
    const map = {
        message: "💬",
        url: "🔗",
        email: "📧",
        screenshot: "📸",
        qr: "📱",
        pdf: "📄",
        domain: "🌐",
        docx: "📝",
    };
    return map[type.toLowerCase()] ?? "🔍";
}

// ── Severity / Threat Level ───────────────────────────────────────────────────

export function formatSeverity(severity = "") {
    const map = {
        CRITICAL: "Critical",
        HIGH: "High",
        MEDIUM: "Medium",
        LOW: "Low",
        NONE: "None",
        UNKNOWN: "Unknown",
    };
    return map[severity.toUpperCase()] ?? severity;
}

export function severityIcon(severity = "") {
    const map = {
        CRITICAL: "🔴",
        HIGH: "🟠",
        MEDIUM: "🟡",
        LOW: "🔵",
        NONE: "🟢",
    };
    return map[severity.toUpperCase()] ?? "⚪";
}

// ── Attack Types ──────────────────────────────────────────────────────────────

export function formatAttackType(type = "") {
    const map = {
        phishing: "Phishing",
        smishing: "Smishing (SMS Phishing)",
        vishing: "Vishing (Voice Phishing)",
        bec: "Business Email Compromise",
        malware: "Malware Distribution",
        ransomware: "Ransomware",
        credential: "Credential Harvesting",
        upi_scam: "UPI Payment Scam",
        tech_support: "Tech Support Scam",
        investment_fraud: "Investment Fraud",
        lottery_scam: "Lottery / Prize Scam",
        job_scam: "Fake Job Offer",
        kyc_fraud: "KYC Update Fraud",
        otp_fraud: "OTP Harvesting",
    };
    return map[type.toLowerCase().replace(/\s+/g, "_")] ?? type;
}

// ── Country codes ─────────────────────────────────────────────────────────────

const COUNTRY_NAMES = {
    IN: "India", US: "United States", NG: "Nigeria", RU: "Russia",
    CN: "China", GB: "United Kingdom", PK: "Pakistan", BD: "Bangladesh",
    GH: "Ghana", UA: "Ukraine", RO: "Romania", BR: "Brazil",
    DE: "Germany", FR: "France", NL: "Netherlands", TR: "Turkey",
};

export function formatCountry(code = "") {
    return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

export function countryFlag(code = "") {
    if (!code || code.length !== 2) return "🏳️";
    const codePoints = [...code.toUpperCase()].map(
        (c) => 0x1F1E6 + c.charCodeAt(0) - 65
    );
    return String.fromCodePoint(...codePoints);
}

// ── Terminal log lines ────────────────────────────────────────────────────────

export function formatLogLine(log = {}) {
    const time = new Date(log.timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    return `[${time}] ${log.text}`;
}

// ── Scan history item ─────────────────────────────────────────────────────────

export function formatHistoryItem(item = {}) {
    return {
        ...item,
        displayInput: truncate(item.input ?? "", 60),
        displayTime: timeAgo(item.timestamp),
        displayDate: formatDate(item.timestamp),
        displayScan: formatScanType(item.scanType),
        displayVerdict: formatVerdict(item.verdict),
        scanIcon: scanTypeIcon(item.scanType),
        verdictIcon: severityIcon(item.verdict),
    };
}

// ── Stats / counters ──────────────────────────────────────────────────────────

export function formatStat(n = 0, suffix = "") {
    return `${compactNumber(n)}${suffix}`;
}

/** Format a scan count for the live metrics */
export function formatScanCount(n = 0) {
    return compactNumber(n);
}

// ── Export filenames ──────────────────────────────────────────────────────────

export function exportFilename(scanType = "scan", verdict = "unknown", ext = "json") {
    const date = new Date().toISOString().split("T")[0];
    return `sentinel-${scanType}-${verdict.toLowerCase()}-${date}.${ext}`;
}

// ── JSON export ───────────────────────────────────────────────────────────────

export function formatExportData(result = {}, meta = {}) {
    return {
        platform: "Sentinel AI",
        version: "2.0.0",
        exported_at: new Date().toISOString(),
        scan_meta: meta,
        result,
    };
}