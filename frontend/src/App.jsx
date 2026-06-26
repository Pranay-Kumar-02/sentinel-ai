import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Loader,
  Zap, Globe, Terminal, Eye, Cpu, Radio, RotateCcw,
  Layers, Activity, Database, Wifi, Server, AlertCircle,
  TrendingUp, Map, Search, Lock, Crosshair, Radar,
  FileText, ChevronDown, ChevronUp, Copy,
  Download, Printer, History, BarChart2, Info,
  Settings, Link, Smartphone, Mail, Hash, AlignLeft,
  Clock, Slash, Upload, Image, QrCode, File, X, FileSearch,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

// ── HOOKS ──────────────────────────────────────────────────────────────────────
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  const setValue = value => {
    try {
      const v = value instanceof Function ? value(storedValue) : value;
      setStoredValue(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) { console.error(e); }
  };
  return [storedValue, setValue];
}

// ── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  cyber: {
    name: "Cyber Dark", icon: "⚡",
    bg: "#03070f", bgCard: "rgba(8,13,26,0.95)", bgInput: "#020508",
    border: "rgba(0,212,255,0.14)", borderHover: "rgba(0,212,255,0.4)",
    accent: "#00d4ff", accent2: "#6366f1", accent3: "#00ff88",
    text: "#e2e8f0", muted: "#64748b", dimmed: "#1e293b",
    navBg: "rgba(3,7,15,0.92)",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    gradientSoft: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15))",
  },
  matrix: {
    name: "Matrix", icon: "🟢",
    bg: "#000800", bgCard: "rgba(0,18,4,0.95)", bgInput: "#000500",
    border: "rgba(0,255,65,0.18)", borderHover: "rgba(0,255,65,0.45)",
    accent: "#00ff41", accent2: "#7dff9d", accent3: "#00cc33",
    text: "#d8ffe2", muted: "#4a7a55", dimmed: "#0d2e15",
    navBg: "rgba(0,8,0,0.95)",
    gradient: "linear-gradient(135deg, #00ff41 0%, #7dff9d 100%)",
    gradientSoft: "linear-gradient(135deg, rgba(0,255,65,0.1), rgba(125,255,157,0.1))",
  },
  blood: {
    name: "Blood Red", icon: "🔴",
    bg: "#0a0000", bgCard: "rgba(20,0,0,0.95)", bgInput: "#060000",
    border: "rgba(255,30,30,0.16)", borderHover: "rgba(255,30,30,0.45)",
    accent: "#ff1e1e", accent2: "#ff6b35", accent3: "#ff8800",
    text: "#ffe0e0", muted: "#8b4444", dimmed: "#2d0000",
    navBg: "rgba(10,0,0,0.95)",
    gradient: "linear-gradient(135deg, #ff1e1e 0%, #ff6b35 100%)",
    gradientSoft: "linear-gradient(135deg, rgba(255,30,30,0.1), rgba(255,107,53,0.1))",
  },
  ghost: {
    name: "Ghost White", icon: "👻",
    bg: "#f0f4f8", bgCard: "rgba(255,255,255,0.97)", bgInput: "#f8fafc",
    border: "rgba(99,102,241,0.18)", borderHover: "rgba(99,102,241,0.45)",
    accent: "#6366f1", accent2: "#8b5cf6", accent3: "#06b6d4",
    text: "#0f172a", muted: "#64748b", dimmed: "#e2e8f0",
    navBg: "rgba(240,244,248,0.95)",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    gradientSoft: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))",
  },
  gold: {
    name: "Sovereign Gold", icon: "👑",
    bg: "#080600", bgCard: "rgba(16,12,0,0.95)", bgInput: "#060500",
    border: "rgba(255,184,0,0.16)", borderHover: "rgba(255,184,0,0.45)",
    accent: "#ffb800", accent2: "#ff8c00", accent3: "#ffd700",
    text: "#fff8e0", muted: "#8b7040", dimmed: "#2a2000",
    navBg: "rgba(8,6,0,0.95)",
    gradient: "linear-gradient(135deg, #ffb800 0%, #ff8c00 100%)",
    gradientSoft: "linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,140,0,0.1))",
  },
};

const VERDICT_CONFIG = {
  SAFE: { color: "#00ff88", bg: "rgba(0,255,136,0.05)", border: "rgba(0,255,136,0.2)", glow: "rgba(0,255,136,0.15)", icon: CheckCircle, label: "SAFE" },
  SUSPICIOUS: { color: "#ffb800", bg: "rgba(255,184,0,0.05)", border: "rgba(255,184,0,0.2)", glow: "rgba(255,184,0,0.15)", icon: AlertTriangle, label: "SUSPICIOUS" },
  DANGEROUS: { color: "#ff4444", bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.25)", glow: "rgba(255,68,68,0.2)", icon: XCircle, label: "DANGEROUS" },
  CRITICAL: { color: "#ff0033", bg: "rgba(255,0,51,0.07)", border: "rgba(255,0,51,0.4)", glow: "rgba(255,0,51,0.25)", icon: XCircle, label: "CRITICAL" },
  UNKNOWN: { color: "#64748b", bg: "rgba(100,116,139,0.05)", border: "rgba(100,116,139,0.2)", glow: "rgba(100,116,139,0.1)", icon: Shield, label: "UNKNOWN" },
};

// ── UTILITIES ──────────────────────────────────────────────────────────────────
const maskEmail = e => { if (!e) return ""; const [n, d] = e.split("@"); return d ? `${n.substring(0, 2)}***@${d}` : e; };
const maskPhone = p => { if (!p) return ""; const s = String(p); return s.length > 4 ? `+** **** **${s.slice(-4)}` : s; };
const extractDomain = u => { try { return new URL(u.startsWith("http") ? u : `https://${u}`).hostname; } catch { return u.split("/")[0]; } };
const copyToClipboard = (text, msg = "Copied!") => { navigator.clipboard.writeText(text); toast.success(msg); };
const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast.success("Downloaded JSON Report");
};

// ── RISK SCORE ─────────────────────────────────────────────────────────────────
const calculateRiskScore = (data) => {
  let score = 0;
  const contributions = [];
  const pre = data?.pre_analysis || {};
  const ai = data?.ai_analysis || {};
  const osintList = data?.osint || data?.osint_results || data?.osint_report || data?.url_intelligence || data?.urls || [];
  const extracted = data?.auto_extracted || {};
  const verdict = data?.master_verdict || data?.summary?.verdict || "UNKNOWN";

  if (pre.urgency?.urgency_score > 0) {
    const pts = Math.min(20, (pre.urgency.urgency_score / 100) * 20);
    score += pts; contributions.push({ label: "Urgency Indicators", value: pts.toFixed(1), color: "#ffb800" });
  }
  if (pre.impersonation?.impersonation_detected) {
    score += 20; contributions.push({ label: "Brand Impersonation", value: 20, color: "#a78bfa" });
  }
  if (verdict === "CRITICAL") { score += 20; contributions.push({ label: "AI Severity (Critical)", value: 20, color: "#ff0033" }); }
  else if (verdict === "DANGEROUS") { score += 15; contributions.push({ label: "AI Severity (Dangerous)", value: 15, color: "#ff4444" }); }
  else if (verdict === "SUSPICIOUS") { score += 10; contributions.push({ label: "AI Severity (Suspicious)", value: 10, color: "#ffb800" }); }
  else if (verdict !== "SAFE") { score += 5; contributions.push({ label: "AI Severity (Unknown)", value: 5, color: "#64748b" }); }

  if (extracted.urls?.length > 0) {
    const pts = Math.min(10, extracted.urls.length * 5);
    score += pts; contributions.push({ label: "Embedded Links", value: pts, color: "#38bdf8" });
  }

  let osintRisk = 0, vtPts = 0, sbPts = 0, typoPts = 0;
  if (Array.isArray(osintList)) {
    osintList.forEach(o => {
      if (o.risk_score > osintRisk) osintRisk = o.risk_score;
      if (o.virustotal?.malicious > 0) vtPts = 15;
      if (o.safe_browsing?.is_dangerous) sbPts = 15;
      if (o.typosquatting?.is_typosquatting) typoPts = 15;
    });
  }
  if (osintRisk > 0) { const pts = Math.min(25, (osintRisk / 100) * 25); score += pts; contributions.push({ label: "Domain OSINT Risk", value: pts.toFixed(1), color: "#00d4ff" }); }
  if (vtPts > 0) { score += vtPts; contributions.push({ label: "VirusTotal Detection", value: vtPts, color: "#ff4444" }); }
  if (sbPts > 0) { score += sbPts; contributions.push({ label: "Safe Browsing Flag", value: sbPts, color: "#ff0033" }); }
  if (typoPts > 0) { score += typoPts; contributions.push({ label: "Typosquatting", value: typoPts, color: "#a78bfa" }); }

  const total = Math.min(100, Math.round(score));
  const color = total >= 80 ? "#ff0033" : total >= 60 ? "#ff4444" : total >= 30 ? "#ffb800" : "#00ff88";
  return { total, contributions, color };
};

