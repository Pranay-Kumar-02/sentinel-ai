// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Personal Security Dashboard (v2 — full redesign)
//
// v1 → v2 changes:
//   - REMOVED the floating "orbit satellite" badges around the ring. Their
//     position was computed via a chained CSS transform
//     (rotate → translate → rotate → translate(-50%,-50%)) whose
//     transform-origin wasn't reset, so the math silently drifted and
//     produced exactly the "stray ring + overlapping badge" bug seen in
//     testing. Replaced with a "Signal Strip" — three connected chips
//     below the ring, positioned with normal flexbox. Zero trig, zero
//     transform-chain fragility, impossible to end up in the wrong place.
//   - Ring is bigger, has tick marks (computed once, inside the same
//     rotated <svg> as the arc — no coordinate-frame conversion needed),
//     a one-shot radar sweep-in on mount, and a soft breathing glow halo.
//   - Ambient background: drifting blurred glow orbs behind the particle
//     field for depth.
//   - Header title reveals word-by-word.
//   - Pillar cards are glass-style with a colored top accent bar and an
//     icon in a glowing badge, with hover lift.
//   - Real data logic (scan engine, HIBP breach check, device checks) is
//     UNCHANGED from v1 — only presentation changed.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { useCursor, CURSOR_STATES } from "../../context/CursorContext";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCAN HISTORY ENGINE — identical logic to SentinelScore.jsx (kept in
//    sync intentionally; see note at bottom of file about extracting this
//    into a shared util).
// ─────────────────────────────────────────────────────────────────────────────
function getLocalData() {
    try {
        const rawHistory = localStorage.getItem("sentinel_scan_history") ?? "[]";
        const history = JSON.parse(rawHistory);
        const lastVisit = localStorage.getItem("sentinel_last_visit");
        const hasCVECheck = localStorage.getItem("sentinel_cve_checked") === "true";
        const hasTyposquat = localStorage.getItem("sentinel_typosquat_checked") === "true";
        const hasQRScan = localStorage.getItem("sentinel_qr_scanned") === "true";
        return { history, lastVisit, hasCVECheck, hasTyposquat, hasQRScan };
    } catch {
        return { history: [], lastVisit: null, hasCVECheck: false, hasTyposquat: false, hasQRScan: false };
    }
}

