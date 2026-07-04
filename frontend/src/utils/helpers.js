// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — General Helpers
// Pure utility functions — no React, no side effects
// ─────────────────────────────────────────────────────────────────────────────

// ── String utilities ──────────────────────────────────────────────────────────

/** Truncate a string to maxLen chars with ellipsis */
export function truncate(str, maxLen = 60) {
    if (!str) return "";
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 1) + "…";
}

/** Capitalize first letter */
export function capitalize(str = "") {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Title-case a string */
export function titleCase(str = "") {
    return str
        .toLowerCase()
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

/** Strip protocol from URL for display */
export function stripProtocol(url = "") {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
}

/** Extract domain from full URL */
export function extractDomain(url = "") {
    try {
        return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    } catch {
        return url;
    }
}

/** Check if string looks like a URL */
export function isUrl(str = "") {
    try {
        const u = new URL(str.startsWith("http") ? str : `https://${str}`);
        return u.hostname.includes(".");
    } catch {
        return false;
    }
}

/** Check if string looks like an IP address */
export function isIpAddress(str = "") {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(str.trim());
}

/** Check if string looks like an email */
export function isEmail(str = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
}

/** Mask sensitive string — show first 4 + last 4 chars */
export function maskString(str = "", show = 4) {
    if (str.length <= show * 2) return "****";
    return str.slice(0, show) + "****" + str.slice(-show);
}

/** Generate a short random ID */
export function shortId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Array utilities ───────────────────────────────────────────────────────────

/** Unique array by key */
export function uniqueBy(arr = [], key) {
    const seen = new Set();
    return arr.filter((item) => {
        const k = typeof key === "function" ? key(item) : item[key];
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

/** Group array of objects by a key */
export function groupBy(arr = [], key) {
    return arr.reduce((acc, item) => {
        const k = typeof key === "function" ? key(item) : item[key];
        if (!acc[k]) acc[k] = [];
        acc[k].push(item);
        return acc;
    }, {});
}

/** Sort array of objects by key, ascending */
export function sortBy(arr = [], key, dir = "asc") {
    return [...arr].sort((a, b) => {
        const av = typeof key === "function" ? key(a) : a[key];
        const bv = typeof key === "function" ? key(b) : b[key];
        if (av < bv) return dir === "asc" ? -1 : 1;
        if (av > bv) return dir === "asc" ? 1 : -1;
        return 0;
    });
}

/** Chunk array into groups of n */
export function chunk(arr = [], n = 10) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += n) {
        chunks.push(arr.slice(i, i + n));
    }
    return chunks;
}

/** Pick random item from array */
export function randomPick(arr = []) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ── Number utilities ──────────────────────────────────────────────────────────

/** Clamp a number between min and max */
export function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}

/** Linear interpolation */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/** Map a value from one range to another */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/** Round to N decimal places */
export function round(n, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
}

/** Format large numbers with K/M suffix */
export function compactNumber(n = 0) {
    if (n >= 1_000_000) return `${round(n / 1_000_000, 1)}M`;
    if (n >= 1_000) return `${round(n / 1_000, 1)}K`;
    return String(n);
}

// ── Date / Time utilities ─────────────────────────────────────────────────────

/** Relative time — "2 minutes ago", "just now" */
export function timeAgo(dateStr = "") {
    const date = new Date(dateStr);
    const now = Date.now();
    const diff = now - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Format ISO date to readable string */
export function formatDate(dateStr = "", opts = {}) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...opts,
    });
}

/** Format ISO datetime to readable string */
export function formatDateTime(dateStr = "") {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Clipboard ─────────────────────────────────────────────────────────────────

/** Copy text to clipboard — returns true on success */
export async function copyToClipboard(text = "") {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(el);
        return ok;
    }
}

// ── DOM utilities ─────────────────────────────────────────────────────────────

/** Scroll element into view smoothly */
export function scrollIntoView(el, block = "center") {
    el?.scrollIntoView({ behavior: "smooth", block });
}

/** Check if user prefers reduced motion */
export function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Check if device is touch/mobile */
export function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// ── Object utilities ──────────────────────────────────────────────────────────

/** Deep clone an object */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/** Pick specific keys from object */
export function pick(obj = {}, keys = []) {
    return Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));
}

/** Omit specific keys from object */
export function omit(obj = {}, keys = []) {
    return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
}

/** Deep merge two objects */
export function deepMerge(target = {}, source = {}) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] ?? {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// ── IOC extraction ────────────────────────────────────────────────────────────

/** Extract all URLs from a block of text */
export function extractUrls(text = "") {
    const pattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    return [...new Set(text.match(pattern) ?? [])];
}

/** Extract all email addresses from text */
export function extractEmails(text = "") {
    const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    return [...new Set(text.match(pattern) ?? [])];
}

/** Extract phone numbers (basic) */
export function extractPhones(text = "") {
    const pattern = /(?:\+91|0)?[6-9]\d{9}/g;
    return [...new Set(text.match(pattern) ?? [])];
}

// ── Debounce / Throttle ───────────────────────────────────────────────────────

export function debounce(fn, ms = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export function throttle(fn, ms = 100) {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last >= ms) {
            last = now;
            fn(...args);
        }
    };
}

// ── File utilities ────────────────────────────────────────────────────────────

/** Format file size in human-readable form */
export function formatFileSize(bytes = 0) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${round(bytes / 1024, 1)} KB`;
    return `${round(bytes / (1024 * 1024), 1)} MB`;
}

/** Get file extension */
export function fileExtension(filename = "") {
    return filename.split(".").pop()?.toLowerCase() ?? "";
}

/** Get file type category for forensics */
export function fileScanType(filename = "") {
    const ext = fileExtension(filename);
    if (["png", "jpg", "jpeg", "webp", "bmp"].includes(ext)) return "screenshot";
    if (ext === "pdf") return "pdf";
    if (ext === "docx") return "docx";
    if (["png", "jpg", "jpeg"].includes(ext)) return "qr"; // ambiguous — prefer screenshot
    return "screenshot";
}