// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — API Client
// Centralized fetch wrapper for all FastAPI backend endpoints.
// Never import fetch directly in components — use this.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const TIMEOUT_MS = 60_000; // 60s — LLM calls can be slow

// ── Base fetch wrapper ────────────────────────────────────────────────────────

async function request(path, options = {}, signal = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Allow caller to cancel via their own signal
    if (signal) {
        signal.addEventListener("abort", () => controller.abort());
    }

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            ...options,
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            let detail = `HTTP ${res.status}`;
            try {
                const err = await res.json();
                detail = err.detail ?? err.message ?? detail;
            } catch { /* ignore */ }
            throw new APIError(detail, res.status);
        }

        return await res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof APIError) throw err;
        if (err.name === "AbortError") throw new APIError("Request cancelled", 0);
        throw new APIError(err.message ?? "Network error", 0);
    }
}

async function requestMultipart(path, formData, signal = null) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (signal) {
        signal.addEventListener("abort", () => controller.abort());
    }

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: "POST",
            body: formData,
            signal: controller.signal,
            // No Content-Type header — browser sets it with boundary for multipart
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            let detail = `HTTP ${res.status}`;
            try {
                const err = await res.json();
                detail = err.detail ?? err.message ?? detail;
            } catch { /* ignore */ }
            throw new APIError(detail, res.status);
        }

        return await res.json();
    } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof APIError) throw err;
        if (err.name === "AbortError") throw new APIError("Request cancelled", 0);
        throw new APIError(err.message ?? "Network error", 0);
    }
}

// ── Custom error class ────────────────────────────────────────────────────────

export class APIError extends Error {
    constructor(message, status = 0) {
        super(message);
        this.name = "APIError";
        this.status = status;
    }
}

// ── Health ────────────────────────────────────────────────────────────────────

export const api = {

    /** GET /health — check backend is alive */
    async health() {
        return request("/health", { method: "GET" });
    },

    /** GET / — platform info */
    async info() {
        return request("/", { method: "GET" });
    },

    // ── Live Threat Feed ─────────────────────────────────────────

    /**
     * GET /threat-feed/live — real threat data (URLhaus / abuse.ch)
     * @param {number} [limit=30]
     * @param {AbortSignal} [signal]
     */
    async threatFeedLive(limit = 30, signal = null) {
        return request(`/threat-feed/live?limit=${limit}`, { method: "GET" }, signal);
    },

    // ── LLM Analysis ─────────────────────────────────────────────

    /**
     * POST /analyze — LLM threat analysis
     * @param {string} text
     * @param {AbortSignal} [signal]
     */
    async analyze(text, signal = null) {
        return request("/analyze", {
            method: "POST",
            body: JSON.stringify({ text }),
        }, signal);
    },

    // ── OSINT ─────────────────────────────────────────────────────

    /**
     * POST /osint — OSINT scan on a URL/domain
     * @param {string} url
     * @param {AbortSignal} [signal]
     */
    async osint(url, signal = null) {
        return request("/osint", {
            method: "POST",
            body: JSON.stringify({ url }),
        }, signal);
    },

    // ── Full Scan ─────────────────────────────────────────────────

    /**
     * POST /fullscan — LLM + OSINT combined
     * @param {string}  text
     * @param {boolean} [runOsint=true]
     * @param {AbortSignal} [signal]
     */
    async fullScan(text, runOsint = true, signal = null) {
        return request("/fullscan", {
            method: "POST",
            body: JSON.stringify({ text, run_osint: runOsint }),
        }, signal);
    },

    // ── Forensics ─────────────────────────────────────────────────

    /**
     * POST /forensics/upload — file-based forensics
     * @param {File}   file
     * @param {string} scanType - "screenshot" | "qr" | "pdf" | "docx"
     * @param {AbortSignal} [signal]
     */
    async forensicsUpload(file, scanType = "screenshot", signal = null) {
        const form = new FormData();
        form.append("file", file);
        form.append("scan_type", scanType);
        return requestMultipart("/forensics/upload", form, signal);
    },

    // ── Email Analysis ────────────────────────────────────────────

    /**
     * POST /analyze/email — raw email header + body analysis
     * @param {string} rawEmail
     * @param {AbortSignal} [signal]
     */
    async analyzeEmail(rawEmail, signal = null) {
        return request("/analyze/email", {
            method: "POST",
            body: JSON.stringify({ raw_email: rawEmail }),
        }, signal);
    },

    // ── Smart scan router ─────────────────────────────────────────

    /**
     * Route to the right endpoint based on scan type.
     * Falls back to /analyze if /fullscan fails.
     *
     * @param {string|File} input
     * @param {string}      scanType
     * @param {object}      [opts]
     * @param {AbortSignal} [opts.signal]
     * @param {boolean}     [opts.runOsint=true]
     */
    async smartScan(input, scanType, opts = {}) {
        const { signal = null, runOsint = true } = opts;

        switch (scanType) {
            case "screenshot":
            case "qr":
            case "pdf":
            case "docx":
                return api.forensicsUpload(input, scanType, signal);

            case "email":
                return api.analyzeEmail(input, signal);

            case "url":
            case "domain":
                return api.osint(input, signal);

            case "message":
            default: {
                try {
                    return await api.fullScan(input, runOsint, signal);
                } catch (err) {
                    // Fallback: LLM only
                    if (err instanceof APIError && err.status !== 0) {
                        return api.analyze(input, signal);
                    }
                    throw err;
                }
            }
        }
    },

    // ── Convenience: check if backend is reachable ────────────────

    /**
     * Returns true if backend responds to /health within 5s
     */
    async isBackendAlive() {
        try {
            const controller = new AbortController();
            const t = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
            clearTimeout(t);
            return res.ok;
        } catch {
            return false;
        }
    },
};

export default api;