// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — App.jsx (v2.0 FINAL)
// The root of the entire platform. Wires every provider, every page,
// every layout component into one cohesive application.
//
// Provider stack:   ThemeProvider → CursorProvider → AppShell
// Layout:           Background → SmartCursor + CursorTrail
//                   → Sidebar → TopBar → <main> pages → AICopilot
// Routing:          State-based (no react-router). navigate() is
//                   also exposed globally via window.__sentinelNavigate
//                   so any component can route without prop-drilling.
// Pages:            All lazy-loaded — minimal initial bundle.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ── Providers ──────────────────────────────────────────────────────────────────
import { ThemeProvider } from "./context/ThemeContext";
import { CursorProvider, useCursor } from "./context/CursorContext";

// ── Hooks ──────────────────────────────────────────────────────────────────────
import { useTheme } from "./hooks/useTheme";
import { useSidebarState } from "./hooks/useLocalStorage";
import { useSentinelShortcuts } from "./hooks/useKeyboard";

// ── Layout components (eager — needed on first paint) ─────────────────────────
import Background from "./components/Background";
import SmartCursor from "./components/Cursor/SmartCursor";
import CursorTrail from "./components/Cursor/CursorTrail";
import Sidebar from "./components/Sidebar/Sidebar";
import TopBar from "./components/TopBar/TopBar";
import LoadingSequence from "./components/LoadingSequence/LoadingSequence";

// ── Pages (lazy for code-splitting) ───────────────────────────────────────────
const CommandCenter = lazy(() => import("./pages/CommandCenter"));
const ThreatScanner = lazy(() => import("./pages/ThreatScanner"));
const ForensicsLab = lazy(() => import("./pages/ForensicsLab"));
const EmailAnalyzer = lazy(() => import("./pages/EmailAnalyzer"));
const OsintRecon = lazy(() => import("./pages/OsintRecon"));
const Intelligence = lazy(() => import("./pages/Intelligence"));
const History = lazy(() => import("./pages/History"));
const Learn = lazy(() => import("./pages/Learn"));
const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));

// ── AICopilot — built by separate agent, graceful fallback if absent ──────────
const AICopilot = lazy(() =>
  import("./components/AICopilot/AICopilot").catch(() => ({
    default: () => null,
  }))
);

// ── Route → Component map ──────────────────────────────────────────────────────
const ROUTES = {
  "/": CommandCenter,
  "/scanner": ThreatScanner,
  "/forensics": ForensicsLab,
  "/email": EmailAnalyzer,
  "/osint": OsintRecon,
  "/intelligence": Intelligence,
  "/history": History,
  "/learn": Learn,
  "/settings": Settings,
  "/about": About,
};

// ── Route → document.title map ─────────────────────────────────────────────────
const PAGE_TITLES = {
  "/": "Command Center — Sentinel AI",
  "/scanner": "Threat Scanner — Sentinel AI",
  "/forensics": "Forensics Lab — Sentinel AI",
  "/email": "Email Analyzer — Sentinel AI",
  "/osint": "OSINT Recon — Sentinel AI",
  "/intelligence": "Live Intelligence — Sentinel AI",
  "/history": "Scan History — Sentinel AI",
  "/learn": "Security Training — Sentinel AI",
  "/settings": "Settings — Sentinel AI",
  "/about": "About — Sentinel AI",
};

// ── Page loading spinner ───────────────────────────────────────────────────────
function PageLoader() {
  const { colors } = useTheme();
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, ease: "linear", repeat: Infinity }}
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `2px solid ${colors.border}`,
          borderTopColor: colors.accent,
        }}
      />
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.6rem",
        color: colors.textMuted,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}>
        Loading module...
      </span>
    </div>
  );
}

