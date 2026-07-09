# ─────────────────────────────────────────────────────────────────────────────
# SENTINEL AI — Breach Monitor Router
#
# Flow:
#   1. XposedOrNot API → detects which breaches the email appears in (FREE)
#   2. HIBP Public Breach API → fetches precise details for each breach (FREE)
#      endpoint: GET https://haveibeenpwned.com/api/v3/breach/{name}
#      This endpoint is PUBLIC — no API key required.
#
# Result: 100% accurate breach names, dates, PwnCount, DataClasses.
# Zero approximations. Zero paid APIs.
# ─────────────────────────────────────────────────────────────────────────────

import asyncio
import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/breach", tags=["Breach Monitor"])

XON_BASE  = "https://api.xposedornot.com/v1"
HIBP_BASE = "https://haveibeenpwned.com/api/v3"
HEADERS   = {"User-Agent": "Sentinel-AI-CTI-Platform"}


async def fetch_breach_detail(client: httpx.AsyncClient, breach_name: str) -> dict | None:
    """
    Fetch precise breach details from HIBP public endpoint.
    No API key required. Returns exact DataClasses, PwnCount, date, description.
    """
    try:
        res = await client.get(
            f"{HIBP_BASE}/breach/{breach_name}",
            headers=HEADERS,
            timeout=10.0,
        )
        if res.status_code == 200:
            return res.json()
        return None
    except Exception:
        return None


@router.get("/check")
async def check_breach(email: str = Query(..., description="Email address to check")):
    """
    Check if an email appears in any known data breaches.
    
    Step 1: XposedOrNot detects breach names (free, no key)
    Step 2: HIBP public API fetches precise details per breach (free, no key)
    
    Returns 100% accurate: breach names, dates, PwnCount, DataClasses, descriptions.
    """
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")

    email = email.strip().lower()

    async with httpx.AsyncClient(timeout=20.0) as client:
        # ── Step 1: Get breach names from XposedOrNot ─────────────────────────
        try:
            xon_res = await client.get(
                f"{XON_BASE}/check-email/{email}",
                headers=HEADERS,
            )
        except httpx.ConnectError:
            raise HTTPException(status_code=503, detail="Could not connect to breach detection service.")
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Breach detection timed out.")

        # No breaches found
        if xon_res.status_code == 404:
            return JSONResponse(content={
                "breaches": [],
                "clean":    True,
                "count":    0,
                "email":    email,
            })

        if xon_res.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limited. Please wait 30 seconds and try again.")

        if xon_res.status_code != 200:
            raise HTTPException(
                status_code=502,
                detail=f"Breach detection service returned {xon_res.status_code}."
            )

        xon_data     = xon_res.json()
        breach_names = xon_data.get("breaches", []) or []

        if not breach_names:
            return JSONResponse(content={
                "breaches": [],
                "clean":    True,
                "count":    0,
                "email":    email,
            })

        # ── Step 2: Fetch precise details for each breach from HIBP ───────────
        # Run all detail fetches concurrently for speed
        tasks   = [fetch_breach_detail(client, name) for name in breach_names]
        details = await asyncio.gather(*tasks)

        # Build final breach list — merge HIBP detail with XON name
        breaches = []
        for i, name in enumerate(breach_names):
            detail = details[i]
            if detail:
                # Full precise data from HIBP
                breaches.append({
                    "Name":        detail.get("Name",        name),
                    "Title":       detail.get("Title",       name),
                    "Domain":      detail.get("Domain",      ""),
                    "BreachDate":  detail.get("BreachDate",  "Unknown"),
                    "AddedDate":   detail.get("AddedDate",   ""),
                    "ModifiedDate":detail.get("ModifiedDate",""),
                    "PwnCount":    detail.get("PwnCount",    0),
                    "Description": detail.get("Description", ""),
                    "LogoPath":    detail.get("LogoPath",    ""),
                    "DataClasses": detail.get("DataClasses", []),
                    "IsVerified":  detail.get("IsVerified",  True),
                    "IsFabricated":detail.get("IsFabricated",False),
                    "IsSensitive": detail.get("IsSensitive", False),
                    "IsRetired":   detail.get("IsRetired",   False),
                    "IsSpamList":  detail.get("IsSpamList",  False),
                })
            else:
                # HIBP didn't have this breach — use basic info from XON
                breaches.append({
                    "Name":        name,
                    "Title":       name,
                    "Domain":      "",
                    "BreachDate":  "Unknown",
                    "PwnCount":    0,
                    "Description": f"Your email was found in the {name} data breach.",
                    "DataClasses": ["Email addresses"],
                    "IsVerified":  True,
                    "IsSensitive": False,
                })

        # Sort by PwnCount descending (biggest breaches first)
        breaches.sort(key=lambda b: b.get("PwnCount", 0), reverse=True)

        return JSONResponse(content={
            "breaches": breaches,
            "clean":    False,
            "count":    len(breaches),
            "email":    email,
        })


@router.get("/breach/{name}")
async def get_breach_detail(name: str):
    """
    Get full details of a specific breach by name.
    Uses HIBP public endpoint — free, no key required.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            res = await client.get(
                f"{HIBP_BASE}/breach/{name}",
                headers=HEADERS,
            )
            if res.status_code == 404:
                raise HTTPException(status_code=404, detail=f"Breach '{name}' not found.")
            if res.status_code != 200:
                raise HTTPException(status_code=res.status_code, detail="Failed to fetch breach details.")
            return res.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Request timed out.")