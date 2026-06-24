import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Loader,
  Search, Zap, Globe, Lock, Terminal, Eye, Cpu, Radio,
  ChevronRight, RotateCcw, Moon, Sun, Layers, Activity,
  Database, Wifi, Server, Code, AlertCircle, TrendingUp
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

// ── THEMES ────────────────────────────────────────────────────────────────────
const THEMES = {
  cyber: {
    name: "Cyber Dark",
    bg: "#03070f",
    bgCard: "#080d1a",
    bgInput: "#020508",
    border: "rgba(0,212,255,0.12)",
    borderHover: "rgba(0,212,255,0.35)",
    accent: "#00d4ff",
    accent2: "#6366f1",
    text: "#e2e8f0",
    muted: "#334155",
    dimmed: "#0f172a",
    glow: "rgba(0,212,255,0.15)",
    grid: "rgba(0,212,255,0.025)",
    navBg: "rgba(3,7,15,0.9)",
    gradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
  },
  matrix: {
    name: "Matrix",
    bg: "#000800",
    bgCard: "#001200",
    bgInput: "#000500",
    border: "rgba(0,255,65,0.12)",
    borderHover: "rgba(0,255,65,0.35)",
    accent: "#00ff41",
    accent2: "#00cc33",
    text: "#00ff41",
    muted: "#005510",
    dimmed: "#001a00",
    glow: "rgba(0,255,65,0.12)",
    grid: "rgba(0,255,65,0.03)",
    navBg: "rgba(0,8,0,0.95)",
    gradient: "linear-gradient(135deg, #00ff41, #00cc33)",
  },
  blood: {
    name: "Blood Red",
    bg: "#0a0000",
    bgCard: "#150000",
    bgInput: "#080000",
    border: "rgba(255,30,30,0.12)",
    borderHover: "rgba(255,30,30,0.4)",
    accent: "#ff1e1e",
    accent2: "#ff6b35",
    text: "#ffe0e0",
    muted: "#3d0000",
    dimmed: "#1a0000",
    glow: "rgba(255,30,30,0.12)",
    grid: "rgba(255,30,30,0.025)",
    navBg: "rgba(10,0,0,0.95)",
    gradient: "linear-gradient(135deg, #ff1e1e, #ff6b35)",
  },
  ghost: {
    name: "Ghost White",
    bg: "#f0f4f8",
    bgCard: "#ffffff",
    bgInput: "#f8fafc",
    border: "rgba(99,102,241,0.15)",
    borderHover: "rgba(99,102,241,0.4)",
    accent: "#6366f1",
    accent2: "#8b5cf6",
    text: "#1e293b",
    muted: "#94a3b8",
    dimmed: "#e2e8f0",
    glow: "rgba(99,102,241,0.1)",
    grid: "rgba(99,102,241,0.04)",
    navBg: "rgba(240,244,248,0.95)",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  gold: {
    name: "Sovereign Gold",
    bg: "#0a0800",
    bgCard: "#120f00",
    bgInput: "#080600",
    border: "rgba(255,184,0,0.12)",
    borderHover: "rgba(255,184,0,0.4)",
    accent: "#ffb800",
    accent2: "#ff8c00",
    text: "#fff8e0",
    muted: "#3d2e00",
    dimmed: "#1a1400",
    glow: "rgba(255,184,0,0.1)",
    grid: "rgba(255,184,0,0.025)",
    navBg: "rgba(10,8,0,0.95)",
    gradient: "linear-gradient(135deg, #ffb800, #ff8c00)",
  },
};

const VERDICT_CONFIG = {
  SAFE: { color: "#00ff88", bg: "rgba(0,255,136,0.06)", border: "rgba(0,255,136,0.25)", label: "SAFE", icon: CheckCircle, pulse: false },
  SUSPICIOUS: { color: "#ffb800", bg: "rgba(255,184,0,0.06)", border: "rgba(255,184,0,0.25)", label: "SUSPICIOUS", icon: AlertTriangle, pulse: false },
  DANGEROUS: { color: "#ff4444", bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.3)", label: "DANGEROUS", icon: XCircle, pulse: true },
  CRITICAL: { color: "#ff0033", bg: "rgba(255,0,51,0.08)", border: "rgba(255,0,51,0.5)", label: "CRITICAL", icon: XCircle, pulse: true },
  UNKNOWN: { color: "#4a5568", bg: "rgba(74,85,104,0.06)", border: "rgba(74,85,104,0.2)", label: "UNKNOWN", icon: Shield, pulse: false },
};

// ── PARTICLE SYSTEM ────────────────────────────────────────────────────────────
function Particles({ theme, count = 40 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  ).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: theme.accent,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [p.opacity, p.opacity * 0.2, p.opacity],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── HEX GRID ───────────────────────────────────────────────────────────────────
function HexGrid({ theme }) {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <pattern id="hexgrid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon points="30,2 56,15 56,37 30,50 4,37 4,15"
            fill="none" stroke={theme.accent} strokeWidth="0.6" opacity="0.15" />
        </pattern>
        <radialGradient id="hexfade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="1" />
        </radialGradient>
        <mask id="hexmask">
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill="url(#hexfade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexgrid)" mask="url(#hexmask)" />
    </svg>
  );
}

// ── SCAN LINE ──────────────────────────────────────────────────────────────────
function ScanLine({ theme }) {
  return (
    <motion.div className="fixed left-0 right-0 h-px pointer-events-none"
      style={{
        background: `linear-gradient(90deg, transparent 0%, ${theme.accent}80 30%, ${theme.accent} 50%, ${theme.accent}80 70%, transparent 100%)`,
        zIndex: 1, boxShadow: `0 0 12px ${theme.accent}`,
      }}
      animate={{ top: ["-2px", "100vh"] }}
      transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
    />
  );
}

// ── GLITCH TEXT ────────────────────────────────────────────────────────────────
function GlitchText({ text, theme }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-block">
      {glitch && (
        <>
          <span className="absolute inset-0" style={{
            color: "#ff0033", clipPath: "polygon(0 20%, 100% 20%, 100% 40%, 0 40%)",
            transform: "translateX(-2px)", opacity: 0.8,
          }}>{text}</span>
          <span className="absolute inset-0" style={{
            color: "#00d4ff", clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)",
            transform: "translateX(2px)", opacity: 0.8,
          }}>{text}</span>
        </>
      )}
      <span style={{ color: theme.accent }}>{text}</span>
    </span>
  );
}

