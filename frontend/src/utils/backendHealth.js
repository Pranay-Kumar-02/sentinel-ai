// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — Backend health singleton
// A single shared poller for /health, so Sidebar and TopBar (and anything
// else that cares) don't each run their own independent 30s interval
// hitting the same endpoint. First subscriber starts the poll; every
// subscriber gets the same live state.
// ─────────────────────────────────────────────────────────────────────────────

const listeners = new Set();
let state = { alive: null, lastChecked: null };
let started = false;
let intervalId = null;

async function check() {
    try {
        const res = await fetch("http://127.0.0.1:8000/health", { signal: AbortSignal.timeout(3000) });
        state = { alive: res.ok, lastChecked: Date.now() };
    } catch {
        state = { alive: false, lastChecked: Date.now() };
    }
    listeners.forEach((fn) => fn(state));
}

function start() {
    if (started) return;
    started = true;
    check();
    intervalId = setInterval(check, 30_000);
}

export function subscribeBackendHealth(callback) {
    start();
    listeners.add(callback);
    callback(state); // hand back whatever we already know immediately
    return () => {
        listeners.delete(callback);
        // If nobody's listening anymore, stop polling — no point hitting
        // /health every 30s with zero components caring about the result.
        if (listeners.size === 0 && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            started = false;
        }
    };
}

export function getBackendHealthSnapshot() {
    return state;
}