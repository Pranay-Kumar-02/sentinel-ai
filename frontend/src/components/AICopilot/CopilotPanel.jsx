// ─────────────────────────────────────────────────────────────────────────────
// SENTINEL AI — CopilotPanel
// Premium AI Copilot chat panel. Connects to FastAPI backend.
// Context-aware — knows current scan results, suggests actions.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

const BACKEND = "http://127.0.0.1:8000";

// ── Suggested prompts based on context ───────────────────────────────────────
const SUGGESTIONS = [
    { icon: "🔍", text: "What are the top phishing indicators I should know?" },
    { icon: "🛡️", text: "How do I check if a URL is safe before clicking?" },
    { icon: "📧", text: "What makes an email header suspicious?" },
    { icon: "🌐", text: "Explain MITRE ATT&CK framework simply" },
    { icon: "⚡", text: "What should I do if I clicked a suspicious link?" },
    { icon: "🔓", text: "How do I check if my email was breached?" },
];

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, colors }) {
    const isUser = msg.role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                gap: 10,
                alignItems: "flex-end",
                marginBottom: 16,
            }}
        >
            {/* Avatar */}
            <div style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                background: isUser
                    ? `${colors.accent}20`
                    : `linear-gradient(135deg, #7c3aed, #4f46e5)`,
                border: `1px solid ${isUser ? colors.accent + "30" : colors.purple + "50"}`,
            }}>
                {isUser ? "👤" : "🤖"}
            </div>

            {/* Bubble */}
            <div style={{
                maxWidth: "78%",
                padding: "10px 14px",
                borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: isUser
                    ? `linear-gradient(135deg, ${colors.accent}20, ${colors.purple}15)`
                    : colors.bgSurface,
                border: `1px solid ${isUser ? colors.accent + "25" : colors.border}`,
                fontFamily: "var(--font-body)",
                fontSize: "0.84rem",
                color: colors.text,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
            }}>
                {msg.content}
                {msg.loading && (
                    <span style={{ display: "inline-flex", gap: 3, marginLeft: 6, verticalAlign: "middle" }}>
                        {[0, 1, 2].map(i => (
                            <motion.span
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                style={{
                                    display: "inline-block",
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: colors.purple,
                                }}
                            />
                        ))}
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function CopilotPanel({ isOpen, scanResult, emailResult, forensicsResult }) {
    const { colors } = useTheme();
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "assistant",
            content: "Hey! I'm your Sentinel AI Copilot 🛡️\n\nI can help you understand threats, explain scan results, guide investigations, or answer any cybersecurity question. What would you like to know?",
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Build context from scan results
    const buildContext = useCallback(() => {
        const parts = [];
        if (scanResult?.master_verdict) {
            parts.push(`Current scan verdict: ${scanResult.master_verdict}`);
            if (scanResult.llm_analysis?.explanation) {
                parts.push(`Analysis: ${scanResult.llm_analysis.explanation}`);
            }
        }
        if (emailResult?.authentication) {
            parts.push(`Email authentication: SPF=${emailResult.authentication.spf}, DKIM=${emailResult.authentication.dkim}, DMARC=${emailResult.authentication.dmarc}`);
        }
        if (forensicsResult?.extracted_text) {
            parts.push(`Extracted text: ${forensicsResult.extracted_text.slice(0, 200)}`);
        }
        return parts.length > 0 ? `\n\nContext from current session:\n${parts.join("\n")}` : "";
    }, [scanResult, emailResult, forensicsResult]);

    const sendMessage = useCallback(async (text) => {
        const userText = (text ?? input).trim();
        if (!userText || loading) return;

        setInput("");
        setShowSuggestions(false);
        setLoading(true);

        const userMsg = { id: Date.now().toString(), role: "user", content: userText };
        const aiMsg = { id: Date.now().toString() + "_ai", role: "assistant", content: "", loading: true };

        setMessages(prev => [...prev, userMsg, aiMsg]);

        try {
            const context = buildContext();
            const systemPrompt = `You are Sentinel AI Copilot, an expert cybersecurity assistant embedded in the Sentinel AI platform — India's premier AI-native Cyber Threat Intelligence platform.

You help users understand:
- Phishing, malware, social engineering, and cyber fraud
- Email authentication (SPF, DKIM, DMARC)
- OSINT and domain intelligence
- MITRE ATT&CK framework
- India-specific cyber threats (UPI fraud, KYC scams, etc.)
- How to stay safe online

Be concise, clear, and actionable. Use simple language unless the user seems technical. Always be helpful and never refuse security education questions.${context}`;

            const response = await fetch(`${BACKEND}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userText,
                    system: systemPrompt,
                    history: messages.slice(-6).map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
                signal: (abortRef.current = new AbortController()).signal,
            });

            if (!response.ok) throw new Error(`Backend error: ${response.status}`);

            const data = await response.json();
            const reply = data.response ?? data.message ?? data.content ?? "I couldn't get a response. Please try again.";

            setMessages(prev => prev.map(m =>
                m.id === aiMsg.id ? { ...m, content: reply, loading: false } : m
            ));
        } catch (err) {
            if (err.name === "AbortError") return;

            // Fallback response when backend is offline
            const fallback = getFallbackResponse(userText);
            setMessages(prev => prev.map(m =>
                m.id === aiMsg.id ? { ...m, content: fallback, loading: false } : m
            ));
        } finally {
            setLoading(false);
        }
    }, [input, loading, messages, buildContext]);

    function getFallbackResponse(query) {
        const q = query.toLowerCase();
        if (q.includes("phishing"))
            return "Phishing attacks trick you into revealing credentials or installing malware. Key red flags: urgent language, suspicious sender domains, requests for OTP or passwords, and URLs that look slightly wrong (e.g. 'amaz0n.com'). Always verify the sender domain before clicking.";
        if (q.includes("upi") || q.includes("sbi") || q.includes("hdfc") || q.includes("bank"))
            return "Indian banking scams typically involve fake KYC alerts, UPI collect requests from unknown numbers, or fake customer care numbers. Remember: No bank ever asks for your OTP, PIN, or password over call, SMS, or email. When in doubt, call the official number on the back of your card.";
        if (q.includes("email") || q.includes("spf") || q.includes("dkim") || q.includes("dmarc"))
            return "Email authentication works in 3 layers:\n• **SPF** — verifies the sending server is authorized\n• **DKIM** — cryptographic signature proving the email wasn't modified\n• **DMARC** — policy telling receivers what to do when SPF/DKIM fail\nIf all 3 fail, the email is almost certainly spoofed.";
        if (q.includes("safe") || q.includes("clicked"))
            return "If you clicked a suspicious link:\n1. Don't enter any credentials on the page\n2. Close the browser tab immediately\n3. Run a scan on the URL using Sentinel's Threat Scanner\n4. Change passwords for any accounts you may have accessed\n5. Check for unusual activity in your accounts";
        return "I'm currently in offline mode — my backend isn't connected. Start your FastAPI backend at localhost:8000 for full AI responses.\n\nIn the meantime, I can answer basic cybersecurity questions from my local knowledge base. What would you like to know?";
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function clearChat() {
        setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Chat cleared. How can I help you?",
        }]);
        setShowSuggestions(true);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
                width: 380,
                height: 560,
                background: colors.bgCard,
                backdropFilter: "blur(24px)",
                border: `1px solid ${colors.purple}30`,
                borderRadius: 20,
                boxShadow: `0 0 0 1px ${colors.purple}15, 0 24px 80px rgba(0,0,0,0.5), 0 0 80px ${colors.purple}10`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            {/* Header */}
            <div style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: `linear-gradient(135deg, ${colors.purple}10, ${colors.accent}08)`,
                flexShrink: 0,
            }}>
                {/* AI status dot */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: `linear-gradient(135deg, #7c3aed, #4f46e5)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem",
                        boxShadow: `0 0 16px ${colors.purple}50`,
                    }}>
                        🤖
                    </div>
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: 10, height: 10, borderRadius: "50%",
                            background: colors.green,
                            border: `2px solid ${colors.bgCard}`,
                            boxShadow: `0 0 6px ${colors.green}`,
                        }}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{
                        fontFamily: "var(--font-display)", fontSize: "0.88rem",
                        fontWeight: 700, color: colors.text,
                    }}>
                        Sentinel Copilot
                    </div>
                    <div style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                        color: colors.green,
                    }}>
                        ● AI Security Assistant
                    </div>
                </div>

                {/* Clear button */}
                <motion.button
                    onClick={clearChat}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: "transparent",
                        border: `1px solid ${colors.border}`,
                        cursor: "pointer", color: colors.textMuted,
                        fontSize: "0.7rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    title="Clear chat"
                >
                    ⟳
                </motion.button>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "16px 16px 0",
                scrollbarWidth: "none",
            }}>
                {messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} colors={colors} />
                ))}

                {/* Suggestions */}
                {showSuggestions && messages.length <= 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ marginBottom: 16 }}
                    >
                        <div style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                            color: colors.textMuted, marginBottom: 10,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                        }}>
                            Quick questions
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {SUGGESTIONS.map((s, i) => (
                                <motion.button
                                    key={i}
                                    onClick={() => sendMessage(s.text)}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    whileHover={{ x: 3, background: colors.accentSoft }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        padding: "8px 12px",
                                        background: colors.bgSurface,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 8, cursor: "pointer",
                                        textAlign: "left",
                                        transition: "background 0.15s ease",
                                    }}
                                >
                                    <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>{s.icon}</span>
                                    <span style={{
                                        fontFamily: "var(--font-body)", fontSize: "0.76rem",
                                        color: colors.textSub, lineHeight: 1.4,
                                    }}>
                                        {s.text}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: "12px 14px",
                borderTop: `1px solid ${colors.border}`,
                flexShrink: 0,
            }}>
                {/* Context indicator */}
                {(scanResult || emailResult || forensicsResult) && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        marginBottom: 8, padding: "4px 10px",
                        background: colors.accentSoft,
                        border: `1px solid ${colors.borderHover}`,
                        borderRadius: 6,
                    }}>
                        <span style={{ fontSize: "0.65rem" }}>⚡</span>
                        <span style={{
                            fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                            color: colors.accent,
                        }}>
                            Context loaded from current scan
                        </span>
                    </div>
                )}

                <div style={{
                    display: "flex", gap: 8, alignItems: "flex-end",
                }}>
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about threats, scams, security..."
                        rows={1}
                        style={{
                            flex: 1,
                            background: colors.bgSurface,
                            border: `1px solid ${input ? colors.purple + "50" : colors.border}`,
                            borderRadius: 12,
                            padding: "10px 14px",
                            fontFamily: "var(--font-body)",
                            fontSize: "0.84rem",
                            color: colors.text,
                            resize: "none",
                            outline: "none",
                            lineHeight: 1.5,
                            maxHeight: 100,
                            overflowY: "auto",
                            scrollbarWidth: "none",
                            transition: "border-color 0.2s ease",
                        }}
                        onInput={e => {
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                        }}
                    />

                    <motion.button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        whileHover={input.trim() && !loading ? { scale: 1.08 } : {}}
                        whileTap={input.trim() && !loading ? { scale: 0.92 } : {}}
                        style={{
                            width: 40, height: 40, borderRadius: 12, border: "none",
                            background: input.trim() && !loading
                                ? `linear-gradient(135deg, #7c3aed, #4f46e5)`
                                : colors.bgSurface,
                            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1rem", flexShrink: 0,
                            boxShadow: input.trim() && !loading ? `0 4px 16px ${colors.purple}50` : "none",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {loading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
                                style={{
                                    width: 16, height: 16, borderRadius: "50%",
                                    border: `2px solid ${colors.purple}40`,
                                    borderTopColor: colors.purple,
                                }}
                            />
                        ) : "↑"}
                    </motion.button>
                </div>

                <div style={{
                    marginTop: 6, textAlign: "center",
                    fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                    color: colors.textDim,
                }}>
                    Enter to send · Shift+Enter for new line
                </div>
            </div>
        </motion.div>
    );
}