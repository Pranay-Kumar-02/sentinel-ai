# ─────────────────────────────────────────────────────────────────────────────
# SENTINEL AI — Threat Feed Engine (Phase 5, v2)
# Pulls REAL malicious URL data from URLhaus (abuse.ch) — replaces the old
# frontend-side random data generator entirely. Every item served here is a
# genuine indicator of compromise, not simulated.
#
# v2 fixes a race condition: multiple frontend components (LiveFeed, ThreatMap,
# ThreatTicker) each poll this endpoint independently. If they all hit a cold
# cache at the same moment, they'd previously each fire a separate concurrent
# request to URLhaus — which abuse.ch can reject as a duplicate burst, causing
# 500 errors. An asyncio.Lock now ensures only ONE real upstream fetch happens
# at a time; everyone else waits and reads the freshly-populated cache.
#
# It also fixes a related bug: different components request different `limit`
# values. The cache now always fetches a fixed, larger batch internally and
# slices per-request, so no caller silently gets fewer real items just because
# it wasn't first to populate the cache.
#
# Setup required:
#   1. Get a free Auth-Key at https://auth.abuse.ch/
#   2. Add to backend/.env:  URLHAUS_AUTH_KEY=your_key_here
#
# Honesty note on enrichment fields:
#   URLhaus does NOT tag individual URLs with a specific MITRE technique or
#   target sector. The `mitre` field below is a best-effort category mapping
#   based on the reported threat type/tags — a general classification, not a
#   verified per-indicator attribution. `sector` is left "Unclassified" rather
#   than guessed, to avoid presenting fabricated data as fact.
# ─────────────────────────────────────────────────────────────────────────────

import os
import re
import time
import asyncio
from typing import Optional
from datetime import datetime, timezone

import httpx
from dotenv import load_dotenv

from engines.osint import extract_ip

load_dotenv()

URLHAUS_AUTH_KEY   = os.getenv("URLHAUS_AUTH_KEY")
URLHAUS_RECENT_URL = "https://urlhaus-api.abuse.ch/v1/urls/recent/"

# abuse.ch fair-use policy: do not poll more often than every 5 minutes
CACHE_TTL_SECONDS = 5 * 60

# Always fetch this many from URLhaus internally, regardless of what any one
# caller asks for — every component then slices from the same full cache.
FETCH_LIMIT = 60

_cache = {
    "items": [],
    "fetched_at": 0.0,
}

# Ensures only one real upstream request runs at a time, even if several
# frontend components poll concurrently against a cold cache.
_fetch_lock = asyncio.Lock()

IP_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")

# ip-api.com's free tier allows 45 requests/minute. Bound concurrent geo
# lookups so a full refresh (up to FETCH_LIMIT records) doesn't burst past
# that in a single instant and get some of them rate-limited.
_geo_semaphore = asyncio.Semaphore(35)

# ── Heuristic category → likely MITRE technique (see honesty note above) ──────
THREAT_TYPE_TO_MITRE = {
    "malware_download": "T1105",  # Ingress Tool Transfer
    "botnet_cc":         "T1071", # Application Layer Protocol (C2)
    "phishing":           "T1566", # Phishing
}
TAG_TO_MITRE = {
    "ransomware": "T1486",
    "phishing":   "T1566",
    "emotet":     "T1204",
    "heodo":      "T1204",
    "loader":     "T1105",
    "rat":        "T1219",
}


def _classify_severity(record: dict) -> str:
    """Derive severity from real URLhaus status + blacklist presence."""
    status = record.get("url_status", "")
    blacklists = record.get("blacklists", {}) or {}
    is_listed = any(v not in (None, "not listed") for v in blacklists.values())

    if status == "online" and is_listed:
        return "CRITICAL"
    if status == "online":
        return "HIGH"
    if is_listed:
        return "MEDIUM"
    return "LOW"


def _classify_type(record: dict) -> str:
    tags = record.get("tags") or []
    threat = record.get("threat", "malware_download")
    if tags:
        return tags[0].replace("_", " ").title()
    return threat.replace("_", " ").title()


def _likely_mitre(record: dict) -> Optional[str]:
    tags = [t.lower() for t in (record.get("tags") or [])]
    for tag in tags:
        if tag in TAG_TO_MITRE:
            return TAG_TO_MITRE[tag]
    return THREAT_TYPE_TO_MITRE.get(record.get("threat", ""), None)


