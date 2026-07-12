# ─────────────────────────────────────────────────────────────────────────────
# SENTINEL AI — CVE Pulse Router (Production-Grade)
# Uses NIST NVD API v2 — completely FREE, no API key needed.
# Real CVE data: IDs, CVSS scores, severity, descriptions, affected versions.
#
# Add to main.py:
#   from routers.cve import router as cve_router
#   app.include_router(cve_router)
# ─────────────────────────────────────────────────────────────────────────────

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/cve", tags=["CVE Pulse"])

NVD_BASE = "https://services.nvd.nist.gov/rest/json/cves/2.0"

SEVERITY_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "NONE": 4}


def parse_cvss(cve_item: dict) -> dict:
    """Extract CVSS score and severity from NVD CVE item."""
    metrics = cve_item.get("metrics", {})
    
    # Try CVSS v3.1 first, then v3.0, then v2
    for version_key in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
        metrics_list = metrics.get(version_key, [])
        if metrics_list:
            m = metrics_list[0]
            cvss_data = m.get("cvssData", {})
            return {
                "score":            cvss_data.get("baseScore", 0),
                "severity":         cvss_data.get("baseSeverity", m.get("baseSeverity", "NONE")),
                "vector":           cvss_data.get("vectorString", ""),
                "attack_vector":    cvss_data.get("attackVector", ""),
                "attack_complexity":cvss_data.get("attackComplexity", ""),
                "privileges":       cvss_data.get("privilegesRequired", ""),
                "user_interaction": cvss_data.get("userInteraction", ""),
                "confidentiality":  cvss_data.get("confidentialityImpact", ""),
                "integrity":        cvss_data.get("integrityImpact", ""),
                "availability":     cvss_data.get("availabilityImpact", ""),
                "version":          "3.1" if version_key == "cvssMetricV31" else "3.0" if version_key == "cvssMetricV30" else "2.0",
            }
    
    return {"score": 0, "severity": "NONE", "vector": "", "version": "N/A"}


def parse_cve(cve_item: dict) -> dict:
    """Parse a single CVE item into clean format."""
    vuln    = cve_item.get("cve", {})
    cve_id  = vuln.get("id", "")
    
    # Description (English preferred)
    descriptions = vuln.get("descriptions", [])
    description  = next(
        (d["value"] for d in descriptions if d.get("lang") == "en"),
        descriptions[0]["value"] if descriptions else "No description available"
    )
    
    # References
    refs = [
        {
            "url":  r.get("url", ""),
            "tags": r.get("tags", []),
        }
        for r in vuln.get("references", [])[:5]  # limit to 5
    ]
    
    # Affected configurations
    configs      = vuln.get("configurations", [])
    affected_software = []
    for config in configs[:3]:
        for node in config.get("nodes", []):
            for cpe in node.get("cpeMatch", [])[:3]:
                if cpe.get("vulnerable"):
                    criteria = cpe.get("criteria", "")
                    parts    = criteria.split(":")
                    if len(parts) >= 5:
                        affected_software.append({
                            "vendor":  parts[3] if len(parts) > 3 else "",
                            "product": parts[4] if len(parts) > 4 else "",
                            "version": parts[5] if len(parts) > 5 else "*",
                        })

    # Weakness (CWE)
    weaknesses = vuln.get("weaknesses", [])
    cwes = []
    for w in weaknesses:
        for desc in w.get("description", []):
            if desc.get("lang") == "en":
                cwes.append(desc.get("value", ""))

    cvss = parse_cvss(vuln)

    return {
        "id":                cve_id,
        "description":       description,
        "published":         vuln.get("published", ""),
        "last_modified":     vuln.get("lastModified", ""),
        "status":            vuln.get("vulnStatus", ""),
        "cvss":              cvss,
        "score":             cvss["score"],
        "severity":          cvss["severity"],
        "references":        refs,
        "affected_software": affected_software[:10],
        "cwes":              cwes[:3],
        "url":               f"https://nvd.nist.gov/vuln/detail/{cve_id}",
    }


