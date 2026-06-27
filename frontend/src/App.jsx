import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Loader,
  Zap, Globe, Terminal, Eye, Cpu, Radio, RotateCcw,
  Activity, Database, Wifi, Server, AlertCircle,
  TrendingUp, Map, Search, Lock, Crosshair, Radar,
  FileText, ChevronDown, ChevronUp, Copy, Download,
  Printer, History, BarChart2, Info, Settings, Link,
  Smartphone, Mail, Clock, Upload, Image, QrCode,
  File, X, FileSearch, Home, Layers, Menu, ChevronRight,
  Bell, User, BookOpen, Target, Siren, Fingerprint,
  NetworkIcon, ShieldCheck, ShieldAlert, Scan, Binary,
  Braces, Hash, AtSign, Phone, ExternalLink, RefreshCw,
  LayoutDashboard, Flame, TrendingDown, ArrowUpRight,
  MoreHorizontal, Play, Pause, Volume2, VolumeX,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API = "http://127.0.0.1:8000";

// ── LOCAL STORAGE HOOK ────────────────────────────────────────────────────────
function useLS(key, init) {
  const [v, setV] = useState(() => { try { const i = localStorage.getItem(key); return i ? JSON.parse(i) : init; } catch { return init; } });
  const set = useCallback(val => { try { const nv = val instanceof Function ? val(v) : val; setV(nv); localStorage.setItem(key, JSON.stringify(nv)); } catch { } }, [v]);
  return [v, set];
}

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const T = {
  bg: "#03070f",
  bg1: "#060c18",
  bg2: "#080d1a",
  bg3: "#0a1020",
  border: "rgba(0,212,255,0.1)",
  border2: "rgba(0,212,255,0.2)",
  cyan: "#00d4ff",
  purple: "#7c3aed",
  green: "#00ff88",
  red: "#ff0033",
  orange: "#ff4444",
  amber: "#ffb800",
  blue: "#3b82f6",
  pink: "#ec4899",
  text: "#e2e8f0",
  muted: "#64748b",
  dim: "#1e293b",
};

const VERDICT = {
  SAFE: { color: T.green, bg: "rgba(0,255,136,0.05)", border: "rgba(0,255,136,0.2)", icon: CheckCircle, rank: 0 },
  SUSPICIOUS: { color: T.amber, bg: "rgba(255,184,0,0.05)", border: "rgba(255,184,0,0.2)", icon: AlertTriangle, rank: 1 },
  DANGEROUS: { color: T.orange, bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.25)", icon: XCircle, rank: 2 },
  CRITICAL: { color: T.red, bg: "rgba(255,0,51,0.08)", border: "rgba(255,0,51,0.45)", icon: XCircle, rank: 3 },
  UNKNOWN: { color: T.muted, bg: "rgba(100,116,139,0.05)", border: "rgba(100,116,139,0.2)", icon: Shield, rank: -1 },
};

// ── ANIMATED COUNTER ──────────────────────────────────────────────────────────
function Counter({ to, duration = 1200, prefix = "", suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = t => { const p = Math.min((t - t0) / duration, 1); setN(Math.round((1 - Math.pow(1 - p, 3)) * to)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{prefix}{n.toLocaleString()}{suffix}</>;
}

// ── PARTICLES ─────────────────────────────────────────────────────────────────
function Particles() {
  const pts = useRef(Array.from({ length: 60 }, (_, i) => ({ id: i, x: Math.random() * 100, y: Math.random() * 100, s: Math.random() * 2 + 0.3, d: Math.random() * 30 + 20, delay: Math.random() * 15, op: Math.random() * 0.25 + 0.05, drift: Math.random() * 60 - 30, col: Math.random() > 0.7 ? "#7c3aed" : Math.random() > 0.5 ? "#00ff88" : "#00d4ff" }))).current;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {pts.map(p => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, background: p.col, opacity: p.op, filter: `blur(${p.s > 1.5 ? 0.8 : 0}px)` }}
          animate={{ y: [0, -120, 0], x: [0, p.drift, 0], opacity: [p.op, 0.02, p.op] }}
          transition={{ duration: p.d, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

// ── HEX GRID ──────────────────────────────────────────────────────────────────
function HexGrid() {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.04 }}>
      <defs>
        <pattern id="hx" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
          <polygon points="28,2 52,14 52,34 28,46 4,34 4,14" fill="none" stroke="#00d4ff" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hx)" />
    </svg>
  );
}

// ── SCAN LINE ─────────────────────────────────────────────────────────────────
function ScanLine() {
  return (
    <motion.div className="fixed left-0 right-0 h-[1px] pointer-events-none"
      style={{ background: `linear-gradient(90deg,transparent,${T.cyan}60 20%,${T.cyan} 50%,${T.cyan}60 80%,transparent)`, zIndex: 3, boxShadow: `0 0 12px ${T.cyan}`, filter: "blur(0.5px)" }}
      animate={{ top: ["-1px", "101vh"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear", repeatDelay: 4 }} />
  );
}

// ── GRID LINES ────────────────────────────────────────────────────────────────
function GridLines() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)`, backgroundSize: "40px 40px" }} />
    </div>
  );
}

// ── NOISE TEXTURE ─────────────────────────────────────────────────────────────
function Noise() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.015, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
  );
}

// ── GLITCH TEXT ───────────────────────────────────────────────────────────────
function Glitch({ text, color = T.cyan }) {
  const [g, setG] = useState(false);
  useEffect(() => { const t = setInterval(() => { setG(true); setTimeout(() => setG(false), 160); }, 4000); return () => clearInterval(t); }, []);
  return (
    <span className="relative inline-block">
      {g && <><span className="absolute inset-0" style={{ color: "#ff0033", clipPath: "polygon(0 20%,100% 20%,100% 45%,0 45%)", transform: "translateX(-3px)", opacity: 0.9 }}>{text}</span><span className="absolute inset-0" style={{ color: T.cyan, clipPath: "polygon(0 55%,100% 55%,100% 80%,0 80%)", transform: "translateX(3px)", opacity: 0.9 }}>{text}</span></>}
      <span style={{ color }}>{text}</span>
    </span>
  );
}

// ── SHIMMER BAR ───────────────────────────────────────────────────────────────
function Bar({ score, color, h = 4 }) {
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height: h, background: "rgba(255,255,255,0.06)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: `linear-gradient(90deg,${color}50,${color})` }} initial={{ width: 0 }} animate={{ width: `${Math.min(score, 100)}%` }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div className="absolute inset-y-0 w-16 rounded-full" style={{ background: `linear-gradient(90deg,transparent,${color}40,transparent)` }} animate={{ left: ["-20%", "120%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }} />
    </div>
  );
}

// ── RADAR PULSE ───────────────────────────────────────────────────────────────
function RadarPulse({ color, size = 80, Icon = Shield }) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      {[0.35, 0.6, 0.85].map((s, i) => (
        <motion.div key={i} className="absolute rounded-full border" style={{ width: size * s, height: size * s, borderColor: color }}
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.65, ease: "easeOut" }} />
      ))}
      <div className="relative z-10 flex items-center justify-center rounded-full" style={{ width: size * 0.38, height: size * 0.38, background: `${color}15`, border: `2px solid ${color}50`, boxShadow: `0 0 24px ${color}35` }}>
        <Icon size={size * 0.18} style={{ color }} />
      </div>
    </div>
  );
}

// ── CIRCULAR GAUGE ────────────────────────────────────────────────────────────
function Gauge({ value, color, size = 100, label }) {
  const r = (size - 8) / 2, circ = r * 2 * Math.PI, offset = circ - (value / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black tabular-nums" style={{ color }}><Counter to={value} /></span>
        {label && <span className="text-[9px] font-mono uppercase tracking-widest mt-0.5" style={{ color: T.muted }}>{label}</span>}
      </div>
    </div>
  );
}

// ── GLASS CARD ────────────────────────────────────────────────────────────────
function Card({ children, className = "", glow, onClick, style = {} }) {
  const [h, setH] = useState(false);
  return (
    <motion.div whileHover={onClick ? { scale: 1.01 } : {}} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className={`rounded-2xl transition-all duration-300 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ background: "rgba(8,13,26,0.85)", backdropFilter: "blur(20px)", border: `1px solid ${h && glow ? `${glow}35` : T.border}`, boxShadow: h && glow ? `0 0 40px ${glow}12,inset 0 0 40px ${glow}04` : "none", ...style }}>
      {children}
    </motion.div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title, color = T.cyan, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color }}>{title}</span>
      </div>
      {action}
    </div>
  );
}

// ── CHIP ──────────────────────────────────────────────────────────────────────
function Chip({ label, color, sm, onClick }) {
  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg font-mono font-semibold ${sm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"} ${onClick ? "cursor-pointer" : "cursor-default"}`}
      style={{ background: `${color}12`, border: `1px solid ${color}28`, color }}>
      {label}{onClick && <Copy size={9} style={{ opacity: 0.6 }} />}
    </motion.button>
  );
}

// ── TERMINAL LOG ──────────────────────────────────────────────────────────────
function TermLog({ logs, loading }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  if (!loading && !logs.length) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
        className="rounded-xl overflow-hidden" style={{ background: "#020508", border: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: T.border }}>
          <Terminal size={11} style={{ color: T.cyan }} />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: T.muted }}>sentinel.log</span>
          {loading && <motion.div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: T.cyan }} animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />}
        </div>
        <div ref={ref} className="p-3.5 space-y-1 max-h-36 overflow-y-auto">
          {logs.map(l => (
            <motion.div key={l.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 text-xs font-mono">
              <span className="shrink-0 font-bold" style={{ color: l.color, minWidth: 72 }}>[{l.prefix}]</span>
              <span style={{ color: T.muted }}>{l.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── VERDICT BANNER ────────────────────────────────────────────────────────────
function VerdictBanner({ verdict, confidence, attackType, riskScore, osintCount }) {
  const vc = VERDICT[verdict] || VERDICT.UNKNOWN;
  const VIcon = vc.icon;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: vc.bg, border: `1px solid ${vc.border}` }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 80% 50%,${vc.color}10 0%,transparent 65%)` }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${vc.color}60,transparent)` }} />
      {verdict === "CRITICAL" && <motion.div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ border: `1px solid ${vc.color}` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 flex-wrap">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <RadarPulse color={vc.color} size={88} Icon={VIcon} />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1" style={{ color: `${vc.color}80` }}>Threat Verdict</div>
            <div className="text-5xl font-black tracking-tight" style={{ color: vc.color, textShadow: `0 0 40px ${vc.color}50` }}>{verdict}</div>
            <div className="text-sm mt-1.5 font-mono" style={{ color: T.text }}>{attackType || "Analysis complete"}</div>
            {osintCount > 0 && <div className="flex items-center gap-1.5 mt-2 justify-center sm:justify-start"><Radar size={11} style={{ color: T.cyan }} /><span className="text-[11px] font-mono" style={{ color: T.muted }}>{osintCount} URL{osintCount > 1 ? "s" : ""} OSINT scanned</span></div>}
          </div>
        </div>
        <div className="flex gap-6 items-center p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${vc.color}20` }}>
          <div className="text-center"><div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: `${vc.color}70` }}>Confidence</div><Gauge value={confidence || 0} color={vc.color} size={90} label="%" /></div>
          <div className="w-px h-16" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="text-center"><div className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: `${vc.color}70` }}>Risk Score</div><Gauge value={riskScore || 0} color={vc.color} size={90} label="/100" /></div>
        </div>
      </div>
      <div className="mt-5"><Bar score={confidence || 0} color={vc.color} h={5} /></div>
    </motion.div>
  );
}

