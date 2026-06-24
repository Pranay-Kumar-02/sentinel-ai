import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader,
  Zap,
  Globe,
  Terminal,
  Eye,
  Cpu,
  Radio,
  RotateCcw,
  Layers,
  Activity,
  Database,
  Wifi,
  Server,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

const THEMES = {
  cyber: {
    name: "Cyber Dark",
    bg: "#03070f",
    bgCard: "rgba(8, 13, 26, 0.94)",
    bgInput: "#020508",
    border: "rgba(0, 212, 255, 0.16)",
    accent: "#00d4ff",
    accent2: "#6366f1",
    text: "#e2e8f0",
    muted: "#7c8aa0",
    dimmed: "#1a2940",
    navBg: "rgba(3, 7, 15, 0.92)",
    gradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
  },

  matrix: {
    name: "Matrix",
    bg: "#000800",
    bgCard: "rgba(0, 22, 4, 0.94)",
    bgInput: "#000b02",
    border: "rgba(0, 255, 65, 0.22)",
    accent: "#00ff41",
    accent2: "#7dff9d",
    text: "#d8ffe2",
    muted: "#8bc99b",
    dimmed: "#1d6a32",
    navBg: "rgba(0, 12, 2, 0.94)",
    gradient: "linear-gradient(135deg, #00ff41, #7dff9d)",
  },

  blood: {
    name: "Blood Red",
    bg: "#0a0000",
    bgCard: "rgba(21, 0, 0, 0.94)",
    bgInput: "#080000",
    border: "rgba(255, 30, 30, 0.18)",
    accent: "#ff1e1e",
    accent2: "#ff6b35",
    text: "#ffe0e0",
    muted: "#d18b8b",
    dimmed: "#5a1515",
    navBg: "rgba(10, 0, 0, 0.94)",
    gradient: "linear-gradient(135deg, #ff1e1e, #ff6b35)",
  },

  ghost: {
    name: "Ghost White",
    bg: "#f0f4f8",
    bgCard: "rgba(255, 255, 255, 0.96)",
    bgInput: "#f8fafc",
    border: "rgba(99, 102, 241, 0.2)",
    accent: "#6366f1",
    accent2: "#8b5cf6",
    text: "#1e293b",
    muted: "#64748b",
    dimmed: "#cbd5e1",
    navBg: "rgba(240, 244, 248, 0.94)",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },

  gold: {
    name: "Sovereign Gold",
    bg: "#0a0800",
    bgCard: "rgba(18, 15, 0, 0.94)",
    bgInput: "#080600",
    border: "rgba(255, 184, 0, 0.18)",
    accent: "#ffb800",
    accent2: "#ff8c00",
    text: "#fff8e0",
    muted: "#c8b37b",
    dimmed: "#5c470d",
    navBg: "rgba(10, 8, 0, 0.94)",
    gradient: "linear-gradient(135deg, #ffb800, #ff8c00)",
  },
};

const VERDICT_CONFIG = {
  SAFE: {
    color: "#00ff88",
    bg: "rgba(0,255,136,0.06)",
    border: "rgba(0,255,136,0.25)",
    icon: CheckCircle,
  },
  SUSPICIOUS: {
    color: "#ffb800",
    bg: "rgba(255,184,0,0.06)",
    border: "rgba(255,184,0,0.25)",
    icon: AlertTriangle,
  },
  DANGEROUS: {
    color: "#ff4444",
    bg: "rgba(255,68,68,0.06)",
    border: "rgba(255,68,68,0.3)",
    icon: XCircle,
  },
  CRITICAL: {
    color: "#ff0033",
    bg: "rgba(255,0,51,0.08)",
    border: "rgba(255,0,51,0.5)",
    icon: XCircle,
  },
  UNKNOWN: {
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.06)",
    border: "rgba(148,163,184,0.2)",
    icon: Shield,
  },
};

