// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useThreatFeed hook (v2 — REAL DATA)
// Polls the backend's /threat-feed/live endpoint (real URLhaus data) instead
// of generating simulated threats client-side. Same public interface as the
// old version, so LiveFeed.jsx and any other consumer need ZERO changes.
//
// Usage:
//   const { feed, isLive, pause, resume, clearFeed } = useThreatFeed()
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import api, { APIError } from "../utils/api";

// The backend caches URLhaus data for 5 minutes (their fair-use limit), so
// polling faster than that mostly re-reads the same cached response. This
// interval keeps the feed feeling "live" without hammering the backend.
const DEFAULT_POLL_MS = 20_000;

/**
 * @param {object} [options]
 * @param {number}  [options.maxItems=50]        - max feed items kept in memory
 * @param {number}  [options.intervalMs=20000]   - ms between polls to backend
 * @param {boolean} [options.autoStart=true]     - start polling immediately
 * @param {boolean} [options.pauseOnBlur=true]   - pause polling when tab loses focus
 * @param {(item: object) => void} [options.onNewThreat] - callback for each newly-seen item
 */
export function useThreatFeed(options = {}) {
    const {
        maxItems = 50,
        intervalMs = DEFAULT_POLL_MS,
        autoStart = true,
        pauseOnBlur = true,
        onNewThreat = null,
    } = options;

    const [feed, setFeed] = useState([]);
    const [isLive, setIsLive] = useState(autoStart);
    const [isPaused, setIsPaused] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [error, setError] = useState(null);

    const intervalRef = useRef(null);
    const isLiveRef = useRef(autoStart);
    const isPausedRef = useRef(false);
    const seenIdsRef = useRef(new Set());
    const abortRef = useRef(null);
    const onNewThreatRef = useRef(onNewThreat);

    useEffect(() => { onNewThreatRef.current = onNewThreat; }, [onNewThreat]);

    // ── Poll backend once ───────────────────────────────────────
    const pollOnce = useCallback(async () => {
        if (!isLiveRef.current || isPausedRef.current) return;

        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const res = await api.threatFeedLive(maxItems, controller.signal);
            const items = res?.items ?? [];

            setIsConnected(true);
            setError(null);

            const isFirstLoad = seenIdsRef.current.size === 0;
            const freshItems = [];

            for (const item of items) {
                if (!seenIdsRef.current.has(item.id)) {
                    seenIdsRef.current.add(item.id);
                    freshItems.push({ ...item, isNew: !isFirstLoad });
                }
            }

            if (freshItems.length === 0) return;

            setFeed((prev) => {
                const next = isFirstLoad ? freshItems : [...freshItems, ...prev];
                return next.length > maxItems ? next.slice(0, maxItems) : next;
            });

            // Skip the "just arrived" pulse animation on initial load —
            // only fire callbacks / highlight items discovered after that.
            if (!isFirstLoad) {
                freshItems.forEach((item) => onNewThreatRef.current?.(item));
                setTimeout(() => {
                    setFeed((prev) =>
                        prev.map((f) =>
                            freshItems.some((n) => n.id === f.id) ? { ...f, isNew: false } : f
                        )
                    );
                }, 3000);
            }
        } catch (err) {
            if (err?.name === "AbortError") return;
            setIsConnected(false);
            setError(err instanceof APIError ? err.message : "Failed to reach threat feed");
        }
    }, [maxItems]);

    // ── Start / stop polling ────────────────────────────────────
    const startPolling = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        pollOnce(); // fetch immediately, don't wait for the first interval tick
        intervalRef.current = setInterval(pollOnce, intervalMs);
    }, [pollOnce, intervalMs]);

    const start = useCallback(() => {
        isLiveRef.current = true;
        setIsLive(true);
        startPolling();
    }, [startPolling]);

    const stop = useCallback(() => {
        isLiveRef.current = false;
        setIsLive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (abortRef.current) abortRef.current.abort();
    }, []);

    const pause = useCallback(() => {
        isPausedRef.current = true;
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        isPausedRef.current = false;
        setIsPaused(false);
        pollOnce(); // catch up immediately on resume
    }, [pollOnce]);

    const clearFeed = useCallback(() => {
        setFeed([]);
        seenIdsRef.current.clear();
    }, []);

    // ── Stats — derived live from current feed ──────────────────
    const stats = useMemo(() => {
        return feed.reduce(
            (acc, item) => {
                acc.total += 1;
                const key = item.severity?.toLowerCase();
                if (key && acc[key] !== undefined) acc[key] += 1;
                return acc;
            },
            { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
        );
    }, [feed]);

    // ── Filter helpers ──────────────────────────────────────────
    const getBySeverity = useCallback(
        (severity) => feed.filter((f) => f.severity === severity),
        [feed]
    );

    const getRecent = useCallback(
        (n = 10) => feed.slice(0, n),
        [feed]
    );

    // ── Auto-start ──────────────────────────────────────────────
    useEffect(() => {
        if (autoStart) startPolling();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [autoStart, startPolling]);

    // ── Pause on tab blur ───────────────────────────────────────
    useEffect(() => {
        if (!pauseOnBlur) return;

        function onBlur() { isPausedRef.current = true; setIsPaused(true); }
        function onFocus() {
            isPausedRef.current = false;
            setIsPaused(false);
            pollOnce(); // catch up on focus
        }

        window.addEventListener("blur", onBlur);
        window.addEventListener("focus", onFocus);
        return () => {
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("focus", onFocus);
        };
    }, [pauseOnBlur, pollOnce]);

    return {
        // Data
        feed,
        stats,

        // State
        isLive,
        isPaused,
        isConnected,
        error,

        // Controls
        start,
        stop,
        pause,
        resume,
        clearFeed,

        // Filters
        getBySeverity,
        getRecent,
        criticalFeed: feed.filter((f) => f.severity === "CRITICAL"),
        newItems: feed.filter((f) => f.isNew),
    };
}

export default useThreatFeed;