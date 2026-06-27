// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Risk Calculator
// Computes a 0–100 composite risk score from LLM + OSINT signals.
// Matches the exact scoring spec from the project brief.
//
// Score breakdown:
//   Urgency score          max 20 pts  (proportional to urgency_score 0–100)
//   Brand impersonation    max 20 pts  (boolean or score)
//   AI verdict severity    max 20 pts  (SAFE=0, SUSPICIOUS=8, DANGEROUS=14, CRITICAL=20)
//   Embedded URLs          max 10 pts  (5 pts each, capped)
//   OSINT risk score       max 25 pts  (proportional to osint risk_score 0–100)
//   VirusTotal hits        max 15 pts  (any positives → 15)
//   Safe Browsing flag     max 15 pts  (flagged → 15)
//   Typosquatting          max 15 pts  (detected → 15)
//   Total capped at 100.
// ─────────────────────────────────────────────────────────────────────────────

// ── Verdict → severity map ────────────────────────────────────────────────────

const VERDICT_SCORE = {
    SAFE: 0,
    CLEAN: 0,
    BENIGN: 0,
    SUSPICIOUS: 8,
    WARNING: 8,
    CAUTION: 8,
    DANGEROUS: 14,
    MALICIOUS: 14,
    HIGH: 14,
    CRITICAL: 20,
    SCAM: 16,
    PHISHING: 18,
    UNKNOWN: 4,
};

function verdictToScore(verdict = "") {
    const key = verdict.toUpperCase().trim();
    return VERDICT_SCORE[key] ?? 4;
}

// ── Score components ──────────────────────────────────────────────────────────

/**
 * Urgency language score — max 20 pts
 * urgency_score from backend is 0–100
 */
function scoreUrgency(urgencyScore = 0) {
    const clamped = Math.max(0, Math.min(100, urgencyScore));
    return Math.round((clamped / 100) * 20);
}

/**
 * Brand impersonation — max 20 pts
 * Can be boolean, a score 0–100, or an object with detected flag
 */
function scoreBrandImpersonation(impersonation) {
    if (!impersonation) return 0;
    if (typeof impersonation === "boolean") return impersonation ? 20 : 0;
    if (typeof impersonation === "number") return Math.round((impersonation / 100) * 20);
    if (typeof impersonation === "object") {
        if (impersonation.detected) return 20;
        if (impersonation.score) return Math.round((impersonation.score / 100) * 20);
        if (impersonation.count > 0) return Math.min(impersonation.count * 7, 20);
    }
    return 0;
}

/**
 * AI verdict severity — max 20 pts
 */
function scoreVerdict(verdict = "") {
    return verdictToScore(verdict);
}

/**
 * Embedded URLs — 5 pts each, max 10 pts
 */
function scoreEmbeddedUrls(urls = []) {
    if (!Array.isArray(urls)) return 0;
    return Math.min(urls.length * 5, 10);
}

/**
 * OSINT risk score — max 25 pts
 * osint.risk_score is 0–100
 */
function scoreOsint(osintRiskScore = 0) {
    const clamped = Math.max(0, Math.min(100, osintRiskScore));
    return Math.round((clamped / 100) * 25);
}

/**
 * VirusTotal hits — max 15 pts
 * Any positive detections → full 15 pts
 */
function scoreVirusTotal(vtResult) {
    if (!vtResult) return 0;
    const positives =
        vtResult.positives ??
        vtResult.malicious ??
        vtResult.total_votes?.malicious ??
        0;
    return positives > 0 ? 15 : 0;
}

/**
 * Google Safe Browsing — max 15 pts
 * Flagged → 15, clean → 0
 */
function scoreSafeBrowsing(safeBrowsing) {
    if (!safeBrowsing) return 0;
    if (typeof safeBrowsing === "boolean") return safeBrowsing ? 15 : 0;
    if (safeBrowsing.flagged) return 15;
    if (safeBrowsing.is_safe === false) return 15;
    if (safeBrowsing.threat_type) return 15;
    return 0;
}

/**
 * Typosquatting detection — max 15 pts
 */
function scoreTyposquatting(typo) {
    if (!typo) return 0;
    if (typeof typo === "boolean") return typo ? 15 : 0;
    if (typo.detected) return 15;
    if (typo.is_typosquatting) return 15;
    if (typo.similarity_score > 0.7) return 15;
    if (typo.matches?.length > 0) return 12;
    return 0;
}

// ── Master score calculator ───────────────────────────────────────────────────

/**
 * Calculate a composite 0–100 risk score from the full scan result.
 *
 * @param {object} result - the full API response from /fullscan or /analyze
 * @returns {{
 *   total:           number,   // 0–100 final score
 *   components:      object,   // breakdown of each component
 *   verdict:         string,   // derived verdict label
 *   riskLevel:       string,   // "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"
 *   color:           string,   // CSS variable name
 *   confidence:      number,
 * }}
 */