function calculateScore(data) {
    const { history, lastVisit, hasCVECheck, hasTyposquat, hasQRScan } = data;
    let score = 100;
    const factors = [];
    const now = Date.now();
    const day = 86400000;
    const week = 7 * day;

    const lastVisitTime = lastVisit ? new Date(lastVisit).getTime() : 0;
    const daysSinceVisit = (now - lastVisitTime) / day;

    if (daysSinceVisit <= 7) { score += 5; factors.push({ type: "positive", label: "Active this week", points: +5 }); }

    const recentScans = history.filter(h => (now - new Date(h.timestamp).getTime()) < week * 4);
    if (recentScans.length >= 10) { score += 5; factors.push({ type: "positive", label: "Regular scanning habit", points: +5 }); }

    const recentVerdicts = recentScans.map(h => h.verdict?.toUpperCase());
    const allClean = recentVerdicts.length > 0 && recentVerdicts.every(v => v === "SAFE" || v === "CLEAN");
    if (allClean && recentVerdicts.length >= 3) { score += 10; factors.push({ type: "positive", label: "All recent scans clean", points: +10 }); }

    if (hasCVECheck) { score += 5; factors.push({ type: "positive", label: "CVE monitoring active", points: +5 }); }
    if (hasTyposquat) { score += 5; factors.push({ type: "positive", label: "Domain protection active", points: +5 }); }
    if (hasQRScan) { score += 5; factors.push({ type: "positive", label: "QR safety awareness", points: +5 }); }

    const criticalCount = history.filter(h => h.verdict?.toUpperCase() === "CRITICAL").length;
    const dangerousCount = history.filter(h => h.verdict?.toUpperCase() === "DANGEROUS").length;
    const suspiciousCount = history.filter(h => h.verdict?.toUpperCase() === "SUSPICIOUS").length;

    if (criticalCount > 0) { const d = Math.min(criticalCount * 15, 30); score -= d; factors.push({ type: "negative", label: `${criticalCount} critical threat(s) in history`, points: -d }); }
    if (dangerousCount > 0) { const d = Math.min(dangerousCount * 10, 20); score -= d; factors.push({ type: "negative", label: `${dangerousCount} dangerous threat(s) in history`, points: -d }); }
    if (suspiciousCount > 0) { const d = Math.min(suspiciousCount * 5, 15); score -= d; factors.push({ type: "negative", label: `${suspiciousCount} suspicious item(s) in scans`, points: -d }); }

    if (history.length === 0) { score -= 10; factors.push({ type: "negative", label: "No scans performed yet", points: -10 }); }
    else if (daysSinceVisit > 30) { score -= 10; factors.push({ type: "negative", label: "Inactive for 30+ days", points: -10 }); }
    else if (daysSinceVisit > 7) { score -= 5; factors.push({ type: "negative", label: "Inactive this week", points: -5 }); }

    if (!hasCVECheck) { score -= 5; factors.push({ type: "negative", label: "No CVE monitoring", points: -5 }); }
    if (!hasTyposquat) { score -= 5; factors.push({ type: "negative", label: "No domain protection", points: -5 }); }

    score = Math.max(0, Math.min(100, score));

    const grade =
        score >= 90 ? { label: "A+", color: "green" } :
            score >= 80 ? { label: "A", color: "green" } :
                score >= 70 ? { label: "B", color: "teal" } :
                    score >= 60 ? { label: "C", color: "amber" } :
                        score >= 40 ? { label: "D", color: "orange" } :
                            { label: "F", color: "red" };

    return {
        score, grade, factors,
        stats: {
            totalScans: history.length,
            criticalFound: criticalCount,
            dangerousFound: dangerousCount,
            suspiciousFound: suspiciousCount,
            safeFound: history.filter(h => h.verdict?.toUpperCase() === "SAFE" || h.verdict?.toUpperCase() === "CLEAN").length,
            daysSinceVisit: Math.floor(daysSinceVisit),
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PASSWORD BREACH CHECK — HIBP k-anonymity, unchanged from v1.
// ─────────────────────────────────────────────────────────────────────────────
async function sha1Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-1", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function checkPasswordBreach(password) {
    if (!password) return null;
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) throw new Error(`HIBP request failed: ${res.status}`);
    const text = await res.text();
    const line = text.split("\n").find(l => l.startsWith(suffix));
    const count = line ? parseInt(line.split(":")[1].trim(), 10) : 0;
    return { breached: count > 0, count };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DEVICE & BROWSER HARDENING — unchanged from v1.
// ─────────────────────────────────────────────────────────────────────────────
function getDeviceChecks() {
    const ua = navigator.userAgent;
    const isHttps = typeof location !== "undefined" && location.protocol === "https:";
    const dnt = navigator.doNotTrack === "1" || window.doNotTrack === "1";
    const cookiesEnabled = navigator.cookieEnabled;
    let storageAvailable = false;
    try { storageAvailable = typeof Storage !== "undefined" && !!window.localStorage; } catch { storageAvailable = false; }

    let browser = "Unknown browser";
    const edgeMatch = ua.match(/Edg\/([\d.]+)/);
    const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
    const firefoxMatch = ua.match(/Firefox\/([\d.]+)/);
    const safariMatch = ua.match(/Version\/([\d.]+).*Safari/);
    if (edgeMatch) browser = `Edge ${edgeMatch[1].split(".")[0]}`;
    else if (chromeMatch) browser = `Chrome ${chromeMatch[1].split(".")[0]}`;
    else if (firefoxMatch) browser = `Firefox ${firefoxMatch[1].split(".")[0]}`;
    else if (safariMatch) browser = `Safari ${safariMatch[1].split(".")[0]}`;

    return [
        { id: "https", label: "Connection Security", pass: isHttps, detail: isHttps ? "This session is served over HTTPS" : "This session is NOT encrypted (HTTP)" },
        { id: "browser", label: "Browser Detected", pass: true, neutral: true, detail: browser },
        { id: "cookies", label: "Cookie Handling", pass: cookiesEnabled, detail: cookiesEnabled ? "Cookies are enabled" : "Cookies are disabled" },
        { id: "storage", label: "Local Storage", pass: storageAvailable, detail: storageAvailable ? "Available — scan history persists" : "Unavailable — history won't save" },
        { id: "dnt", label: "Do Not Track", pass: dnt, optional: true, detail: dnt ? "Enabled" : "Not enabled (optional)" },
    ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Ambient glow orbs — slow drifting blurred blobs for atmospheric depth.
// ─────────────────────────────────────────────────────────────────────────────
function GlowOrbs({ colors, gradeColor }) {
    const orbs = [
        { color: gradeColor, size: 480, top: "-8%", left: "8%", dur: 22 },
        { color: colors.purple, size: 380, top: "40%", left: "72%", dur: 26 },
        { color: colors.accent, size: 420, top: "70%", left: "-4%", dur: 30 },
    ];
    return (
        <>
            {orbs.map((o, i) => (
                <motion.div
                    key={i}
                    animate={{
                        x: [0, 30, -20, 0],
                        y: [0, -25, 20, 0],
                    }}
                    transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute", top: o.top, left: o.left,
                        width: o.size, height: o.size, borderRadius: "50%",
                        background: `radial-gradient(circle, ${o.color}30 0%, transparent 70%)`,
                        filter: "blur(60px)",
                        pointerEvents: "none",
                    }}
                />
            ))}
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reactive particle field — unchanged mechanics from v1.
// ─────────────────────────────────────────────────────────────────────────────
function RiskParticleField({ colorHex }) {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let width, height;

        function resize() {
            width = canvas.width = canvas.offsetWidth * devicePixelRatio;
            height = canvas.height = canvas.offsetHeight * devicePixelRatio;
        }
        resize();
        window.addEventListener("resize", resize);

        if (particlesRef.current.length === 0) {
            particlesRef.current = Array.from({ length: 50 }, () => ({
                x: Math.random(), y: Math.random(),
                vx: (Math.random() - 0.5) * 0.00028,
                vy: (Math.random() - 0.5) * 0.00028,
                r: Math.random() * 1.6 + 0.6,
                a: Math.random() * 0.4 + 0.15,
            }));
        }

        function tick() {
            ctx.clearRect(0, 0, width, height);
            const pts = particlesRef.current;
            for (const p of pts) {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > 1) p.vx *= -1;
                if (p.y < 0 || p.y > 1) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x * width, p.y * height, p.r * devicePixelRatio, 0, Math.PI * 2);
                ctx.fillStyle = `${colorHex}${Math.round(p.a * 255).toString(16).padStart(2, "0")}`;
                ctx.fill();
            }
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = (pts[i].x - pts[j].x) * width;
                    const dy = (pts[i].y - pts[j].y) * height;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110 * devicePixelRatio) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x * width, pts[i].y * height);
                        ctx.lineTo(pts[j].x * width, pts[j].y * height);
                        ctx.strokeStyle = `${colorHex}0c`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
        return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
    }, [colorHex]);

    return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.75 }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Count-up number.
