import httpx
import os
import re
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "openrouter/free"
# One-time retry target if the free-router selects a model that can't
# actually perform open-ended structured analysis (see analyze_with_llm
# below). Verified separately as the most stable, longest-running
# general-purpose free model available via OpenRouter — well-suited to
# long structured instructions, unlike specialized classifiers.
FALLBACK_MODEL = "meta-llama/llama-3.3-70b-instruct:free"

SYSTEM_PROMPT = """You are Sentinel AI — an elite cybersecurity threat analyst with expertise in:
- Phishing and social engineering detection
- URL and domain analysis
- Email fraud and BEC (Business Email Compromise)
- Malware distribution campaigns
- MITRE ATT&CK framework
- Cyber Threat Intelligence (CTI)

When analyzing any input (message, URL, email, text), you MUST respond in this EXACT format:

VERDICT: [SAFE / SUSPICIOUS / DANGEROUS / CRITICAL]
CONFIDENCE: [0-100]%
ATTACK_TYPE: [A short human-readable category only — e.g. "Phishing / Credential Harvesting", "Malware Distribution", "Business Email Compromise", or "None Detected". This must be plain language, NEVER a MITRE technique ID like "T1566.002" — that code belongs only in the MITRE_ATTACK section further below, not here.]
SEVERITY: [LOW / MEDIUM / HIGH / CRITICAL]

EXPLANATION:
[Detailed human-readable explanation of why this is or isn't a threat. Explain like you're talking to a normal person.]

TECHNICAL_ANALYSIS:
[Deep technical breakdown — domain patterns, language manipulation, urgency tactics, impersonation signals, etc.]

MITRE_ATTACK:
[Pick the single most accurate technique ID from this reference — do not guess or invent a technique, and do not hedge with phrases like "(adapted for...)". If the input contains a malicious LINK the victim is asked to click, use T1566.002, never T1566.001. If it involves an ATTACHED FILE, use T1566.001. If genuinely nothing fits, say "Not Applicable" rather than forcing an approximate match.

Reference (Initial Access / Phishing sub-techniques):
- T1566.001 — Phishing: Spearphishing Attachment (malicious FILE attached to the message)
- T1566.002 — Phishing: Spearphishing Link (malicious LINK/URL the victim is asked to click — this is the correct choice for most SMS/WhatsApp/email scam links)
- T1566.003 — Phishing: Spearphishing via Service (delivered through a third-party platform/social media rather than direct email)
- T1078 — Valid Accounts (use only if the scenario is about reuse of already-compromised credentials, not the initial phishing delivery itself)]

INDICATORS_OF_COMPROMISE:
[List all suspicious URLs, domains, IPs, phone numbers, or email addresses found]

RECOMMENDED_ACTIONS:
[Step by step what the user should do right now]

EDUCATIONAL_NOTE:
[Teach the user something about this type of attack so they can recognize it in future]

Always be thorough. Never say "I cannot analyze this." Always give your best assessment."""


async def analyze_with_llm(user_input: str) -> dict:
    """
    Send input to LLM and get threat analysis back.

    Some models in the free-tier pool are specialized (content-safety
    classifiers, code-completion models, etc.) and are architecturally
    incapable of producing this kind of open-ended structured analysis at
    all — not just formatted slightly differently, but genuinely didn't
    attempt the task. One observed real example: a request routed to a
    content-safety classifier returned only "User Safety: safe" as its
    entire response. That's a much more serious failure than a formatting
    mismatch — it can silently produce a confident-looking but meaningless
    "SAFE, 0% confidence" verdict for what might be a real threat.

    This detects that specific failure shape (empty explanation + zero
    confidence — the real signature of "didn't attempt the task," not just
    "phrased it differently") and retries once against a pinned,
    known-reliable general-purpose model instead of silently trusting
    a non-answer.
    """
    result = await _call_llm(user_input, MODEL)

    task_failed = not result["explanation"].strip() and result["confidence"] == 0
    if not task_failed:
        return result

    retry = await _call_llm(user_input, FALLBACK_MODEL)
    retry_failed = not retry["explanation"].strip() and retry["confidence"] == 0
    if not retry_failed:
        return retry

    # Both the free-router's pick AND the pinned fallback genuinely failed
    # to produce a real analysis. Be honest about that instead of letting a
    # meaningless result masquerade as a confident "SAFE" verdict.
    retry["verdict"] = "UNKNOWN"
    retry["parsing_note"] = (
        "Both the primary and fallback models failed to produce a "
        "structured analysis for this input. This result should not be "
        "trusted as a real assessment — please retry the scan."
    )
    return retry


