// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — CursorContext
// Global cursor state — what the cursor is hovering over.
// Components call useCursor() to change cursor appearance.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useMemo } from "react";

export const CURSOR_STATES = {
    DEFAULT: "default",
    INTERACTIVE: "interactive",
    THREAT: "threat",
    AI: "ai",
    SAFE: "safe",
    DRAG: "drag",
    TEXT: "text",
    LOADING: "loading",
    DANGER: "danger",
};

const CursorContext = createContext(null);

export function CursorProvider({ children }) {
    const [cursorState, setCursorState] = useState(CURSOR_STATES.DEFAULT);
    const [cursorLabel, setCursorLabel] = useState("");

    const setCursor = useCallback((state, label = "") => {
        setCursorState(state);
        setCursorLabel(label);
    }, []);

    const resetCursor = useCallback(() => {
        setCursorState(CURSOR_STATES.DEFAULT);
        setCursorLabel("");
    }, []);

    const value = useMemo(() => ({
        cursorState,
        cursorLabel,
        setCursor,
        resetCursor,
        CURSOR_STATES,
    }), [cursorState, cursorLabel, setCursor, resetCursor]);

    return (
        <CursorContext.Provider value={value}>
            {children}
        </CursorContext.Provider>
    );
}

export function useCursor() {
    const ctx = useContext(CursorContext);
    if (!ctx) throw new Error("useCursor must be used inside <CursorProvider>");
    return ctx;
}

export default CursorContext;