// ─────────────────────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1500, delay = 500) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let raf;
        const start = performance.now() + delay;
        function tick(now) {
            const elapsed = now - start;
            if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * target));
            if (t < 1) raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration, delay]);
    return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Command Ring v2 — bigger, tick marks (computed inside the SAME rotated
// <svg> as the arc so no coordinate-frame math is needed), breathing glow
// halo, one-shot radar sweep on mount, end-cap dot.
// ─────────────────────────────────────────────────────────────────────────────
function CommandRing({ score, grade, colors }) {
    const gradeColor = colors[grade.color] ?? colors.accent;
    const displayScore = useCountUp(score);
    const [sweepDone, setSweepDone] = useState(false);

    const SIZE = 320;
    const cx = SIZE / 2, cy = SIZE / 2;
    const radius = 122;
    const circ = 2 * Math.PI * radius;
    const arc = circ * 0.75; // 270° visible arc, 90° gap — same technique as before, intentional
    const fill = (score / 100) * arc;

    useEffect(() => {
        const t = setTimeout(() => setSweepDone(true), 2300);
        return () => clearTimeout(t);
    }, []);

    // Tick marks at 0/25/50/75/100 of the score range, generated as points
    // along the SAME 270° sweep (t=0..1 → angle 0..270°), rendered inside
    // the rotated <svg> so they inherit the same 135° rotation as the arc
    // automatically — no manual coordinate conversion required.
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => {
        const angle = (t * 270 * Math.PI) / 180;
        const tickR = radius + 20;
        return {
            t,
            x: cx + tickR * Math.cos(angle),
            y: cy + tickR * Math.sin(angle),
            active: score / 100 >= t - 0.001,
        };
    });

    // End-cap dot position — same parametric approach, sits exactly on the
    // filled arc's terminus.
    const endAngle = ((score / 100) * 270 * Math.PI) / 180;
    const endDot = { x: cx + radius * Math.cos(endAngle), y: cy + radius * Math.sin(endAngle) };

    return (
        <div style={{ position: "relative", width: SIZE, height: SIZE, margin: "0 auto" }}>
            {/* Breathing ambient halo behind the ring */}
            <motion.div
                animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.06, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute", inset: -20, borderRadius: "50%",
                    background: `radial-gradient(circle, ${gradeColor}35 0%, transparent 68%)`,
                    filter: "blur(20px)", pointerEvents: "none",
                }}
            />

            {/* Slow decorative rotating dashed ring for HUD atmosphere */}
            <motion.svg
                width={SIZE} height={SIZE}
                style={{ position: "absolute", inset: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            >
                <circle cx={cx} cy={cy} r={radius + 34} fill="none" stroke={gradeColor} strokeOpacity={0.15}
                    strokeWidth={1} strokeDasharray="1 7" strokeLinecap="round" />
            </motion.svg>

            <svg width={SIZE} height={SIZE} style={{ transform: "rotate(135deg)", position: "absolute", inset: 0 }}>
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke={colors.bgSurface} strokeWidth={16}
                    strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round" />
                <motion.circle
                    cx={cx} cy={cy} r={radius} fill="none" stroke={gradeColor} strokeWidth={16}
                    strokeLinecap="round" strokeDasharray={`${arc} ${circ - arc}`}
                    initial={{ strokeDashoffset: arc }}
                    animate={{ strokeDashoffset: arc - fill }}
                    transition={{ duration: 1.7, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }}
                    style={{ filter: `drop-shadow(0 0 16px ${gradeColor})` }}
                />

                {/* Tick marks — same rotated coordinate frame as the arc */}
                {ticks.map(tk => (
                    <circle key={tk.t} cx={tk.x} cy={tk.y} r={tk.active ? 3 : 2.2}
                        fill={tk.active ? gradeColor : colors.border}
                        opacity={tk.active ? 0.9 : 0.5} />
                ))}

                {/* End-cap pulsing dot at the fill terminus */}
                <motion.circle
                    cx={endDot.x} cy={endDot.y} r={7} fill={gradeColor}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: [1, 1.35, 1] }}
                    transition={{ opacity: { delay: 2 }, scale: { duration: 1.6, repeat: Infinity, delay: 2 } }}
                    style={{ filter: `drop-shadow(0 0 8px ${gradeColor})` }}
                />
            </svg>

            {/* One-shot radar sweep on mount */}
            {!sweepDone && (
                <motion.div
                    initial={{ rotate: 0, opacity: 1 }}
                    animate={{ rotate: 3 * 360, opacity: 0 }}
                    transition={{ duration: 2.1, ease: "easeOut" }}
                    style={{
                        position: "absolute", left: "50%", top: "50%",
                        width: 2, height: radius,
                        background: `linear-gradient(to top, ${gradeColor}, transparent)`,
                        transformOrigin: "50% 100%",
                        translateX: "-50%", translateY: "-100%",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* Center readout */}
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{ fontFamily: "var(--font-accent)", fontSize: "4rem", fontWeight: 900, color: gradeColor, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
                >
                    {displayScore}
                </motion.div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.textMuted, letterSpacing: "0.08em" }}>/ 100</div>
                <motion.div
                    initial={{ opacity: 0, rotateX: -90 }} animate={{ opacity: 1, rotateX: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    style={{ fontFamily: "var(--font-accent)", fontSize: "1.5rem", fontWeight: 800, color: gradeColor, marginTop: 6 }}
                >
                    {grade.label}
                </motion.div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Signal Strip — replaces the buggy floating orbit satellites. Plain
// flexbox row with connecting animated beams. No positional math, cannot
// end up misplaced.
// ─────────────────────────────────────────────────────────────────────────────
function SignalStrip({ pillarScores, colors, gradeColor }) {
    const items = [
        { label: "Scan Health", value: pillarScores.scan, icon: "🛰️" },
        { label: "Password", value: pillarScores.password, icon: "🔐" },
        { label: "Device", value: pillarScores.device, icon: "🖥️" },
    ];
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -6 }}>
            {/* Connecting beam down from the ring */}
            <motion.div
                initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.5 }}
                style={{ width: 1, height: 28, background: `linear-gradient(to bottom, ${gradeColor}80, transparent)`, transformOrigin: "top" }}
            />
            <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                {items.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 14, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.75 + i * 0.12, type: "spring", stiffness: 300, damping: 20 }}
                        whileHover={{ y: -3 }}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 16px", borderRadius: 999,
                            background: colors.bgCard, border: `1px solid ${gradeColor}30`,
                            boxShadow: `0 0 14px ${gradeColor}18`,
                        }}
                    >
                        <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
                        <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.82rem", fontWeight: 800, color: gradeColor, fontVariantNumeric: "tabular-nums" }}>
                            {item.value}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: colors.textMuted }}>{item.label}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Word-by-word headline reveal.