@router.get("/search")
async def search_cve(
    keyword:  str           = Query(..., description="Software or keyword to search (e.g. 'chrome', 'wordpress')"),
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"),
    days:     int           = Query(90,  description="Only show CVEs from last N days (0 = all time)"),
    limit:    int           = Query(20,  description="Max results to return (max 50)"),
):
    """
    Search CVEs from NIST NVD — real vulnerability data, completely free.
    Returns exact CVE IDs, CVSS scores, severity, descriptions.
    """
    if not keyword.strip():
        raise HTTPException(status_code=400, detail="Keyword is required")

    limit = min(limit, 50)

    params = {
        "keywordSearch": keyword.strip(),
        "resultsPerPage": min(limit * 2, 100),  # fetch extra to allow filtering
        "startIndex": 0,
    }

    # Date filter
    if days > 0:
        end_date   = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        params["pubStartDate"] = start_date.strftime("%Y-%m-%dT00:00:00.000")
        params["pubEndDate"]   = end_date.strftime("%Y-%m-%dT23:59:59.999")

    # Severity filter
    if severity and severity.upper() in SEVERITY_ORDER:
        params["cvssV3Severity"] = severity.upper()

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            res = await client.get(
                NVD_BASE,
                params=params,
                headers={"User-Agent": "Sentinel-AI-CTI-Platform"},
            )

            if res.status_code == 403:
                raise HTTPException(status_code=403, detail="NVD API rate limited. Please wait 30 seconds.")
            if res.status_code == 404:
                return JSONResponse(content={"cves": [], "total": 0, "keyword": keyword})
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"NVD API error: {res.text[:200]}")

            data       = res.json()
            total      = data.get("totalResults", 0)
            raw_cves   = data.get("vulnerabilities", [])

            # Parse and sort by CVSS score descending
            cves = [parse_cve(item) for item in raw_cves]
            cves.sort(key=lambda c: (
                SEVERITY_ORDER.get(c["severity"], 99),
                -c["score"]
            ))

            # Apply limit after sorting
            cves = cves[:limit]

            # Summary stats
            stats = {
                "critical": sum(1 for c in cves if c["severity"] == "CRITICAL"),
                "high":     sum(1 for c in cves if c["severity"] == "HIGH"),
                "medium":   sum(1 for c in cves if c["severity"] == "MEDIUM"),
                "low":      sum(1 for c in cves if c["severity"] == "LOW"),
            }

            return JSONResponse(content={
                "cves":    cves,
                "total":   total,
                "showing": len(cves),
                "keyword": keyword,
                "stats":   stats,
            })

        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="NVD API timed out. Try again.")
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Could not connect to NVD API.")


@router.get("/recent")
async def recent_critical(days: int = Query(7, description="Last N days")):
    """Get recent CRITICAL and HIGH CVEs from the last N days."""
    results = {}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for severity in ["CRITICAL", "HIGH"]:
            end_date   = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            try:
                res = await client.get(
                    NVD_BASE,
                    params={
                        "cvssV3Severity": severity,
                        "pubStartDate":   start_date.strftime("%Y-%m-%dT00:00:00.000"),
                        "pubEndDate":     end_date.strftime("%Y-%m-%dT23:59:59.999"),
                        "resultsPerPage": 10,
                        "startIndex":     0,
                    },
                    headers={"User-Agent": "Sentinel-AI-CTI-Platform"},
                )
                
                if res.status_code == 200:
                    data = res.json()
                    cves = [parse_cve(item) for item in data.get("vulnerabilities", [])]
                    results[severity.lower()] = cves[:10]
                else:
                    results[severity.lower()] = []
                    
            except Exception:
                results[severity.lower()] = []

    return JSONResponse(content={
        "critical": results.get("critical", []),
        "high":     results.get("high", []),
        "days":     days,
    })


@router.get("/detail/{cve_id}")
async def get_cve_detail(cve_id: str):
    """Get full details for a specific CVE by ID."""
    cve_id = cve_id.upper().strip()
    if not cve_id.startswith("CVE-"):
        raise HTTPException(status_code=400, detail="Invalid CVE ID format. Use CVE-YYYY-NNNNN")

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            res = await client.get(
                NVD_BASE,
                params={"cveId": cve_id},
                headers={"User-Agent": "Sentinel-AI-CTI-Platform"},
            )
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail=f"CVE not found: {cve_id}")
            
            data = res.json()
            vulns = data.get("vulnerabilities", [])
            if not vulns:
                raise HTTPException(status_code=404, detail=f"CVE {cve_id} not found")
            
            return parse_cve(vulns[0])
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="NVD API timed out.")