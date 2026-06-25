import httpx
import os
import re
import socket
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

VIRUSTOTAL_KEY      = os.getenv("VIRUSTOTAL_API_KEY")
SAFE_BROWSING_KEY   = os.getenv("GOOGLE_SAFE_BROWSING_KEY")

# ── Helpers ────────────────────────────────────────────────────────────────────
def extract_domain(url: str) -> str:
    """Extract clean domain from any URL."""
    if not url.startswith("http"):
        url = "http://" + url
    return urlparse(url).netloc.replace("www.", "")

def extract_ip(domain: str) -> str:
    """Resolve domain to IP address."""
    try:
        return socket.gethostbyname(domain)
    except:
        return None

# ── VirusTotal ─────────────────────────────────────────────────────────────────
async def check_virustotal(url: str) -> dict:
    """Scan URL against 70+ antivirus engines via VirusTotal."""
    if not VIRUSTOTAL_KEY:
        return {"error": "VirusTotal API key not configured"}
    try:
        headers = {"x-apikey": VIRUSTOTAL_KEY}

        # Submit URL for scanning
        async with httpx.AsyncClient(timeout=30) as client:
            submit = await client.post(
                "https://www.virustotal.com/api/v3/urls",
                headers=headers,
                data={"url": url}
            )
            if submit.status_code != 200:
                return {"error": f"VirusTotal submission failed: {submit.status_code}"}

            # Get the analysis ID
            analysis_id = submit.json().get("data", {}).get("id", "")
            if not analysis_id:
                return {"error": "No analysis ID returned"}

            # Get results
            result = await client.get(
                f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
                headers=headers
            )
            if result.status_code != 200:
                return {"error": f"VirusTotal result fetch failed: {result.status_code}"}

            data   = result.json()
            stats  = data.get("data", {}).get("attributes", {}).get("stats", {})
            malicious   = stats.get("malicious", 0)
            suspicious  = stats.get("suspicious", 0)
            harmless    = stats.get("harmless", 0)
            undetected  = stats.get("undetected", 0)
            total       = malicious + suspicious + harmless + undetected

            return {
                "malicious":   malicious,
                "suspicious":  suspicious,
                "harmless":    harmless,
                "undetected":  undetected,
                "total_engines": total,
                "threat_score": round((malicious + suspicious) / total * 100) if total > 0 else 0,
                "verdict": "MALICIOUS" if malicious > 2 else "SUSPICIOUS" if malicious > 0 or suspicious > 2 else "CLEAN",
                "analysis_id": analysis_id,
            }
    except Exception as e:
        return {"error": str(e)}