// ─────────────────────────────────────────────────────────────────────────────
function RevealHeadline({ text, colors }) {
    const words = text.split(" ");
    return (
        <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
            fontWeight: 900, letterSpacing: "-0.02em", color: colors.text, margin: "0 0 10px",
        }}>
            {words.map((w, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: "inline-block", marginRight: "0.28em" }}
                >
                    {w}
                </motion.span>
            ))}
        </h1>
    );
}

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// Pillar card v2 — glass background, colored top accent bar, icon in a
// glowing badge, hover lift.
// ─────────────────────────────────────────────────────────────────────────────
function PillarCard({ title, icon, accentColor, colors, children }) {
    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: -5, boxShadow: `0 12px 30px ${accentColor}22` }}
            style={{
                background: `linear-gradient(180deg, ${colors.bgCard}, ${colors.bgCard}dd)`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${colors.border}`,
                borderRadius: 18, padding: "22px", position: "relative", overflow: "hidden",
                transition: "box-shadow 0.25s ease",
            }}
        >
            {/* Top accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${accentColor}18`, border: `1px solid ${accentColor}35`,
                    boxShadow: `0 0 12px ${accentColor}25`, fontSize: "1rem",
                }}>
                    {icon}
                </div>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: colors.text }}>
                    {title}
                </span>
            </div>
            {children}
        </motion.div>
    );
}

