// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useLocalStorage hook
// Persistent state synced to localStorage with SSR safety,
// cross-tab sync, and JSON serialization built in.
//
// Usage:
//   const [value, setValue, removeValue] = useLocalStorage('key', defaultValue)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isClient() {
    return typeof window !== "undefined";
}

function readFromStorage(key, defaultValue) {
    if (!isClient()) return defaultValue;
    try {
        const raw = window.localStorage.getItem(key);
        if (raw === null) return defaultValue;
        return JSON.parse(raw);
    } catch {
        return defaultValue;
    }
}

function writeToStorage(key, value) {
    if (!isClient()) return false;
    try {
        if (value === undefined) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, JSON.stringify(value));
        }
        return true;
    } catch {
        return false;
    }
}

// ── Core Hook ─────────────────────────────────────────────────────────────────

/**
 * Persistent state hook backed by localStorage.
 *
 * @template T
 * @param {string} key            - localStorage key
 * @param {T}      defaultValue   - value used when key doesn't exist
 * @param {object} [options]
 * @param {boolean} [options.sync=true]     - sync across tabs via storage event
 * @param {(v:T)=>T} [options.deserialize]  - custom deserializer
 * @param {(v:T)=>any} [options.serialize]  - custom serializer
 *
 * @returns {[T, (value: T | ((prev: T) => T)) => void, () => void]}
 */