function Particles({ theme, count = 35 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.08,
    }))
  ).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: theme.accent,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [particle.opacity, particle.opacity * 0.25, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function HexGrid({ theme }) {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <pattern id="hexgrid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
          <polygon
            points="30,2 56,15 56,37 30,50 4,37 4,15"
            fill="none"
            stroke={theme.accent}
            strokeWidth="0.6"
            opacity="0.15"
          />
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

function ScanLine({ theme }) {
  return (
    <motion.div
      className="fixed left-0 right-0 h-px pointer-events-none"
      style={{
        background: `linear-gradient(
          90deg,
          transparent 0%,
          ${theme.accent}60 30%,
          ${theme.accent} 50%,
          ${theme.accent}60 70%,
          transparent 100%
        )`,
        zIndex: 1,
        boxShadow: `0 0 14px ${theme.accent}`,
      }}
      initial={{ top: "-5vh" }}
      animate={{ top: "105vh" }}
      transition={{
        duration: 6,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
      }}
    />
  );
}

function GlitchText({ text, theme }) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-block">
      {glitch && (
        <>
          <span
            className="absolute inset-0"
            style={{
              color: "#ff0033",
              clipPath: "polygon(0 20%, 100% 20%, 100% 40%, 0 40%)",
              transform: "translateX(-2px)",
              opacity: 0.8,
            }}
          >
            {text}
          </span>
          <span
            className="absolute inset-0"
            style={{
              color: "#00d4ff",
              clipPath: "polygon(0 60%, 100% 60%, 100% 80%, 0 80%)",
              transform: "translateX(2px)",
              opacity: 0.8,
            }}
          >
            {text}
          </span>
        </>
      )}
      <span style={{ color: theme.accent }}>{text}</span>
    </span>
  );
}

function MatrixRain({ theme }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (theme.name !== "Matrix") return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const columns = Math.floor(canvas.width / 16);
    const drops = Array(columns).fill(1);
    const chars = "アイウエオカキクケコSENTINELAI01";

    const draw = () => {
      ctx.fillStyle = "rgba(0,8,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff41";
      ctx.font = "13px JetBrains Mono, monospace";

      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y * 16);

        if (y * 16 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += 1;
      });
    };

    const interval = setInterval(draw, 45);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, [theme]);

  if (theme.name !== "Matrix") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.14 }}
    />
  );
}

function Counter({ value, duration = 1000 }) {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    let animationFrame;
    const startTime = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setNumber(Math.round(eased * value));

      if (progress < 1) animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{number}</>;
}

function RadarPulse({ color, size = 100, icon: Icon = Shield }) {
  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {[0.4, 0.65, 0.9].map((scale, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full border"
          style={{
            width: size * scale,
            height: size * scale,
            borderColor: color,
          }}
          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: index * 0.6,
            ease: "easeOut",
          }}
        />
      ))}

      <div
        className="relative z-10 flex items-center justify-center rounded-full"
        style={{
          width: size * 0.38,
          height: size * 0.38,
          background: `${color}18`,
          border: `2px solid ${color}50`,
        }}
      >
        <Icon size={size * 0.18} style={{ color }} />
      </div>
    </div>
  );
}

function ShimmerBar({ score, color, height = 6 }) {
  return (
    <div
      className="relative w-full rounded-full overflow-hidden"
      style={{ height, background: "rgba(255,255,255,0.08)" }}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}60, ${color})` }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 w-16 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}50, transparent)` }}
        animate={{ left: ["-10%", "110%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
      />
    </div>
  );
}

function Chip({ label, color }) {
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold cursor-default break-all"
      style={{
        background: `${color}14`,
        border: `1px solid ${color}35`,
        color,
      }}
    >
      {label}
    </motion.span>
  );
}

