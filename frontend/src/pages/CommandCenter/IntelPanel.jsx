// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — IntelPanel
// "Global Threat Activity" section. ThreatMap + LiveFeed side by side.
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import ThreatMap from "../../components/ThreatMap/ThreatMap";
import LiveFeed from "../../components/ThreatFeed/LiveFeed";
import { SectionHead } from "../../components/Common/Tooltip";

export default function IntelPanel() {
    const { colors } = useTheme();

    return (
        <section style={{ padding: "60px 48px", position: "relative" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <SectionHead
                    label="Live Intelligence"
                    title="Global Threat Activity"
                    sub="Real-time visualization of active cyber threats detected across our intelligence network."
                />

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr",
                    gap: 20,
                    marginTop: 32,
                }}
                    className="intel-panel-grid"
                >
                    <ThreatMap height={420} />
                    <LiveFeed maxHeight={420} maxItems={20} compact />
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .intel-panel-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}