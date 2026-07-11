# ─────────────────────────────────────────────────────────────────────────────
# SENTINEL AI — Typosquat Watchdog Router
# 100% free. No API key. No external paid service.
#
# How it works:
#   1. Generate 200+ domain permutations algorithmically
#   2. DNS resolve each one — if it resolves, it EXISTS
#   3. For existing domains, check HTTP response (is it a live site?)
#   4. Result: exact list of registered lookalike domains
#
# Add to main.py:
#   from routers.typosquat import router as typosquat_router
#   app.include_router(typosquat_router)
# ─────────────────────────────────────────────────────────────────────────────

import asyncio
import socket
import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
import re

router = APIRouter(prefix="/typosquat", tags=["Typosquat Watchdog"])

# Common TLDs to check
TLDS = [
    ".com", ".net", ".org", ".co", ".io", ".info", ".biz",
    ".co.in", ".in", ".online", ".site", ".xyz", ".store",
    ".tech", ".app", ".dev", ".cc", ".tk", ".ml", ".ga",
]

def extract_domain_parts(domain: str):
    """Extract name and TLD from domain."""
    domain = domain.lower().strip()
    domain = domain.replace("https://", "").replace("http://", "").replace("www.", "")
    domain = domain.split("/")[0]
    
    # Find TLD
    for tld in sorted(TLDS, key=len, reverse=True):
        if domain.endswith(tld):
            name = domain[:-len(tld)]
            return name, tld
    
    # Default split on last dot
    parts = domain.rsplit(".", 1)
    if len(parts) == 2:
        return parts[0], "." + parts[1]
    return domain, ".com"


def generate_permutations(name: str, original_tld: str) -> list[str]:
    """
    Generate realistic typosquat permutations.
    Returns full domains including TLD.
    """
    permutations = set()
    
    # 1. Character substitutions (common lookalikes)
    substitutions = {
        'a': ['@', '4', 'à'],
        'e': ['3', 'é'],
        'i': ['1', 'l', '!'],
        'o': ['0', 'ø'],
        'l': ['1', 'i'],
        's': ['5', '$'],
        'g': ['9', 'q'],
        'b': ['6', 'd'],
        't': ['7'],
    }
    
    for i, char in enumerate(name):
        if char in substitutions:
            for sub in substitutions[char]:
                if sub.isalnum() or sub == '-':
                    new_name = name[:i] + sub + name[i+1:]
                    permutations.add(new_name + original_tld)
    
    # 2. Character omission (drop each character)
    for i in range(len(name)):
        new_name = name[:i] + name[i+1:]
        if len(new_name) >= 3:
            permutations.add(new_name + original_tld)
    
    # 3. Character duplication (double each character)
    for i, char in enumerate(name):
        new_name = name[:i] + char + char + name[i+1:]
        permutations.add(new_name + original_tld)
    
    # 4. Adjacent character swap
    for i in range(len(name) - 1):
        chars = list(name)
        chars[i], chars[i+1] = chars[i+1], chars[i]
        new_name = "".join(chars)
        permutations.add(new_name + original_tld)
    
    # 5. Character insertion (common typos)
    keyboard_adjacents = {
        'a': 'sq', 'b': 'vn', 'c': 'xv', 'd': 'sf', 'e': 'wr',
        'f': 'dg', 'g': 'fh', 'h': 'gj', 'i': 'uo', 'j': 'hk',
        'k': 'jl', 'l': 'k', 'm': 'n', 'n': 'bm', 'o': 'ip',
        'p': 'o', 'q': 'w', 'r': 'et', 's': 'ad', 't': 'ry',
        'u': 'yi', 'v': 'cb', 'w': 'qe', 'x': 'zc', 'y': 'tu',
        'z': 'x',
    }
    for i, char in enumerate(name):
        if char in keyboard_adjacents:
            for adj in keyboard_adjacents[char]:
                new_name = name[:i] + adj + name[i:]
                permutations.add(new_name + original_tld)
    
    # 6. Hyphen insertion
    for i in range(1, len(name)):
        new_name = name[:i] + '-' + name[i:]
        permutations.add(new_name + original_tld)
    
    # 7. Common prefix/suffix additions
    prefixes = ["my", "get", "the", "official", "secure", "safe", "real", "login", "app", "web"]
    suffixes = ["app", "web", "site", "online", "login", "secure", "official", "hub", "portal"]
    
    for prefix in prefixes:
        permutations.add(f"{prefix}{name}{original_tld}")
        permutations.add(f"{prefix}-{name}{original_tld}")
    
    for suffix in suffixes:
        permutations.add(f"{name}{suffix}{original_tld}")
        permutations.add(f"{name}-{suffix}{original_tld}")
    
    # 8. TLD variations (same name, different TLD)
    for tld in TLDS:
        if tld != original_tld:
            permutations.add(name + tld)
    
    # 9. Common separator variations
    if '-' in name:
        permutations.add(name.replace('-', '') + original_tld)
    else:
        for i in range(1, len(name)):
            permutations.add(name[:i] + '-' + name[i:] + original_tld)

    # Remove the original domain itself
    permutations.discard(name + original_tld)
    
    # Only keep valid domain names (alphanumeric + hyphens)
    valid = set()
    for p in permutations:
        domain_part = p.split(".")[0]
        if re.match(r'^[a-z0-9][a-z0-9\-]*[a-z0-9]$', domain_part) or re.match(r'^[a-z0-9]$', domain_part):
            valid.add(p)
    
    return list(valid)