function CheckRow({ label, pass, detail, colors, neutral, optional }) {
    const color = neutral ? colors.accent : pass ? colors.green : optional ? colors.amber : colors.red;
    const icon = neutral ? "◆" : pass ? "✓" : "✕";
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
            whileHover={{ x: 2 }}
            style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "9px 12px", borderRadius: 8, marginBottom: 6,
                background: `${color}12`, border: `1px solid ${color}25`,
            }}
        >
            <span style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6rem", color, background: `${color}20`,
            }}>
                {icon}
            </span>
            <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600, color: colors.text }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: colors.textMuted, marginTop: 2 }}>{detail}</div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function PersonalDashboard() {
    const { colors } = useTheme();
    const { setCursor, resetCursor } = useCursor();

    const [scanResult, setScanResult] = useState(null);
    const [deviceChecks, setDeviceChecks] = useState([]);
    const [pwInput, setPwInput] = useState("");
    const [pwChecking, setPwChecking] = useState(false);
    const [pwResult, setPwResult] = useState(null);
    const [pwError, setPwError] = useState(null);

    useEffect(() => {
        setScanResult(calculateScore(getLocalData()));
        setDeviceChecks(getDeviceChecks());
    }, []);

    const handlePasswordCheck = useCallback(async () => {
        if (!pwInput) return;
        setPwChecking(true);
        setPwError(null);
        setPwResult(null);
        try {
            const result = await checkPasswordBreach(pwInput);
            setPwResult(result);
        } catch (e) {
            setPwError("Couldn't reach the breach-check service. Try again in a moment.");
        } finally {
            setPwChecking(false);
        }
    }, [pwInput]);

    const pillarScores = useMemo(() => {
        const scanScore = scanResult ? scanResult.score : 0;
        const deviceScore = deviceChecks.length
            ? Math.round((deviceChecks.filter(c => c.pass || c.neutral).length / deviceChecks.length) * 100)
            : 0;
        const passwordScore = pwResult == null ? "—" : pwResult.breached ? 20 : 100;
        return { scan: scanScore, device: deviceScore, password: passwordScore };
    }, [scanResult, deviceChecks, pwResult]);

    if (!scanResult) {
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

    const gradeColor = colors[scanResult.grade.color] ?? colors.accent;
    const negatives = scanResult.factors.filter(f => f.type === "negative");

    const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };

    return (
        <div style={{ position: "relative", minHeight: "100vh", padding: "88px 32px 60px", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
                <GlowOrbs colors={colors} gradeColor={gradeColor} />
                <RiskParticleField colorHex={gradeColor} />
            </div>

            <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", marginBottom: 20 }}>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "4px 14px", background: colors.accentSoft,
                            border: `1px solid ${colors.accent}30`, borderRadius: 999, marginBottom: 16,
                        }}
                    >
                        <motion.span
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                            style={{ width: 5, height: 5, borderRadius: "50%", background: colors.accent, display: "inline-block" }}
                        />
                        <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.accent }}>
                            Personal Security Command Center
                        </span>
                    </motion.div>

                    <RevealHeadline text="Your Digital Security, At a Glance" colors={colors} />

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                        style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", color: colors.textSub, maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}
                    >
                        Three real signals, live: your scan history, a breach check against real leaked-password data, and your current browser's hardening status.
                    </motion.p>
                </motion.div>

                {/* Command Ring + Signal Strip */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 22 }}
                    style={{ marginBottom: 20 }}
                >
                    <CommandRing score={scanResult.score} grade={scanResult.grade} colors={colors} />
                    <SignalStrip pillarScores={pillarScores} colors={colors} gradeColor={gradeColor} />
                </motion.div>

                {/* Three pillars */}
                <motion.div
                    variants={containerVariants} initial="hidden" animate="show"
                    style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24, marginTop: 40 }}
                    className="pillar-grid"
                >
                    <PillarCard title="Scan History Health" icon="🛰️" accentColor={colors.accent} colors={colors}>
                        <motion.div variants={containerVariants} initial="hidden" animate="show">
                            <CheckRow colors={colors} label="Total scans logged" pass detail={`${scanResult.stats.totalScans} scans in your local history`} neutral />
                            <CheckRow colors={colors} label="Clean results" pass detail={`${scanResult.stats.safeFound} scans came back safe`} />
                            {scanResult.stats.criticalFound > 0 && (
                                <CheckRow colors={colors} label="Critical threats" pass={false} detail={`${scanResult.stats.criticalFound} critical verdict(s) found`} />
                            )}
                            {scanResult.stats.dangerousFound > 0 && (
                                <CheckRow colors={colors} label="Dangerous threats" pass={false} detail={`${scanResult.stats.dangerousFound} dangerous verdict(s) found`} />
                            )}
                            <CheckRow colors={colors} label="Recency" pass={scanResult.stats.daysSinceVisit <= 7}
                                detail={scanResult.stats.daysSinceVisit === 0 ? "Active today" : `Last active ${scanResult.stats.daysSinceVisit} day(s) ago`} />
                        </motion.div>
                    </PillarCard>

                    <PillarCard title="Password Breach Check" icon="🔐" accentColor={colors.purple} colors={colors}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", color: colors.textMuted, lineHeight: 1.5, marginBottom: 12 }}>
                            Checked via HIBP k-anonymity — only 5 characters of a hash are sent. Your real password never leaves this browser.
                        </p>
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                            <input
                                type="password"
                                value={pwInput}
                                onChange={e => setPwInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handlePasswordCheck()}
                                placeholder="Enter a password to check"
                                onMouseEnter={() => setCursor(CURSOR_STATES.TEXT)}
                                onMouseLeave={resetCursor}
                                style={{
                                    flex: 1, padding: "9px 12px", borderRadius: 8,
                                    background: colors.bgSurface, border: `1px solid ${colors.border}`,
                                    color: colors.text, fontFamily: "var(--font-mono)", fontSize: "0.78rem", outline: "none",
                                }}
                            />
                            <motion.button
                                onClick={handlePasswordCheck}
                                disabled={pwChecking || !pwInput}
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onMouseEnter={() => setCursor(CURSOR_STATES.INTERACTIVE, "CHECK")}
                                onMouseLeave={resetCursor}
                                style={{
                                    padding: "9px 16px", borderRadius: 8, border: "none",
                                    background: colors.accent, color: colors.bg, fontWeight: 700,
                                    fontFamily: "var(--font-accent)", fontSize: "0.72rem", cursor: "pointer",
                                    opacity: pwChecking || !pwInput ? 0.5 : 1,
                                }}
                            >
                                {pwChecking ? "…" : "Check"}
                            </motion.button>
                        </div>

                        <AnimatePresence mode="wait">
                            {pwError && (
                                <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: colors.red }}>
                                    {pwError}
                                </motion.div>
                            )}
                            {pwResult && !pwError && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    style={{
                                        padding: "10px 12px", borderRadius: 8,
                                        background: pwResult.breached ? colors.redSoft : colors.greenSoft,
                                        border: `1px solid ${pwResult.breached ? colors.red : colors.green}30`,
                                    }}
                                >
                                    <div style={{ fontFamily: "var(--font-accent)", fontSize: "0.78rem", fontWeight: 700, color: pwResult.breached ? colors.red : colors.green }}>
                                        {pwResult.breached ? `⚠ Found in ${pwResult.count.toLocaleString()} breaches` : "✓ Not found in known breaches"}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", color: colors.textMuted, marginTop: 3 }}>
                                        {pwResult.breached ? "Change this password wherever you use it." : "Still make sure it's unique per account."}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </PillarCard>

                    <PillarCard title="Device & Browser Hardening" icon="🖥️" accentColor={colors.teal ?? colors.accent} colors={colors}>
                        <motion.div variants={containerVariants} initial="hidden" animate="show">
                            {deviceChecks.map(c => (
                                <CheckRow key={c.id} colors={colors} label={c.label} pass={c.pass} detail={c.detail} neutral={c.neutral} optional={c.optional} />
                            ))}
                        </motion.div>
                    </PillarCard>
                </motion.div>

                {/* Priority Actions */}
                {negatives.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        style={{
                            background: `linear-gradient(180deg, ${colors.bgCard}, ${colors.bgCard}dd)`,
                            backdropFilter: "blur(10px)", border: `1px solid ${colors.border}`,
                            borderRadius: 18, padding: "24px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: colors.text }}>
                                🎯 Priority Actions
                            </div>
                            <div style={{
                                fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: colors.red,
                                background: colors.redSoft, border: `1px solid ${colors.red}30`,
                                padding: "3px 10px", borderRadius: 999,
                            }}>
                                {negatives.length} open
                            </div>
                        </div>
                        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {negatives.map((n, i) => (
                                <motion.div
                                    key={i}
                                    variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                                    whileHover={{ x: 3 }}
                                    style={{
                                        display: "flex", gap: 12, alignItems: "center",
                                        padding: "10px 14px", background: colors.bgSurface,
                                        borderLeft: `3px solid ${colors.red}`,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 10,
                                    }}
                                >
                                    <span style={{
                                        fontFamily: "var(--font-accent)", fontSize: "0.65rem", color: colors.accent,
                                        background: colors.accentSoft, padding: "2px 7px", borderRadius: 4, fontWeight: 700,
                                    }}>
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: colors.textSub, flex: 1 }}>{n.label}</span>
                                    <span style={{ fontFamily: "var(--font-accent)", fontSize: "0.76rem", fontWeight: 700, color: colors.red }}>{n.points}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </div>

            <style>{`
                @media (max-width: 900px) { .pillar-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: calculateScore()/getLocalData() are still duplicated from
// SentinelScore.jsx on purpose (drop-in without touching that file). Say
// the word and I'll extract both into src/utils/scoreEngine.js so the two
// pages can never drift out of sync.
// ─────────────────────────────────────────────────────────────────────────────