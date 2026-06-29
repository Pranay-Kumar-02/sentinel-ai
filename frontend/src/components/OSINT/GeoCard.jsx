// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — GeoCard
// IP geolocation: country, city, ISP, Tor/proxy/hosting flags
// ─────────────────────────────────────────────────────────────────────────────

import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";
import { formatCountry, countryFlag } from "../../utils/formatters";
import { Badge } from "../Common/Badge";

export default function GeoCard({ geo = {} }) {
    const { colors } = useTheme();

    if (!geo || Object.keys(geo).length === 0) return null;

    const flags = [
        { key: "is_tor", label: "Tor Exit Node", variant: "red" },
        { key: "is_proxy", label: "Proxy/VPN", variant: "amber" },
        { key: "is_hosting", label: "Hosting/DC", variant: "purple" },
        { key: "is_mobile", label: "Mobile Network", variant: "blue" },
    ].filter((f) => geo[f.key]);

    const rows = [
        { label: "IP Address", value: geo.query ?? geo.ip ?? "—" },
        { label: "Country", value: geo.country ? `${countryFlag(geo.countryCode ?? "")} ${formatCountry(geo.countryCode ?? geo.country)}` : "—" },
        { label: "Region", value: geo.regionName ?? geo.region ?? "—" },
        { label: "City", value: geo.city ?? "—" },
        { label: "ISP", value: geo.isp ?? geo.org ?? "—" },
        { label: "AS", value: geo.as ?? geo.asname ?? "—" },
        { label: "Timezone", value: geo.timezone ?? "—" },
        { label: "Lat / Lon", value: geo.lat && geo.lon ? `${geo.lat}, ${geo.lon}` : "—" },
    ].filter((r) => r.value && r.value !== "—");

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: 12,
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: colors.bgSurface,
            }}>
                <span style={{ fontSize: "1rem" }}>📍</span>
                <span style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: colors.text,
                    flex: 1,
                }}>
                    IP Geolocation
                </span>
                {flags.length > 0 && (
                    <Badge variant="red" size="xs" pulse>
                        {flags.length} Risk Flag{flags.length > 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            <div style={{ padding: "8px 0" }}>
                {rows.map(({ label, value }, i) => (
                    <div
                        key={label}
                        style={{
                            display: "flex",
                            gap: 12,
                            padding: "7px 16px",
                            background: i % 2 === 0 ? "transparent" : `${colors.bgSurface}50`,
                            alignItems: "center",
                        }}
                    >
                        <span style={{
                            fontSize: "0.68rem",
                            fontFamily: "var(--font-accent)",
                            color: colors.textMuted,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            minWidth: 80,
                            flexShrink: 0,
                        }}>
                            {label}
                        </span>
                        <span style={{
                            fontSize: "0.78rem",
                            fontFamily: "var(--font-mono)",
                            color: colors.text,
                        }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Risk flags */}
            {flags.length > 0 && (
                <div style={{
                    padding: "10px 16px",
                    borderTop: `1px solid ${colors.border}`,
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                }}>
                    {flags.map((f) => (
                        <Badge key={f.key} variant={f.variant} size="xs" glow>
                            ⚠ {f.label}
                        </Badge>
                    ))}
                </div>
            )}
        </motion.div>
    );
}