def dns_resolve(domain: str) -> bool:
    """Check if domain resolves via DNS. Returns True if registered."""
    try:
        socket.setdefaulttimeout(3)
        socket.gethostbyname(domain)
        return True
    except (socket.gaierror, socket.timeout):
        return False


async def check_domain_live(client: httpx.AsyncClient, domain: str) -> dict:
    """Check if a registered domain is serving a live website."""
    try:
        res = await client.get(
            f"https://{domain}",
            timeout=5.0,
            follow_redirects=True,
        )
        return {
            "live":        True,
            "status_code": res.status_code,
            "final_url":   str(res.url),
        }
    except Exception:
        try:
            res = await client.get(
                f"http://{domain}",
                timeout=5.0,
                follow_redirects=True,
            )
            return {
                "live":        True,
                "status_code": res.status_code,
                "final_url":   str(res.url),
            }
        except Exception:
            return {"live": False, "status_code": None, "final_url": None}


@router.get("/check")
async def check_typosquat(
    domain: str = Query(..., description="Domain to check (e.g. sentinel.ai)"),
    check_live: bool = Query(False, description="Also check if registered domains serve live websites"),
):
    """
    Generate typosquat permutations and check which are registered via DNS.
    
    Returns:
    - Total permutations generated
    - Which ones are registered (DNS resolves)
    - If check_live=true, which registered domains serve live websites
    """
    # Clean input
    domain = domain.lower().strip()
    domain = domain.replace("https://", "").replace("http://", "").replace("www.", "")
    domain = domain.split("/")[0]
    
    if not domain or "." not in domain:
        raise HTTPException(status_code=400, detail="Please enter a valid domain (e.g. example.com)")
    
    # Extract parts
    name, tld = extract_domain_parts(domain)
    
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Domain name too short to analyze")
    
    # Generate permutations
    permutations = generate_permutations(name, tld)
    
    # Limit to 300 for performance
    permutations = permutations[:300]
    
    # DNS check all permutations concurrently using thread pool
    loop = asyncio.get_event_loop()
    
    dns_tasks = [
        loop.run_in_executor(None, dns_resolve, perm)
        for perm in permutations
    ]
    dns_results = await asyncio.gather(*dns_tasks)
    
    # Filter registered domains
    registered = [
        perm for perm, resolved in zip(permutations, dns_results)
        if resolved
    ]
    
    # Optionally check which registered domains are live
    live_check_results = {}
    if check_live and registered:
        async with httpx.AsyncClient(timeout=10.0) as client:
            live_tasks = [check_domain_live(client, d) for d in registered[:20]]  # limit to 20
            live_results = await asyncio.gather(*live_tasks)
            live_check_results = {
                domain: result
                for domain, result in zip(registered[:20], live_results)
            }
    
    # Build response
    registered_details = []
    for reg_domain in registered:
        live_info = live_check_results.get(reg_domain, {})
        registered_details.append({
            "domain":      reg_domain,
            "registered":  True,
            "live":        live_info.get("live", None),
            "status_code": live_info.get("status_code", None),
            "final_url":   live_info.get("final_url", None),
            "risk":        "HIGH" if live_info.get("live") else "MEDIUM",
        })
    
    # Sort — live sites first (highest risk), then just registered
    registered_details.sort(
        key=lambda x: (0 if x["live"] else 1, x["domain"])
    )
    
    return JSONResponse(content={
        "original_domain":       domain,
        "name":                  name,
        "tld":                   tld,
        "total_permutations":    len(permutations),
        "registered_count":      len(registered),
        "registered":            registered_details,
        "risk_level":            "CRITICAL" if len(registered) > 10
                                 else "HIGH" if len(registered) > 5
                                 else "MEDIUM" if len(registered) > 0
                                 else "SAFE",
    })