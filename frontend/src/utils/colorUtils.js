// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Color Utilities
// Hex/RGB/HSL conversions, alpha manipulation, and theme color helpers.
// All functions are pure — no React, no side effects.
// ─────────────────────────────────────────────────────────────────────────────

// ── Hex ↔ RGB ─────────────────────────────────────────────────────────────────

/** Parse hex color to { r, g, b } */
export function hexToRgb(hex = "") {
    const clean = hex.replace("#", "");
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;
    const num = parseInt(full, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

/** Convert { r, g, b } to hex string */
export function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** Add alpha to a hex color → rgba string */
export function hexToRgba(hex = "", alpha = 1) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Parse rgba string to { r, g, b, a } */
export function parseRgba(rgba = "") {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return { r: 0, g: 0, b: 0, a: 1 };
    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    };
}

// ── Alpha manipulation ────────────────────────────────────────────────────────

/** Set alpha on any hex or rgba color string */
export function withAlpha(color = "", alpha = 1) {
    if (color.startsWith("#")) return hexToRgba(color, alpha);
    if (color.startsWith("rgba")) {
        const { r, g, b } = parseRgba(color);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (color.startsWith("rgb(")) {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
    }
    return color;
}

/** Increase alpha of an rgba color */
export function strengthen(color = "", factor = 2) {
    const { r, g, b, a } = parseRgba(color);
    return `rgba(${r}, ${g}, ${b}, ${Math.min(1, a * factor)})`;
}

/** Decrease alpha of an rgba color */
export function soften(color = "", factor = 2) {
    const { r, g, b, a } = parseRgba(color);
    return `rgba(${r}, ${g}, ${b}, ${a / factor})`;
}

// ── Brightness manipulation ───────────────────────────────────────────────────

/** Lighten a hex color by a percentage (0–100) */
export function lighten(hex = "", amount = 20) {
    const { r, g, b } = hexToRgb(hex);
    const factor = amount / 100;
    return rgbToHex(
        Math.min(255, r + (255 - r) * factor),
        Math.min(255, g + (255 - g) * factor),
        Math.min(255, b + (255 - b) * factor)
    );
}

/** Darken a hex color by a percentage (0–100) */
export function darken(hex = "", amount = 20) {
    const { r, g, b } = hexToRgb(hex);
    const factor = 1 - amount / 100;
    return rgbToHex(
        Math.round(r * factor),
        Math.round(g * factor),
        Math.round(b * factor)
    );
}

// ── HSL ──────────────────────────────────────────────────────────────────────

/** Convert hex to { h, s, l } */
export function hexToHsl(hex = "") {
    let { r, g, b } = hexToRgb(hex);
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
            default: h = 0;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Build an hsl() string */
export function hsl(h, s, l, a) {
    if (a !== undefined) return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// ── Glow generators ───────────────────────────────────────────────────────────

/**
 * Generate a box-shadow glow from a hex color
 * @param {string} hex
 * @param {number} intensity - 0 to 1
 * @param {number} spread    - blur radius in px
 */
export function generateGlow(hex = "", intensity = 0.3, spread = 40) {
    const rgba = hexToRgba(hex, intensity);
    const rgba2 = hexToRgba(hex, intensity * 0.3);
    return `0 0 ${spread}px ${rgba}, 0 0 ${spread * 2}px ${rgba2}`;
}

/**
 * Generate a text-shadow glow
 */
export function generateTextGlow(hex = "", intensity = 0.8, spread = 16) {
    const rgba = hexToRgba(hex, intensity);
    return `0 0 ${spread}px ${rgba}`;
}

// ── Contrast & accessibility ──────────────────────────────────────────────────

/** Calculate relative luminance (WCAG formula) */
export function luminance(hex = "") {
    const { r, g, b } = hexToRgb(hex);
    const toLinear = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** Calculate contrast ratio between two hex colors */
export function contrastRatio(hex1, hex2) {
    const l1 = luminance(hex1);
    const l2 = luminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/** Returns "#000000" or "#ffffff" — whichever contrasts better with the given bg */
export function readableTextColor(bgHex = "") {
    const l = luminance(bgHex);
    return l > 0.35 ? "#000000" : "#ffffff";
}

// ── Theme-aware color getters ─────────────────────────────────────────────────

/**
 * Get a CSS variable value from :root (live theme value)
 * @param {string} varName - e.g. "--accent" or "accent"
 */
export function getCssVar(varName = "") {
    const name = varName.startsWith("--") ? varName : `--${varName}`;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Map a severity level to its CSS variable color string
 */
export function severityColor(level = "") {
    const map = {
        CRITICAL: "var(--red)",
        HIGH: "var(--orange)",
        MEDIUM: "var(--amber)",
        LOW: "var(--blue)",
        NONE: "var(--green)",
        UNKNOWN: "var(--text-muted)",
    };
    return map[level.toUpperCase()] ?? "var(--text-muted)";
}

/**
 * Map a verdict to its CSS variable color
 */
export function verdictColor(verdict = "") {
    const map = {
        SAFE: "var(--green)",
        SUSPICIOUS: "var(--amber)",
        DANGEROUS: "var(--orange)",
        CRITICAL: "var(--red)",
        UNKNOWN: "var(--text-muted)",
    };
    return map[verdict.toUpperCase()] ?? "var(--text-muted)";
}

/**
 * IOC type → color
 */
export function iocColor(type = "") {
    const map = {
        url: "var(--red)",
        domain: "var(--blue)",
        email: "var(--amber)",
        phone: "var(--purple)",
        ip: "var(--teal)",
        hash: "var(--pink)",
    };
    return map[type.toLowerCase()] ?? "var(--text-sub)";
}

// ── Interpolation ─────────────────────────────────────────────────────────────

/** Interpolate between two hex colors by factor t (0–1) */
export function interpolateColor(hex1 = "", hex2 = "", t = 0.5) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    return rgbToHex(
        Math.round(c1.r + (c2.r - c1.r) * t),
        Math.round(c1.g + (c2.g - c1.g) * t),
        Math.round(c1.b + (c2.b - c1.b) * t)
    );
}

/** Get color for a 0–100 risk score */
export function scoreColor(score = 0) {
    if (score >= 80) return "var(--red)";
    if (score >= 60) return "var(--orange)";
    if (score >= 35) return "var(--amber)";
    return "var(--green)";
}

export function scoreGlow(score = 0) {
    if (score >= 80) return "var(--red-glow)";
    if (score >= 60) return "var(--orange-glow)";
    if (score >= 35) return "var(--amber-glow)";
    return "var(--green-glow)";
}