// ── LIVE THREAT TICKER ────────────────────────────────────────────────────────
const MOCK_THREATS = [
  { url: "hdfc-kyc-alert.xyz", type: "Phishing", country: "IN", severity: "CRITICAL" },
  { url: "sbi-secure-verify.net", type: "Credential Harvest", country: "IN", severity: "CRITICAL" },
  { url: "paypal-login-confirm.tk", type: "Brand Impersonation", country: "US", severity: "DANGEROUS" },
  { url: "amazon-prize-winner.ml", type: "Lottery Scam", country: "NG", severity: "DANGEROUS" },
  { url: "irctc-ticket-refund.xyz", type: "Refund Scam", country: "IN", severity: "SUSPICIOUS" },
  { url: "rbi-kyc-update.online", type: "Govt Impersonation", country: "IN", severity: "CRITICAL" },
  { url: "microsoft-support-call.net", type: "Tech Support Scam", country: "US", severity: "DANGEROUS" },
  { url: "uidai-aadhar-verify.tk", type: "Identity Theft", country: "IN", severity: "CRITICAL" },
];

function ThreatTicker() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % MOCK_THREATS.length), 2500);
    return () => clearInterval(t);
  }, [paused]);
  const t = MOCK_THREATS[idx];
  const col = t.severity === "CRITICAL" ? T.red : t.severity === "DANGEROUS" ? T.orange : T.amber;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl overflow-hidden" style={{ background: T.bg2, border: `1px solid ${T.border}` }}>
      <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: col }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <span className="text-[10px] font-mono uppercase tracking-widest flex-shrink-0" style={{ color: T.muted }}>LIVE</span>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono truncate" style={{ color: T.text }}>{t.url}</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono flex-shrink-0" style={{ background: `${col}15`, color: col, border: `1px solid ${col}25` }}>{t.type}</span>
          <span className="text-[10px] font-mono flex-shrink-0" style={{ color: T.muted }}>{t.country}</span>
        </motion.div>
      </AnimatePresence>
      <button onClick={() => setPaused(p => !p)} className="flex-shrink-0 p-1 rounded hover:bg-white/5 transition-colors" style={{ color: T.muted }}>
        {paused ? <Play size={10} /> : <Pause size={10} />}
      </button>
    </div>
  );
}

// ── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  const [h, setH] = useState(false);
  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="rounded-xl p-4 cursor-default transition-all duration-300"
      style={{ background: T.bg2, border: `1px solid ${h ? `${color}35` : T.border}`, boxShadow: h ? `0 8px 30px ${color}15` : "none" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}14`, border: `1px solid ${color}20` }}><Icon size={13} style={{ color }} /></div>
        {trend !== undefined && <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: trend >= 0 ? T.green : T.red }}>{trend >= 0 ? <ArrowUpRight size={10} /> : <TrendingDown size={10} />}{Math.abs(trend)}%</div>}
      </div>
      <div className="text-2xl font-black tabular-nums" style={{ color }}>{typeof value === "number" ? <Counter to={value} /> : value}</div>
      <div className="text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color: T.muted }}>{label}</div>
      {sub && <div className="text-[10px] font-mono mt-0.5" style={{ color: T.muted }}>{sub}</div>}
    </motion.div>
  );
}

// ── ENGINE STATUS GRID ────────────────────────────────────────────────────────
function EngineGrid({ states }) {
  const engines = [
    { id: "parser", name: "Input Parser", icon: FileText, col: T.cyan },
    { id: "ioc", name: "IOC Extract", icon: Search, col: T.purple },
    { id: "urgency", name: "Urgency AI", icon: Zap, col: T.amber },
    { id: "brand", name: "Brand Intel", icon: Eye, col: T.pink },
    { id: "url", name: "URL Intel", icon: Globe, col: T.blue },
    { id: "typo", name: "Typosquat", icon: Crosshair, col: T.purple },
    { id: "vt", name: "VirusTotal", icon: Activity, col: T.red },
    { id: "safe", name: "Safe Browse", icon: Lock, col: T.green },
    { id: "llm", name: "LLM Reason", icon: Cpu, col: T.cyan },
    { id: "mitre", name: "MITRE ATT&CK", icon: Target, col: T.amber },
  ];
  return (
    <Card className="p-4">
      <SectionHead icon={Database} title="Engine Telemetry" color={T.cyan} />
      <div className="grid grid-cols-5 gap-2">
        {engines.map(eng => {
          const st = states[eng.id] || "IDLE";
          const [col, badge] = st === "SCANNING" ? [eng.col, "RUN"] : st === "COMPLETE" ? [T.green, "OK"] : st === "LIMITED" ? [T.amber, "LMT"] : st === "UNAVAILABLE" ? [T.red, "N/A"] : [T.muted, "IDLE"];
          return (
            <div key={eng.id} className="p-2.5 rounded-xl flex flex-col gap-1.5 transition-all" style={{ background: T.bg3, border: `1px solid ${st === "SCANNING" ? `${col}50` : T.border}` }}>
              <div className="flex items-center justify-between">
                <eng.icon size={12} style={{ color: col }} className={st === "SCANNING" ? "animate-pulse" : ""} />
                <span className="text-[8px] font-mono font-black px-1 py-0.5 rounded" style={{ background: `${col}15`, color: col, border: `1px solid ${col}25` }}>{badge}</span>
              </div>
              <span className="text-[9px] font-mono leading-tight" style={{ color: st === "IDLE" ? T.muted : T.text }}>{eng.name}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── KILL CHAIN ────────────────────────────────────────────────────────────────
function KillChain({ result }) {
  const steps = useMemo(() => {
    if (!result) return [];
    const chain = [{ label: "Input", icon: Hash, color: T.cyan }];
    const pre = result?.pre_analysis || {};
    const urls = result?.auto_extracted?.urls || [];
    const osint = result?.osint || result?.osint_results || [];
    const v = result?.master_verdict || result?.summary?.verdict;
    if (pre.urgency?.is_high_urgency) chain.push({ label: "Urgency", icon: AlertCircle, color: T.amber });
    if (pre.impersonation?.impersonation_detected) chain.push({ label: "Impersonate", icon: Eye, color: T.purple });
    if (urls.length > 0) chain.push({ label: "Links", icon: Link, color: T.blue });
    const mal = Array.isArray(osint) && osint.some(o => o.risk_score > 50 || o.virustotal?.malicious > 0);
    if (mal) chain.push({ label: "Mal Domain", icon: Globe, color: T.red });
    if (v === "CRITICAL" || v === "DANGEROUS") chain.push({ label: "Blocked", icon: ShieldCheck, color: T.green });
    else if (v === "SUSPICIOUS") chain.push({ label: "Caution", icon: AlertTriangle, color: T.amber });
    else chain.push({ label: "Safe", icon: CheckCircle, color: T.green });
    return chain;
  }, [result]);

  if (!steps.length) return null;
  return (
    <Card className="p-5">
      <SectionHead icon={Crosshair} title="Attack Kill Chain" color={T.cyan} />
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative p-3 rounded-xl" style={{ background: `${s.color}14`, border: `1px solid ${s.color}30` }}>
                <s.icon size={16} style={{ color: s.color }} />
                <div className="absolute inset-0 rounded-xl" style={{ boxShadow: `0 0 16px ${s.color}25` }} />
              </div>
              <span className="text-[9px] font-mono text-center" style={{ color: T.text }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px relative" style={{ minWidth: 16 }}>
                <div className="absolute inset-0" style={{ background: `linear-gradient(90deg,${s.color}30,${steps[i + 1].color}50)` }} />
                <motion.div className="absolute top-0 h-px w-6" style={{ background: `linear-gradient(90deg,transparent,white,transparent)` }} animate={{ left: ["0%", "100%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: i * 0.15 }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
}

// ── OSINT RESULTS ─────────────────────────────────────────────────────────────
function OSINTResults({ data }) {
  const [open, setOpen] = useState(true);
  if (!data?.length) return null;
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 rounded-t-2xl transition-all" style={{ background: T.bg2, border: `1px solid ${T.border}`, borderBottom: open ? "none" : undefined, borderRadius: open ? "1rem 1rem 0 0" : "1rem" }}>
        <div className="flex items-center gap-2.5">
          <Radar size={13} style={{ color: T.cyan }} />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: T.cyan }}>OSINT Intelligence — {data.length} Domain{data.length > 1 ? "s" : ""}</span>
        </div>
        {open ? <ChevronUp size={14} style={{ color: T.muted }} /> : <ChevronDown size={14} style={{ color: T.muted }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ background: T.bg2, border: `1px solid ${T.border}`, borderTop: "none", borderRadius: "0 0 1rem 1rem", overflow: "hidden" }}>
            <div className="p-5 space-y-6">
              {data.map((o, i) => {
                const vr = o.overall_verdict || "UNKNOWN";
                const rc = VERDICT[vr]?.color || T.muted;
                const rs = o.risk_score || 0;
                return (
                  <div key={i}>
                    {i > 0 && <div className="border-t mb-4" style={{ borderColor: T.border }} />}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{ background: `${rc}12`, border: `1px solid ${rc}25` }}><Globe size={16} style={{ color: rc }} /></div>
                        <div><div className="text-sm font-black font-mono" style={{ color: T.text }}>{o.domain || "Unknown"}</div><div className="text-[10px] font-mono" style={{ color: T.muted }}>IP: {o.ip || "Unresolved"}</div></div>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: `${rc}15`, border: `1px solid ${rc}30`, color: rc }}>{vr}</span>
                        <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: `${rc}10`, border: `1px solid ${rc}20`, color: rc }}>Risk {rs}/100</span>
                      </div>
                    </div>
                    <Bar score={rs} color={rc} h={3} />
                    {o.risk_flags?.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {o.risk_flags.map((f, fi) => (
                          <div key={fi} className="flex items-start gap-2 p-2.5 rounded-lg text-xs font-mono" style={{ background: "rgba(255,68,68,0.06)", border: "1px solid rgba(255,68,68,0.15)" }}>
                            <AlertCircle size={11} className="mt-0.5 flex-shrink-0" style={{ color: T.red }} /><span style={{ color: T.text }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                      {[
                        { label: "VirusTotal", icon: Shield, color: T.red, content: o.virustotal && !o.virustotal.error ? <><div className="flex items-baseline gap-1.5"><span className="text-xl font-black" style={{ color: o.virustotal.malicious > 0 ? T.red : T.green }}>{o.virustotal.malicious || 0}</span><span className="text-xs" style={{ color: T.muted }}>/{o.virustotal.total || o.virustotal.total_engines || 0}</span></div><Bar score={((o.virustotal.malicious || 0) / Math.max(o.virustotal.total || 1, 1)) * 100} color={T.red} h={3} /></> : <div className="text-xs font-mono" style={{ color: T.muted }}>Unavailable</div> },
                        { label: "Safe Browse", icon: Lock, color: T.green, content: o.safe_browsing && !o.safe_browsing.error ? <div className="text-lg font-black" style={{ color: o.safe_browsing.is_dangerous ? T.red : T.green }}>{o.safe_browsing.is_dangerous ? "THREAT" : "CLEAN"}</div> : <div className="text-xs font-mono" style={{ color: T.muted }}>Unavailable</div> },
                        { label: "Typosquat", icon: Crosshair, color: T.purple, content: o.typosquatting ? <><div className="text-lg font-black" style={{ color: o.typosquatting.is_typosquatting ? T.red : T.green }}>{o.typosquatting.is_typosquatting ? "DETECTED" : "CLEAN"}</div>{o.typosquatting.is_typosquatting && <div className="text-[10px] font-mono mt-1" style={{ color: T.muted }}>→ {o.typosquatting.matched_brand}</div>}</> : <div className="text-xs font-mono" style={{ color: T.muted }}>Unavailable</div> },
                        { label: "WHOIS", icon: FileText, color: T.cyan, content: o.whois && !o.whois.error ? <div className="space-y-1 text-[10px] font-mono">{[["Registrar", o.whois.registrar], ["Created", (o.whois.created || "").slice(0, 10)], ["Country", o.whois.country]].filter(([, v]) => v && v !== "Unknown").map(([k, v]) => <div key={k} className="flex justify-between gap-1"><span style={{ color: T.muted }}>{k}</span><span style={{ color: T.text }} className="truncate max-w-24">{v}</span></div>)}</div> : <div className="text-xs font-mono" style={{ color: T.muted }}>Unavailable</div> },
                        { label: "Geo IP", icon: Map, color: T.blue, content: (o.ip_geolocation && !o.ip_geolocation.error) ? <div className="space-y-1 text-[10px] font-mono">{[["Country", o.ip_geolocation.country], ["City", o.ip_geolocation.city], ["ISP", o.ip_geolocation.isp]].filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex justify-between gap-1"><span style={{ color: T.muted }}>{k}</span><span style={{ color: T.text }} className="truncate max-w-24">{v}</span></div>)}</div> : <div className="text-xs font-mono" style={{ color: T.muted }}>Unavailable</div> },
                        { label: "Domain Age", icon: Clock, color: T.amber, content: o.domain_age && o.domain_age.age_days >= 0 ? <><div className="text-lg font-black" style={{ color: o.domain_age.is_very_new ? T.red : o.domain_age.is_new ? T.amber : T.green }}>{o.domain_age.age_text}</div><div className="text-[10px] font-mono mt-1" style={{ color: T.muted }}>{o.domain_age.risk}</div></> : <div className="text-xs font-mono" style={{ color: T.muted }}>Unavailable</div> },
                      ].map(({ label, icon: Ic, color, content }) => (
                        <div key={label} className="p-3 rounded-xl space-y-2" style={{ background: T.bg3, border: `1px solid ${T.border}` }}>
                          <div className="flex items-center gap-1.5"><Ic size={11} style={{ color }} /><span className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span></div>
                          {content}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ANALYSIS BLOCKS ───────────────────────────────────────────────────────────
function AnalysisBlocks({ ai, theme_accent }) {
  const blocks = [
    { title: "AI Threat Explanation", content: ai.explanation, color: T.cyan, icon: Cpu },
    { title: "Technical Analysis", content: ai.technical_analysis, color: T.purple, icon: Terminal },
    { title: "MITRE ATT&CK Mapping", content: ai.mitre_attack, color: T.amber, icon: Target },
    { title: "Recommended Actions", content: ai.recommended_actions, color: T.green, icon: Shield },
    { title: "Indicators of Compromise", content: ai.indicators_of_compromise, color: T.red, icon: AlertCircle },
    { title: "Educational Insight", content: ai.educational_note, color: T.blue, icon: BookOpen },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {blocks.map(({ title, content, color, icon: Icon }, i) => content ? (
        <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}
          className="rounded-xl p-4 space-y-3 group transition-all duration-300"
          style={{ background: T.bg2, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${color}14` }}><Icon size={12} style={{ color }} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color }}>{title}</span>
          </div>
          <p className="text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ color: T.muted }}>{content}</p>
        </motion.div>
      ) : null)}
    </div>
  );
}