function Block({ title, icon: Icon, color, children, delay = 0, theme }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-5 space-y-3 transition-all duration-300"
      style={{
        background: theme.bgCard,
        border: `1px solid ${hovered ? `${color}55` : theme.border}`,
        boxShadow: hovered ? `0 0 30px ${color}16` : "none",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}16` }}>
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

function TerminalLog({ logs, loading, theme }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <AnimatePresence>
      {(loading || logs.length > 0) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: theme.bgInput, border: `1px solid ${theme.border}` }}
        >
          <div
            className="flex items-center gap-2 px-5 py-3 border-b"
            style={{ borderColor: theme.border }}
          >
            <Terminal size={11} style={{ color: theme.accent }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.muted }}>
              sentinel.log
            </span>

            <div className="ml-auto flex items-center gap-1.5">
              {loading && (
                <>
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: theme.accent }}
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-mono" style={{ color: theme.accent }}>
                    LIVE
                  </span>
                </>
              )}
            </div>
          </div>

          <div ref={ref} className="p-4 space-y-1.5 max-h-36 overflow-y-auto">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 font-mono text-xs"
              >
                <span className="shrink-0 font-bold" style={{ color: log.color, minWidth: 72 }}>
                  [{log.prefix}]
                </span>
                <span style={{ color: theme.muted }}>{log.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ThemeSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
        style={{
          background: current.bgCard,
          border: `1px solid ${current.border}`,
          color: current.accent,
        }}
      >
        <Layers size={11} />
        {current.name}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50 min-w-40"
            style={{
              background: current.bgCard,
              border: `1px solid ${current.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
            }}
          >
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => {
                  onChange(theme);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono text-left transition-colors hover:bg-white/5"
                style={{ color: theme.accent }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
                {theme.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, theme }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-xl p-4 transition-all duration-300"
      style={{
        background: theme.bgCard,
        border: `1px solid ${hovered ? `${color}50` : theme.border}`,
        boxShadow: hovered ? `0 8px 30px ${color}14` : "none",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ background: `${color}16` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: theme.muted }}>
          {label}
        </span>
      </div>

      <div className="text-xl font-black tabular-nums" style={{ color }}>
        {value}
      </div>

      {sub && (
        <div className="text-[10px] mt-0.5 font-mono" style={{ color: theme.muted }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

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

  const handleMouseMove = useCallback(
    (event) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    },
    [mouseX, mouseY]
  );

  const pushLog = (prefix, text, color) => {
    setLogs((previous) => [
      ...previous.slice(-20),
      { prefix, text, color, id: Date.now() + Math.random() },
    ]);
  };

  const analyze = async () => {
    if (!input.trim()) {
      toast.error("Paste something to analyze.");
      return;
    }

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
      ["LLM", "Routing to AI reasoning engine...", theme.accent],
      ["MITRE", "Mapping to MITRE ATT&CK framework...", "#ff4444"],
      ["REPORT", "Generating threat intelligence report...", "#00ff88"],
    ];

    steps.forEach(([prefix, text, color], index) => {
      setTimeout(() => pushLog(prefix, text, color), index * 350);
    });

    try {
      const response = await axios.post(`${API_URL}/analyze`, { text: input });

      setResult(response.data);
      setScans((count) => count + 1);

      const currentVerdict = response.data?.summary?.verdict || "UNKNOWN";

      if (currentVerdict !== "SAFE") {
        setThreats((count) => count + 1);
      }

      pushLog(
        "DONE",
        `Analysis complete — Verdict: ${currentVerdict}`,
        currentVerdict === "SAFE" ? "#00ff88" : "#ff4444"
      );

      if (currentVerdict === "SAFE") {
        toast.success("No threats detected.");
      } else if (currentVerdict === "SUSPICIOUS") {
        toast("Suspicious content detected.", { icon: "⚠️" });
      } else {
        toast.error(`${currentVerdict} threat detected.`);
      }
    } catch {
      pushLog("ERROR", "Connection failed — is backend running on :8000?", "#ff4444");
      toast.error("Cannot reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const ai = result?.ai_analysis || {};
  const extracted = result?.auto_extracted || {};
  const preAnalysis = result?.pre_analysis || {};
  const verdict = result?.summary?.verdict || null;
  const verdictConfig = verdict ? VERDICT_CONFIG[verdict] || VERDICT_CONFIG.UNKNOWN : null;
  const VerdictIcon = verdictConfig?.icon || Shield;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: theme.bg, color: theme.text }}
      onMouseMove={handleMouseMove}
    >
      <HexGrid theme={theme} />
      <Particles theme={theme} />
      <MatrixRain theme={theme} />
      <ScanLine theme={theme} />

      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          width: 500,
          height: 500,
          marginLeft: -250,
          marginTop: -250,
          background: `radial-gradient(circle, ${theme.accent}08 0%, transparent 70%)`,
          x: mouseX,
          y: mouseY,
          zIndex: 0,
        }}
      />

      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 800,
          height: 300,
          background: `radial-gradient(ellipse, ${theme.accent}10 0%, transparent 65%)`,
          zIndex: 0,
        }}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: theme.bgCard,
            color: theme.text,
            border: `1px solid ${theme.border}`,
            fontSize: 13,
            fontFamily: "Inter",
          },
        }}
      />

      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: theme.navBg,
          backdropFilter: "blur(20px)",
          borderColor: theme.border,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative p-2 rounded-xl"
              style={{
                background: `${theme.accent}12`,
                border: `1px solid ${theme.accent}30`,
              }}
            >
              <div
                className="absolute inset-0 rounded-xl blur-lg opacity-40"
                style={{ background: theme.accent }}
              />
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

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(0,255,136,0.06)",
                border: "1px solid rgba(0,255,136,0.18)",
              }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#00ff88" }}
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono font-bold" style={{ color: "#00ff88" }}>
                ONLINE
              </span>
            </div>

            <ThemeSwitcher current={theme} onChange={setTheme} />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-5 pt-4 pb-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono"
            style={{
              background: `${theme.accent}0d`,
              border: `1px solid ${theme.accent}30`,
              color: theme.accent,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Radio size={10} />
            </motion.div>
            AI-Powered • Real-Time • Multi-Layer Threat Detection
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl sm:text-6xl font-black tracking-tight leading-none"
              style={{ color: theme.text }}
            >
              Detect threats before
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-5xl sm:text-6xl font-black tracking-tight leading-none"
              style={{
                color: theme.accent,
                textShadow: `0 0 28px ${theme.accent}45`,
              }}
            >
              they reach you.
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-sm max-w-xl mx-auto leading-relaxed"
            style={{
              color: theme.muted,
              textShadow: theme.name === "Matrix" ? "0 1px 12px rgba(0,0,0,0.85)" : "none",
            }}
          >
            Paste any message, URL, email, SMS, or notification. Sentinel AI analyzes security
            signals and delivers an explainable threat intelligence report in seconds.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatCard icon={Activity} label="Scans" value={scans} sub="this session" color={theme.accent} theme={theme} />
          <StatCard icon={Shield} label="Threats" value={threats} sub="detected" color="#ff4444" theme={theme} />
          <StatCard icon={Cpu} label="Engine" value="AI + Rules" sub="hybrid analysis" color="#a78bfa" theme={theme} />
          <StatCard icon={Database} label="LLM" value="OpenRouter" sub="intelligence layer" color="#ffb800" theme={theme} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            boxShadow: `0 0 0 1px ${theme.border}`,
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {["#ff5f57", "#ffbd2e", "#28c840"].map((color) => (
                  <div key={color} className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                ))}
              </div>
              <span className="text-[11px] font-mono ml-2" style={{ color: theme.muted }}>
                sentinel@ai:~$ analyze_threat
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <Wifi size={10} style={{ color: "#00ff88" }} />
              <span style={{ color: "#00ff88" }}>connected</span>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute left-5 top-4 text-[11px] font-mono select-none"
              style={{ color: theme.muted }}
            >
              &gt;_
            </div>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.ctrlKey && event.key === "Enter") analyze();
              }}
              placeholder={
                'Paste anything suspicious here...\n\nExamples:\n  • "Your bank account is blocked. Verify at http://suspicious-link.xyz"\n  • Full email with headers\n  • WhatsApp or SMS message\n  • Suspicious URL\n\nCtrl + Enter to analyze instantly'
              }
              rows={9}
              className="w-full pl-12 pr-5 pt-4 pb-4 text-sm font-mono resize-none focus:outline-none transition-all"
              style={{
                background: "transparent",
                color: theme.text,
                caretColor: theme.accent,
                lineHeight: 1.8,
              }}
            />

            <div
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
              style={{ background: `linear-gradient(transparent, ${theme.bgCard}e8)` }}
            />
          </div>

          <div
            className="flex items-center justify-between px-5 py-3.5 border-t"
            style={{ borderColor: theme.border }}
          >
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono" style={{ color: theme.muted }}>
                {input.length}
                <span style={{ color: theme.dimmed }}>/10000</span>
              </span>

              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono" style={{ color: theme.dimmed }}>
                {["MSG", "URL", "EMAIL", "SMS", "DOC"].map((type, index) => (
                  <span key={type}>
                    <span style={{ color: theme.muted }}>{type}</span>
                    {index < 4 && <span className="mx-1">·</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {input && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setInput("");
                    setResult(null);
                    setLogs([]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ color: theme.muted, border: `1px solid ${theme.border}` }}
                >
                  <RotateCcw size={11} />
                  Clear
                </motion.button>
              )}

              <motion.button
                onClick={analyze}
                disabled={loading}
                whileHover={{
                  scale: loading ? 1 : 1.03,
                  boxShadow: loading ? "none" : `0 0 30px ${theme.accent}40`,
                }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: loading ? theme.dimmed : theme.gradient,
                  color: loading ? theme.muted : "#ffffff",
                  boxShadow: loading ? "none" : `0 0 20px ${theme.accent}30`,
                }}
              >
                {loading ? (
                  <>
                    <Loader size={13} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye size={13} />
                    Analyze Threat
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <TerminalLog logs={logs} loading={loading} theme={theme} />

        <AnimatePresence>
          {result && !loading && verdictConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl p-7 relative overflow-hidden"
                style={{ background: verdictConfig.bg, border: `1px solid ${verdictConfig.border}` }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 75% 50%, ${verdictConfig.color}16 0%, transparent 60%)`,
                  }}
                />

                <div className="relative flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex items-center gap-6">
                    <RadarPulse color={verdictConfig.color} size={90} icon={VerdictIcon} />

                    <div>
                      <div
                        className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1"
                        style={{ color: `${verdictConfig.color}b0` }}
                      >
                        Threat Verdict
                      </div>

                      <div className="text-5xl font-black tracking-tight" style={{ color: verdictConfig.color }}>
                        {verdict}
                      </div>

                      <div className="text-sm mt-1.5 font-medium" style={{ color: theme.text }}>
                        {ai.attack_type || "Threat analysis complete"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div
                      className="text-[10px] font-mono uppercase tracking-[0.2em]"
                      style={{ color: `${verdictConfig.color}b0` }}
                    >
                      AI Confidence
                    </div>

                    <div className="text-6xl font-black tabular-nums" style={{ color: verdictConfig.color }}>
                      <Counter value={result.summary?.confidence || 0} />%
                    </div>

                    <div className="flex justify-end">
                      <span
                        className="text-[10px] font-black px-3 py-1 rounded-full"
                        style={{
                          background: `${verdictConfig.color}18`,
                          border: `1px solid ${verdictConfig.color}40`,
                          color: verdictConfig.color,
                        }}
                      >
                        {result.summary?.severity || "UNKNOWN"} SEVERITY
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <ShimmerBar score={result.summary?.confidence || 0} color={verdictConfig.color} height={5} />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { title: "URLs Detected", items: extracted.urls, color: "#ff4444", icon: Globe },
                  { title: "Email Addresses", items: extracted.emails, color: "#ffb800", icon: Server },
                  { title: "Phone Numbers", items: extracted.phone_numbers, color: "#a78bfa", icon: Wifi },
                ].map(({ title, items, color, icon }) => (
                  <Block key={title} title={title} icon={icon} color={color} theme={theme} delay={0.1}>
                    <div className="flex flex-wrap gap-1.5 min-h-7">
                      {items?.length ? (
                        items.map((item, index) => <Chip key={index} label={item} color={color} />)
                      ) : (
                        <span className="text-xs font-mono" style={{ color: theme.muted }}>
                          None detected
                        </span>
                      )}
                    </div>
                  </Block>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Block title="Urgency Signal Analysis" icon={Zap} color="#ffb800" theme={theme} delay={0.15}>
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-3xl font-black tabular-nums" style={{ color: "#ffb800" }}>
                      {preAnalysis.urgency?.urgency_score ?? 0}
                    </span>
                    <span className="text-xs font-mono" style={{ color: theme.muted }}>
                      /100
                    </span>

                    {preAnalysis.urgency?.is_high_urgency && (
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,184,0,0.15)",
                          border: "1px solid rgba(255,184,0,0.35)",
                          color: "#ffb800",
                        }}
                      >
                        HIGH URGENCY
                      </span>
                    )}
                  </div>

                  <ShimmerBar score={preAnalysis.urgency?.urgency_score || 0} color="#ffb800" />

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {preAnalysis.urgency?.urgency_keywords_found?.length ? (
                      preAnalysis.urgency.urgency_keywords_found.map((keyword, index) => (
                        <Chip key={index} label={keyword} color="#ffb800" />
                      ))
                    ) : (
                      <span className="text-xs font-mono" style={{ color: theme.muted }}>
                        No urgency signals
                      </span>
                    )}
                  </div>
                </Block>

                <Block title="Brand Impersonation" icon={Eye} color="#a78bfa" theme={theme} delay={0.2}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="text-3xl font-black"
                      style={{
                        color: preAnalysis.impersonation?.impersonation_detected ? "#ff4444" : "#00ff88",
                      }}
                    >
                      {preAnalysis.impersonation?.impersonation_detected ? "DETECTED" : "CLEAN"}
                    </div>

                    {preAnalysis.impersonation?.impersonation_detected && (
                      <AlertTriangle size={20} style={{ color: "#ff4444" }} />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {preAnalysis.impersonation?.impersonated_brands?.length ? (
                      preAnalysis.impersonation.impersonated_brands.map((brand, index) => (
                        <Chip key={index} label={brand.toUpperCase()} color="#a78bfa" />
                      ))
                    ) : (
                      <span className="text-xs font-mono" style={{ color: theme.muted }}>
                        No brand impersonation
                      </span>
                    )}
                  </div>
                </Block>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "AI Threat Explanation", content: ai.explanation, color: theme.accent, icon: Cpu, delay: 0.25 },
                  { title: "Technical Deep Analysis", content: ai.technical_analysis, color: "#a78bfa", icon: Terminal, delay: 0.3 },
                  { title: "MITRE ATT&CK Mapping", content: ai.mitre_attack, color: "#ffb800", icon: TrendingUp, delay: 0.35 },
                  { title: "Indicators of Compromise", content: ai.indicators_of_compromise, color: "#ff4444", icon: AlertCircle, delay: 0.4 },
                  { title: "Recommended Actions", content: ai.recommended_actions, color: "#00ff88", icon: Shield, delay: 0.45 },
                  { title: "Educational Insight", content: ai.educational_note, color: "#38bdf8", icon: Globe, delay: 0.5 },
                ].map(({ title, content, color, icon, delay }) =>
                  content ? (
                    <Block key={title} title={title} icon={icon} color={color} theme={theme} delay={delay}>
                      <p className="text-xs leading-7 whitespace-pre-wrap font-mono" style={{ color: theme.muted }}>
                        {content}
                      </p>
                    </Block>
                  ) : null
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 border-t mt-20 py-8" style={{ borderColor: theme.border }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-1.5 rounded-lg"
                style={{
                  background: `${theme.accent}12`,
                  border: `1px solid ${theme.accent}30`,
                }}
              >
                <Shield size={12} style={{ color: theme.accent }} />
              </div>

              <div>
                <div className="text-xs font-bold" style={{ color: theme.accent }}>
                  SENTINEL AI
                </div>
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

        * {
          box-sizing: border-box;
        }

        html {
          background: ${theme.bg};
        }

        body {
          margin: 0;
          background: ${theme.bg};
          font-family: "Inter", sans-serif;
        }

        .font-mono,
        textarea,
        code {
          font-family: "JetBrains Mono", monospace !important;
        }

        textarea::placeholder {
          color: ${theme.muted};
          opacity: 0.72;
        }

        textarea {
          scrollbar-width: thin;
          scrollbar-color: ${theme.border} transparent;
        }

        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 2px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.accent}80;
        }

        * {
          transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s;
        }
      `}</style>
    </div>
  );
}