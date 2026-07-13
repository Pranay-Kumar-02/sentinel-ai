# ─────────────────────────────────────────────────────────────────────────────
# SENTINEL AI — QR Safe Scanner Router
# Decodes QR codes using pyzbar (free, no API key).
# Scans decoded URL through VirusTotal free tier.
#
# Install dependencies:
#   pip install pyzbar Pillow
#   On Windows also install: https://sourceforge.net/projects/zbar/
#
# Add to main.py:
#   from routers.qr import router as qr_router
#   app.include_router(qr_router)
# ─────────────────────────────────────────────────────────────────────────────

import os
import io
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image

router = APIRouter(prefix="/qr", tags=["QR Safe Scanner"])

VT_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
VT_BASE    = "https://www.virustotal.com/api/v3"


def decode_qr(image_bytes: bytes) -> list[str]:
    """Decode QR code from image bytes. Returns list of decoded strings."""
    try:
        from pyzbar.pyzbar import decode
        img  = Image.open(io.BytesIO(image_bytes))
        # Convert to RGB if needed
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        decoded = decode(img)
        return [d.data.decode("utf-8", errors="replace") for d in decoded]
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="pyzbar not installed. Run: pip install pyzbar Pillow"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not decode image: {str(e)}")


async def scan_url_virustotal(url: str) -> dict:
    """Scan a URL through VirusTotal free tier."""
    if not VT_API_KEY:
        return {"available": False, "reason": "No VirusTotal API key configured"}

    headers = {"x-apikey": VT_API_KEY}

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Submit URL for scanning
            res = await client.post(
                f"{VT_BASE}/urls",
                headers=headers,
                data={"url": url},
            )
            if res.status_code not in (200, 201):
                return {"available": False, "reason": f"VT submit error: {res.status_code}"}

            analysis_id = res.json().get("data", {}).get("id", "")
            if not analysis_id:
                return {"available": False, "reason": "No analysis ID returned"}

            # Get analysis results
            import asyncio
            await asyncio.sleep(3)  # wait for analysis

            result_res = await client.get(
                f"{VT_BASE}/analyses/{analysis_id}",
                headers=headers,
            )
            if result_res.status_code != 200:
                return {"available": False, "reason": "Could not get analysis results"}

            data    = result_res.json()
            stats   = data.get("data", {}).get("attributes", {}).get("stats", {})
            results = data.get("data", {}).get("attributes", {}).get("results", {})

            malicious  = stats.get("malicious",  0)
            suspicious = stats.get("suspicious", 0)
            harmless   = stats.get("harmless",   0)
            undetected = stats.get("undetected", 0)
            total      = malicious + suspicious + harmless + undetected

            # Get flagged engines
            flagged = [
                {"engine": engine, "result": info.get("result", ""), "category": info.get("category", "")}
                for engine, info in results.items()
                if info.get("category") in ("malicious", "suspicious")
            ][:10]

            verdict = (
                "MALICIOUS"  if malicious  > 0 else
                "SUSPICIOUS" if suspicious > 0 else
                "CLEAN"
            )

            return {
                "available":  True,
                "verdict":    verdict,
                "malicious":  malicious,
                "suspicious": suspicious,
                "harmless":   harmless,
                "total":      total,
                "flagged":    flagged,
                "permalink":  f"https://www.virustotal.com/gui/url/{analysis_id}",
            }

        except Exception as e:
            return {"available": False, "reason": str(e)}


async def check_url_safe_browsing(url: str) -> dict:
    """Check URL against Google Safe Browsing API (free)."""
    gsb_key = os.getenv("SAFE_BROWSING_API_KEY", "")
    if not gsb_key:
        return {"available": False}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.post(
                f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={gsb_key}",
                json={
                    "client": {"clientId": "sentinel-ai", "clientVersion": "2.0"},
                    "threatInfo": {
                        "threatTypes":      ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                        "platformTypes":    ["ANY_PLATFORM"],
                        "threatEntryTypes": ["URL"],
                        "threatEntries":    [{"url": url}],
                    },
                },
            )
            if res.status_code == 200:
                matches = res.json().get("matches", [])
                return {
                    "available": True,
                    "flagged":   len(matches) > 0,
                    "threats":   [m.get("threatType", "") for m in matches],
                }
        except Exception:
            pass
    return {"available": False}


@router.post("/decode")
async def decode_and_scan(file: UploadFile = File(...)):
    """
    Decode a QR code image and scan the extracted URL for threats.
    
    Steps:
    1. Decode QR using pyzbar (free, offline)
    2. Scan URL via VirusTotal (free tier, needs API key)
    3. Check Google Safe Browsing (free, needs API key)
    
    Returns: decoded content, URL analysis, threat verdict.
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image (PNG, JPG, WEBP)")

    # Read image
    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image too large. Max 10MB.")

    # Decode QR
    decoded_values = decode_qr(image_bytes)

    if not decoded_values:
        return JSONResponse(content={
            "success":       False,
            "error":         "No QR code found in image. Make sure the QR code is clear and well-lit.",
            "decoded_values":[],
        })

    # Process each decoded value
    results = []
    for value in decoded_values:
        is_url = value.startswith(("http://", "https://", "www."))

        result = {
            "value":   value,
            "is_url":  is_url,
            "type":    "URL" if is_url else "TEXT",
            "vt":      None,
            "gsb":     None,
            "verdict": "UNKNOWN",
        }

        if is_url:
            # Normalize URL
            url = value if value.startswith("http") else f"https://{value}"

            # Scan through VirusTotal + Safe Browsing concurrently
            import asyncio
            vt_result, gsb_result = await asyncio.gather(
                scan_url_virustotal(url),
                check_url_safe_browsing(url),
            )

            result["vt"]  = vt_result
            result["gsb"] = gsb_result

            # Final verdict
            if vt_result.get("verdict") == "MALICIOUS" or gsb_result.get("flagged"):
                result["verdict"] = "MALICIOUS"
            elif vt_result.get("verdict") == "SUSPICIOUS":
                result["verdict"] = "SUSPICIOUS"
            elif vt_result.get("available"):
                result["verdict"] = "CLEAN"
            else:
                result["verdict"] = "UNSCANNED"

        results.append(result)

    # Overall verdict — worst case wins
    order   = {"MALICIOUS": 0, "SUSPICIOUS": 1, "UNSCANNED": 2, "UNKNOWN": 3, "CLEAN": 4}
    overall = min(results, key=lambda r: order.get(r["verdict"], 99))["verdict"]

    return JSONResponse(content={
        "success":       True,
        "decoded_count": len(results),
        "results":       results,
        "overall_verdict": overall,
    })