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


def detect_urgency_language(text: str) -> dict:
    """Detect urgency and fear tactics commonly used in phishing."""
    
    urgency_keywords = [
        "urgent", "immediately", "account suspended", "verify now",
        "click here", "limited time", "expires", "blocked",
        "unauthorized access", "confirm your", "update your",
        "unusual activity", "security alert", "act now",
        "your account will be", "within 24 hours", "within 48 hours",
        "otp", "password", "bank account", "credit card",
        "kyc", "aadhar", "pan card", "winner", "prize",
        "lottery", "congratulations you have won", "free gift"
    ]
    
    text_lower = text.lower()
    found = [kw for kw in urgency_keywords if kw in text_lower]
    
    urgency_score = min(len(found) * 15, 100)  # 15 points per keyword, max 100
    
    return {
        "urgency_keywords_found": found,
        "urgency_score": urgency_score,
        "is_high_urgency": urgency_score >= 30
    }


def detect_impersonation(text: str) -> dict:
    """Detect if message is impersonating a known brand or institution."""
    
    brands = [
        "sbi", "hdfc", "icici", "axis bank", "kotak", "pnb",
        "paytm", "phonepe", "gpay", "google pay", "amazon", "flipkart",
        "irctc", "uidai", "aadhar", "income tax", "trai", "rbi",
        "paypal", "netflix", "microsoft", "apple", "whatsapp",
        "facebook", "instagram", "telegram", "fedex", "dhl",
        "ola", "uber", "zomato", "swiggy"
    ]
    
    text_lower = text.lower()
    found_brands = [b for b in brands if b in text_lower]
    
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