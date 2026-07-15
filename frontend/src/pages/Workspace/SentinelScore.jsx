// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Sentinel Score (Page)
// Your digital security score calculated from REAL local data only.
// Every point is traceable to a specific action. Zero approximations.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

// ── Read real data from localStorage ─────────────────────────────────────────
function getLocalData() {
    try {
        // Scan history
        const rawHistory = localStorage.getItem("sentinel_scan_history") ?? "[]";
        const history = JSON.parse(rawHistory);

        // Platform usage
        const lastVisit = localStorage.getItem("sentinel_last_visit");
        const firstVisit = localStorage.getItem("sentinel_first_visit");

        // Feature usage flags
        const hasCVECheck = localStorage.getItem("sentinel_cve_checked") === "true";
        const hasTyposquat = localStorage.getItem("sentinel_typosquat_checked") === "true";
        const hasQRScan = localStorage.getItem("sentinel_qr_scanned") === "true";

        return { history, lastVisit, firstVisit, hasCVECheck, hasTyposquat, hasQRScan };
    } catch {
        return { history: [], lastVisit: null, firstVisit: null, hasCVECheck: false, hasTyposquat: false, hasQRScan: false };
    }
}

// ── Score calculation — every deduction is traceable ─────────────────────────
function calculateScore(data) {
    const { history, lastVisit, hasCVECheck, hasTyposquat, hasQRScan } = data;

    let score = 100;
    const factors = [];
    const now = Date.now();
    const day = 86400000;
    const week = 7 * day;

    // ── Positive factors ──────────────────────────────────────────────────────

    // Has used platform at all
    if (history.length > 0) {
        factors.push({ type: "positive", label: "Platform activated", points: 0, desc: "You are actively monitoring threats" });
    }

    // Recent activity bonus
    const lastVisitTime = lastVisit ? new Date(lastVisit).getTime() : 0;
    const daysSinceVisit = (now - lastVisitTime) / day;
    if (daysSinceVisit <= 7) {
        score += 5;
        factors.push({ type: "positive", label: "Active this week", points: +5, desc: "Used Sentinel AI in the last 7 days" });
    }

    // Regular scanning
    const recentScans = history.filter(h => (now - new Date(h.timestamp).getTime()) < week * 4);
    if (recentScans.length >= 10) {
        score += 5;
        factors.push({ type: "positive", label: "Regular scanning habit", points: +5, desc: `${recentScans.length} scans in the last 4 weeks` });
    }

    // All recent scans clean
    const recentVerdicts = recentScans.map(h => h.verdict?.toUpperCase());
    const allClean = recentVerdicts.length > 0 && recentVerdicts.every(v => v === "SAFE" || v === "CLEAN");
    if (allClean && recentVerdicts.length >= 3) {
        score += 10;
        factors.push({ type: "positive", label: "All recent scans clean", points: +10, desc: "No threats found in your last scans" });
    }

    // CVE awareness
    if (hasCVECheck) {
        score += 5;
        factors.push({ type: "positive", label: "CVE monitoring active", points: +5, desc: "You check for software vulnerabilities" });
    }

    // Domain protection
    if (hasTyposquat) {
        score += 5;
        factors.push({ type: "positive", label: "Domain protection active", points: +5, desc: "You monitor for domain impersonation" });
    }

    // QR safety awareness
    if (hasQRScan) {
        score += 5;
        factors.push({ type: "positive", label: "QR safety awareness", points: +5, desc: "You verify QR codes before scanning" });
    }

    // ── Negative factors ──────────────────────────────────────────────────────

    // Count threats by severity
    const criticalCount = history.filter(h => h.verdict?.toUpperCase() === "CRITICAL").length;
    const dangerousCount = history.filter(h => h.verdict?.toUpperCase() === "DANGEROUS").length;
    const suspiciousCount = history.filter(h => h.verdict?.toUpperCase() === "SUSPICIOUS").length;

    if (criticalCount > 0) {
        const deduction = Math.min(criticalCount * 15, 30);
        score -= deduction;
        factors.push({
            type: "negative", label: "Critical threats encountered",
            points: -deduction,
            desc: `${criticalCount} CRITICAL threat${criticalCount > 1 ? "s" : ""} found in your scan history`,
        });
    }

    if (dangerousCount > 0) {
        const deduction = Math.min(dangerousCount * 10, 20);
        score -= deduction;
        factors.push({
            type: "negative", label: "Dangerous threats encountered",
            points: -deduction,
            desc: `${dangerousCount} DANGEROUS threat${dangerousCount > 1 ? "s" : ""} found in your scan history`,
        });
    }

    if (suspiciousCount > 0) {
        const deduction = Math.min(suspiciousCount * 5, 15);
        score -= deduction;
        factors.push({
            type: "negative", label: "Suspicious content detected",
            points: -deduction,
            desc: `${suspiciousCount} SUSPICIOUS item${suspiciousCount > 1 ? "s" : ""} found in scans`,
        });
    }

    // Inactivity penalty
    if (history.length === 0) {
        score -= 10;
        factors.push({
            type: "negative", label: "No scans performed yet",
            points: -10,
            desc: "Run your first threat scan to improve your score",
        });
    } else if (daysSinceVisit > 30) {
        score -= 10;
        factors.push({
            type: "negative", label: "Inactive for 30+ days",
            points: -10,
            desc: "Regular scanning keeps your threat awareness current",
        });
    } else if (daysSinceVisit > 7) {
        score -= 5;
        factors.push({
            type: "negative", label: "Inactive this week",
            points: -5,
            desc: "Visit Sentinel AI weekly to maintain your score",
        });
    }

    // Missing features
    if (!hasCVECheck) {
        score -= 5;
        factors.push({
            type: "negative", label: "No CVE monitoring",
            points: -5,
            desc: "Check CVE Pulse to monitor software vulnerabilities",
        });
    }

    if (!hasTyposquat) {
        score -= 5;
        factors.push({
            type: "negative", label: "No domain protection",
            points: -5,
            desc: "Use Typosquat Watchdog to protect your domain",
        });
    }

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    // Grade
    const grade =
        score >= 90 ? { label: "A+", color: "green", desc: "Excellent — Your security posture is outstanding" } :
            score >= 80 ? { label: "A", color: "green", desc: "Great — Strong security awareness" } :
                score >= 70 ? { label: "B", color: "teal", desc: "Good — Room for improvement" } :
                    score >= 60 ? { label: "C", color: "amber", desc: "Fair — Take action on the recommendations below" } :
                        score >= 40 ? { label: "D", color: "orange", desc: "Poor — Your security posture needs attention" } :
                            { label: "F", color: "red", desc: "Critical — Immediate action required" };

    // Stats
    const stats = {
        totalScans: history.length,
        criticalFound: criticalCount,
        dangerousFound: dangerousCount,
        suspiciousFound: suspiciousCount,
        safeFound: history.filter(h => h.verdict?.toUpperCase() === "SAFE" || h.verdict?.toUpperCase() === "CLEAN").length,
        lastScan: history.length > 0 ? history[history.length - 1]?.timestamp : null,
        daysSinceVisit: Math.floor(daysSinceVisit),
    };

    return { score, grade, factors, stats };
}

