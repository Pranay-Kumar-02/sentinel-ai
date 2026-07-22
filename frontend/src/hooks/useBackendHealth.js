// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — useBackendHealth
// Thin hook wrapper around the shared backend-health singleton — every
// component using this gets the same live value from ONE underlying poll,
// not one poll per component.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { subscribeBackendHealth, getBackendHealthSnapshot } from "../utils/backendHealth";

export function useBackendHealth() {
    const [state, setState] = useState(getBackendHealthSnapshot);

    useEffect(() => {
        return subscribeBackendHealth(setState);
    }, []);

    return state; // { alive: true|false|null, lastChecked: number|null }
}

export default useBackendHealth;