# ── WHOIS ──────────────────────────────────────────────────────────────────────
async def check_whois(domain: str) -> dict:
    """Get WHOIS information for a domain."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(
                f"https://api.whoisfreaks.com/v1.0/whois?apiKey=free&domainName={domain}&type=live",
                timeout=10
            )
            if res.status_code == 200:
                data = res.json()
                return {
                    "registrar":      data.get("domain_registrar", {}).get("registrar_name", "Unknown"),
                    "created":        data.get("create_date", "Unknown"),
                    "expires":        data.get("expiry_date", "Unknown"),
                    "updated":        data.get("update_date", "Unknown"),
                    "status":         data.get("domain_status", []),
                    "name_servers":   data.get("name_servers", []),
                    "country":        data.get("registrant_info", {}).get("country", "Unknown"),
                }
        # Fallback — use rdap
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(f"https://rdap.org/domain/{domain}")
            if res.status_code == 200:
                data = res.json()
                events = {e["eventAction"]: e["eventDate"] for e in data.get("events", [])}
                return {
                    "registrar":    next((e.get("vcardArray", [[]])[1] for e in data.get("entities", []) if "registrar" in e.get("roles", [])), [{}])[0] if data.get("entities") else "Unknown",
                    "created":      events.get("registration", "Unknown"),
                    "expires":      events.get("expiration", "Unknown"),
                    "updated":      events.get("last changed", "Unknown"),
                    "status":       data.get("status", []),
                    "name_servers": [ns.get("ldhName", "") for ns in data.get("nameservers", [])],
                    "country":      "Unknown",
                }
        return {"error": "WHOIS lookup failed"}
    except Exception as e:
        return {"error": str(e)}


# ── IP GEOLOCATION ─────────────────────────────────────────────────────────────
async def check_ip_geo(ip: str) -> dict:
    """Get geolocation data for an IP address."""
    if not ip:
        return {"error": "No IP provided"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(f"http://ip-api.com/json/{ip}?fields=status,country,regionName,city,isp,org,as,proxy,hosting,lat,lon")
            if res.status_code == 200:
                data = res.json()
                if data.get("status") == "success":
                    return {
                        "ip":       ip,
                        "country":  data.get("country", "Unknown"),
                        "region":   data.get("regionName", "Unknown"),
                        "city":     data.get("city", "Unknown"),
                        "isp":      data.get("isp", "Unknown"),
                        "org":      data.get("org", "Unknown"),
                        "is_proxy": data.get("proxy", False),
                        "is_hosting": data.get("hosting", False),
                        "lat":      data.get("lat"),
                        "lon":      data.get("lon"),
                        "risk_flags": []
                            + (["⚠️ VPN/Proxy detected"] if data.get("proxy") else [])
                            + (["⚠️ Hosting/datacenter IP"] if data.get("hosting") else []),
                    }
        return {"error": "IP geolocation failed"}
    except Exception as e:
        return {"error": str(e)}


# ── GOOGLE SAFE BROWSING ───────────────────────────────────────────────────────
async def check_safe_browsing(url: str) -> dict:
    """Check URL against Google Safe Browsing API."""
    if not SAFE_BROWSING_KEY:
        return {"error": "Safe Browsing API key not configured"}
    try:
        payload = {
            "client": {"clientId": "sentinel-ai", "clientVersion": "1.0.0"},
            "threatInfo": {
                "threatTypes":      ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes":    ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries":    [{"url": url}]
            }
        }
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.post(
                f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={SAFE_BROWSING_KEY}",
                json=payload
            )
            if res.status_code == 200:
                data    = res.json()
                matches = data.get("matches", [])
                return {
                    "is_dangerous": len(matches) > 0,
                    "threats":      [m.get("threatType", "") for m in matches],
                    "verdict":      "DANGEROUS" if matches else "CLEAN",
                    "details":      matches,
                }
        return {"error": "Safe Browsing check failed"}
    except Exception as e:
        return {"error": str(e)}


# ── DOMAIN AGE CHECK ───────────────────────────────────────────────────────────
def calculate_domain_age(created_date: str) -> dict:
    """Calculate how old a domain is — new domains are red flags."""
    from datetime import datetime
    try:
        for fmt in ["%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d", "%d-%b-%Y", "%Y-%m-%dT%H:%M:%S.%fZ"]:
            try:
                created = datetime.strptime(created_date[:19], fmt[:len(created_date[:19])])
                age_days = (datetime.now() - created).days
                return {
                    "created_date": created_date,
                    "age_days":     age_days,
                    "age_text":     f"{age_days // 365} years, {(age_days % 365) // 30} months" if age_days > 30 else f"{age_days} days",
                    "is_new":       age_days < 30,
                    "is_very_new":  age_days < 7,
                    "risk":         "🔴 VERY NEW — High risk" if age_days < 7
                                    else "🟠 NEW — Moderate risk" if age_days < 30
                                    else "🟡 RECENT" if age_days < 180
                                    else "🟢 ESTABLISHED",
                }
            except:
                continue
        return {"age_days": -1, "age_text": "Unknown", "is_new": False, "risk": "Unknown"}
    except:
        return {"age_days": -1, "age_text": "Unknown", "is_new": False, "risk": "Unknown"}


# ── TYPOSQUATTING ──────────────────────────────────────────────────────────────
def check_typosquatting(domain: str) -> dict:
    """Detect if domain is typosquatting a known brand."""
    known_brands = {
        "google", "gmail", "facebook", "instagram", "twitter", "amazon",
        "flipkart", "paytm", "phonepe", "gpay", "sbi", "hdfc", "icici",
        "axis", "kotak", "rbi", "irctc", "uidai", "netflix", "microsoft",
        "apple", "paypal", "whatsapp", "telegram", "youtube", "linkedin",
        "uber", "ola", "zomato", "swiggy", "myntra", "snapdeal",
    }

    domain_clean = domain.lower().replace("www.", "").split(".")[0]

    # Direct match check
    if domain_clean in known_brands:
        return {"is_typosquatting": False, "matched_brand": None, "similarity": 100}

    # Similarity check
    for brand in known_brands:
        # Check if brand name is contained
        if brand in domain_clean and domain_clean != brand:
            return {
                "is_typosquatting": True,
                "matched_brand":    brand,
                "domain_checked":   domain,
                "technique":        "Brand name embedded in suspicious domain",
                "risk":             "🔴 HIGH — Domain contains brand name but is not the official domain",
            }
        # Levenshtein-like check (simple)
        if len(brand) > 4 and len(domain_clean) > 4:
            diff = sum(a != b for a, b in zip(brand, domain_clean)) + abs(len(brand) - len(domain_clean))
            if diff <= 2 and domain_clean != brand:
                return {
                    "is_typosquatting": True,
                    "matched_brand":    brand,
                    "domain_checked":   domain,
                    "technique":        f"Character substitution/addition (differs by {diff} chars)",
                    "risk":             "🔴 HIGH — Very similar to official brand domain",
                }

    return {"is_typosquatting": False, "matched_brand": None}


# ── MASTER OSINT FUNCTION ──────────────────────────────────────────────────────
async def run_osint(url: str) -> dict:
    """
    Run complete OSINT investigation on a URL/domain.
    This is the main function called by the API.
    """
    domain = extract_domain(url)
    ip     = extract_ip(domain)

    # Run all checks
    vt_result   = await check_virustotal(url)
    whois_result = await check_whois(domain)
    geo_result  = await check_ip_geo(ip)
    sb_result   = await check_safe_browsing(url)
    typo_result = check_typosquatting(domain)

    # Domain age from WHOIS
    age_result = {}
    if whois_result.get("created") and whois_result["created"] != "Unknown":
        age_result = calculate_domain_age(whois_result["created"])

    # Calculate overall OSINT risk score
    risk_score = 0
    risk_flags = []

    if vt_result.get("malicious", 0) > 0:
        risk_score += 40
        risk_flags.append(f"🔴 VirusTotal: {vt_result['malicious']} engines flagged as malicious")
    if vt_result.get("suspicious", 0) > 2:
        risk_score += 20
        risk_flags.append(f"🟠 VirusTotal: {vt_result['suspicious']} engines flagged as suspicious")
    if sb_result.get("is_dangerous"):
        risk_score += 40
        risk_flags.append(f"🔴 Google Safe Browsing: {', '.join(sb_result.get('threats', []))}")
    if typo_result.get("is_typosquatting"):
        risk_score += 30
        risk_flags.append(f"🔴 Typosquatting: Impersonating '{typo_result.get('matched_brand')}'")
    if age_result.get("is_very_new"):
        risk_score += 25
        risk_flags.append(f"🔴 Domain is only {age_result.get('age_days')} days old")
    elif age_result.get("is_new"):
        risk_score += 15
        risk_flags.append(f"🟠 Domain registered recently ({age_result.get('age_text')})")
    if geo_result.get("is_proxy"):
        risk_score += 15
        risk_flags.append("🟠 IP is behind VPN/Proxy")
    if geo_result.get("is_hosting"):
        risk_score += 10
        risk_flags.append("🟡 IP is a hosting/datacenter IP")

    risk_score = min(risk_score, 100)

    overall_verdict = (
        "CRITICAL"   if risk_score >= 70 else
        "DANGEROUS"  if risk_score >= 50 else
        "SUSPICIOUS" if risk_score >= 25 else
        "SAFE"
    )

    return {
        "domain":           domain,
        "ip":               ip,
        "url_analyzed":     url,
        "virustotal":       vt_result,
        "whois":            whois_result,
        "ip_geolocation":   geo_result,
        "safe_browsing":    sb_result,
        "typosquatting":    typo_result,
        "domain_age":       age_result,
        "risk_score":       risk_score,
        "risk_flags":       risk_flags,
        "overall_verdict":  overall_verdict,
    }