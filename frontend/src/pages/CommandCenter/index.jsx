// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — CommandCenter (Homepage)
// The platform introduction. NOT a scanner. A cinematic experience.
// Composes: HeroSection → StatsRow → IntelPanel → ModuleCards
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import HeroSection from "./HeroSection";
import StatsRow from "./StatsRow";
import IntelPanel from "./IntelPanel";
import ModuleCards from "../../components/ModuleCards/ModuleCards";
import { Divider } from "../../components/Common/Badge";

export default function CommandCenter({ onNavigate, onOpenCopilot }) {
    const { colors } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {/* Hero — cinematic, globe-centered */}
            <HeroSection onNavigate={onNavigate} />

            {/* Mission Overview / System Status */}
            <StatsRow />

            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
                <Divider />
            </div>

            {/* Global Threat Activity */}
            <IntelPanel />

            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px" }}>
                <Divider />
            </div>

            {/* Platform Modules */}
            <section style={{ padding: "60px 48px 100px" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                    <ModuleCards onNavigate={onNavigate} onOpenCopilot={onOpenCopilot} />
                </div>
            </section>
        </motion.div>
    );
}