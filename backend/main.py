from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.analyzer import full_analysis
from engines.osint import run_osint
from engines.forensics import run_forensics
from engines.email_forensics import analyze_email_headers
from engines.threat_feed import fetch_recent_threats
import uvicorn

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sentinel AI",
    description="Enterprise Cyber Threat Intelligence Platform",
    version="3.0.0"
)
from routers.breach import router as breach_router
app.include_router(breach_router)
from routers.typosquat import router as typosquat_router
app.include_router(typosquat_router)
# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ────────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    text: str


class OSINTRequest(BaseModel):
    url: str


class FullScanRequest(BaseModel):
    text: str
    run_osint: bool = True


class EmailRequest(BaseModel):
    raw_email: str

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name":    "Sentinel AI",
        "version": "3.0.0",
        "status":  "operational",
        "engines": [
            "LLM Threat Analysis",
            "OSINT Engine",
            "Forensics Engine",
            "VirusTotal",
            "WHOIS",
            "IP Geolocation",
            "Google Safe Browsing",
            "Typosquatting Detection",
            "Screenshot OCR",
            "QR Code Decoder",
            "PDF Analyzer",
            "DOCX Analyzer",
            "Live Threat Feed (URLhaus)",
        ],
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "3.0.0"}

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    """Core LLM threat analysis."""
    if not request.text.strip():
        raise HTTPException(400, "Input cannot be empty")
    if len(request.text) > 10000:
        raise HTTPException(400, "Input too long. Max 10000 chars.")
    try:
        return await full_analysis(request.text)
    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")

@app.post("/osint")
async def osint(request: OSINTRequest):
    """OSINT investigation on a URL/domain."""
    if not request.url.strip():
        raise HTTPException(400, "URL cannot be empty")
    try:
        return await run_osint(request.url)
    except Exception as e:
        raise HTTPException(500, f"OSINT scan failed: {str(e)}")

