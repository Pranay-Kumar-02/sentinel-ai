// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — main.jsx
// Application entry point. Initializes theme + keyframes before first paint
// to avoid any flash of unstyled content.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { initTheme } from "./themes/index";
import { injectKeyframes } from "./animations/keyframes";

import "./App.css";

// ── Pre-render initialization ─────────────────────────────────────────────────
// Both run synchronously before React mounts, so the very first paint
// already has the correct theme CSS variables and all @keyframes available.

initTheme();
injectKeyframes();

// ── Mount ──────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);