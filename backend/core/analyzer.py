import re
from urllib.parse import urlparse
from core.llm import analyze_with_llm

def extract_urls(text: str) -> list:
    """Auto-extract all URLs from any text."""
    pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls = re.findall(pattern, text)
    
    # Also catch URLs without http
    pattern2 = r'(?:www\.)[^\s<>"{}|\\^`\[\]]+'
    urls2 = re.findall(pattern2, text)
    
    return list(set(urls + urls2))


def extract_emails(text: str) -> list:
    """Auto-extract all email addresses from text."""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return list(set(re.findall(pattern, text)))


def extract_phone_numbers(text: str) -> list:
    """Extract phone numbers from text."""
    pattern = r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
    return list(set(re.findall(pattern, text)))


# ── Urgency keyword tiers ──────────────────────────────────────────────────────
# FIX: previously all 27 keywords scored a flat 15 points each, with no
# distinction between highly-specific phishing phrasing ("account suspended",
# "verify now") and completely ordinary words that appear constantly in
# benign messages ("password", "otp", "bank account", "expires", "blocked").
# Under the old scheme, just 2 matches of any two words — including two
# totally generic ones — already crossed the is_high_urgency threshold (30).
# That inflated score then fed directly into the LLM's prompt as context,
# biasing the actual verdict toward false positives.
#
# Now: specific, rarely-benign phishing phrasing scores high; generic terms
# that only matter in combination with other signals score low.
HIGH_SIGNAL_KEYWORDS = [
    "account suspended", "verify now", "unauthorized access",
    "your account will be", "act now", "within 24 hours", "within 48 hours",
    "congratulations you have won",
]  # 20 points each — rarely appear in legitimate messages

MEDIUM_SIGNAL_KEYWORDS = [
    "urgent", "immediately", "limited time", "confirm your",
    "unusual activity", "security alert", "click here", "blocked",
]  # 10 points each — moderately suspicious on their own

LOW_SIGNAL_KEYWORDS = [
    "otp", "password", "bank account", "credit card", "kyc", "aadhar",
    "pan card", "winner", "prize", "lottery", "free gift", "expires",
    "update your",
]  # 5 points each — common in ordinary legitimate text; only meaningful in combination


def detect_urgency_language(text: str) -> dict:
    """
    Detect urgency and fear tactics commonly used in phishing.
    Uses word-boundary matching (not naive substrings) and tiered weights
    so generic words don't single-handedly trigger a high-urgency flag.
    """
    text_lower = text.lower()

    def find_matches(keywords):
        found = []
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                found.append(kw)
        return found

    high_found = find_matches(HIGH_SIGNAL_KEYWORDS)
    medium_found = find_matches(MEDIUM_SIGNAL_KEYWORDS)
    low_found = find_matches(LOW_SIGNAL_KEYWORDS)

    urgency_score = min(
        len(high_found) * 20 + len(medium_found) * 10 + len(low_found) * 5,
        100,
    )

    return {
        "urgency_keywords_found": high_found + medium_found + low_found,
        "high_signal_matches": high_found,
        "medium_signal_matches": medium_found,
        "low_signal_matches": low_found,
        "urgency_score": urgency_score,
        "is_high_urgency": urgency_score >= 30,
    }


def detect_impersonation(text: str) -> dict:
    """
    Detect if message is impersonating a known brand or institution.

    FIX: previously used naive substring matching (`brand in text_lower`),
    which caused real false positives — e.g. "ola" (the ride-hailing brand)
    matched inside "Coca-Cola", "viola", "gondola"; "trai" (the telecom
    regulator) matched inside "portrait". Now uses word-boundary regex so a
    brand only matches as an actual standalone word/phrase, not a substring
    fragment of an unrelated word.
    """
    brands = [
        "sbi", "hdfc", "icici", "axis bank", "kotak", "pnb",
        "paytm", "phonepe", "gpay", "google pay", "amazon", "flipkart",
        "irctc", "uidai", "aadhar", "income tax", "trai", "rbi",
        "paypal", "netflix", "microsoft", "apple", "whatsapp",
        "facebook", "instagram", "telegram", "fedex", "dhl",
        "ola", "uber", "zomato", "swiggy"
    ]

    text_lower = text.lower()
    found_brands = [
        b for b in brands
        if re.search(r'\b' + re.escape(b) + r'\b', text_lower)
    ]

    return {
        "impersonated_brands": found_brands,
        "impersonation_detected": len(found_brands) > 0
    }


def get_verdict_color(verdict: str) -> str:
    """Return color code for verdict."""
    colors = {
        "SAFE": "green",
        "SUSPICIOUS": "yellow", 
        "DANGEROUS": "orange",
        "CRITICAL": "red",
        "UNKNOWN": "grey"
    }
    return colors.get(verdict.upper(), "grey")


async def full_analysis(user_input: str) -> dict:
    """
    Master analysis function — runs all checks and returns complete report.
    This is the brain of Sentinel AI Phase 1.
    """
    
    # Step 1 — Extract all elements automatically
    urls_found      = extract_urls(user_input)
    emails_found    = extract_emails(user_input)
    phones_found    = extract_phone_numbers(user_input)
    urgency_data    = detect_urgency_language(user_input)
    impersonation   = detect_impersonation(user_input)
    
    # Step 2 — Build enriched context for LLM
    enriched_input = f"""
INPUT TEXT:
{user_input}

AUTO-EXTRACTED INTELLIGENCE:
- URLs found: {urls_found if urls_found else 'None'}
- Email addresses found: {emails_found if emails_found else 'None'}
- Phone numbers found: {phones_found if phones_found else 'None'}
- Urgency keywords detected: {urgency_data['urgency_keywords_found']}
- Urgency score: {urgency_data['urgency_score']}/100
- Impersonated brands detected: {impersonation['impersonated_brands']}

Now perform your full threat analysis on this input.
"""
    
    # Step 3 — LLM deep analysis
    llm_result = await analyze_with_llm(enriched_input)
    
    # Step 4 — Build final report
    final_report = {
        "input_text": user_input,
        "auto_extracted": {
            "urls": urls_found,
            "emails": emails_found,
            "phone_numbers": phones_found,
        },
        "pre_analysis": {
            "urgency": urgency_data,
            "impersonation": impersonation,
        },
        "ai_analysis": llm_result,
        "verdict_color": get_verdict_color(llm_result.get("verdict", "UNKNOWN")),
        "summary": {
            "verdict": llm_result.get("verdict", "UNKNOWN"),
            "confidence": llm_result.get("confidence", 0),
            "attack_type": llm_result.get("attack_type", "Unknown"),
            "severity": llm_result.get("severity", "UNKNOWN"),
        }
    }
    
    return final_report