// ── MATRIX RAIN ────────────────────────────────────────────────────────────────
function MatrixRain({ theme }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (theme.name !== "Matrix") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const chars = "アイウエオカキクケコSENTINELAI01";
    const draw = () => {
      ctx.fillStyle = "rgba(0,8,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = "13px JetBrains Mono, monospace";
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(draw, 45);
    return () => clearInterval(interval);
  }, [theme]);

  if (theme.name !== "Matrix") return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.15 }} />;
}

// ── COUNTER ────────────────────────────────────────────────────────────────────
function Counter({ value, duration = 1000 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let start = 0, raf;
    const t0 = performance.now();
    const tick = (t) => {
      const progress = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setN(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

// ── RADAR PULSE ────────────────────────────────────────────────────────────────
function RadarPulse({ color, size = 100, icon: Icon = Shield }) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      {[0.4, 0.65, 0.9].map((scale, i) => (
        <motion.div key={i} className="absolute rounded-full border"
          style={{ width: size * scale, height: size * scale, borderColor: color }}
          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
      <div className="relative z-10 flex items-center justify-center rounded-full"
        style={{ width: size * 0.38, height: size * 0.38, background: `${color}18`, border: `2px solid ${color}50` }}>
        <Icon size={size * 0.18} style={{ color }} />
      </div>
    </div>
  );
}

// ── SHIMMER BAR ────────────────────────────────────────────────────────────────
function ShimmerBar({ score, color, height = 6 }) {
  return (
    <div className="relative w-full rounded-full overflow-hidden" style={{ height, background: "rgba(255,255,255,0.05)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
        initial={{ width: 0 }} animate={{ width: `${score}%` }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div className="absolute inset-y-0 w-16 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
        animate={{ left: ["-10%", "110%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }} />
    </div>
  );
}

// ── CHIP ───────────────────────────────────────────────────────────────────────
function Chip({ label, color }) {
  return (
    <motion.span whileHover={{ scale: 1.05 }}
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold cursor-default"
      style={{ background: `${color}14`, border: `1px solid ${color}28`, color }}>
      {label}
    </motion.span>
  );
}

// ── BLOCK ──────────────────────────────────────────────────────────────────────
function Block({ title, icon: Icon, color, children, delay = 0, theme, fullWidth = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`rounded-2xl p-5 space-y-3 transition-all duration-300 ${fullWidth ? "col-span-full" : ""}`}
      style={{
        background: theme.bgCard,
        border: `1px solid ${hovered ? color + "35" : theme.border}`,
        boxShadow: hovered ? `0 0 30px ${color}12` : "none",
      }}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}14` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color }}>
          {title}
        </span>
      </div>
      {children}
    </motion.div>
  );
}

// ── TERMINAL LOG ───────────────────────────────────────────────────────────────
function TerminalLog({ logs, loading, theme }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);

  return (
    <AnimatePresence>
      {(loading || logs.length > 0) && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: theme.border }}>
            <Terminal size={11} style={{ color: theme.accent }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.muted }}>
              sentinel.log
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              {loading && <>
                <motion.div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: theme.accent }}
                  animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
                <span className="text-[10px] font-mono" style={{ color: theme.accent }}>LIVE</span>
              </>}
            </div>
          </div>
          <div ref={ref} className="p-4 space-y-1.5 max-h-36 overflow-y-auto">
            {logs.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 font-mono text-xs">
                <span className="shrink-0 font-bold" style={{ color: l.color, minWidth: 72 }}>
                  [{l.prefix}]
                </span>
                <span style={{ color: theme.muted }}>{l.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── THEME SWITCHER ─────────────────────────────────────────────────────────────
function ThemeSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: current.accent }}>
        <Layers size={11} />
        {current.name}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50 min-w-40"
            style={{ background: "#0a0f1e", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key} onClick={() => { onChange(t); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono text-left transition-colors hover:bg-white/5"
                style={{ color: t.accent }}>
                <div className="w-3 h-3 rounded-full" style={{ background: t.accent }} />
                {t.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── STAT CARD ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, theme }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div whileHover={{ y: -2 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-4 transition-all duration-300"
      style={{
        background: theme.bgCard,
        border: `1px solid ${hovered ? color + "30" : theme.border}`,
        boxShadow: hovered ? `0 8px 30px ${color}10` : "none",
      }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}14` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.muted }}>
          {label}
        </span>
      </div>
      <div className="text-xl font-black tabular-nums" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] mt-0.5 font-mono" style={{ color: theme.muted }}>{sub}</div>}
    </motion.div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useState(THEMES.cyber);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState(0);
  const [logs, setLogs] = useState([]);
  const [threats, setThreats] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, []);

  const pushLog = (prefix, text, color) =>
    setLogs(p => [...p.slice(-20), { prefix, text, color, id: Date.now() + Math.random() }]);

  const analyze = async () => {
    if (!input.trim()) { toast.error("Paste something to analyze."); return; }
    setLoading(true);
    setResult(null);
    setLogs([]);

    const steps = [
      ["INIT", "Initializing Sentinel AI threat engine...", theme.accent],
      ["PARSE", "Parsing input — extracting IOCs...", "#a78bfa"],
      ["EXTRACT", "Auto-detecting URLs, emails, phone numbers...", "#a78bfa"],
      ["SCAN", "Running urgency pattern detection...", theme.accent],
      ["IMPRSN", "Checking brand impersonation database...", "#ffb800"],
      ["OSINT", "Cross-referencing threat intelligence feeds...", "#00ff88"],
      ["LLM", "Routing to AI reasoning engine (GPT-4o)...", theme.accent],
      ["MITRE", "Mapping to MITRE ATT&CK framework...", "#ff4444"],
      ["REPORT", "Generating threat intelligence report...", "#00ff88"],
    ];

    steps.forEach(([prefix, text, color], i) => {
      setTimeout(() => pushLog(prefix, text, color), i * 350);
    });

    try {
      const res = await axios.post(`${API_URL}/analyze`, { text: input });
      setResult(res.data);
      setScans(p => p + 1);
      const v = res.data?.summary?.verdict;
      if (v !== "SAFE") setThreats(p => p + 1);
      pushLog("DONE", `Analysis complete — Verdict: ${v}`, v === "SAFE" ? "#00ff88" : "#ff4444");
      if (v === "SAFE") toast.success("✅ No threats detected.");
      else if (v === "SUSPICIOUS") toast("⚠️ Suspicious content detected!", { icon: "⚠️" });
      else toast.error(`🚨 ${v} threat detected!`);
    } catch {
      pushLog("ERROR", "Connection failed — is backend running on :8000?", "#ff4444");
      toast.error("Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const ai = result?.ai_analysis || {};
  const ext = result?.auto_extracted || {};
  const pre = result?.pre_analysis || {};
  const verdict = result?.summary?.verdict || null;
  const vc = verdict ? (VERDICT_CONFIG[verdict] || VERDICT_CONFIG.UNKNOWN) : null;
  const VIcon = vc?.icon || Shield;

  return (
    <div className="min-h-screen relative" style={{ background: theme.bg, color: theme.text }}
      onMouseMove={handleMouseMove}>

      {/* Backgrounds */}
      <HexGrid theme={theme} />
      <Particles theme={theme} count={35} />
      <MatrixRain theme={theme} />
      <ScanLine theme={theme} />

      {/* Mouse glow follower */}
      <motion.div className="fixed pointer-events-none rounded-full"
        style={{
          width: 500, height: 500, marginLeft: -250, marginTop: -250,
          background: `radial-gradient(circle, ${theme.accent}06 0%, transparent 70%)`,
          x: mouseX, y: mouseY, zIndex: 0,
        }} />

      {/* Top ambient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ width: 800, height: 300, background: `radial-gradient(ellipse, ${theme.accent}08 0%, transparent 65%)`, zIndex: 0 }} />

      <Toaster position="top-right" toastOptions={{
        style: { background: theme.bgCard, color: theme.text, border: `1px solid ${theme.border}`, fontSize: 13, fontFamily: "Inter" }
      }} />

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b"
        style={{ background: theme.navBg, backdropFilter: "blur(20px)", borderColor: theme.border }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}
              className="relative p-2 rounded-xl"
              style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}28` }}>
              <div className="absolute inset-0 rounded-xl blur-lg opacity-40" style={{ background: theme.accent }} />
              <Shield size={16} style={{ color: theme.accent, position: "relative" }} />
            </motion.div>
            <div>
              <div className="text-sm font-black tracking-[0.25em]" style={{ color: theme.text }}>
                SENTINEL <GlitchText text="AI" theme={theme} />
              </div>
              <div className="text-[9px] tracking-[0.3em] font-mono" style={{ color: theme.muted }}>
                CYBER THREAT INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00ff88" }}
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-[10px] font-mono font-bold" style={{ color: "#00ff88" }}>ONLINE</span>
            </div>
            <ThemeSwitcher current={theme} onChange={setTheme} />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-6">

        {/* ── HERO ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-5 pt-4 pb-4">

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
            style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}20`, color: theme.accent }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <Radio size={10} />
            </motion.div>
            AI-Powered • Real-Time • Multi-Layer Threat Detection
          </motion.div>

          <div className="space-y-2">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl sm:text-6xl font-black tracking-tight leading-none"
              style={{ color: theme.text }}>
              Detect threats before
            </motion.h1>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-5xl sm:text-6xl font-black tracking-tight leading-none"
              style={{
                background: theme.gradient,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              they reach you.
            </motion.h1>
          </div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: theme.muted }}>
            Paste any message, URL, email, SMS, or notification.
            Sentinel AI runs <strong style={{ color: theme.accent }}>10 detection engines</strong> simultaneously
            and delivers a full threat intelligence report in seconds.
          </motion.p>
        </motion.div>

        {/* ── STATS ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Activity} label="Scans" value={scans} sub="this session" color={theme.accent} theme={theme} />
          <StatCard icon={Shield} label="Threats" value={threats} sub="detected" color="#ff4444" theme={theme} />
          <StatCard icon={Cpu} label="Engines" value="10" sub="active" color="#a78bfa" theme={theme} />
          <StatCard icon={Database} label="AI Model" value="GPT-4o" sub="via OpenRouter" color="#ffb800" theme={theme} />
        </motion.div>

        {/* ── INPUT TERMINAL ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, boxShadow: `0 0 0 1px ${theme.border}` }}>

          {/* Window bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
                  <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <span className="text-[11px] font-mono ml-2" style={{ color: theme.muted }}>
                sentinel@ai:~$ analyze_threat
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: theme.muted }}>
              <Wifi size={10} style={{ color: "#00ff88" }} />
              <span style={{ color: "#00ff88" }}>connected</span>
            </div>
          </div>

          {/* Input */}
          <div className="relative">
            <div className="absolute left-5 top-4 text-[11px] font-mono select-none" style={{ color: theme.muted }}>
              &gt;_
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.ctrlKey && e.key === "Enter") analyze(); }}
              placeholder={"Paste anything suspicious here...\n\nExamples:\n  • \"Your HDFC account is blocked. Verify at http://hdfc-alert.xyz/login\"\n  • Full email with headers (paste everything)\n  • WhatsApp or SMS message\n  • Suspicious URL\n  • QR code destination link\n\n  Ctrl + Enter to analyze instantly"}
              rows={9}
              className="w-full pl-12 pr-5 pt-4 pb-4 text-sm font-mono resize-none focus:outline-none transition-all"
              style={{
                background: "transparent",
                color: theme.text,
                caretColor: theme.accent,
                lineHeight: 1.8,
              }} />

            {/* Bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
              style={{ background: `linear-gradient(transparent, ${theme.bgCard}80)` }} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: theme.border }}>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono" style={{ color: theme.muted }}>
                {input.length}<span style={{ color: theme.dimmed }}>/10000</span>
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono" style={{ color: theme.dimmed }}>
                {["MSG", "URL", "EMAIL", "SMS", "DOC"].map((t, i) => (
                  <span key={t}>
                    <span style={{ color: theme.muted }}>{t}</span>
                    {i < 4 && <span className="mx-1">·</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {input && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setInput(""); setResult(null); setLogs([]); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ color: theme.muted, border: `1px solid ${theme.border}` }}>
                  <RotateCcw size={11} /> Clear
                </motion.button>
              )}
              <motion.button onClick={analyze} disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.03, boxShadow: loading ? "none" : `0 0 30px ${theme.accent}40` }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white transition-all"
                style={{
                  background: loading ? theme.dimmed : theme.gradient,
                  color: loading ? theme.muted : "white",
                  boxShadow: loading ? "none" : `0 0 20px ${theme.accent}30`,
                }}>
                {loading
                  ? <><Loader size={13} className="animate-spin" /> Analyzing...</>
                  : <><Eye size={13} /> Analyze Threat</>}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── TERMINAL LOG ── */}
        <TerminalLog logs={logs} loading={loading} theme={theme} />

        {/* ── RESULTS ── */}
        <AnimatePresence>
          {result && !loading && vc && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

              {/* Verdict hero */}
              <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl p-7 relative overflow-hidden"
                style={{ background: vc.bg, border: `1px solid ${vc.border}` }}>

                {/* Ambient radial */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 75% 50%, ${vc.color}0c 0%, transparent 60%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${vc.color}60, transparent)` }} />

                <div className="relative flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex items-center gap-6">
                    <RadarPulse color={vc.color} size={90} icon={VIcon} />
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1"
                        style={{ color: `${vc.color}70` }}>Threat Verdict</div>
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-black tracking-tight" style={{ color: vc.color }}>
                        {verdict}
                      </motion.div>
                      <div className="text-sm mt-1.5 font-medium" style={{ color: `${vc.color}80` }}>
                        {ai.attack_type || "Threat analysis complete"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em]"
                      style={{ color: `${vc.color}70` }}>AI Confidence</div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                      className="text-6xl font-black tabular-nums" style={{ color: vc.color }}>
                      <Counter value={result.summary?.confidence || 0} />%
                    </motion.div>
                    <div className="flex justify-end">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full"
                        style={{ background: `${vc.color}18`, border: `1px solid ${vc.color}30`, color: vc.color }}>
                        {result.summary?.severity} SEVERITY
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <ShimmerBar score={result.summary?.confidence || 0} color={vc.color} height={5} />
                </div>
              </motion.div>

              {/* IOC Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: "URLs Detected", items: ext.urls, color: "#ff4444", icon: Globe },
                  { title: "Email Addresses", items: ext.emails, color: "#ffb800", icon: Server },
                  { title: "Phone Numbers", items: ext.phone_numbers, color: "#a78bfa", icon: Wifi },
                ].map(({ title, items, color, icon }) => (
                  <Block key={title} title={title} icon={icon} color={color} theme={theme} delay={0.1}>
                    <div className="flex flex-wrap gap-1.5 min-h-7">
                      {items?.length
                        ? items.map((it, i) => <Chip key={i} label={it} color={color} />)
                        : <span className="text-xs font-mono" style={{ color: theme.muted }}>None detected</span>}
                    </div>
                  </Block>
                ))}
              </div>

              {/* Pre-analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Block title="Urgency Signal Analysis" icon={Zap} color="#ffb800" theme={theme} delay={0.15}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-3xl font-black tabular-nums" style={{ color: "#ffb800" }}>
                      {pre.urgency?.urgency_score}
                    </span>
                    <span className="text-xs font-mono" style={{ color: theme.muted }}>/100</span>
                    {pre.urgency?.is_high_urgency && (
                      <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                        className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,184,0,0.15)", border: "1px solid rgba(255,184,0,0.3)", color: "#ffb800" }}>
                        HIGH URGENCY
                      </motion.span>
                    )}
                  </div>
                  <ShimmerBar score={pre.urgency?.urgency_score || 0} color="#ffb800" />
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {pre.urgency?.urgency_keywords_found?.length
                      ? pre.urgency.urgency_keywords_found.map((k, i) => <Chip key={i} label={k} color="#ffb800" />)
                      : <span className="text-xs font-mono" style={{ color: theme.muted }}>No urgency signals</span>}
                  </div>
                </Block>

                <Block title="Brand Impersonation" icon={Eye} color="#a78bfa" theme={theme} delay={0.2}>
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      animate={pre.impersonation?.impersonation_detected
                        ? { opacity: [1, 0.4, 1] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="text-3xl font-black"
                      style={{ color: pre.impersonation?.impersonation_detected ? "#ff4444" : "#00ff88" }}>
                      {pre.impersonation?.impersonation_detected ? "DETECTED" : "CLEAN"}
                    </motion.div>
                    {pre.impersonation?.impersonation_detected && (
                      <AlertTriangle size={20} style={{ color: "#ff4444" }} />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pre.impersonation?.impersonated_brands?.length
                      ? pre.impersonation.impersonated_brands.map((b, i) =>
                        <Chip key={i} label={b.toUpperCase()} color="#a78bfa" />)
                      : <span className="text-xs font-mono" style={{ color: theme.muted }}>No brand impersonation</span>}
                  </div>
                </Block>
              </div>

              {/* Deep AI analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "AI Threat Explanation", content: ai.explanation, color: theme.accent, icon: Cpu, delay: 0.25 },
                  { title: "Technical Deep Analysis", content: ai.technical_analysis, color: "#a78bfa", icon: Terminal, delay: 0.3 },
                  { title: "MITRE ATT&CK Mapping", content: ai.mitre_attack, color: "#ffb800", icon: TrendingUp, delay: 0.35 },
                  { title: "Indicators of Compromise", content: ai.indicators_of_compromise, color: "#ff4444", icon: AlertCircle, delay: 0.4 },
                  { title: "Recommended Actions", content: ai.recommended_actions, color: "#00ff88", icon: Shield, delay: 0.45 },
                  { title: "Educational Insight", content: ai.educational_note, color: "#38bdf8", icon: Globe, delay: 0.5 },
                ].map(({ title, content, color, icon, delay }) => content ? (
                  <Block key={title} title={title} icon={icon} color={color} theme={theme} delay={delay}>
                    <p className="text-xs leading-7 whitespace-pre-wrap font-mono" style={{ color: theme.muted }}>
                      {content}
                    </p>
                  </Block>
                ) : null)}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t mt-20 py-8"
        style={{ borderColor: theme.border }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg" style={{ background: `${theme.accent}12`, border: `1px solid ${theme.accent}20` }}>
                <Shield size={12} style={{ color: theme.accent }} />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: theme.accent }}>SENTINEL AI</div>
                <div className="text-[10px] font-mono" style={{ color: theme.muted }}>
                  Built by Pranay Kumar Vonamala
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: theme.muted }}>
              <span>Phase 1 Complete</span>
              <span style={{ color: theme.border }}>•</span>
              <span>Phase 2: OSINT Engine</span>
              <span style={{ color: theme.border }}>•</span>
              <span style={{ color: theme.accent }}>Coming Soon</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .font-mono, textarea, code { font-family: 'JetBrains Mono', monospace !important; }
        textarea::placeholder { color: ${theme.muted}; opacity: 0.5; }
        textarea { scrollbar-width: thin; scrollbar-color: ${theme.border} transparent; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.accent}50; }
        * { transition: border-color 0.3s, box-shadow 0.3s; }
      `}</style>
    </div>
  );
}