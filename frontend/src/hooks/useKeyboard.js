// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useKeyboard hook
// Global keyboard shortcut system. Register named shortcuts anywhere.
// Powers command palette, quick actions, and accessibility navigation.
//
// Usage:
//   useKeyboard({ 'ctrl+k': openCommandPalette, 'escape': closeModal })
//   const { isPressed } = useKeyPress('Enter')
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useCallback, useRef, useState } from "react";

// ── Key normalization ─────────────────────────────────────────────────────────

function normalizeKey(key) {
    const map = {
        " ": "space",
        "arrowup": "up",
        "arrowdown": "down",
        "arrowleft": "left",
        "arrowright": "right",
        "escape": "esc",
        "enter": "enter",
        "tab": "tab",
        "backspace": "backspace",
        "delete": "delete",
        "control": "ctrl",
        "meta": "cmd",
    };
    const k = key.toLowerCase();
    return map[k] ?? k;
}

/**
 * Parse a shortcut string like "ctrl+shift+k" into a matcher object
 */
function parseShortcut(shortcut) {
    const parts = shortcut.toLowerCase().split("+");
    return {
        ctrl: parts.includes("ctrl") || parts.includes("control"),
        shift: parts.includes("shift"),
        alt: parts.includes("alt"),
        meta: parts.includes("meta") || parts.includes("cmd"),
        key: parts.find((p) => !["ctrl", "control", "shift", "alt", "meta", "cmd"].includes(p)) ?? "",
    };
}

/**
 * Check if a KeyboardEvent matches a parsed shortcut
 */
function matchesShortcut(e, parsed) {
    const key = normalizeKey(e.key);
    return (
        e.ctrlKey === parsed.ctrl &&
        e.shiftKey === parsed.shift &&
        e.altKey === parsed.alt &&
        e.metaKey === parsed.meta &&
        key === parsed.key
    );
}

// ── Primary Hook: useKeyboard ─────────────────────────────────────────────────

/**
 * Register multiple keyboard shortcuts at once.
 *
 * @param {Record<string, (e: KeyboardEvent) => void>} shortcuts
 *   Keys are shortcut strings like "ctrl+k", "escape", "ctrl+shift+t"
 *   Values are handler functions
 *
 * @param {object} [options]
 * @param {boolean} [options.enabled=true]       - master on/off switch
 * @param {boolean} [options.preventDefault=true] - prevent default browser action
 * @param {boolean} [options.stopPropagation=false]
 * @param {'keydown'|'keyup'|'keypress'} [options.event='keydown']
 * @param {HTMLElement|null} [options.target=window] - element to attach listener to
 */
export function useKeyboard(shortcuts = {}, options = {}) {
    const {
        enabled = true,
        preventDefault = true,
        stopPropagation = false,
        event = "keydown",
        target = null,
    } = options;

    // Parse shortcuts once and cache
    const parsedRef = useRef({});
    useEffect(() => {
        parsedRef.current = Object.fromEntries(
            Object.entries(shortcuts).map(([k, v]) => [k, { parsed: parseShortcut(k), handler: v }])
        );
    }, [shortcuts]);

    const handleKey = useCallback(
        (e) => {
            if (!enabled) return;

            // Don't fire shortcuts when typing in inputs
            const tag = e.target?.tagName?.toLowerCase();
            const isInput = ["input", "textarea", "select"].includes(tag) ||
                e.target?.isContentEditable;

            for (const [, { parsed, handler }] of Object.entries(parsedRef.current)) {
                if (matchesShortcut(e, parsed)) {
                    // Allow escape from inputs, block others
                    if (isInput && parsed.key !== "esc" && parsed.key !== "escape") continue;

                    if (preventDefault) e.preventDefault();
                    if (stopPropagation) e.stopPropagation();
                    handler(e);
                    break;
                }
            }
        },
        [enabled, preventDefault, stopPropagation]
    );

    useEffect(() => {
        const el = target ?? window;
        el.addEventListener(event, handleKey);
        return () => el.removeEventListener(event, handleKey);
    }, [target, event, handleKey]);
}

// ── useKeyPress — single key state ───────────────────────────────────────────

/**
 * Track whether a specific key is currently held down.
 * @param {string} key - e.g. "shift", "ctrl", " "
 * @returns {{ isPressed: boolean }}
 */
export function useKeyPress(key) {
    const [isPressed, setIsPressed] = useState(false);
    const normalized = normalizeKey(key);

    useEffect(() => {
        function down(e) {
            if (normalizeKey(e.key) === normalized) setIsPressed(true);
        }
        function up(e) {
            if (normalizeKey(e.key) === normalized) setIsPressed(false);
        }
        function blur() { setIsPressed(false); }

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        window.addEventListener("blur", blur);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
            window.removeEventListener("blur", blur);
        };
    }, [normalized]);

    return { isPressed };
}

// ── useModifierKeys — track modifier key state ────────────────────────────────

/**
 * Returns live state of all modifier keys.
 * @returns {{ ctrl: boolean, shift: boolean, alt: boolean, meta: boolean }}
 */