async def _call_llm(user_input: str, model: str) -> dict:
    """Make one actual request to OpenRouter with the given model."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sentinel-ai.app",
        "X-Title": "Sentinel AI"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this for threats:\n\n{user_input}"}
        ],
        "temperature": 0.1,  # Low temperature = more consistent, factual responses
        "max_tokens": 1500
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )

        if response.status_code != 200:
            raise Exception(f"LLM API error: {response.status_code} - {response.text}")

        data = response.json()
        raw_response = data["choices"][0]["message"]["content"]
        model_used = data.get("model", model)

        result = parse_llm_response(raw_response)
        result["model_used"] = model_used
        return result


def _normalize_for_matching(line: str) -> str:
    """
    Strip common formatting variations the LLM might add around section
    headers — markdown bold, leading bullets/dashes, extra whitespace — so
    parsing isn't fragile to minor formatting deviations between models.
    """
    stripped = line.strip()
    stripped = stripped.lstrip("-*•").strip()
    stripped = stripped.replace("**", "")
    return stripped


# Fallback patterns — used only if the primary structured parse didn't find
# a real value. Searches the FULL raw response, not just line starts, so a
# genuine answer isn't thrown away just because the model didn't follow the
# exact "KEY: value" format on its own line.
_VERDICT_FALLBACK = re.compile(r'\b(SAFE|SUSPICIOUS|DANGEROUS|CRITICAL)\b', re.IGNORECASE)
_CONFIDENCE_FALLBACK = re.compile(r'confidence["\s:]*?(\d{1,3})\s*%?', re.IGNORECASE)
_SEVERITY_FALLBACK = re.compile(r'\b(LOW|MEDIUM|HIGH|CRITICAL)\b', re.IGNORECASE)


def parse_llm_response(raw: str) -> dict:
    """
    Parse the structured LLM response into a clean dictionary.

    FIX: the original parser required an EXACT prefix match on each line
    (e.g. line.startswith("VERDICT:")). Since openrouter/auto routes every
    request to a potentially different model, and different models have
    different formatting habits (markdown bolding section headers,
    different casing, leading bullets), a real answer could fail to parse
    and silently default to "UNKNOWN"/0 — even though the model gave a
    perfectly good answer, just not in the exact expected shape. Now:
    normalized, case-insensitive line matching, plus a regex-based fallback
    that searches the full raw text if the structured parse still comes up
    empty on a critical field.
    """
    
    result = {
        "verdict": "UNKNOWN",
        "confidence": 0,
        "attack_type": "Unknown",
        "severity": "UNKNOWN",
        "explanation": "",
        "technical_analysis": "",
        "mitre_attack": "",
        "indicators_of_compromise": "",
        "recommended_actions": "",
        "educational_note": "",
        "raw_response": raw,
        "parsing_note": None,  # set if we had to fall back to pattern-matching
    }
    
    sections = {
        "VERDICT": "verdict",
        "CONFIDENCE": "confidence",
        "ATTACK_TYPE": "attack_type",
        "SEVERITY": "severity",
        "EXPLANATION": "explanation",
        "TECHNICAL_ANALYSIS": "technical_analysis",
        "MITRE_ATTACK": "mitre_attack",
        "INDICATORS_OF_COMPROMISE": "indicators_of_compromise",
        "RECOMMENDED_ACTIONS": "recommended_actions",
        "EDUCATIONAL_NOTE": "educational_note"
    }
    
    lines = raw.split("\n")
    current_section = None
    current_content = []
    
    for line in lines:
        normalized = _normalize_for_matching(line)
        normalized_upper = normalized.upper()
        matched = False
        for key, field in sections.items():
            if normalized_upper.startswith(f"{key}:"):
                # Save previous section
                if current_section:
                    result[current_section] = "\n".join(current_content).strip()
                current_section = field
                # Get inline content if any — pulled from the normalized
                # line (markdown/bullets stripped) so stored values are clean
                inline = normalized[len(key) + 1:].strip()
                current_content = [inline] if inline else []
                matched = True
                break
        
        if not matched and current_section:
            current_content.append(line)
    
    # Save last section
    if current_section:
        result[current_section] = "\n".join(current_content).strip()
    
    # Clean confidence — extract number
    conf = result["confidence"]
    if isinstance(conf, str):
        conf_clean = conf.replace("%", "").strip()
        try:
            result["confidence"] = int(conf_clean)
        except:
            result["confidence"] = 0

    # ── Fallback safety net ──────────────────────────────────────────────
    # Only kicks in if the structured parse genuinely came up empty on a
    # critical field — never overrides a value that was actually parsed.
    fallback_used = []

    if result["verdict"] == "UNKNOWN":
        match = _VERDICT_FALLBACK.search(raw)
        if match:
            result["verdict"] = match.group(1).upper()
            fallback_used.append("verdict")

    if result["confidence"] == 0:
        match = _CONFIDENCE_FALLBACK.search(raw)
        if match:
            try:
                result["confidence"] = int(match.group(1))
                fallback_used.append("confidence")
            except ValueError:
                pass

    if result["severity"] == "UNKNOWN":
        match = _SEVERITY_FALLBACK.search(raw)
        if match:
            result["severity"] = match.group(1).upper()
            fallback_used.append("severity")

    if fallback_used:
        result["parsing_note"] = (
            f"Model did not follow the exact structured format for: "
            f"{', '.join(fallback_used)}. Recovered via fallback pattern "
            f"match instead of losing the answer entirely."
        )

    return result