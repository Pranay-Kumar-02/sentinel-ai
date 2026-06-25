from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.analyzer import full_analysis
from engines.osint import run_osint
import uvicorn

# ── App Setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sentinel AI",
    description="Enterprise Cyber Threat Intelligence Platform",
    version="2.0.0"
)

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

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name": "Sentinel AI",
        "version": "2.0.0",
        "status": "operational",
        "engines": ["LLM Threat Analysis", "OSINT Engine", "VirusTotal", "WHOIS", "IP Geolocation", "Google Safe Browsing", "Typosquatting Detection"],
        "message": "Enterprise Cyber Threat Intelligence Platform"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    """Core LLM threat analysis endpoint."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")
    if len(request.text) > 10000:
        raise HTTPException(status_code=400, detail="Input too long. Max 10000 characters.")
    try:
        result = await full_analysis(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/osint")
async def osint(request: OSINTRequest):
    """OSINT investigation endpoint — deep URL/domain intelligence."""
    if not request.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    try:
        result = await run_osint(request.url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OSINT scan failed: {str(e)}")

@app.post("/fullscan")
async def fullscan(request: FullScanRequest):
    """
    MASTER ENDPOINT — runs everything together:
    1. LLM threat analysis
    2. Auto-extracts URLs
    3. Runs OSINT on each URL found
    Returns complete unified threat report.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input cannot be empty")
    try:
        # Step 1 — LLM analysis
        llm_result = await full_analysis(request.text)

        # Step 2 — OSINT on extracted URLs
        osint_results = []
        if request.run_osint:
            urls = llm_result.get("auto_extracted", {}).get("urls", [])
            for url in urls[:3]:  # Max 3 URLs to stay within free API limits
                osint_data = await run_osint(url)
                osint_results.append(osint_data)

        # Step 3 — Combine into master report
        master_verdict = llm_result.get("summary", {}).get("verdict", "UNKNOWN")

        # Upgrade verdict if OSINT finds something worse
        for osint in osint_results:
            ov = osint.get("overall_verdict", "SAFE")
            if ov == "CRITICAL":
                master_verdict = "CRITICAL"
            elif ov == "DANGEROUS" and master_verdict not in ["CRITICAL"]:
                master_verdict = "DANGEROUS"
            elif ov == "SUSPICIOUS" and master_verdict == "SAFE":
                master_verdict = "SUSPICIOUS"

        return {
            "master_verdict": master_verdict,
            "llm_analysis":   llm_result,
            "osint_results":  osint_results,
            "urls_scanned":   len(osint_results),
            "summary": {
                "verdict":     master_verdict,
                "confidence":  llm_result.get("summary", {}).get("confidence", 0),
                "attack_type": llm_result.get("summary", {}).get("attack_type", "Unknown"),
                "severity":    llm_result.get("summary", {}).get("severity", "UNKNOWN"),
                "osint_risk_scores": [o.get("risk_score", 0) for o in osint_results],
                "total_risk_flags":  sum(len(o.get("risk_flags", [])) for o in osint_results),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full scan failed: {str(e)}")

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)