export function useModifierKeys() {
    const [modifiers, setModifiers] = useState({
        ctrl: false,
        shift: false,
        alt: false,
        meta: false,
    });

    useEffect(() => {
        function update(e) {
            setModifiers({
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey,
                meta: e.metaKey,
            });
        }
        function reset() {
            setModifiers({ ctrl: false, shift: false, alt: false, meta: false });
        }

        window.addEventListener("keydown", update);
        window.addEventListener("keyup", update);
        window.addEventListener("blur", reset);
        return () => {
            window.removeEventListener("keydown", update);
            window.removeEventListener("keyup", update);
            window.removeEventListener("blur", reset);
        };
    }, []);

    return modifiers;
}

// ── Sentinel Global Shortcuts ─────────────────────────────────────────────────

/**
 * Register all global Sentinel AI shortcuts.
 * Call once at the App level.
 *
 * @param {object} handlers - map of action names to handler functions
 * @param {() => void} handlers.openCommandPalette
 * @param {() => void} handlers.openScanner
 * @param {() => void} handlers.goHome
 * @param {() => void} handlers.toggleCopilot
 * @param {() => void} handlers.toggleSidebar
 * @param {() => void} handlers.toggleTheme
 * @param {() => void} handlers.openForensics
 * @param {() => void} handlers.openOSINT
 * @param {() => void} handlers.openHistory
 * @param {() => void} handlers.closeModal
 * @param {() => void} handlers.newScan
 */
export function useSentinelShortcuts(handlers = {}) {
    const {
        openCommandPalette,
        openScanner,
        goHome,
        toggleCopilot,
        toggleSidebar,
        toggleTheme,
        openForensics,
        openOSINT,
        openHistory,
        closeModal,
        newScan,
    } = handlers;

    const shortcuts = {};

    if (openCommandPalette) shortcuts["ctrl+k"] = openCommandPalette;
    if (openCommandPalette) shortcuts["meta+k"] = openCommandPalette;
    if (openScanner) shortcuts["ctrl+shift+s"] = openScanner;
    if (goHome) shortcuts["ctrl+shift+h"] = goHome;
    if (toggleCopilot) shortcuts["ctrl+shift+a"] = toggleCopilot;
    if (toggleSidebar) shortcuts["ctrl+b"] = toggleSidebar;
    if (toggleTheme) shortcuts["ctrl+shift+t"] = toggleTheme;
    if (openForensics) shortcuts["ctrl+shift+f"] = openForensics;
    if (openOSINT) shortcuts["ctrl+shift+o"] = openOSINT;
    if (openHistory) shortcuts["ctrl+h"] = openHistory;
    if (closeModal) shortcuts["esc"] = closeModal;
    if (newScan) shortcuts["ctrl+enter"] = newScan;

    useKeyboard(shortcuts, { preventDefault: true });
}

// ── useEscape — quick escape key handler ──────────────────────────────────────

/**
 * Call handler when Escape is pressed.
 * @param {() => void} handler
 * @param {boolean} [enabled=true]
 */
export function useEscape(handler, enabled = true) {
    useKeyboard(
        { esc: handler },
        { enabled, preventDefault: false }
    );
}

// ── useEnter — call handler on Enter ─────────────────────────────────────────

/**
 * Call handler when Enter is pressed (not inside textarea).
 * @param {() => void} handler
 * @param {boolean} [enabled=true]
 */
export function useEnter(handler, enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        function onKey(e) {
            if (e.key !== "Enter") return;
            const tag = e.target?.tagName?.toLowerCase();
            if (tag === "textarea") return;
            if (e.target?.isContentEditable) return;
            handler(e);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [handler, enabled]);
}

// ── useArrowKeys — directional navigation ────────────────────────────────────

/**
 * @param {object} handlers
 * @param {() => void} [handlers.up]
 * @param {() => void} [handlers.down]
 * @param {() => void} [handlers.left]
 * @param {() => void} [handlers.right]
 * @param {boolean} [enabled=true]
 */
export function useArrowKeys(handlers = {}, enabled = true) {
    const shortcuts = {};
    if (handlers.up) shortcuts["up"] = handlers.up;
    if (handlers.down) shortcuts["down"] = handlers.down;
    if (handlers.left) shortcuts["left"] = handlers.left;
    if (handlers.right) shortcuts["right"] = handlers.right;

    useKeyboard(shortcuts, { enabled, preventDefault: true });
}

// ── SHORTCUT_LABELS — for help overlay display ────────────────────────────────

export const SHORTCUT_LABELS = [
    { shortcut: "Ctrl+K", label: "Command Palette", group: "Navigation" },
    { shortcut: "Ctrl+Shift+S", label: "Open Scanner", group: "Navigation" },
    { shortcut: "Ctrl+Shift+H", label: "Command Center", group: "Navigation" },
    { shortcut: "Ctrl+Shift+F", label: "Forensics Lab", group: "Navigation" },
    { shortcut: "Ctrl+Shift+O", label: "OSINT Recon", group: "Navigation" },
    { shortcut: "Ctrl+H", label: "Scan History", group: "Navigation" },
    { shortcut: "Ctrl+B", label: "Toggle Sidebar", group: "Interface" },
    { shortcut: "Ctrl+Shift+A", label: "Toggle AI Copilot", group: "Interface" },
    { shortcut: "Ctrl+Shift+T", label: "Cycle Theme", group: "Interface" },
    { shortcut: "Ctrl+Enter", label: "Run New Scan", group: "Actions" },
    { shortcut: "Escape", label: "Close / Cancel", group: "Actions" },
];

export default useKeyboard;