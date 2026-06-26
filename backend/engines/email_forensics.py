import re
import socket
import httpx
import dns.resolver
from datetime import datetime
from email import message_from_string
from email.header import decode_header

# ── HELPERS ────────────────────────────────────────────────────────────────────
def decode_mime_header(value: str) -> str:
    """Decode encoded email headers like =?UTF-8?B?...?="""
    if not value:
        return ""
    try:
        parts = decode_header(value)
        decoded = []
        for part, encoding in parts:
            if isinstance(part, bytes):
                decoded.append(part.decode(encoding or "utf-8", errors="replace"))
            else:
                decoded.append(str(part))
        return " ".join(decoded)
    except:
        return str(value)


def extract_ip_from_received(received: str) -> str:
    """Extract IP address from a Received header."""
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    ips = re.findall(ip_pattern, received)
    # Filter out private IPs
    private_prefixes = ("10.", "172.", "192.168.", "127.", "0.")
    public_ips = [ip for ip in ips if not any(ip.startswith(p) for p in private_prefixes)]
    return public_ips[0] if public_ips else (ips[0] if ips else None)


def extract_urls_from_body(body: str) -> list:
    """Extract all URLs from email body."""
    pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return list(set(re.findall(pattern, body)))


# ── SPF CHECK ──────────────────────────────────────────────────────────────────
async def check_spf(domain: str, sender_ip: str) -> dict:
    """Check SPF record for domain."""
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        spf_records = []
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if txt.startswith('v=spf1'):
                spf_records.append(txt)

        if not spf_records:
            return {
                "status": "MISSING",
                "record": None,
                "risk": "🔴 No SPF record — domain has no email authentication",
                "explanation": "Anyone can send emails pretending to be from this domain"
            }

        spf = spf_records[0]
        # Basic SPF analysis
        if "-all" in spf:
            policy = "STRICT (fail)"
        elif "~all" in spf:
            policy = "SOFT FAIL"
        elif "?all" in spf:
            policy = "NEUTRAL"
        elif "+all" in spf:
            policy = "OPEN (dangerous)"
        else:
            policy = "UNKNOWN"

        return {
            "status": "PRESENT",
            "record": spf,
            "policy": policy,
            "risk": "🟢 SPF record found" if "-all" in spf else "🟡 SPF found but not strict",
            "explanation": f"SPF policy: {policy}"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "record": None,
            "risk": "🟡 Could not check SPF",
            "explanation": str(e)
        }


# ── DKIM CHECK ─────────────────────────────────────────────────────────────────
async def check_dkim(domain: str, selector: str = "default") -> dict:
    """Check DKIM record for domain."""
    try:
        selectors = [selector, "google", "mail", "dkim", "smtp", "k1", "s1", "s2"]
        for sel in selectors:
            try:
                dkim_domain = f"{sel}._domainkey.{domain}"
                answers = dns.resolver.resolve(dkim_domain, 'TXT')
                for rdata in answers:
                    txt = rdata.to_text().strip('"')
                    if "v=DKIM1" in txt or "p=" in txt:
                        return {
                            "status": "PRESENT",
                            "selector": sel,
                            "record": txt[:100] + "..." if len(txt) > 100 else txt,
                            "risk": "🟢 DKIM record found",
                            "explanation": f"Domain has DKIM signing configured with selector '{sel}'"
                        }
            except:
                continue

        return {
            "status": "MISSING",
            "selector": None,
            "record": None,
            "risk": "🔴 No DKIM record found",
            "explanation": "Email cannot be verified as cryptographically signed by this domain"
        }
    except Exception as e:
        return {
            "status": "ERROR",
            "record": None,
            "risk": "🟡 Could not check DKIM",
            "explanation": str(e)
        }


# ── DMARC CHECK ────────────────────────────────────────────────────────────────
async def check_dmarc(domain: str) -> dict:
    """Check DMARC record for domain."""
    try:
        dmarc_domain = f"_dmarc.{domain}"
        answers = dns.resolver.resolve(dmarc_domain, 'TXT')
        for rdata in answers:
            txt = rdata.to_text().strip('"')
            if txt.startswith('v=DMARC1'):
                # Parse policy
                policy = "none"
                if "p=reject" in txt:
                    policy = "reject"
                elif "p=quarantine" in txt:
                    policy = "quarantine"
                elif "p=none" in txt:
                    policy = "none (monitor only)"

                return {
                    "status": "PRESENT",
                    "record": txt,
                    "policy": policy,
                    "risk": "🟢 DMARC present (reject)" if policy == "reject"
                            else "🟡 DMARC present but not enforcing" if "none" in policy
                            else "🟢 DMARC present (quarantine)",
                    "explanation": f"DMARC policy: {policy}"
                }

        return {
            "status": "MISSING",
            "record": None,
            "risk": "🔴 No DMARC record",
            "explanation": "No DMARC policy — spoofed emails may not be caught"
        }
    except Exception as e:
        return {
            "status": "MISSING",
            "record": None,
            "risk": "🔴 DMARC not found",
            "explanation": str(e)
        }