export function useLocalStorage(key, defaultValue, options = {}) {
    const { sync = true } = options;

    // Track the key in a ref so effect cleanup always has latest key
    const keyRef = useRef(key);
    useEffect(() => { keyRef.current = key; }, [key]);

    // Initialize from storage — runs only on client
    const [storedValue, setStoredValue] = useState(() =>
        readFromStorage(key, defaultValue)
    );

    // ── Setter ─────────────────────────────────────────────────
    const setValue = useCallback(
        (valueOrUpdater) => {
            setStoredValue((prev) => {
                const next =
                    typeof valueOrUpdater === "function"
                        ? valueOrUpdater(prev)
                        : valueOrUpdater;

                writeToStorage(keyRef.current, next);
                return next;
            });
        },
        [] // stable — never changes
    );

    // ── Remover ────────────────────────────────────────────────
    const removeValue = useCallback(() => {
        writeToStorage(keyRef.current, undefined);
        setStoredValue(defaultValue);
    }, [defaultValue]);

    // ── Cross-tab sync ─────────────────────────────────────────
    useEffect(() => {
        if (!sync || !isClient()) return;

        function handleStorageEvent(e) {
            if (e.key !== key) return;
            if (e.newValue === null) {
                setStoredValue(defaultValue);
            } else {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch {
                    setStoredValue(defaultValue);
                }
            }
        }

        window.addEventListener("storage", handleStorageEvent);
        return () => window.removeEventListener("storage", handleStorageEvent);
    }, [key, defaultValue, sync]);

    // ── Re-read when key changes ───────────────────────────────
    useEffect(() => {
        setStoredValue(readFromStorage(key, defaultValue));
    }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

    return [storedValue, setValue, removeValue];
}

// ── Specialized Variants ──────────────────────────────────────────────────────

/**
 * Persistent boolean toggle
 * @param {string}  key
 * @param {boolean} defaultValue
 * @returns {[boolean, () => void, (v: boolean) => void]}
 */
export function useLocalStorageToggle(key, defaultValue = false) {
    const [value, setValue] = useLocalStorage(key, defaultValue);
    const toggle = useCallback(() => setValue((v) => !v), [setValue]);
    return [value, toggle, setValue];
}

/**
 * Persistent array — push, remove, clear helpers included
 * @param {string} key
 * @param {any[]}  defaultValue
 */
export function useLocalStorageArray(key, defaultValue = []) {
    const [array, setArray] = useLocalStorage(key, defaultValue);

    const push = useCallback(
        (item) => setArray((prev) => [...prev, item]),
        [setArray]
    );

    const removeAt = useCallback(
        (index) => setArray((prev) => prev.filter((_, i) => i !== index)),
        [setArray]
    );

    const removeWhere = useCallback(
        (predicate) => setArray((prev) => prev.filter((item) => !predicate(item))),
        [setArray]
    );

    const update = useCallback(
        (index, item) =>
            setArray((prev) => prev.map((v, i) => (i === index ? item : v))),
        [setArray]
    );

    const clear = useCallback(() => setArray([]), [setArray]);

    const prepend = useCallback(
        (item) => setArray((prev) => [item, ...prev]),
        [setArray]
    );

    return { array, setArray, push, prepend, removeAt, removeWhere, update, clear };
}

/**
 * Persistent object — merge helpers included
 * @param {string} key
 * @param {object} defaultValue
 */
export function useLocalStorageObject(key, defaultValue = {}) {
    const [obj, setObj] = useLocalStorage(key, defaultValue);

    const merge = useCallback(
        (partial) => setObj((prev) => ({ ...prev, ...partial })),
        [setObj]
    );

    const setKey = useCallback(
        (k, v) => setObj((prev) => ({ ...prev, [k]: v })),
        [setObj]
    );

    const deleteKey = useCallback(
        (k) =>
            setObj((prev) => {
                const next = { ...prev };
                delete next[k];
                return next;
            }),
        [setObj]
    );

    const reset = useCallback(() => setObj(defaultValue), [setObj, defaultValue]);

    return { obj, setObj, merge, setKey, deleteKey, reset };
}

// ── Sentinel-specific storage keys ────────────────────────────────────────────
// Centralized so key strings are never duplicated across the codebase

export const STORAGE_KEYS = {
    THEME: "sentinel_theme",
    SIDEBAR_OPEN: "sentinel_sidebar_open",
    SCAN_HISTORY: "sentinel_scan_history",
    RECENT_SCANS: "sentinel_recent_scans",
    COPILOT_OPEN: "sentinel_copilot_open",
    SCAN_TYPE: "sentinel_scan_type",
    ANALYST_MODE: "sentinel_analyst_mode",
    NOTIFICATIONS: "sentinel_notifications_enabled",
    SOUND: "sentinel_sound_enabled",
    ONBOARDED: "sentinel_onboarded",
    SAVED_CASES: "sentinel_saved_cases",
    FEED_PAUSED: "sentinel_feed_paused",
    GRID_VISIBLE: "sentinel_grid_visible",
    PARTICLES_ON: "sentinel_particles_on",
    REDUCED_MOTION: "sentinel_reduced_motion",
};

// ── Sentinel-specific convenience hooks ───────────────────────────────────────

/** Sidebar collapsed state */
export function useSidebarState() {
    return useLocalStorageToggle(STORAGE_KEYS.SIDEBAR_OPEN, true);
}

/** Scan history array — last 50 scans */
export function useScanHistory() {
    const { array, prepend, removeAt, clear } = useLocalStorageArray(
        STORAGE_KEYS.SCAN_HISTORY,
        []
    );

    const addScan = useCallback(
        (scan) => {
            const entry = {
                ...scan,
                id: crypto.randomUUID?.() ?? Date.now().toString(36),
                timestamp: new Date().toISOString(),
            };
            prepend(entry);
            // Keep last 50
            if (array.length >= 50) removeAt(array.length - 1);
        },
        [prepend, removeAt, array.length]
    );

    return { history: array, addScan, removeAt, clearHistory: clear };
}

/** Analyst mode toggle */
export function useAnalystMode() {
    return useLocalStorageToggle(STORAGE_KEYS.ANALYST_MODE, false);
}

/** Copilot panel open state */
export function useCopilotState() {
    return useLocalStorageToggle(STORAGE_KEYS.COPILOT_OPEN, false);
}

/** Whether user has completed onboarding */
export function useOnboarded() {
    return useLocalStorage(STORAGE_KEYS.ONBOARDED, false);
}

/** Particle system enabled */
export function useParticlesEnabled() {
    return useLocalStorageToggle(STORAGE_KEYS.PARTICLES_ON, true);
}

/** Background grid visible */
export function useGridVisible() {
    return useLocalStorageToggle(STORAGE_KEYS.GRID_VISIBLE, true);
}

/** User-preferred reduced motion (overrides system) */
export function useReducedMotionPref() {
    return useLocalStorageToggle(STORAGE_KEYS.REDUCED_MOTION, false);
}

export default useLocalStorage;