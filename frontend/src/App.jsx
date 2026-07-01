// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — App.jsx (v2.1 — FIXED)
// Fixes:
//   1. Sidebar navigation — Suspense was outside AnimatePresence causing
//      lazy page components to suspend during exit animation → blank screen.
//      Fix: each page gets its own Suspense boundary INSIDE AnimatePresence.
//   2. Gradient text block — all gradient text now uses CSS vars + display:
//      inline-block + color:transparent instead of JS gradient strings.
//   3. Cursor in sidebar — cursor:none on body was being blocked by sidebar's
//      pointer-events. Fixed by ensuring cursor:none applies globally via CSS.
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

// ── Layout — eager (needed on first paint) ────────────────────────────────────
import Background from "./components/Background";
import SmartCursor from "./components/Cursor/SmartCursor";
import CursorTrail from "./components/Cursor/CursorTrail";
import Sidebar from "./components/Sidebar/Sidebar";
import TopBar from "./components/TopBar/TopBar";
import LoadingSequence from "./components/LoadingSequence/LoadingSequence";

// ── Pages — lazy (code-splitting) ─────────────────────────────────────────────
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

// AICopilot — graceful fallback if not yet built
const AICopilot = lazy(() =>
  import("./components/AICopilot/AICopilot").catch(() => ({
    default: () => null,
  }))
);

// ── Route map ──────────────────────────────────────────────────────────────────
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

// ── Page loader fallback ───────────────────────────────────────────────────────
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
        transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
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

// ── PageRenderer — each page in its own Suspense so lazy loading never
//    conflicts with AnimatePresence exit animations ────────────────────────────
function PageRenderer({ path, navigate, onOpenCopilot, onVerdict }) {
  const pageProps = {
    "/": { onNavigate: navigate, onOpenCopilot, onVerdict },
    "/scanner": { onVerdict },
    "/about": { onNavigate: navigate },
  };

  const Component = ROUTES[path];
  if (!Component) return null;

  const props = pageProps[path] ?? {};

  return (
    <Suspense fallback={<PageLoader />}>
      <Component {...props} />
    </Suspense>
  );
}

// ── AppShell ───────────────────────────────────────────────────────────────────
function AppShell() {
  const { colors } = useTheme();
  const { cursorState } = useCursor();
  const [sidebarOpen] = useSidebarState();

  const [path, setPath] = useState("/");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [particleMode, setParticleMode] = useState("idle");
  const [activeVerdict, setActiveVerdict] = useState(null);
  const verdictTimerRef = useRef(null);

  // ── navigate — THE only routing function ──────────────────────────────────
  const navigate = useCallback((newPath) => {
    if (!ROUTES[newPath]) return;
    setPath(newPath);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Expose globally for components that can't receive navigate as prop
  useEffect(() => {
    window.__sentinelNavigate = navigate;
    return () => { delete window.__sentinelNavigate; };
  }, [navigate]);

  // Sync tab title
  useEffect(() => {
    document.title = PAGE_TITLES[path] ?? "Sentinel AI";
  }, [path]);

  // Force cursor:none on every element — fixes sidebar cursor blocking
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "sentinel-cursor-override";
    style.textContent = `
            * { cursor: none !important; }
            input, textarea, select { cursor: none !important; }
        `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Background reacts to verdict
  const handleVerdict = useCallback((verdict) => {
    if (verdictTimerRef.current) clearTimeout(verdictTimerRef.current);
    setActiveVerdict(verdict);
    setParticleMode(
      verdict === "CRITICAL" || verdict === "DANGEROUS" ? "explosion" :
        verdict === "SAFE" ? "implosion" :
          "idle"
    );
    verdictTimerRef.current = setTimeout(() => {
      setParticleMode("idle");
      setActiveVerdict(null);
    }, 6000);
  }, []);

  useEffect(() => () => {
    if (verdictTimerRef.current) clearTimeout(verdictTimerRef.current);
  }, []);

  // Global shortcuts
  useSentinelShortcuts({
    goHome: () => navigate("/"),
    openScanner: () => navigate("/scanner"),
    openForensics: () => navigate("/forensics"),
    openOSINT: () => navigate("/osint"),
    openHistory: () => navigate("/history"),
    toggleCopilot: () => setCopilotOpen((v) => !v),
  });

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      background: colors.bg,
      transition: "background 0.6s ease",
      overflowX: "hidden",
    }}>
      {/* Background layers — fixed, z-0 */}
      <Background mode={particleMode} verdictLevel={activeVerdict} />

      {/* Custom cursor — z-99999 */}
      <CursorTrail />
      <SmartCursor />

      {/* Sidebar — fixed left, z-500 */}
      <Sidebar activePath={path} onNavigate={navigate} />

      {/* TopBar — fixed top, z-400 */}
      <TopBar activePath={path} sidebarOpen={sidebarOpen} onNavigate={navigate} />

      {/* Main content */}
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 240 : 64 }}
        transition={{ type: "spring", stiffness: 320, damping: 32, mass: 1 }}
        style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}
      >
        {/*
                  KEY FIX: Suspense is INSIDE AnimatePresence child, not outside.
                  This prevents lazy() suspending during exit animation → blank page.
                  Each path renders its own Suspense boundary via PageRenderer.
                */}
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, filter: "blur(6px)", scale: 0.99 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)", scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageRenderer
              path={path}
              navigate={navigate}
              onOpenCopilot={() => setCopilotOpen(true)}
              onVerdict={handleVerdict}
            />
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {/* AI Copilot — floats bottom-right */}
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

// ── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [booted, setBooted] = useState(false);

  return (
    <ThemeProvider>
      <CursorProvider>
        <AnimatePresence>
          {!booted && (
            <LoadingSequence
              onComplete={() => setBooted(true)}
              minDuration={2400}
            />
          )}
        </AnimatePresence>

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