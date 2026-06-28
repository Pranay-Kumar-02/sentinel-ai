// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Background
// Master component. Composites all 10 background layers in correct z-order.
// Mount once in App.jsx — never inside page components.
//
// Props:
//   mode         — particle mode: "idle" | "explosion" | "implosion"
//   verdictLevel — "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "CRITICAL" | null
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useGridVisible } from "../../hooks/useLocalStorage";

import GradientMesh from "./GradientMesh";
import MatrixRain from "./MatrixRain";
import HexGrid from "./HexGrid";
import ParticleField from "./ParticleField";
import ThreatPulse from "./ThreatPulse";
import RadarSweep from "./RadarSweep";
import LightRays from "./LightRays";
import DigitalDust from "./DigitalDust";
import ScanLine from "./ScanLine";
import AmbientGlow from "./AmbientGlow";

function Background({ mode = "idle", verdictLevel = null }) {
    const { colors, effects } = useTheme();
    const [gridVisible] = useGridVisible();

    // Verdict color for pulse waves
    const verdictPulseColor = verdictLevel
        ? {
            SAFE: colors.green,
            SUSPICIOUS: colors.amber,
            DANGEROUS: colors.orange,
            CRITICAL: colors.red,
        }[verdictLevel] ?? colors.accent
        : null;

    return (
        <div
            aria-hidden="true"
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                overflow: "hidden",
                pointerEvents: "none",
                background: colors.bg,
                transition: "background 0.6s ease",
            }}
        >
            {/* Layer 1 — Gradient mesh orbs */}
            <GradientMesh />

            {/* Layer 2 — Aurora (aurora theme only) */}
            {effects.hasAurora && effects.auroraColors && (
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: effects.auroraHeight ?? "35vh",
                    zIndex: 2,
                    pointerEvents: "none",
                    overflow: "hidden",
                }}>
                    {effects.auroraColors.map((color, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                left: "-20%",
                                right: "-20%",
                                height: "200%",
                                top: `${-30 + i * 15}%`,
                                borderRadius: "50%",
                                background: color,
                                filter: "blur(60px)",
                                animation: `sentinelAuroraShift ${parseFloat(effects.auroraSpeed ?? "8s") + i * 2}s ease-in-out infinite alternate`,
                                animationDelay: `${i * 0.8}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Layer 2b — Matrix rain (matrix theme only) */}
            <MatrixRain />

            {/* Layer 3 — Hex neural grid */}
            {gridVisible && <HexGrid />}

            {/* Layer 4 — Particle field */}
            <ParticleField mode={mode} />

            {/* Layer 5 — Threat pulse waves */}
            <ThreatPulse verdictColor={verdictPulseColor} />

            {/* Layer 6 — Radar sweep */}
            <RadarSweep />

            {/* Layer 7 — Light rays */}
            <LightRays />

            {/* Layer 8 — Digital dust */}
            <DigitalDust />

            {/* Layer 9 — Film grain + scanlines */}
            <ScanLine />

            {/* Layer 10 — Atmospheric edge glow */}
            <AmbientGlow verdictLevel={verdictLevel} />
        </div>
    );
}

// Memo — only re-render when mode or verdictLevel changes
export default memo(Background);

// Named exports for individual layers
export {
    GradientMesh,
    MatrixRain,
    HexGrid,
    ParticleField,
    ThreatPulse,
    RadarSweep,
    LightRays,
    DigitalDust,
    ScanLine,
    AmbientGlow,
};