// ── AppShell — full layout inside providers ────────────────────────────────────
function AppShell() {
  const { colors } = useTheme();
  const { cursorState } = useCursor();
  const [sidebarOpen] = useSidebarState();

  // ── Routing state ──────────────────────────────────────────────────────────
  const [path, setPath] = useState("/");

  // ── Copilot visibility ─────────────────────────────────────────────────────
  const [copilotOpen, setCopilotOpen] = useState(false);

  // ── Background reactivity — particles + edge glow react to verdicts ────────
  const [particleMode, setParticleMode] = useState("idle");
  const [activeVerdict, setActiveVerdict] = useState(null);
  const verdictTimerRef = useRef(null);

  // ── navigate() — the single source of truth for all routing ───────────────
  const navigate = useCallback((newPath) => {
    if (!ROUTES[newPath]) return;
    if (newPath === path) return;
    setPath(newPath);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [path]);

  // Expose globally so any component can navigate without prop drilling
  useEffect(() => {
    window.__sentinelNavigate = navigate;
    return () => { delete window.__sentinelNavigate; };
  }, [navigate]);

  // ── Sync document title ────────────────────────────────────────────────────
  useEffect(() => {
    document.title = PAGE_TITLES[path] ?? "Sentinel AI";
  }, [path]);

  // ── Background verdict reactivity ──────────────────────────────────────────
  const handleVerdict = useCallback((verdict) => {
    if (verdictTimerRef.current) clearTimeout(verdictTimerRef.current);

    setActiveVerdict(verdict);
    const mode =
      verdict === "CRITICAL" || verdict === "DANGEROUS" ? "explosion" :
        verdict === "SAFE" ? "implosion" :
          "idle";
    setParticleMode(mode);

    // Auto-reset after animation plays
    verdictTimerRef.current = setTimeout(() => {
      setParticleMode("idle");
      setActiveVerdict(null);
    }, 6000);
  }, []);

  useEffect(() => () => {
    if (verdictTimerRef.current) clearTimeout(verdictTimerRef.current);
  }, []);

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useSentinelShortcuts({
    goHome: () => navigate("/"),
    openScanner: () => navigate("/scanner"),
    openForensics: () => navigate("/forensics"),
    openOSINT: () => navigate("/osint"),
    openHistory: () => navigate("/history"),
    toggleCopilot: () => setCopilotOpen((v) => !v),
  });

  const PageComponent = ROUTES[path] ?? CommandCenter;

  // Cursor state class enables App.css cursor hover transitions
  const cursorClass = cursorState !== "default" ? `cursor-hover-${cursorState}` : "";

  return (
    <div
      className={cursorClass}
      style={{
        position: "relative",
        minHeight: "100vh",
        background: colors.bg,
        transition: "background 0.6s ease",
        overflowX: "hidden",
      }}
    >
      {/* ── LAYER 0: Full background system (fixed, z-index 0) ─────────── */}
      <Background
        mode={particleMode}
        verdictLevel={activeVerdict}
      />

      {/* ── CURSOR: Trail rings + smart context cursor (z-99999) ────────── */}
      <CursorTrail />
      <SmartCursor />

      {/* ── SIDEBAR: Collapsible navigation (fixed left, z-500) ─────────── */}
      <Sidebar
        activePath={path}
        onNavigate={navigate}
      />

      {/* ── TOPBAR: Fixed top bar, follows sidebar width (z-400) ─────────── */}
      <TopBar
        activePath={path}
        sidebarOpen={sidebarOpen}
        onNavigate={navigate}
      />

      {/* ── MAIN: Page content area ──────────────────────────────────────── */}
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 240 : 64 }}
        transition={{ type: "spring", stiffness: 320, damping: 32, mass: 1 }}
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
        }}
      >
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <motion.div
              key={path}
              initial={{ opacity: 0, filter: "blur(6px)", scale: 0.99 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(6px)", scale: 0.98 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Pages that receive special props */}
              {path === "/" && (
                <CommandCenter
                  onNavigate={navigate}
                  onOpenCopilot={() => setCopilotOpen(true)}
                  onVerdict={handleVerdict}
                />
              )}

              {path === "/scanner" && (
                <ThreatScanner
                  onVerdict={handleVerdict}
                />
              )}

              {path === "/about" && (
                <About onNavigate={navigate} />
              )}

              {/* All other pages — no special props needed */}
              {path === "/forensics" && <ForensicsLab />}
              {path === "/email" && <EmailAnalyzer />}
              {path === "/osint" && <OsintRecon />}
              {path === "/intelligence" && <Intelligence />}
              {path === "/history" && <History />}
              {path === "/learn" && <Learn />}
              {path === "/settings" && <Settings />}
            </motion.div>
          </Suspense>
        </AnimatePresence>
      </motion.main>

      {/* ── AI COPILOT: Floats bottom-right across all pages ─────────────── */}
      <Suspense fallback={null}>
        <AICopilot
          isOpen={copilotOpen}
          onToggle={() => setCopilotOpen((v) => !v)}
          onClose={() => setCopilotOpen(false)}
          currentPath={path}
        />
      </Suspense>
    </div>
  );
}

// ── Root App — providers + boot sequence ───────────────────────────────────────
export default function App() {
  const [booted, setBooted] = useState(false);

  return (
    <ThemeProvider>
      <CursorProvider>
        {/* Boot sequence — cinematic loader, plays once then unmounts */}
        <AnimatePresence>
          {!booted && (
            <LoadingSequence
              onComplete={() => setBooted(true)}
              minDuration={2400}
            />
          )}
        </AnimatePresence>

        {/* App shell — mounts in background during boot, fades in after */}
        <motion.div
          initial={false}
          animate={{ opacity: booted ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            visibility: booted ? "visible" : "hidden",
            pointerEvents: booted ? "auto" : "none",
          }}
        >
          <AppShell />
        </motion.div>
      </CursorProvider>
    </ThemeProvider>
  );
}