def _confidence(record: dict) -> int:
    """Confidence based on real signal strength — active status + blacklist hits."""
    status = record.get("url_status", "")
    blacklists = record.get("blacklists", {}) or {}
    is_listed = any(v not in (None, "not listed") for v in blacklists.values())
    score = 70
    if status == "online":
        score += 15
    if is_listed:
        score += 10
    return min(score, 99)


async def _geo_lookup(host: str) -> dict:
    """Resolve host to IP + country code + lat/lon (for map/globe plotting)."""
    ip = host if IP_RE.match(host) else extract_ip(host)
    if not ip:
        return {"ip": None, "country_code": None, "country": "Unknown", "lat": None, "lon": None}
    async with _geo_semaphore:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                res = await client.get(
                    f"http://ip-api.com/json/{ip}?fields=status,countryCode,country,lat,lon"
                )
                if res.status_code == 200:
                    data = res.json()
                    if data.get("status") == "success":
                        return {
                            "ip": ip,
                            "country_code": data.get("countryCode"),
                            "country": data.get("country", "Unknown"),
                            "lat": data.get("lat"),
                            "lon": data.get("lon"),
                        }
        except Exception:
            pass
    return {"ip": ip, "country_code": None, "country": "Unknown", "lat": None, "lon": None}


async def _transform(record: dict) -> dict:
    """Convert a raw URLhaus record into Sentinel's ThreatItem shape."""
    host = record.get("host", "")
    geo = await _geo_lookup(host)
    severity = _classify_severity(record)
    type_label = _classify_type(record)

    return {
        "id": record.get("id") or f"urlhaus-{host}-{record.get('date_added','')}",
        "timestamp": record.get("date_added", datetime.now(timezone.utc).isoformat()),
        "severity": severity,
        "type": type_label,
        "domain": host if not IP_RE.match(host) else None,
        "ip": geo["ip"],
        "country": geo["country_code"] or "Unknown",
        "lat": geo["lat"],
        "lon": geo["lon"],
        "mitre": _likely_mitre(record),
        "sector": "Unclassified",
        "confidence": _confidence(record),
        "ioc": host,
        "iocType": "ip" if IP_RE.match(host) else "domain",
        "description": f"{type_label} — {host} (status: {record.get('url_status', 'unknown')})",
        "source": "URLhaus (abuse.ch)",
        "reference": record.get("urlhaus_reference"),
        "isNew": True,
    }


async def _refresh_cache() -> None:
    """Actually hit URLhaus and repopulate the cache. Caller must hold the lock."""
    if not URLHAUS_AUTH_KEY:
        raise RuntimeError(
            "URLHAUS_AUTH_KEY not configured. Get a free key at "
            "https://auth.abuse.ch/ and add it to backend/.env"
        )

    headers = {"Auth-Key": URLHAUS_AUTH_KEY}

    async with httpx.AsyncClient(timeout=20) as client:
        res = await client.get(f"{URLHAUS_RECENT_URL}limit/{FETCH_LIMIT}/", headers=headers)

    if res.status_code != 200:
        raise RuntimeError(f"URLhaus API request failed: HTTP {res.status_code}")

    data = res.json()
    if data.get("query_status") != "ok":
        raise RuntimeError(f"URLhaus query failed: {data.get('query_status')}")

    records = data.get("urls", [])[:FETCH_LIMIT]
    # Run all transforms (incl. geo lookups) concurrently instead of one at a
    # time — this was the main cause of slow loads. Bounded by a semaphore
    # (see _geo_lookup) to stay under ip-api.com's free-tier rate limit
    # (45 req/min) during the burst, rather than silently dropping
    # coordinates on threats that get rate-limited.
    items = await asyncio.gather(*(_transform(r) for r in records))
    items = list(items)
    items.sort(key=lambda x: x["timestamp"], reverse=True)

    _cache["items"] = items
    _cache["fetched_at"] = time.time()


async def fetch_recent_threats(limit: int = 30) -> list:
    """
    Fetch and transform recent REAL threats from URLhaus.
    Cached for CACHE_TTL_SECONDS to respect abuse.ch's fair-use policy.
    Safe under concurrent calls — only one real upstream request ever runs
    at a time; concurrent callers wait for it and share the result.
    """
    now = time.time()
    if _cache["items"] and (now - _cache["fetched_at"]) < CACHE_TTL_SECONDS:
        return _cache["items"][:limit]

    async with _fetch_lock:
        # Re-check after acquiring the lock — another request may have
        # already refreshed the cache while we were waiting for our turn.
        now = time.time()
        if _cache["items"] and (now - _cache["fetched_at"]) < CACHE_TTL_SECONDS:
            return _cache["items"][:limit]

        await _refresh_cache()

    return _cache["items"][:limit]