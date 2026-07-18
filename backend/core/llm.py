import httpx
import os
import re
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "openrouter/free"

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
ATTACK_TYPE: [type of attack or "None Detected"]
SEVERITY: [LOW / MEDIUM / HIGH / CRITICAL]

EXPLANATION:
[Detailed human-readable explanation of why this is or isn't a threat. Explain like you're talking to a normal person.]

TECHNICAL_ANALYSIS:
[Deep technical breakdown — domain patterns, language manipulation, urgency tactics, impersonation signals, etc.]

MITRE_ATTACK:
[Relevant MITRE ATT&CK technique ID and name, or "Not Applicable"]

INDICATORS_OF_COMPROMISE:
[List all suspicious URLs, domains, IPs, phone numbers, or email addresses found]

RECOMMENDED_ACTIONS:
[Step by step what the user should do right now]

EDUCATIONAL_NOTE:
[Teach the user something about this type of attack so they can recognize it in future]

Always be thorough. Never say "I cannot analyze this." Always give your best assessment."""


async def analyze_with_llm(user_input: str) -> dict:
    """Send input to LLM and get threat analysis back."""
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sentinel-ai.app",
        "X-Title": "Sentinel AI"
    }
    
    payload = {
        "model": MODEL,
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

        # openrouter/auto routes each request to a different underlying model
        # (Claude, GPT-5, Gemini, etc. — OpenRouter's own docs note "Auto"
        # behavior can be unpredictable for production). Capturing which
        # model actually answered makes inconsistent-looking results
        # explainable/debuggable instead of mysterious.
        model_used = data.get("model", MODEL)

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