export function calculateRiskScore(result) {
    if (!result) return nullScore();

    // ── Extract fields from various response shapes ─────────────
    const llm = result.llm_analysis ?? result;
    const osint = result.osint_results ?? result.osint ?? {};
    const vt = osint.virustotal ?? osint.virus_total ?? null;
    const sb = osint.safe_browsing ?? osint.google_safe_browsing ?? null;
    const typo = osint.typosquatting ?? osint.typo ?? null;
    const whois = osint.whois ?? {};
    const geo = osint.geolocation ?? osint.ip_info ?? {};

    const verdict = llm.verdict ?? result.master_verdict ?? "UNKNOWN";
    const urgencyScore = llm.urgency_score ?? llm.urgency ?? 0;
    const impersonation = llm.brand_impersonation ?? llm.impersonation ?? false;
    const urls = llm.extracted_urls ?? llm.urls ?? [];
    const osintRiskScore = osint.risk_score ?? 0;
    const confidence = llm.confidence ?? result.confidence ?? 0;

    // ── Score each component ─────────────────────────────────────
    const urgency = scoreUrgency(urgencyScore);
    const brand = scoreBrandImpersonation(impersonation);
    const verdictPts = scoreVerdict(verdict);
    const urlPts = scoreEmbeddedUrls(urls);
    const osintPts = scoreOsint(osintRiskScore);
    const vtPts = scoreVirusTotal(vt);
    const sbPts = scoreSafeBrowsing(sb);
    const typoPts = scoreTyposquatting(typo);

    // ── Domain age bonus ─────────────────────────────────────────
    let domainAgePts = 0;
    const domainAge = whois.domain_age_days ?? whois.age_days ?? null;
    if (domainAge !== null && domainAge < 30) domainAgePts = 10;
    else if (domainAge !== null && domainAge < 90) domainAgePts = 5;

    // ── Tor/Proxy/Hosting bonus ───────────────────────────────────
    let infraPts = 0;
    if (geo.is_tor) infraPts += 8;
    if (geo.is_proxy) infraPts += 5;
    if (geo.is_hosting) infraPts += 3;

    // ── Raw total ─────────────────────────────────────────────────
    const raw = urgency + brand + verdictPts + urlPts + osintPts + vtPts + sbPts + typoPts + domainAgePts + infraPts;

    // ── Cap at 100 ────────────────────────────────────────────────
    const total = Math.min(100, raw);

    // ── Derive risk level ─────────────────────────────────────────
    const riskLevel = deriveRiskLevel(total, verdict);
    const color = riskLevelToColor(riskLevel);

    return {
        total,
        raw,
        components: {
            urgency,
            brand,
            verdict: verdictPts,
            urls: urlPts,
            osint: osintPts,
            virusTotal: vtPts,
            safeBrowsing: sbPts,
            typosquatting: typoPts,
            domainAge: domainAgePts,
            infrastructure: infraPts,
        },
        verdict,
        riskLevel,
        color,
        confidence,
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function nullScore() {
    return {
        total: 0,
        raw: 0,
        components: {},
        verdict: "UNKNOWN",
        riskLevel: "UNKNOWN",
        color: "var(--text-muted)",
        confidence: 0,
    };
}

/**
 * Derive a risk level label from numeric score + verdict
 */
export function deriveRiskLevel(score, verdict = "") {
    const v = verdict.toUpperCase();
    if (v === "CRITICAL" || score >= 80) return "CRITICAL";
    if (v === "DANGEROUS" || score >= 60) return "HIGH";
    if (v === "SUSPICIOUS" || score >= 35) return "MEDIUM";
    if (v === "SAFE" || score < 15) return "LOW";
    return "MEDIUM";
}

/**
 * Map a risk level to its CSS variable color
 */
export function riskLevelToColor(riskLevel) {
    const map = {
        CRITICAL: "var(--red)",
        HIGH: "var(--orange)",
        MEDIUM: "var(--amber)",
        LOW: "var(--green)",
        UNKNOWN: "var(--text-muted)",
    };
    return map[riskLevel] ?? "var(--text-muted)";
}

/**
 * Map a risk level to its glow CSS variable
 */
export function riskLevelToGlow(riskLevel) {
    const map = {
        CRITICAL: "var(--red-glow)",
        HIGH: "var(--orange-glow)",
        MEDIUM: "var(--amber-glow)",
        LOW: "var(--green-glow)",
        UNKNOWN: "var(--text-muted)",
    };
    return map[riskLevel] ?? "var(--text-muted)";
}

/**
 * Map a verdict string to a normalized level
 */
export function normalizeVerdict(verdict = "") {
    const v = verdict.toUpperCase().trim();
    if (["SAFE", "CLEAN", "BENIGN", "LEGITIMATE"].includes(v)) return "SAFE";
    if (["SUSPICIOUS", "WARNING", "CAUTION", "UNCERTAIN"].includes(v)) return "SUSPICIOUS";
    if (["DANGEROUS", "MALICIOUS", "HIGH", "SCAM", "PHISHING"].includes(v)) return "DANGEROUS";
    if (["CRITICAL", "CONFIRMED"].includes(v)) return "CRITICAL";
    return "UNKNOWN";
}

/**
 * Get verdict emoji
 */
export function verdictEmoji(verdict = "") {
    const map = {
        SAFE: "✅",
        SUSPICIOUS: "⚠️",
        DANGEROUS: "🚨",
        CRITICAL: "🔴",
        UNKNOWN: "❓",
    };
    return map[normalizeVerdict(verdict)] ?? "❓";
}

/**
 * Score a confidence number to a label
 */
export function confidenceLabel(confidence = 0) {
    if (confidence >= 90) return "Very High";
    if (confidence >= 75) return "High";
    if (confidence >= 55) return "Medium";
    if (confidence >= 35) return "Low";
    return "Very Low";
}

/**
 * Get risk score color directly (for charts, gauges)
 */
export function scoreToColor(score) {
    if (score >= 80) return "var(--red)";
    if (score >= 60) return "var(--orange)";
    if (score >= 35) return "var(--amber)";
    return "var(--green)";
}

/**
 * Determine particle mode based on verdict
 * @returns {'idle'|'explosion'|'implosion'}
 */
export function verdictToParticleMode(verdict = "") {
    const v = normalizeVerdict(verdict);
    if (v === "CRITICAL" || v === "DANGEROUS") return "explosion";
    if (v === "SAFE") return "implosion";
    return "idle";
}