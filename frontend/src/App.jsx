// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — App.jsx (v2.2 — FIXED)
// Fixes in this version:
//   1. Sidebar navigation → black screen (70% of pages):
//      PageRenderer's `pageProps` map only assigned props to 3 of 10 routes
//      ("/", "/scanner", "/about"). The other 7 pages received an empty {}
//      props object. Any of those pages calling a prop function that was
//      undefined (e.g. onVerdict, onNavigate) threw a render error. With no
//      Error Boundary anywhere in the tree, React silently unmounted the
//      whole app → black screen, no console message.
//      Fix: every route now receives the full, consistent prop set
//      (onNavigate, onOpenCopilot, onVerdict). Extra unused props are
//      harmless — pages that don't need them simply ignore them.
//   2. Added a proper ErrorBoundary wrapping each page's Suspense boundary.
//      If a page still throws for any reason, you now get a visible fallback
//      panel with the actual error message + a "back to Command Center"
//      action, instead of a silent black screen. This makes any future page
//      bug immediately diagnosable from the UI itself.
//   3. Sidebar navigation — Suspense stays INSIDE AnimatePresence (per-page
//      Suspense boundary) so lazy page components never suspend during the
//      exit animation.
//   4. Gradient text block — gradient text uses CSS vars + display:
//      inline-block + color:transparent instead of JS gradient strings.
//   5. Cursor in sidebar — cursor:none applied globally via injected CSS so
//      the sidebar's pointer-events can't block the custom cursor.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef, Suspense, lazy, Component } from "react";
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
import CommandPalette from "./components/CommandPalette/CommandPalette";
import Workspace from "./pages/Workspace";
import BreachMonitor from "./pages/Workspace/BreachMonitor";
import TyposquatWatchdog from "./pages/Workspace/TyposquatWatchdog";
import CVEPulse from "./pages/Workspace/CVEPulse";
import QRSafeScanner from "./pages/Workspace/QRSafeScanner";
import SentinelScore from "./pages/Workspace/SentinelScore";
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
const PersonalDashboard = lazy(() => import("./pages/PersonalDashboard"));
const EasyCheck = lazy(() => import("./pages/EasyCheck"));


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
  "/workspace": Workspace,
  "/breach": BreachMonitor,
  "/typosquat": TyposquatWatchdog,
  "/cve": CVEPulse,
  "/qrscanner": QRSafeScanner,
  "/score": SentinelScore,
  "/dashboard": PersonalDashboard,
  "/easy": EasyCheck,
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
  "/workspace": "Workspace — Sentinel AI",
  "/breach": "Breach Monitor — Sentinel AI",
  "/typosquat": "Typosquat Watchdog — Sentinel AI",
  "/cve": "CVE Pulse — Sentinel AI",
  "/qrscanner": "QR Safe Scanner — Sentinel AI",
  "/dashboard": "Personal Dashboard — Sentinel AI",
  "/easy": "Is This Safe? — Sentinel AI",

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

// ── ErrorBoundary — catches render errors in any page and shows a visible
//    fallback instead of letting React silently unmount to a black screen.
//    Keyed by `resetKey` (the current path) so navigating away/back clears
//    the error state automatically. ────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[Sentinel] Page crashed:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Reset error state whenever the route changes so the boundary doesn't
    // stay "stuck" after the user navigates elsewhere and back.
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#ff5c5c",
          }}>
            Module failed to render
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            opacity: 0.7,
            maxWidth: 480,
            wordBreak: "break-word",
          }}>
            {String(this.state.error?.message ?? this.state.error ?? "Unknown error")}
          </span>
          <button
            onClick={() => window.__sentinelNavigate?.("/")}
            style={{
              marginTop: 8,
              padding: "8px 18px",
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "transparent",
              border: "1px solid currentColor",
              borderRadius: 6,
              cursor: "pointer",
              opacity: 0.85,
            }}
          >
            Back to Command Center
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── PageRenderer — every route gets the full, consistent prop set. Pages
//    that don't use a given prop simply ignore it — this is what fixed the
//    black-screen bug, since 7 of 10 routes previously received {} and
//    crashed if they called an undefined prop function. ─────────────────────────
function PageRenderer({ path, navigate, onOpenCopilot, onVerdict }) {
  const Component = ROUTES[path];
  if (!Component) return null;

  const commonProps = {
    onNavigate: navigate,
    onOpenCopilot,
    onVerdict,
  };

  return (
    <ErrorBoundary resetKey={path}>
      <Suspense fallback={<PageLoader />}>
        <Component {...commonProps} />
      </Suspense>
    </ErrorBoundary>
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  // ── navigate — THE only routing function ──────────────────────────────────
  const navigate = useCallback((newPath) => {
    if (!ROUTES[newPath]) return;
    setPath(newPath);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Expose globally for components that can't receive navigate as prop
  // (also used by ErrorBoundary's "Back to Command Center" button)
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
    style.textContent = "*, *::before, *::after { cursor: none !important; } #sentinel-cursor-override { pointer-events: none; }";
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

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
                  Suspense is INSIDE AnimatePresence child, not outside.
                  This prevents lazy() suspending during exit animation → blank page.
                  Each path renders its own Suspense + ErrorBoundary via PageRenderer.
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
        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onNavigate={(p) => { navigate(p); setPaletteOpen(false); }}
          onAction={(action) => {
            if (action === "copilot") setCopilotOpen(v => !v);
          }}
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