@app.post("/fullscan")
async def fullscan(request: FullScanRequest):
    """Master endpoint — LLM + OSINT combined."""
    if not request.text.strip():
        raise HTTPException(400, "Input cannot be empty")
    try:
        llm_result   = await full_analysis(request.text)
        osint_results = []

        if request.run_osint:
            urls = llm_result.get("auto_extracted", {}).get("urls", [])
            for url in urls[:3]:
                osint_data = await run_osint(url)
                osint_results.append(osint_data)

        master_verdict = llm_result.get("summary", {}).get("verdict", "UNKNOWN")
        for o in osint_results:
            ov = o.get("overall_verdict", "SAFE")
            if ov == "CRITICAL": master_verdict = "CRITICAL"
            elif ov == "DANGEROUS" and master_verdict not in ["CRITICAL"]: master_verdict = "DANGEROUS"
            elif ov == "SUSPICIOUS" and master_verdict == "SAFE": master_verdict = "SUSPICIOUS"

        return {
            "master_verdict": master_verdict,
            "llm_analysis":   llm_result,
            "osint_results":  osint_results,
            "urls_scanned":   len(osint_results),
            "summary": {
                "verdict":          master_verdict,
                "confidence":       llm_result.get("summary", {}).get("confidence", 0),
                "attack_type":      llm_result.get("summary", {}).get("attack_type", "Unknown"),
                "severity":         llm_result.get("summary", {}).get("severity", "UNKNOWN"),
                "osint_risk_scores":    [o.get("risk_score", 0) for o in osint_results],
                "total_risk_flags":     sum(len(o.get("risk_flags", [])) for o in osint_results),
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Full scan failed: {str(e)}")

@app.post("/forensics/upload")
async def forensics_upload(file: UploadFile = File(...)):
    """
    Phase 3 — Forensics Engine.
    Upload screenshot, QR code, PDF, or DOCX.
    Extracts text/URLs then runs full threat analysis.
    """
    # File size limit — 10MB
    MAX_SIZE = 10 * 1024 * 1024
    file_bytes = await file.read()

    if len(file_bytes) > MAX_SIZE:
        raise HTTPException(400, "File too large. Max 10MB.")

    allowed_types = [
        "image/png", "image/jpeg", "image/jpg", "image/webp",
        "image/bmp", "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    try:
        # Step 1 — Extract content from file
        forensics_result = await run_forensics(
            file_bytes    = file_bytes,
            filename      = file.filename or "uploaded_file",
            content_type  = file.content_type or "",
        )

        if not forensics_result.get("ready_for_analysis"):
            return {
                "forensics":       forensics_result,
                "llm_analysis":    None,
                "osint_results":   [],
                "master_verdict":  "UNKNOWN",
                "error":           forensics_result.get("error", "Could not extract content from file"),
                "summary": {
                    "verdict":    "UNKNOWN",
                    "confidence": 0,
                    "severity":   "UNKNOWN",
                }
            }

        # Step 2 — Run LLM analysis on extracted text
        extracted_text = forensics_result.get("extracted_text", "")
        analysis_input = f"""
FILE FORENSICS ANALYSIS
File: {forensics_result.get('filename')}
Type: {forensics_result.get('file_type')}
Extracted Content:
{extracted_text}
"""
        llm_result = await full_analysis(analysis_input)

        # Step 3 — OSINT on extracted URLs
        osint_results = []
        all_urls = forensics_result.get("extracted_urls", [])
        for url in all_urls[:3]:
            osint_data = await run_osint(url)
            osint_results.append(osint_data)

        # Step 4 — Master verdict
        master_verdict = llm_result.get("summary", {}).get("verdict", "UNKNOWN")
        for o in osint_results:
            ov = o.get("overall_verdict", "SAFE")
            if ov == "CRITICAL": master_verdict = "CRITICAL"
            elif ov == "DANGEROUS" and master_verdict != "CRITICAL": master_verdict = "DANGEROUS"
            elif ov == "SUSPICIOUS" and master_verdict == "SAFE": master_verdict = "SUSPICIOUS"

        return {
            "forensics":      forensics_result,
            "llm_analysis":   llm_result,
            "osint_results":  osint_results,
            "master_verdict": master_verdict,
            "summary": {
                "verdict":     master_verdict,
                "confidence":  llm_result.get("summary", {}).get("confidence", 0),
                "attack_type": llm_result.get("summary", {}).get("attack_type", "Unknown"),
                "severity":    llm_result.get("summary", {}).get("severity", "UNKNOWN"),
            }
        }

    except Exception as e:
        raise HTTPException(500, f"Forensics analysis failed: {str(e)}")


@app.post("/analyze/email")
async def analyze_email(request: EmailRequest):
    """
    Phase 4 — Email Header Forensics.
    Paste raw email source including headers.
    """
    if not request.raw_email.strip():
        raise HTTPException(400, "Email content cannot be empty")
    if len(request.raw_email) > 50000:
        raise HTTPException(400, "Email too large. Max 50KB.")
    try:
        # Step 1 — Full email header analysis
        email_result = await analyze_email_headers(request.raw_email)

        # Step 2 — LLM analysis on email body + findings
        analysis_input = f"""
EMAIL FORENSICS ANALYSIS

From: {email_result.get('parsed_headers', {}).get('from', 'Unknown')}
Subject: {email_result.get('parsed_headers', {}).get('subject', 'Unknown')}
Sender Domain: {email_result.get('sender_domain', 'Unknown')}

Authentication Results:
- SPF: {email_result.get('authentication', {}).get('spf', {}).get('status', 'Unknown')} — {email_result.get('authentication', {}).get('spf', {}).get('risk', '')}
- DKIM: {email_result.get('authentication', {}).get('dkim', {}).get('status', 'Unknown')} — {email_result.get('authentication', {}).get('dkim', {}).get('risk', '')}
- DMARC: {email_result.get('authentication', {}).get('dmarc', {}).get('status', 'Unknown')} — {email_result.get('authentication', {}).get('dmarc', {}).get('risk', '')}

Display Name Issues: {email_result.get('display_name_analysis', {}).get('issues', [])}
Risk Flags: {email_result.get('risk_flags', [])}
URLs in body: {email_result.get('body_urls', [])}
Originating IP: {email_result.get('originating_ip', 'Unknown')}
Geo Location: {email_result.get('geo_location', {})}

Email Body Preview:
{email_result.get('body_preview', '')}

Analyze this email for threats, phishing, BEC, spoofing, or malicious intent.
"""
        llm_result = await full_analysis(analysis_input)

        # Step 3 — OSINT on body URLs
        osint_results = []
        for url in email_result.get("body_urls", [])[:2]:
            try:
                osint_data = await run_osint(url)
                osint_results.append(osint_data)
            except:
                pass

        # Step 4 — Final master verdict
        # Use highest severity between email forensics and LLM
        email_verdict = email_result.get("overall_verdict", "UNKNOWN")
        llm_verdict   = llm_result.get("summary", {}).get("verdict", "UNKNOWN")

        severity_rank = {"SAFE": 0, "UNKNOWN": 1, "SUSPICIOUS": 2, "DANGEROUS": 3, "CRITICAL": 4}
        master_verdict = max([email_verdict, llm_verdict], key=lambda v: severity_rank.get(v, 0))

        # Upgrade if OSINT finds threats
        for o in osint_results:
            ov = o.get("overall_verdict", "SAFE")
            if severity_rank.get(ov, 0) > severity_rank.get(master_verdict, 0):
                master_verdict = ov

        return {
            "master_verdict":   master_verdict,
            "email_forensics":  email_result,
            "llm_analysis":     llm_result,
            "osint_results":    osint_results,
            "summary": {
                "verdict":        master_verdict,
                "confidence":     llm_result.get("summary", {}).get("confidence", 0),
                "attack_type":    llm_result.get("summary", {}).get("attack_type", "Unknown"),
                "severity":       llm_result.get("summary", {}).get("severity", "UNKNOWN"),
                "risk_score":     email_result.get("risk_score", 0),
                "risk_flags":     email_result.get("risk_flags", []),
                "hop_count":      email_result.get("hop_count", 0),
                "spf_status":     email_result.get("authentication", {}).get("spf", {}).get("status", "Unknown"),
                "dkim_status":    email_result.get("authentication", {}).get("dkim", {}).get("status", "Unknown"),
                "dmarc_status":   email_result.get("authentication", {}).get("dmarc", {}).get("status", "Unknown"),
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Email analysis failed: {str(e)}")


@app.get("/threat-feed/live")
async def threat_feed_live(limit: int = 30):
    """
    Phase 5 — Real Live Threat Feed.
    Returns real malicious URLs recently reported to URLhaus (abuse.ch),
    transformed into Sentinel's threat item format. Cached for 5 minutes
    to respect URLhaus's fair-use rate limit — replaces the old frontend
    random-data simulator entirely.
    """
    try:
        items = await fetch_recent_threats(limit=limit)
        return {"items": items, "count": len(items), "source": "URLhaus (abuse.ch)"}
    except Exception as e:
        raise HTTPException(500, f"Threat feed fetch failed: {str(e)}")

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)