// ── RISK CALCULATOR ───────────────────────────────────────────────────────────
function calcRisk(data) {
  let score = 0; const parts = [];
  const pre = data?.pre_analysis || {};
  const osint = data?.osint || data?.osint_results || [];
  const ext = data?.auto_extracted || {};
  const v = data?.master_verdict || data?.summary?.verdict || "UNKNOWN";

  if (pre.urgency?.urgency_score > 0) { const p = Math.min(20, (pre.urgency.urgency_score / 100) * 20); score += p; parts.push({ label: "Urgency", value: +p.toFixed(1), color: T.amber }); }
  if (pre.impersonation?.impersonation_detected) { score += 20; parts.push({ label: "Impersonation", value: 20, color: T.purple }); }
  const vRank = { SAFE: 0, SUSPICIOUS: 10, DANGEROUS: 15, CRITICAL: 20, UNKNOWN: 5 };
  if (vRank[v] > 0) { score += vRank[v]; parts.push({ label: "AI Severity", value: vRank[v], color: T.red }); }
  if (ext.urls?.length > 0) { const p = Math.min(10, ext.urls.length * 5); score += p; parts.push({ label: "Embedded Links", value: p, color: T.blue }); }
  let vtP = 0, sbP = 0, tyP = 0, osP = 0;
  if (Array.isArray(osint)) { osint.forEach(o => { if (o.risk_score > osP) osP = o.risk_score; if (o.virustotal?.malicious > 0) vtP = 15; if (o.safe_browsing?.is_dangerous) sbP = 15; if (o.typosquatting?.is_typosquatting) tyP = 15; }); }
  if (osP > 0) { const p = Math.min(25, (osP / 100) * 25); score += p; parts.push({ label: "OSINT Risk", value: +p.toFixed(1), color: T.cyan }); }
  if (vtP) { score += vtP; parts.push({ label: "VirusTotal", value: vtP, color: T.red }); }
  if (sbP) { score += sbP; parts.push({ label: "Safe Browsing", value: sbP, color: T.red }); }
  if (tyP) { score += tyP; parts.push({ label: "Typosquatting", value: tyP, color: T.purple }); }
  const total = Math.min(100, Math.round(score));
  const color = total >= 80 ? T.red : total >= 60 ? T.orange : total >= 30 ? T.amber : T.green;
  return { total, parts, color };
}