# ── IP GEOLOCATION ─────────────────────────────────────────────────────────────
async def geolocate_ip(ip: str) -> dict:
    """Geolocate an IP address."""
    if not ip:
        return {}
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            res = await client.get(
                f"http://ip-api.com/json/{ip}?fields=status,country,regionName,city,isp,org,proxy,hosting"
            )
            if res.status_code == 200:
                data = res.json()
                if data.get("status") == "success":
                    return {
                        "ip":       ip,
                        "country":  data.get("country", "Unknown"),
                        "city":     data.get("city", "Unknown"),
                        "isp":      data.get("isp", "Unknown"),
                        "is_proxy": data.get("proxy", False),
                        "is_hosting": data.get("hosting", False),
                    }
    except:
        pass
    return {"ip": ip}


# ── HEADER CHAIN PARSER ────────────────────────────────────────────────────────
def parse_received_headers(received_headers: list) -> list:
    """Parse Received headers to trace email path."""
    hops = []
    for i, header in enumerate(reversed(received_headers)):
        hop = {
            "hop":       i + 1,
            "raw":       header,
            "from_host": None,
            "by_host":   None,
            "ip":        None,
            "timestamp": None,
            "protocol":  None,
        }

        # Extract from/by
        from_match = re.search(r'from\s+([^\s]+)', header, re.IGNORECASE)
        by_match   = re.search(r'by\s+([^\s]+)',   header, re.IGNORECASE)
        if from_match: hop["from_host"] = from_match.group(1)
        if by_match:   hop["by_host"]   = by_match.group(1)

        # Extract IP
        hop["ip"] = extract_ip_from_received(header)

        # Extract timestamp
        time_patterns = [
            r'\d{1,2}\s+\w+\s+\d{4}\s+\d{2}:\d{2}:\d{2}',
            r'\w+,\s+\d{1,2}\s+\w+\s+\d{4}\s+\d{2}:\d{2}:\d{2}',
        ]
        for pattern in time_patterns:
            match = re.search(pattern, header)
            if match:
                hop["timestamp"] = match.group(0)
                break

        # Protocol
        if "SMTP" in header.upper():   hop["protocol"] = "SMTP"
        if "ESMTP" in header.upper():  hop["protocol"] = "ESMTP"
        if "HTTPS" in header.upper():  hop["protocol"] = "HTTPS"

        hops.append(hop)
    return hops


# ── DISPLAY NAME SPOOF CHECK ───────────────────────────────────────────────────
def check_display_name_spoof(from_header: str, reply_to: str) -> dict:
    """Detect display name spoofing."""
    issues = []

    # Extract display name and email
    display_match = re.match(r'^"?([^"<]+)"?\s*<([^>]+)>', from_header or "")
    if display_match:
        display_name = display_match.group(1).strip()
        email_addr   = display_match.group(2).strip()
        email_domain = email_addr.split("@")[-1] if "@" in email_addr else ""

        # Check if display name mentions a brand but email domain doesn't match
        known_brands = {
            "paypal": "paypal.com", "amazon": "amazon.com", "google": "google.com",
            "microsoft": "microsoft.com", "apple": "apple.com", "netflix": "netflix.com",
            "sbi": "sbi.co.in", "hdfc": "hdfcbank.com", "icici": "icicibank.com",
            "paytm": "paytm.com", "facebook": "facebook.com", "instagram": "instagram.com",
            "rbi": "rbi.org.in", "irctc": "irctc.co.in",
        }

        for brand, official_domain in known_brands.items():
            if brand.lower() in display_name.lower():
                if official_domain not in email_domain.lower():
                    issues.append({
                        "type":    "DISPLAY_NAME_SPOOF",
                        "detail":  f"Display name '{display_name}' mentions '{brand}' but email is from '{email_domain}'",
                        "risk":    "🔴 HIGH — Classic phishing technique",
                    })

        # Reply-to mismatch
        if reply_to and reply_to.strip() and reply_to.strip() != from_header.strip():
            reply_domain = reply_to.split("@")[-1].strip(">").strip() if "@" in reply_to else ""
            if reply_domain and email_domain and reply_domain != email_domain:
                issues.append({
                    "type":   "REPLY_TO_MISMATCH",
                    "detail": f"From domain '{email_domain}' ≠ Reply-To domain '{reply_domain}'",
                    "risk":   "🔴 HIGH — Replies go to a different domain than sender",
                })

    return {
        "issues_found": len(issues) > 0,
        "issues":       issues,
        "display_name": display_match.group(1).strip() if display_match else None,
        "email_address": display_match.group(2).strip() if display_match else from_header,
    }