// ── VISUAL COMPONENTS ──────────────────────────────────────────────────────────
function Particles({ theme }) {
  const particles = useRef(Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5, duration: Math.random() * 25 + 15,
    delay: Math.random() * 12, opacity: Math.random() * 0.35 + 0.05,
    drift: Math.random() * 50 - 25,
  }))).current;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden no-print" style={{ zIndex: 0 }}>
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: theme.accent, opacity: p.opacity, filter: `blur(${p.size > 1.5 ? 0.5 : 0}px)` }}
          animate={{ y: [0, -100, 0], x: [0, p.drift, 0], opacity: [p.opacity, p.opacity * 0.1, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function HexGrid({ theme }) {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none no-print" style={{ zIndex: 0 }}>
      <defs>
        <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon points="30,2 56,15 56,37 30,50 4,37 4,15" fill="none" stroke={theme.accent} strokeWidth="0.5" opacity="0.18" />
        </pattern>
        <radialGradient id="hfade" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopOpacity="0" stopColor="black" />
          <stop offset="100%" stopOpacity="1" stopColor="black" />
        </radialGradient>
        <mask id="hmask"><rect width="100%" height="100%" fill="white" /><rect width="100%" height="100%" fill="url(#hfade)" /></mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" mask="url(#hmask)" />
    </svg>
  );
}

function ScanLine({ theme }) {
  return (
    <motion.div className="fixed left-0 right-0 h-px pointer-events-none no-print"
      style={{ background: `linear-gradient(90deg,transparent,${theme.accent}70 30%,${theme.accent} 50%,${theme.accent}70 70%,transparent)`, zIndex: 2, boxShadow: `0 0 16px ${theme.accent}` }}
      initial={{ top: "-2px" }} animate={{ top: "102vh" }}
      transition={{ duration: 7, repeat: Infinity, ease: "linear" }} />
  );
}

function MatrixRain({ theme }) {
  const ref = useRef(null);
  useEffect(() => {
    if (theme.name !== "Matrix") return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const cols = Math.floor(c.width / 16), drops = Array(cols).fill(1);
    const chars = "アイウエオSENTINELAI01ΩΨΦ";
    const draw = () => {
      ctx.fillStyle = "rgba(0,8,0,0.048)"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = "13px JetBrains Mono,monospace";
      drops.forEach((y, i) => {
        ctx.fillStyle = i % 5 === 0 ? "#ffffff" : "#00ff41";
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
        if (y * 16 > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const iv = setInterval(draw, 42);
    return () => { clearInterval(iv); window.removeEventListener("resize", resize); };
  }, [theme]);
  if (theme.name !== "Matrix") return null;
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none no-print" style={{ zIndex: 0, opacity: 0.13 }} />;
}

function GlitchText({ text, theme }) {
  const [g, setG] = useState(false);
  useEffect(() => {
    const t = setInterval(() => { setG(true); setTimeout(() => setG(false), 180); }, 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block">
      {g && <>
        <span className="absolute inset-0 no-print" style={{ color: "#ff0033", clipPath: "polygon(0 15%,100% 15%,100% 45%,0 45%)", transform: "translateX(-3px)", opacity: 0.85 }}>{text}</span>
        <span className="absolute inset-0 no-print" style={{ color: "#00d4ff", clipPath: "polygon(0 55%,100% 55%,100% 85%,0 85%)", transform: "translateX(3px)", opacity: 0.85 }}>{text}</span>
      </>}
      <span style={{ color: theme.accent }}>{text}</span>
    </span>
  );
}

function Counter({ value, duration = 1100 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / duration, 1); setN(Math.round((1 - Math.pow(1 - p, 3)) * value)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n}</>;
}

function RadarPulse({ color, size = 100, icon: Icon = Shield }) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      {[0.38, 0.62, 0.88].map((s, i) => (
        <motion.div key={i} className="absolute rounded-full border no-print"
          style={{ width: size * s, height: size * s, borderColor: color }}
          animate={{ scale: [1, 1.5], opacity: [0.55, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }} />
      ))}
      <div className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: size * 0.36, height: size * 0.36, background: `${color}16`, border: `2px solid ${color}55`, boxShadow: `0 0 20px ${color}30` }}>
        <Icon size={size * 0.17} style={{ color }} />
      </div>
    </div>
  );
}

function ShimmerBar({ score, color, height = 5 }) {
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height, background: "rgba(255,255,255,0.06)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg,${color}55,${color})` }}
        initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div className="absolute inset-y-0 w-20 rounded-full no-print"
        style={{ background: `linear-gradient(90deg,transparent,${color}45,transparent)` }}
        animate={{ left: ["-15%", "115%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }} />
    </div>
  );
}

function CircularScore({ score, color, size = 120 }) {
  const sw = 8, r = (size - sw) / 2, circ = r * 2 * Math.PI, offset = circ - (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums" style={{ color }}><Counter value={score} /></span>
        <span className="text-[10px] font-mono opacity-60">/ 100</span>
      </div>
    </div>
  );
}

function Chip({ label, color, small, onClick }) {
  const interactive = !!onClick;
  return (
    <motion.button whileHover={interactive ? { scale: 1.05 } : { scale: 1 }} whileTap={interactive ? { scale: 0.95 } : {}}
      onClick={interactive ? onClick : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg font-mono font-semibold break-all ${small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"} ${interactive ? "cursor-pointer hover:brightness-125" : "cursor-default"}`}
      style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>
      {label}
      {interactive && <Copy size={10} style={{ opacity: 0.7 }} />}
    </motion.button>
  );
}

function Block({ title, icon: Icon, color, children, delay = 0, theme, fullWidth }) {
  const [h, setH] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ${fullWidth ? "col-span-full" : ""}`}
      style={{ background: theme.bgCard, border: `1px solid ${h ? color + "40" : theme.border}`, boxShadow: h ? `0 0 35px ${color}12` : "none" }}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}15` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function ThemeSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative no-print">
      <motion.button whileHover={{ scale: 1.03 }} onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono"
        style={{ background: current.bgCard, border: `1px solid ${current.border}`, color: current.accent }}>
        <Layers size={11} /> {current.name} <ChevronDown size={9} style={{ opacity: 0.6 }} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.94 }}
            className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden z-50 min-w-44"
            style={{ background: "#0a0f1e", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 70px rgba(0,0,0,0.7)" }}>
            <div className="px-4 py-2.5 border-b border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Select Theme</span>
            </div>
            {Object.entries(THEMES).map(([k, t]) => (
              <button key={k} onClick={() => { onChange(t); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono text-left hover:bg-white/5 transition-colors"
                style={{ color: t.accent }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }} />
                <span>{t.icon} {t.name}</span>
                {current.name === t.name && <span className="ml-auto text-[9px] opacity-60">ACTIVE</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, theme }) {
  const [h, setH] = useState(false);
  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="rounded-xl p-4 cursor-default transition-all duration-300"
      style={{ background: theme.bgCard, border: `1px solid ${h ? color + "40" : theme.border}`, boxShadow: h ? `0 8px 35px ${color}15` : "none" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}14` }}><Icon size={12} style={{ color }} /></div>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.muted }}>{label}</span>
      </div>
      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] mt-0.5 font-mono" style={{ color: theme.muted }}>{sub}</div>}
    </motion.div>
  );
}

function TerminalLog({ logs, loading, theme }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  return (
    <AnimatePresence>
      {(loading || logs.length > 0) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
          className="rounded-2xl overflow-hidden no-print"
          style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: theme.border }}>
            <Terminal size={11} style={{ color: theme.accent }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.muted }}>sentinel.log</span>
            <div className="ml-auto flex items-center gap-1.5">
              {loading && <>
                <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }}
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
                <span className="text-[10px] font-mono" style={{ color: theme.accent }}>PROCESSING</span>
              </>}
            </div>
          </div>
          <div ref={ref} className="p-4 space-y-1.5 max-h-40 overflow-y-auto">
            {logs.map(l => (
              <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 font-mono text-xs">
                <span className="shrink-0 font-bold" style={{ color: l.color, minWidth: 76 }}>[{l.prefix}]</span>
                <span style={{ color: theme.muted }}>{l.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── ATTACK CHAIN ───────────────────────────────────────────────────────────────
function AttackChain({ result, theme }) {
  if (!result) return null;
  const chain = [{ label: "Input Intercepted", active: true, icon: Hash }];
  const pre = result?.pre_analysis || {};
  const urls = result?.auto_extracted?.urls || [];
  const osint = result?.osint || result?.osint_results || [];
  const verdict = result?.master_verdict || result?.summary?.verdict;

  if (pre.urgency?.is_high_urgency) chain.push({ label: "Urgency Triggered", active: true, icon: AlertCircle, color: "#ffb800" });
  if (pre.impersonation?.impersonation_detected) chain.push({ label: "Impersonation", active: true, icon: Eye, color: "#a78bfa" });
  if (urls.length > 0) chain.push({ label: "Links Found", active: true, icon: Link, color: "#38bdf8" });
  const maliciousDomain = Array.isArray(osint) && osint.some(o => o.risk_score > 50 || o.virustotal?.malicious > 0 || o.safe_browsing?.is_dangerous);
  if (maliciousDomain) chain.push({ label: "Malicious Domain", active: true, icon: Globe, color: "#ff4444" });
  if (verdict === "CRITICAL" || verdict === "DANGEROUS") chain.push({ label: "Attack Prevented", active: true, icon: Shield, color: "#00ff88" });
  else if (verdict === "SUSPICIOUS") chain.push({ label: "Caution Advised", active: true, icon: AlertTriangle, color: "#ffb800" });
  else chain.push({ label: "Safe Execution", active: true, icon: CheckCircle, color: "#00ff88" });

  return (
    <Block title="Kill Chain Analysis" icon={Crosshair} color={theme.accent} theme={theme} fullWidth>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
        {chain.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === chain.length - 1;
          const color = step.color || theme.accent;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-2 w-full sm:w-auto relative">
                <div className="relative p-3 rounded-xl z-10" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={16} style={{ color }} />
                  <div className="absolute inset-0 rounded-xl" style={{ boxShadow: `0 0 15px ${color}20` }} />
                </div>
                <span className="text-[10px] font-mono text-center max-w-[80px]" style={{ color: theme.text }}>{step.label}</span>
              </div>
              {!isLast && (
                <div className="hidden sm:block flex-1 h-px relative mx-2">
                  <div className="absolute inset-0" style={{ background: `linear-gradient(90deg,${color}20,${chain[i + 1]?.color || theme.accent}50)` }} />
                  <motion.div className="absolute top-0 h-[2px] w-8 bg-white opacity-50 blur-[1px]"
                    animate={{ left: ["0%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Block>
  );
}

// ── LIVE ENGINE GRID ───────────────────────────────────────────────────────────
function LiveEngineGrid({ theme, states }) {
  const engines = [
    { id: "parser", name: "Input Parser", icon: FileText },
    { id: "ioc", name: "IOC Extractor", icon: Search },
    { id: "urgency", name: "Urgency Detector", icon: Zap },
    { id: "brand", name: "Brand Impersonation", icon: Eye },
    { id: "url", name: "URL Intelligence", icon: Globe },
    { id: "typo", name: "Typosquatting", icon: Crosshair },
    { id: "vt", name: "VirusTotal", icon: Activity },
    { id: "safe", name: "Safe Browsing", icon: Lock },
    { id: "llm", name: "LLM Threat Reasoner", icon: Cpu },
    { id: "mitre", name: "MITRE ATT&CK", icon: TrendingUp },
  ];
  return (
    <Block title="Engine Telemetry" icon={Database} color={theme.accent} theme={theme} fullWidth>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2">
        {engines.map(eng => {
          const state = states[eng.id] || "WAITING";
          let color = theme.muted, bg = "transparent", badge = "WAIT";
          if (state === "SCANNING") { color = theme.accent; bg = `${theme.accent}10`; badge = "RUN"; }
          if (state === "COMPLETE") { color = "#00ff88"; bg = "rgba(0,255,136,0.1)"; badge = "OK"; }
          if (state === "LIMITED") { color = "#ffb800"; bg = "rgba(255,184,0,0.1)"; badge = "LMT"; }
          if (state === "UNAVAILABLE") { color = "#ff4444"; bg = "rgba(255,68,68,0.1)"; badge = "N/A"; }
          return (
            <div key={eng.id} className="p-3 rounded-xl border flex flex-col justify-between gap-2 transition-colors"
              style={{ background: theme.bgInput, borderColor: state === "SCANNING" ? `${theme.accent}50` : theme.border }}>
              <div className="flex justify-between items-start">
                <eng.icon size={14} style={{ color }} className={state === "SCANNING" ? "animate-pulse" : ""} />
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: bg, color, border: `1px solid ${color}30` }}>{badge}</span>
              </div>
              <span className="text-[10px] font-mono leading-tight" style={{ color: state === "WAITING" ? theme.muted : theme.text }}>{eng.name}</span>
            </div>
          );
        })}
      </div>
    </Block>
  );
}

// ── OSINT PANEL ────────────────────────────────────────────────────────────────
function OSINTPanel({ data, theme }) {
  const [expanded, setExpanded] = useState(true);
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-6 rounded-2xl border border-dashed" style={{ borderColor: theme.border, background: theme.bgInput }}>
        <div className="text-center space-y-2">
          <Radar size={20} className="mx-auto" style={{ color: theme.muted }} />
          <div className="text-xs font-mono" style={{ color: theme.muted }}>No OSINT data available for this scan.</div>
        </div>
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-full">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 transition-all"
        style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderBottom: expanded ? "none" : undefined, borderRadius: expanded ? "1rem 1rem 0 0" : "1rem" }}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: "rgba(0,212,255,0.12)" }}>
            <Radar size={12} style={{ color: theme.accent }} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
            OSINT Intelligence — {data.length} Domain{data.length > 1 ? "s" : ""}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} style={{ color: theme.muted }} /> : <ChevronDown size={14} style={{ color: theme.muted }} />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-b-2xl overflow-hidden"
            style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderTop: "none" }}>
            <div className="p-5 space-y-6">
              {data.map((osint, idx) => {
                const vr = osint.overall_verdict || osint.verdict || "UNKNOWN";
                const rc = vr === "CRITICAL" ? "#ff0033" : vr === "DANGEROUS" ? "#ff4444" : vr === "SUSPICIOUS" ? "#ffb800" : vr === "SAFE" ? "#00ff88" : "#64748b";
                const rs = osint.risk_score || 0;
                return (
                  <div key={idx} className="space-y-4">
                    {idx > 0 && <div className="border-t" style={{ borderColor: theme.border }} />}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{ background: `${rc}12`, border: `1px solid ${rc}25` }}>
                          <Globe size={18} style={{ color: rc }} />
                        </div>
                        <div>
                          <div className="text-base font-black font-mono" style={{ color: theme.text }}>{osint.domain || osint.url || "Unknown"}</div>
                          <div className="text-[10px] font-mono mt-0.5" style={{ color: theme.muted }}>IP: {osint.ip || "Unresolved"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: `${rc}15`, border: `1px solid ${rc}35`, color: rc }}>{vr}</span>
                        <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: `${rc}10`, border: `1px solid ${rc}25`, color: rc }}>Risk: {rs}/100</span>
                      </div>
                    </div>
                    <ShimmerBar score={rs} color={rc} height={4} />
                    {osint.risk_flags?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {osint.risk_flags.map((flag, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl text-xs font-mono"
                            style={{ background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.15)" }}>
                            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#ff4444" }} />
                            <span style={{ color: theme.text }}>{flag}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* VirusTotal */}
                      <div className="rounded-xl p-4 space-y-2" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
                        <div className="flex items-center gap-2"><Shield size={12} style={{ color: "#ff4444" }} /><span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ff4444" }}>VirusTotal</span></div>
                        {osint.virustotal && !osint.virustotal.error && (osint.virustotal.total || osint.virustotal.total_engines) > 0 ? (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-black tabular-nums" style={{ color: osint.virustotal.malicious > 0 ? "#ff4444" : "#00ff88" }}>{osint.virustotal.malicious || 0}</span>
                              <span className="text-xs font-mono" style={{ color: theme.muted }}>/ {osint.virustotal.total || osint.virustotal.total_engines || 0} engines</span>
                            </div>
                            <ShimmerBar score={((osint.virustotal.malicious || 0) / Math.max((osint.virustotal.total || 1), 1)) * 100} color="#ff4444" height={3} />
                            <div className="flex gap-1.5 flex-wrap pt-1">
                              <Chip label={`${osint.virustotal.malicious || 0} malicious`} color="#ff4444" small />
                              <Chip label={`${osint.virustotal.suspicious || 0} suspicious`} color="#ffb800" small />
                              <Chip label={`${osint.virustotal.harmless || 0} clean`} color="#00ff88" small />
                            </div>
                          </>
                        ) : <div className="pt-2 text-xs font-mono" style={{ color: theme.muted }}>API Unavailable</div>}
                      </div>
                      {/* Safe Browsing */}
                      <div className="rounded-xl p-4 space-y-2" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
                        <div className="flex items-center gap-2"><Lock size={12} style={{ color: "#00ff88" }} /><span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00ff88" }}>Safe Browsing</span></div>
                        {osint.safe_browsing && !osint.safe_browsing.error ? (
                          <>
                            <div className="text-xl font-black" style={{ color: osint.safe_browsing.is_dangerous ? "#ff4444" : "#00ff88" }}>
                              {osint.safe_browsing.is_dangerous ? "THREAT FLAGGED" : "CLEAN"}
                            </div>
                            {osint.safe_browsing.threats?.length > 0 && <div className="flex flex-wrap gap-1 pt-1">{osint.safe_browsing.threats.map((t, i) => <Chip key={i} label={t} color="#ff4444" small />)}</div>}
                          </>
                        ) : <div className="pt-2 text-xs font-mono" style={{ color: theme.muted }}>Unavailable</div>}
                      </div>
                      {/* Typosquatting */}
                      <div className="rounded-xl p-4 space-y-2" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
                        <div className="flex items-center gap-2"><Crosshair size={12} style={{ color: "#a78bfa" }} /><span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Typosquatting</span></div>
                        {osint.typosquatting ? (
                          <>
                            <div className="text-xl font-black" style={{ color: osint.typosquatting.is_typosquatting ? "#ff4444" : "#00ff88" }}>
                              {osint.typosquatting.is_typosquatting ? "DETECTED" : "CLEAN"}
                            </div>
                            {osint.typosquatting.is_typosquatting && (
                              <div className="space-y-1 text-xs font-mono pt-1">
                                <div><span style={{ color: theme.muted }}>Impersonating: </span><span style={{ color: "#ff4444" }}>{osint.typosquatting.matched_brand}</span></div>
                                <div style={{ color: theme.muted }}>{osint.typosquatting.technique}</div>
                              </div>
                            )}
                          </>
                        ) : <div className="pt-2 text-xs font-mono" style={{ color: theme.muted }}>Unavailable</div>}
                      </div>
                      {/* WHOIS */}
                      <div className="rounded-xl p-4 space-y-2" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
                        <div className="flex items-center gap-2"><FileText size={12} style={{ color: "#00d4ff" }} /><span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00d4ff" }}>WHOIS</span></div>
                        {osint.whois && !osint.whois.error ? (
                          <div className="space-y-1.5 text-xs font-mono pt-1">
                            <div className="flex justify-between gap-2"><span style={{ color: theme.muted }}>Registrar</span><span style={{ color: theme.text }} className="truncate max-w-28">{osint.whois.registrar || "—"}</span></div>
                            <div className="flex justify-between"><span style={{ color: theme.muted }}>Created</span><span style={{ color: theme.text }}>{(osint.whois.created || osint.whois.creation_date)?.slice(0, 10) || "—"}</span></div>
                            <div className="flex justify-between"><span style={{ color: theme.muted }}>Country</span><span style={{ color: theme.text }}>{osint.whois.country || "—"}</span></div>
                          </div>
                        ) : <div className="pt-2 text-xs font-mono" style={{ color: theme.muted }}>Unavailable</div>}
                      </div>
                      {/* Geolocation */}
                      <div className="rounded-xl p-4 space-y-2" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
                        <div className="flex items-center gap-2"><Map size={12} style={{ color: "#38bdf8" }} /><span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#38bdf8" }}>IP Geolocation</span></div>
                        {(osint.ip_geolocation && !osint.ip_geolocation.error) ? (() => {
                          const geo = osint.ip_geolocation;
                          return (
                            <div className="space-y-1.5 text-xs font-mono pt-1">
                              <div className="flex justify-between"><span style={{ color: theme.muted }}>Country</span><span style={{ color: theme.text }}>{geo.country || "—"}</span></div>
                              <div className="flex justify-between"><span style={{ color: theme.muted }}>City</span><span style={{ color: theme.text }}>{geo.city || "—"}</span></div>
                              <div className="flex justify-between"><span style={{ color: theme.muted }}>ISP</span><span style={{ color: theme.text }} className="truncate max-w-28">{geo.isp || "—"}</span></div>
                              {geo.risk_flags?.length > 0 && <div className="flex flex-wrap gap-1 pt-1">{geo.risk_flags.map((f, i) => <Chip key={i} label={f} color="#ffb800" small />)}</div>}
                            </div>
                          );
                        })() : <div className="pt-2 text-xs font-mono" style={{ color: theme.muted }}>Unavailable</div>}
                      </div>
                      {/* Domain Age */}
                      {osint.domain_age && osint.domain_age.age_days >= 0 && (
                        <div className="rounded-xl p-4 space-y-2" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
                          <div className="flex items-center gap-2"><Activity size={12} style={{ color: "#ffb800" }} /><span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#ffb800" }}>Domain Age</span></div>
                          <div className="text-xl font-black" style={{ color: osint.domain_age.is_very_new ? "#ff4444" : osint.domain_age.is_new ? "#ffb800" : "#00ff88" }}>{osint.domain_age.age_text}</div>
                          <div className="text-xs font-mono" style={{ color: theme.muted }}>{osint.domain_age.risk}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── FORENSICS UPLOAD ───────────────────────────────────────────────────────────
function ForensicsUpload({ theme, onResult, loading, setLoading, setLogs }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const pushLog = (prefix, text, color) =>
    setLogs(p => [...p.slice(-25), { prefix, text, color, id: Date.now() + Math.random() }]);

  const FILE_TYPES = {
    "image/png": { label: "PNG Image", icon: Image, color: "#00d4ff" },
    "image/jpeg": { label: "JPG Image", icon: Image, color: "#00d4ff" },
    "image/jpg": { label: "JPG Image", icon: Image, color: "#00d4ff" },
    "image/webp": { label: "WebP Image", icon: Image, color: "#00d4ff" },
    "application/pdf": { label: "PDF Document", icon: FileText, color: "#ff4444" },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { label: "Word Doc", icon: File, color: "#ffb800" },
  };

  const handleFile = f => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10MB."); return; }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else { setPreview(null); }
  };

  const analyze = async () => {
    if (!file) { toast.error("Please select a file first."); return; }
    setLoading(true); setLogs([]);
    const ft = FILE_TYPES[file.type] || { label: "File", icon: File, color: "#64748b" };
    const steps = [
      ["INIT", `Loading ${ft.label}: ${file.name}`, theme.accent],
      ["EXTRACT", "Extracting text content and embedded URLs...", "#a78bfa"],
      ["OCR", "Running Tesseract OCR engine...", "#00d4ff"],
      ["PARSE", "Parsing extracted content for threat signals...", "#a78bfa"],
      ["OSINT", "Running OSINT on extracted URLs...", "#00ff88"],
      ["LLM", "AI threat analysis on extracted content...", theme.accent],
      ["REPORT", "Generating forensics threat report...", "#00ff88"],
    ];
    steps.forEach(([p, t, c], i) => setTimeout(() => pushLog(p, t, c), i * 400));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API_URL}/forensics/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onResult(res.data);
      const v = res.data?.master_verdict || "UNKNOWN";
      pushLog("DONE", `Forensics complete — Verdict: ${v}`, v === "SAFE" ? "#00ff88" : "#ff4444");
      if (v === "SAFE") toast.success("✅ No threats found in file.");
      else if (v === "SUSPICIOUS") toast("⚠️ Suspicious content in file!", { icon: "⚠️" });
      else toast.error(`🚨 ${v} threat found in file!`);
    } catch (err) {
      const msg = err.response?.data?.detail || "Forensics analysis failed.";
      pushLog("ERROR", msg, "#ff4444");
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const fi = file ? FILE_TYPES[file.type] : null;
  const FIcon = fi?.icon || File;

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        animate={{ scale: dragOver ? 1.01 : 1 }}
        className="relative rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 overflow-hidden"
        style={{ background: theme.bgCard, border: `2px dashed ${dragOver ? theme.accent : theme.border}`, boxShadow: dragOver ? `0 0 30px ${theme.accent}20` : "none" }}>
        {dragOver && (
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ background: `radial-gradient(ellipse at center, ${theme.accent}10, transparent 70%)` }} />
        )}
        <input ref={fileRef} type="file" className="hidden"
          accept=".png,.jpg,.jpeg,.webp,.pdf,.docx"
          onChange={e => handleFile(e.target.files[0])} />
        {!file ? (
          <div className="space-y-4 relative z-10">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex justify-center">
              <div className="p-4 rounded-2xl" style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}25` }}>
                <Upload size={28} style={{ color: theme.accent }} />
              </div>
            </motion.div>
            <div>
              <p className="text-sm font-bold" style={{ color: theme.text }}>
                Drop file here or <span style={{ color: theme.accent }}>click to browse</span>
              </p>
              <p className="text-xs mt-1 font-mono" style={{ color: theme.muted }}>Screenshot • QR Code • PDF • Word Document</p>
            </div>
            <div className="flex justify-center gap-2 flex-wrap">
              {[["PNG/JPG", Image, "#00d4ff"], ["QR Code", QrCode, "#a78bfa"], ["PDF", FileText, "#ff4444"], ["DOCX", File, "#ffb800"]].map(([label, Icon, color]) => (
                <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono"
                  style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}>
                  <Icon size={10} /> {label}
                </div>
              ))}
            </div>
            <p className="text-[10px] font-mono" style={{ color: theme.muted }}>Max 10MB</p>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {preview && <div className="flex justify-center"><img src={preview} alt="preview" className="max-h-32 rounded-xl object-contain" style={{ border: `1px solid ${theme.border}` }} /></div>}
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: `${fi?.color || theme.accent}12`, border: `1px solid ${fi?.color || theme.accent}25` }}>
                <FIcon size={20} style={{ color: fi?.color || theme.accent }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold truncate max-w-48" style={{ color: theme.text }}>{file.name}</p>
                <p className="text-[11px] font-mono" style={{ color: theme.muted }}>{fi?.label || "File"} • {(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                className="p-1.5 rounded-lg hover:bg-red-500/20" style={{ color: "#ff4444" }}>
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] font-mono" style={{ color: theme.muted }}>Click to change file</p>
          </div>
        )}
      </motion.div>
      {file && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={analyze} disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? "none" : `0 0 30px ${theme.accent}40` }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: loading ? theme.dimmed : theme.gradient, color: loading ? theme.muted : "white", boxShadow: loading ? "none" : `0 0 20px ${theme.accent}25` }}>
          {loading ? <><Loader size={14} className="animate-spin" /> Analyzing File...</> : <><FileSearch size={14} /> Analyze with Sentinel AI</>}
        </motion.button>
      )}
    </div>
  );
}

// ── FORENSICS RESULT ───────────────────────────────────────────────────────────
function ForensicsResult({ data, theme }) {
  if (!data) return null;
  const f = data.forensics || {};
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 space-y-4"
      style={{ background: theme.bgCard, border: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg" style={{ background: `${theme.accent}14` }}><FileSearch size={13} style={{ color: theme.accent }} /></div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>Forensics Extraction Report</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "File Type", value: f.file_type?.toUpperCase() || "—", color: theme.accent },
          { label: "Size", value: `${f.file_size_kb || 0} KB`, color: "#a78bfa" },
          { label: "URLs Found", value: f.extracted_urls?.length || 0, color: "#ff4444" },
          { label: "Characters", value: f.char_count || f.extracted_text?.length || 0, color: "#00ff88" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-3 text-center" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
            <div className="text-lg font-black tabular-nums" style={{ color }}>{value}</div>
            <div className="text-[10px] font-mono mt-0.5" style={{ color: theme.muted }}>{label}</div>
          </div>
        ))}
      </div>
      {f.file_type === "qr" && f.qr_data && (
        <div className="rounded-xl p-3 space-y-1" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#a78bfa" }}>QR Code Data</p>
          <p className="text-sm font-mono break-all" style={{ color: theme.text }}>{f.qr_data}</p>
        </div>
      )}
      {f.extracted_urls?.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#ff4444" }}>Extracted URLs</p>
          <div className="flex flex-wrap gap-1.5">
            {f.extracted_urls.map((url, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg font-mono break-all"
                style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.25)", color: "#ff4444" }}>{url}</span>
            ))}
          </div>
        </div>
      )}
      {f.metadata && Object.values(f.metadata).some(v => v) && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>File Metadata</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(f.metadata).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="text-xs font-mono">
                <span style={{ color: theme.muted }}>{k}: </span>
                <span style={{ color: theme.text }}>{String(v).slice(0, 40)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {f.extracted_text && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.muted }}>Extracted Text Preview</p>
          <div className="rounded-xl p-3 max-h-32 overflow-y-auto" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
            <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap" style={{ color: theme.muted }}>
              {f.extracted_text.slice(0, 500)}{f.extracted_text.length > 500 ? "..." : ""}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── INTELLIGENCE DASHBOARD ─────────────────────────────────────────────────────
function IntelligenceDashboard({ history, theme }) {
  if (!history || history.length === 0) return (
    <div className="text-center py-20">
      <Database size={40} className="mx-auto mb-4" style={{ color: theme.muted }} />
      <h2 className="text-xl font-bold" style={{ color: theme.text }}>No Intelligence Data</h2>
      <p className="text-sm mt-2" style={{ color: theme.muted }}>Run scans to build session intelligence.</p>
    </div>
  );
  const threats = history.filter(h => h.verdict !== "SAFE" && h.verdict !== "UNKNOWN");
  const critical = history.filter(h => h.verdict === "CRITICAL");
  const avgConf = history.reduce((a, h) => a + (h.confidence || 0), 0) / history.length || 0;
  const typeMap = {};
  threats.forEach(t => { const tp = t.attackType || "Generic Malicious"; typeMap[tp] = (typeMap[tp] || 0) + 1; });
  const topTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Total Scans" value={history.length} color={theme.accent} theme={theme} />
        <StatCard icon={Shield} label="Threats Found" value={threats.length} color="#ffb800" theme={theme} />
        <StatCard icon={XCircle} label="Critical" value={critical.length} color="#ff0033" theme={theme} />
        <StatCard icon={Cpu} label="Avg Confidence" value={`${Math.round(avgConf)}%`} color="#a78bfa" theme={theme} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Block title="Top Attack Vectors" icon={TrendingUp} color="#ffb800" theme={theme}>
          <div className="space-y-3 mt-2">
            {topTypes.length > 0 ? topTypes.map(([type, count], i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span style={{ color: theme.text }}>{type}</span>
                  <span style={{ color: theme.muted }}>{count} triggers</span>
                </div>
                <ShimmerBar score={(count / threats.length) * 100} color="#ffb800" />
              </div>
            )) : <div className="text-xs font-mono" style={{ color: theme.muted }}>No distinct vectors logged yet.</div>}
          </div>
        </Block>
        <Block title="Recent Scan Timeline" icon={Clock} color={theme.accent} theme={theme}>
          <div className="space-y-3 mt-2 max-h-48 overflow-y-auto pr-2">
            {history.slice(0, 5).map(h => {
              const vc = VERDICT_CONFIG[h.verdict] || VERDICT_CONFIG.UNKNOWN;
              return (
                <div key={h.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
                  <div className="p-1.5 rounded-lg" style={{ background: vc.bg }}><vc.icon size={12} style={{ color: vc.color }} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono truncate" style={{ color: theme.text }}>{h.preview}</div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: theme.muted }}>{new Date(h.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Block>
      </div>
    </motion.div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState(THEMES.cyber);
  const [activeTab, setActiveTab] = useState("scan");
  const [analystMode, setAnalystMode] = useLocalStorage("sentinel_analyst_mode", true);
  const [scanHistory, setScanHistory] = useLocalStorage("sentinel_history", []);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [engineStates, setEngineStates] = useState({});

  // Forensics state
  const [forensicsResult, setForensicsResult] = useState(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMouseMove = useCallback(e => { mouseX.set(e.clientX); mouseY.set(e.clientY); }, []);
  const inputRef = useRef(null);

  useEffect(() => {
    const hk = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && input.trim() && !loading && activeTab === "scan") analyze();
      if (e.key === "Escape") { setInput(""); inputRef.current?.blur(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setActiveTab("scan"); setTimeout(() => inputRef.current?.focus(), 50); }
    };
    window.addEventListener("keydown", hk);
    return () => window.removeEventListener("keydown", hk);
  }, [input, loading, activeTab]);

  const pushLog = (prefix, text, color) =>
    setLogs(p => [...p.slice(-25), { prefix, text, color, id: Date.now() + Math.random() }]);

  const updateEngines = updates => setEngineStates(prev => ({ ...prev, ...updates }));

  const analyze = async () => {
    if (!input.trim()) { toast.error("Paste something to analyze."); return; }
    setLoading(true); setResult(null); setLogs([]);

    updateEngines({ parser: "SCANNING", ioc: "WAITING", urgency: "WAITING", brand: "WAITING", url: "WAITING", typo: "WAITING", vt: "WAITING", safe: "WAITING", llm: "WAITING", mitre: "WAITING" });

    const steps = [
      ["INIT", "Initializing Sentinel AI engine v3.0...", theme.accent],
      ["PARSE", "Parsing input — extracting indicators...", "#a78bfa"],
      ["EXTRACT", "Auto-detecting URLs, emails, phone numbers...", "#a78bfa"],
      ["URGENCY", "Running urgency & social engineering detection...", theme.accent],
      ["IMPRSN", "Cross-referencing brand impersonation database...", "#ffb800"],
      ["VT", "Querying VirusTotal — 70+ antivirus engines...", "#ff4444"],
      ["WHOIS", "Running WHOIS & domain age intelligence...", "#38bdf8"],
      ["GEO", "Geolocating IP addresses...", "#38bdf8"],
      ["TYPO", "Checking typosquatting patterns...", "#a78bfa"],
      ["SAFE", "Querying Google Safe Browsing API...", "#00ff88"],
      ["LLM", "Routing to AI reasoning engine...", theme.accent],
      ["MITRE", "Mapping to MITRE ATT&CK framework...", "#ff4444"],
      ["REPORT", "Compiling unified threat intelligence report...", "#00ff88"],
    ];
    steps.forEach(([p, t, c], i) => {
      setTimeout(() => pushLog(p, t, c), i * 300);
      if (i === 1) updateEngines({ parser: "COMPLETE", ioc: "SCANNING" });
      if (i === 3) updateEngines({ ioc: "COMPLETE", urgency: "SCANNING", brand: "SCANNING" });
      if (i === 5) updateEngines({ urgency: "COMPLETE", brand: "COMPLETE", url: "SCANNING", vt: "SCANNING" });
      if (i === 8) updateEngines({ typo: "SCANNING", safe: "SCANNING" });
      if (i === 10) updateEngines({ llm: "SCANNING", mitre: "SCANNING" });
    });

    let finalData = null;
    try {
      const res = await axios.post(`${API_URL}/fullscan`, { text: input, run_osint: true });
      finalData = res.data;
    } catch {
      try {
        const res = await axios.post(`${API_URL}/analyze`, { text: input });
        finalData = { ...res.data, osint_results: [], master_verdict: res.data?.summary?.verdict };
      } catch {
        pushLog("ERROR", "Connection failed — is backend running on :8000?", "#ff4444");
        toast.error("Cannot reach backend.");
        setLoading(false);
        updateEngines({ parser: "UNAVAILABLE", ioc: "UNAVAILABLE", urgency: "UNAVAILABLE", brand: "UNAVAILABLE", url: "UNAVAILABLE", typo: "UNAVAILABLE", vt: "UNAVAILABLE", safe: "UNAVAILABLE", llm: "UNAVAILABLE", mitre: "UNAVAILABLE" });
        return;
      }
    }

    setResult(finalData);
    const extracted2 = finalData?.auto_extracted || finalData?.llm_analysis?.auto_extracted || {};
    const osintArr = finalData?.osint || finalData?.osint_results || [];
    const hasOsint = Array.isArray(osintArr) && osintArr.length > 0;

    updateEngines({
      parser: "COMPLETE", ioc: "COMPLETE",
      urgency: finalData?.pre_analysis?.urgency ? "COMPLETE" : "LIMITED",
      brand: finalData?.pre_analysis?.impersonation ? "COMPLETE" : "LIMITED",
      url: hasOsint ? "COMPLETE" : extracted2.urls?.length ? "LIMITED" : "UNAVAILABLE",
      typo: hasOsint && osintArr.some(o => o.typosquatting) ? "COMPLETE" : "UNAVAILABLE",
      vt: hasOsint && osintArr.some(o => o.virustotal && !o.virustotal.error) ? "COMPLETE" : "UNAVAILABLE",
      safe: hasOsint && osintArr.some(o => o.safe_browsing && !o.safe_browsing.error) ? "COMPLETE" : "UNAVAILABLE",
      llm: finalData?.ai_analysis || finalData?.llm_analysis?.ai_analysis ? "COMPLETE" : "LIMITED",
      mitre: (finalData?.ai_analysis?.mitre_attack || finalData?.llm_analysis?.ai_analysis?.mitre_attack) ? "COMPLETE" : "LIMITED",
    });

    const v = finalData?.master_verdict || finalData?.summary?.verdict || "UNKNOWN";
    pushLog("DONE", `Analysis complete — Verdict: ${v}`, v === "SAFE" ? "#00ff88" : "#ff4444");
    if (v === "SAFE") toast.success("✅ No threats detected.");
    else if (v === "SUSPICIOUS") toast("⚠️ Suspicious content!", { icon: "⚠️" });
    else toast.error(`🚨 ${v} threat detected!`);

    const histEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      preview: input.substring(0, 80).replace(/\n/g, " ") + (input.length > 80 ? "..." : ""),
      verdict: v,
      confidence: finalData?.summary?.confidence || finalData?.llm_analysis?.summary?.confidence || 0,
      attackType: finalData?.summary?.attack_type || finalData?.llm_analysis?.summary?.attack_type || "N/A",
      score: calculateRiskScore(finalData).total,
      result: finalData,
    };
    setScanHistory(prev => [histEntry, ...prev].slice(0, 30));
    setLoading(false);
  };

  const llm = result?.llm_analysis || result || {};
  const ai = llm?.ai_analysis || {};
  const extracted = llm?.auto_extracted || {};
  const pre = llm?.pre_analysis || {};
  const osintList = result?.osint || result?.osint_results || [];
  const verdict = result?.master_verdict || result?.summary?.verdict || null;
  const vc = verdict ? (VERDICT_CONFIG[verdict] || VERDICT_CONFIG.UNKNOWN) : null;
  const VIcon = vc?.icon || Shield;
  const summary = result?.summary || llm?.summary || {};
  const riskData = result ? calculateRiskScore(result) : { total: 0, contributions: [], color: theme.accent };

  const renderNavTab = (id, label, Icon) => {
    const active = activeTab === id;
    return (
      <button onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all no-print ${active ? "opacity-100" : "opacity-50 hover:opacity-100"}`}
        style={{ background: active ? `${theme.accent}15` : "transparent", color: active ? theme.accent : theme.text, border: `1px solid ${active ? `${theme.accent}30` : "transparent"}` }}>
        <Icon size={14} />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: theme.bg, color: theme.text }} onMouseMove={handleMouseMove}>
      <HexGrid theme={theme} />
      <Particles theme={theme} />
      <MatrixRain theme={theme} />
      <ScanLine theme={theme} />

      <motion.div className="fixed pointer-events-none no-print"
        style={{ width: 600, height: 600, marginLeft: -300, marginTop: -300, background: `radial-gradient(circle,${theme.accent}07 0%,transparent 70%)`, x: mouseX, y: mouseY, zIndex: 0 }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none no-print"
        style={{ width: 900, height: 350, background: `radial-gradient(ellipse,${theme.accent}0a 0%,transparent 65%)`, zIndex: 0 }} />

      <Toaster position="top-right" toastOptions={{ style: { background: theme.bgCard, color: theme.text, border: `1px solid ${theme.border}`, fontSize: 13 } }} />

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b no-print" style={{ background: theme.navBg, backdropFilter: "blur(24px)", borderColor: theme.border }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}
              className="relative p-2 rounded-xl" style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}28` }}>
              <div className="absolute inset-0 rounded-xl blur-lg opacity-35" style={{ background: theme.accent }} />
              <Shield size={18} style={{ color: theme.accent, position: "relative" }} />
            </motion.div>
            <div className="hidden sm:block">
              <div className="text-sm font-black tracking-[0.25em]" style={{ color: theme.text }}>
                SENTINEL <GlitchText text="AI" theme={theme} />
              </div>
              <div className="text-[9px] tracking-[0.3em] font-mono" style={{ color: theme.muted }}>CYBER THREAT INTELLIGENCE v3.0</div>
            </div>
          </div>

          <div className="flex gap-1 sm:gap-2">
            {renderNavTab("scan", "Scanner", Search)}
            {renderNavTab("forensics", "Forensics", FileSearch)}
            {renderNavTab("history", "History", History)}
            {renderNavTab("intelligence", "Intel", BarChart2)}
            {renderNavTab("about", "About", Info)}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.16)" }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00ff88" }}
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: "#00ff88" }}>ONLINE</span>
            </div>
            <ThemeSwitcher current={theme} onChange={setTheme} />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── ABOUT TAB ── */}
        {activeTab === "about" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8 py-10">
            <div className="text-center space-y-4">
              <Shield size={64} className="mx-auto" style={{ color: theme.accent }} />
              <h1 className="text-4xl font-black">Sentinel AI v3.0</h1>
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>Enterprise-grade AI Cyber Threat Intelligence Platform combining LLM reasoning, OSINT enrichment, and file forensics to protect individuals and organizations from the full spectrum of digital threats — completely free.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Block title="Phase 1 — LLM Engine" icon={Cpu} color={theme.accent} theme={theme}>
                <ul className="text-sm space-y-1.5 font-mono" style={{ color: theme.muted }}>
                  <li>✓ OpenRouter AI reasoning</li><li>✓ MITRE ATT&CK mapping</li>
                  <li>✓ Urgency detection</li><li>✓ Brand impersonation</li><li>✓ IOC extraction</li>
                </ul>
              </Block>
              <Block title="Phase 2 — OSINT Engine" icon={Radar} color="#a78bfa" theme={theme}>
                <ul className="text-sm space-y-1.5 font-mono" style={{ color: theme.muted }}>
                  <li>✓ VirusTotal (70+ engines)</li><li>✓ Google Safe Browsing</li>
                  <li>✓ IP Geolocation</li><li>✓ WHOIS lookup</li><li>✓ Typosquatting detection</li>
                </ul>
              </Block>
              <Block title="Phase 3 — Forensics Engine" icon={FileSearch} color="#00ff88" theme={theme}>
                <ul className="text-sm space-y-1.5 font-mono" style={{ color: theme.muted }}>
                  <li>✓ Screenshot OCR (Tesseract)</li><li>✓ QR code decoding</li>
                  <li>✓ PDF text & link extraction</li><li>✓ DOCX analysis</li><li>✓ File metadata extraction</li>
                </ul>
              </Block>
              <Block title="Platform Features" icon={Settings} color="#ffb800" theme={theme}>
                <ul className="text-sm space-y-1.5 font-mono" style={{ color: theme.muted }}>
                  <li>✓ 5 UI themes</li><li>✓ Analyst mode toggle</li>
                  <li>✓ Scan history</li><li>✓ Intelligence dashboard</li><li>✓ JSON export</li>
                </ul>
              </Block>
            </div>
          </motion.div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-mono uppercase tracking-widest">Session History</h2>
              <button onClick={() => { if (confirm("Clear all history?")) { setScanHistory([]); toast.success("History cleared"); } }}
                className="text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20">
                Clear All
              </button>
            </div>
            {scanHistory.length === 0 ? (
              <div className="text-center py-20 border border-dashed rounded-2xl" style={{ borderColor: theme.border }}>
                <History size={32} className="mx-auto mb-3" style={{ color: theme.muted }} />
                <p className="text-sm font-mono" style={{ color: theme.muted }}>No scans recorded yet.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {scanHistory.map(h => {
                  const vConf = VERDICT_CONFIG[h.verdict] || VERDICT_CONFIG.UNKNOWN;
                  return (
                    <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl cursor-pointer group transition-all"
                      onClick={() => { setResult(h.result); setActiveTab("scan"); toast("Loaded historical scan"); }}
                      style={{ background: theme.bgCard, border: `1px solid ${theme.border}` }}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full" style={{ background: vConf.bg }}><vConf.icon size={20} style={{ color: vConf.color }} /></div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: `${vConf.color}15`, color: vConf.color }}>{h.verdict}</span>
                            <span className="text-[10px] font-mono" style={{ color: theme.muted }}>{new Date(h.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-sm font-mono truncate max-w-lg" style={{ color: theme.text }}>{h.preview}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className="text-[10px] font-mono" style={{ color: theme.muted }}>Risk Score</div>
                          <div className="text-lg font-black" style={{ color: theme.text }}>{h.score}/100</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); setScanHistory(p => p.filter(x => x.id !== h.id)); }}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── INTELLIGENCE TAB ── */}
        {activeTab === "intelligence" && <IntelligenceDashboard history={scanHistory} theme={theme} />}

        {/* ── FORENSICS TAB ── */}
        {activeTab === "forensics" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center space-y-3 py-4">
              <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
                style={{ background: `${theme.accent}0c`, border: `1px solid ${theme.accent}28`, color: theme.accent }}>
                <FileSearch size={10} /> Sentinel Forensics Engine — Phase 3
              </motion.div>
              <h2 className="text-3xl font-black" style={{ color: theme.text }}>File Forensics <span style={{ color: theme.accent }}>Analysis</span></h2>
              <p className="text-sm max-w-lg mx-auto" style={{ color: theme.muted }}>
                Upload a screenshot, QR code, PDF, or Word document. Sentinel AI extracts all text and URLs, runs full threat analysis and OSINT investigation.
              </p>
            </div>

            <ForensicsUpload
              theme={theme}
              onResult={data => { setForensicsResult(data); }}
              loading={loading}
              setLoading={setLoading}
              setLogs={setLogs}
            />

            <TerminalLog logs={logs} loading={loading} theme={theme} />

            {/* Forensics Results */}
            <AnimatePresence>
              {forensicsResult && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Verdict */}
                  {(() => {
                    const fVerdict = forensicsResult.master_verdict || "UNKNOWN";
                    const fVc = VERDICT_CONFIG[fVerdict] || VERDICT_CONFIG.UNKNOWN;
                    const FVIcon = fVc.icon;
                    const fSummary = forensicsResult.summary || {};
                    return (
                      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl p-6 relative overflow-hidden"
                        style={{ background: fVc.bg, border: `1px solid ${fVc.border}` }}>
                        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 80% 50%,${fVc.color}12 0%,transparent 60%)` }} />
                        <div className="relative flex items-center justify-between gap-6 flex-wrap">
                          <div className="flex items-center gap-6">
                            <RadarPulse color={fVc.color} size={80} icon={FVIcon} />
                            <div>
                              <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: `${fVc.color}90` }}>Forensics Verdict</div>
                              <div className="text-4xl font-black" style={{ color: fVc.color, textShadow: `0 0 30px ${fVc.color}50` }}>{fVerdict}</div>
                              <div className="text-sm mt-1" style={{ color: theme.text }}>{fSummary.attack_type || "Forensics analysis complete"}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: `${fVc.color}90` }}>Confidence</div>
                            <div className="text-4xl font-black tabular-nums" style={{ color: fVc.color }}><Counter value={fSummary.confidence || 0} />%</div>
                          </div>
                        </div>
                        <div className="mt-5"><ShimmerBar score={fSummary.confidence || 0} color={fVc.color} height={5} /></div>
                      </motion.div>
                    );
                  })()}

                  {/* Forensics extraction report */}
                  <ForensicsResult data={forensicsResult} theme={theme} />

                  {/* OSINT on extracted URLs */}
                  {forensicsResult.osint_results?.length > 0 && (
                    <OSINTPanel data={forensicsResult.osint_results} theme={theme} />
                  )}

                  {/* LLM Analysis */}
                  {forensicsResult.llm_analysis && (() => {
                    const fAi = forensicsResult.llm_analysis?.ai_analysis || {};
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { title: "AI Threat Explanation", content: fAi.explanation, color: theme.accent, icon: Cpu },
                          { title: "Technical Analysis", content: fAi.technical_analysis, color: "#a78bfa", icon: Terminal },
                          { title: "MITRE ATT&CK Mapping", content: fAi.mitre_attack, color: "#ffb800", icon: TrendingUp },
                          { title: "Recommended Actions", content: fAi.recommended_actions, color: "#00ff88", icon: Shield },
                          { title: "Indicators of Compromise", content: fAi.indicators_of_compromise, color: "#ff4444", icon: AlertCircle },
                          { title: "Educational Insight", content: fAi.educational_note, color: "#38bdf8", icon: Globe },
                        ].map(({ title, content, color, icon, delay }) => content ? (
                          <Block key={title} title={title} icon={icon} color={color} theme={theme} delay={delay || 0}>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap font-mono" style={{ color: theme.muted }}>{content}</p>
                          </Block>
                        ) : null)}
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── SCANNER TAB ── */}
        {activeTab === "scan" && (
          <div className="space-y-6">
            {/* Hero */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-5 pt-2 pb-4 no-print">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
                style={{ background: `${theme.accent}0c`, border: `1px solid ${theme.accent}28`, color: theme.accent }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Radio size={10} /></motion.div>
                AI-Powered • OSINT Engine • Forensics • Real-Time
              </motion.div>
              <div className="space-y-2">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="text-4xl sm:text-6xl font-black tracking-tight leading-none" style={{ color: theme.text }}>
                  Detect threats before
                </motion.h1>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="text-4xl sm:text-6xl font-black tracking-tight leading-none"
                  style={{ color: theme.accent, textShadow: `0 0 40px ${theme.accent}40` }}>
                  they reach you.
                </motion.h1>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: theme.muted }}>
                Paste any message, URL, email, SMS, or notification. Or use the <span style={{ color: theme.accent }}>Forensics tab</span> to upload screenshots, QR codes, PDFs, and documents.
              </motion.p>
            </motion.div>

            {/* Input Terminal */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl overflow-hidden no-print" style={{ background: theme.bgCard, border: `1px solid ${theme.border}` }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">{["#ff5f57", "#ffbd2e", "#28c840"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}</div>
                  <span className="text-[11px] font-mono ml-2" style={{ color: theme.muted }}>sentinel@ai:~$ analyze_threat --osint --llm</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <Wifi size={10} style={{ color: "#00ff88" }} />
                  <span className="hidden sm:inline" style={{ color: "#00ff88" }}>connected • all engines ready</span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-5 top-4 text-[11px] font-mono select-none" style={{ color: theme.muted }}>&gt;_</div>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") analyze(); }}
                  placeholder={"Paste anything suspicious here...\n\nExamples:\n  • \"Your SBI account is blocked. Verify at http://sbi-secure-login.xyz\"\n  • Full email with headers\n  • WhatsApp or SMS message\n  • Suspicious URL\n\n  Ctrl+Enter to analyze instantly  |  For files, use the Forensics tab ↑"}
                  rows={7} className="w-full pl-12 pr-5 pt-4 pb-4 text-sm font-mono resize-none focus:outline-none"
                  style={{ background: "transparent", color: theme.text, caretColor: theme.accent, lineHeight: 1.8 }} />
                <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: `linear-gradient(transparent,${theme.bgCard}e0)` }} />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t gap-3 sm:gap-0" style={{ borderColor: theme.border }}>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono" style={{ color: theme.muted }}>{input.length}<span style={{ color: theme.dimmed }}>/10000</span></span>
                  <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
                    {[["MSG", theme.accent], ["URL", "#ff4444"], ["EMAIL", "#ffb800"], ["SMS", "#a78bfa"]].map(([t, c]) => (
                      <span key={t} className="px-1.5 py-0.5 rounded" style={{ background: `${c}10`, color: c, border: `1px solid ${c}20` }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {input && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => { setInput(""); setResult(null); setLogs([]); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
                      style={{ color: theme.muted, border: `1px solid ${theme.border}` }}>
                      <RotateCcw size={11} /> Clear
                    </motion.button>
                  )}
                  <motion.button onClick={analyze} disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.03, boxShadow: loading ? "none" : `0 0 35px ${theme.accent}45` }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all w-full sm:w-auto justify-center"
                    style={{ background: loading ? theme.dimmed : theme.gradient, color: loading ? theme.muted : "white", boxShadow: loading ? "none" : `0 0 20px ${theme.accent}30` }}>
                    {loading ? <><Loader size={13} className="animate-spin" /> Analyzing...</> : <><Eye size={13} /> Analyze Threat</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Live Engines */}
            {(loading || (result && Object.values(engineStates).some(s => s === "COMPLETE"))) && (
              <LiveEngineGrid theme={theme} states={engineStates} />
            )}

            {/* Terminal Log */}
            <TerminalLog logs={logs} loading={loading} theme={theme} />

            {/* Results */}
            <AnimatePresence>
              {result && !loading && vc && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pt-4">

                  {/* Report actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4 no-print" style={{ borderColor: theme.border }}>
                    <div className="flex bg-black/20 p-1 rounded-xl border" style={{ borderColor: theme.border }}>
                      <button onClick={() => setAnalystMode(false)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${!analystMode ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>Simple View</button>
                      <button onClick={() => setAnalystMode(true)} className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${analystMode ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}><Settings size={12} /> Analyst Mode</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border hover:bg-white/5 transition-colors"
                        style={{ borderColor: theme.border, color: theme.text }}><Printer size={12} /> Print PDF</button>
                      <button onClick={() => copyToClipboard(ai.explanation || summary.verdict, "Copied!")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border hover:bg-white/5 transition-colors"
                        style={{ borderColor: theme.border, color: theme.text }}><Copy size={12} /> Copy</button>
                      <button onClick={() => downloadJSON(result, `sentinel-report-${Date.now()}.json`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border hover:bg-white/5 transition-colors"
                        style={{ borderColor: theme.border, color: theme.text }}><Download size={12} /> JSON</button>
                    </div>
                  </div>

                  {/* Verdict Hero */}
                  <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
                    style={{ background: vc.bg, border: `1px solid ${vc.border}` }}>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 80% 50%,${vc.color}12 0%,transparent 60%)` }} />
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${vc.color}70,transparent)` }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 flex-wrap">
                      <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <RadarPulse color={vc.color} size={110} icon={VIcon} />
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: `${vc.color}90` }}>Master Threat Verdict</div>
                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                            className="text-5xl sm:text-6xl font-black tracking-tight" style={{ color: vc.color, textShadow: `0 0 30px ${vc.color}50` }}>
                            {verdict}
                          </motion.div>
                          <div className="text-sm mt-2 font-mono" style={{ color: theme.text }}>{ai.attack_type || "Threat analysis complete"}</div>
                          {osintList.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Radar size={11} style={{ color: theme.accent }} />
                              <span className="text-[11px] font-mono" style={{ color: theme.muted }}>{osintList.length} URL{osintList.length > 1 ? "s" : ""} OSINT-scanned</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-8 items-center bg-black/20 p-4 rounded-2xl border" style={{ borderColor: `${vc.color}30` }}>
                        <div className="text-center">
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: `${vc.color}90` }}>AI Confidence</div>
                          <div className="text-4xl font-black tabular-nums" style={{ color: vc.color }}><Counter value={summary.confidence || 0} />%</div>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div className="text-center">
                          <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: `${riskData.color}90` }}>Risk Score</div>
                          <div className="text-4xl font-black tabular-nums" style={{ color: riskData.color }}><Counter value={riskData.total} /></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6"><ShimmerBar score={summary.confidence || 0} color={vc.color} height={6} /></div>
                  </motion.div>

                  {/* Attack Chain */}
                  <AttackChain result={result} theme={theme} />

                  {/* Risk Matrix (Analyst Mode) */}
                  {analystMode && riskData.total > 0 && (
                    <Block title="Risk Score Matrix" icon={Activity} color={riskData.color} theme={theme} fullWidth>
                      <div className="flex flex-col md:flex-row gap-8 items-center mt-2">
                        <CircularScore score={riskData.total} color={riskData.color} />
                        <div className="flex-1 w-full space-y-3">
                          <div className="text-[10px] font-mono mb-2" style={{ color: theme.muted }}>COMPOSITE SCORE BREAKDOWN</div>
                          {riskData.contributions.map((c, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs font-mono w-40 truncate" style={{ color: theme.text }}>{c.label}</span>
                              <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <motion.div className="h-full rounded-full" style={{ background: c.color }}
                                  initial={{ width: 0 }} animate={{ width: `${Math.min(100, (c.value / 25) * 100)}%` }}
                                  transition={{ duration: 1, delay: i * 0.1 }} />
                              </div>
                              <span className="text-xs font-black w-8 text-right tabular-nums" style={{ color: c.color }}>+{c.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Block>
                  )}

                  {/* Simple Mode */}
                  {!analystMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Block title="Threat Summary" icon={Info} color={theme.accent} theme={theme}>
                        <p className="text-sm leading-7" style={{ color: theme.text }}>{ai.explanation || "No explanation provided."}</p>
                      </Block>
                      <Block title="Recommended Actions" icon={Shield} color="#00ff88" theme={theme}>
                        <p className="text-sm leading-7" style={{ color: theme.text }}>{ai.recommended_actions || "Proceed with caution."}</p>
                      </Block>
                    </div>
                  )}

                  {/* IOC Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { title: "URLs & Domains", items: extracted.urls, color: "#ff4444", icon: Globe, isUrl: true },
                      { title: "Email Addresses", items: extracted.emails, color: "#ffb800", icon: Mail, isEmail: true },
                      { title: "Phone Numbers", items: extracted.phone_numbers, color: "#a78bfa", icon: Smartphone, isPhone: true },
                    ].map(({ title, items, color, icon, isUrl, isEmail, isPhone }) => (
                      <Block key={title} title={`${title} (${items?.length || 0})`} icon={icon} color={color} theme={theme} delay={0.1}>
                        <div className="flex flex-col gap-2 min-h-[40px]">
                          {items?.length ? items.map((it, i) => {
                            let display = it;
                            if (!analystMode && isEmail) display = maskEmail(it);
                            if (!analystMode && isPhone) display = maskPhone(it);
                            return (
                              <div key={i} className="flex flex-col gap-1 items-start">
                                <Chip label={display} color={color} onClick={() => copyToClipboard(it, `Copied!`)} />
                                {isUrl && analystMode && <span className="text-[9px] font-mono opacity-60 ml-1 flex items-center gap-1"><Slash size={8} />{extractDomain(it)}</span>}
                              </div>
                            );
                          }) : <span className="text-xs font-mono py-2" style={{ color: theme.muted }}>None detected</span>}
                        </div>
                      </Block>
                    ))}
                  </div>

                  {/* Analyst Mode Deep Dive */}
                  {analystMode && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Block title="Urgency & Social Engineering" icon={Zap} color="#ffb800" theme={theme} delay={0.15}>
                          <div className="flex items-baseline gap-3 mb-3">
                            <span className="text-3xl font-black tabular-nums" style={{ color: "#ffb800" }}>{pre.urgency?.urgency_score ?? 0}</span>
                            <span className="text-xs font-mono" style={{ color: theme.muted }}>/100</span>
                            {pre.urgency?.is_high_urgency && (
                              <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                                className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                                style={{ background: "rgba(255,184,0,0.14)", borderColor: "rgba(255,184,0,0.3)", color: "#ffb800" }}>
                                HIGH URGENCY
                              </motion.span>
                            )}
                          </div>
                          <ShimmerBar score={pre.urgency?.urgency_score || 0} color="#ffb800" />
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {pre.urgency?.urgency_keywords_found?.length
                              ? pre.urgency.urgency_keywords_found.map((k, i) => <Chip key={i} label={k} color="#ffb800" small />)
                              : <span className="text-xs font-mono" style={{ color: theme.muted }}>No urgency signals</span>}
                          </div>
                        </Block>
                        <Block title="Brand Impersonation Engine" icon={Eye} color="#a78bfa" theme={theme} delay={0.2}>
                          <div className="flex items-center gap-3 mb-4">
                            <motion.div animate={pre.impersonation?.impersonation_detected ? { opacity: [1, 0.4, 1] } : {}} transition={{ duration: 1.2, repeat: Infinity }}
                              className="text-3xl font-black"
                              style={{ color: pre.impersonation?.impersonation_detected ? "#ff4444" : "#00ff88" }}>
                              {pre.impersonation?.impersonation_detected ? "DETECTED" : "CLEAN"}
                            </motion.div>
                            {pre.impersonation?.impersonation_detected && <AlertTriangle size={24} style={{ color: "#ff4444" }} />}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {pre.impersonation?.impersonated_brands?.length
                              ? pre.impersonation.impersonated_brands.map((b, i) => <Chip key={i} label={b.toUpperCase()} color="#a78bfa" />)
                              : <span className="text-xs font-mono" style={{ color: theme.muted }}>No brands impersonated</span>}
                          </div>
                        </Block>
                      </div>

                      <OSINTPanel data={osintList} theme={theme} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { title: "Technical Threat Analysis", content: ai.technical_analysis, color: "#a78bfa", icon: Terminal, delay: 0.3 },
                          { title: "MITRE ATT&CK Framework Mapping", content: ai.mitre_attack, color: "#ffb800", icon: TrendingUp, delay: 0.35 },
                          { title: "AI Threat Explanation", content: ai.explanation, color: theme.accent, icon: Cpu, delay: 0.25 },
                          { title: "Recommended Actions", content: ai.recommended_actions, color: "#00ff88", icon: Shield, delay: 0.45 },
                          { title: "Indicators of Compromise", content: ai.indicators_of_compromise, color: "#ff4444", icon: AlertCircle, delay: 0.4 },
                          { title: "Educational Insights", content: ai.educational_note, color: "#38bdf8", icon: Globe, delay: 0.5 },
                        ].map(({ title, content, color, icon, delay }) => content ? (
                          <Block key={title} title={title} icon={icon} color={color} theme={theme} delay={delay}>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-1 rounded bg-black/10" style={{ color: theme.text }}>{content}</p>
                          </Block>
                        ) : null)}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t mt-20 py-8 no-print" style={{ borderColor: theme.border }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg" style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}28` }}>
              <Shield size={12} style={{ color: theme.accent }} />
            </div>
            <div>
              <div className="text-xs font-bold" style={{ color: theme.accent }}>SENTINEL AI v3.0</div>
              <div className="text-[10px] font-mono" style={{ color: theme.muted }}>Built by Pranay Kumar Vonamala • VIT Vellore • 2025</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: theme.muted }}>
            <span style={{ color: "#00ff88" }}>✓ Phase 1 — LLM Engine</span>
            <span style={{ color: theme.border }}>•</span>
            <span style={{ color: "#00ff88" }}>✓ Phase 2 — OSINT Engine</span>
            <span style={{ color: theme.border }}>•</span>
            <span style={{ color: "#00ff88" }}>✓ Phase 3 — Forensics</span>
            <span style={{ color: theme.border }}>•</span>
            <span style={{ color: theme.accent }}>Phase 4 Coming Soon</span>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700;800&display=swap');
        *{box-sizing:border-box;}
        html{background:${theme.bg};}
        body{margin:0;background:${theme.bg};font-family:'Inter',sans-serif;overflow-x:hidden;}
        .font-mono,textarea,code{font-family:'JetBrains Mono',monospace!important;}
        textarea::placeholder{color:${theme.muted};opacity:0.6;}
        textarea{scrollbar-width:thin;scrollbar-color:${theme.border} transparent;}
        .hide-scroll::-webkit-scrollbar{display:none;}
        .hide-scroll{-ms-overflow-style:none;scrollbar-width:none;}
        ::-webkit-scrollbar{width:6px;height:6px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${theme.border};border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:${theme.accent}70;}
        @media print {
          @page{margin:1cm;}
          body,html{background:white!important;color:black!important;}
          .no-print,nav,footer{display:none!important;}
          *{box-shadow:none!important;text-shadow:none!important;}
          *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}
        }
      `}</style>
    </div>
  );
}