// ── FORENSICS UPLOAD ──────────────────────────────────────────────────────────
function ForensicsUpload({ onResult, setLoading, setLogs, loading }) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const ref = useRef(null);
  const pushLog = (p, t, c) => setLogs(prev => [...prev.slice(-25), { prefix: p, text: t, color: c, id: Date.now() + Math.random() }]);
  const FT = { "image/png": { label: "PNG", icon: Image, color: T.cyan }, "image/jpeg": { label: "JPG", icon: Image, color: T.cyan }, "image/jpg": { label: "JPG", icon: Image, color: T.cyan }, "image/webp": { label: "WebP", icon: Image, color: T.cyan }, "application/pdf": { label: "PDF", icon: FileText, color: T.red }, "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { label: "DOCX", icon: File, color: T.amber } };
  const pick = f => { if (!f) return; if (f.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; } setFile(f); if (f.type.startsWith("image/")) { const r = new FileReader(); r.onload = e => setPreview(e.target.result); r.readAsDataURL(f); } else setPreview(null); };
  const run = async () => {
    if (!file) { toast.error("Select a file first"); return; }
    setLoading(true); setLogs([]);
    [["INIT", `Loading: ${file.name}`, T.cyan], ["EXTRACT", "Extracting text & URLs..", "#a78bfa"], ["OCR", "Running Tesseract OCR..", T.cyan], ["OSINT", "OSINT on extracted URLs..", "#00ff88"], ["LLM", "AI threat analysis...", T.cyan], ["REPORT", "Generating report..", "#00ff88"]].forEach(([p, t, c], i) => setTimeout(() => pushLog(p, t, c), i * 400));
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await axios.post(`${API}/forensics/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      onResult(res.data); const v = res.data?.master_verdict || "UNKNOWN";
      pushLog("DONE", `Forensics complete — ${v}`, v === "SAFE" ? T.green : T.red);
      if (v === "SAFE") toast.success("No threats in file"); else if (v === "SUSPICIOUS") toast("Suspicious content!", { icon: "⚠️" }); else toast.error(`${v} threat found!`);
    } catch (err) { const m = err.response?.data?.detail || "Analysis failed"; pushLog("ERROR", m, T.red); toast.error(m); }
    finally { setLoading(false); }
  };
  const fi = file ? FT[file.type] : null; const FI = fi?.icon || File;
  return (
    <div className="space-y-4">
      <motion.div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()} animate={{ scale: drag ? 1.01 : 1 }} className="relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 overflow-hidden" style={{ background: T.bg2, border: `2px dashed ${drag ? T.cyan : T.border}`, boxShadow: drag ? `0 0 40px ${T.cyan}20` : "none" }}>
        {drag && <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity }} style={{ background: `radial-gradient(ellipse at center,${T.cyan}10,transparent 70%)` }} />}
        <input ref={ref} type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.pdf,.docx" onChange={e => pick(e.target.files[0])} />
        {!file ? (
          <div className="space-y-5">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="flex justify-center">
              <div className="p-5 rounded-2xl" style={{ background: `${T.cyan}10`, border: `1px solid ${T.cyan}20` }}><Upload size={32} style={{ color: T.cyan }} /></div>
            </motion.div>
            <div><p className="text-base font-bold" style={{ color: T.text }}>Drop file or <span style={{ color: T.cyan }}>browse</span></p><p className="text-xs mt-1.5 font-mono" style={{ color: T.muted }}>Screenshot • QR Code • PDF • Word Doc • Max 10MB</p></div>
            <div className="flex justify-center gap-2 flex-wrap">
              {[["Screenshot", Image, T.cyan], ["QR Code", QrCode, T.purple], ["PDF", FileText, T.red], ["DOCX", File, T.amber]].map(([l, Ic, c]) => (
                <div key={l} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono" style={{ background: `${c}10`, border: `1px solid ${c}22`, color: c }}><Ic size={10} />{l}</div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {preview && <div className="flex justify-center"><img src={preview} alt="p" className="max-h-36 rounded-xl object-contain" style={{ border: `1px solid ${T.border}`, boxShadow: `0 0 20px ${T.cyan}15` }} /></div>}
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl" style={{ background: `${fi?.color || T.cyan}12`, border: `1px solid ${fi?.color || T.cyan}25` }}><FI size={22} style={{ color: fi?.color || T.cyan }} /></div>
              <div className="text-left"><p className="text-sm font-bold truncate max-w-xs" style={{ color: T.text }}>{file.name}</p><p className="text-[11px] font-mono" style={{ color: T.muted }}>{fi?.label || "File"} • {(file.size / 1024).toFixed(1)} KB</p></div>
              <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }} className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors" style={{ color: T.red }}><X size={14} /></button>
            </div>
          </div>
        )}
      </motion.div>
      {file && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={run} disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: loading ? T.dim : "linear-gradient(135deg,#0ea5e9,#7c3aed)", boxShadow: loading ? "none" : `0 0 30px ${T.cyan}30` }}>
          {loading ? <><Loader size={14} className="animate-spin" /> Analyzing...</> : <><FileSearch size={14} /> Analyze with Sentinel AI</>}
        </motion.button>
      )}
    </div>
  );
}

// ── INTELLIGENCE DASHBOARD ────────────────────────────────────────────────────
function Intel({ history }) {
  if (!history?.length) return (
    <div className="text-center py-24 space-y-4">
      <BarChart2 size={48} className="mx-auto" style={{ color: T.muted }} />
      <h3 className="text-xl font-black" style={{ color: T.text }}>No Intelligence Yet</h3>
      <p className="text-sm" style={{ color: T.muted }}>Run scans to build your threat intelligence database.</p>
    </div>
  );
  const threats = history.filter(h => h.verdict !== "SAFE" && h.verdict !== "UNKNOWN");
  const critical = history.filter(h => h.verdict === "CRITICAL");
  const avgConf = Math.round(history.reduce((a, h) => a + (h.confidence || 0), 0) / history.length || 0);
  const typeMap = {}; threats.forEach(t => { const tp = t.attackType || "Generic"; typeMap[tp] = (typeMap[tp] || 0) + 1; });
  const topTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Total Scans" value={history.length} color={T.cyan} trend={12} />
        <StatCard icon={ShieldAlert} label="Threats Found" value={threats.length} color={T.amber} trend={5} />
        <StatCard icon={Siren} label="Critical" value={critical.length} color={T.red} trend={-3} />
        <StatCard icon={Cpu} label="Avg Confidence" value={`${avgConf}%`} color={T.purple} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionHead icon={TrendingUp} title="Top Attack Vectors" color={T.amber} />
          <div className="space-y-3">
            {topTypes.length > 0 ? topTypes.map(([type, count], i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-mono mb-1.5"><span style={{ color: T.text }}>{type}</span><span style={{ color: T.muted }}>{count}x</span></div>
                <Bar score={(count / Math.max(threats.length, 1)) * 100} color={T.amber} h={3} />
              </div>
            )) : <p className="text-xs font-mono" style={{ color: T.muted }}>No data yet</p>}
          </div>
        </Card>
        <Card className="p-5">
          <SectionHead icon={Clock} title="Recent Timeline" color={T.cyan} />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.slice(0, 8).map(h => {
              const vc = VERDICT[h.verdict] || VERDICT.UNKNOWN;
              return (
                <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: T.bg3, border: `1px solid ${T.border}` }}>
                  <div className="p-1.5 rounded-lg" style={{ background: vc.bg }}><vc.icon size={11} style={{ color: vc.color }} /></div>
                  <div className="flex-1 min-w-0"><div className="text-xs font-mono truncate" style={{ color: T.text }}>{h.preview}</div><div className="text-[10px] font-mono" style={{ color: T.muted }}>{new Date(h.timestamp).toLocaleTimeString()}</div></div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded flex-shrink-0" style={{ background: `${vc.color}15`, color: vc.color }}>{h.verdict}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── COMMAND CENTER (HOME) ─────────────────────────────────────────────────────
function CommandCenter({ history, scans, threats, onNavigate }) {
  const recent = history.slice(0, 4);
  const threatRate = history.length > 0 ? Math.round((history.filter(h => h.verdict !== "SAFE" && h.verdict !== "UNKNOWN").length / history.length) * 100) : 0;
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: "linear-gradient(135deg,rgba(0,212,255,0.08) 0%,rgba(124,58,237,0.08) 50%,rgba(0,255,136,0.05) 100%)", border: `1px solid ${T.border2}` }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 20% 50%,rgba(0,212,255,0.06) 0%,transparent 60%)" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${T.cyan}40,${T.purple}40,transparent)` }} />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6" style={{ background: `${T.cyan}10`, border: `1px solid ${T.cyan}25`, color: T.cyan }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}><Radio size={10} /></motion.div>
            Threat Intelligence Platform • All Systems Operational
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-3" style={{ color: T.text }}>
            Your Cyber<br /><span style={{ color: T.cyan, textShadow: `0 0 60px ${T.cyan}40` }}>Command Center</span>
          </h1>
          <p className="text-sm md:text-base max-w-xl leading-relaxed" style={{ color: T.muted }}>
            AI-powered threat intelligence for messages, URLs, emails, files, and domains. 10 detection engines. Real-time OSINT. India-specific threat coverage.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { label: "Analyze Threat", icon: Search, color: T.cyan, page: "scanner" },
              { label: "File Forensics", icon: FileSearch, color: T.purple, page: "forensics" },
              { label: "Email Analysis", icon: Mail, color: T.amber, page: "email" },
              { label: "OSINT Recon", icon: Radar, color: T.green, page: "osint" },
            ].map(({ label, icon: Ic, color, page }) => (
              <motion.button key={label} whileHover={{ scale: 1.04, boxShadow: `0 0 25px ${color}30` }} whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate(page)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: `${color}12`, border: `1px solid ${color}28`, color }}>
                <Ic size={13} />{label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Live threat ticker */}
      <ThreatTicker />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Scan} label="Total Scans" value={scans} color={T.cyan} trend={8} />
        <StatCard icon={ShieldAlert} label="Threats Found" value={threats} color={T.red} trend={-2} />
        <StatCard icon={Activity} label="Threat Rate" value={`${threatRate}%`} color={T.amber} />
        <StatCard icon={CheckCircle} label="Engines Online" value="10/10" color={T.green} />
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Search, color: T.cyan, title: "Threat Scanner", desc: "Analyze any message, URL, SMS, or notification with 10 AI engines simultaneously.", page: "scanner" },
          { icon: FileSearch, color: T.purple, title: "Forensics Lab", desc: "Upload screenshots, QR codes, PDFs, or documents. Extract and analyze all threats.", page: "forensics" },
          { icon: Mail, color: T.amber, title: "Email Analyzer", desc: "Full email header forensics — SPF, DKIM, DMARC, spoofing detection, hop chain trace.", page: "email" },
          { icon: Radar, color: T.green, title: "OSINT Recon", desc: "Deep domain intelligence — VirusTotal, WHOIS, IP geo, typosquatting, Safe Browsing.", page: "osint" },
          { icon: BarChart2, color: T.blue, title: "Intelligence Hub", desc: "Session history, threat trends, attack vector analysis, and exportable reports.", page: "intel" },
          { icon: BookOpen, color: T.pink, title: "Learn & Simulate", desc: "Phishing simulations, awareness quizzes, and real threat pattern education.", page: "learn" },
        ].map(({ icon: Ic, color, title, desc, page }) => (
          <Card key={title} className="p-5 group" glow={color} onClick={() => onNavigate(page)}>
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2.5 rounded-xl transition-all duration-300" style={{ background: `${color}12`, border: `1px solid ${color}22` }}><Ic size={16} style={{ color }} /></div>
              <div className="flex-1">
                <h3 className="text-sm font-black" style={{ color: T.text }}>{title}</h3>
                <ChevronRight size={14} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: T.muted }}>{desc}</p>
            <div className="mt-3 h-px" style={{ background: `linear-gradient(90deg,${color}30,transparent)` }} />
          </Card>
        ))}
      </div>

      {/* Recent scans */}
      {recent.length > 0 && (
        <Card className="p-5">
          <SectionHead icon={History} title="Recent Scans" color={T.cyan} action={<button onClick={() => onNavigate("history")} className="text-[10px] font-mono" style={{ color: T.muted }}>View all →</button>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recent.map(h => {
              const vc = VERDICT[h.verdict] || VERDICT.UNKNOWN;
              return (
                <div key={h.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: T.bg3, border: `1px solid ${T.border}` }}>
                  <div className="p-2 rounded-lg" style={{ background: vc.bg }}><vc.icon size={12} style={{ color: vc.color }} /></div>
                  <div className="flex-1 min-w-0"><div className="text-xs font-mono truncate" style={{ color: T.text }}>{h.preview}</div><div className="text-[10px] font-mono mt-0.5" style={{ color: T.muted }}>{new Date(h.timestamp).toLocaleString()}</div></div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded flex-shrink-0" style={{ background: `${vc.color}15`, color: vc.color }}>{h.verdict}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── SCANNER PAGE ──────────────────────────────────────────────────────────────
function Scanner({ onResult, result, loading, setLoading, logs, setLogs, engineStates }) {
  const [input, setInput] = useState("");
  const ref = useRef(null);
  const pushLog = (p, t, c) => setLogs(prev => [...prev.slice(-25), { prefix: p, text: t, color: c, id: Date.now() + Math.random() }]);

  const analyze = useCallback(async () => {
    if (!input.trim()) { toast.error("Paste something to analyze"); return; }
    setLoading(true); onResult(null); setLogs([]);
    const steps = [["INIT", "Initializing Sentinel AI v3.0...", T.cyan], ["PARSE", "Extracting IOCs..", "#a78bfa"], ["URGENCY", "Urgency detection...", T.cyan], ["BRAND", "Brand impersonation check..", "#ffb800"], ["VT", "VirusTotal scan..", "#ff4444"], ["WHOIS", "WHOIS & domain intel..", "#38bdf8"], ["GEO", "IP geolocation..", "#38bdf8"], ["TYPO", "Typosquatting check..", "#a78bfa"], ["SAFE", "Google Safe Browsing..", "#00ff88"], ["LLM", "LLM threat reasoning...", T.cyan], ["MITRE", "MITRE ATT&CK mapping..", "#ff4444"], ["REPORT", "Compiling report..", "#00ff88"]];
    steps.forEach(([p, t, c], i) => setTimeout(() => pushLog(p, t, c), i * 280));
    try {
      let data;
      try { const r = await axios.post(`${API}/fullscan`, { text: input, run_osint: true }); data = r.data; }
      catch { const r = await axios.post(`${API}/analyze`, { text: input }); data = { ...r.data, osint_results: [], master_verdict: r.data?.summary?.verdict }; }
      onResult(data);
      const v = data?.master_verdict || data?.summary?.verdict || "UNKNOWN";
      pushLog("DONE", `Complete — Verdict: ${v}`, v === "SAFE" ? T.green : T.red);
      if (v === "SAFE") toast.success("✅ No threats detected"); else if (v === "SUSPICIOUS") toast("⚠️ Suspicious content!", { icon: "⚠️" }); else toast.error(`🚨 ${v} detected!`);
    } catch { pushLog("ERROR", "Backend unreachable — is it running on :8000?", T.red); toast.error("Cannot reach backend"); }
    finally { setLoading(false); }
  }, [input]);

  const llm = result?.llm_analysis || result || {};
  const ai = llm?.ai_analysis || {};
  const ext = llm?.auto_extracted || {};
  const pre = llm?.pre_analysis || {};
  const osint = result?.osint || result?.osint_results || [];
  const verdict = result?.master_verdict || result?.summary?.verdict || null;
  const vc = verdict ? (VERDICT[verdict] || VERDICT.UNKNOWN) : null;
  const summary = result?.summary || llm?.summary || {};
  const risk = result ? calcRisk(result) : { total: 0, parts: [], color: T.cyan };

  return (
    <div className="space-y-5">
      {/* Input */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">{["#ff5f57", "#ffbd2e", "#28c840"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}</div>
            <span className="text-[11px] font-mono ml-2" style={{ color: T.muted }}>sentinel@ai ~ analyze --osint --llm --mitre</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span style={{ color: T.green }}>ready</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-5 top-4 text-[11px] font-mono select-none" style={{ color: T.muted }}>&gt;_</div>
          <textarea ref={ref} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") analyze(); }}
            placeholder={"Paste any suspicious content here...\n\n• SMS: \"Your SBI account blocked. Verify at http://sbi-alert.xyz\"\n• Full email with headers\n• WhatsApp message  \n• Suspicious URL or domain\n• Social engineering attempt\n\nCtrl+Enter to analyze instantly"}
            rows={7} className="w-full pl-12 pr-5 pt-4 pb-4 text-sm font-mono resize-none focus:outline-none"
            style={{ background: "transparent", color: T.text, caretColor: T.cyan, lineHeight: 1.8 }} />
          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: `linear-gradient(transparent,rgba(8,13,26,0.9))` }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono" style={{ color: T.muted }}>{input.length}<span style={{ color: T.dim }}>/10000</span></span>
            <div className="hidden sm:flex gap-2">
              {[["MSG", T.cyan], ["URL", T.red], ["EMAIL", T.amber], ["SMS", T.purple]].map(([l, c]) => (
                <span key={l} className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: `${c}10`, color: c, border: `1px solid ${c}20` }}>{l}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {input && <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setInput(""); onResult(null); setLogs([]); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs" style={{ color: T.muted, border: `1px solid ${T.border}` }}><RotateCcw size={11} /> Clear</motion.button>}
            <motion.button onClick={analyze} disabled={loading} whileHover={{ scale: loading ? 1 : 1.03, boxShadow: loading ? "none" : `0 0 30px ${T.cyan}40` }} whileTap={{ scale: loading ? 1 : 0.97 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: loading ? T.dim : "linear-gradient(135deg,#0ea5e9,#7c3aed)", boxShadow: loading ? "none" : `0 0 20px ${T.cyan}25` }}>
              {loading ? <><Loader size={13} className="animate-spin" /> Analyzing...</> : <><Eye size={13} /> Analyze Threat</>}
            </motion.button>
          </div>
        </div>
      </Card>

      {/* Engines */}
      {(loading || Object.values(engineStates).some(s => s === "COMPLETE")) && <EngineGrid states={engineStates} />}

      {/* Log */}
      <TermLog logs={logs} loading={loading} />

      {/* Results */}
      <AnimatePresence>
        {result && !loading && vc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: T.muted }}>
                <CheckCircle size={12} style={{ color: T.green }} /> Analysis complete • {osint.length} URLs scanned • {Object.values(engineStates).filter(s => s === "COMPLETE").length} engines fired
              </div>
              <div className="flex gap-2">
                {[["Print", Printer, () => window.print()], ["Copy", Copy, () => { navigator.clipboard.writeText(ai.explanation || verdict); toast.success("Copied!"); }], ["JSON", Download, () => { const b = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `sentinel-${Date.now()}.json`; a.click(); URL.revokeObjectURL(u); toast.success("Downloaded!"); }]].map(([l, Ic, fn]) => (
                  <button key={l} onClick={fn} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono hover:bg-white/5 transition-colors" style={{ color: T.text, border: `1px solid ${T.border}` }}><Ic size={11} />{l}</button>
                ))}
              </div>
            </div>

            <VerdictBanner verdict={verdict} confidence={summary.confidence} attackType={ai.attack_type} riskScore={risk.total} osintCount={osint.length} />
            <KillChain result={result} />

            {/* Risk breakdown */}
            {risk.parts.length > 0 && (
              <Card className="p-5">
                <SectionHead icon={Activity} title="Risk Score Breakdown" color={risk.color} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                  <Gauge value={risk.total} color={risk.color} size={130} label="risk score" />
                  <div className="space-y-3">
                    {risk.parts.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-mono w-36 truncate" style={{ color: T.text }}>{p.label}</span>
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <motion.div className="h-full rounded-full" style={{ background: p.color }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (p.value / 25) * 100)}%` }} transition={{ duration: 1, delay: i * 0.1 }} />
                        </div>
                        <span className="text-xs font-black w-8 text-right tabular-nums" style={{ color: p.color }}>+{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* IOCs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: "URLs Detected", items: ext.urls, color: T.red, icon: Globe, copy: true },
                { title: "Email Addresses", items: ext.emails, color: T.amber, icon: AtSign, copy: true },
                { title: "Phone Numbers", items: ext.phone_numbers, color: T.purple, icon: Phone, copy: true },
              ].map(({ title, items, color, icon: Ic, copy }) => (
                <Card key={title} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg" style={{ background: `${color}14` }}><Ic size={11} style={{ color }} /></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color }}>{title} ({items?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-8">
                    {items?.length ? items.map((it, i) => <Chip key={i} label={it} color={color} onClick={copy ? () => { navigator.clipboard.writeText(it); toast.success("Copied!"); } : undefined} />)
                      : <span className="text-xs font-mono" style={{ color: T.muted }}>None detected</span>}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pre-analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-5">
                <SectionHead icon={Zap} title="Urgency & Social Engineering" color={T.amber} />
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-3xl font-black tabular-nums" style={{ color: T.amber }}>{pre.urgency?.urgency_score ?? 0}</span>
                  <span className="text-xs font-mono" style={{ color: T.muted }}>/100</span>
                  {pre.urgency?.is_high_urgency && <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(255,184,0,0.15)", border: "1px solid rgba(255,184,0,0.3)", color: T.amber }}>HIGH</motion.span>}
                </div>
                <Bar score={pre.urgency?.urgency_score || 0} color={T.amber} />
                <div className="flex flex-wrap gap-1.5 mt-3">{pre.urgency?.urgency_keywords_found?.map((k, i) => <Chip key={i} label={k} color={T.amber} sm />) || <span className="text-xs font-mono" style={{ color: T.muted }}>None</span>}</div>
              </Card>
              <Card className="p-5">
                <SectionHead icon={Eye} title="Brand Impersonation" color={T.purple} />
                <div className="flex items-center gap-3 mb-3">
                  <motion.div animate={pre.impersonation?.impersonation_detected ? { opacity: [1, 0.4, 1] } : {}} transition={{ duration: 1.2, repeat: Infinity }} className="text-3xl font-black" style={{ color: pre.impersonation?.impersonation_detected ? T.red : T.green }}>
                    {pre.impersonation?.impersonation_detected ? "DETECTED" : "CLEAN"}
                  </motion.div>
                  {pre.impersonation?.impersonation_detected && <AlertTriangle size={22} style={{ color: T.red }} />}
                </div>
                <div className="flex flex-wrap gap-2">{pre.impersonation?.impersonated_brands?.map((b, i) => <Chip key={i} label={b.toUpperCase()} color={T.purple} />) || <span className="text-xs font-mono" style={{ color: T.muted }}>No impersonation</span>}</div>
              </Card>
            </div>

            <OSINTResults data={osint} />
            <AnalysisBlocks ai={ai} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── EMAIL ANALYZER PAGE ───────────────────────────────────────────────────────
function EmailAnalyzer() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const pushLog = (p, t, c) => setLogs(prev => [...prev.slice(-20), { prefix: p, text: t, color: c, id: Date.now() + Math.random() }]);

  const analyze = async () => {
    if (!input.trim()) { toast.error("Paste email source"); return; }
    setLoading(true); setResult(null); setLogs([]);
    [["INIT", "Parsing email headers...", T.cyan], ["CHAIN", "Tracing mail server hop chain..", "#a78bfa"], ["SPF", "Checking SPF record..", "#ffb800"], ["DKIM", "Verifying DKIM signature..", "#ffb800"], ["DMARC", "Checking DMARC policy..", "#ffb800"], ["SPOOF", "Display name spoof detection..", "#ff4444"], ["GEO", "Geolocating origin IP..", "#38bdf8"], ["LLM", "AI threat analysis...", T.cyan], ["REPORT", "Compiling forensics report..", "#00ff88"]].forEach(([p, t, c], i) => setTimeout(() => pushLog(p, t, c), i * 350));
    try {
      const r = await axios.post(`${API}/analyze/email`, { raw_email: input });
      setResult(r.data);
      const v = r.data?.master_verdict || "UNKNOWN";
      pushLog("DONE", `Analysis complete — ${v}`, v === "SAFE" ? T.green : T.red);
      if (v === "SAFE") toast.success("Email appears legitimate"); else toast.error(`${v} — Suspicious email!`);
    } catch (err) { const m = err.response?.data?.detail || "Analysis failed"; pushLog("ERROR", m, T.red); toast.error(m); }
    finally { setLoading(false); }
  };

  const ef = result?.email_forensics || {};
  const auth = ef.authentication || {};
  const headers = ef.parsed_headers || {};
  const spoof = ef.display_name_analysis || {};

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-black" style={{ color: T.text }}>Email Header <span style={{ color: T.amber }}>Analyzer</span></h2>
        <p className="text-sm" style={{ color: T.muted }}>Paste the raw email source including all headers. Right-click any email → "View Source" or "Show Original".</p>
      </div>
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: T.border }}>
          <Mail size={13} style={{ color: T.amber }} /><span className="text-[11px] font-mono" style={{ color: T.muted }}>Paste raw email source (headers + body)</span>
        </div>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={10} className="w-full p-5 text-xs font-mono resize-none focus:outline-none" style={{ background: "transparent", color: T.text, caretColor: T.amber, lineHeight: 1.7 }} placeholder={"Received: from mail.example.com (mail.example.com [1.2.3.4])\n\tby mx.google.com with ESMTP\nFrom: HDFC Bank <security@hdfc-alert.xyz>\nTo: you@gmail.com\nSubject: Urgent: KYC Update Required\nDate: Mon, 1 Jan 2025 10:00:00 +0530\n\nDear Customer,\nYour account needs verification...\n\nPaste full email here including all headers ↑"} />
        <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: T.border }}>
          <span className="text-[11px] font-mono" style={{ color: T.muted }}>{input.length} chars</span>
          <div className="flex gap-2">
            {input && <button onClick={() => { setInput(""); setResult(null); setLogs([]); }} className="px-3 py-1.5 rounded-xl text-xs" style={{ color: T.muted, border: `1px solid ${T.border}` }}>Clear</button>}
            <motion.button onClick={analyze} disabled={loading} whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: loading ? 1 : 0.97 }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: loading ? T.dim : "linear-gradient(135deg,#f59e0b,#ef4444)", boxShadow: loading ? "none" : `0 0 20px ${T.amber}30` }}>
              {loading ? <><Loader size={13} className="animate-spin" />Analyzing...</> : <><Mail size={13} />Analyze Email</>}
            </motion.button>
          </div>
        </div>
      </Card>
      <TermLog logs={logs} loading={loading} />
      {result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <VerdictBanner verdict={result.master_verdict || "UNKNOWN"} confidence={result.summary?.confidence} attackType={result.summary?.attack_type} riskScore={ef.risk_score || 0} osintCount={result.osint_results?.length || 0} />
          {/* Auth results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "SPF", data: auth.spf, icon: Shield },
              { label: "DKIM", data: auth.dkim, icon: Fingerprint },
              { label: "DMARC", data: auth.dmarc, icon: ShieldCheck },
            ].map(({ label, data, icon: Ic }) => {
              const col = data?.status === "PRESENT" ? T.green : data?.status === "MISSING" ? T.red : T.amber;
              return (
                <Card key={label} className="p-4">
                  <div className="flex items-center gap-2 mb-3"><Ic size={13} style={{ color: col }} /><span className="text-[10px] font-black uppercase tracking-widest" style={{ color: col }}>{label}</span></div>
                  <div className="text-xl font-black" style={{ color: col }}>{data?.status || "UNKNOWN"}</div>
                  <div className="text-[11px] font-mono mt-2 leading-relaxed" style={{ color: T.muted }}>{data?.risk || ""}</div>
                  {data?.record && <div className="mt-2 p-2 rounded-lg text-[10px] font-mono break-all" style={{ background: T.bg3, color: T.muted, border: `1px solid ${T.border}` }}>{data.record.slice(0, 80)}...</div>}
                </Card>
              );
            })}
          </div>
          {/* Parsed headers */}
          <Card className="p-5">
            <SectionHead icon={FileText} title="Parsed Email Headers" color={T.cyan} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[["From", headers.from], ["To", headers.to], ["Subject", headers.subject], ["Date", headers.date], ["Reply-To", headers.reply_to], ["Message-ID", headers.message_id], ["X-Mailer", headers.x_mailer], ["Origin IP", ef.originating_ip]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl" style={{ background: T.bg3, border: `1px solid ${T.border}` }}>
                  <div className="text-[9px] font-mono uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>{k}</div>
                  <div className="text-xs font-mono break-all" style={{ color: T.text }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          {/* Spoof check */}
          {spoof.issues?.length > 0 && (
            <Card className="p-5">
              <SectionHead icon={AlertCircle} title="Spoofing Detected" color={T.red} />
              <div className="space-y-2">
                {spoof.issues.map((issue, i) => (
                  <div key={i} className="p-3 rounded-xl text-sm font-mono" style={{ background: "rgba(255,0,51,0.06)", border: "1px solid rgba(255,0,51,0.2)", color: T.text }}>{issue.detail}</div>
                ))}
              </div>
            </Card>
          )}
          {/* Hop chain */}
          {ef.hop_chain?.length > 0 && (
            <Card className="p-5">
              <SectionHead icon={Network} title={`Mail Server Hop Chain (${ef.hop_count} hops)`} color={T.purple} />
              <div className="space-y-2">
                {ef.hop_chain.map((hop, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: T.bg3, border: `1px solid ${T.border}` }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black" style={{ background: `${T.purple}20`, border: `1px solid ${T.purple}30`, color: T.purple }}>{hop.hop}</div>
                    <div className="flex-1 min-w-0 text-xs font-mono space-y-0.5">
                      {hop.from_host && <div><span style={{ color: T.muted }}>from </span><span style={{ color: T.text }}>{hop.from_host}</span></div>}
                      {hop.by_host && <div><span style={{ color: T.muted }}>by </span><span style={{ color: T.text }}>{hop.by_host}</span></div>}
                      {hop.ip && <div><span style={{ color: T.muted }}>IP: </span><span style={{ color: T.cyan }}>{hop.ip}</span></div>}
                      {hop.timestamp && <div style={{ color: T.muted }}>{hop.timestamp}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <OSINTResults data={result.osint_results || []} />
          <AnalysisBlocks ai={result.llm_analysis?.ai_analysis || {}} />
        </motion.div>
      )}
    </div>
  );
}

// ── LEARN PAGE ────────────────────────────────────────────────────────────────
function Learn() {
  const [quiz, setQuiz] = useState(null);
  const [answered, setAnswered] = useState(null);
  const questions = [
    { q: "Which of these is a phishing URL?", options: ["https://www.sbi.co.in/home", "http://sbi-secure-login.xyz/verify", "https://onlinesbi.com/login", "https://retail.onlinesbi.com"], correct: 1, explain: "The second URL uses a suspicious domain (sbi-secure-login.xyz) instead of the official SBI domain (sbi.co.in or onlinesbi.com)." },
    { q: "An email says 'Your account will be BLOCKED in 24 hours!' What is this?", options: ["Normal security notice", "Urgency tactic (phishing)", "Genuine bank alert", "Password reset email"], correct: 1, explain: "Creating extreme urgency ('24 hours', 'BLOCKED') is a classic social engineering technique to make you act without thinking." },
    { q: "The sender email is 'HDFC Bank <noreply@hdfc-bank-secure.com>'. Is this legitimate?", options: ["Yes, it says HDFC Bank", "No, wrong domain", "Maybe, check the content", "Yes if it has HDFC logo"], correct: 1, explain: "HDFC Bank's official domain is hdfcbank.com. The domain hdfc-bank-secure.com is a lookalike domain used for phishing." },
    { q: "A QR code in a flyer says 'Scan to get ₹5000 cashback!' What should you do?", options: ["Scan immediately", "Scan the QR and enter details", "Analyze the URL before visiting", "Share with friends"], correct: 2, explain: "Always verify where a QR code leads before scanning. Use Sentinel AI's Forensics tab to decode and analyze any QR code URL." },
  ];
  const tips = [
    { icon: Mail, color: T.amber, title: "Check Sender Domain", tip: "Always verify the actual email domain, not just the display name. 'HDFC Bank <phish@fake.com>' is fake." },
    { icon: Globe, color: T.red, title: "Inspect URLs Before Clicking", tip: "Hover over links to see the real URL. Look for misspellings like 'amaz0n.com' or 'paypa1.com'." },
    { icon: Zap, color: T.orange, title: "Ignore Urgency Pressure", tip: "Legitimate companies never threaten to block accounts within hours. Urgency is a manipulation tactic." },
    { icon: Phone, color: T.purple, title: "Never Share OTP", tip: "No legitimate bank, government, or company will ever ask for your OTP, PIN, or password over a call or message." },
    { icon: QrCode, color: T.cyan, title: "Verify QR Codes", tip: "QR codes can redirect to malicious sites. Always analyze the decoded URL before visiting." },
    { icon: FileText, color: T.green, title: "Check Email Headers", tip: "The real origin of an email is in its headers. Use Sentinel's Email Analyzer to trace where an email actually came from." },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black" style={{ color: T.text }}>Security <span style={{ color: T.green }}>Academy</span></h2>
        <p className="text-sm mt-1" style={{ color: T.muted }}>Learn to recognize threats before they reach you.</p>
      </div>
      {/* Quiz */}
      <Card className="p-6">
        <SectionHead icon={Target} title="Phishing Detection Quiz" color={T.amber} />
        {!quiz ? (
          <div className="text-center py-8 space-y-4">
            <Target size={48} className="mx-auto" style={{ color: T.amber }} />
            <h3 className="text-lg font-black" style={{ color: T.text }}>Can you spot the phish?</h3>
            <p className="text-sm" style={{ color: T.muted }}>Test your ability to identify phishing attempts with real-world examples.</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setQuiz(0)} className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg,#f59e0b,#ff4444)" }}>Start Quiz</motion.button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono" style={{ color: T.muted }}>Question {quiz + 1} of {questions.length}</span>
              <Bar score={((quiz + 1) / questions.length) * 100} color={T.amber} h={3} />
            </div>
            <h3 className="text-base font-bold" style={{ color: T.text }}>{questions[quiz].q}</h3>
            <div className="grid grid-cols-1 gap-2">
              {questions[quiz].options.map((opt, i) => {
                const isCorrect = i === questions[quiz].correct;
                const isAnswered = answered !== null;
                const isSelected = answered === i;
                let borderCol = T.border, bgCol = T.bg3, textCol = T.text;
                if (isAnswered && isCorrect) { borderCol = T.green; bgCol = "rgba(0,255,136,0.1)"; textCol = T.green; }
                else if (isAnswered && isSelected && !isCorrect) { borderCol = T.red; bgCol = "rgba(255,0,51,0.1)"; textCol = T.red; }
                return (
                  <motion.button key={i} whileHover={!isAnswered ? { scale: 1.01 } : {}} onClick={() => { if (!isAnswered) setAnswered(i); }} disabled={isAnswered}
                    className="p-3.5 rounded-xl text-sm font-mono text-left transition-all" style={{ background: bgCol, border: `1px solid ${borderCol}`, color: textCol }}>
                    {opt}{isAnswered && isCorrect && " ✓"}{isAnswered && isSelected && !isCorrect && " ✗"}
                  </motion.button>
                );
              })}
            </div>
            {answered !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl space-y-2" style={{ background: answered === questions[quiz].correct ? "rgba(0,255,136,0.06)" : "rgba(255,0,51,0.06)", border: `1px solid ${answered === questions[quiz].correct ? T.green : T.red}` }}>
                <div className="text-sm font-bold" style={{ color: answered === questions[quiz].correct ? T.green : T.red }}>{answered === questions[quiz].correct ? "✓ Correct!" : "✗ Incorrect"}</div>
                <p className="text-xs font-mono" style={{ color: T.muted }}>{questions[quiz].explain}</p>
                <button onClick={() => { setAnswered(null); if (quiz < questions.length - 1) setQuiz(q => q + 1); else { setQuiz(null); } }} className="mt-2 px-4 py-2 rounded-lg text-xs font-bold" style={{ background: `${T.cyan}15`, color: T.cyan, border: `1px solid ${T.cyan}25` }}>
                  {quiz < questions.length - 1 ? "Next Question →" : "Finish Quiz"}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </Card>
      {/* Tips */}
      <div>
        <h3 className="text-lg font-black mb-4" style={{ color: T.text }}>Security Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map(({ icon: Ic, color, title, tip }) => (
            <Card key={title} className="p-5" glow={color}>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}22` }}><Ic size={15} style={{ color }} /></div>
                <div><h4 className="text-sm font-bold mb-1.5" style={{ color: T.text }}>{title}</h4><p className="text-xs leading-relaxed" style={{ color: T.muted }}>{tip}</p></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HISTORY PAGE ──────────────────────────────────────────────────────────────
function HistoryPage({ history, onLoad, onDelete, onClear }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black" style={{ color: T.text }}>Scan <span style={{ color: T.cyan }}>History</span></h2><p className="text-sm mt-1" style={{ color: T.muted }}>{history.length} scans recorded this session</p></div>
        {history.length > 0 && <button onClick={onClear} className="px-3 py-1.5 rounded-lg text-xs font-mono" style={{ background: "rgba(255,0,51,0.1)", color: T.red, border: "1px solid rgba(255,0,51,0.2)" }}>Clear All</button>}
      </div>
      {!history.length ? (
        <div className="text-center py-24 space-y-3">
          <History size={48} className="mx-auto" style={{ color: T.muted }} />
          <h3 className="text-lg font-bold" style={{ color: T.text }}>No History Yet</h3>
          <p className="text-sm" style={{ color: T.muted }}>Your scan history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map(h => {
            const vc = VERDICT[h.verdict] || VERDICT.UNKNOWN;
            return (
              <Card key={h.id} className="p-4 group cursor-pointer" onClick={() => onLoad(h)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl" style={{ background: vc.bg, border: `1px solid ${vc.border}` }}><vc.icon size={18} style={{ color: vc.color }} /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: `${vc.color}15`, color: vc.color, border: `1px solid ${vc.color}25` }}>{h.verdict}</span>
                        <span className="text-[10px] font-mono" style={{ color: T.muted }}>{new Date(h.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-sm font-mono truncate max-w-lg" style={{ color: T.text }}>{h.preview}</div>
                      <div className="text-[10px] font-mono mt-0.5" style={{ color: T.muted }}>{h.attackType !== "N/A" ? h.attackType : ""}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-mono" style={{ color: T.muted }}>Risk</div>
                      <div className="text-lg font-black" style={{ color: T.text }}>{h.score}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); onDelete(h.id); }} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20" style={{ color: T.red }}><X size={15} /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ABOUT PAGE ────────────────────────────────────────────────────────────────
function About() {
  const phases = [
    { n: "01", title: "LLM Engine", status: "LIVE", color: T.green, items: ["OpenRouter AI reasoning (GPT-4o/Claude)", "MITRE ATT&CK auto-mapping", "Urgency language detection", "Brand impersonation detection", "IOC extraction (URLs/emails/phones)"] },
    { n: "02", title: "OSINT Engine", status: "LIVE", color: T.green, items: ["VirusTotal (70+ AV engines)", "Google Safe Browsing API", "IP Geolocation (ip-api.com)", "WHOIS & domain age analysis", "Typosquatting detection (40+ brands)"] },
    { n: "03", title: "Forensics Engine", status: "LIVE", color: T.green, items: ["Screenshot OCR (Tesseract)", "QR code decoding (pyzbar)", "PDF text & link extraction", "DOCX analysis", "File metadata extraction"] },
    { n: "04", title: "Email Forensics", status: "LIVE", color: T.green, items: ["SPF/DKIM/DMARC validation", "Mail server hop chain tracing", "Display name spoof detection", "Reply-To mismatch detection", "Origin IP geolocation"] },
    { n: "05", title: "UPI Scam Detector", status: "SOON", color: T.amber, items: ["India-specific threat patterns", "UPI collect fraud detection", "KYC scam recognition", "TRAI/RBI impersonation", "Hindi urgency language"] },
    { n: "06", title: "Chrome Extension", status: "SOON", color: T.muted, items: ["Real-time link scanning", "Gmail integration", "Warning overlays", "Toolbar quick scan", "Right-click analysis"] },
  ];
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 py-6">
        <div className="flex justify-center"><RadarPulse color={T.cyan} size={80} /></div>
        <h2 className="text-3xl font-black" style={{ color: T.text }}>About <span style={{ color: T.cyan }}>Sentinel AI</span></h2>
        <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: T.muted }}>India's first open-source AI-powered Cyber Threat Intelligence platform. Enterprise-grade security analysis for everyone, free.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phases.map(ph => (
          <Card key={ph.n} className="p-5" glow={ph.color}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono" style={{ color: T.muted }}>PHASE {ph.n}</span>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: `${ph.color}15`, color: ph.color, border: `1px solid ${ph.color}25` }}>{ph.status}</span>
            </div>
            <h3 className="text-sm font-black mb-3" style={{ color: T.text }}>{ph.title}</h3>
            <ul className="space-y-1.5">{ph.items.map((it, i) => <li key={i} className="flex items-start gap-2 text-xs font-mono" style={{ color: T.muted }}><span style={{ color: ph.color, marginTop: 1 }}>▸</span>{it}</li>)}</ul>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <SectionHead icon={Info} title="Built By" color={T.cyan} />
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl" style={{ background: `${T.cyan}10`, border: `1px solid ${T.cyan}20` }}><User size={24} style={{ color: T.cyan }} /></div>
          <div>
            <div className="text-base font-black" style={{ color: T.text }}>Pranay Kumar Vonamala</div>
            <div className="text-sm" style={{ color: T.muted }}>B.Tech CSE — VIT Vellore • Batch 2024–2028</div>
            <div className="flex gap-3 mt-2">
              {[["GitHub", "https://github.com/Pranay-Kumar-02"], ["LinkedIn", "https://www.linkedin.com/in/pranay-kumar-vonamala/"]].map(([l, u]) => (
                <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-mono hover:opacity-80 transition-opacity" style={{ color: T.cyan }}>{l}<ExternalLink size={10} /></a>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── NETWORK ICON SHIM ─────────────────────────────────────────────────────────
const Network = ({ size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="9" y="2" width="6" height="6" rx="1" /><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" />
    <path d="M5 16V8a1 1 0 011-1h12a1 1 0 011 1v8" /><path d="M12 8v4" /><path d="M5 16l7-4 7 4" />
  </svg>
);

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, collapsed, setCollapsed, threatCount }) {
  const nav = [
    { id: "home", icon: LayoutDashboard, label: "Command Center" },
    { id: "scanner", icon: Search, label: "Threat Scanner" },
    { id: "forensics", icon: FileSearch, label: "Forensics Lab" },
    { id: "email", icon: Mail, label: "Email Analyzer" },
    { id: "osint", icon: Radar, label: "OSINT Recon" },
    { id: "intel", icon: BarChart2, label: "Intelligence" },
    { id: "history", icon: History, label: "Scan History" },
    { id: "learn", icon: BookOpen, label: "Learn" },
    { id: "about", icon: Info, label: "About" },
  ];
  return (
    <motion.aside animate={{ width: collapsed ? 64 : 240 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden"
      style={{ background: "rgba(6,12,24,0.95)", backdropFilter: "blur(20px)", borderRight: `1px solid ${T.border}` }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: T.border, minHeight: 72 }}>
        <motion.div whileHover={{ rotate: 15 }} className="relative p-2 rounded-xl flex-shrink-0" style={{ background: `${T.cyan}12`, border: `1px solid ${T.cyan}25` }}>
          <div className="absolute inset-0 rounded-xl blur-md opacity-40" style={{ background: T.cyan }} />
          <Shield size={16} style={{ color: T.cyan, position: "relative" }} />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="text-sm font-black tracking-[0.2em] whitespace-nowrap" style={{ color: T.text }}>SENTINEL <Glitch text="AI" color={T.cyan} /></div>
              <div className="text-[8px] tracking-[0.3em] font-mono whitespace-nowrap" style={{ color: T.muted }}>CYBER INTEL v3.0</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(c => !c)} className="ml-auto flex-shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: T.muted }}>
          <Menu size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {nav.map(({ id, icon: Ic, label }) => {
          const active = page === id;
          return (
            <motion.button key={id} whileHover={{ x: 2 }} onClick={() => setPage(id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group"
              style={{ background: active ? `${T.cyan}12` : "transparent", color: active ? T.cyan : T.muted, border: `1px solid ${active ? `${T.cyan}25` : "transparent"}` }}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full" style={{ background: T.cyan, boxShadow: `0 0 8px ${T.cyan}` }} />}
              <Ic size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs font-semibold whitespace-nowrap">{label}</motion.span>
                )}
              </AnimatePresence>
              {id === "scanner" && threatCount > 0 && !collapsed && (
                <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: `${T.red}20`, color: T.red, border: `1px solid ${T.red}30` }}>{threatCount}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Status */}
      <div className="px-3 py-4 border-t" style={{ borderColor: T.border }}>
        <div className="flex items-center gap-2.5">
          <motion.div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: T.green }} animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] font-mono" style={{ color: T.green }}>ALL ENGINES ONLINE</motion.span>}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useLS("sentinel_history_v3", []);
  const [scans, setScans] = useState(0);
  const [threatCount, setThreatCount] = useState(0);

  // Scanner state
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [engineStates, setEngineStates] = useState({});

  // Forensics state
  const [forensicsResult, setForensicsResult] = useState(null);
  const [fLoading, setFLoading] = useState(false);
  const [fLogs, setFLogs] = useState([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const handleMouse = useCallback(e => { mouseX.set(e.clientX); mouseY.set(e.clientY); }, []);

  useEffect(() => {
    const hk = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setPage("scanner"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "h") { e.preventDefault(); setPage("home"); }
    };
    window.addEventListener("keydown", hk); return () => window.removeEventListener("keydown", hk);
  }, []);

  const handleScanResult = useCallback(data => {
    setScanResult(data);
    if (data) {
      setScans(s => s + 1);
      const v = data?.master_verdict || data?.summary?.verdict || "UNKNOWN";
      if (v !== "SAFE" && v !== "UNKNOWN") setThreatCount(t => t + 1);
      const entry = { id: Date.now().toString(), timestamp: new Date().toISOString(), preview: (Object.values(data?.auto_extracted?.urls || {})[0] || "Scan #" + (scans + 1)).toString().substring(0, 80), verdict: v, confidence: data?.summary?.confidence || data?.llm_analysis?.summary?.confidence || 0, attackType: data?.summary?.attack_type || data?.llm_analysis?.summary?.attack_type || "N/A", score: calcRisk(data).total, result: data };
      setHistory(prev => [entry, ...prev].slice(0, 50));
    }
  }, [scans]);

  const updateEngines = useCallback(u => setEngineStates(p => ({ ...p, ...u })), []);

  // Wrap Scanner analyze to also update engines
  const wrappedSetLoading = useCallback(v => {
    setLoading(v);
    if (v) { updateEngines({ parser: "SCANNING", ioc: "WAITING", urgency: "WAITING", brand: "WAITING", url: "WAITING", typo: "WAITING", vt: "WAITING", safe: "WAITING", llm: "WAITING", mitre: "WAITING" }); }
  }, []);

  const sideW = collapsed ? 64 : 240;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text }} onMouseMove={handleMouse}>
      <HexGrid /><Particles /><ScanLine /><GridLines /><Noise />

      {/* Mouse glow */}
      <motion.div className="fixed pointer-events-none rounded-full" style={{ width: 500, height: 500, marginLeft: -250, marginTop: -250, background: `radial-gradient(circle,${T.cyan}06 0%,transparent 70%)`, x: springX, y: springY, zIndex: 0 }} />

      <Toaster position="top-right" toastOptions={{ style: { background: "#080d1a", color: T.text, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "Inter" } }} />

      {/* Sidebar */}
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} threatCount={threatCount} />

      {/* Main */}
      <motion.main animate={{ marginLeft: sideW }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 min-h-screen" style={{ paddingLeft: 0 }}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 border-b" style={{ background: "rgba(3,7,15,0.9)", backdropFilter: "blur(16px)", borderColor: T.border }}>
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold capitalize" style={{ color: T.text }}>{page === "home" ? "Command Center" : page === "intel" ? "Intelligence Hub" : page.charAt(0).toUpperCase() + page.slice(1)}</div>
            <ThreatTicker />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: T.green }}>ONLINE</span>
            </div>
            <button onClick={() => setPage("home")} className="p-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: T.muted }}><Bell size={15} /></button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              {page === "home" && <CommandCenter history={history} scans={scans} threats={threatCount} onNavigate={setPage} />}
              {page === "scanner" && <Scanner onResult={handleScanResult} result={scanResult} loading={loading} setLoading={wrappedSetLoading} logs={logs} setLogs={setLogs} engineStates={engineStates} />}
              {page === "forensics" && (
                <div className="space-y-5">
                  <div><h2 className="text-2xl font-black" style={{ color: T.text }}>Forensics <span style={{ color: T.purple }}>Lab</span></h2><p className="text-sm mt-1" style={{ color: T.muted }}>Upload screenshots, QR codes, PDFs, or documents for deep threat analysis.</p></div>
                  <ForensicsUpload onResult={setForensicsResult} setLoading={setFLoading} setLogs={setFLogs} loading={fLoading} />
                  <TermLog logs={fLogs} loading={fLoading} />
                  {forensicsResult && !fLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <VerdictBanner verdict={forensicsResult.master_verdict || "UNKNOWN"} confidence={forensicsResult.summary?.confidence} attackType={forensicsResult.summary?.attack_type} riskScore={forensicsResult.email_forensics?.risk_score || calcRisk(forensicsResult).total} osintCount={forensicsResult.osint_results?.length || 0} />
                      {forensicsResult.forensics && (
                        <Card className="p-5">
                          <SectionHead icon={FileSearch} title="Extraction Report" color={T.purple} />
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            {[["File Type", (forensicsResult.forensics?.file_type || "—").toUpperCase(), T.cyan], ["Size", `${forensicsResult.forensics?.file_size_kb || 0} KB`, T.purple], ["URLs Found", forensicsResult.forensics?.extracted_urls?.length || 0, T.red], ["Characters", forensicsResult.forensics?.char_count || 0, T.green]].map(([l, v, c]) => (
                              <div key={l} className="rounded-xl p-3 text-center" style={{ background: T.bg3, border: `1px solid ${T.border}` }}><div className="text-xl font-black tabular-nums" style={{ color: c }}>{typeof v === "number" ? <Counter to={v} /> : v}</div><div className="text-[10px] font-mono mt-0.5" style={{ color: T.muted }}>{l}</div></div>
                            ))}
                          </div>
                          {forensicsResult.forensics?.extracted_urls?.length > 0 && <div className="flex flex-wrap gap-1.5">{forensicsResult.forensics.extracted_urls.map((u, i) => <Chip key={i} label={u} color={T.red} />)}</div>}
                          {forensicsResult.forensics?.extracted_text && <div className="mt-4 p-3 rounded-xl max-h-32 overflow-y-auto" style={{ background: T.bg3, border: `1px solid ${T.border}` }}><p className="text-xs font-mono whitespace-pre-wrap" style={{ color: T.muted }}>{forensicsResult.forensics.extracted_text.slice(0, 400)}...</p></div>}
                        </Card>
                      )}
                      <OSINTResults data={forensicsResult.osint_results || []} />
                      <AnalysisBlocks ai={forensicsResult.llm_analysis?.ai_analysis || {}} />
                    </motion.div>
                  )}
                </div>
              )}
              {page === "email" && <EmailAnalyzer />}
              {page === "osint" && (
                <div className="space-y-5">
                  <div><h2 className="text-2xl font-black" style={{ color: T.text }}>OSINT <span style={{ color: T.green }}>Recon</span></h2><p className="text-sm mt-1" style={{ color: T.muted }}>Deep domain intelligence — paste any URL or domain for full OSINT investigation.</p></div>
                  <OsintRecon />
                </div>
              )}
              {page === "intel" && <Intel history={history} />}
              {page === "history" && <HistoryPage history={history} onLoad={h => { setScanResult(h.result); setPage("scanner"); toast("Loaded scan"); }} onDelete={id => setHistory(p => p.filter(h => h.id !== id))} onClear={() => { if (confirm("Clear all history?")) setHistory([]); }} />}
              {page === "learn" && <Learn />}
              {page === "about" && <About />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;}html{background:${T.bg};}body{margin:0;font-family:'Inter',sans-serif;background:${T.bg};overflow-x:hidden;}
        .font-mono,textarea,code,pre{font-family:'JetBrains Mono',monospace!important;}
        textarea::placeholder{color:${T.muted};opacity:0.5;}
        textarea{scrollbar-width:thin;scrollbar-color:${T.border} transparent;}
        ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.dim};border-radius:2px;}::-webkit-scrollbar-thumb:hover{background:${T.cyan}50;}
        *{transition:border-color 0.2s,box-shadow 0.2s;}
        @media print{nav,aside{display:none!important;}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}}
      `}</style>
    </div>
  );
}

// ── OSINT RECON PAGE ──────────────────────────────────────────────────────────
function OsintRecon() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!url.trim()) { toast.error("Enter a URL or domain"); return; }
    setLoading(true); setResult(null);
    try { const r = await axios.post(`${API}/osint`, { url: url.trim() }); setResult(r.data); toast.success("OSINT complete"); }
    catch { toast.error("OSINT scan failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <SectionHead icon={Radar} title="Domain Intelligence Scan" color={T.green} />
        <div className="flex gap-3">
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="Enter URL or domain (e.g. suspicious-domain.xyz)" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-mono focus:outline-none" style={{ background: T.bg3, border: `1px solid ${T.border}`, color: T.text, caretColor: T.green }} />
          <motion.button onClick={run} disabled={loading} whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: loading ? 1 : 0.97 }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: loading ? T.dim : "linear-gradient(135deg,#10b981,#3b82f6)", boxShadow: loading ? "none" : `0 0 20px ${T.green}30` }}>
            {loading ? <><Loader size={13} className="animate-spin" />Scanning...</> : <><Radar size={13} />Scan</>}
          </motion.button>
        </div>
      </Card>
      {result && <OSINTResults data={[result]} />}
    </div>
  );
}