# ── MASTER EMAIL FORENSICS FUNCTION ───────────────────────────────────────────
async def analyze_email_headers(raw_email: str) -> dict:
    """
    Full email header forensics analysis.
    Accepts raw email source (headers + body).
    """
    try:
        # Parse email
        msg = message_from_string(raw_email)

        # Extract key headers
        from_header    = decode_mime_header(msg.get("From", ""))
        to_header      = decode_mime_header(msg.get("To", ""))
        subject        = decode_mime_header(msg.get("Subject", ""))
        date           = msg.get("Date", "")
        reply_to       = msg.get("Reply-To", "")
        message_id     = msg.get("Message-ID", "")
        received_hdrs  = msg.get_all("Received", [])
        spf_result     = msg.get("Received-SPF", "")
        dkim_result    = msg.get("DKIM-Signature", "")
        dmarc_result   = msg.get("Authentication-Results", "")
        x_mailer       = msg.get("X-Mailer", "")
        x_originating  = msg.get("X-Originating-IP", "")

        # Extract sender domain
        sender_email  = re.search(r'<([^>]+)>', from_header)
        sender_domain = sender_email.group(1).split("@")[-1] if sender_email else ""
        if not sender_domain and "@" in from_header:
            sender_domain = from_header.split("@")[-1].strip()

        # Extract body
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    try:
                        body += part.get_payload(decode=True).decode("utf-8", errors="replace")
                    except:
                        body += str(part.get_payload())
        else:
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    body = payload.decode("utf-8", errors="replace")
                else:
                    body = str(msg.get_payload())
            except:
                body = str(msg.get_payload())

        # Parse received header chain
        hop_chain = parse_received_headers(received_hdrs)

        # Geolocate originating IP
        orig_ip  = x_originating or (hop_chain[0]["ip"] if hop_chain else None)
        geo_data = await geolocate_ip(orig_ip) if orig_ip else {}

        # DNS checks on sender domain
        spf_check   = await check_spf(sender_domain, orig_ip or "") if sender_domain else {}
        dkim_check  = await check_dkim(sender_domain) if sender_domain else {}
        dmarc_check = await check_dmarc(sender_domain) if sender_domain else {}

        # Display name spoof check
        spoof_check = check_display_name_spoof(from_header, reply_to)

        # Extract URLs from body
        body_urls = extract_urls_from_body(body)

        # Authentication summary from headers
        auth_results = {
            "spf_header":  spf_result,
            "dkim_header": "Present" if dkim_result else "Not found in headers",
            "dmarc_header": dmarc_result,
        }

        # Risk flags
        risk_flags = []
        risk_score = 0

        if spoof_check["issues_found"]:
            risk_flags.extend([i["detail"] for i in spoof_check["issues"]])
            risk_score += 30

        if spf_check.get("status") == "MISSING":
            risk_flags.append("No SPF record — anyone can spoof this domain")
            risk_score += 20

        if dkim_check.get("status") == "MISSING":
            risk_flags.append("No DKIM signing — email authenticity cannot be verified")
            risk_score += 15

        if dmarc_check.get("status") == "MISSING":
            risk_flags.append("No DMARC policy — spoofed emails may reach inbox")
            risk_score += 15

        if "fail" in spf_result.lower():
            risk_flags.append(f"SPF FAILED in transit: {spf_result}")
            risk_score += 25

        if body_urls:
            suspicious_urls = [u for u in body_urls if not any(
                d in u for d in ["google.com", "microsoft.com", "apple.com"]
            )]
            if suspicious_urls:
                risk_flags.append(f"{len(suspicious_urls)} suspicious URLs found in email body")
                risk_score += min(len(suspicious_urls) * 10, 20)

        if reply_to and reply_to != from_header:
            risk_score += 10

        if geo_data.get("is_proxy"):
            risk_flags.append("Originating IP is behind a VPN/Proxy")
            risk_score += 15

        risk_score = min(risk_score, 100)
        overall_verdict = (
            "CRITICAL"   if risk_score >= 70 else
            "DANGEROUS"  if risk_score >= 50 else
            "SUSPICIOUS" if risk_score >= 25 else
            "SAFE"
        )

        return {
            "parsed_headers": {
                "from":        from_header,
                "to":          to_header,
                "subject":     subject,
                "date":        date,
                "reply_to":    reply_to,
                "message_id":  message_id,
                "x_mailer":    x_mailer,
                "x_originating_ip": x_originating,
            },
            "sender_domain":     sender_domain,
            "hop_chain":         hop_chain,
            "originating_ip":    orig_ip,
            "geo_location":      geo_data,
            "authentication": {
                "spf":   spf_check,
                "dkim":  dkim_check,
                "dmarc": dmarc_check,
                "headers": auth_results,
            },
            "display_name_analysis": spoof_check,
            "body_urls":         body_urls,
            "body_preview":      body[:500] if body else "",
            "risk_score":        risk_score,
            "risk_flags":        risk_flags,
            "overall_verdict":   overall_verdict,
            "hop_count":         len(hop_chain),
        }

    except Exception as e:
        return {
            "error":           str(e),
            "overall_verdict": "UNKNOWN",
            "risk_score":      0,
            "risk_flags":      [],
        }