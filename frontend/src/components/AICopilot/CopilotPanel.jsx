import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cpu, Send, RotateCcw, Copy, ChevronDown,
    Sparkles, Shield, Search, BookOpen, Zap,
    AlertTriangle, CheckCircle, Loader
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { springs } from "../../animations/spring";

const API = "http://127.0.0.1:8000";

// ── Quick Action Chips ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { icon: Shield, label: "Explain verdict", prompt: "Explain the current threat verdict in simple terms." },
    { icon: Search, label: "What's an IOC?", prompt: "What are Indicators of Compromise and why do they matter?" },
    { icon: AlertTriangle, label: "How to stay safe?", prompt: "What steps should I take to protect myself from this type of attack?" },
    { icon: BookOpen, label: "Explain MITRE", prompt: "Explain what MITRE ATT&CK is and how it helps in cybersecurity." },
    { icon: Zap, label: "What is phishing?", prompt: "Explain phishing attacks and how to recognize them." },
    { icon: CheckCircle, label: "Am I safe?", prompt: "Based on what you know, am I currently safe? What should I watch out for?" },
];

// ── Message Bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg, accent, purple, bgSurface, border, textSub }) {
    const [copied, setCopied] = useState(false);
    const isAI = msg.role === "assistant";

    const copy = () => {
        navigator.clipboard.writeText(msg.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={springs.smooth}
            className={`flex gap-3 ${isAI ? "flex-row" : "flex-row-reverse"}`}
        >
            {/* Avatar */}
            {isAI && (
                <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                    style={{
                        background: `linear-gradient(135deg, ${purple}, ${accent})`,
                        boxShadow: `0 0 12px ${purple}50`,
                    }}
                >
                    <Cpu size={13} color="white" />
                </div>
            )}

            {/* Bubble */}
            <div className={`group max-w-[85%] space-y-1 ${isAI ? "" : "items-end flex flex-col"}`}>
                <div
                    className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed relative"
                    style={{
                        background: isAI
                            ? `${bgSurface}`
                            : `linear-gradient(135deg, ${purple}25, ${accent}20)`,
                        border: `1px solid ${isAI ? border : accent + "30"}`,
                        color: "var(--text)",
                        borderRadius: isAI
                            ? "4px 16px 16px 16px"
                            : "16px 4px 16px 16px",
                    }}
                >
                    {msg.loading ? (
                        <div className="flex items-center gap-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: accent }}
                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                </div>

                {/* Copy button */}
                {isAI && !msg.loading && (
                    <motion.button
                        onClick={copy}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg"
                        style={{ color: textSub, border: `1px solid ${border}` }}
                    >
                        <Copy size={9} />
                        {copied ? "Copied!" : "Copy"}
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

// ── Mode Tabs ──────────────────────────────────────────────────────────────
const MODES = [
    { id: "simple", label: "Simple", desc: "Plain English" },
    { id: "analyst", label: "Analyst", desc: "Technical depth" },
    { id: "teaching", label: "Learn", desc: "Explain & educate" },
];

export default function CopilotPanel({ isOpen, scanResult, emailResult, forensicsResult }) {
    const {
        accent, accentGlow, accentSoft, purple, purpleGlow, purpleSoft,
        bgCard, bgSurface, bgInput, border, borderHover,
        text, textSub, textMuted, amber, green,
    } = useTheme();

    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm Sentinel AI Copilot 🛡️\n\nI can help you understand threat analysis results, explain cybersecurity concepts, and guide your investigation.\n\nWhat would you like to know?",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("simple");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Build context from current scan results
    const buildContext = useCallback(() => {
        let ctx = `You are Sentinel AI Copilot — an expert cybersecurity assistant embedded in the Sentinel AI Threat Intelligence Platform.\n\n`;
        ctx += `Mode: ${mode === "simple" ? "Plain English for non-technical users" : mode === "analyst" ? "Technical depth for security analysts" : "Educational — explain concepts clearly with examples"}\n\n`;

        if (scanResult) {
            const v = scanResult?.master_verdict || scanResult?.summary?.verdict || "UNKNOWN";
            const ai = scanResult?.llm_analysis?.ai_analysis || scanResult?.ai_analysis || {};
            ctx += `CURRENT SCAN RESULTS:\n`;
            ctx += `Verdict: ${v}\n`;
            ctx += `Confidence: ${scanResult?.summary?.confidence || 0}%\n`;
            ctx += `Attack Type: ${ai?.attack_type || "Unknown"}\n`;
            ctx += `Explanation: ${ai?.explanation || "N/A"}\n`;
            ctx += `MITRE: ${ai?.mitre_attack || "N/A"}\n`;
            ctx += `IOCs: ${JSON.stringify(scanResult?.llm_analysis?.auto_extracted || scanResult?.auto_extracted || {})}\n\n`;
        }

        if (emailResult) {
            ctx += `EMAIL ANALYSIS:\n`;
            ctx += `Verdict: ${emailResult?.master_verdict || "UNKNOWN"}\n`;
            ctx += `SPF: ${emailResult?.email_forensics?.authentication?.spf?.status || "Unknown"}\n`;
            ctx += `DKIM: ${emailResult?.email_forensics?.authentication?.dkim?.status || "Unknown"}\n`;
            ctx += `DMARC: ${emailResult?.email_forensics?.authentication?.dmarc?.status || "Unknown"}\n\n`;
        }

        if (forensicsResult) {
            ctx += `FORENSICS ANALYSIS:\n`;
            ctx += `File Type: ${forensicsResult?.forensics?.file_type || "Unknown"}\n`;
            ctx += `Verdict: ${forensicsResult?.master_verdict || "UNKNOWN"}\n\n`;
        }

        ctx += `Answer the user's question helpfully and accurately based on the context above.`;
        return ctx;
    }, [scanResult, emailResult, forensicsResult, mode]);

    // Send message
    const sendMessage = useCallback(async (text) => {
        if (!text?.trim() || loading) return;

        const userMsg = {
            id: Date.now().toString(),
            role: "user",
            content: text.trim(),
        };

        const loadingMsg = {
            id: "loading",
            role: "assistant",
            content: "",
            loading: true,
        };

        setMessages((prev) => [...prev, userMsg, loadingMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 1000,
                    system: buildContext(),
                    messages: [
                        ...messages
                            .filter((m) => !m.loading && m.id !== "welcome")
                            .map((m) => ({ role: m.role, content: m.content })),
                        { role: "user", content: text.trim() },
                    ],
                }),
            });

            const data = await response.json();
            const reply = data?.content?.[0]?.text || "I couldn't process that. Please try again.";

            setMessages((prev) => [
                ...prev.filter((m) => m.id !== "loading"),
                { id: Date.now().toString(), role: "assistant", content: reply },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev.filter((m) => m.id !== "loading"),
                {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: "⚠️ Connection error. Make sure the backend is running and try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }, [loading, messages, buildContext]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const clearChat = () => {
        setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Chat cleared! Ask me anything about cybersecurity or your current analysis. 🛡️",
        }]);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={springs.copilot}
            className="flex flex-col overflow-hidden"
            style={{
                width: 360,
                height: 520,
                background: bgCard,
                backdropFilter: "blur(24px)",
                border: `1px solid ${border}`,
                borderRadius: 20,
                boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${border}, 0 0 60px ${purpleGlow}`,
            }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: border }}
            >
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${purple}, ${accent})` }}
                    >
                        <Cpu size={13} color="white" />
                    </div>
                    <div>
                        <div className="text-xs font-bold" style={{ color: text }}>Sentinel Copilot</div>
                        <div className="text-[10px] font-mono flex items-center gap-1" style={{ color: green }}>
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: green }}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            Online · {mode} mode
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: textMuted }}
                    title="Clear chat"
                >
                    <RotateCcw size={13} />
                </button>
            </div>

            {/* Mode Tabs */}
            <div
                className="flex gap-1 px-3 py-2 flex-shrink-0 border-b"
                style={{ borderColor: border }}
            >
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className="flex-1 py-1 rounded-lg text-[10px] font-bold transition-all"
                        style={{
                            background: mode === m.id ? accentSoft : "transparent",
                            color: mode === m.id ? accent : textMuted,
                            border: `1px solid ${mode === m.id ? accent + "30" : "transparent"}`,
                        }}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        msg={msg}
                        accent={accent}
                        purple={purple}
                        bgSurface={bgSurface}
                        border={border}
                        textSub={textSub}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div
                className="px-3 py-2 border-t flex-shrink-0"
                style={{ borderColor: border }}
            >
                <div
                    className="text-[9px] font-mono uppercase tracking-widest mb-1.5"
                    style={{ color: textMuted }}
                >
                    Quick Actions
                </div>
                <div className="flex flex-wrap gap-1">
                    {QUICK_ACTIONS.slice(0, 4).map((action) => (
                        <button
                            key={action.label}
                            onClick={() => sendMessage(action.prompt)}
                            disabled={loading}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono transition-all hover:scale-105 active:scale-95"
                            style={{
                                background: purpleSoft,
                                border: `1px solid ${purple}25`,
                                color: textSub,
                            }}
                        >
                            <action.icon size={9} style={{ color: purple }} />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div
                className="px-3 pb-3 flex-shrink-0"
            >
                <div
                    className="flex items-end gap-2 rounded-xl p-2"
                    style={{
                        background: bgInput,
                        border: `1px solid ${border}`,
                    }}
                >
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about cybersecurity..."
                        rows={1}
                        disabled={loading}
                        className="flex-1 resize-none text-xs font-mono focus:outline-none bg-transparent leading-relaxed"
                        style={{
                            color: text,
                            caretColor: accent,
                            maxHeight: 80,
                        }}
                    />
                    <motion.button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || loading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={springs.snappy}
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                            background: input.trim() && !loading
                                ? `linear-gradient(135deg, ${purple}, ${accent})`
                                : "rgba(255,255,255,0.05)",
                            opacity: !input.trim() || loading ? 0.5 : 1,
                        }}
                    >
                        {loading
                            ? <Loader size={12} color="white" className="animate-spin" />
                            : <Send size={12} color="white" />
                        }
                    </motion.button>
                </div>
                <div
                    className="text-[9px] font-mono mt-1 text-center"
                    style={{ color: textMuted }}
                >
                    Enter to send · Shift+Enter for new line
                </div>
            </div>
        </motion.div>
    );
}