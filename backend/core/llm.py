import httpx
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = "openrouter/auto"

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
        
        return parse_llm_response(raw_response)


def parse_llm_response(raw: str) -> dict:
    """Parse the structured LLM response into a clean dictionary."""
    
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
        "raw_response": raw
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
        matched = False
        for key, field in sections.items():
            if line.startswith(f"{key}:"):
                # Save previous section
                if current_section:
                    result[current_section] = "\n".join(current_content).strip()
                current_section = field
                # Get inline content if any
                inline = line[len(key)+1:].strip()
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
    
    return result