// ── Score gauge ────────────────────────────────────────────────────────────────
function ScoreGauge({ score, grade, colors }) {
    const gradeColor = colors[grade.color] ?? colors.accent;
    const radius = 80;
    const cx = 100;
    const cy = 100;
    const circ = 2 * Math.PI * radius;
    const arc = circ * 0.75;
    const fill = (score / 100) * arc;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 200, height: 200 }}>
                <svg width={200} height={200} style={{ transform: "rotate(135deg)" }}>
                    {/* Track */}
                    <circle cx={cx} cy={cy} r={radius} fill="none"
                        stroke={colors.bgSurface} strokeWidth={14}
                        strokeDasharray={`${arc} ${circ - arc}`}
                        strokeLinecap="round"
                    />
                    {/* Fill */}
                    <motion.circle
                        cx={cx} cy={cy} r={radius} fill="none"
                        stroke={gradeColor} strokeWidth={14}
                        strokeLinecap="round"
                        strokeDasharray={`${arc} ${circ - arc}`}
                        initial={{ strokeDashoffset: arc }}
                        animate={{ strokeDashoffset: arc - fill }}
                        transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                        style={{ filter: `drop-shadow(0 0 8px ${gradeColor})` }}
                    />
                </svg>

                {/* Center content */}
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                            fontFamily: "var(--font-accent)", fontSize: "2.8rem",
                            fontWeight: 900, color: gradeColor, lineHeight: 1,
                        }}
                    >
                        {score}
                    </motion.div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: colors.textMuted }}>
                        / 100
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        style={{
                            fontFamily: "var(--font-accent)", fontSize: "1.2rem",
                            fontWeight: 800, color: gradeColor, marginTop: 4,
                        }}
                    >
                        {grade.label}
                    </motion.div>
                </div>
            </div>

            <div style={{ textAlign: "center" }}>
                <div style={{
                    fontFamily: "var(--font-body)", fontSize: "0.88rem",
                    fontWeight: 600, color: gradeColor, marginBottom: 4,
                }}>
                    {grade.desc}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: colors.textMuted }}>
                    Sentinel Security Score
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SentinelScore() {
    const { colors } = useTheme();
    const { setCursor, resetCursor } = useCursor();
    const [data, setData] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Record this visit
        if (!localStorage.getItem("sentinel_first_visit")) {
            localStorage.setItem("sentinel_first_visit", new Date().toISOString());
        }
        localStorage.setItem("sentinel_last_visit", new Date().toISOString());

        // Load and calculate
        const localData = getLocalData();
        setData(localData);
        setResult(calculateScore(localData));
        setLoading(false);
    }, []);

    function refresh() {
        setLoading(true);
        setTimeout(() => {
            const localData = getLocalData();
            setData(localData);
            setResult(calculateScore(localData));
            setLoading(false);
        }, 600);
    }

    if (loading || !result) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
                    style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${colors.border}`, borderTopColor: colors.accent }}
                />
            </div>
        );
    }

    const gradeColor = colors[result.grade.color] ?? colors.accent;
    const gradeSoft = colors[result.grade.color + "Soft"] ?? colors.accentSoft;

    const positives = result.factors.filter(f => f.type === "positive");
    const negatives = result.factors.filter(f => f.type === "negative");

    // Recommendations based on actual deficiencies
    const recommendations = negatives.map(n => ({
        issue: n.label,
        action: n.label.includes("CVE") ? "Go to Workspace → CVE Pulse and search for software you use" :
            n.label.includes("domain") ? "Go to Workspace → Typosquat Watchdog and check your domain" :
                n.label.includes("QR") ? "Go to Workspace → QR Safe Scanner before scanning unknown QRs" :
                    n.label.includes("scan") ? "Go to Threat Scanner and analyze any suspicious content you receive" :
                        n.label.includes("Inactive") ? "Visit Sentinel AI at least once a week to stay protected" :
                            n.label.includes("Critical") ? "Review your scan history and avoid the sources of critical threats" :
                                n.label.includes("Dangerous") ? "Avoid re-engaging with sources that triggered dangerous verdicts" :
                                    "Take action to improve this area",
    }));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "88px 32px 60px", maxWidth: 1000, margin: "0 auto", minHeight: "100vh" }}
        >
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40, textAlign: "center" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "4px 14px", background: colors.purpleSoft,
                    border: `1px solid ${colors.purple}30`, borderRadius: 999, marginBottom: 16,
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors.purple, display: "inline-block" }} />
                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.purple }}>
                        Security Intelligence
                    </span>
                </div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.02em", color: colors.text, margin: "0 0 10px" }}>
                    Sentinel Score
                </h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: colors.textSub, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                    Your security score calculated from <strong style={{ color: colors.text }}>real activity data only</strong>. Every point is traceable to a specific action you took.
                </p>
            </motion.div>

            {/* Main grid */}
            <div style={{
                display: "grid", gridTemplateColumns: "360px 1fr",
                gap: 24, alignItems: "start",
            }} className="score-grid">

                {/* Left — gauge */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Score card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            background: colors.bgCard,
                            border: `1px solid ${gradeColor}30`,
                            borderRadius: 20, padding: "28px 24px",
                            textAlign: "center",
                            boxShadow: `0 0 60px ${gradeSoft}`,
                        }}
                    >
                        <ScoreGauge score={result.score} grade={result.grade} colors={colors} />

                        {/* Refresh */}
                        <motion.button
                            onClick={refresh}
                            onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "REFRESH")}
                            onMouseLeave={resetCursor}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            style={{
                                marginTop: 20, padding: "8px 20px",
                                background: colors.bgSurface,
                                border: `1px solid ${colors.border}`,
                                borderRadius: 8, cursor: "pointer",
                                fontFamily: "var(--font-mono)", fontSize: "0.72rem",
                                color: colors.textSub,
                            }}
                        >
                            ↻ Recalculate
                        </motion.button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            background: colors.bgCard, border: `1px solid ${colors.border}`,
                            borderRadius: 16, padding: "18px",
                        }}
                    >
                        <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.65rem", color: colors.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                            Activity Stats
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {[
                                { label: "Total Scans", value: result.stats.totalScans, color: colors.accent },
                                { label: "Critical Found", value: result.stats.criticalFound, color: colors.red },
                                { label: "Dangerous Found", value: result.stats.dangerousFound, color: colors.orange },
                                { label: "Suspicious Found", value: result.stats.suspiciousFound, color: colors.amber },
                                { label: "Clean Scans", value: result.stats.safeFound, color: colors.green },
                                { label: "Days Since Active", value: result.stats.daysSinceVisit, color: colors.textSub },
                            ].map(s => (
                                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: colors.textSub }}>{s.label}</span>
                                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.88rem", fontWeight: 700, color: s.color }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right — factors + recommendations */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Score breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "20px" }}
                    >
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", fontWeight: 700, color: colors.text, marginBottom: 16 }}>
                            Score Breakdown
                        </div>

                        {/* Base score */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 12px", background: colors.bgSurface,
                            border: `1px solid ${colors.border}`, borderRadius: 8,
                            marginBottom: 10,
                        }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.textMuted, flex: 1 }}>Base Score</span>
                            <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.88rem", fontWeight: 700, color: colors.accent }}>100</span>
                        </div>

                        {/* Positive factors */}
                        {positives.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                                <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.green, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                    ▲ Bonuses
                                </div>
                                {positives.map((f, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.05 }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            padding: "8px 12px", marginBottom: 4,
                                            background: colors.greenSoft,
                                            border: `1px solid ${colors.green}20`,
                                            borderRadius: 7,
                                        }}
                                    >
                                        <span style={{ fontSize: "0.75rem" }}>✓</span>
                                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: colors.textSub, flex: 1 }}>{f.label}</span>
                                        {f.points !== 0 && (
                                            <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.78rem", fontWeight: 700, color: colors.green }}>
                                                +{f.points}
                                            </span>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Negative factors */}
                        {negatives.length > 0 && (
                            <div>
                                <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.6rem", color: colors.red, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                                    ▼ Deductions
                                </div>
                                {negatives.map((f, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            padding: "8px 12px", marginBottom: 4,
                                            background: colors.redSoft,
                                            border: `1px solid ${colors.red}20`,
                                            borderRadius: 7,
                                        }}
                                    >
                                        <span style={{ fontSize: "0.75rem" }}>✕</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: colors.textSub }}>{f.label}</div>
                                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", color: colors.textMuted }}>{f.desc}</div>
                                        </div>
                                        <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.78rem", fontWeight: 700, color: colors.red }}>
                                            {f.points}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Final score */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginTop: 12, paddingTop: 12,
                            borderTop: `2px solid ${gradeColor}30`,
                        }}>
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700, color: colors.text }}>
                                Final Score
                            </span>
                            <span style={{ fontFamily: "var(--font-accent)", fontSize: "1.4rem", fontWeight: 900, color: gradeColor }}>
                                {result.score}/100
                            </span>
                        </div>
                    </motion.div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "20px" }}
                        >
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.92rem", fontWeight: 700, color: colors.text, marginBottom: 16 }}>
                                🎯 How to Improve Your Score
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {recommendations.map(({ issue, action }, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.35 + i * 0.06 }}
                                        style={{
                                            display: "flex", gap: 12,
                                            padding: "12px 14px",
                                            background: colors.bgSurface,
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 10,
                                        }}
                                    >
                                        <span style={{
                                            fontFamily: "var(--font-accent)", fontSize: "0.65rem",
                                            color: colors.accent, background: colors.accentSoft,
                                            padding: "2px 7px", borderRadius: 4, fontWeight: 700,
                                            flexShrink: 0, marginTop: 1, height: "fit-content",
                                        }}>
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div>
                                            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", fontWeight: 600, color: colors.red, marginBottom: 3 }}>
                                                {issue}
                                            </div>
                                            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: colors.textSub, lineHeight: 1.5 }}>
                                                {action}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Perfect score message */}
                    {result.score >= 90 && negatives.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                padding: "24px", textAlign: "center",
                                background: colors.greenSoft,
                                border: `1px solid ${colors.green}30`,
                                borderRadius: 16,
                            }}
                        >
                            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🏆</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.green }}>
                                Outstanding Security Posture
                            </div>
                            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: colors.textSub, marginTop: 6 }}>
                                Keep up your scanning habits to maintain this score.
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) { .score-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </motion.div>
    );
}